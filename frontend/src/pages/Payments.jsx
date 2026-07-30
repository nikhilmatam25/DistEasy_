import { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography, Paper, Grid, Box, Button, TextField,
  Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, MenuItem, Select, FormControl, InputLabel,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Alert, Snackbar, CircularProgress, Stack, Divider, Card,
  CardContent, Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import PaymentsIcon from "@mui/icons-material/Payments";

const API = import.meta.env.VITE_API_URL || "/api";

const METHODS = ["Cash", "UPI", "Credit"];

const today = () => new Date().toISOString().split("T")[0];

function SummaryCard({ title, value, icon, color }) {
  return (
    <Card elevation={2} sx={{ borderRadius: 3, borderLeft: `5px solid ${color}` }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>{value}</Typography>
          </Box>
          <Box sx={{ color, fontSize: 36 }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function Payments() {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({});
  const [search, setSearch] = useState("");
  const [filterCustomer, setFilterCustomer] = useState("");
  const [loading, setLoading] = useState(false);

  // Add/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ customer_id: "", amount: "", payment_method: "Cash", payment_date: today(), notes: "" });

  // Ledger dialog
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [ledger, setLedger] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showSnack = (message, severity = "success") => setSnackbar({ open: true, message, severity });

  const loadData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (filterCustomer) params.append("customer_id", filterCustomer);
    Promise.all([
      axios.get(`${API}/payments?${params}`),
      axios.get(`${API}/payments/summary`),
      axios.get(`${API}/customers`),
    ])
      .then(([pRes, sRes, cRes]) => {
        setPayments(pRes.data.payments || []);
        setSummary(sRes.data);
        setCustomers(cRes.data.customers || []);
      })
      .catch(() => showSnack("Failed to load data", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [search, filterCustomer]);

  const openAdd = () => {
    setEditId(null);
    setForm({ customer_id: "", amount: "", payment_method: "Cash", payment_date: today(), notes: "" });
    setDialogOpen(true);
  };

  const openEdit = (p) => {
    setEditId(p.id);
    setForm({ customer_id: p.customer_id, amount: p.amount, payment_method: p.payment_method, payment_date: p.payment_date, notes: p.notes || "" });
    setDialogOpen(true);
  };

  const savePayment = async () => {
    if (!form.customer_id || !form.amount || parseFloat(form.amount) <= 0) {
      showSnack("Please fill all required fields correctly", "warning"); return;
    }
    setLoading(true);
    try {
      if (editId) {
        await axios.put(`${API}/payments/${editId}`, { ...form, amount: parseFloat(form.amount) });
        showSnack("Payment updated");
      } else {
        const res = await axios.post(`${API}/payments`, { ...form, amount: parseFloat(form.amount), customer_id: parseInt(form.customer_id) });
        showSnack(`Payment recorded! New balance: ₹${res.data.new_balance}`);
      }
      setDialogOpen(false);
      loadData();
    } catch (e) {
      showSnack(e.response?.data?.detail || "Error saving payment", "error");
    } finally { setLoading(false); }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API}/payments/${deleteId}`);
      showSnack("Payment deleted");
      setDeleteId(null);
      loadData();
    } catch (e) { showSnack(e.response?.data?.detail || "Error deleting", "error"); }
  };

  const openLedger = (customerId) => {
    setLedgerLoading(true);
    setLedgerOpen(true);
    setLedger(null);
    axios.get(`${API}/payments/ledger/${customerId}`)
      .then(res => setLedger(res.data))
      .catch(() => showSnack("Failed to load ledger", "error"))
      .finally(() => setLedgerLoading(false));
  };

  const fmt = (n) => `₹${Number(n || 0).toFixed(2)}`;

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Payments</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Record Payment</Button>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title="Total Collected" value={fmt(summary.total_collected)} icon={<AccountBalanceWalletIcon fontSize="inherit" />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title="Total Outstanding" value={fmt(summary.total_outstanding)} icon={<ReceiptLongIcon fontSize="inherit" />} color="#c62828" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title="Cash Collected" value={fmt(summary.cash_total)} icon={<PaymentsIcon fontSize="inherit" />} color="#1565c0" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title="UPI Collected" value={fmt(summary.upi_total)} icon={<PaymentsIcon fontSize="inherit" />} color="#6a1b9a" />
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField fullWidth size="small" label="Search by customer name" value={search}
              onChange={e => setSearch(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={5}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Customer</InputLabel>
              <Select value={filterCustomer} label="Filter by Customer"
                onChange={e => setFilterCustomer(e.target.value)}>
                <MenuItem value="">All Customers</MenuItem>
                {customers.map(c => <MenuItem key={c.id} value={c.id}>{c.shop_name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="outlined" onClick={() => { setSearch(""); setFilterCustomer(""); }}>Clear</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Payments Table */}
      {loading ? <Box textAlign="center" py={6}><CircularProgress /></Box> : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Outstanding</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}>No payments found</TableCell></TableRow>
              ) : payments.map((p, i) => (
                <TableRow key={p.id} hover>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>
                    <Tooltip title="View Ledger">
                      <Button size="small" onClick={() => openLedger(p.customer_id)}
                        startIcon={<PersonSearchIcon />} sx={{ textTransform: "none", p: 0 }}>
                        {p.shop_name}
                      </Button>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{p.payment_date}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "green" }}>{fmt(p.amount)}</TableCell>
                  <TableCell>
                    <Chip label={p.payment_method} size="small"
                      color={p.payment_method === "Cash" ? "success" : p.payment_method === "UPI" ? "primary" : "default"} />
                  </TableCell>
                  <TableCell>{p.notes || "-"}</TableCell>
                  <TableCell sx={{ color: "error.main" }}>-</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteId(p.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? "Edit Payment" : "Record Payment"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Customer *</InputLabel>
                <Select value={form.customer_id} label="Customer *"
                  onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}
                  disabled={!!editId}>
                  {customers.map(c => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.shop_name} {c.balance > 0 ? `— Due: ₹${c.balance}` : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Amount (₹) *" type="number" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Method</InputLabel>
                <Select value={form.payment_method} label="Method"
                  onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}>
                  {METHODS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Payment Date" type="date" value={form.payment_date}
                onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Notes" value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={savePayment} disabled={loading}>
            {loading ? <CircularProgress size={18} /> : editId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Customer Ledger Dialog */}
      <Dialog open={ledgerOpen} onClose={() => setLedgerOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Customer Ledger</DialogTitle>
        <DialogContent>
          {ledgerLoading ? <CircularProgress /> : ledger ? (
            <Box>
              <Paper sx={{ p: 2, mb: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
                <Typography variant="h6">{ledger.customer.shop_name}</Typography>
                <Typography>Owner: {ledger.customer.owner || "—"} | Phone: {ledger.customer.phone || "—"}</Typography>
                <Typography variant="h6" sx={{ mt: 1, color: ledger.customer.balance > 0 ? "error.main" : "success.main" }}>
                  Outstanding Balance: {fmt(ledger.customer.balance)}
                </Typography>
              </Paper>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#eeeeee" }}>
                      <TableCell>Type</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Method</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ledger.ledger.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Chip label={row.type === "order" ? "Order" : "Payment"} size="small"
                            color={row.type === "order" ? "warning" : "success"} />
                        </TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell sx={{ color: row.type === "order" ? "error.main" : "success.main", fontWeight: 600 }}>
                          {row.type === "order" ? "-" : "+"}{fmt(row.amount)}
                        </TableCell>
                        <TableCell>{row.method || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLedgerOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Payment?</DialogTitle>
        <DialogContent>
          <Alert severity="warning">This will restore the customer's balance by the payment amount.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Payments;