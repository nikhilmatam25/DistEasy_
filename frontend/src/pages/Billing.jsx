import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Typography, Box, Grid, Paper, Card, CardContent, Stack, Button,
  TextField, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Chip, CircularProgress, Alert, Snackbar,
  MenuItem, Select, FormControl, InputLabel, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";

const API = import.meta.env.VITE_API_URL || "/api";

// ─── Status chip ─────────────────────────────────────────────────────
function StatusChip({ status }) {
  const map = {
    Paid:    { color: "success", label: "Paid" },
    Unpaid:  { color: "error",   label: "Unpaid" },
    Partial: { color: "warning", label: "Partial" },
  };
  const cfg = map[status] || { color: "default", label: status };
  return <Chip label={cfg.label} color={cfg.color} size="small" />;
}

// ─── Summary card ─────────────────────────────────────────────────────
function SummaryCard({ title, value, icon, color }) {
  return (
    <Card elevation={2} sx={{ borderRadius: 2, borderLeft: `5px solid ${color}` }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color, fontSize: 36, opacity: 0.7 }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Invoice View Dialog (print-ready) ───────────────────────────────
function InvoiceViewDialog({ open, invoice, settings, onClose }) {
  if (!invoice) return null;
  const snap = invoice.customer_snapshot || {};
  const items = invoice.items || [];

  const handlePrint = () => {
    const printContent = document.getElementById("invoice-print-area").innerHTML;
    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(`
      <html><head><title>Invoice ${invoice.invoice_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #000; }
        .inv-box { width: 794px; margin: 0 auto; padding: 20px; border: 2px solid #000; }
        .header-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .company-name { font-size: 18px; font-weight: bold; color: #1565C0; }
        .title-band { background:#1565C0; color:#fff; text-align:center; padding:5px; font-size:13px; font-weight:bold; margin:8px 0; }
        .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px; }
        .info-box { border:1px solid #ccc; padding:6px; }
        .info-label { font-size:9px; color:#666; }
        table { width:100%; border-collapse:collapse; margin-bottom:8px; }
        th { background:#1565C0; color:#fff; font-size:9px; padding:4px 3px; border:1px solid #ccc; text-align:center; }
        td { font-size:9px; padding:4px 3px; border:1px solid #ccc; text-align:center; }
        td.desc { text-align:left; }
        .totals-row { display:flex; justify-content:flex-end; }
        .totals-box { width:260px; border:1px solid #ccc; }
        .totals-box tr td { font-size:10px; padding:3px 6px; }
        .totals-box tr:last-child td { font-weight:bold; background:#E3F2FD; }
        .words-box { border:1px solid #ccc; padding:6px; margin-top:6px; font-size:9px; }
        .footer { display:flex; justify-content:space-between; margin-top:12px; padding-top:6px; border-top:1px solid #ccc; }
        .sign-box { text-align:right; font-size:9px; }
        @media print { body{margin:0} .inv-box{border:none} }
      </style></head>
      <body>${printContent}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        bgcolor: "#1565C0", color: "white" }}>
        <Typography fontWeight={700}>Invoice — {invoice.invoice_number}</Typography>
        <Stack direction="row" gap={1}>
          <Button variant="contained" size="small" startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ bgcolor: "white", color: "#1565C0", "&:hover": { bgcolor: "#E3F2FD" } }}>
            Print / Save PDF
          </Button>
          <Button size="small" onClick={onClose} sx={{ color: "white" }}>Close</Button>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {/* Printable content */}
        <Box id="invoice-print-area" sx={{ p: 3 }}>
          <div className="inv-box" style={{ border: "2px solid #000", padding: 16 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#1565C0" }}>
                  {settings?.company_name || "DistEasy Distributors"}
                </div>
                <div style={{ fontSize: 10, marginTop: 2 }}>{settings?.address || ""}</div>
                <div style={{ fontSize: 10 }}>
                  {settings?.phone ? `Ph: ${settings.phone}` : ""}
                  {settings?.email ? `  |  ${settings.email}` : ""}
                </div>
                {settings?.gst_number && (
                  <div style={{ fontSize: 10, fontWeight: "bold" }}>GSTIN: {settings.gst_number}</div>
                )}
              </div>
              <div style={{ textAlign: "right", fontSize: 10 }}>
                <div style={{ fontWeight: "bold" }}>TAX INVOICE</div>
                <div>Invoice No: <strong>{invoice.invoice_number}</strong></div>
                <div>Date: <strong>{invoice.invoice_date}</strong></div>
                {settings?.state_name && <div>State: {settings.state_name} ({settings.state_code})</div>}
              </div>
            </div>
            <div style={{ background: "#1565C0", color: "#fff", textAlign: "center",
              padding: "4px", fontWeight: "bold", fontSize: 12, marginBottom: 8 }}>
              TAX INVOICE
            </div>
            {/* Customer */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div style={{ border: "1px solid #ccc", padding: 8 }}>
                <div style={{ fontSize: 9, color: "#666", marginBottom: 2 }}>BILL TO</div>
                <div style={{ fontWeight: "bold" }}>{snap.shop_name}</div>
                {snap.owner && <div style={{ fontSize: 10 }}>{snap.owner}</div>}
                {snap.address && <div style={{ fontSize: 10 }}>{snap.address}</div>}
                {snap.phone && <div style={{ fontSize: 10 }}>Ph: {snap.phone}</div>}
                {snap.gstin && <div style={{ fontSize: 10, fontWeight: "bold" }}>GSTIN: {snap.gstin}</div>}
              </div>
              <div style={{ border: "1px solid #ccc", padding: 8 }}>
                <div style={{ fontSize: 9, color: "#666", marginBottom: 2 }}>PAYMENT INFO</div>
                <div style={{ fontSize: 10 }}>Status: <strong><StatusChip status={invoice.payment_status} /></strong></div>
                {invoice.notes && <div style={{ fontSize: 10, marginTop: 4 }}>Notes: {invoice.notes}</div>}
                <div style={{ fontSize: 10, marginTop: 4 }}>
                  Mode: {invoice.is_interstate ? "Inter-State (IGST)" : "Intra-State (CGST+SGST)"}
                </div>
              </div>
            </div>

            {/* Items table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
              <thead>
                <tr style={{ background: "#1565C0", color: "#fff" }}>
                  {["#","Description","HSN","MRP","Qty","Unit","Rate","Taxable",
                    invoice.is_interstate ? "IGST%" : "CGST%",
                    invoice.is_interstate ? "IGST Amt" : "CGST Amt",
                    ...(invoice.is_interstate ? [] : ["SGST%","SGST Amt"]),
                    "Total"].map(h => (
                    <th key={h} style={{ padding: "4px 3px", border: "1px solid #ccc",
                      fontSize: 9, textAlign: "center" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#F5F5F5" }}>
                    <td style={{ padding: "3px", border: "1px solid #ddd", textAlign: "center", fontSize: 9 }}>{i + 1}</td>
                    <td style={{ padding: "3px", border: "1px solid #ddd", textAlign: "left", fontSize: 9 }}>{item.description}</td>
                    <td style={{ padding: "3px", border: "1px solid #ddd", textAlign: "center", fontSize: 9 }}>{item.hsn_code}</td>
                    <td style={{ padding: "3px", border: "1px solid #ddd", textAlign: "right", fontSize: 9 }}>₹{Number(item.mrp).toFixed(2)}</td>
                    <td style={{ padding: "3px", border: "1px solid #ddd", textAlign: "center", fontSize: 9 }}>{item.quantity}</td>
                    <td style={{ padding: "3px", border: "1px solid #ddd", textAlign: "center", fontSize: 9 }}>{item.unit}</td>
                    <td style={{ padding: "3px", border: "1px solid #ddd", textAlign: "right", fontSize: 9 }}>₹{Number(item.selling_price).toFixed(2)}</td>
                    <td style={{ padding: "3px", border: "1px solid #ddd", textAlign: "right", fontSize: 9 }}>₹{Number(item.taxable_amount).toFixed(2)}</td>
                    {invoice.is_interstate ? (
                      <>
                        <td style={{ padding: "3px", border: "1px solid #ddd", textAlign: "center", fontSize: 9 }}>{item.igst_pct}%</td>
                        <td style={{ padding: "3px", border: "1px solid #ddd", textAlign: "right", fontSize: 9 }}>₹{Number(item.igst_amount).toFixed(2)}</td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: "3px", border: "1px solid #ddd", textAlign: "center", fontSize: 9 }}>{item.cgst_pct}%</td>
                        <td style={{ padding: "3px", border: "1px solid #ddd", textAlign: "right", fontSize: 9 }}>₹{Number(item.cgst_amount).toFixed(2)}</td>
                        <td style={{ padding: "3px", border: "1px solid #ddd", textAlign: "center", fontSize: 9 }}>{item.sgst_pct}%</td>
                        <td style={{ padding: "3px", border: "1px solid #ddd", textAlign: "right", fontSize: 9 }}>₹{Number(item.sgst_amount).toFixed(2)}</td>
                      </>
                    )}
                    <td style={{ padding: "3px", border: "1px solid #ddd", textAlign: "right", fontWeight: "bold", fontSize: 9 }}>₹{Number(item.total_amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
              <table style={{ width: 240, borderCollapse: "collapse", border: "1px solid #ccc" }}>
                <tbody>
                  {[
                    ["Subtotal", `₹${Number(invoice.subtotal).toFixed(2)}`],
                    ...(invoice.discount_pct > 0 ? [
                      [`Discount (${invoice.discount_pct}%)`, `-₹${Number(invoice.discount_amount).toFixed(2)}`],
                      ["Taxable Amount", `₹${Number(invoice.taxable_amount).toFixed(2)}`],
                    ] : []),
                    ...(invoice.is_interstate
                      ? [["IGST", `₹${Number(invoice.igst_amount).toFixed(2)}`]]
                      : [
                          ["CGST", `₹${Number(invoice.cgst_amount).toFixed(2)}`],
                          ["SGST", `₹${Number(invoice.sgst_amount).toFixed(2)}`],
                        ]
                    ),
                    ["Grand Total", `₹${Number(invoice.total_amount).toFixed(2)}`],
                  ].map(([label, val], i, arr) => (
                    <tr key={label} style={{ background: i === arr.length - 1 ? "#E3F2FD" : "#fff" }}>
                      <td style={{ padding: "4px 8px", fontSize: 10, border: "1px solid #ddd",
                        fontWeight: i === arr.length - 1 ? "bold" : "normal" }}>{label}</td>
                      <td style={{ padding: "4px 8px", fontSize: 10, border: "1px solid #ddd",
                        textAlign: "right", fontWeight: i === arr.length - 1 ? "bold" : "normal" }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Amount in words */}
            <div style={{ border: "1px solid #ccc", padding: 8, marginBottom: 10, fontSize: 10 }}>
              <strong>Amount in Words:</strong> {invoice.amount_in_words}
            </div>

            {/* Bank details + Signature */}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #ccc" }}>
              <div style={{ fontSize: 10 }}>
                <strong>Bank Details:</strong><br />
                {settings?.bank_name && <span>Bank: {settings.bank_name}<br /></span>}
                {settings?.bank_account && <span>Account: {settings.bank_account}<br /></span>}
                {settings?.bank_ifsc && <span>IFSC: {settings.bank_ifsc}<br /></span>}
                {settings?.bank_branch && <span>Branch: {settings.bank_branch}</span>}
              </div>
              <div style={{ textAlign: "right", fontSize: 10 }}>
                <div style={{ marginBottom: 30 }}>For <strong>{settings?.company_name}</strong></div>
                <div style={{ borderTop: "1px solid #000", paddingTop: 4 }}>Authorised Signatory</div>
              </div>
            </div>
          </div>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN BILLING DASHBOARD
// ═══════════════════════════════════════════════════════════════════════
function Billing() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});

  // Filters
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // View dialog
  const [viewInvoice, setViewInvoice] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Snackbar
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const showSnack = (msg, sev = "success") => setSnack({ open: true, msg, sev });

  // Status change dialog
  const [statusDialog, setStatusDialog] = useState({ open: false, id: null, current: "" });
  const [newStatus, setNewStatus] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, invRes, settRes] = await Promise.all([
        axios.get(`${API}/invoices/summary`),
        axios.get(`${API}/invoices`, {
          params: { search, date_from: dateFrom, date_to: dateTo, status: statusFilter || undefined },
        }),
        axios.get(`${API}/settings`),
      ]);
      setSummary(sumRes.data);
      setInvoices(invRes.data.invoices || []);
      setSettings(settRes.data);
    } catch {
      showSnack("Failed to load billing data", "error");
    } finally {
      setLoading(false);
    }
  }, [search, dateFrom, dateTo, statusFilter]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const openView = async (id) => {
    setViewLoading(true);
    try {
      const res = await axios.get(`${API}/invoices/${id}`);
      setViewInvoice(res.data);
    } catch {
      showSnack("Failed to load invoice", "error");
    } finally {
      setViewLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Cancel this invoice? (This cannot be undone)")) return;
    try {
      await axios.delete(`${API}/invoices/${id}`);
      showSnack("Invoice cancelled");
      loadAll();
    } catch (e) {
      showSnack(e.response?.data?.detail || "Error", "error");
    }
  };

  const handleStatusSave = async () => {
    try {
      await axios.put(`${API}/invoices/${statusDialog.id}/status`, { payment_status: newStatus });
      showSnack(`Status updated to ${newStatus}`);
      setStatusDialog({ open: false, id: null, current: "" });
      loadAll();
      if (viewInvoice?.id === statusDialog.id) {
        setViewInvoice(prev => prev ? { ...prev, payment_status: newStatus } : prev);
      }
    } catch (e) {
      showSnack(e.response?.data?.detail || "Error", "error");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between"
        alignItems={{ sm: "center" }} mb={3} gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>🧾 Billing</Typography>
          <Typography variant="body2" color="text.secondary">
            GST Invoicing &amp; Payment Tracking
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} size="large"
          onClick={() => navigate("/billing/new")}
          sx={{ borderRadius: 2, px: 3 }}>
          Create New Invoice
        </Button>
      </Stack>

      {/* Summary cards */}
      {summary && (
        <Grid container spacing={2} mb={3}>
          {[
            { title: "Total Invoices", value: summary.total_invoices, icon: <ReceiptIcon />, color: "#1565C0" },
            { title: "Total Sales", value: `₹${summary.total_sales?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, icon: <AttachMoneyIcon />, color: "#2E7D32" },
            { title: "Paid Amount", value: `₹${summary.paid_amount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, icon: <CheckCircleIcon />, color: "#1B5E20" },
            { title: "Pending Amount", value: `₹${summary.pending_amount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, icon: <PendingIcon />, color: "#C62828" },
          ].map(c => (
            <Grid item xs={12} sm={6} md={3} key={c.title}>
              <SummaryCard {...c} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" placeholder="Search invoice / customer..."
              value={search} onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} /> }} />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField fullWidth size="small" label="From" type="date"
              value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField fullWidth size="small" label="To" type="date"
              value={dateTo} onChange={e => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={6} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Unpaid">Unpaid</MenuItem>
                <MenuItem value="Partial">Partial</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Button fullWidth variant="outlined" onClick={loadAll}>Refresh</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Invoice table */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#1565C0" }}>
                {["Invoice No", "Date", "Customer", "Total Amount", "Tax", "Payment", "Actions"].map(h => (
                  <TableCell key={h} sx={{ color: "white", fontWeight: 700 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No invoices yet. Click "Create New Invoice" to get started.
                  </TableCell>
                </TableRow>
              ) : invoices.map((inv, i) => {
                const taxTotal = (inv.cgst_amount || 0) + (inv.sgst_amount || 0) + (inv.igst_amount || 0);
                return (
                  <TableRow key={inv.id} sx={{ bgcolor: i % 2 === 0 ? "white" : "#FAFAFA" }}>
                    <TableCell sx={{ fontWeight: 600, color: "#1565C0" }}>{inv.invoice_number}</TableCell>
                    <TableCell>{inv.invoice_date}</TableCell>
                    <TableCell>{inv.shop_name || "—"}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      ₹{Number(inv.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>₹{taxTotal.toFixed(2)}</TableCell>
                    <TableCell>
                      <Box sx={{ cursor: "pointer" }}
                        onClick={() => {
                          setStatusDialog({ open: true, id: inv.id, current: inv.payment_status });
                          setNewStatus(inv.payment_status);
                        }}>
                        <StatusChip status={inv.payment_status} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" gap={0.5}>
                        <Tooltip title="View / Print">
                          <IconButton size="small" color="primary"
                            onClick={() => openView(inv.id)} disabled={viewLoading}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel Invoice">
                          <IconButton size="small" color="error"
                            onClick={() => handleDelete(inv.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Invoice view dialog */}
      <InvoiceViewDialog
        open={!!viewInvoice}
        invoice={viewInvoice}
        settings={settings}
        onClose={() => setViewInvoice(null)}
      />

      {/* Change status dialog */}
      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, id: null, current: "" })}>
        <DialogTitle>Update Payment Status</DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 280 }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={newStatus} label="Status" onChange={e => setNewStatus(e.target.value)}>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Unpaid">Unpaid</MenuItem>
              <MenuItem value="Partial">Partial</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, id: null, current: "" })}>Cancel</Button>
          <Button variant="contained" onClick={handleStatusSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.sev} variant="filled"
          onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}

export default Billing;
