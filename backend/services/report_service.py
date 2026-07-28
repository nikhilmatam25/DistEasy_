from database.connection import get_connection


def get_sales_report(period: str = "monthly", date_from: str = None, date_to: str = None, customer_id: int = None):
    conn = get_connection()
    cursor = conn.cursor()
    base = "FROM orders o JOIN customers c ON o.customer_id = c.id WHERE 1=1"
    params = []
    if date_from:
        base += " AND DATE(o.order_date) >= ?"
        params.append(date_from)
    if date_to:
        base += " AND DATE(o.order_date) <= ?"
        params.append(date_to)
    if customer_id:
        base += " AND o.customer_id = ?"
        params.append(customer_id)
    
    if period == "daily":
        group = "DATE(o.order_date)"
        label = "DATE(o.order_date) as period"
    elif period == "weekly":
        group = "strftime('%Y-W%W', o.order_date)"
        label = "strftime('%Y-W%W', o.order_date) as period"
    elif period == "yearly":
        group = "strftime('%Y', o.order_date)"
        label = "strftime('%Y', o.order_date) as period"
    else:
        group = "strftime('%Y-%m', o.order_date)"
        label = "strftime('%Y-%m', o.order_date) as period"
    
    cursor.execute(f"""
        SELECT {label},
               COUNT(o.id) as order_count,
               COALESCE(SUM(o.total_amount), 0) as total_sales
        {base}
        GROUP BY {group}
        ORDER BY period DESC
        LIMIT 24
    """, params)
    sales = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute(f"SELECT COUNT(*) as total_orders, COALESCE(SUM(total_amount),0) as total_revenue {base}", params)
    summary = dict(cursor.fetchone())
    conn.close()
    return {"sales": sales, "summary": summary}


def get_product_report(product_id: int = None):
    conn = get_connection()
    cursor = conn.cursor()
    q = """
        SELECT p.id, p.name, p.price, p.stock,
               COALESCE(SUM(oi.quantity), 0) as total_sold,
               COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue,
               COUNT(DISTINCT oi.order_id) as order_count
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
    """
    params = []
    if product_id:
        q += " WHERE p.id = ?"
        params.append(product_id)
    q += " GROUP BY p.id ORDER BY total_sold DESC"
    cursor.execute(q, params)
    products = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"products": products}


def get_customer_report(customer_id: int = None):
    conn = get_connection()
    cursor = conn.cursor()
    q = """
        SELECT c.id, c.shop_name, c.owner, c.phone, c.route,
               (
                   SELECT COUNT(o.id)
                   FROM orders o
                   WHERE o.customer_id = c.id
               ) AS total_orders,
               (
                   SELECT COALESCE(SUM(o.total_amount), 0)
                   FROM orders o
                   WHERE o.customer_id = c.id
               ) AS total_purchases,
               (
                   SELECT COALESCE(MAX(o.order_date), '')
                   FROM orders o
                   WHERE o.customer_id = c.id
               ) AS last_order_date,
               (
                   SELECT COALESCE(SUM(p.amount), 0)
                   FROM payments p
                   WHERE p.customer_id = c.id
               ) AS total_paid
        FROM customers c
    """
    params = []
    if customer_id:
        q += " WHERE c.id = ?"
        params.append(customer_id)
    q += " ORDER BY total_purchases DESC"
    cursor.execute(q, params)
    rows = cursor.fetchall()
    conn.close()

    customers = []
    for r in rows:
        d = dict(r)
        total_purchases = d["total_purchases"] or 0.0
        total_paid = d["total_paid"] or 0.0
        # Raw signed balance — NOT clamped, so advance payments are visible
        balance = round(total_purchases - total_paid, 2)
        d["outstanding"] = balance          # signed: positive = due, negative = advance
        d["total_purchases"] = round(total_purchases, 2)
        d["total_paid"] = round(total_paid, 2)
        # Convenience label for the frontend
        if balance > 0:
            d["balance_status"] = "Due"
        elif balance < 0:
            d["balance_status"] = "Advance"
        else:
            d["balance_status"] = "Settled"
        customers.append(d)

    return {"customers": customers}


def get_outstanding_report():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.id, c.shop_name, c.owner, c.phone, c.route,
               c.balance as outstanding,
               COUNT(o.id) as total_orders,
               COALESCE(MAX(o.order_date), '') as last_order_date
        FROM customers c
        LEFT JOIN orders o ON c.id = o.customer_id
        WHERE c.balance > 0
        GROUP BY c.id
        ORDER BY c.balance DESC
    """)
    customers = [dict(r) for r in cursor.fetchall()]
    cursor.execute("SELECT COALESCE(SUM(balance),0) FROM customers WHERE balance > 0")
    total_outstanding = cursor.fetchone()[0]
    conn.close()
    return {"customers": customers, "total_outstanding": round(total_outstanding, 2)}


def get_inventory_report():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT p.id, p.name, p.price, p.stock,
               p.price * p.stock as stock_value,
               COALESCE(SUM(oi.quantity), 0) as total_sold
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        GROUP BY p.id
        ORDER BY p.name
    """)
    products = [dict(r) for r in cursor.fetchall()]
    cursor.execute("SELECT COALESCE(SUM(price*stock),0) FROM products")
    total_value = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM products WHERE stock < 20")
    low_stock = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM products WHERE stock = 0")
    out_of_stock = cursor.fetchone()[0]
    conn.close()
    return {
        "products": products,
        "total_value": round(total_value, 2),
        "low_stock_count": low_stock,
        "out_of_stock_count": out_of_stock
    }
