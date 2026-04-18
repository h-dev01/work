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
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Divider,
  CircularProgress,
  useTheme,
  MenuItem
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GetAppIcon from "@mui/icons-material/GetApp";
import SchoolIcon from "@mui/icons-material/School";
import { refreshToken, checkAuthStatus, getUserRole } from "../../utils/auth";
import { API_BASE_URL } from "../../config";
import { useNavigate } from "react-router-dom";

const AdminNotes = () => {
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
  const [filters, setFilters] = useState({
    matiere: "",
  });
  const navigate = useNavigate();
  const theme = useTheme();

  // Token refresh fetch wrapper
  const fetchWithTokenRefresh = async (url, options = {}) => {
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
  
    if (response.status === 401) {
      const newAccessToken = await refreshToken();
      if (newAccessToken) {
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      } else {
        throw new Error("Failed to refresh token");
      }
    }
  
    return response;
  };

  // Fetch Matieres and Grades
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [matieresResponse] = await Promise.all([
          fetchWithTokenRefresh(`${API_BASE_URL}/admin/matieres/`)
        ]);
        const matieresData = await matieresResponse.json();
        if (matieresData.success) {
          setMatieres(matieresData.matieres);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setSnackbar({
          open: true,
          message: "Error retrieving data",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedMatiere) {
      setLoading(true);
      const fetchData = async () => {
        try {
          const [studentsResponse, notesResponse] = await Promise.all([
            fetchWithTokenRefresh(`${API_BASE_URL}/admin/students-by-matiere/?matiere_id=${selectedMatiere}`),
            fetchWithTokenRefresh(`${API_BASE_URL}/admin/notes/?matiere_id=${selectedMatiere}`)
          ]);

          const studentsData = await studentsResponse.json();
          const notesData = await notesResponse.json();

          if (studentsData.success) {
            setStudents(studentsData.students);
          }

          if (notesData.success) {
            const notesWithStudents = notesData.notes.map((note) => {
              const student = studentsData.students.find((s) => s.id === note.etudiant);
              return {
                ...note,
                etudiant: student || { id: note.etudiant },
              };
            });
            setNotes(notesWithStudents);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setSnackbar({
            open: true,
            message: "Error retrieving data",
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [selectedMatiere]);

  // Handle CSV file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await fetchWithTokenRefresh(`${API_BASE_URL}/admin/notes/import/`, {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Refresh notes after import
        const notesResponse = await fetchWithTokenRefresh(`${API_BASE_URL}/admin/notes/?matiere_id=${selectedMatiere}`);
        const notesData = await notesResponse.json();
        
        if (notesData.success) {
          const notesWithStudents = notesData.notes.map((note) => {
            const student = students.find((s) => s.id === note.etudiant);
            return {
              ...note,
              etudiant: student || { id: note.etudiant },
            };
          });
          setNotes(notesWithStudents);
        }

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

  // Filtered Grades
  const filteredNotes = notes.filter((note) => {
    return filters.matiere === "" || note.matiere?.id === parseInt(filters.matiere);
  });

  // Open dialog for adding/editing a note
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

  // Submit form (create or update note)
  const handleSubmit = async () => {
    try {
      const url = `${API_BASE_URL}/admin/notes/create-update/`;
      const method = "POST";

      const response = await fetchWithTokenRefresh(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        // Refresh notes after creation/update
        const notesResponse = await fetchWithTokenRefresh(`${API_BASE_URL}/admin/notes/?matiere_id=${selectedMatiere}`);
        const notesData = await notesResponse.json();
        
        if (notesData.success) {
          const notesWithStudents = notesData.notes.map((note) => {
            const student = students.find((s) => s.id === note.etudiant);
            return {
              ...note,
              etudiant: student || { id: note.etudiant },
            };
          });
          setNotes(notesWithStudents);
        }

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
      const response = await fetchWithTokenRefresh(`${API_BASE_URL}/admin/notes/delete/${id}/`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh notes after deletion
        const notesResponse = await fetchWithTokenRefresh(`${API_BASE_URL}/admin/notes/?matiere_id=${selectedMatiere}`);
        const notesData = await notesResponse.json();
        
        if (notesData.success) {
          const notesWithStudents = notesData.notes.map((note) => {
            const student = students.find((s) => s.id === note.etudiant);
            return {
              ...note,
              etudiant: student || { id: note.etudiant },
            };
          });
          setNotes(notesWithStudents);
        }

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

  // Redirect if user is not an admin
  useEffect(() => {
    const userRole = getUserRole();
    if (userRole !== "admin") {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary.main" fontWeight="bold" gutterBottom>
          Grade Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Manage your students' grades by subject
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
      </Box>

      {/* Statistics Card */}
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
                  Total Grades
                </Typography>
                <SchoolIcon 
                  fontSize="medium" 
                  sx={{ color: theme.palette.primary.main }} 
                />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
                  {notes.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Saved grades
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<GetAppIcon />}
          onClick={downloadTemplate}
          sx={{ mr: 2 }}
          disabled={!selectedMatiere}
        >
          Download Template
        </Button>
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
          sx={{ mr: 2 }}
          disabled={!selectedMatiere}
        >
          Importer CSV
          <input
            type="file"
            hidden
            accept=".csv"
            onChange={handleFileUpload}
          />
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={!selectedMatiere}
        >
          Nouvelle Note
        </Button>
      </Box>

      {/* Matiere Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Filter by subject
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Subject"
              name="matiere"
              value={selectedMatiere}
              onChange={(e) => setSelectedMatiere(e.target.value)}
            >
              <MenuItem value="">Select a Subject</MenuItem>
              {matieres.map((matiere) => (
                <MenuItem key={matiere.id} value={matiere.id}>
                  {matiere.nom}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Table of Students and Grades */}
      <Card elevation={2}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Note Module</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Note Devoir/Projet</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Attendance</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Presence</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedMatiere && students.length > 0 ? (
                  students.map((student) => {
                    const note = notes.find((n) => n.etudiant.id === student.id);
                    return (
                      <TableRow
                        key={student.id}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                        <TableCell align="center">{note ? note.note_module : "-"}</TableCell>
                        <TableCell align="center">{note ? note.note_devoir_projet : "-"}</TableCell>
                        <TableCell align="center">{note ? note.assiduite : "-"}</TableCell>
                        <TableCell align="center">{note ? note.presence : "-"}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(note || { etudiant: student, matiere: { id: selectedMatiere } })}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {note && (
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(note.id)}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {selectedMatiere 
                        ? "No students available for this subject" 
                        : "Select a subject to display grades"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog for adding/editing a note */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? "Edit Grade" : "Add Grade"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="note_module"
                label="Note Module"
                fullWidth
                type="number"
                value={formData.note_module}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="note_devoir_projet"
                label="Note Devoir/Projet"
                fullWidth
                type="number"
                value={formData.note_devoir_projet}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="assiduite"
                label="Attendance"
                fullWidth
                type="number"
                value={formData.assiduite}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="presence"
                label="Presence"
                fullWidth
                type="number"
                value={formData.presence}
                onChange={handleInputChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          // @ts-ignore
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminNotes;