import json
from fastapi import HTTPException
from database.connection import get_connection


# ─── Helpers ─────────────────────────────────────────────────────────

def _amount_in_words(amount: float) -> str:
    """Convert a rupee amount (float) to English words."""
    ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
            "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen",
            "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
    tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty",
            "Sixty", "Seventy", "Eighty", "Ninety"]

    def say(n: int) -> str:
        if n == 0:
            return ""
        elif n < 20:
            return ones[n]
        elif n < 100:
            return tens[n // 10] + (" " + ones[n % 10] if n % 10 else "")
        elif n < 1000:
            return ones[n // 100] + " Hundred" + (" " + say(n % 100) if n % 100 else "")
        elif n < 100_000:
            return say(n // 1000) + " Thousand" + (" " + say(n % 1000) if n % 1000 else "")
        elif n < 10_000_000:
            return say(n // 100_000) + " Lakh" + (" " + say(n % 100_000) if n % 100_000 else "")
        else:
            return say(n // 10_000_000) + " Crore" + (" " + say(n % 10_000_000) if n % 10_000_000 else "")

    amount = round(amount, 2)
    rupees = int(amount)
    paise = round((amount - rupees) * 100)

    words = say(rupees) if rupees else "Zero"
    result = f"Rupees {words}"
    if paise:
        result += f" and {say(paise)} Paise"
    return result + " Only"


def _next_invoice_number(cursor) -> str:
    """Generate the next sequential invoice number, e.g. INV-2024-0001."""
    from datetime import datetime
    year = datetime.now().year
    cursor.execute(
        "SELECT COUNT(*) FROM invoices WHERE invoice_number LIKE ?",
        (f"INV-{year}-%",)
    )
    count = cursor.fetchone()[0]
    return f"INV-{year}-{count + 1:04d}"


def _row_to_dict(row) -> dict:
    return dict(zip(row.keys(), tuple(row)))


# ─── Service functions ────────────────────────────────────────────────

def get_billing_summary():
    conn = get_connection()
    try:
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM invoices WHERE status != 'Cancelled'")
        total_invoices = c.fetchone()[0]

        c.execute("SELECT COALESCE(SUM(total_amount),0) FROM invoices WHERE status != 'Cancelled'")
        total_sales = round(c.fetchone()[0], 2)

        c.execute("SELECT COALESCE(SUM(total_amount),0) FROM invoices WHERE payment_status='Paid' AND status!='Cancelled'")
        paid = round(c.fetchone()[0], 2)

        c.execute("SELECT COALESCE(SUM(total_amount),0) FROM invoices WHERE payment_status='Unpaid' AND status!='Cancelled'")
        pending = round(c.fetchone()[0], 2)

        c.execute("SELECT COUNT(*) FROM invoices WHERE payment_status='Partial' AND status!='Cancelled'")
        partial_count = c.fetchone()[0]

        return {
            "total_invoices": total_invoices,
            "total_sales": total_sales,
            "paid_amount": paid,
            "pending_amount": pending,
            "partial_count": partial_count,
        }
    finally:
        conn.close()


def get_all_invoices(search="", date_from=None, date_to=None, status=None):
    conn = get_connection()
    try:
        c = conn.cursor()
        query = """
            SELECT i.*, c.shop_name
            FROM invoices i
            LEFT JOIN customers c ON i.customer_id = c.id
            WHERE i.status != 'Cancelled'
        """
        params = []
        if search:
            query += " AND (i.invoice_number LIKE ? OR c.shop_name LIKE ?)"
            params += [f"%{search}%", f"%{search}%"]
        if date_from:
            query += " AND i.invoice_date >= ?"
            params.append(date_from)
        if date_to:
            query += " AND i.invoice_date <= ?"
            params.append(date_to)
        if status:
            query += " AND i.payment_status = ?"
            params.append(status)
        query += " ORDER BY i.id DESC"
        c.execute(query, params)
        rows = c.fetchall()
        return [_row_to_dict(r) for r in rows]
    finally:
        conn.close()


def get_invoice_by_id(invoice_id: int):
    conn = get_connection()
    try:
        c = conn.cursor()
        c.execute("SELECT * FROM invoices WHERE id = ?", (invoice_id,))
        row = c.fetchone()
        if row is None:
            return None
        inv = _row_to_dict(row)
        # Parse customer snapshot
        try:
            inv["customer_snapshot"] = json.loads(inv.get("customer_snapshot") or "{}")
        except Exception:
            inv["customer_snapshot"] = {}
        # Fetch items
        c.execute("SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id", (invoice_id,))
        inv["items"] = [_row_to_dict(r) for r in c.fetchall()]
        return inv
    finally:
        conn.close()


def create_invoice(customer_id, invoice_date, items, discount_pct=0.0,
                   notes="", order_id=None, is_interstate=False,
                   payment_status="Unpaid"):
    if not items:
        raise HTTPException(400, "Invoice must have at least one item")

    conn = get_connection()
    try:
        c = conn.cursor()

        # Validate customer
        c.execute("SELECT * FROM customers WHERE id = ?", (customer_id,))
        cust = c.fetchone()
        if not cust:
            raise HTTPException(404, f"Customer {customer_id} not found")
        cust = _row_to_dict(cust)

        customer_snapshot = json.dumps({
            "shop_name": cust.get("shop_name", ""),
            "owner": cust.get("owner", ""),
            "phone": cust.get("phone", ""),
            "address": cust.get("address", ""),
            "gstin": cust.get("gstin", ""),
        })

        # Check order already invoiced (if order_id provided)
        if order_id:
            c.execute("SELECT id FROM invoices WHERE order_id=? AND status!='Cancelled'", (order_id,))
            if c.fetchone():
                raise HTTPException(400, f"Order #{order_id} has already been invoiced")

        invoice_number = _next_invoice_number(c)

        # ── Calculate totals ──────────────────────────────────────────
        item_rows = []
        subtotal_before_tax = 0.0

        for item in items:
            qty = float(item["quantity"])
            sp = float(item["selling_price"])
            taxable = round(sp * qty, 2)

            if is_interstate:
                cgst_pct = 0.0
                sgst_pct = 0.0
                igst_pct = float(item.get("igst_pct") or item.get("cgst_pct", 0) + item.get("sgst_pct", 0))
            else:
                cgst_pct = float(item.get("cgst_pct", 0))
                sgst_pct = float(item.get("sgst_pct", 0))
                igst_pct = 0.0

            cgst_amt = round(taxable * cgst_pct / 100, 2)
            sgst_amt = round(taxable * sgst_pct / 100, 2)
            igst_amt = round(taxable * igst_pct / 100, 2)
            item_total = round(taxable + cgst_amt + sgst_amt + igst_amt, 2)

            item_rows.append({
                "product_id": item.get("product_id"),
                "description": item["description"],
                "hsn_code": item.get("hsn_code", ""),
                "mrp": float(item.get("mrp", 0)),
                "selling_price": sp,
                "quantity": qty,
                "unit": item.get("unit", "Pcs"),
                "cgst_pct": cgst_pct,
                "sgst_pct": sgst_pct,
                "igst_pct": igst_pct,
                "taxable_amount": taxable,
                "cgst_amount": cgst_amt,
                "sgst_amount": sgst_amt,
                "igst_amount": igst_amt,
                "total_amount": item_total,
            })
            subtotal_before_tax += taxable

        total_cgst = round(sum(r["cgst_amount"] for r in item_rows), 2)
        total_sgst = round(sum(r["sgst_amount"] for r in item_rows), 2)
        total_igst = round(sum(r["igst_amount"] for r in item_rows), 2)
        tax_total = total_cgst + total_sgst + total_igst

        discount_amt = round(subtotal_before_tax * discount_pct / 100, 2)
        taxable_after_discount = round(subtotal_before_tax - discount_amt, 2)
        total_amount = round(taxable_after_discount + tax_total, 2)
        amount_words = _amount_in_words(total_amount)

        # ── Insert invoice ────────────────────────────────────────────
        c.execute("""
            INSERT INTO invoices (
                invoice_number, invoice_date, customer_id, customer_snapshot,
                subtotal, discount_pct, discount_amount, taxable_amount,
                cgst_amount, sgst_amount, igst_amount,
                total_amount, amount_in_words,
                payment_status, notes, order_id, status, is_interstate
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'Active',?)
        """, (
            invoice_number, invoice_date, customer_id, customer_snapshot,
            round(subtotal_before_tax, 2), discount_pct, discount_amt,
            taxable_after_discount,
            total_cgst, total_sgst, total_igst,
            total_amount, amount_words,
            payment_status, notes, order_id,
            1 if is_interstate else 0,
        ))
        invoice_id = c.lastrowid

        # ── Insert items ──────────────────────────────────────────────
        for row in item_rows:
            c.execute("""
                INSERT INTO invoice_items (
                    invoice_id, product_id, description, hsn_code,
                    mrp, selling_price, quantity, unit,
                    cgst_pct, sgst_pct, igst_pct,
                    taxable_amount, cgst_amount, sgst_amount, igst_amount,
                    total_amount
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                invoice_id,
                row["product_id"],
                row["description"],
                row["hsn_code"],
                row["mrp"],
                row["selling_price"],
                row["quantity"],
                row["unit"],
                row["cgst_pct"],
                row["sgst_pct"],
                row["igst_pct"],
                row["taxable_amount"],
                row["cgst_amount"],
                row["sgst_amount"],
                row["igst_amount"],
                row["total_amount"],
            ))

        # ── Deduct stock (only if NOT linked to an order that already deducted) ──
        if not order_id:
            for row in item_rows:
                pid = row.get("product_id")
                if pid:
                    c.execute("SELECT stock FROM products WHERE id=?", (pid,))
                    pr = c.fetchone()
                    if pr and pr["stock"] < row["quantity"]:
                        raise HTTPException(
                            400,
                            f"Insufficient stock for product '{row['description']}'. "
                            f"Available: {pr['stock']}, Requested: {row['quantity']}"
                        )
                    if pr:
                        c.execute(
                            "UPDATE products SET stock = stock - ? WHERE id = ?",
                            (row["quantity"], pid)
                        )

        conn.commit()
        return {
            "message": "Invoice created successfully",
            "invoice_id": invoice_id,
            "invoice_number": invoice_number,
            "total_amount": total_amount,
        }

    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(500, f"Error creating invoice: {e}")
    finally:
        conn.close()


def update_invoice_status(invoice_id: int, payment_status: str):
    allowed = {"Paid", "Unpaid", "Partial"}
    if payment_status not in allowed:
        raise HTTPException(400, f"payment_status must be one of {allowed}")
    conn = get_connection()
    try:
        c = conn.cursor()
        c.execute("UPDATE invoices SET payment_status=? WHERE id=?", (payment_status, invoice_id))
        if c.rowcount == 0:
            raise HTTPException(404, "Invoice not found")
        conn.commit()
        return {"message": f"Status updated to {payment_status}"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(500, str(e))
    finally:
        conn.close()


def delete_invoice(invoice_id: int):
    """Soft-delete: mark as Cancelled, do NOT restore stock (preserve records)."""
    conn = get_connection()
    try:
        c = conn.cursor()
        c.execute("UPDATE invoices SET status='Cancelled' WHERE id=?", (invoice_id,))
        if c.rowcount == 0:
            raise HTTPException(404, "Invoice not found")
        conn.commit()
        return {"message": "Invoice cancelled"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(500, str(e))
    finally:
        conn.close()
