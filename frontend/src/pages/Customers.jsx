import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Typography, Paper, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid,
  IconButton, Tooltip, Alert, Snackbar, Box
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ReceiptIcon from "@mui/icons-material/Receipt";

const API = import.meta.env.VITE_API_URL || "/api";

const EMPTY_FORM = {
  shop_name: "",
  owner: "",
  phone: "",
  address: "",
  route: "",
  gstin: "",
};

function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Snackbar
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const showSnack = (msg, sev = "success") => setSnack({ open: true, msg, sev });

  const loadCustomers = useCallback(() => {
    setLoading(true);
    axios
      .get(`${API}/customers`)
      .then((response) => {
        setCustomers(response.data.customers || []);
      })
      .catch((error) => {
        console.error(error);
        showSnack("Failed to load customers", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = customers.filter((customer) => {
    const q = search.toLowerCase();
    return (
      customer.shop_name.toLowerCase().includes(q) ||
      (customer.owner && customer.owner.toLowerCase().includes(q)) ||
      (customer.phone && customer.phone.includes(q)) ||
      (customer.gstin && customer.gstin.toLowerCase().includes(q))
    );
  });

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (c) => {
    setEditId(c.id);
    setForm({
      shop_name: c.shop_name || "",
      owner: c.owner || "",
      phone: c.phone || "",
      address: c.address || "",
      route: c.route || "",
      gstin: c.gstin || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.shop_name.trim()) {
      return showSnack("Shop Name is required", "error");
    }
    setSaving(true);
    try {
      if (editId) {
        await axios.put(`${API}/customers/${editId}`, form);
        showSnack("Customer updated successfully");
      } else {
        await axios.post(`${API}/customers`, form);
        showSnack("Customer added successfully");
      }
      setDialogOpen(false);
      loadCustomers();
    } catch (e) {
      showSnack(e.response?.data?.detail || "Error saving customer", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} mb={2} gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Customers
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Total Customers: {filteredCustomers.length}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} sx={{ borderRadius: 2 }}>
          Add Customer
        </Button>
      </Stack>

      <TextField
        fullWidth
        placeholder="Search by shop name, owner, phone, GSTIN..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#1565C0" }}>
              <TableCell sx={{ color: "white", fontWeight: 700 }}>S.No</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 700 }}>Shop Name</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 700 }}>Owner / Contact</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 700 }}>Address</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 700 }}>GSTIN</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 700 }}>Outstanding</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3, color: "text.secondary" }}>
                  {loading ? "Loading customers..." : "No customers found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer, index) => (
                <TableRow key={customer.id} sx={{ bgcolor: index % 2 === 0 ? "white" : "#FAFAFA" }}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#1565C0" }}>
                    {customer.shop_name}
                  </TableCell>
                  <TableCell>
                    {customer.owner || "—"}
                    {customer.phone && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {customer.phone}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, fontSize: 12 }}>
                    {customer.address || "—"}
                  </TableCell>
                  <TableCell sx={{ fontWeight: customer.gstin ? 600 : "normal" }}>
                    {customer.gstin || "—"}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: (customer.balance || 0) > 0 ? "error.main" : "text.primary" }}>
                    ₹{Number(customer.balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Chip label="Active" color="success" size="small" />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" gap={0.5}>
                      <Tooltip title="Edit Customer">
                        <IconButton size="small" color="primary" onClick={() => openEdit(customer)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Invoices">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => navigate(`/billing?search=${encodeURIComponent(customer.shop_name)}`)}
                        >
                          <ReceiptIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Customer Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1565C0", color: "white" }}>
          {editId ? "Edit Customer Details" : "Add New Customer"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Shop Name *"
                value={form.shop_name}
                onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Owner Name"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Business Address"
                multiline
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Route / Area"
                value={form.route}
                onChange={(e) => setForm({ ...form, route: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GSTIN (Tax ID)"
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                placeholder="e.g. 36AABCU9603R1ZM"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Customer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} variant="filled" onClose={() => setSnack({ ...snack, open: false })}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Customers;