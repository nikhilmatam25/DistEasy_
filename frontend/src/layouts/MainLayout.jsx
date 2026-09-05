import { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import { useTheme, useMediaQuery } from "@mui/material";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import BottomNav from "../components/BottomNav";

const DRAWER_WIDTH = 240;

function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Top App Bar */}
      <Topbar
        isMobile={isMobile}
        drawerWidth={DRAWER_WIDTH}
        onMenuClick={handleDrawerToggle}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        isMobile={isMobile}
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          backgroundColor: "#f4f6f8",
          minHeight: "100vh",
          // On desktop: offset for sidebar; on mobile: full width
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          // On mobile: add bottom padding so content isn't behind bottom nav
          pb: { xs: "72px", md: 3 },
        }}
      >
        {/* Spacer for fixed AppBar */}
        <Toolbar />
        <Outlet />
      </Box>

      {/* Bottom Navigation — mobile only */}
      {isMobile && <BottomNav />}
    </Box>
  );
}

export default MainLayout;