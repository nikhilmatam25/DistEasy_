from database.connection import get_connection
from fastapi import HTTPException


def get_all_payments(search: str = "", customer_id: int = None):
    conn = get_connection()
    cursor = conn.cursor()
    query = """
        SELECT p.*, c.shop_name, c.owner
        FROM payments p
        JOIN customers c ON p.customer_id = c.id
        WHERE 1=1
    """
    params = []
    if search:
        query += " AND (c.shop_name LIKE ? OR c.owner LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
    if customer_id:
        query += " AND p.customer_id = ?"
        params.append(customer_id)
    query += " ORDER BY p.payment_date DESC, p.id DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_payment_summary():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COALESCE(SUM(amount),0) FROM payments")
    total_collected = cursor.fetchone()[0]
    cursor.execute("SELECT COALESCE(SUM(balance),0) FROM customers WHERE balance > 0")
    total_outstanding = cursor.fetchone()[0]
    cursor.execute("SELECT COALESCE(SUM(amount),0) FROM payments WHERE payment_method='Cash'")
    cash_total = cursor.fetchone()[0]
    cursor.execute("SELECT COALESCE(SUM(amount),0) FROM payments WHERE payment_method='UPI'")
    upi_total = cursor.fetchone()[0]
    cursor.execute("SELECT COALESCE(SUM(amount),0) FROM payments WHERE payment_method='Credit'")
    credit_total = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM payments")
    total_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM customers WHERE balance > 0")
    customers_with_dues = cursor.fetchone()[0]
    conn.close()
    return {
        "total_collected": round(total_collected, 2),
        "total_outstanding": round(total_outstanding, 2),
        "cash_total": round(cash_total, 2),
        "upi_total": round(upi_total, 2),
        "credit_total": round(credit_total, 2),
        "total_count": total_count,
        "customers_with_dues": customers_with_dues,
    }


def get_customer_ledger(customer_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, shop_name, owner, phone, balance FROM customers WHERE id = ?",
        (customer_id,)
    )
    customer = cursor.fetchone()
    if not customer:
        conn.close()
        raise HTTPException(status_code=404, detail="Customer not found")
    cursor.execute("""
        SELECT 'order' as type, id, order_date as date, total_amount as amount,
               payment_type as method, '' as notes
        FROM orders WHERE customer_id = ?
        UNION ALL
        SELECT 'payment' as type, id, payment_date as date, amount,
               payment_method as method, notes
        FROM payments WHERE customer_id = ?
        ORDER BY date DESC
    """, (customer_id, customer_id))
    ledger = cursor.fetchall()
    conn.close()
    return {
        "customer": dict(customer),
        "ledger": [dict(r) for r in ledger]
    }


def create_payment(customer_id: int, amount: float, payment_method: str,
                   payment_date: str, notes: str = "", order_id: int = None):
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    valid_methods = ["Cash", "UPI", "Credit"]
    if payment_method not in valid_methods:
        raise HTTPException(
            status_code=400,
            detail=f"Payment method must be one of: {valid_methods}"
        )
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, balance FROM customers WHERE id = ?", (customer_id,))
        customer = cursor.fetchone()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        cursor.execute("""
            INSERT INTO payments (customer_id, amount, payment_method, payment_date, notes, order_id)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (customer_id, amount, payment_method, payment_date, notes, order_id))
        payment_id = cursor.lastrowid
        new_balance = max(0.0, (customer["balance"] or 0.0) - amount)
        cursor.execute(
            "UPDATE customers SET balance = ? WHERE id = ?",
            (new_balance, customer_id)
        )
        conn.commit()
        return {
            "message": "Payment recorded",
            "payment_id": payment_id,
            "new_balance": round(new_balance, 2)
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


def update_payment(payment_id: int, amount: float, payment_method: str,
                   payment_date: str, notes: str = ""):
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM payments WHERE id = ?", (payment_id,))
        old = cursor.fetchone()
        if not old:
            raise HTTPException(status_code=404, detail="Payment not found")
        old_amount = old["amount"]
        customer_id = old["customer_id"]
        diff = old_amount - amount  # positive means old was larger → balance should increase
        cursor.execute("""
            UPDATE payments SET amount=?, payment_method=?, payment_date=?, notes=?
            WHERE id=?
        """, (amount, payment_method, payment_date, notes, payment_id))
        cursor.execute(
            "UPDATE customers SET balance = MAX(0, balance + ?) WHERE id = ?",
            (diff, customer_id)
        )
        conn.commit()
        return {"message": "Payment updated"}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


def delete_payment(payment_id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM payments WHERE id = ?", (payment_id,))
        payment = cursor.fetchone()
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        cursor.execute(
            "UPDATE customers SET balance = balance + ? WHERE id = ?",
            (payment["amount"], payment["customer_id"])
        )
        cursor.execute("DELETE FROM payments WHERE id = ?", (payment_id,))
        conn.commit()
        return {"message": "Payment deleted"}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
