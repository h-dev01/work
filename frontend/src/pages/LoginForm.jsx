import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Stack,
  Chip,
  InputAdornment, 
  IconButton,
  FormControlLabel,
  Checkbox,
  Alert,
  useTheme
} from '@mui/material';
import { Visibility, VisibilityOff, SupervisorAccount, School, Person } from '@mui/icons-material';
// @ts-ignore
import backgroundImage from '../assets/images/background_Loginpage.png';

import { endpoints } from '../services/api';

const LoginForm = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Use purple for everyone for a cleaner look, or adapt if strict requirement
  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;

  const roleInfo = {
    admin: {
      title: 'Admin Command Center',
      icon: <SupervisorAccount fontSize="large" />,
      redirectPath: '/admin/dashboard',
      username: 'admin',
      password: 'Admin@12345',
    },
    teacher: {
      title: 'Teacher Workspace',
      icon: <School fontSize="large" />,
      redirectPath: '/teacher/dashboard',
      username: 'prof@school.com',
      password: 'Teacher@12345',
    },
    student: {
      title: 'Student Portal',
      icon: <Person fontSize="large" />,
      redirectPath: '/student/dashboard',
      username: 'student.uci.1@school.com',
      password: 'Student@12345',
    },
  };

  useEffect(() => {
    if (!roleInfo[role]) {
      navigate('/login');
    }
    
    const savedUsername = localStorage.getItem('username');
    const savedRole = localStorage.getItem('userRole');
    
    if (savedUsername && savedRole === role) {
      setFormData(prev => ({
        ...prev,
        username: savedUsername,
        rememberMe: true
      }));
    }
  }, [role, navigate]);

  if (!roleInfo[role]) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value
    }));
  };

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  const useDemoCredentials = () => {
    setFormData(prev => ({
      ...prev,
      username: roleInfo[role].username,
      password: roleInfo[role].password
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const response = await fetch(endpoints.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          role: role
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        sessionStorage.setItem('currentUser', JSON.stringify(data.user));
        navigate(roleInfo[role].redirectPath);
      } else {
        setError(data.message || 'Login error');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: 'background.default',
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <Helmet>
        <title>StudyPulse AI - {roleInfo[role]?.title}</title>
        <meta name="description" content="Log in to your StudyPulse AI workspace." />
      </Helmet>
      <Container 
        maxWidth="sm" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          pt: 16, 
          pb: 8,
        }}
      >
          {/* Logo Heading */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <School sx={{ fontSize: 40, mr: 1, color: 'white' }} />
              <Typography 
                variant="h4" 
                component="span" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'white',
                  fontFamily: '"Plus Jakarta Sans", sans-serif'
                }}
              >
                StudyPulse AI
              </Typography>
            </Link>
          </Box>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            
            width: '100%',
            border: '1px solid',
            borderColor: 'divider',
            background: 'rgba(255, 255, 255, 0.96)', 
            backdropFilter: 'blur(10px)',
            boxShadow: '0 28px 90px -55px rgba(18,52,59,.75)'
          }}
        >

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box sx={{ 
              p: 2, 
              borderRadius: '50%', 
              bgcolor: 'primary.main',
              color: 'white',
              mb: 2,
              boxShadow: '0 4px 12px rgba(5, 25, 45, 0.2)'
            }}>
              {roleInfo[role].icon}
            </Box>
            <Typography variant="h4" component="h1" align="center" sx={{ fontWeight: 700, mb: 1 }}>
              {roleInfo[role].title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Log in to continue
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: 'rgba(0,168,150,0.08)', border: '1px solid rgba(0,168,150,0.18)' }}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  Demo credentials
                </Typography>
                <Chip label={role} size="small" color="secondary" sx={{ color: 'white', fontWeight: 700 }} />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Username: <strong>{roleInfo[role].username}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Password: <strong>{roleInfo[role].password}</strong>
              </Typography>
              <Button variant="outlined" size="small" onClick={useDemoCredentials} sx={{ alignSelf: 'flex-start', borderRadius: 999 }}>
                Fill demo login
              </Button>
            </Stack>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            

            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              size="large"
              sx={{ 
                mt: 4, 
                mb: 2, 
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'white',
                borderRadius: 999,
                boxShadow: '0 14px 35px rgba(0, 168, 150, 0.28)'
              }}
              disabled={loading}
            >
              {loading ? 'Login...' : 'Log in'}
            </Button>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="text" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  ← Choose another role
                </Button>
              </Link>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginForm;