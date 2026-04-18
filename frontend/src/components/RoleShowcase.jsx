import React from 'react';
import { Box, Container, Typography, Button, Grid, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import adminImage from '../assets/images/admin.jpg';
import teacherImage from '../assets/images/teacher.png';
import studentImage from '../assets/images/student-learning.png';

const RoleSection = ({ title, description, image, imagePosition, buttonText, onButtonClick }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ py: 10 }}>
      <Grid container spacing={6} alignItems="center" direction={imagePosition === 'right' ? 'row' : 'row-reverse'}>
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4, lineHeight: 1.6 }}>
              {description}
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              endIcon={<ArrowForwardIcon />}
              onClick={onButtonClick}
              sx={{ 
                borderRadius: 999, 
                px: 4, 
                py: 1.5,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              {buttonText}
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box 
            component="img"
            src={image}
            alt={title}
            sx={{
              width: '100%',
              borderRadius: '32px',
              boxShadow: '0 30px 70px -38px rgba(18,52,59,.65)',
              transform: 'scale(1)',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)',
              }
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

const RoleShowcase = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Academic Operations",
      description: "Monitor classes, teachers, students, subjects, alerts, and recommendations from one decision center.",
      image: adminImage,
      buttonText: "Enter admin workspace",
      imagePosition: "left",
      color: "primary.main",
      onButtonClick: () => navigate('/login')
    },
    {
      title: "Teachers",
      description: "Spot struggling learners early, manage grades, and focus support where it will make the biggest impact.",
      image: teacherImage,
      buttonText: "Enter teacher workspace",
      imagePosition: "right",
      color: "secondary.main",
      onButtonClick: () => navigate('/login')
    },
    {
      title: "Students",
      description: "Review your grades, alerts, and personalized recommendations so every semester has a clear plan.",
      image: studentImage,
      buttonText: "Enter student workspace",
      imagePosition: "left",
      color: "primary.main",
      onButtonClick: () => navigate('/login')
    }
  ];

  return (
    <Box sx={{ py: 12, bgcolor: 'background.default' }} id="roles">
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 12 }}>
          <Typography variant="subtitle1" color="secondary" sx={{ fontWeight: 700, letterSpacing: 1.5, mb: 2 }}>
            ROLE-BASED WORKSPACES
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 3 }}>
            Designed around <Box component="span" sx={{ color: 'secondary.main' }}>real academic workflows</Box>
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: "auto" }}>
            Each dashboard has a different purpose, so StudyPulse AI feels like a tailored campus tool instead of a generic template.
          </Typography>
        </Box>

        {roles.map((role, index) => (
          <RoleSection key={index} {...role} />
        ))}
      </Container>
    </Box>
  );
};

export default RoleShowcase;
