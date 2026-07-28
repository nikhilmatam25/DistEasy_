import { useEffect, useState } from "react";
import axios from "axios";

import {
  Typography,
  Paper,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Button,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  Snackbar,
  CircularProgress,
  Box,
  Chip,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import SaveIcon from "@mui/icons-material/Save";

const API = "/api";


function Orders() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Selected customer ID (integer or "" when nothing is selected)
  const [customerId, setCustomerId] = useState("");

  // Each item: { product_id: number|"", quantity: number }
  const [items, setItems] = useState([{ product_id: "", quantity: 1 }]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // "success" | "error" | "warning"
  });
  const [validationError, setValidationError] = useState("");

  // -------------------------------------------------------
  // Load customers and products on mount
  // -------------------------------------------------------
  useEffect(() => {
    axios
      .get(`${API}/customers`)
      .then((res) => setCustomers(res.data.customers || []))
      .catch(() =>
        showSnackbar("Failed to load customers. Is the backend running?", "error")
      );

    axios
      .get(`${API}/products`)
      .then((res) => setProducts(res.data.products || []))
      .catch(() =>
        showSnackbar("Failed to load products. Is the backend running?", "error")
      );
  }, []);

  // -------------------------------------------------------
  // Helpers
  // -------------------------------------------------------
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Find a product object by its id
  const findProduct = (id) => products.find((p) => p.id === id);

  // -------------------------------------------------------
  // Item row handlers
  // -------------------------------------------------------
  const handleProductChange = (index, value) => {
    const newItems = [...items];
    // value is the product.id (integer, from MenuItem value)
    newItems[index] = { ...newItems[index], product_id: value };
    setItems(newItems);
    setValidationError("");
  };

  const handleQuantityChange = (index, value) => {
    const newItems = [...items];
    // Parse to integer; default to 1 if invalid
    const qty = parseInt(value, 10);
    newItems[index] = {
      ...newItems[index],
      quantity: isNaN(qty) ? 1 : qty,
    };
    setItems(newItems);
    setValidationError("");
  };

  const addRow = () => {
    setItems([...items, { product_id: "", quantity: 1 }]);
  };

  const removeRow = (index) => {
    if (items.length === 1) {
      showSnackbar("Order must have at least one product.", "warning");
      return;
    }
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // -------------------------------------------------------
  // Computed: order total preview
  // -------------------------------------------------------
  const computedTotal = items.reduce((sum, item) => {
    const product = findProduct(item.product_id);
    if (!product || !item.quantity || item.quantity <= 0) return sum;
    return sum + product.price * item.quantity;
  }, 0);

  // -------------------------------------------------------
  // Validation before save
  // -------------------------------------------------------
  const validate = () => {
    if (!customerId) {
      setValidationError("Please select a customer.");
      return false;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (!item.product_id) {
        setValidationError(`Row ${i + 1}: Please select a product.`);
        return false;
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        setValidationError(`Row ${i + 1}: Quantity must be a positive number.`);
        return false;
      }

      const product = findProduct(item.product_id);
      if (product && item.quantity > product.stock) {
        setValidationError(
          `Row ${i + 1}: "${product.name}" only has ${product.stock} units in stock.`
        );
        return false;
      }
    }

    // Check for duplicate products
    const productIds = items.map((i) => i.product_id);
    const unique = new Set(productIds);
    if (unique.size !== productIds.length) {
      setValidationError(
        "Duplicate products detected. Each product should appear only once."
      );
      return false;
    }

    setValidationError("");
    return true;
  };

  // -------------------------------------------------------
  // Save Order
  // -------------------------------------------------------
  const saveOrder = async () => {
    if (!validate()) return;
    if (isLoading) return; // prevent duplicate requests

    setIsLoading(true);

    try {
      const payload = {
        customer_id: parseInt(customerId, 10), // ensure integer
        items: items.map((item) => ({
          product_id: parseInt(item.product_id, 10), // ensure integer
          quantity: parseInt(item.quantity, 10),      // ensure integer
        })),
      };

      const response = await axios.post(`${API}/orders`, payload);

      const data = response.data;
      showSnackbar(
        `✅ Order #${data.order_id} saved! Total: ₹${data.total_amount?.toFixed(2)}`,
        "success"
      );

      // Reset form
      setCustomerId("");
      setItems([{ product_id: "", quantity: 1 }]);
      setValidationError("");

      // Refresh product list so stock is updated in the UI
      axios
        .get(`${API}/products`)
        .then((res) => setProducts(res.data.products || []));
    } catch (error) {
      const detail =
        error.response?.data?.detail ||
        error.message ||
        "Unknown error occurred";
      showSnackbar(`❌ Failed to save order: ${detail}`, "error");
      console.error("Save Order Error:", error.response?.data || error);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <div style={{ padding: 30 }}>
      <Typography variant="h4" mb={3} fontWeight={700}>
        New Order
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>

          {/* Customer Selector */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!customerId && !!validationError}>
              <InputLabel id="customer-label">Customer *</InputLabel>
              <Select
                labelId="customer-label"
                value={customerId}
                label="Customer *"
                onChange={(e) => {
                  setCustomerId(e.target.value);
                  setValidationError("");
                }}
              >
                {customers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.shop_name} {c.owner ? `— ${c.owner}` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Total preview */}
          <Grid item xs={12} md={6} display="flex" alignItems="center">
            {computedTotal > 0 && (
              <Chip
                label={`Estimated Total: ₹${computedTotal.toFixed(2)}`}
                color="primary"
                variant="outlined"
                sx={{ fontSize: 16, px: 2, py: 1 }}
              />
            )}
          </Grid>

          {/* Validation Error */}
          {validationError && (
            <Grid item xs={12}>
              <Alert severity="warning" onClose={() => setValidationError("")}>
                {validationError}
              </Alert>
            </Grid>
          )}

          {/* Products Table */}
          <Grid item xs={12}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell><strong>Product</strong></TableCell>
                  <TableCell width={180}><strong>Quantity</strong></TableCell>
                  <TableCell width={120}><strong>Unit Price</strong></TableCell>
                  <TableCell width={120}><strong>Subtotal</strong></TableCell>
                  <TableCell width={80}><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => {
                  const product = findProduct(item.product_id);
                  const subtotal =
                    product && item.quantity > 0
                      ? product.price * item.quantity
                      : 0;

                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={item.product_id}
                            displayEmpty
                            onChange={(e) =>
                              handleProductChange(index, e.target.value)
                            }
                            renderValue={(selected) => {
                              if (!selected) return <em>Select product…</em>;
                              const p = findProduct(selected);
                              return p ? p.name : selected;
                            }}
                          >
                            <MenuItem value="" disabled>
                              <em>Select product…</em>
                            </MenuItem>
                            {products.map((p) => (
                              <MenuItem
                                key={p.id}
                                value={p.id}
                                disabled={p.stock === 0}
                              >
                                {p.name}
                                <Typography
                                  variant="caption"
                                  sx={{ ml: 1, color: p.stock < 10 ? "error.main" : "text.secondary" }}
                                >
                                  (Stock: {p.stock})
                                </Typography>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>

                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          fullWidth
                          value={item.quantity}
                          inputProps={{ min: 1, max: product?.stock ?? 9999 }}
                          onChange={(e) =>
                            handleQuantityChange(index, e.target.value)
                          }
                        />
                      </TableCell>

                      <TableCell>
                        {product ? `₹${product.price.toFixed(2)}` : "—"}
                      </TableCell>

                      <TableCell>
                        {subtotal > 0 ? `₹${subtotal.toFixed(2)}` : "—"}
                      </TableCell>

                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => removeRow(index)}
                          disabled={isLoading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Grid>

          {/* Add Product Row Button */}
          <Grid item xs={12}>
            <Button
              variant="outlined"
              startIcon={<AddShoppingCartIcon />}
              onClick={addRow}
              disabled={isLoading}
            >
              Add Product
            </Button>
          </Grid>

          {/* Save Order Button */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                id="save-order-btn"
                variant="contained"
                color="primary"
                size="large"
                startIcon={
                  isLoading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                onClick={saveOrder}
                disabled={isLoading}
              >
                {isLoading ? "Saving…" : "Save Order"}
              </Button>
            </Box>
          </Grid>

        </Grid>
      </Paper>

      {/* Success / Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Orders;