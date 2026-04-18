import React from 'react';
import { Box, Container, Grid, Typography, Paper } from '@mui/material';

const stats = [
  { value: '397', label: 'Active users' },
  { value: '790', label: 'Grade records' },
  { value: '60', label: 'Risk alerts' },
  { value: '790', label: 'Recommendations' },
];

const Stats = () => {
  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }} id="stats">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  bgcolor: 'transparent',
                  border: '1px solid rgba(18,52,59,0.08)',
                  borderRadius: 4,
                  background: 'linear-gradient(180deg, #ffffff 0%, #f0fbf8 100%)',
                  boxShadow: '0 20px 60px -45px rgba(18,52,59,.6)'
                }}
              >
                <Typography variant="h3" component="div" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Stats;
