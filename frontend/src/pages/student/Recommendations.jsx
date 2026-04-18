import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent,
  LinearProgress,
  Grid,
  Divider,
  // @ts-ignore
  Chip,
  useTheme,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Link,
  Alert as MuiAlert,
  alpha
} from "@mui/material";
import { 
  Lightbulb, 
  School, 
  // @ts-ignore
  CalendarToday,
  Warning,
  ExpandMore,
  ExpandLess,
  Notifications,
  Link as LinkIcon
} from "@mui/icons-material";
import { fetchWithTokenRefresh } from "../../utils/auth";
import { API_BASE_URL } from "../../config";

const StudentRecommendations = () => {
  const [recommendations, setRecommendations] = useState({
    academic_orientation: null,
    performance_recommendations: [],
    subject_recommendations: []
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [expandedItems, setExpandedItems] = useState({
    alerts: {},
    subjectRecs: {}
  });
  const theme = useTheme();
  
  const primaryColor = theme.palette.primary.main;
  const warningColor = theme.palette.warning.main;
  const errorColor = theme.palette.error.main;

  const fetchRecommendations = async () => {
    try {
      const response = await fetchWithTokenRefresh(`${API_BASE_URL}/student/recommendations/`);
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetchWithTokenRefresh(`${API_BASE_URL}/student/alerts/`);
      const data = await response.json();
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchRecommendations(), fetchAlerts()]);
    };
    fetchData();
  }, []);

  // @ts-ignore
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const toggleExpand = (type, id) => {
    setExpandedItems(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [id]: !prev[type][id]
      }
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return "Date inconnue";
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress sx={{ 
          height: 6, 
          backgroundColor: alpha(primaryColor, 0.15),
          '& .MuiLinearProgress-bar': {
            backgroundColor: primaryColor
          }
        }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: "bold", 
            color: primaryColor 
          }}
        >
          My Recommendations and Alerts
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          gutterBottom
        >
          View your personalized recommendations and important alerts
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
      </Box>

      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        sx={{ 
          mb: 3,
          '& .MuiTabs-indicator': {
            backgroundColor: primaryColor
          }
        }}
      >
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Lightbulb sx={{ mr: 1 }} />
              Recommendations
            </Box>
          } 
          sx={{ 
            color: tabValue === 0 ? primaryColor : 'text.secondary',
            fontWeight: tabValue === 0 ? 'bold' : 'normal'
          }}
        />
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Warning sx={{ mr: 1 }} />
              Alerts
              {alerts.length > 0 && (
                <Box 
                  sx={{
                    ml: 1,
                    backgroundColor: errorColor,
                    color: 'white',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem'
                  }}
                >
                  {alerts.length}
                </Box>
              )}
            </Box>
          } 
          sx={{ 
            color: tabValue === 1 ? errorColor : 'text.secondary',
            fontWeight: tabValue === 1 ? 'bold' : 'normal'
          }}
        />
      </Tabs>

      {tabValue === 0 ? (
        <Box>
          {/* Academic Orientation */}
          {recommendations.academic_orientation && (
            <Card sx={{ mb: 3, borderLeft: `4px solid ${primaryColor}` }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Recommended academic guidance:
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>{recommendations.academic_orientation.orientation}</strong>
                </Typography>
                <Typography variant="body2">
                  {recommendations.academic_orientation.description}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Performance Recommendations */}
          {recommendations.performance_recommendations.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                General Recommendations
              </Typography>
              <Grid container spacing={2}>
                {recommendations.performance_recommendations.map((rec, index) => (
                  <Grid item xs={12} sm={6} key={`perf-${index}`}>
                    <Card sx={{ height: "100%", borderLeft: `4px solid ${warningColor}` }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Lightbulb color="warning" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1">Recommandation</Typography>
                        </Box>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {rec.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(rec.date)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Subject Recommendations */}
          {recommendations.subject_recommendations.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Recommendations by Subject
              </Typography>
              <List sx={{ width: '100%' }}>
                {recommendations.subject_recommendations.map((rec, index) => (
                  <React.Fragment key={`subj-${index}`}>
                    <
// @ts-ignore
                    ListItem 
                      component="div"
                      button 
                      onClick={() => toggleExpand('subjectRecs', index)}
                      sx={{ 
                        mb: 1,
                        borderLeft: `4px solid ${primaryColor}`,
                        backgroundColor: alpha(primaryColor, 0.05)
                      }}
                    >
                      <ListItemIcon>
                        <School color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={rec.subject}
                        secondary={`Recommendation generated on ${formatDate(rec.date)}`}
                      />
                      <IconButton>
                        {expandedItems.subjectRecs[index] ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </ListItem>
                    <Collapse in={expandedItems.subjectRecs[index]} timeout="auto" unmountOnExit>
                      <Box sx={{ pl: 6, pr: 2, pb: 2 }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {rec.message}
                        </Typography>
                        <Typography variant="subtitle2" gutterBottom>
                          Recommended resources:
                        </Typography>
                        <List dense>
                          {rec.resources.map((resource, i) => (
                            <ListItem key={i}>
                              <ListItemIcon>
                                <LinkIcon color="primary" />
                              </ListItemIcon>
                              <Link href={resource.link} target="_blank" rel="noopener">
                                {resource.name}
                              </Link>
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Collapse>
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}

          {!recommendations.academic_orientation && 
           recommendations.performance_recommendations.length === 0 && 
           recommendations.subject_recommendations.length === 0 && (
            <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
              <Lightbulb sx={{ fontSize: 60, color: alpha(primaryColor, 0.7), mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No recommendations available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your recommendations will appear here as soon as they are generated.
              </Typography>
            </Paper>
          )}
        </Box>
      ) : (
        <Box>
          {alerts.length === 0 ? (
            <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
              <Notifications sx={{ fontSize: 60, color: alpha(errorColor, 0.7), mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No active alerts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vous n'avez aucune alerte en ce moment.
              </Typography>
            </Paper>
          ) : (
            <List sx={{ width: '100%' }}>
              {alerts.map((alert, index) => (
                <React.Fragment key={`alert-${index}`}>
                  <
// @ts-ignore
                  ListItem 
                    button 
                    onClick={() => toggleExpand('alerts', index)}
                    sx={{ 
                      mb: 1,
                      borderLeft: `4px solid ${errorColor}`,
                      backgroundColor: alpha(errorColor, 0.05)
                    }}
                  >
                    <ListItemIcon>
                      <Warning color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={alert.message}
                      secondary={`Generated on ${formatDate(alert.date_creation)}`}
                    />
                    <IconButton>
                      {expandedItems.alerts[index] ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </ListItem>
                  <Collapse in={expandedItems.alerts[index]} timeout="auto" unmountOnExit>
                    <Box sx={{ pl: 6, pr: 2, pb: 2 }}>
                      <MuiAlert severity="warning" sx={{ mb: 2 }}>
                        This alert indicates that you may need additional support.
                      </MuiAlert>
                      
                      {alert.course_recommendations?.length > 0 && (
                        <>
                          <Typography variant="subtitle2" gutterBottom>
                            Related subjects:
                          </Typography>
                          {alert.course_recommendations.map((course, i) => (
                            <Box key={i} sx={{ mb: 2 }}>
                              <Typography fontWeight="medium" sx={{ mb: 1 }}>
                                {course.subject}
                              </Typography>
                              <List dense>
                                {course.resources.map((resource, j) => (
                                  <ListItem key={j}>
                                    <ListItemIcon>
                                      <LinkIcon color="primary" />
                                    </ListItemIcon>
                                    <Link href={resource.link} target="_blank" rel="noopener">
                                      {resource.name}
                                    </Link>
                                  </ListItem>
                                ))}
                              </List>
                              {i < alert.course_recommendations.length - 1 && <Divider sx={{ my: 1 }} />}
                            </Box>
                          ))}
                        </>
                      )}
                    </Box>
                  </Collapse>
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      )}
    </Box>
  );
};

export default StudentRecommendations;  