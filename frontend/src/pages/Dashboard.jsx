import { useEffect, useState } from "react";
import axios from "axios";
import { Grid, Paper, Typography } from "@mui/material";

const API = "/api";

function Dashboard() {
  const [data, setData] = useState({
    total_products: 0,
    total_stock: 0,
    stock_value: 0,
    low_stock: 0,
  });

  useEffect(() => {
    axios
      .get(`${API}/dashboard`)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const cards = [
    { title: "Total Products", value: data.total_products },
    { title: "Total Stock Units", value: data.total_stock },
    { title: "Stock Value", value: `₹${data.stock_value}` },
    { title: "Low Stock", value: data.low_stock },
  ];

  return (
    <div style={{ padding: 30 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={3}
              style={{ padding: 25, borderRadius: 15, textAlign: "center" }}
            >
              <Typography variant="subtitle1" color="text.secondary">
                {card.title}
              </Typography>
              <Typography variant="h4" sx={{ mt: 2 }}>
                {card.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default Dashboard;