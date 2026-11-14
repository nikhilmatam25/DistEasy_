import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Typography, Box, Grid, Paper, Stack, Button,
  TextField, Table, TableHead, TableRow, TableCell, TableBody,
  MenuItem, Select, FormControl, InputLabel, IconButton, Divider,
  Alert, Snackbar, CircularProgress, Switch,
  FormControlLabel, Chip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalculateIcon from "@mui/icons-material/Calculate";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";

const API = import.meta.env.VITE_API_URL || "/api";

const DEFAULT_ITEM = () => ({
  product_id: "",
  description: "",
  hsn_code: "1905",
  mrp: "",
  selling_price: "",
  quantity: 1,
  unit: "Pcs",
  cgst_pct: 9,
  sgst_pct: 9,
  igst_pct: 18,
});

// ─── Computed totals for one item ─────────────────────────────────────
function calcItem(item, isInterstate) {
  const qty = parseFloat(item.quantity) || 0;
  const sp = parseFloat(item.selling_price) || 0;
  const taxable = round2(sp * qty);

  const cgst_pct = isInterstate ? 0 : parseFloat(item.cgst_pct) || 0;
  const sgst_pct = isInterstate ? 0 : parseFloat(item.sgst_pct) || 0;
  const igst_pct = isInterstate ? parseFloat(item.igst_pct) || 0 : 0;

  const cgst_amt = round2(taxable * cgst_pct / 100);
  const sgst_amt = round2(taxable * sgst_pct / 100);
  const igst_amt = round2(taxable * igst_pct / 100);
  const total = round2(taxable + cgst_amt + sgst_amt + igst_amt);

  return { taxable, cgst_amt, sgst_amt, igst_amt, total };
}

function round2(n) { return Math.round(n * 100) / 100; }

// ─── Amount in words ──────────────────────────────────────────────────
function amountWords(amount) {
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
    "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
    "Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function say(n) {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? " " + ones[n%10] : "");
    if (n < 1000) return ones[Math.floor(n/100)] + " Hundred" + (n%100 ? " " + say(n%100) : "");
    if (n < 100000) return say(Math.floor(n/1000)) + " Thousand" + (n%1000 ? " " + say(n%1000) : "");
    if (n < 10000000) return say(Math.floor(n/100000)) + " Lakh" + (n%100000 ? " " + say(n%100000) : "");
    return say(Math.floor(n/10000000)) + " Crore" + (n%10000000 ? " " + say(n%10000000) : "");
  }
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let result = "Rupees " + (rupees ? say(rupees) : "Zero");
  if (paise) result += " and " + say(paise) + " Paise";
  return result + " Only";
}

// ═══════════════════════════════════════════════════════════════════════
// CREATE NEW INVOICE PAGE
// ═══════════════════════════════════════════════════════════════════════
function BillingNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramOrderId = searchParams.get("order_id");

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [unbilledOrders, setUnbilledOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(paramOrderId || "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  // Form state
  const [customerId, setCustomerId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [isInterstate, setIsInterstate] = useState(false);
  const [discountPct, setDiscountPct] = useState(0);
  const [notes, setNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [items, setItems] = useState([DEFAULT_ITEM()]);

  const showSnack = (msg, sev = "success") => setSnack({ open: true, msg, sev });

  const loadFromOrder = useCallback(async (orderId) => {
    try {
      const res = await axios.get(`${API}/orders/${orderId}`);
      const ord = res.data;
      if (ord.is_invoiced) {
        showSnack(`Order #${orderId} has already been invoiced (${ord.invoice_number})`, "warning");
        return;
      }
      setCustomerId(ord.customer_id);
      setSelectedOrderId(orderId);
      if (ord.items && ord.items.length > 0) {
        setItems(ord.items.map(it => {
          const gst = it.gst_rate || 18;
          return {
            product_id: it.product_id,
            description: it.product_name,
            hsn_code: it.hsn_code || "1905",
            mrp: it.mrp || it.price,
            selling_price: it.price,
            quantity: it.quantity,
            unit: it.unit || "Pcs",
            cgst_pct: gst / 2,
            sgst_pct: gst / 2,
            igst_pct: gst,
          };
        }));
      }
      showSnack(`Loaded Order #${orderId} details and ${ord.items?.length || 0} items`);
    } catch {
      showSnack("Failed to load order details", "error");
    }
  }, []);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/customers`),
      axios.get(`${API}/products`),
      axios.get(`${API}/orders`).catch(() => ({ data: { orders: [] } })),
    ]).then(([cr, pr, or]) => {
      setCustomers(cr.data.customers || []);
      setProducts(pr.data.products || []);
      const allOrds = or.data.orders || [];
      const unbilled = allOrds.filter(o => !o.is_invoiced);
      setUnbilledOrders(unbilled);

      if (paramOrderId) {
        loadFromOrder(paramOrderId);
      }
    }).catch(() => showSnack("Failed to load data", "error"))
      .finally(() => setLoading(false));
  }, [paramOrderId, loadFromOrder]);

  // ── Item handlers ─────────────────────────────────────────────────
  const setItemField = (idx, field, val) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  };

  const fillFromProduct = (idx, productId) => {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    const gst = p.gst_rate || 18;
    setItems(prev => prev.map((it, i) => i === idx ? {
      ...it,
      product_id: productId,
      description: p.name,
      hsn_code: p.hsn_code || "1905",
      mrp: p.mrp || p.price,
      selling_price: p.price,
      unit: p.unit || "Pcs",
      cgst_pct: gst / 2,
      sgst_pct: gst / 2,
      igst_pct: gst,
    } : it));
  };

  const addRow = () => setItems(prev => [...prev, DEFAULT_ITEM()]);
  const removeRow = (idx) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Computed totals ───────────────────────────────────────────────
  const itemCalcs = items.map(it => calcItem(it, isInterstate));
  const subtotal = round2(itemCalcs.reduce((s, c) => s + c.taxable, 0));
  const discountAmt = round2(subtotal * (parseFloat(discountPct) || 0) / 100);
  const taxableAfterDiscount = round2(subtotal - discountAmt);
  const totalCGST = round2(itemCalcs.reduce((s, c) => s + c.cgst_amt, 0));
  const totalSGST = round2(itemCalcs.reduce((s, c) => s + c.sgst_amt, 0));
  const totalIGST = round2(itemCalcs.reduce((s, c) => s + c.igst_amt, 0));
  const taxTotal = round2(totalCGST + totalSGST + totalIGST);
  const grandTotal = round2(taxableAfterDiscount + taxTotal);

  // ── Save ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!customerId) return showSnack("Please select a customer", "error");
    const badItem = items.find(it => !it.description || !it.selling_price || !it.quantity);
    if (badItem) return showSnack("All items need description, price and quantity", "error");

    setSaving(true);
    try {
      const payload = {
        customer_id: parseInt(customerId),
        invoice_date: invoiceDate,
        is_interstate: isInterstate,
        discount_pct: parseFloat(discountPct) || 0,
        notes,
        order_id: selectedOrderId ? parseInt(selectedOrderId) : null,
        payment_status: paymentStatus,
        items: items.map(it => ({
          product_id: it.product_id ? parseInt(it.product_id) : null,
          description: it.description,
          hsn_code: it.hsn_code || "1905",
          mrp: parseFloat(it.mrp) || 0,
          selling_price: parseFloat(it.selling_price),
          quantity: parseFloat(it.quantity),
          unit: it.unit || "Pcs",
          cgst_pct: parseFloat(it.cgst_pct) || 0,
          sgst_pct: parseFloat(it.sgst_pct) || 0,
          igst_pct: parseFloat(it.igst_pct) || 0,
        })),
      };
      const res = await axios.post(`${API}/invoices`, payload);
      showSnack(`✅ Invoice ${res.data.invoice_number} created! Total: ₹${res.data.total_amount}`);
      setTimeout(() => navigate("/billing"), 1200);
    } catch (e) {
      showSnack(e.response?.data?.detail || "Error creating invoice", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  const selectedCustomer = customers.find(c => c.id === parseInt(customerId));

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate("/billing")} sx={{ border: "1px solid #E0E0E0" }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight={700}>Create New Invoice</Typography>
          <Typography variant="body2" color="text.secondary">
            GST Tax Invoice (BUSY format compatible)
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* ── Left: Customer + Order Link + Invoice Details ── */}
        <Grid item xs={12} md={5}>
          {/* Order conversion selector */}
          <Paper sx={{ p: 2, borderRadius: 2, mb: 2, bgcolor: "#F0F7FF", border: "1px solid #BBDEFB" }}>
            <Stack direction="row" alignItems="center" gap={1} mb={1}>
              <ShoppingBagIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={700} color="primary">
                Create from Existing Order (Optional)
              </Typography>
            </Stack>
            <FormControl fullWidth size="small">
              <InputLabel>Select Unbilled Order</InputLabel>
              <Select
                value={selectedOrderId}
                label="Select Unbilled Order"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) loadFromOrder(val);
                  else setSelectedOrderId("");
                }}
              >
                <MenuItem value=""><em>None (New Direct Bill)</em></MenuItem>
                {unbilledOrders.map(o => (
                  <MenuItem key={o.id} value={o.id}>
                    Order #{o.id} — {o.shop_name} (₹{o.total_amount})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedOrderId && (
              <Chip
                label={`Linked to Order #${selectedOrderId} (stock won't be deducted twice)`}
                size="small"
                color="info"
                sx={{ mt: 1, fontSize: 11 }}
              />
            )}
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2, mb: 2 }}>
            <Typography variant="h6" fontWeight={700} mb={2} color="primary">
              Customer &amp; Tax Mode
            </Typography>
            <Stack gap={2}>
              <FormControl fullWidth>
                <InputLabel>Customer *</InputLabel>
                <Select value={customerId} label="Customer *"
                  onChange={e => setCustomerId(e.target.value)}>
                  {customers.map(c => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.shop_name}{c.owner ? ` — ${c.owner}` : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedCustomer && (
                <Box sx={{ bgcolor: "#E3F2FD", borderRadius: 1, p: 1.5, fontSize: 13 }}>
                  <Typography variant="caption" color="primary" fontWeight={600}>Customer Details</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedCustomer.shop_name}</Typography>
                  {selectedCustomer.owner && <Typography variant="body2">{selectedCustomer.owner}</Typography>}
                  {selectedCustomer.address && <Typography variant="body2">{selectedCustomer.address}</Typography>}
                  {selectedCustomer.phone && <Typography variant="body2">Ph: {selectedCustomer.phone}</Typography>}
                  {selectedCustomer.gstin && (
                    <Typography variant="body2" fontWeight={600} color="primary.dark">
                      GSTIN: {selectedCustomer.gstin}
                    </Typography>
                  )}
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                    Current Outstanding: ₹{Number(selectedCustomer.balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              )}

              <TextField fullWidth label="Invoice Date *" type="date"
                value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)}
                InputLabelProps={{ shrink: true }} />

              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select value={paymentStatus} label="Payment Status"
                  onChange={e => setPaymentStatus(e.target.value)}>
                  <MenuItem value="Unpaid">Unpaid (Added to Outstanding)</MenuItem>
                  <MenuItem value="Paid">Paid (Recorded in Payments)</MenuItem>
                  <MenuItem value="Partial">Partial</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={<Switch checked={isInterstate}
                  onChange={e => setIsInterstate(e.target.checked)} />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {isInterstate ? "Inter-State (IGST)" : "Intra-State (CGST + SGST)"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {isInterstate ? "Integrated GST applied" : "Split equally as Central & State GST"}
                    </Typography>
                  </Box>
                }
              />

              <TextField fullWidth label="Trade Discount (%)" type="number"
                inputProps={{ min: 0, max: 100, step: 0.5 }}
                value={discountPct} onChange={e => setDiscountPct(e.target.value)} />

              <TextField fullWidth label="Invoice Notes / Terms" multiline rows={2}
                value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Optional notes printed on invoice..." />
            </Stack>
          </Paper>

          {/* Totals summary */}
          <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: "#F8F9FA", border: "1px solid #E0E0E0" }}>
            <Typography variant="h6" fontWeight={700} mb={1.5} color="primary">
              <CalculateIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Calculation Breakdown
            </Typography>
            {[
              ["Subtotal (Taxable)", `₹${subtotal.toFixed(2)}`],
              ...(discountPct > 0 ? [[`Discount (${discountPct}%)`, `-₹${discountAmt.toFixed(2)}`]] : []),
              ...(discountPct > 0 ? [["Taxable Subtotal", `₹${taxableAfterDiscount.toFixed(2)}`]] : []),
              ...(!isInterstate ? [
                [`Total CGST`, `₹${totalCGST.toFixed(2)}`],
                [`Total SGST`, `₹${totalSGST.toFixed(2)}`],
              ] : [
                [`Total IGST`, `₹${totalIGST.toFixed(2)}`],
              ]),
            ].map(([label, val]) => (
              <Stack key={label} direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="body2" fontWeight={500}>{val}</Typography>
              </Stack>
            ))}
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={700} color="primary">Grand Total</Typography>
              <Typography variant="h5" fontWeight={800} color="primary">
                ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Typography>
            </Stack>
            {grandTotal > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, fontStyle: "italic" }}>
                {amountWords(grandTotal)}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* ── Right: Product Items ── */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={700} color="primary">Product Items</Typography>
                <Typography variant="caption" color="text.secondary">
                  Choose from existing products or type custom items
                </Typography>
              </Box>
              <Button size="small" startIcon={<AddIcon />} variant="outlined"
                onClick={addRow}>Add Row</Button>
            </Stack>

            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#1565C0" }}>
                    {["Product", "HSN", "MRP (₹)", "Selling (₹)", "Qty", "Unit",
                      isInterstate ? "IGST%" : "CGST%",
                      ...(!isInterstate ? ["SGST%"] : []),
                      "Taxable", "Tax Amt", "Total", ""].map(h => (
                      <TableCell key={h} sx={{ color: "white", fontSize: 11, py: 1, px: 0.5, fontWeight: 700 }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, idx) => {
                    const c = itemCalcs[idx];
                    const taxAmt = round2(c.cgst_amt + c.sgst_amt + c.igst_amt);
                    return (
                      <TableRow key={idx} sx={{ bgcolor: idx % 2 === 0 ? "white" : "#FAFAFA" }}>
                        {/* Product picker */}
                        <TableCell sx={{ minWidth: 160, px: 0.5 }}>
                          <Select size="small" fullWidth displayEmpty
                            value={item.product_id || ""}
                            onChange={e => {
                              if (e.target.value) fillFromProduct(idx, e.target.value);
                              else setItemField(idx, "product_id", "");
                            }}
                            renderValue={v => v ? (products.find(p => p.id === v)?.name || v) : <em>Select product…</em>}
                            sx={{ fontSize: 11, mb: 0.5 }}>
                            <MenuItem value=""><em>Custom / Manual Item</em></MenuItem>
                            {products.map(p => (
                              <MenuItem key={p.id} value={p.id} disabled={!selectedOrderId && p.stock === 0}>
                                {p.name}
                                <Typography variant="caption" sx={{ ml: 1, color: p.stock < 10 ? "error.main" : "text.secondary" }}>
                                  (stock: {p.stock})
                                </Typography>
                              </MenuItem>
                            ))}
                          </Select>
                          <TextField size="small" fullWidth placeholder="Description *"
                            value={item.description}
                            onChange={e => setItemField(idx, "description", e.target.value)}
                            inputProps={{ style: { fontSize: 11 } }} />
                        </TableCell>

                        {/* HSN */}
                        <TableCell sx={{ minWidth: 60, px: 0.5 }}>
                          <TextField size="small" fullWidth value={item.hsn_code}
                            onChange={e => setItemField(idx, "hsn_code", e.target.value)}
                            inputProps={{ style: { fontSize: 11 } }} />
                        </TableCell>

                        {/* MRP */}
                        <TableCell sx={{ minWidth: 70, px: 0.5 }}>
                          <TextField size="small" fullWidth type="number" value={item.mrp}
                            onChange={e => setItemField(idx, "mrp", e.target.value)}
                            inputProps={{ style: { fontSize: 11 }, min: 0 }} />
                        </TableCell>

                        {/* Selling price */}
                        <TableCell sx={{ minWidth: 70, px: 0.5 }}>
                          <TextField size="small" fullWidth type="number" value={item.selling_price}
                            onChange={e => setItemField(idx, "selling_price", e.target.value)}
                            inputProps={{ style: { fontSize: 11 }, min: 0 }} />
                        </TableCell>

                        {/* Qty */}
                        <TableCell sx={{ minWidth: 55, px: 0.5 }}>
                          <TextField size="small" fullWidth type="number" value={item.quantity}
                            onChange={e => setItemField(idx, "quantity", e.target.value)}
                            inputProps={{ style: { fontSize: 11 }, min: 1 }} />
                        </TableCell>

                        {/* Unit */}
                        <TableCell sx={{ minWidth: 65, px: 0.5 }}>
                          <Select size="small" fullWidth value={item.unit}
                            onChange={e => setItemField(idx, "unit", e.target.value)}
                            sx={{ fontSize: 11 }}>
                            {["Pcs", "Box", "Kg", "Ltr", "Doz", "Bag", "Ctn", "Tin"].map(u => (
                              <MenuItem key={u} value={u} sx={{ fontSize: 12 }}>{u}</MenuItem>
                            ))}
                          </Select>
                        </TableCell>

                        {/* CGST / IGST */}
                        <TableCell sx={{ minWidth: 55, px: 0.5 }}>
                          <TextField size="small" fullWidth type="number"
                            value={isInterstate ? item.igst_pct : item.cgst_pct}
                            onChange={e => setItemField(idx, isInterstate ? "igst_pct" : "cgst_pct", e.target.value)}
                            inputProps={{ style: { fontSize: 11 }, min: 0, max: 28, step: 0.5 }} />
                        </TableCell>

                        {/* SGST (intra only) */}
                        {!isInterstate && (
                          <TableCell sx={{ minWidth: 55, px: 0.5 }}>
                            <TextField size="small" fullWidth type="number"
                              value={item.sgst_pct}
                              onChange={e => setItemField(idx, "sgst_pct", e.target.value)}
                              inputProps={{ style: { fontSize: 11 }, min: 0, max: 14, step: 0.5 }} />
                          </TableCell>
                        )}

                        {/* Computed columns */}
                        <TableCell sx={{ fontSize: 11, px: 0.5, color: "text.secondary" }}>
                          ₹{c.taxable.toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ fontSize: 11, px: 0.5, color: "text.secondary" }}>
                          ₹{taxAmt.toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ fontSize: 11, px: 0.5, fontWeight: 700, color: "#1565C0" }}>
                          ₹{c.total.toFixed(2)}
                        </TableCell>

                        {/* Remove */}
                        <TableCell sx={{ px: 0.5 }}>
                          <IconButton size="small" color="error"
                            onClick={() => removeRow(idx)} disabled={items.length === 1}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Save button */}
            <Stack direction="row" justifyContent="flex-end" gap={2}>
              <Button variant="outlined" onClick={() => navigate("/billing")}
                disabled={saving}>Cancel</Button>
              <Button variant="contained" size="large" startIcon={
                saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                onClick={handleSave} disabled={saving} sx={{ px: 4, borderRadius: 2 }}>
                {saving ? "Saving…" : "Save Invoice"}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={5000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.sev} variant="filled"
          onClose={() => setSnack({ ...snack, open: false })}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}

export default BillingNew;
