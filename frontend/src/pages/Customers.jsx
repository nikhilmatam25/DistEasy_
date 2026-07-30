import { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography, Paper, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip,
} from "@mui/material";

const API = import.meta.env.VITE_API_URL || "/api";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get(`${API}/customers`)
      .then((response) => {
        setCustomers(response.data.customers);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const filteredCustomers = customers.filter((customer) =>
    customer.shop_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 30 }}>
      <Typography variant="h4" gutterBottom>
        Customers
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Total Customers: {filteredCustomers.length}
      </Typography>

      <TextField
        fullWidth
        placeholder="Search Customer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>S.No</TableCell>
              <TableCell>Shop Name</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.map((customer, index) => (
              <TableRow key={customer.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{customer.shop_name}</TableCell>
                <TableCell>
                  <Chip label="Active" color="success" size="small" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default Customers;