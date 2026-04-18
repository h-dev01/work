import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem,
  Button, CircularProgress, Snackbar, Alert, Card, CardContent, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
  Divider, List, ListItem, ListItemIcon, useTheme, Collapse, IconButton,
  Link
} from '@mui/material';
import {
  Recommend as RecommendIcon, CheckCircle as CheckCircleIcon,
  Warning as WarningIcon, Error as ErrorIcon, School as SchoolIcon,
  ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { api, endpoints } from '../../services/api';

const STATUS_CONFIG = {
  'At Risk': { color: '#F44336', icon: <ErrorIcon /> },
  'Average Performance': { color: '#FFC107', icon: <WarningIcon /> },
  'High Performer': { color: '#4CAF50', icon: <CheckCircleIcon /> }
};

const PRIORITY_ICONS = {
  high: <ErrorIcon color="error" />,
  medium: <WarningIcon color="warning" />,
  low: <CheckCircleIcon color="success" />
};

const AdminRecommendations = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [loading, setLoading] = useState({ classes: false, recommendations: false });
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

  const generateRecommendations = async () => {
    if (!selectedClass) {
      showNotification('Please select a class', 'error');
      return;
    }

    setDataStatus({ hasData: false, isLoading: true, error: null });
    setLoading(prev => ({ ...prev, recommendations: true }));
    
    try {
      const response = await api.post(endpoints.ml.classRecommendations, { class_id: selectedClass });
      
      const result = await response.json();
      const hasData = result.recommendations && result.recommendations.length > 0;
      
      setRecommendations(result.recommendations || []);
      setDataStatus({
        hasData,
        isLoading: false,
        error: hasData ? null : 'No recommendations generated (no grades available?)'
      });
      
      showNotification(hasData ? `${result.recommendations.length} recommendations generated` : 'No recommendations generated');
    } catch (error) {
      console.error('Generate recommendations error:', error);
      setDataStatus({ hasData: false, isLoading: false, error: error.message });
      showNotification(error.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, recommendations: false }));
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
          Path Recommendations
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Generate personalized recommendations for your students
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
                <Typography variant="subtitle2" color="text.secondary">Total Recommendations</Typography>
                <SchoolIcon fontSize="medium" sx={{ color: theme.palette.primary.main }} />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
                  {recommendations.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Recommendations generated</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
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
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={generateRecommendations}
              disabled={loading.recommendations || !selectedClass}
              fullWidth
              sx={{ height: '56px' }}
            >
              {loading.recommendations ? <CircularProgress size={24} color="inherit" /> : "Generate Recommendations"}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {loading.recommendations && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!dataStatus.isLoading && !dataStatus.hasData && selectedClass && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {dataStatus.error || 'No recommendations generated. Please verify that grades have been entered.'}
        </Alert>
      )}

      {dataStatus.hasData && recommendations.length > 0 && (
        <Card elevation={2}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Performance</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Recommendations</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recommendations.map((rec) => (
                    <React.Fragment key={rec.student_id}>
                      <TableRow hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Chip
                              label={rec.performance_category}
                              size="small"
                              sx={{
                                mr: 1,
                                backgroundColor: STATUS_CONFIG[rec.performance_category]?.color,
                                color: 'white'
                              }}
                            />
                            {rec.student_name}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {STATUS_CONFIG[rec.performance_category]?.icon}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {rec.recommendations[0]?.message}
                          </Typography>
                          {rec.recommendations.length > 1 && (
                            <Typography variant="body2" color="text.secondary">
                              + {rec.recommendations.length - 1} autres recommandations
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => toggleExpandStudent(rec.student_id)}>
                            {expandedStudent === rec.student_id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} sx={{ py: 0 }}>
                          <Collapse in={expandedStudent === rec.student_id}>
                            <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                              {rec.academic_orientation && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="subtitle1" gutterBottom>
                                    Recommended academic guidance:
                                  </Typography>
                                  <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>{rec.academic_orientation.orientation}</strong>: {rec.academic_orientation.description}
                                  </Typography>
                                </Box>
                              )}
                              <Typography variant="subtitle1" gutterBottom>
                                Recommendation details:
                              </Typography>
                              <List dense>
                                {rec.recommendations.map((item, i) => (
                                  <React.Fragment key={i}>
                                    <ListItem sx={{ py: 1 }}>
                                      <ListItemIcon sx={{ minWidth: 32 }}>
                                        {PRIORITY_ICONS[item.priority]}
                                      </ListItemIcon>
                                      <Box sx={{ width: '100%' }}>
                                        <Typography variant="body2" fontWeight="medium">
                                          {item.message}
                                        </Typography>
                                        {item.resources && (
                                          <Box sx={{ mt: 1, ml: 4 }}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                              Recommended resources:
                                            </Typography>
                                            {item.resources.map((resource, j) => (
                                              <Box key={j} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <RecommendIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                                                <Link href={resource.link} target="_blank" rel="noopener">
                                                  {resource.name}
                                                </Link>
                                              </Box>
                                            ))}
                                          </Box>
                                        )}
                                      </Box>
                                    </ListItem>
                                    {i < rec.recommendations.length - 1 && <Divider />}
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

export default AdminRecommendations;