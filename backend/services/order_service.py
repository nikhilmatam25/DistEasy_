from fastapi import HTTPException
from database.connection import get_connection


def create_order(customer_id: int, items: list):
    """
    Creates a new order with the given customer_id and list of items.
    Each item must have: product_id (int), quantity (int > 0)

    Validates:
    - customer exists
    - each product exists
    - quantity > 0
    - sufficient stock

    On success:
    - inserts one row into orders
    - inserts rows into order_items
    - updates orders.total_amount
    - reduces product stock
    - commits transaction
    """
    if not items:
        raise HTTPException(status_code=400, detail="Order must have at least one item.")

    conn = get_connection()

    try:
        cursor = conn.cursor()

        # -------------------------------------------------------
        # 1. Validate customer exists
        # -------------------------------------------------------
        cursor.execute("SELECT id FROM customers WHERE id = ?", (customer_id,))
        if cursor.fetchone() is None:
            raise HTTPException(
                status_code=404,
                detail=f"Customer with id={customer_id} does not exist."
            )

        # -------------------------------------------------------
        # 2. Create the order row (total_amount updated later)
        # -------------------------------------------------------
        cursor.execute(
            "INSERT INTO orders (customer_id, order_date) VALUES (?, datetime('now', 'localtime'))",
            (customer_id,)
        )
        order_id = cursor.lastrowid
        total_amount = 0.0

        # -------------------------------------------------------
        # 3. Process each order item
        # -------------------------------------------------------
        seen_products = set()

        for item in items:
            product_id = item.get("product_id")
            quantity = item.get("quantity")

            # Validate product_id is present and positive
            if not product_id or not isinstance(product_id, int) or product_id <= 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid product_id: {product_id!r}. Must be a positive integer."
                )

            # Validate quantity
            try:
                quantity = int(quantity)
            except (TypeError, ValueError):
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid quantity: {quantity!r}. Must be a positive integer."
                )

            if quantity <= 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"Quantity must be greater than 0 (got {quantity} for product_id={product_id})."
                )

            # Prevent duplicate products in the same order
            if product_id in seen_products:
                raise HTTPException(
                    status_code=400,
                    detail=f"Duplicate product_id={product_id} in order. Use a single row with the combined quantity."
                )
            seen_products.add(product_id)

            # Fetch product (validate it exists)
            cursor.execute(
                "SELECT id, price, stock FROM products WHERE id = ?",
                (product_id,)
            )
            product = cursor.fetchone()

            if product is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"Product with id={product_id} does not exist."
                )

            price = product["price"]
            stock = product["stock"]

            # Check sufficient stock
            if stock < quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for product_id={product_id}. "
                           f"Requested: {quantity}, Available: {stock}."
                )

            # Insert order item
            cursor.execute(
                """
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)
                """,
                (order_id, product_id, quantity, price)
            )

            # Reduce product stock
            cursor.execute(
                "UPDATE products SET stock = stock - ? WHERE id = ?",
                (quantity, product_id)
            )

            total_amount += price * quantity

        # -------------------------------------------------------
        # 4. Update total_amount on the order row
        # -------------------------------------------------------
        cursor.execute(
            "UPDATE orders SET total_amount = ? WHERE id = ?",
            (round(total_amount, 2), order_id)
        )

        # -------------------------------------------------------
        # 5. Commit transaction
        # -------------------------------------------------------
        conn.commit()

        return {
            "message": "Order saved successfully",
            "order_id": order_id,
            "total_amount": round(total_amount, 2),
            "items_count": len(items),
        }

    except HTTPException:
        conn.rollback()
        raise

    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Server error while saving order: {str(e)}"
        )

    finally:
        conn.close()


def get_all_orders():
    """Returns list of all orders with customer details and billing status."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT o.id, o.customer_id, o.order_date, o.total_amount, o.payment_type,
                   c.shop_name, c.owner,
                   inv.id as invoice_id, inv.invoice_number
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.id
            LEFT JOIN invoices inv ON o.id = inv.order_id AND inv.status != 'Cancelled'
            ORDER BY o.id DESC
        """)
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["is_invoiced"] = bool(d.get("invoice_id"))
            result.append(d)
        return result
    finally:
        conn.close()


def get_order_by_id(order_id: int):
    """Returns single order with customer info, billing status, and line items."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT o.id, o.customer_id, o.order_date, o.total_amount, o.payment_type,
                   c.shop_name, c.owner, c.phone, c.address, c.gstin,
                   inv.id as invoice_id, inv.invoice_number
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.id
            LEFT JOIN invoices inv ON o.id = inv.order_id AND inv.status != 'Cancelled'
            WHERE o.id = ?
        """, (order_id,))
        order = cursor.fetchone()
        if not order:
            return None
        res = dict(order)
        res["is_invoiced"] = bool(res.get("invoice_id"))
        cursor.execute("""
            SELECT oi.id, oi.product_id, oi.quantity, oi.price,
                   p.name as product_name, p.hsn_code, p.mrp, p.unit, p.gst_rate
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        """, (order_id,))
        res["items"] = [dict(r) for r in cursor.fetchall()]
        return res
    finally:
        conn.close()