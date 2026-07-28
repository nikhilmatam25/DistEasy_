from database.connection import get_connection


def get_all_products():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT *
    FROM products
    ORDER BY name
    """)
    products = cursor.fetchall()

    conn.close()

    return [dict(product) for product in products]


def update_product_stock(product_id, stock):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE products
        SET stock = ?
        WHERE id = ?
        """,
        (stock, product_id),
    )

    conn.commit()
    conn.close()


def add_product(name, price, stock):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO products (name, price, stock)
        VALUES (?, ?, ?)
        """,
        (name, price, stock),
    )

    conn.commit()
    conn.close()