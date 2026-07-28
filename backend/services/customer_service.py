from database.connection import get_connection


def get_all_customers():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM customers ORDER BY shop_name")

    customers = cursor.fetchall()

    conn.close()

    return [dict(customer) for customer in customers]