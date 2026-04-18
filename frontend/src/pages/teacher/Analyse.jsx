import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  useTheme,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { fetchWithTokenRefresh, checkAuthStatus, getUserRole } from '../../utils/auth';
import { API_BASE_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import CategoryIcon from '@mui/icons-material/Category';

const TeacherAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classifications, setClassifications] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  // Vérification de l'authentification et du rôle de l'utilisateur
  useEffect(() => {
    const checkAuth = async () => {
      const user = await checkAuthStatus();
      if (!user || getUserRole() !== 'teacher') {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  // Récupération des matières au chargement du composant
  useEffect(() => {
    const fetchMatieres = async () => {
      setLoading(true);
      try {
        const response = await fetchWithTokenRefresh(`${API_BASE_URL}/teacher/matieres/`);
        const data = await response.json();
        if (data.success) {
          setMatieres(data.matieres);
          if (data.matieres.length > 0) {
            setSelectedMatiere(data.matieres[0].id);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatieres();
  }, []);

  // Récupération des données lorsque selectedMatiere change
  useEffect(() => {
    if (selectedMatiere) {
      fetchClassifications(selectedMatiere);
    }
  }, [selectedMatiere]);

  // Récupération des classifications uniquement
  const fetchClassifications = async (matiereId) => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetchWithTokenRefresh(`${API_BASE_URL}/teacher/classifications/?matiere_id=${matiereId}`);
      const data = await response.json();
      if (data.success) {
        setClassifications(data.classifications);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch classifications');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (selectedMatiere) {
      fetchClassifications(selectedMatiere);
    }
  };

  const getCategoryColor = (category) => {
    if (!category) return theme.palette.grey[500];
    
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('bon performeur') || categoryLower.includes('excellent')) {
      return theme.palette.success.main;
    } else if (categoryLower.includes('moyenne performance')) {
      return theme.palette.warning.main;
    } else if (categoryLower.includes('à risque')) {
      return theme.palette.error.main;
    } else {
      return theme.palette.grey[500];
    }
  };

  return (
    <Box>
      {/* Section d'en-tête */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="h4" color="primary.main" fontWeight="bold">
            Student Classifications
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Performance levels by subject
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
      </Box>

      {/* Section de filtres et d'actions */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth sx={{ bgcolor: 'background.paper' }}>
              <InputLabel id="matiere-select-label">Subject</InputLabel>
              <Select
                labelId="matiere-select-label"
                value={selectedMatiere}
                onChange={(e) => setSelectedMatiere(e.target.value)}
                label="Subject"
              >
                {matieres.map((matiere) => (
                  <MenuItem key={matiere.id} value={matiere.id}>
                    {matiere.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Tooltip title="Refresh data">
              <IconButton 
                onClick={handleRefresh} 
                color="primary"
                sx={{ 
                  bgcolor: 'rgba(76, 175, 80, 0.08)',
                  '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.16)' },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>

      {/* Indicateur de chargement */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {/* Message d'erreur */}
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}

      {!loading && (
        <Card elevation={2} sx={{ overflow: 'hidden' }}>
          <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                  <TableRow>
                    <TableCell 
// @ts-ignore
                    fontWeight="bold">Student</TableCell>
                    <TableCell>Subject Performance</TableCell>
                    <TableCell align="center">Subject Grade</TableCell>
                    <TableCell align="center" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                        AI Prediction (General)
                    </TableCell>
                    <TableCell align="center">Overall AI Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classifications.map((classification) => (
                    <TableRow key={classification.student_id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{classification.student_name}</TableCell>
                      <TableCell>
                        <Chip 
                          icon={<CategoryIcon />}
                          label={classification.performance_category} 
                          size="small"
                          sx={{ 
                            backgroundColor: getCategoryColor(classification.performance_category),
                            color: 'white'
                          }} 
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>{classification.average_score}</TableCell>
                      <TableCell align="center">
                          {classification.ai_prediction !== "-" ? (
                              <Chip 
                                label={classification.ai_prediction} 
                                variant="outlined" 
                                color="primary" 
                                size="small" 
                                sx={{ fontWeight: 'bold' }}
                              />
                          ) : (
                              <Typography variant="caption" color="text.disabled">N/A</Typography>
                          )}
                      </TableCell>
                      <TableCell align="center">
                          {classification.ai_category && classification.ai_category !== "Not Analyzed" ? (
                             <Chip
                                label={classification.ai_category}
                                size="small"
                                sx={{ 
                                    backgroundColor: getCategoryColor(classification.ai_category),
                                    color: 'white',
                                    fontWeight: 500
                                }}
                             />
                          ) : (
                              <Typography variant="caption" color="text.disabled">-</Typography>
                          )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {classifications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        No data available. Select a subject.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TeacherAnalysis;