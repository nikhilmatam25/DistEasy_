import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.order_router import router as order_router
from routers.customer_router import router as customer_router
from routers.product_router import router as product_router
from routers.dashboard_router import router as dashboard_router
from routers.payment_router import router as payment_router
from routers.report_router import router as report_router
from routers.analytics_router import router as analytics_router
from routers.stock_predictor_router import router as stock_predictor_router
from routers.delivery_router import router as delivery_router
from routers.settings_router import router as settings_router

app = FastAPI(title="DistEasy API", version="1.0.0")

# Build CORS origins: always allow local dev + all known production URLs
_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    # Vercel production deployment URLs
    "https://frontend-livid-theta-47.vercel.app",
    "https://frontend-qbdfjojth-dist-easy.vercel.app",
    "https://frontend-dist-easy.vercel.app",
]
# Also support dynamic URL via env var (set in Render dashboard → FRONTEND_URL)
_frontend_url = os.getenv("FRONTEND_URL", "").strip()
if _frontend_url:
    _origins.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Welcome to DistEasy Backend v1.0"}


@app.get("/health")
def health():
    return {"status": "Running"}


# Existing routers
app.include_router(product_router)
app.include_router(dashboard_router)
app.include_router(customer_router)
app.include_router(order_router)

# New routers
app.include_router(payment_router)
app.include_router(report_router)
app.include_router(analytics_router)
app.include_router(stock_predictor_router)
app.include_router(delivery_router)
app.include_router(settings_router)