import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Snackbar,
  Alert as MuiAlert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  useTheme
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  School as SchoolIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { api, endpoints } from '../../services/api';

const STATUS_CONFIG = {
  'High Performer': {
    color: '#4CAF50',
    icon: <CheckCircleIcon />
  },
  'Average Performance': {
    color: '#FFC107',
    icon: <WarningIcon />
  },
  'At Risk': {
    color: '#F44336',
    icon: <ErrorIcon />
  }
};

const AdminClassment = () => {
  // États
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [classData, setClassData] = useState({
    students: [],
    stats: null,
    alerts: [],
    recommendations: []
  });
  const [loading, setLoading] = useState({
    classes: false,
    data: false
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [dataStatus, setDataStatus] = useState({
    hasData: false,
    isLoading: false,
    error: null
  });

  const theme = useTheme();



  // Constantes removed as we use endpoints from api.js

  // Effets
  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassData();
    } else {
      resetClassData();
    }
  }, [selectedClass]);

  // Méthodes
  const fetchClasses = async () => {
    setLoading(prev => ({ ...prev, classes: true }));
    try {
      const response = await api.get(endpoints.classes.list);
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      showNotification('Error loading classes', 'error');
    } finally {
      setLoading(prev => ({ ...prev, classes: false }));
    }
  };

  const fetchClassData = async () => {
    setDataStatus({ hasData: false, isLoading: true, error: null });
    setLoading(prev => ({ ...prev, data: true }));
    
    try {
      const response = await api.post(endpoints.ml.classDashboard, { class_id: selectedClass });
      
      const data = await response.json();
      
      // Vérifier si des données sont disponibles
      const hasData = data.classification && data.classification.length > 0;
      
      setClassData({
        students: data.classification || [],
        stats: data.statistics || null,
        alerts: data.alerts || [],
        recommendations: data.recommendations || []
      });
      
      setDataStatus({
        hasData,
        isLoading: false,
        error: hasData ? null : 'No grade data available'
      });
      
    } catch (error) {
      console.error('Fetch error:', error);
      setDataStatus({
        hasData: false,
        isLoading: false,
        error: error.message
      });
      showNotification(error.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, data: false }));
    }
  };

  const resetClassData = () => {
    setClassData({
      students: [],
      stats: null,
      alerts: [],
      recommendations: []
    });
    setDataStatus({
      hasData: false,
      isLoading: false,
      error: null
    });
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const getCurrentClassName = () => {
    return classes.find(c => c.id === selectedClass)?.nom || 'Unknown class';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary.main" fontWeight="bold" gutterBottom>
          Ranking Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          View and analyze your classes' performance
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
      </Box>

      {/* Statistics Card */}
      {classData.stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={2}
              sx={{ 
                height: 140, 
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Class Average
                  </Typography>
                  <SchoolIcon 
                    fontSize="medium" 
                    sx={{ color: theme.palette.primary.main }} 
                  />
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
                    {classData.stats.average_score?.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average score
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Class Selector */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Select a class
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                value={selectedClass}
                label="Class"
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={loading.classes}
              >
                <MenuItem value="">
                  <em>Select a class</em>
                </MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Content Rendering */}
      {loading.data && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Classment Table */}
      {dataStatus.hasData && (
        <Card elevation={2}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Average</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classData.students.map((student) => (
                    <TableRow
                      key={student.student_id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell>{student.student_name}</TableCell>
                      <TableCell align="center">
                        {student.average_score?.toFixed(2) || 'N/A'}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={student.performance_category}
                          icon={STATUS_CONFIG[student.performance_category]?.icon}
                          sx={{
                            backgroundColor: STATUS_CONFIG[student.performance_category]?.color,
                            color: 'white',
                            minWidth: 160
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={handleNotificationClose}
          // @ts-ignore
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default AdminClassment;