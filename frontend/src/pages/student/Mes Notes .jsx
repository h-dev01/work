import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  LinearProgress,
  useTheme,
  Card,
  Divider,
  Chip
} from "@mui/material";
import { 
  
  TimelineOutlined 
} from "@mui/icons-material";
import { fetchWithTokenRefresh } from "../../utils/auth";
import { API_BASE_URL } from "../../config";

const StudentNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const fetchData = async () => {
    try {
      const response = await fetchWithTokenRefresh(`${API_BASE_URL}/student/notes/`);
      const data = await response.json();


      if (data.success && Array.isArray(data.notes)) {
        const filteredNotes = data.notes.filter(note => note.date_ajout);

        setNotes(filteredNotes);
      } else {
        console.error("Invalid API response format:", data);
        setNotes([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error retrieving data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress color="primary" />
      </Box>
    );
  }

  // Function to determine color based on score
  const getScoreColor = (score) => {
    if (!score && score !== 0) return theme.palette.text.secondary;
    if (score >= 16) return theme.palette.success.main;
    if (score >= 12) return theme.palette.primary.main;
    if (score >= 8) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Function to format date in a more readable way
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          
          <Typography variant="h4" color="primary.main" fontWeight="bold">
            My Grades
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          View your grades by subject
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
      </Box>

      {/* Grades Table */}
      <Card elevation={2} sx={{ overflow: "hidden", bgcolor: theme.palette.background.paper }}>
        <TableContainer component={Paper} elevation={0} sx={{ bgcolor: theme.palette.background.paper}}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "rgba(0, 0, 0, 0.03)" }}>
                <TableCell 
                  sx={{ 
                    fontWeight: "bold", 
                    color: "text.primary",
                    fontSize: "1rem"
                  }}
                >
                  Subject
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    fontWeight: "bold", 
                    color: "text.primary",
                    fontSize: "1rem"
                  }}
                >
                  Note Module
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    fontWeight: "bold", 
                    color: "text.primary",
                    fontSize: "1rem"
                  }}
                >
                  Note Devoir/Projet
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    fontWeight: "bold", 
                    color: "text.primary",
                    fontSize: "1rem"
                  }}
                >
                  Attendance
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    fontWeight: "bold", 
                    color: "text.primary",
                    fontSize: "1rem"
                  }}
                >
                  Presence
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    fontWeight: "bold", 
                    color: "text.primary",
                    fontSize: "1rem"
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    
                    Date
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notes.length > 0 ? (
                notes.map((note) => (
                  <TableRow 
                    key={note.id}
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: 'rgba(0, 0, 0, 0.01)',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight="medium">
                        {typeof note.matiere === 'object' ? note.matiere.nom : `Subject ID: ${note.matiere}`}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={note.note_module || "N/A"} 
                        sx={{ 
                          fontWeight: "bold", 
                          color: "white", 
                          backgroundColor: getScoreColor(note.note_module) 
                        }} 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={note.note_devoir_projet || "N/A"} 
                        sx={{ 
                          fontWeight: "bold", 
                          color: "white", 
                          backgroundColor: getScoreColor(note.note_devoir_projet) 
                        }} 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={note.assiduite || "N/A"} 
                        sx={{ 
                          fontWeight: "bold", 
                          color: "white", 
                          backgroundColor: getScoreColor(note.assiduite) 
                        }} 
                      />
                    </TableCell>
                    <TableCell align="center">
                      {note.presence !== undefined && note.presence !== null ? (
                        <Chip 
                          label={`${note.presence}%`} 
                          sx={{ 
                            fontWeight: "bold", 
                            color: "white", 
                            backgroundColor: note.presence >= 90 
                              ? theme.palette.success.main 
                              : note.presence >= 75 
                                ? theme.palette.primary.main 
                                : note.presence >= 50 
                                  ? theme.palette.warning.main 
                                  : theme.palette.error.main 
                          }} 
                        />
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: "medium", 
                          color: theme.palette.text.secondary 
                        }}
                      >
                        {formatDate(note.date_ajout)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      No grades available.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default StudentNotes;