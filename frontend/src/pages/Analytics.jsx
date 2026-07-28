import { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography, Box, Grid, Card, CardContent, Stack, CircularProgress,
  Divider, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Chip, Alert,
} from "@mui/material";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";

const API = "/api";

const COLORS = ["#1976d2", "#2e7d32", "#e65100", "#6a1b9a", "#c62828", "#00838f", "#f57f17", "#4a148c", "#1b5e20", "#b71c1c"];

function KpiCard({ title, value, color, icon, sub }) {
  return (
    <Card elevation={3} sx={{ borderRadius: 3, borderLeft: `5px solid ${color}`, height: "100%" }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, color }}>{value}</Typography>
            {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
          </Box>
          <Box sx={{ color, fontSize: 40, opacity: 0.8 }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API}/analytics`)
      .then(res => setData(res.data))
      .catch(() => setError("Failed to load analytics. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress size={60} /></Box>;
  if (error) return <Box p={3}><Alert severity="error">{error}</Alert></Box>;
  if (!data) return null;

  const { kpis, monthly_revenue, top_customers, top_products, slow_products } = data;
  const noOrders = kpis.total_orders === 0;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>Analytics Dashboard</Typography>

      {noOrders && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No orders yet. Add orders to see real analytics data. Charts will populate automatically.
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Total Revenue" value={fmt(kpis.total_revenue)} color="#2e7d32" icon={<TrendingUpIcon fontSize="inherit" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Total Orders" value={kpis.total_orders} color="#1976d2" icon={<ShoppingCartIcon fontSize="inherit" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Avg Order Value" value={fmt(kpis.avg_order_value)} color="#e65100" icon={<TrendingUpIcon fontSize="inherit" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Inventory Value" value={fmt(kpis.inventory_value)} color="#6a1b9a" icon={<InventoryIcon fontSize="inherit" />} />
        </Grid>
      </Grid>

      {/* Revenue Chart */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>📈 Monthly Revenue Trend</Typography>
        {monthly_revenue.length === 0 ? (
          <Box textAlign="center" py={4} color="text.secondary">No order data yet. Revenue chart will appear here.</Box>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthly_revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#1976d2" strokeWidth={2.5} dot={{ r: 4 }} name="Revenue (₹)" />
              <Line type="monotone" dataKey="orders" stroke="#e65100" strokeWidth={2} dot={{ r: 3 }} name="Orders" yAxisId={0} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Paper>

      <Grid container spacing={3} mb={3}>
        {/* Top Customers */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} mb={2}>🏆 Top Customers by Revenue</Typography>
            {top_customers.length === 0 ? (
              <Box textAlign="center" py={4} color="text.secondary">No data yet.</Box>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={top_customers} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="shop_name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="total" fill="#1976d2" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} mb={2}>🔥 Top Products by Units Sold</Typography>
            {top_products.length === 0 ? (
              <Box textAlign="center" py={4} color="text.secondary">No data yet.</Box>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={top_products} margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total_sold" fill="#2e7d32" radius={[4, 4, 0, 0]} name="Units Sold" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Product Distribution Pie */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>🍕 Revenue by Top Products</Typography>
            {top_products.length === 0 ? (
              <Box textAlign="center" py={4} color="text.secondary">No data yet.</Box>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={top_products.slice(0, 6)} dataKey="revenue" nameKey="name"
                    cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name.substring(0, 10)}… ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}>
                    {top_products.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Slow Moving Products */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>🐌 Slow Moving Products</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Stock</TableCell>
                    <TableCell align="right">Total Sold</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {slow_products.map((p, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{p.name}</TableCell>
                      <TableCell align="right">{p.stock}</TableCell>
                      <TableCell align="right">{p.total_sold}</TableCell>
                      <TableCell>
                        {p.total_sold === 0 ? <Chip label="No Sales" color="error" size="small" /> :
                          p.total_sold < 5 ? <Chip label="Very Slow" color="warning" size="small" /> :
                            <Chip label="Slow" size="small" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Analytics;