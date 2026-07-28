from database.connection import get_connection
from fastapi import HTTPException


def get_all_deliveries(status: str = None, search: str = ""):
    conn = get_connection()
    cursor = conn.cursor()
    query = """
        SELECT d.*, c.shop_name, c.address, c.route as customer_route,
               o.total_amount, o.order_date
        FROM delivery d
        JOIN customers c ON d.customer_id = c.id
        JOIN orders o ON d.order_id = o.id
        WHERE 1=1
    """
    params = []
    if status and status != "All":
        query += " AND d.status = ?"
        params.append(status)
    if search:
        query += " AND (c.shop_name LIKE ? OR d.driver_name LIKE ? OR d.route LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
    query += " ORDER BY d.created_at DESC"
    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


def update_delivery(delivery_id: int, status: str, driver_name: str = "",
                    route: str = "", delivery_date: str = None,
                    actual_delivery_date: str = None, notes: str = ""):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM delivery WHERE id = ?", (delivery_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Delivery not found")
        cursor.execute("""
            UPDATE delivery
            SET status=?, driver_name=?, route=?, delivery_date=?,
                actual_delivery_date=?, notes=?
            WHERE id=?
        """, (status, driver_name, route, delivery_date, actual_delivery_date, notes, delivery_id))
        conn.commit()
        return {"message": "Delivery updated"}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


def get_delivery_stats():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT status, COUNT(*) as count FROM delivery GROUP BY status")
    stats = {r["status"]: r["count"] for r in cursor.fetchall()}
    conn.close()
    return {
        "pending": stats.get("Pending", 0),
        "delivered": stats.get("Delivered", 0),
        "in_transit": stats.get("In Transit", 0),
        "total": sum(stats.values())
    }
