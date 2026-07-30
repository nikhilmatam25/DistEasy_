import { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography, Box, Grid, Paper, Stack, Card, CardContent,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Chip, CircularProgress, TextField, FormControl, InputLabel, Select,
  MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar, IconButton, Divider,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

const API = import.meta.env.VITE_API_URL || "/api";

const STATUSES = ["Pending", "In Transit", "Delivered"];
const today = () => new Date().toISOString().split("T")[0];

function StatusChip({ status }) {
  const map = {
    Pending: { color: "warning", icon: <PendingIcon sx={{ fontSize: 14 }} /> },
    "In Transit": { color: "info", icon: <LocalShippingIcon sx={{ fontSize: 14 }} /> },
    Delivered: { color: "success", icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
  };
  const cfg = map[status] || { color: "default" };
  return <Chip label={status} color={cfg.color} size="small" icon={cfg.icon} />;
}

function Delivery() {
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editDialog, setEditDialog] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    status: "Pending", driver_name: "", route: "",
    delivery_date: today(), actual_delivery_date: "", notes: ""
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showSnack = (message, severity = "success") => setSnackbar({ open: true, message, severity });

  const loadData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (statusFilter && statusFilter !== "All") params.append("status", statusFilter);
    Promise.all([
      axios.get(`${API}/delivery?${params}`),
      axios.get(`${API}/delivery/stats`),
    ])
      .then(([dRes, sRes]) => {
        setDeliveries(dRes.data.deliveries || []);
        setStats(sRes.data);
      })
      .catch(() => showSnack("Failed to load delivery data", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [search, statusFilter]);

  const openEdit = (d) => {
    setSelected(d);
    setForm({
      status: d.status || "Pending",
      driver_name: d.driver_name || "",
      route: d.route || d.customer_route || "",
      delivery_date: d.delivery_date || today(),
      actual_delivery_date: d.actual_delivery_date || "",
      notes: d.notes || "",
    });
    setEditDialog(true);
  };

  const saveDelivery = async () => {
    try {
      await axios.put(`${API}/delivery/${selected.id}`, form);
      showSnack("Delivery updated successfully");
      setEditDialog(false);
      loadData();
    } catch (e) {
      showSnack(e.response?.data?.detail || "Error updating delivery", "error");
    }
  };

  const fmt = (n) => `₹${Number(n || 0).toFixed(2)}`;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>🚚 Delivery Management</Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: "Total", value: stats.total || 0, color: "#1976d2" },
          { label: "Pending", value: stats.pending || 0, color: "#e65100" },
          { label: "In Transit", value: stats.in_transit || 0, color: "#0277bd" },
          { label: "Delivered", value: stats.delivered || 0, color: "#2e7d32" },
        ].map(s => (
          <Grid item xs={6} md={3} key={s.label}>
            <Card elevation={2} sx={{ borderRadius: 3, borderLeft: `5px solid ${s.color}` }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                <Typography variant="h4" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField fullWidth size="small" placeholder="Search by customer, driver, route..."
              value={search} onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
                <MenuItem value="All">All Statuses</MenuItem>
                {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button fullWidth variant="outlined" onClick={() => { setSearch(""); setStatusFilter("All"); }}>Clear</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Deliveries Table */}
      {loading ? (
        <Box textAlign="center" py={8}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#1976d2" }}>
              <TableRow>
                {["Order #", "Customer", "Address", "Route", "Amount", "Order Date", "Driver", "Delivery Date", "Status", "Edit"].map(h => (
                  <TableCell key={h} sx={{ color: "white", fontWeight: 700, whiteSpace: "nowrap" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {deliveries.length === 0 ? (
                <TableRow><TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  {stats.total === 0 ? "No orders exist yet. Create orders to see deliveries here." : "No deliveries match your filter."}
                </TableCell></TableRow>
              ) : deliveries.map(d => (
                <TableRow key={d.id} hover sx={{
                  bgcolor: d.status === "Delivered" ? "#f1f8e9" :
                    d.status === "In Transit" ? "#e3f2fd" : "inherit"
                }}>
                  <TableCell>#{d.order_id}</TableCell>
                  <TableCell>
                    <strong>{d.shop_name}</strong>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 140, fontSize: 12 }}>{d.address || "—"}</TableCell>
                  <TableCell>{d.route || d.customer_route || "—"}</TableCell>
                  <TableCell>{fmt(d.total_amount)}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{d.order_date ? d.order_date.split(" ")[0] : "—"}</TableCell>
                  <TableCell>{d.driver_name || "—"}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {d.actual_delivery_date || d.delivery_date || "—"}
                  </TableCell>
                  <TableCell><StatusChip status={d.status} /></TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => openEdit(d)}><EditIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Delivery Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Delivery — Order #{selected?.order_id}</DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ mt: 1 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Customer: <strong>{selected.shop_name}</strong> | Amount: <strong>{fmt(selected.total_amount)}</strong>
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select value={form.status} label="Status"
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Driver Name" value={form.driver_name}
                    onChange={e => setForm(f => ({ ...f, driver_name: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Route" value={form.route}
                    onChange={e => setForm(f => ({ ...f, route: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Planned Delivery Date" type="date" value={form.delivery_date}
                    onChange={e => setForm(f => ({ ...f, delivery_date: e.target.value }))}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Actual Delivery Date" type="date" value={form.actual_delivery_date}
                    onChange={e => setForm(f => ({ ...f, actual_delivery_date: e.target.value }))}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Notes" multiline rows={2} value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveDelivery}>Update</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={5000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snackbar.severity} variant="filled"
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Delivery;