import React, { useState, useEffect, useCallback } from "react";
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
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Grid,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Card,
  Divider,
  Chip,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GetAppIcon from "@mui/icons-material/GetApp";
import { getUserRole } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import { api, endpoints } from "../../services/api";

const TeacherNotes = () => {
  const [notes, setNotes] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    matiere_id: "",
    etudiant_id: "",
    note_module: "",
    note_devoir_projet: "",
    assiduite: "",
    presence: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  // Fetch Matieres and Grades
  useEffect(() => {
    setLoading(true);
    fetchMatieres().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedMatiere) {
      setLoading(true);
      fetchStudents()
        .then(() => fetchGrades())
        .finally(() => setLoading(false));
    }
  }, [selectedMatiere]);

  const fetchMatieres = async () => {
    try {
      const response = await api.get(endpoints.teacherDashboard.matieres);
      const data = await response.json();
      if (data.success) {
        setMatieres(data.matieres);
      }
    } catch (error) {
      console.error("Error fetching matieres:", error);
      setSnackbar({
        open: true,
        message: "Error retrieving subjects",
        severity: "error",
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get(
        `${endpoints.teacherDashboard.studentsByMatiere}?matiere_id=${selectedMatiere}`
      );
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setSnackbar({
        open: true,
        message: "Error retrieving students",
        severity: "error",
      });
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await api.get(
        `${endpoints.teacherDashboard.notes}?matiere_id=${selectedMatiere}`
      );
      const data = await response.json();
      if (data.success) {
        const notesWithStudents = data.notes.map((note) => {
          const student = students.find((s) => s.id === note.etudiant);
          return {
            ...note,
            etudiant: student || { id: note.etudiant },
          };
        });
        setGrades(notesWithStudents);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      setSnackbar({
        open: true,
        message: "Error retrieving grades",
        severity: "error",
      });
    }
  };

  // Handle CSV file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setSnackbar({
        open: true,
        message: "Please select a CSV file",
        severity: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post(endpoints.notes.teacherImport, formData, true);

      const data = await response.json();
      if (response.ok) {
        fetchGrades();
        setSnackbar({
          open: true,
          message: data.message || "Grades imported successfully",
          severity: "success",
        });
      } else {
        throw new Error(data.message || "Error importing CSV file");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Une erreur est survenue",
        severity: "error",
      });
    }
  };

  // Handle downloading the CSV template
  const downloadTemplate = () => {
    if (!selectedMatiere) {
      setSnackbar({
        open: true,
        message: "Please select a subject before downloading the template",
        severity: "warning",
      });
      return;
    }

    const headers = [
      "matiere_id",
      "etudiant_id",
      "etudiant_nom",
      "note_module",
      "note_devoir_projet",
      "assiduite",
      "presence",
    ];
    const csvContent = [
      headers.join(","),
      ...students.map((student) => {
        return [
          selectedMatiere,
          student.id,
          `${student.first_name} ${student.last_name}`,
          "", "", "", "",
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `template_notes_${selectedMatiere}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Open dialog for editing a note
  const handleOpenDialog = (note = null) => {
    if (note) {
      setFormData({
        id: note.id,
        matiere_id: note.matiere?.id || selectedMatiere,
        etudiant_id: note.etudiant?.id || "",
        note_module: note.note_module || "",
        note_devoir_projet: note.note_devoir_projet || "",
        assiduite: note.assiduite || "",
        presence: note.presence || "",
      });
      setEditMode(true);
    } else {
      setFormData({
        id: null,
        matiere_id: selectedMatiere,
        etudiant_id: "",
        note_module: "",
        note_devoir_projet: "",
        assiduite: "",
        presence: "",
      });
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Submit form (create or update note)
  const handleSubmit = async () => {
    try {
      const response = await api.post(endpoints.notes.teacherCreateUpdate, formData);

      const data = await response.json();
      if (response.ok) {
        fetchGrades();
        setSnackbar({
          open: true,
          message: data.message || "Grade created/updated successfully",
          severity: "success",
        });
        handleCloseDialog();
      } else {
        throw new Error(data.message || "Request error");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Une erreur est survenue",
        severity: "error",
      });
    }
  };

  // Delete a note
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(endpoints.notes.teacherDelete(id));

      if (response.ok) {
        fetchGrades();
        setSnackbar({
          open: true,
          message: "Grade deleted successfully",
          severity: "info",
        });
      } else {
        throw new Error("Error deleting item");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Une erreur est survenue",
        severity: "error",
      });
    }
  };

  // Handle Matiere filter change
  const handleMatiereFilterChange = (e) => {
    setSelectedMatiere(e.target.value);
  };

  // Redirect if user is not a teacher
  useEffect(() => {
    const userRole = getUserRole();
    if (userRole !== "teacher") {
      navigate("/login");
    }
  }, [navigate]);

  // Function to determine score color (similar to StudentGrades)
  const getScoreColor = (score) => {
    if (!score && score !== 0) return theme.palette.text.secondary;
    if (score >= 16) return theme.palette.success.main;
    if (score >= 12) return theme.palette.primary.main;
    if (score >= 8) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="h4" color="primary.main" fontWeight="bold">
            Grade Management
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Assign and manage your students' grades
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
      </Box>

      {/* Actions and Filters Section */}
      <Box sx={{ 
        display: "flex", 
        flexDirection: { xs: "column", md: "row" }, 
        justifyContent: "space-between", 
        alignItems: { xs: "flex-start", md: "center" },
        mb: 3, 
        gap: 2 
      }}>
        {/* Matiere Filter */}
        <FormControl sx={{ minWidth: 240, bgcolor: "background.paper" }}>
          <InputLabel id="matiere-filter-label">Filter by Subject</InputLabel>
          <Select
            labelId="matiere-filter-label"
            value={selectedMatiere}
            onChange={handleMatiereFilterChange}
            label="Filter by Subject"
          >
            <MenuItem value="">All les Subjects</MenuItem>
            {matieres.map((matiere) => (
              <MenuItem key={matiere.id} value={matiere.id}>
                {matiere.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        
        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained" 
            startIcon={<GetAppIcon />}
            onClick={downloadTemplate}
            sx={{ 
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": {
                backgroundColor: "primary.dark"
              }
            }}
          >
            Download Template
          </Button>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": {
                backgroundColor: "primary.dark"
              }
            }}
          >
            Importer CSV
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={handleFileUpload}
            />
          </Button>
        </Box>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {/* Table of Students and Grades */}
      {!loading && (
        <Card elevation={2} sx={{ overflow: "hidden", bgcolor: theme.palette.background.paper }}>
          <TableContainer component={Paper} elevation={0} sx={{ bgcolor: theme.palette.background.paper }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                  <TableCell 
                    sx={{ 
                      fontWeight: "bold", 
                      color: "text.primary",
                      fontSize: "1rem"
                    }}
                  >
                    Student
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
                    align="center" 
                    sx={{ 
                      fontWeight: "bold", 
                      color: "text.primary",
                      fontSize: "1rem"
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.length > 0 ? (
                  students.map((student) => {
                    const note = notes.find((n) => n.etudiant.id === student.id);
                    return (
                      <TableRow 
                        key={student.id}
                        sx={{
                          '&:nth-of-type(odd)': {
                            backgroundColor: theme.palette.action.hover,
                          },
                          '&:hover': {
                            backgroundColor: theme.palette.action.selected,
                          },
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight="medium">
                            {`${student.first_name} ${student.last_name}`}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {note ? (
                            <Chip 
                              label={note.note_module} 
                              sx={{ 
                                fontWeight: "bold", 
                                color: "white", 
                                backgroundColor: getScoreColor(note.note_module) 
                              }} 
                            />
                          ) : "-"}
                        </TableCell>
                        <TableCell align="center">
                          {note ? (
                            <Chip 
                              label={note.note_devoir_projet} 
                              sx={{ 
                                fontWeight: "bold", 
                                color: "white", 
                                backgroundColor: getScoreColor(note.note_devoir_projet) 
                              }} 
                            />
                          ) : "-"}
                        </TableCell>
                        <TableCell align="center">
                          {note ? (
                            <Chip 
                              label={note.assiduite} 
                              sx={{ 
                                fontWeight: "bold", 
                                color: "white", 
                                backgroundColor: getScoreColor(note.assiduite) 
                              }} 
                            />
                          ) : "-"}
                        </TableCell>
                        <TableCell align="center">
                          {note && note.presence !== undefined && note.presence !== null ? (
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
                          ) : "-"}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            aria-label="Edit"
                            onClick={() => handleOpenDialog(note || { etudiant: student, matiere: { id: selectedMatiere } })}
                            sx={{ 
                              color: theme.palette.primary.main,
                              "&:hover": { 
                                backgroundColor: "rgba(76, 175, 80, 0.04)" 
                              }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          {note && (
                            <IconButton
                              color="error"
                              aria-label="Delete"
                              onClick={() => handleDelete(note.id)}
                              sx={{ 
                                "&:hover": { 
                                  backgroundColor: "rgba(244, 67, 54, 0.04)" 
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="subtitle1" color="text.secondary">
                        {selectedMatiere 
                          ? "No students found for this subject."
                          : "Please select a subject to display students."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Dialog for adding/editing a note */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.paper
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          fontWeight: 'bold',
          color: 'primary.main'
        }}>
          {editMode ? "Edit Grade" : "Add Grade"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="note_module"
                label="Note Module"
                fullWidth
                value={formData.note_module}
                onChange={handleInputChange}
                required
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="note_devoir_projet"
                label="Note Devoir/Projet"
                fullWidth
                value={formData.note_devoir_projet}
                onChange={handleInputChange}
                required
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="assiduite"
                label="Attendance"
                fullWidth
                value={formData.assiduite}
                onChange={handleInputChange}
                required
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="presence"
                label="Presence"
                fullWidth
                value={formData.presence}
                onChange={handleInputChange}
                required
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{ 
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                backgroundColor: 'primary.dark',
              },
            }}
          >
            {editMode ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          // @ts-ignore
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherGrades;