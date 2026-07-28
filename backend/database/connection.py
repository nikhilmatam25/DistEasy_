import sqlite3
import os

DATABASE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "disteasy.db")

def get_connection():
    print("Using database:", DATABASE)   # <-- This will print the path
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn