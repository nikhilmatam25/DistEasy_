import { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography, Paper, Button, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip,
  Avatar, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";

const API = import.meta.env.VITE_API_URL || "/api";

function Inventory() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  // Edit Stock Dialog
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stock, setStock] = useState("");

  // Add Product Dialog
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [newStock, setNewStock] = useState("");

  const loadProducts = () => {
    axios
      .get(`${API}/products`)
      .then((response) => {
        setProducts(response.data.products);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setStock(product.stock);
    setOpen(true);
  };

  const handleSave = () => {
    axios
      .put(`${API}/products/${selectedProduct.id}/stock?stock=${stock}`)
      .then(() => {
        setOpen(false);
        loadProducts();
      });
  };

  const handleAddProduct = () => {
    axios
      .post(`${API}/products?name=${encodeURIComponent(name)}&price=${price}&stock=${newStock}`)
      .then(() => {
        setAddOpen(false);
        setName("");
        setPrice("");
        setNewStock("");
        loadProducts();
      })
      .catch((err) => console.error(err));
  };

  return (
    <div style={{ padding: 30 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Inventory</Typography>
        <Button variant="contained" onClick={() => setAddOpen(true)}>Add Product</Button>
      </Stack>

      <TextField
        fullWidth
        placeholder="Search Product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Avatar>{product.name.charAt(0)}</Avatar>
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>₹{product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  {product.stock < 20 ? (
                    <Chip label="Low Stock" color="error" />
                  ) : (
                    <Chip label="In Stock" color="success" />
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="contained" size="small" onClick={() => handleEdit(product)}>
                    Edit Stock
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Stock Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Update Stock</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>{selectedProduct?.name}</Typography>
          <TextField
            label="Stock"
            type="number"
            fullWidth
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
        <DialogTitle>Add Product</DialogTitle>
        <DialogContent>
          <TextField label="Product Name" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Price" type="number" fullWidth margin="normal" value={price} onChange={(e) => setPrice(e.target.value)} />
          <TextField label="Stock" type="number" fullWidth margin="normal" value={newStock} onChange={(e) => setNewStock(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddProduct}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Inventory;