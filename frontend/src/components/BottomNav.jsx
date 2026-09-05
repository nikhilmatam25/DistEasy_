import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PaymentsIcon from "@mui/icons-material/Payments";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BarChartIcon from "@mui/icons-material/BarChart";
import PsychologyIcon from "@mui/icons-material/Psychology";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SettingsIcon from "@mui/icons-material/Settings";

const PRIMARY_TABS = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { label: "Inventory", icon: <InventoryIcon />,  path: "/inventory" },
  { label: "Orders",    icon: <ShoppingCartIcon />, path: "/orders" },
  { label: "Customers", icon: <PeopleIcon />,     path: "/customers" },
  { label: "More",      icon: <MoreHorizIcon />,  path: "__more__" },
];

const MORE_ITEMS = [
  { text: "Payments",       icon: <PaymentsIcon />,      path: "/payments" },
  { text: "Reports",        icon: <AssessmentIcon />,    path: "/reports" },
  { text: "Analytics",      icon: <BarChartIcon />,      path: "/analytics" },
  { text: "Stock Predictor",icon: <PsychologyIcon />,    path: "/stockpredictor" },
  { text: "Delivery",       icon: <LocalShippingIcon />, path: "/delivery" },
  { text: "Settings",       icon: <SettingsIcon />,      path: "/settings" },
];

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  // Determine which primary tab is active
  const activeTab = PRIMARY_TABS.findIndex((tab) => {
    if (tab.path === "__more__") return false;
    if (tab.path === "/") return location.pathname === "/";
    return location.pathname.startsWith(tab.path);
  });

  const handleChange = (_, newValue) => {
    const tab = PRIMARY_TABS[newValue];
    if (tab.path === "__more__") {
      setMoreOpen(true);
    } else {
      navigate(tab.path);
    }
  };

  return (
    <>
      {/* Fixed bottom navigation bar */}
      <Paper
        elevation={8}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          borderTop: "1px solid #E0E0E0",
        }}
      >
        <BottomNavigation
          value={activeTab === -1 ? false : activeTab}
          onChange={handleChange}
          showLabels
          sx={{
            height: 64,
            backgroundColor: "#fff",
            "& .MuiBottomNavigationAction-root": {
              minWidth: 0,
              padding: "6px 4px",
              color: "#757575",
              fontSize: "0.65rem",
              "&.Mui-selected": {
                color: "#1565C0",
              },
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.65rem",
              "&.Mui-selected": { fontSize: "0.68rem" },
            },
          }}
        >
          {PRIMARY_TABS.map((tab) => (
            <BottomNavigationAction
              key={tab.label}
              label={tab.label}
              icon={tab.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>

      {/* "More" slide-up drawer */}
      <Drawer
        anchor="bottom"
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            pb: 2,
          },
        }}
      >
        {/* Handle bar */}
        <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}>
          <Box sx={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#E0E0E0" }} />
        </Box>
        <Typography variant="subtitle2" sx={{ px: 3, pb: 1, color: "text.secondary" }}>
          More Options
        </Typography>
        <Divider />
        <List>
          {MORE_ITEMS.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => {
                  setMoreOpen(false);
                  navigate(item.path);
                }}
                sx={{ px: 3, py: 1.5 }}
              >
                <ListItemIcon sx={{ color: "#1565C0", minWidth: 42 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}

export default BottomNav;
