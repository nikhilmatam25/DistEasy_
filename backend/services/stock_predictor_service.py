from database.connection import get_connection
from datetime import datetime, timedelta
import math


def get_stock_predictions():
    conn = get_connection()
    cursor = conn.cursor()

    # Get all products
    cursor.execute("SELECT id, name, price, stock FROM products ORDER BY name")
    products = [dict(r) for r in cursor.fetchall()]

    # Get order history per product per month (last 6 months)
    six_months_ago = (datetime.now() - timedelta(days=180)).strftime('%Y-%m-%d')
    cursor.execute("""
        SELECT oi.product_id,
               strftime('%Y-%m', o.order_date) as month,
               SUM(oi.quantity) as qty
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE DATE(o.order_date) >= ?
        GROUP BY oi.product_id, month
        ORDER BY month
    """, (six_months_ago,))
    history_rows = cursor.fetchall()
    conn.close()

    # Build a map: product_id -> list of monthly quantities
    history_map = {}
    for row in history_rows:
        pid = row["product_id"]
        if pid not in history_map:
            history_map[pid] = []
        history_map[pid].append(row["qty"])

    predictions = []
    for product in products:
        pid = product["id"]
        monthly_sales = history_map.get(pid, [])
        months_with_data = len(monthly_sales)

        if months_with_data == 0:
            avg_monthly = 0
            predicted_demand = 0
            confidence = "Low"
        elif months_with_data == 1:
            avg_monthly = monthly_sales[0]
            predicted_demand = int(avg_monthly * 1.1)
            confidence = "Low"
        elif months_with_data <= 3:
            avg_monthly = sum(monthly_sales) / len(monthly_sales)
            # Simple trend: compare last vs first half
            predicted_demand = int(avg_monthly * 1.05)
            confidence = "Medium"
        else:
            avg_monthly = sum(monthly_sales) / len(monthly_sales)
            # Weighted average: recent months count more
            weights = list(range(1, len(monthly_sales) + 1))
            weighted_sum = sum(w * s for w, s in zip(weights, monthly_sales))
            weight_total = sum(weights)
            weighted_avg = weighted_sum / weight_total
            # Trend factor
            recent_avg = sum(monthly_sales[-2:]) / 2
            growth_factor = (recent_avg / avg_monthly) if avg_monthly > 0 else 1
            growth_factor = max(0.5, min(2.0, growth_factor))
            predicted_demand = int(weighted_avg * growth_factor)
            confidence = "High"

        current_stock = product["stock"]
        expected_remaining = current_stock - predicted_demand
        suggested_order = max(0, predicted_demand - current_stock + int(avg_monthly * 0.5))

        # Classify
        if avg_monthly > 50:
            movement = "Fast Moving"
        elif avg_monthly > 10:
            movement = "Normal"
        elif avg_monthly > 0:
            movement = "Slow Moving"
        else:
            movement = "No Sales"

        low_stock_warning = current_stock < predicted_demand

        if suggested_order == 0 and current_stock > predicted_demand * 2:
            recommendation = "Stock sufficient"
        elif suggested_order > 0 and current_stock == 0:
            recommendation = "URGENT: Out of stock! Order immediately"
        elif suggested_order > 0 and low_stock_warning:
            recommendation = f"Order {suggested_order} units before stock runs out"
        else:
            recommendation = "Monitor stock levels"

        predictions.append({
            "product_id": pid,
            "name": product["name"],
            "price": product["price"],
            "current_stock": current_stock,
            "avg_monthly_sales": round(avg_monthly, 1),
            "predicted_demand": predicted_demand,
            "expected_remaining": expected_remaining,
            "suggested_order_qty": suggested_order,
            "movement": movement,
            "low_stock_warning": low_stock_warning,
            "confidence": confidence,
            "recommendation": recommendation,
            "months_of_data": months_with_data,
        })

    # Sort by urgency
    predictions.sort(key=lambda x: (
        0 if x["low_stock_warning"] else 1,
        -x["avg_monthly_sales"]
    ))
    return {"predictions": predictions}
