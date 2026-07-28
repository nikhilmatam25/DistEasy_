import sqlite3
import csv

conn = sqlite3.connect("disteasy.db")
cursor = conn.cursor()

with open("customers.csv", "r", encoding="utf-8") as file:
    reader = csv.reader(file)

    for row in reader:
        if len(row) == 0:
            continue

        shop_name = row[0].strip()

        cursor.execute(
            """
            INSERT OR IGNORE INTO customers (shop_name)
            VALUES (?)
            """,
            (shop_name,)
        )

conn.commit()
conn.close()

print("✅ All customers imported successfully!")