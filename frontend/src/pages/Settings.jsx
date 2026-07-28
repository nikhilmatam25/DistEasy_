import { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography, Box, Grid, Paper, Stack, TextField, Button,
  Divider, CircularProgress, Alert, Snackbar, Card, CardContent,
  CardHeader, InputAdornment,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SaveIcon from "@mui/icons-material/Save";
import InfoIcon from "@mui/icons-material/Info";

const API = "/api";


function Settings() {
  const [settings, setSettings] = useState({
    company_name: "", phone: "", email: "", address: "", gst_number: "", theme: "light"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showSnack = (message, severity = "success") => setSnackbar({ open: true, message, severity });

  useEffect(() => {
    axios.get(`${API}/settings`)
      .then(res => setSettings(res.data))
      .catch(() => showSnack("Failed to load settings", "error"))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/settings`, settings);
      showSnack("Settings saved successfully!");
    } catch (e) {
      showSnack(e.response?.data?.detail || "Error saving settings", "error");
    } finally { setSaving(false); }
  };

  const set = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3, maxWidth: 900 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>⚙️ Settings</Typography>

      {/* Company Information */}
      <Card elevation={2} sx={{ borderRadius: 3, mb: 3 }}>
        <CardHeader
          avatar={<BusinessIcon color="primary" />}
          title={<Typography variant="h6" fontWeight={700}>Company Information</Typography>}
          subheader="Your distributor business details"
          sx={{ borderBottom: "1px solid #eee", pb: 2 }}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Company Name" value={settings.company_name || ""}
                onChange={e => set("company_name", e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon color="action" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Phone Number" value={settings.phone || ""}
                onChange={e => set("phone", e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon color="action" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email Address" type="email" value={settings.email || ""}
                onChange={e => set("email", e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="GST Number" value={settings.gst_number || ""}
                onChange={e => set("gst_number", e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><ReceiptIcon color="action" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Business Address" multiline rows={2} value={settings.address || ""}
                onChange={e => set("address", e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon color="action" /></InputAdornment> }} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Database Info */}
      <Card elevation={2} sx={{ borderRadius: 3, mb: 3 }}>
        <CardHeader
          avatar={<InfoIcon color="primary" />}
          title={<Typography variant="h6" fontWeight={700}>Database Information</Typography>}
          subheader="Read-only system information"
          sx={{ borderBottom: "1px solid #eee", pb: 2 }}
        />
        <CardContent>
          <Grid container spacing={2}>
            {[
              { label: "Database", value: "SQLite (disteasy.db)" },
              { label: "Backend", value: "FastAPI — Python 3.13" },
              { label: "Frontend", value: "React 19 + Material UI v9" },
              { label: "Backend URL", value: API },
              { label: "Frontend URL", value: "http://localhost:5173" },
              { label: "Version", value: "DistEasy v1.0" },
            ].map(info => (
              <Grid item xs={12} md={6} key={info.label}>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "#f5f5f5" }}>
                  <Typography variant="caption" color="text.secondary">{info.label}</Typography>
                  <Typography variant="body1" fontWeight={600}>{info.value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* About */}
      <Card elevation={2} sx={{ borderRadius: 3, mb: 3 }}>
        <CardHeader
          avatar={<InfoIcon color="primary" />}
          title={<Typography variant="h6" fontWeight={700}>About DistEasy</Typography>}
          sx={{ borderBottom: "1px solid #eee", pb: 2 }}
        />
        <CardContent>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            <strong>DistEasy</strong> is a complete distribution business management system built for modern distributors.
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={1}>
            {[
              "📦 Inventory Management",
              "👥 Customer Management",
              "🛒 Order Processing",
              "💰 Payment Tracking",
              "📊 Sales Reports",
              "📈 Analytics Dashboard",
              "🧠 Stock Predictor (AI)",
              "🚚 Delivery Management",
            ].map(f => (
              <Grid item xs={12} md={6} key={f}>
                <Typography variant="body2">• {f}</Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box>
        <Button
          variant="contained" size="large" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
          onClick={save} disabled={saving}
          sx={{ px: 4, py: 1.5, borderRadius: 2 }}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </Box>

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

export default Settings;