from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional
from services.delivery_service import get_all_deliveries, update_delivery, get_delivery_stats

router = APIRouter(prefix="/delivery", tags=["Delivery"])


class DeliveryUpdate(BaseModel):
    status: str
    driver_name: str = ""
    route: str = ""
    delivery_date: Optional[str] = None
    actual_delivery_date: Optional[str] = None
    notes: str = ""


@router.get("")
def list_deliveries(
    status: Optional[str] = Query(None),
    search: str = Query("")
):
    return {"deliveries": get_all_deliveries(status, search)}


@router.get("/stats")
def delivery_stats():
    return get_delivery_stats()


@router.put("/{delivery_id}")
def edit_delivery(delivery_id: int, d: DeliveryUpdate):
    return update_delivery(
        delivery_id, d.status, d.driver_name, d.route,
        d.delivery_date, d.actual_delivery_date, d.notes
    )
