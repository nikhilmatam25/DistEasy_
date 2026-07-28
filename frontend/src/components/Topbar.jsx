import { AppBar, Toolbar, Typography, IconButton, Avatar, Box } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

function Topbar() {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - 240px)`,
        ml: "240px",
        backgroundColor: "#1976d2",
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          DistEasy Distributor System
        </Typography>

        <IconButton color="inherit">
          <NotificationsIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
          <Avatar sx={{ bgcolor: "orange", mr: 1 }}>A</Avatar>
          <Typography>Admin</Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;