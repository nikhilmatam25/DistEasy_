import sys
sys.path.insert(0, r'D:\App\DistEasy_\backend')

from services.report_service import get_customer_report

print("=== Customer Report Outstanding Verification ===\n")
result = get_customer_report()
customers = result["customers"]
print(f"Total customers in report: {len(customers)}\n")

errors = 0
for c in customers:
    purchases = c["total_purchases"]
    paid = c["total_paid"]
    outstanding = c["outstanding"]
    expected = round(max(0.0, purchases - paid), 2)
    status = "OK" if outstanding == expected else "BUG"
    if status == "BUG":
        errors += 1
    if purchases > 0 or paid > 0 or outstanding > 0:
        print(f"[{status}] {c['shop_name']}")
        print(f"       purchases={purchases}  paid={paid}  outstanding={outstanding}  expected={expected}")

print()
if errors == 0:
    print("All outstanding values are correct (= total_purchases - total_paid)")
else:
    print(f"FOUND {errors} incorrect outstanding value(s)!")
