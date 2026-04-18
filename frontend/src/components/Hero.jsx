// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Stack, useTheme, Chip } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import heroBg from '../assets/images/background.png';

const Hero = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box 
      id="hero"
      sx={{ 
        position: 'relative',
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Parallax effect
        pt: { xs: 12, md: 24 },
        pb: { xs: 8, md: 20 },
        overflow: 'hidden',
        minHeight: '90vh', // Ensure full viewport feel
        display: 'flex',
        alignItems: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(120deg, rgba(9, 28, 33, 0.88), rgba(18, 52, 59, 0.72), rgba(0, 168, 150, 0.28))',
          zIndex: 0
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ maxWidth: 920, textAlign: { xs: 'center', md: 'left' } }}>
          <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'center', md: 'flex-start' }} flexWrap="wrap" sx={{ mb: 3 }}>
            <Chip label="Student Success Intelligence" sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'white', fontWeight: 700, border: '1px solid rgba(255,255,255,0.18)' }} />
            <Chip label="UMP Academic Platform" sx={{ bgcolor: 'rgba(0,168,150,0.22)', color: 'white', fontWeight: 700, border: '1px solid rgba(0,168,150,0.35)' }} />
          </Stack>
          
          <Typography 
            component="h1" 
            variant="h1" 
            sx={{ 
              fontWeight: 800, 
              fontSize: { xs: '2.5rem', md: '4.5rem' },
              lineHeight: 1.1,
              mb: 3,
              color: '#ffffff', // White text
              textShadow: '0 2px 10px rgba(0,0,0,0.3)' // Stronger shadow
            }}
          >
            Turn academic data <br/>
            <Box component="span" sx={{ 
              color: '#ffffff', // Keep white or use a very light secondary tint
              position: 'relative',
              display: 'inline-block',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 8,
                left: 0,
                width: '100%',
                height: '15px',
                bgcolor: 'secondary.main',
                opacity: 0.8, // Increased opacity for visibility
                zIndex: -1,
                transform: 'rotate(-2deg)'
              }
            }}>
              into action
            </Box>
          </Typography>

          <Typography 
            variant="h5" 
            paragraph 
            sx={{ 
              mb: 6, 
              maxWidth: 750, 
              mx: { xs: 'auto', md: 0 }, 
              fontWeight: 500, 
              lineHeight: 1.6,
              fontSize: { xs: '1rem', md: '1.25rem' },
              color: '#f0f0f0', // Off-white for description
              textShadow: '0 1px 4px rgba(0,0,0,0.5)'
            }}
          >
            StudyPulse AI helps administrators, teachers, and students detect risk early, understand performance trends, and choose the next best academic action.
          </Typography>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent={{ xs: "center", md: "flex-start" }}
            alignItems="center"
          >
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => navigate("/login")}
              endIcon={<ArrowForwardIcon />} 
              sx={{ 
                px: 4, 
                py: 1.5, 
                fontSize: '1.1rem', 
                borderRadius: 999,
                boxShadow: '0 18px 40px rgba(0, 168, 150, 0.3)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-3px)' }
              }}
            >
              Open dashboards
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};
export default Hero;
