from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional
from services.payment_service import (
    get_all_payments, get_payment_summary, get_customer_ledger,
    create_payment, update_payment, delete_payment
)

router = APIRouter(prefix="/payments", tags=["Payments"])


class PaymentCreate(BaseModel):
    customer_id: int
    amount: float
    payment_method: str = "Cash"
    payment_date: str
    notes: str = ""
    order_id: Optional[int] = None


class PaymentUpdate(BaseModel):
    amount: float
    payment_method: str
    payment_date: str
    notes: str = ""


@router.get("")
def list_payments(
    search: str = Query(""),
    customer_id: Optional[int] = Query(None)
):
    return {"payments": get_all_payments(search, customer_id)}


@router.get("/summary")
def payment_summary():
    return get_payment_summary()


@router.get("/ledger/{customer_id}")
def customer_ledger(customer_id: int):
    return get_customer_ledger(customer_id)


@router.post("", status_code=200)
def add_payment(p: PaymentCreate):
    return create_payment(
        p.customer_id, p.amount, p.payment_method,
        p.payment_date, p.notes, p.order_id
    )


@router.put("/{payment_id}")
def edit_payment(payment_id: int, p: PaymentUpdate):
    return update_payment(
        payment_id, p.amount, p.payment_method,
        p.payment_date, p.notes
    )


@router.delete("/{payment_id}")
def remove_payment(payment_id: int):
    return delete_payment(payment_id)
