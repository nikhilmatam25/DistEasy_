from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from typing import List

from services.order_service import create_order, get_all_orders, get_order_by_id

router = APIRouter()


@router.get("/orders")
def list_orders():
    return {"orders": get_all_orders()}


@router.get("/orders/{order_id}")
def get_single_order(order_id: int):
    ord_data = get_order_by_id(order_id)
    if not ord_data:
        raise HTTPException(status_code=404, detail="Order not found")
    return ord_data


class OrderItem(BaseModel):
    product_id: int
    quantity: int

    @field_validator("product_id")
    @classmethod
    def product_id_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("product_id must be a positive integer")
        return v

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("quantity must be greater than 0")
        return v


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItem]

    @field_validator("customer_id")
    @classmethod
    def customer_id_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("customer_id must be a positive integer")
        return v

    @field_validator("items")
    @classmethod
    def items_must_not_be_empty(cls, v):
        if not v:
            raise ValueError("Order must contain at least one item")
        return v


@router.post("/orders", status_code=200)
def save_order(order: OrderCreate):
    return create_order(
        customer_id=order.customer_id,
        items=[item.model_dump() for item in order.items],
    )