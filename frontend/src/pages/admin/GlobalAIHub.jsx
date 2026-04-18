import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem,
  Button, CircularProgress, Snackbar, Alert, Card, CardContent, Divider, Chip,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, List, ListItem, ListItemIcon, Collapse, Link, alpha,
  Fade, Avatar
} from '@mui/material';
import {
  Psychology as BrainIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AutoAwesome as SparklesIcon,
  Timeline as TimelineIcon,
  Recommend as RecommendIcon,
  NotificationsActive as AlertIcon,
  Speed as SpeedIcon,
  Science as ScienceIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { api, endpoints } from '../../services/api';

// --- STYLED COMPONENTS & CONSTANTS ---

const STATUS_CONFIG = {
  'At Risk': { color: 'error', icon: <ErrorIcon fontSize="small" /> },
  'Average Performance': { color: 'warning', icon: <WarningIcon fontSize="small" /> },
  'High Performer': { color: 'success', icon: <CheckCircleIcon fontSize="small" /> }
};

const TAB_STYLES = {
  root: {
    textTransform: "none",
    fontWeight: "bold",
    fontSize: "1rem",
    minHeight: 48,
  }
};

const StatCard = ({ title, value, icon, color, subtitle }) => {
    const theme = useTheme();
    return (
      <Card 
        elevation={2}
        sx={{ 
          height: 140, 
          borderLeft: `5px solid ${color}`,
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.shadows[4]
          }
        }}
      >
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="overline" color="text.secondary" fontWeight="bold">
                {title}
            </Typography>
            <Box sx={{ color: color }}>{icon}</Box>
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
};

const GlobalAIHub = () => {
  const theme = useTheme();
  
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [dashboardData, setDashboardData] = useState({
      classification: [],
      statistics: null,
      alerts: [],
      recommendations: []
    });
  const [loading, setLoading] = useState({ classes: false, data: false });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [predictData, setPredictData] = useState(null);
  
  // Initial Load
  useEffect(() => {
    fetchClasses();
  }, []);

  // Reset analysis when class changes
  useEffect(() => {
    setAnalysisDone(false);
    setDashboardData({
        classification: [],
        statistics: null,
        alerts: [],
        recommendations: []
    });
    setPredictData(null);
  }, [selectedClass]);

  // --- API CALLS ---

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

  const runAnalysis = async () => {
      if (!selectedClass) {
          showNotification("Please select a class", "warning");
          return;
      }
      
      setLoading(prev => ({ ...prev, data: true }));
      try {
          // 1. Trigger Classification (Uses .pkl models)
          const classifyResponse = await api.post(endpoints.ml.classifyClass, { class_id: selectedClass });
          const classifyData = await classifyResponse.json();
          
          if (!classifyData.success && !classifyData.classification) {
             // Continue relying on dashboard data
          }

          // 2. Fetch Detailed Predictions (S3/S4)
          const predictResponse = await api.post(endpoints.ml.predictGrades, { class_id: selectedClass });
          const predictions = await predictResponse.json();
          
          // 3. Fetch Recommendations (Now generated)
          const recResponse = await api.post(endpoints.ml.classRecommendations, { class_id: selectedClass });
          const recData = await recResponse.json();

          // Combine Data (using logic from class_dashboard view or classify result)
          const dashResponse = await api.post(endpoints.ml.classDashboard, { class_id: selectedClass });
          const dashData = await dashResponse.json();
          
          setDashboardData({
              ...dashData,
              recommendations: recData.recommendations || []
          });
          setPredictData(predictions);
          setAnalysisDone(true);
          showNotification("AI analysis completed successfully!", "success");

      } catch (error) {
          console.error(error);
          showNotification("Error during AI analysis", 'error');
      } finally {
          setLoading(prev => ({ ...prev, data: false }));
      }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // --- RENDERERS ---

  const renderOverviewValues = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Class Average"
          value={dashboardData.statistics?.average_score?.toFixed(2) || "-"}
          icon={<SpeedIcon />}
          color={theme.palette.primary.main}
          subtitle="Score Global Moy."
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="At Risk"
          value={dashboardData.statistics?.at_risk_count || 0}
          icon={<ErrorIcon />}
          color={theme.palette.error.main}
          subtitle="Alerts Generated"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Performants"
          value={dashboardData.statistics?.good_performers || 0}
          icon={<SparklesIcon />}
          color={theme.palette.success.main}
          subtitle="Top Students"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Total Students"
          value={dashboardData.statistics?.total_students || 0}
          icon={<SchoolIcon />}
          color={theme.palette.info.main}
          subtitle="Analyzed Students"
        />
      </Grid>
    </Grid>
  );

  const renderPredictionsTable = () => (
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>S1 Avg. (Actual)</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>S2 Avg. (Actual)</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                     S3/S4 Pred.
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {predictData?.students?.map((student) => (
                <TableRow key={student.student_id} hover>
                  <TableCell>
                      <Typography variant="body2" fontWeight="500">{student.student_name}</Typography>
                  </TableCell>
                  <TableCell align="center">
                      <Chip label={student.s1_avg} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">
                      <Chip label={student.s2_avg} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">
                      <Chip 
                        label={student.predicted_avg?.note?.toFixed(2) || "?"} 
                        color="primary" 
                        size="small"
                        sx={{ fontWeight: 'bold' }} 
                      />
                  </TableCell>
                </TableRow>
              ))}
              {(!predictData?.students || predictData.students.length === 0) && (
                  <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          No data available
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
  );

  const renderInsightsList = () => (
      <Grid container spacing={3}>
          {dashboardData.recommendations.map((rec) => (
              <Grid item xs={12} key={rec.student_id}>
                  <Card elevation={1}>
                      <CardContent>
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
                              <Box display="flex" alignItems="center" gap={1}>
                                  <AvatarIcon name={rec.student_name} />
                                  <Box>
                                      <Typography variant="subtitle1" fontWeight="bold">
                                          {rec.student_name}
                                      </Typography>
                                      <Chip 
                                        label={rec.performance_category} 
                                        size="small"
                                        // @ts-ignore
                                        color={STATUS_CONFIG[rec.performance_category]?.color || 'default'}
                                        variant="outlined"
                                        icon={STATUS_CONFIG[rec.performance_category]?.icon}
                                      />
                                  </Box>
                              </Box>
                              {rec.academic_orientation && (
                                  <Box textAlign="right">
                                      <Typography variant="caption" color="text.secondary" display="block">Suggested Guidance</Typography>
                                      <Typography variant="body2" fontWeight="medium" color="primary">
                                        {rec.academic_orientation.orientation}
                                      </Typography>
                                  </Box>
                              )}
                          </Box>
                          
                          <Divider sx={{ my: 1.5 }} />
                          
                          <Box>
                              <Typography variant="body2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <RecommendIcon fontSize="small" color="action" /> Recommendations
                              </Typography>
                              <List dense disablePadding>
                                  {rec.recommendations.map((item, idx) => (
                                      <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                                          <ListItemIcon sx={{ minWidth: 24 }}>
                                              <PlayArrowIcon fontSize="small" sx={{ fontSize: 16 }} />
                                          </ListItemIcon>
                                          <Typography variant="body2">{item.message}</Typography>
                                      </ListItem>
                                  ))}
                              </List>
                          </Box>
                      </CardContent>
                  </Card>
              </Grid>
          ))}
          {dashboardData.recommendations.length === 0 && (
              <Grid item xs={12}>
                  <Alert severity="info" variant="outlined">No recommendations generated pour cette classe.</Alert>
              </Grid>
          )}
      </Grid>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* HEADER */}
      <Box sx={{ mb: 4 }}>
          <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={2}>
                      <BrainIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                      <Box>
                          <Typography variant="h4" fontWeight="bold" color="text.primary">
                              EduMind AI Hub
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                              Predictive analysis and educational management area
                          </Typography>
                      </Box>
                  </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: theme.palette.background.default, border: `1px solid ${theme.palette.divider}`, display: 'flex', gap: 2, alignItems: 'center' }}>
                      <FormControl fullWidth size="small">
                          <InputLabel>Choose a Class</InputLabel>
                          <Select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            label="Choose a Class"
                          >
                            <MenuItem value=""><em>Aucune</em></MenuItem>
                            {classes.map((cls) => (
                              <MenuItem key={cls.id} value={cls.id}>{cls.nom}</MenuItem>
                            ))}
                          </Select>
                      </FormControl>
                      <Button 
                        variant="contained" 
                        size="large"
                        disabled={!selectedClass || loading.data}
                        onClick={runAnalysis}
                        startIcon={loading.data ? <CircularProgress size={20} color="inherit"/> : <SparklesIcon />}
                        sx={{ whiteSpace: 'nowrap', px: 3 }}
                      >
                          {loading.data ? "Analysis..." : "Run AI"}
                      </Button>
                  </Paper>
              </Grid>
          </Grid>
      </Box>

      {/* CONTENT AREA */}
      <Fade in={true}>
          <Box>
              {!analysisDone ? (
                  <Box 
                    sx={{ 
                        height: '50vh', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        textAlign: 'center',
                        bgcolor: theme.palette.background.paper,
                        borderRadius: 4,
                        border: `2px dashed ${theme.palette.divider}`,
                        p: 4
                    }}
                  >
                      <ScienceIcon sx={{ fontSize: 80, color: theme.palette.action.disabled, mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                          Ready to analyze
                      </Typography>
                      <Typography color="text.disabled" sx={{ maxWidth: 400 }}>
                          Select a class and click <strong>"Run AI"</strong> to run the predictive models (.pkl) and generate reports.
                      </Typography>
                  </Box>
              ) : (
                  <>
                      {renderOverviewValues()}
                      
                      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                          <Tabs 
                              value={activeTab} 
                              onChange={handleTabChange} 
                              sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: theme.palette.background.default }}
                          >
                              <Tab label="Classification" icon={<TimelineIcon />} iconPosition="start" {...TAB_STYLES} />
                              <Tab label="Future Predictions" icon={<TrendingUpIcon />} iconPosition="start" {...TAB_STYLES} />
                              <Tab label="Recommendations" icon={<BrainIcon />} iconPosition="start" {...TAB_STYLES} />
                          </Tabs>

                          <Box sx={{ p: 3 }}>
                              {activeTab === 0 && (
                                  <Box>
                                      <Box display="flex" justifyContent="space-between" mb={3}>
                                          <Typography variant="h6">Performance des Students</Typography>
                                      </Box>
                                      <TableContainer>
                                          <Table>
                                              <TableHead>
                                                  <TableRow>
                                                      <TableCell>Student</TableCell>
                                                      <TableCell align="center">General Average</TableCell>
                                                      <TableCell align="center">Statut IA</TableCell>
                                                      <TableCell align="right">Actions</TableCell>
                                                  </TableRow>
                                              </TableHead>
                                              <TableBody>
                                                  {dashboardData.classification.map((row) => (
                                                      <TableRow key={row.student_id}>
                                                          <TableCell 
// @ts-ignore
                                                          fontWeight="medium">{row.student_name}</TableCell>
                                                          <TableCell align="center">{row.average_score?.toFixed(2)}</TableCell>
                                                          <TableCell align="center">
                                                              <Chip 
                                                                label={row.performance_category} 
                                                                size="small"
                                                                // @ts-ignore
                                                                color={STATUS_CONFIG[row.performance_category]?.color || 'default'}
                                                                variant="filled"
                                                              />
                                                          </TableCell>
                                                          <TableCell align="right">
                                                              <Button size="small" variant="text" onClick={() => setActiveTab(2)}>
                                                                  View Details
                                                              </Button>
                                                          </TableCell>
                                                      </TableRow>
                                                  ))}
                                              </TableBody>
                                          </Table>
                                      </TableContainer>
                                  </Box>
                              )}
                              
                              {activeTab === 1 && renderPredictionsTable()}
                              
                              {activeTab === 2 && renderInsightsList()}
                          </Box>
                      </Paper>
                  </>
              )}
          </Box>
      </Fade>

      <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })}>
        <Alert 
// @ts-ignore
        severity={notification.severity}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
};

const AvatarIcon = ({ name }) => (
    <Box 
        sx={{ 
            width: 32, height: 32, borderRadius: '50%', 
            bgcolor: 'primary.main', color: 'white', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 'bold'
        }}
    >
        {name ? name.charAt(0) : '?'}
    </Box>
);

export default GlobalAIHub;
