from database.connection import get_connection


def get_analytics_data():
    conn = get_connection()
    cursor = conn.cursor()

    # Monthly revenue for last 12 months
    cursor.execute("""
        SELECT strftime('%Y-%m', order_date) as month,
               COALESCE(SUM(total_amount), 0) as revenue,
               COUNT(*) as orders
        FROM orders
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
    """)
    monthly_revenue = [dict(r) for r in cursor.fetchall()]
    monthly_revenue.reverse()

    # Top customers (by purchase amount)
    cursor.execute("""
        SELECT c.shop_name, COALESCE(SUM(o.total_amount),0) as total
        FROM customers c
        JOIN orders o ON c.id = o.customer_id
        GROUP BY c.id
        ORDER BY total DESC
        LIMIT 10
    """)
    top_customers = [dict(r) for r in cursor.fetchall()]

    # Top products by quantity sold
    cursor.execute("""
        SELECT p.name, COALESCE(SUM(oi.quantity),0) as total_sold,
               COALESCE(SUM(oi.quantity * oi.price),0) as revenue
        FROM products p
        JOIN order_items oi ON p.id = oi.product_id
        GROUP BY p.id
        ORDER BY total_sold DESC
        LIMIT 10
    """)
    top_products = [dict(r) for r in cursor.fetchall()]

    # Slow moving products
    cursor.execute("""
        SELECT p.name, p.stock, COALESCE(SUM(oi.quantity),0) as total_sold
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        GROUP BY p.id
        ORDER BY total_sold ASC
        LIMIT 10
    """)
    slow_products = [dict(r) for r in cursor.fetchall()]

    # Summary KPIs
    cursor.execute("SELECT COALESCE(SUM(total_amount),0) FROM orders")
    total_revenue = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM orders")
    total_orders = cursor.fetchone()[0]
    cursor.execute("SELECT COALESCE(AVG(total_amount),0) FROM orders")
    avg_order_value = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(DISTINCT customer_id) FROM orders")
    active_customers = cursor.fetchone()[0]
    cursor.execute("SELECT COALESCE(SUM(price*stock),0) FROM products")
    inventory_value = cursor.fetchone()[0]

    conn.close()
    return {
        "monthly_revenue": monthly_revenue,
        "top_customers": top_customers,
        "top_products": top_products,
        "slow_products": slow_products,
        "kpis": {
            "total_revenue": round(total_revenue, 2),
            "total_orders": total_orders,
            "avg_order_value": round(avg_order_value, 2),
            "active_customers": active_customers,
            "inventory_value": round(inventory_value, 2),
        }
    }
