import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

function Topbar({ isMobile, drawerWidth, onMenuClick }) {
  return (
    <AppBar
      position="fixed"
      elevation={2}
      sx={{
        // Desktop: offset by sidebar width; Mobile: full width
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        backgroundColor: "#1565C0",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        {/* Hamburger — mobile only */}
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* App Title */}
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            fontWeight="700"
            letterSpacing={0.5}
            noWrap
          >
            DistEasy
          </Typography>
        </Box>

        {/* Avatar */}
        <Avatar
          sx={{
            bgcolor: "#FFA726",
            width: 34,
            height: 34,
            fontSize: 14,
            fontWeight: "bold",
          }}
        >
          LD
        </Avatar>
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;