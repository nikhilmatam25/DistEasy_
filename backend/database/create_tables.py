import sqlite3
import os

DATABASE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "disteasy.db")

print("Migrating database:", DATABASE)

conn = sqlite3.connect(DATABASE)
cursor = conn.cursor()

# Enable foreign keys
cursor.execute("PRAGMA foreign_keys = ON")

# -------------------------
# Products Table (ensure price column exists)
# -------------------------
cursor.execute("""
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL
)
""")

# -------------------------
# Customers Table
# -------------------------
cursor.execute("""
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_name TEXT NOT NULL,
    owner TEXT,
    phone TEXT,
    address TEXT,
    route TEXT,
    balance REAL DEFAULT 0,
    last_order TEXT
)
""")

# -------------------------
# Orders Table
# -------------------------
cursor.execute("""
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    order_date TEXT NOT NULL,
    total_amount REAL DEFAULT 0,
    payment_type TEXT DEFAULT 'Credit',
    FOREIGN KEY(customer_id) REFERENCES customers(id)
)
""")

# -------------------------
# Order Items Table
# -------------------------
cursor.execute("""
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
)
""")

# -------------------------
# Payments Table (NEW)
# -------------------------
cursor.execute("""
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'Cash',
    payment_date TEXT NOT NULL,
    notes TEXT DEFAULT '',
    order_id INTEGER,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY(customer_id) REFERENCES customers(id),
    FOREIGN KEY(order_id) REFERENCES orders(id)
)
""")

# -------------------------
# Delivery Table (NEW)
# -------------------------
cursor.execute("""
CREATE TABLE IF NOT EXISTS delivery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    delivery_date TEXT,
    actual_delivery_date TEXT,
    driver_name TEXT DEFAULT '',
    route TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(customer_id) REFERENCES customers(id)
)
""")

# -------------------------
# Company Settings Table (NEW)
# -------------------------
cursor.execute("""
CREATE TABLE IF NOT EXISTS company_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
)
""")

# Seed default settings if not present
defaults = [
    ("company_name", "DistEasy Distributors"),
    ("phone", ""),
    ("email", ""),
    ("address", ""),
    ("gst_number", ""),
    ("theme", "light"),
]
for key, value in defaults:
    cursor.execute(
        "INSERT OR IGNORE INTO company_settings (key, value) VALUES (?, ?)",
        (key, value)
    )

# Seed delivery rows for existing orders that have no delivery record
cursor.execute("""
    INSERT OR IGNORE INTO delivery (order_id, customer_id, status, created_at)
    SELECT o.id, o.customer_id, 'Pending', o.order_date
    FROM orders o
    WHERE NOT EXISTS (SELECT 1 FROM delivery d WHERE d.order_id = o.id)
""")

conn.commit()

# Verify
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
print("\nAll tables:")
for row in cursor.fetchall():
    print(" -", row[0])

cursor.execute("SELECT COUNT(*) FROM delivery")
print("\nDelivery records seeded:", cursor.fetchone()[0])
cursor.execute("SELECT COUNT(*) FROM company_settings")
print("Company settings seeded:", cursor.fetchone()[0])

conn.close()
print("\n✅ Migration complete.")