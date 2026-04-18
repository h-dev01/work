import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem,
  Button, CircularProgress, Snackbar, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Card, CardContent, List,
  ListItem, ListItemIcon, Divider, useTheme, Link, Collapse, IconButton
} from '@mui/material';
import {
  Warning as WarningIcon, CheckCircle as CheckCircleIcon,
  Error as ErrorIcon, NotificationImportant as AlertIcon,
  School as SchoolIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { api, endpoints } from '../../services/api';

const STATUS_CONFIG = {
  'At Risk': { color: '#F44336', icon: <ErrorIcon /> },
  'Average Performance': { color: '#FFC107', icon: <WarningIcon /> },
  'High Performer': { color: '#4CAF50', icon: <CheckCircleIcon /> }
};

const AdminAlerts = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [loading, setLoading] = useState({ classes: false, alerts: false });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [dataStatus, setDataStatus] = useState({ hasData: false, isLoading: false, error: null });

  const theme = useTheme();

  useEffect(() => { fetchClasss(); }, []);

  const fetchClasses = async () => {
    setLoading(prev => ({ ...prev, classes: true }));
    try {
      const response = await api.get(endpoints.classes.list);
      const data = await response.json();
      setClasss(data);
    } catch (error) {
      showNotification('Error loading classes', 'error');
    } finally {
      setLoading(prev => ({ ...prev, classes: false }));
    }
  };

  const generateAlerts = async () => {
    if (!selectedClass) {
      showNotification('Please select a class', 'error');
      return;
    }

    setDataStatus({ hasData: false, isLoading: true, error: null });
    setLoading(prev => ({ ...prev, alerts: true }));
    
    try {
      const response = await api.post(endpoints.ml.classAlerts, { class_id: selectedClass });
      
      const result = await response.json();
      const hasData = result.alerts && result.alerts.length > 0;
      
      setAlerts(result.alerts || []);
      setDataStatus({
        hasData,
        isLoading: false,
        error: hasData ? null : 'No alerts generated (no grades available?)'
      });
      
      showNotification(hasData ? `${result.alerts.length} alerts generated` : 'No alerts generated');
    } catch (error) {
      console.error('Generate alerts error:', error);
      setDataStatus({ hasData: false, isLoading: false, error: error.message });
      showNotification(error.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, alerts: false }));
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const getCurrentClassName = () => {
    return classes.find(c => c.id === selectedClass)?.nom || 'Unknown class';
  };

  const toggleExpandStudent = (studentId) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary.main" fontWeight="bold" gutterBottom>
          Alert System
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Monitor your students' performance
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ 
            height: 140, 
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            transition: "transform 0.3s, box-shadow 0.3s",
            "&:hover": { transform: "translateY(-5px)", boxShadow: theme.shadows[4] }
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle2" color="text.secondary">Total Alerts</Typography>
                <AlertIcon fontSize="medium" sx={{ color: theme.palette.primary.main }} />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
                  {alerts.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Alerts generated</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Select a class to generate alerts
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                value={selectedClass}
                label="Class"
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={loading.classes}
              >
                <MenuItem value=""><em>Select a class</em></MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>{cls.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={generateAlerts}
              disabled={loading.alerts || !selectedClass}
              fullWidth
              sx={{ height: '56px' }}
            >
              {loading.alerts ? <CircularProgress size={24} color="inherit" /> : "Generate Alerts"}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {!dataStatus.isLoading && !dataStatus.hasData && selectedClass && (
        <Alert severity="info" icon={<SchoolIcon />} sx={{ mb: 3 }}>
          {dataStatus.error || 'No alerts generated. Please verify that grades have been entered.'}
        </Alert>
      )}

      {dataStatus.hasData && (
        <>
          {alerts.length > 0 && (
            <Card sx={{ mb: 3, bgcolor: 'error.light' }}>
              <CardContent>
                <Typography variant="h6" color="error.dark">
                  {alerts.length} At-Risk Student(s) - {getCurrentClassName()}
                </Typography>
              </CardContent>
            </Card>
          )}

          {alerts.length > 0 && (
            <Card elevation={2}>
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Alert Message</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {alerts.map((alert) => (
                        <React.Fragment key={alert.student_id}>
                          <TableRow hover>
                            <TableCell>
                              <Typography fontWeight="bold">{alert.student_name}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={alert.performance_category}
                                icon={STATUS_CONFIG[alert.performance_category]?.icon}
                                sx={{
                                  backgroundColor: STATUS_CONFIG[alert.performance_category]?.color,
                                  color: 'white',
                                  minWidth: 160
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{alert.alert_message}</Typography>
                            </TableCell>
                            <TableCell>
                              <IconButton onClick={() => toggleExpandStudent(alert.student_id)}>
                                {expandedStudent === alert.student_id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={4} sx={{ py: 0 }}>
                              <Collapse in={expandedStudent === alert.student_id}>
                                <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                                  <Typography variant="subtitle1" gutterBottom>
                                    Course recommendations:
                                  </Typography>
                                  <List dense>
                                    {alert.course_recommendations?.map((course, i) => (
                                      <React.Fragment key={i}>
                                        <ListItem sx={{ py: 1 }}>
                                          <Box sx={{ width: '100%' }}>
                                            <Typography fontWeight="medium">
                                              {course.subject}
                                            </Typography>
                                            {course.resources.map((resource, j) => (
                                              <Box key={j} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                <WarningIcon color="error" fontSize="small" sx={{ mr: 1 }} />
                                                <Link href={resource.link} target="_blank" rel="noopener">
                                                  {resource.name}
                                                </Link>
                                              </Box>
                                            ))}
                                          </Box>
                                        </ListItem>
                                        {i < alert.course_recommendations.length - 1 && <Divider />}
                                      </React.Fragment>
                                    ))}
                                  </List>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleNotificationClose}>
        <Alert onClose={handleNotificationClose} 
// @ts-ignore
        severity={notification.severity} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminAlerts;