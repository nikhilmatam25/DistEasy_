from fastapi import APIRouter, Query
from typing import Optional
from services.report_service import (
    get_sales_report, get_product_report, get_customer_report,
    get_outstanding_report, get_inventory_report
)

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/sales")
def sales_report(
    period: str = Query("monthly"),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    customer_id: Optional[int] = Query(None)
):
    return get_sales_report(period, date_from, date_to, customer_id)


@router.get("/products")
def product_report(product_id: Optional[int] = Query(None)):
    return get_product_report(product_id)


@router.get("/customers")
def customer_report(customer_id: Optional[int] = Query(None)):
    return get_customer_report(customer_id)


@router.get("/outstanding")
def outstanding_report():
    return get_outstanding_report()


@router.get("/inventory")
def inventory_report():
    return get_inventory_report()
