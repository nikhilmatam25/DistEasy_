import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

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

const menuItems = [
  { text: "Dashboard",      icon: <DashboardIcon />,     path: "/" },
  { text: "Inventory",      icon: <InventoryIcon />,     path: "/inventory" },
  { text: "Customers",      icon: <PeopleIcon />,        path: "/customers" },
  { text: "Orders",         icon: <ShoppingCartIcon />,  path: "/orders" },
  { text: "Payments",       icon: <PaymentsIcon />,      path: "/payments" },
  { text: "Reports",        icon: <AssessmentIcon />,    path: "/reports" },
  { text: "Analytics",      icon: <BarChartIcon />,      path: "/analytics" },
  { text: "Stock Predictor",icon: <PsychologyIcon />,    path: "/stockpredictor" },
  { text: "Delivery",       icon: <LocalShippingIcon />, path: "/delivery" },
  { text: "Settings",       icon: <SettingsIcon />,      path: "/settings" },
];

function DrawerContent({ location }) {
  return (
    <Box sx={{ overflow: "auto", height: "100%" }}>
      {/* Brand Header */}
      <Toolbar
        sx={{
          background: "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)",
          color: "white",
          flexDirection: "column",
          alignItems: "flex-start",
          py: 2,
          minHeight: "80px !important",
        }}
      >
        <Typography variant="h6" fontWeight="800" letterSpacing={0.5}>
          DistEasy
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.85, letterSpacing: 1.5 }}>
          DISTRIBUTION SYSTEM
        </Typography>
      </Toolbar>

      <Divider />

      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  backgroundColor: isActive ? "#E3F2FD" : "transparent",
                  color: isActive ? "#1565C0" : "text.primary",
                  "&:hover": { backgroundColor: "#F5F5F5" },
                  minHeight: 46,
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#1565C0" : "text.secondary",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 4,
                      height: 24,
                      borderRadius: 2,
                      backgroundColor: "#1565C0",
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, mt: "auto" }}>
        <Typography variant="caption" color="text.disabled">
          v1.0 · DistEasy
        </Typography>
      </Box>
    </Box>
  );
}

function Sidebar({ isMobile, drawerWidth, mobileOpen, onClose }) {
  const location = useLocation();

  const drawerSx = {
    width: drawerWidth,
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      width: drawerWidth,
      boxSizing: "border-box",
      borderRight: "1px solid #E0E0E0",
    },
  };

  if (isMobile) {
    // Temporary drawer on mobile — slides in over content
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          ...drawerSx,
          display: { xs: "block", md: "none" },
        }}
      >
        <DrawerContent location={location} />
      </Drawer>
    );
  }

  // Permanent sidebar on desktop/laptop
  return (
    <Drawer
      variant="permanent"
      sx={{
        ...drawerSx,
        display: { xs: "none", md: "block" },
      }}
      open
    >
      <DrawerContent location={location} />
    </Drawer>
  );
}

export default Sidebar;