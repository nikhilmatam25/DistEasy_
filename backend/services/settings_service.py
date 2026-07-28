from database.connection import get_connection
from fastapi import HTTPException


def get_settings():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM company_settings")
    rows = cursor.fetchall()
    conn.close()
    return {r["key"]: r["value"] for r in rows}


def update_settings(settings: dict):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        for key, value in settings.items():
            cursor.execute(
                "INSERT OR REPLACE INTO company_settings (key, value) VALUES (?, ?)",
                (key, str(value))
            )
        conn.commit()
        return {"message": "Settings saved"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
