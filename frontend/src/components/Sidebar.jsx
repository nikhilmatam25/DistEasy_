import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaymentsIcon from "@mui/icons-material/Payments";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BarChartIcon from "@mui/icons-material/BarChart";
import PsychologyIcon from "@mui/icons-material/Psychology";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SettingsIcon from "@mui/icons-material/Settings";

import { Link } from "react-router-dom";

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { text: "Inventory", icon: <InventoryIcon />, path: "/inventory" },
  { text: "Customers", icon: <PeopleIcon />, path: "/customers" },
  { text: "Orders", icon: <ShoppingCartIcon />, path: "/orders" },
  { text: "Payments", icon: <PaymentsIcon />, path: "/payments" },
  { text: "Reports", icon: <AssessmentIcon />, path: "/reports" },
  { text: "Analytics", icon: <BarChartIcon />, path: "/analytics" },
  {
    text: "Stock Predictor",
    icon: <PsychologyIcon />,
    path: "/stockpredictor",
  },
  { text: "Delivery", icon: <LocalShippingIcon />, path: "/delivery" },
  { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" fontWeight="bold">
          DistEasy
        </Typography>
      </Toolbar>

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>

              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;