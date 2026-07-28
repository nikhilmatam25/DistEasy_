from fastapi import APIRouter
from services.stock_predictor_service import get_stock_predictions

router = APIRouter(prefix="/stock-predictor", tags=["Stock Predictor"])


@router.get("")
def stock_predictions():
    return get_stock_predictions()
