import React, { useState, useEffect } from "react";
import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import { getDesignTokens } from "./theme";
import { Outlet, useLocation } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import useMediaQuery from "@mui/material/useMediaQuery";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const DashboardLayout = ({ role }) => {
  const [mode, setMode] = useState(
    Boolean(localStorage.getItem("currentMode"))
      ? localStorage.getItem("currentMode")
      : "light"
  );

  const theme = React.useMemo(
    // @ts-ignore
    () => createTheme(getDesignTokens(mode, role)), 
    [mode, role]
  );

  // Check if screen is mobile (sm or down)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Initialize open state based on screen size
  // Default: Open on Desktop, Closed on Mobile
  const [open, setOpen] = useState(!isMobile);

  const location = useLocation();

  // Update open state when screen size changes
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <div id="back-to-top-anchor" />
        <CssBaseline />
        <TopBar 
          open={open} 
          handleDrawerOpen={handleDrawerOpen} 
          setMode={setMode}
          // @ts-ignore
          role={role}
          isMobile={isMobile}
        />
        <Sidebar 
          open={open} 
          handleDrawerClose={handleDrawerClose} 
          // @ts-ignore
          role={role}
          pathname={location.pathname}
          variant={isMobile ? "temporary" : "permanent"}
        />
        <Box component="main" sx={{ flexGrow: 1, p: 3, width: "100%" }}>
          <DrawerHeader />
          <Outlet />
        </Box>
        <ScrollToTop />
      </Box>
    </ThemeProvider>
  );
};

export default DashboardLayout;