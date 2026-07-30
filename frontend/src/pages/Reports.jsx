import { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography, Box, Grid, Paper, Button, TextField, FormControl,
  InputLabel, Select, MenuItem, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Chip, CircularProgress,
  Stack, Card, CardContent, Divider, Alert,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import WarningIcon from "@mui/icons-material/Warning";

const API = import.meta.env.VITE_API_URL || "/api";


const today = () => new Date().toISOString().split("T")[0];
const monthAgo = () => {
  const d = new Date(); d.setMonth(d.getMonth() - 1);
  return d.toISOString().split("T")[0];
};

function StatCard({ title, value, color = "#1976d2", icon }) {
  return (
    <Card elevation={2} sx={{ borderRadius: 3, borderTop: `4px solid ${color}` }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <Box sx={{ color }}>{icon}</Box>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
        </Stack>
        <Typography variant="h5" fontWeight={700}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

function Reports() {
  const [tab, setTab] = useState("sales");
  const [period, setPeriod] = useState("monthly");
  const [dateFrom, setDateFrom] = useState(monthAgo());
  const [dateTo, setDateTo] = useState(today());
  const [salesData, setSalesData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [outstandingData, setOutstandingData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const load = () => {
    setLoading(true);
    const promises = [];

    if (tab === "sales" || tab === "daily" || tab === "weekly" || tab === "monthly" || tab === "yearly") {
      promises.push(axios.get(`${API}/reports/sales?period=${period}&date_from=${dateFrom}&date_to=${dateTo}`).then(r => setSalesData(r.data)));
    }
    if (tab === "products") {
      promises.push(axios.get(`${API}/reports/products`).then(r => setProductData(r.data)));
    }
    if (tab === "customers") {
      promises.push(axios.get(`${API}/reports/customers`).then(r => setCustomerData(r.data)));
    }
    if (tab === "outstanding") {
      promises.push(axios.get(`${API}/reports/outstanding`).then(r => setOutstandingData(r.data)));
    }
    if (tab === "inventory") {
      promises.push(axios.get(`${API}/reports/inventory`).then(r => setInventoryData(r.data)));
    }

    Promise.all(promises).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [tab, period, dateFrom, dateTo]);

  const handlePrint = () => window.print();

  const exportCSV = (rows, filename) => {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]).join(",");
    const csvContent = [headers, ...rows.map(r => Object.values(r).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  };

  const tabs = [
    { key: "sales", label: "Sales Report" },
    { key: "products", label: "Product Report" },
    { key: "customers", label: "Customer Report" },
    { key: "outstanding", label: "Outstanding" },
    { key: "inventory", label: "Inventory" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Reports</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print</Button>
          <Button variant="outlined" startIcon={<DownloadIcon />}
            onClick={() => {
              const data = tab === "sales" ? salesData?.sales : tab === "products" ? productData?.products :
                tab === "customers" ? customerData?.customers : tab === "outstanding" ? outstandingData?.customers :
                  inventoryData?.products;
              exportCSV(data, `${tab}_report.csv`);
            }}>
            Export CSV
          </Button>
        </Stack>
      </Stack>

      {/* Tab Navigation */}
      <Stack direction="row" spacing={1} mb={3} flexWrap="wrap" gap={1}>
        {tabs.map(t => (
          <Button key={t.key} variant={tab === t.key ? "contained" : "outlined"}
            onClick={() => setTab(t.key)} size="small">
            {t.label}
          </Button>
        ))}
      </Stack>

      {/* Filters for sales */}
      {tab === "sales" && (
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Period</InputLabel>
                <Select value={period} label="Period" onChange={e => setPeriod(e.target.value)}>
                  {["daily", "weekly", "monthly", "yearly"].map(p => (
                    <MenuItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" label="From Date" type="date"
                value={dateFrom} onChange={e => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" label="To Date" type="date"
                value={dateTo} onChange={e => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </Paper>
      )}

      {loading && <Box textAlign="center" py={8}><CircularProgress size={48} /></Box>}

      {/* Sales Report */}
      {!loading && tab === "sales" && salesData && (
        <Box>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={4}>
              <StatCard title="Total Orders" value={salesData.summary?.total_orders || 0} color="#1976d2" icon={<TrendingUpIcon />} />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard title="Total Revenue" value={fmt(salesData.summary?.total_revenue)} color="#2e7d32" icon={<TrendingUpIcon />} />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard title="Avg per Period" value={fmt((salesData.summary?.total_revenue || 0) / (salesData.sales?.length || 1))} color="#e65100" icon={<TrendingUpIcon />} />
            </Grid>
          </Grid>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>Period</TableCell>
                  <TableCell align="right">Orders</TableCell>
                  <TableCell align="right">Total Sales</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salesData.sales?.length === 0 ? (
                  <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4 }}>No data for selected period</TableCell></TableRow>
                ) : salesData.sales?.map((row, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{row.period}</TableCell>
                    <TableCell align="right">{row.order_count}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: "green" }}>{fmt(row.total_sales)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Product Report */}
      {!loading && tab === "products" && productData && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Product</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="right">Units Sold</TableCell>
                <TableCell align="right">Revenue</TableCell>
                <TableCell align="right">Orders</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productData.products?.map((p, i) => (
                <TableRow key={p.id} hover>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell align="right">{fmt(p.price)}</TableCell>
                  <TableCell align="right">{p.stock}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{p.total_sold}</TableCell>
                  <TableCell align="right" sx={{ color: "green", fontWeight: 600 }}>{fmt(p.total_revenue)}</TableCell>
                  <TableCell align="right">{p.order_count}</TableCell>
                  <TableCell>
                    {p.stock === 0 ? <Chip label="Out" color="error" size="small" /> :
                      p.stock < 20 ? <Chip label="Low" color="warning" size="small" /> :
                        <Chip label="OK" color="success" size="small" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Customer Report */}
      {!loading && tab === "customers" && customerData && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Route</TableCell>
                <TableCell align="right">Total Orders</TableCell>
                <TableCell align="right">Total Purchases</TableCell>
                <TableCell align="right">Total Paid</TableCell>
                <TableCell align="right">Outstanding</TableCell>
                <TableCell>Last Order</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customerData.customers?.map((c, i) => (
                <TableRow key={c.id} hover>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell><strong>{c.shop_name}</strong><br /><small>{c.owner}</small></TableCell>
                  <TableCell>{c.route || "—"}</TableCell>
                  <TableCell align="right">{c.total_orders}</TableCell>
                  <TableCell align="right">{fmt(c.total_purchases)}</TableCell>
                  <TableCell align="right" sx={{ color: "green" }}>{fmt(c.total_paid)}</TableCell>
                  <TableCell align="right">
                    {c.balance_status === "Advance" ? (
                      <span style={{ color: "#1565c0", fontWeight: 700 }}>
                        Advance {fmt(Math.abs(c.outstanding))}
                      </span>
                    ) : c.balance_status === "Settled" ? (
                      <span style={{ color: "#2e7d32", fontWeight: 600 }}>Settled</span>
                    ) : (
                      <span style={{ color: "#c62828", fontWeight: 700 }}>
                        Due {fmt(c.outstanding)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{c.last_order_date || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Outstanding Report */}
      {!loading && tab === "outstanding" && outstandingData && (
        <Box>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Total Outstanding: <strong>{fmt(outstandingData.total_outstanding)}</strong> from {outstandingData.customers?.length} customers
          </Alert>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#fff3e0" }}>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell align="right">Outstanding</TableCell>
                  <TableCell align="right">Orders</TableCell>
                  <TableCell>Last Order</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {outstandingData.customers?.map((c, i) => (
                  <TableRow key={c.id} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell><strong>{c.shop_name}</strong><br /><small>{c.owner}</small></TableCell>
                    <TableCell>{c.phone || "—"}</TableCell>
                    <TableCell>{c.route || "—"}</TableCell>
                    <TableCell align="right" sx={{ color: "error.main", fontWeight: 700 }}>{fmt(c.outstanding)}</TableCell>
                    <TableCell align="right">{c.total_orders}</TableCell>
                    <TableCell>{c.last_order_date || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Inventory Report */}
      {!loading && tab === "inventory" && inventoryData && (
        <Box>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={4}>
              <StatCard title="Total Stock Value" value={fmt(inventoryData.total_value)} color="#1976d2" icon={<InventoryIcon />} />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard title="Low Stock Items" value={inventoryData.low_stock_count} color="#e65100" icon={<WarningIcon />} />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard title="Out of Stock" value={inventoryData.out_of_stock_count} color="#c62828" icon={<WarningIcon />} />
            </Grid>
          </Grid>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell align="right">Stock Value</TableCell>
                  <TableCell align="right">Total Sold</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryData.products?.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.name}</TableCell>
                    <TableCell align="right">{fmt(p.price)}</TableCell>
                    <TableCell align="right">{p.stock}</TableCell>
                    <TableCell align="right">{fmt(p.stock_value)}</TableCell>
                    <TableCell align="right">{p.total_sold}</TableCell>
                    <TableCell>
                      {p.stock === 0 ? <Chip label="Out of Stock" color="error" size="small" /> :
                        p.stock < 20 ? <Chip label="Low Stock" color="warning" size="small" /> :
                          <Chip label="In Stock" color="success" size="small" />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}

export default Reports;