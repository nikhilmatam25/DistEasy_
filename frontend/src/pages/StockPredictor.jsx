import { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography, Box, Grid, Paper, Card, CardContent, Stack,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Chip, CircularProgress, TextField, InputAdornment, Alert,
  LinearProgress, Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const API = "/api";


function ConfidenceBadge({ level }) {
  const map = { High: "success", Medium: "warning", Low: "default" };
  return <Chip label={level} color={map[level] || "default"} size="small" />;
}

function MovementChip({ movement }) {
  const map = {
    "Fast Moving": { color: "success", icon: <TrendingUpIcon sx={{ fontSize: 14 }} /> },
    "Normal": { color: "primary", icon: null },
    "Slow Moving": { color: "warning", icon: <TrendingDownIcon sx={{ fontSize: 14 }} /> },
    "No Sales": { color: "default", icon: null },
  };
  const cfg = map[movement] || { color: "default" };
  return <Chip label={movement} color={cfg.color} size="small" icon={cfg.icon} />;
}

function StockPredictor() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    axios.get(`${API}/stock-predictor`)
      .then(res => setPredictions(res.data.predictions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = predictions.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ? true :
      filter === "urgent" ? p.low_stock_warning :
      filter === "fast" ? p.movement === "Fast Moving" :
      filter === "slow" ? p.movement === "Slow Moving" :
      filter === "nosales" ? p.movement === "No Sales" : true;
    return matchSearch && matchFilter;
  });

  const urgentCount = predictions.filter(p => p.low_stock_warning).length;
  const fastCount = predictions.filter(p => p.movement === "Fast Moving").length;
  const slowCount = predictions.filter(p => p.movement === "Slow Moving").length;
  const noSalesCount = predictions.filter(p => p.movement === "No Sales").length;

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress size={60} /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={1}>🧠 Stock Predictor</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        AI-powered demand prediction based on historical order data. Predictions improve as more orders are placed.
      </Typography>

      {predictions.length > 0 && predictions[0].months_of_data === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Limited data:</strong> No historical orders found. Add orders to enable accurate predictions. Currently showing baseline analysis.
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: "⚠️ Need Reorder", value: urgentCount, color: "#c62828", filter: "urgent" },
          { label: "🔥 Fast Moving", value: fastCount, color: "#2e7d32", filter: "fast" },
          { label: "🐌 Slow Moving", value: slowCount, color: "#e65100", filter: "slow" },
          { label: "💤 No Sales", value: noSalesCount, color: "#757575", filter: "nosales" },
        ].map(c => (
          <Grid item xs={6} md={3} key={c.filter}>
            <Card elevation={2} sx={{ borderRadius: 3, cursor: "pointer", borderTop: `4px solid ${c.color}`,
              bgcolor: filter === c.filter ? "#f5f5f5" : "white" }}
              onClick={() => setFilter(filter === c.filter ? "all" : c.filter)}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: c.color }}>{c.value}</Typography>
                <Typography variant="caption">{c.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <TextField fullWidth size="small" placeholder="Search product..." value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
      </Paper>

      {/* Predictions Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#1976d2" }}>
            <TableRow>
              {["Product", "Current Stock", "Avg Monthly", "Predicted Demand", "Suggested Order", "Expected Remaining", "Movement", "Confidence", "Recommendation"].map(h => (
                <TableCell key={h} sx={{ color: "white", fontWeight: 700, whiteSpace: "nowrap" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6 }}>No products match your filter.</TableCell></TableRow>
            ) : filtered.map((p) => {
              const stockPct = p.predicted_demand > 0 ? Math.min(100, (p.current_stock / p.predicted_demand) * 100) : 100;
              const rowColor = p.current_stock === 0 ? "#ffebee" : p.low_stock_warning ? "#fff8e1" : "inherit";
              return (
                <TableRow key={p.product_id} hover sx={{ bgcolor: rowColor }}>
                  <TableCell sx={{ fontWeight: 600, maxWidth: 180 }}>
                    <Tooltip title={p.name}>
                      <span>{p.name.length > 25 ? p.name.substring(0, 25) + "…" : p.name}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Stack alignItems="center" spacing={0.5}>
                      <Typography variant="body2" fontWeight={700}
                        sx={{ color: p.current_stock === 0 ? "error.main" : p.low_stock_warning ? "warning.main" : "inherit" }}>
                        {p.current_stock}
                      </Typography>
                      <LinearProgress variant="determinate" value={stockPct}
                        sx={{ width: 60, height: 4, borderRadius: 2,
                          "& .MuiLinearProgress-bar": { bgcolor: stockPct < 30 ? "error.main" : stockPct < 70 ? "warning.main" : "success.main" } }} />
                    </Stack>
                  </TableCell>
                  <TableCell align="center">{p.avg_monthly_sales}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>{p.predicted_demand}</TableCell>
                  <TableCell align="center">
                    {p.suggested_order_qty > 0 ? (
                      <Chip label={`Order ${p.suggested_order_qty}`} color="error" size="small" />
                    ) : (
                      <Chip label="Sufficient" color="success" size="small" icon={<CheckCircleIcon sx={{ fontSize: 14 }} />} />
                    )}
                  </TableCell>
                  <TableCell align="center" sx={{ color: p.expected_remaining < 0 ? "error.main" : "inherit" }}>
                    {p.expected_remaining < 0 ? `Deficit: ${Math.abs(p.expected_remaining)}` : p.expected_remaining}
                  </TableCell>
                  <TableCell><MovementChip movement={p.movement} /></TableCell>
                  <TableCell><ConfidenceBadge level={p.confidence} /></TableCell>
                  <TableCell sx={{ maxWidth: 200, fontSize: 12 }}>
                    {p.low_stock_warning && <WarningIcon sx={{ fontSize: 14, color: "warning.main", mr: 0.5 }} />}
                    {p.recommendation}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
        * Predictions are based on {predictions[0]?.months_of_data || 0} months of historical data. Accuracy improves with more orders.
      </Typography>
    </Box>
  );
}

export default StockPredictor;