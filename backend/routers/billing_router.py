from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, field_validator
from typing import List, Optional
from services.billing_service import (
    get_all_invoices, get_invoice_by_id, get_billing_summary,
    create_invoice, update_invoice_status, delete_invoice,
)

router = APIRouter(prefix="/invoices", tags=["Billing"])


# ─── Request models ───────────────────────────────────────────────────

class InvoiceItemIn(BaseModel):
    product_id: Optional[int] = None
    description: str
    hsn_code: str = ""
    mrp: float = 0.0
    selling_price: float
    quantity: float
    unit: str = "Pcs"
    cgst_pct: float = 0.0
    sgst_pct: float = 0.0
    igst_pct: float = 0.0

    @field_validator("selling_price")
    @classmethod
    def price_positive(cls, v):
        if v < 0:
            raise ValueError("selling_price must be >= 0")
        return v

    @field_validator("quantity")
    @classmethod
    def qty_positive(cls, v):
        if v <= 0:
            raise ValueError("quantity must be > 0")
        return v


class InvoiceCreate(BaseModel):
    customer_id: int
    invoice_date: str          # YYYY-MM-DD
    items: List[InvoiceItemIn]
    discount_pct: float = 0.0  # applied on taxable subtotal
    notes: str = ""
    order_id: Optional[int] = None   # link to existing order (optional)
    is_interstate: bool = False       # True → IGST; False → CGST+SGST
    payment_status: str = "Unpaid"   # Paid / Unpaid / Partial

    @field_validator("items")
    @classmethod
    def items_not_empty(cls, v):
        if not v:
            raise ValueError("Invoice must have at least one item")
        return v

    @field_validator("discount_pct")
    @classmethod
    def discount_valid(cls, v):
        if not (0 <= v <= 100):
            raise ValueError("discount_pct must be between 0 and 100")
        return v


class StatusUpdate(BaseModel):
    payment_status: str  # Paid / Unpaid / Partial


# ─── Endpoints ────────────────────────────────────────────────────────

@router.get("/summary")
def billing_summary():
    return get_billing_summary()


@router.get("")
def list_invoices(
    search: str = Query(""),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    customer_id: Optional[int] = Query(None),
):
    return {"invoices": get_all_invoices(search, date_from, date_to, status, customer_id)}


@router.get("/{invoice_id}")
def get_invoice(invoice_id: int):
    inv = get_invoice_by_id(invoice_id)
    if inv is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return inv


@router.post("", status_code=200)
def create_new_invoice(inv: InvoiceCreate):
    return create_invoice(
        customer_id=inv.customer_id,
        invoice_date=inv.invoice_date,
        items=[i.model_dump() for i in inv.items],
        discount_pct=inv.discount_pct,
        notes=inv.notes,
        order_id=inv.order_id,
        is_interstate=inv.is_interstate,
        payment_status=inv.payment_status,
    )


@router.put("/{invoice_id}/status")
def update_status(invoice_id: int, body: StatusUpdate):
    return update_invoice_status(invoice_id, body.payment_status)


@router.delete("/{invoice_id}")
def remove_invoice(invoice_id: int):
    return delete_invoice(invoice_id)
