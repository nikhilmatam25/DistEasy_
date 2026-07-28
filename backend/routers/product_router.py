from fastapi import APIRouter
from services.product_service import (
    get_all_products,
    update_product_stock,
    add_product,
)

router = APIRouter()


@router.get("/products")
def products():
    return {
        "products": get_all_products()
    }


@router.put("/products/{product_id}/stock")
def update_stock(product_id: int, stock: int):
    update_product_stock(product_id, stock)

    return {
        "message": "Stock updated successfully"
    }


@router.post("/products")
def create_product(name: str, price: float, stock: int):
    add_product(name, price, stock)

    return {
        "message": "Product added successfully"
    }