from database.connection import get_connection


def get_dashboard_data():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM products")
    total_products = cursor.fetchone()[0]

    cursor.execute("SELECT SUM(stock) FROM products")
    total_stock = cursor.fetchone()[0] or 0

    cursor.execute("SELECT SUM(price * stock) FROM products")
    stock_value = cursor.fetchone()[0] or 0

    cursor.execute("SELECT COUNT(*) FROM products WHERE stock < 20")
    low_stock = cursor.fetchone()[0]

    conn.close()

    return {
        "total_products": total_products,
        "total_stock": total_stock,
        "stock_value": stock_value,
        "low_stock": low_stock,
    }