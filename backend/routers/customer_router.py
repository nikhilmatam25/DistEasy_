from fastapi import APIRouter
from pydantic import BaseModel
from services.customer_service import get_all_customers, add_customer, update_customer

router = APIRouter()


class CustomerCreate(BaseModel):
    shop_name: str
    owner: str = ""
    phone: str = ""
    address: str = ""
    route: str = ""
    gstin: str = ""


@router.get("/customers")
def customers():
    return {
        "customers": get_all_customers()
    }


@router.post("/customers")
def create_customer(c: CustomerCreate):
    return add_customer(c.shop_name, c.owner, c.phone, c.address, c.route, c.gstin)


@router.put("/customers/{customer_id}")
def edit_customer(customer_id: int, c: CustomerCreate):
    return update_customer(customer_id, c.shop_name, c.owner, c.phone, c.address, c.route, c.gstin)