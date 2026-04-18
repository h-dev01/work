import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider, TextField, Button, useTheme } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import SchoolIcon from '@mui/icons-material/School';

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: theme.palette.primary.main, // Dynamic theme color
        color: 'white',
        pt: 10,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={8}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SchoolIcon sx={{ mr: 1, fontSize: 32, color: theme.palette.secondary.main }} />
              <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                StudyPulse AI
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 4, lineHeight: 1.8 }}>
              StudyPulse AI turns classroom data into clear dashboards, early warnings, and practical guidance for academic teams.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton sx={{ color: 'white', '&:hover': { color: theme.palette.secondary.main, bgcolor: 'rgba(255,255,255,0.1)' } }}>
                 <FacebookIcon />
              </IconButton>
              <IconButton sx={{ color: 'white', '&:hover': { color: theme.palette.secondary.main, bgcolor: 'rgba(255,255,255,0.1)' } }}>
                 <TwitterIcon />
              </IconButton>
              <IconButton 
                  component="a" 
                  href="https://www.linkedin.com/in/anass-elamrany" 
                  target="_blank"
                  sx={{ color: 'white', '&:hover': { color: theme.palette.secondary.main, bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                 <LinkedInIcon />
              </IconButton>
              <IconButton sx={{ color: 'white', '&:hover': { color: theme.palette.secondary.main, bgcolor: 'rgba(255,255,255,0.1)' } }}>
                 <InstagramIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: theme.palette.secondary.main }}>
              PRODUCT
            </Typography>
            {['Features', 'For Teachers', 'For Students', 'Security', 'Pricing'].map((item) => (
              <Box key={item} sx={{ mb: 1.5 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ color: '#b3b3b3', '&:hover': { color: 'white' } }}>
                  {item}
                </Link>
              </Box>
            ))}
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: theme.palette.secondary.main }}>
              RESOURCES
            </Typography>
            {['Blog', 'Documentation', 'Guides', 'Support', 'Contact'].map((item) => (
              <Box key={item} sx={{ mb: 1.5 }}>
                <Link href="#" color="inherit" underline="hover" sx={{ color: '#b3b3b3', '&:hover': { color: 'white' } }}>
                  {item}
                </Link>
              </Box>
            ))}
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: theme.palette.secondary.main }}>
              NEWSLETTER
            </Typography>
            <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 2 }}>
              Receive our latest news and educational tips.
            </Typography>
            <Box component="form" noValidate sx={{ display: 'flex' }}>
              <TextField
                placeholder="Your email"
                variant="outlined"
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 0,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: 'transparent' },
                    color: 'white',
                  }
                }}
              />
              <Button 
                variant="contained" 
                color="secondary"
                sx={{ 
                  borderRadius: 0,
                  color: '#05192D',
                  fontWeight: 700
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
            © {new Date().getFullYear()} StudyPulse AI.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" variant="body2" sx={{ color: '#b3b3b3', textDecoration: 'none', '&:hover': { color: 'white' } }}>
              Terms of Use
            </Link>
            <Link href="#" variant="body2" sx={{ color: '#b3b3b3', textDecoration: 'none', '&:hover': { color: 'white' } }}>
              Privacy Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
