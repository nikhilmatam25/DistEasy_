from database.connection import get_connection


def get_all_customers():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM customers ORDER BY shop_name")

    customers = cursor.fetchall()

    conn.close()

    return [dict(customer) for customer in customers]


def add_customer(shop_name: str, owner: str = "", phone: str = "", address: str = "", route: str = "", gstin: str = ""):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO customers (shop_name, owner, phone, address, route, gstin)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (shop_name, owner, phone, address, route, gstin))
        customer_id = cursor.lastrowid
        conn.commit()
        return {"message": "Customer added successfully", "customer_id": customer_id}
    finally:
        conn.close()


def update_customer(customer_id: int, shop_name: str, owner: str = "", phone: str = "", address: str = "", route: str = "", gstin: str = ""):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE customers
            SET shop_name = ?, owner = ?, phone = ?, address = ?, route = ?, gstin = ?
            WHERE id = ?
        """, (shop_name, owner, phone, address, route, gstin, customer_id))
        conn.commit()
        return {"message": "Customer updated successfully"}
    finally:
        conn.close()