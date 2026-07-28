from fastapi import APIRouter
from services.settings_service import get_settings, update_settings

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("")
def fetch_settings():
    return get_settings()


@router.put("")
def save_settings(settings: dict):
    return update_settings(settings)
