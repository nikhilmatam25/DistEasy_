from fastapi import APIRouter
from services.customer_service import get_all_customers

router = APIRouter()


@router.get("/customers")
def customers():
    return {
        "customers": get_all_customers()
    }