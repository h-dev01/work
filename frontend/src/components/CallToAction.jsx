import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CallToAction = () => {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        background: 'linear-gradient(135deg, #12343B 0%, #0B6E69 55%, #00A896 100%)', 
        color: 'white', 
        py: 10,
        textAlign: 'center'
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 800, mb: 3 }}>
          Ready to explore StudyPulse AI?
        </Typography>
        <Typography variant="h5" sx={{ mb: 5, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
          Use the demo role accounts to explore the admin, teacher, and student dashboards with real database records.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
          <Button 
            variant="contained" 
            color="secondary" 
            size="large"
            onClick={() => navigate("/login")}
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 700, color: 'primary.main', borderRadius: 999 }}
          >
            Choose a role
          </Button>
          <Button 
            variant="outlined" 
            color="inherit" 
            size="large"
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem', borderWidth: 2, borderRadius: 999, '&:hover': { borderWidth: 2 } }}
          >
            View demo credentials
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default CallToAction;
