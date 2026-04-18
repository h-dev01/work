import React, { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  useScrollTrigger,
  Slide,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import { useNavigate, useLocation } from "react-router-dom";

const pages = [
  { label: "Home", id: "hero" },
  { label: "About", id: "roles" },
  { label: "Statistics", id: "stats" },
  { label: "FAQ", id: "faq" },
];

function HideOnScroll(props) {
  const { children, window } = props;
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export default function Navbar(props) {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Only apply transparent/white text logic on the Landing Page ("/")
  const isLandingPage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

  const scrollToSection = (sectionId) => {
    handleCloseNavMenu();
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Logic: 
  // If Landing Page AND Not Scrolled -> Transparent BG, White Text
  // Otherwise (Other pages OR Scrolled) -> White BG, Dark Text
  const isTransparent = isLandingPage && !scrolled;
  const textColor = isTransparent ? "white" : "primary.main";
  const bgColor = isTransparent ? "transparent" : "rgba(255, 255, 255, 0.95)";

  return (
    <AppBar 
      position="fixed" 
      color="default" 
      elevation={isTransparent ? 0 : 4}
      sx={{ 
        backgroundColor: bgColor,
        backdropFilter: isTransparent ? "none" : "blur(10px)",
        transition: "all 0.3s ease-in-out",
        borderBottom: isTransparent ? "none" : "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: 80 }}>
          {/* Logo Desktop */}
          <AutoGraphIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1, color: textColor, fontSize: 34 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 4,
              display: { xs: "none", md: "flex" },
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 700,
              color: textColor,
              textDecoration: "none",
            }}
          >
            StudyPulse AI
          </Typography>

          {/* Menu Mobile */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton size="large" onClick={handleOpenNavMenu} sx={{ color: textColor }}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.map((page) => (
                <MenuItem key={page.label} onClick={() => scrollToSection(page.id)}>
                  <Typography textAlign="center">{page.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Logo Mobile */}
          <AutoGraphIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1, color: textColor }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: '"Studio-Feixen-Sans", sans-serif',
              fontWeight: 700,
              color: textColor,
              textDecoration: "none",
            }}
          >
            StudyPulse AI
          </Typography>

          {/* Menu Desktop */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, justifyContent: "flex-end", mr: 4 }}>
            {pages.map((page) => (
              <Button
                key={page.label}
                onClick={() => scrollToSection(page.id)}
                sx={{ 
                  my: 2, 
                  color: textColor,
                  mx: 1.5,
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  '&:hover': {
                    color: "secondary.main",
                    backgroundColor: "transparent"
                  }
                }}
              >
                {page.label}
              </Button>
            ))}
          </Box>

          {/* Bouton Login */}
          <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'block' } }}>
            <Button
                color="primary"
                variant="contained"
                onClick={() => navigate("/login")}
                sx={{
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 999,
                  boxShadow: '0 14px 30px rgba(0, 168, 150, 0.25)',
                }}
              >
                Log in
              </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
