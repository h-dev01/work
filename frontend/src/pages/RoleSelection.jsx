// @ts-nocheck
import React from 'react';
import { Link } from "react-router-dom"
import { Box, Typography, Button, Container, Paper, Grid, useTheme, alpha } from "@mui/material"
import { Helmet } from 'react-helmet-async';
import SchoolIcon from "@mui/icons-material/School"
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount"
import PersonIcon from "@mui/icons-material/Person"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import backgroundImage from '../assets/images/background_Loginpage.png'; // Reusing the background for consistency

const SelectionRole = () => {
  const theme = useTheme();

  const roles = [
    {
      id: "admin",
      title: "Administrator",
      description: "Global management and system configuration",
      icon: <SupervisorAccountIcon sx={{ fontSize: 60 }} />,
      color: theme.palette.primary.main,
    },
    {
      id: "teacher",
      title: "Teacher",
      description: "Performance tracking and risk detection",
      icon: <SchoolIcon sx={{ fontSize: 60 }} />,
      color: theme.palette.secondary.main,
    },
    {
      id: "student",
      title: "Student",
      description: "Results review and guidance",
      icon: <PersonIcon sx={{ fontSize: 60 }} />,
      color: theme.palette.info.main,
    },
  ]

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      bgcolor: 'background.default',
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: alpha('#000', 0.4), // Dark overlay for contrast
        zIndex: 0
      }
    }}>
      <Helmet>
        <title>StudyPulse AI - Role Selection</title>
        <meta name="description" content="Please select your area (Admin, Teacher, Student) to log in." />
      </Helmet>
    <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Container 
        maxWidth="lg" 
        sx={{ 
          flexGrow: 1, 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          pt: 16, 
          pb: 12   
        }}
      >
        
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 800, 
                fontSize: { xs: '2.5rem', md: '4rem' },
                color: 'white',
                textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                mb: 2
              }}
            >
              Choose your StudyPulse AI workspace
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                maxWidth: 700, 
                mx: "auto", 
                mb: 2, 
                fontWeight: 500,
                color: alpha('#fff', 0.9),
                lineHeight: 1.6
              }}
            >
              Sign in as an administrator, teacher, or student to view a dashboard tailored to that role.
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center" alignItems="stretch">
            {roles.map((role) => (
              <Grid item xs={12} md={4} key={role.id}>
                <Link to={`/login/${role.id}`} style={{ textDecoration: "none", height: '100%', display: 'block' }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 5,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                      borderRadius: 0,
                      background: 'rgba(255, 255, 255, 0.1)', // Glass effect
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      cursor: "pointer",
                      position: 'relative',
                      overflow: 'hidden',
                      "&:hover": {
                        transform: "translateY(-12px)",
                        background: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: theme.shadows[4],
                        borderColor: 'transparent',
                        '& .role-icon-box': {
                          transform: 'scale(1.1) rotate(5deg)',
                          background: role.color,
                          color: 'white',
                          boxShadow: theme.shadows[4]
                        },
                        '& .role-title': {
                          color: '#1a202c',
                          transform: 'translateY(2px)'
                        },
                        '& .role-desc': {
                          color: '#4a5568'
                        },
                        '& .role-arrow': {
                          color: role.color, // Show role color on hover for contrast with white background? User said "it should be white". Let's stick to white or maybe role color if background becomes white? 
                          // Wait, if hover background is white, white text is invisible.
                          // User said "it should be white" and "displayed before hover".
                          // Before hover: background is glass (dark/transparent), white text works.
                          // On hover: background is white. White text is invisible.
                          // I should probably keep it white before hover, and role.color on hover?
                          // But user said "it should be white". If I make it white always, I must ensure background isn't white on hover OR background is dark enough.
                          // The hover effect makes background: 'rgba(255, 255, 255, 0.95)'.
                          // So white text will be invisible on hover.
                          // I will assume they want white TEXT generally. I'll act smart:
                          // Default: color: 'white', opacity: 1.
                          // Hover: color: role.color (to be visible on white card).
                          // Re-reading: "button conexion it should be white and displyed befor the hover"
                          // It implies the state BEFORE hover should be white and visible.
                          opacity: 1,
                          transform: 'translateX(5px)'
                        }
                      },
                    }}
                  >
                    <Box
                      className="role-icon-box"
                      sx={{
                        p: 3,
                        borderRadius: "24px",
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        mb: 4,
                        transition: "all 0.4s ease",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 100,
                        height: 100
                      }}
                    >
                      {role.icon}
                    </Box>
                    <Typography 
                      className="role-title"
                      variant="h4" 
                      component="h2" 
                      align="center" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 700, 
                        color: 'white', 
                        fontSize: '1.75rem',
                        transition: 'color 0.3s ease',
                        mb: 2
                      }}
                    >
                      {role.title}
                    </Typography>
                    <Typography 
                      className="role-desc"
                      variant="body1" 
                      align="center" 
                      sx={{ 
                        color: alpha('#fff', 0.8),
                        fontSize: '1.05rem',
                        lineHeight: 1.6,
                        transition: 'color 0.3s ease',
                        flexGrow: 1
                      }}
                    >
                      {role.description}
                    </Typography>
                    
                    <Box 
                      className="role-arrow"
                      sx={{ 
                        mt: 3, 
                        opacity: 1, 
                        transform: 'none', 
                        transition: 'all 0.4s ease',
                        color: 'white',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      Login →
                    </Box>
                  </Paper>
                </Link>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 10, textAlign: "center" }}>
            <Button 
              component={Link} 
              to="/" 
              sx={{ 
                fontSize: "1rem", 
                fontWeight: 600, 
                color: alpha('#fff', 0.9),
                textTransform: 'none',
                py: 1.5,
                px: 4,
                borderRadius: 0,
                border: '1px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(5px)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)',
                  borderColor: 'white'
                }
              }}
            >
              ← Back to home
            </Button>
          </Box>
      
      </Container>
    </Box>
    </Box>
  )
}

export default SelectionRole
