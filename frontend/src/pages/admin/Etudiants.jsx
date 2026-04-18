import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
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
import PersonIcon from "@mui/icons-material/Person";

import { api, endpoints } from "../../services/api";

const AdminEtudiants = () => {
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredEtudiants, setFilteredEtudiants] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nom: "",
    prénom: "",
    email: "",
    téléphone: "",
    numeroApogee: "",
    classes: [],
  });
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("All");
  const theme = useTheme();

  // Fetch students and classes from the backend
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsResponse, classesResponse] = await Promise.all([
        api.get(endpoints.students.list),
        api.get(endpoints.classes.list)
      ]);

      const studentsData = await studentsResponse.json();
      const classesData = await classesResponse.json();
      
      setEtudiants(studentsData);
      setClasss(classesData);
      setFilteredEtudiants(studentsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle filtering students by class
  useEffect(() => {
    if (selectedClass === "All") {
      setFilteredEtudiants(etudiants);
    } else {
      const filtered = etudiants.filter(
        (etudiant) =>
          etudiant.classe && etudiant.classe.nom === selectedClass
      );
      setFilteredEtudiants(filtered);
    }
  }, [selectedClass, etudiants]);

  // Open dialog for adding/editing a student
  const handleOpenDialog = (etudiant = null) => {
    if (etudiant) {
      setFormData({
        id: etudiant.id,
        nom: etudiant.last_name,
        prénom: etudiant.first_name,
        email: etudiant.email,
        téléphone: etudiant.phone,
        numeroApogee: etudiant.n_appogie,
        classes: etudiant.classe ? [etudiant.classe.nom] : [],
      });
      setEditMode(true);
    } else {
      setFormData({
        id: null,
        nom: "",
        prénom: "",
        email: "",
        téléphone: "",
        numeroApogee: "",
        classes: [],
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
      [name]: name === "classes" ? [value] : value,
    });
  };

  // Submit form (create or update student)
  const handleSubmit = async () => {
    try {
      let response;
      const data = {
        last_name: formData.nom,
        first_name: formData.prénom,
        email: formData.email,
        phone: formData.téléphone,
        n_appogie: formData.numeroApogee,
        classes: formData.classes,
      };

      if (editMode) {
        response = await api.put(endpoints.students.update(formData.id), data);
      } else {
        response = await api.post(endpoints.students.create, data);
      }

      if (response.ok) {
        await fetchStudents();
        setOpenDialog(false);
      } else {
        throw new Error("Request error");
      }
    } catch (error) {
      setError("Une erreur est survenue lors de la sauvegarde");
    }
  };

  // Delete a student
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(endpoints.students.delete(id));

      const data = await response.json();
      if (data.success) {
        await fetchStudents();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setError("Error deleting item");
    }
  };

  // Handle CSV file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await api.post(endpoints.students.import, formData, true);
  
      if (response.ok) {
        await fetchStudents();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error importing CSV file");
      }
    } catch (error) {
      setError(error.message || "Une erreur est survenue");
    }
  };

  // Handle downloading the CSV template
  const downloadTemplate = () => {
    const headers = ["Last Name", "First Name", "Email", "Phone", "Apogee Number", "Class"];
    let csvContent = headers.join(",") + "\n";

    if (etudiants.length > 0) {
      etudiants.forEach((etudiant) => {
        const row = [
          etudiant.last_name,
          etudiant.first_name,
          etudiant.email,
          etudiant.phone,
          etudiant.n_appogie,
          etudiant.classe ? etudiant.classe.nom : ""
        ];
        csvContent += row.join(",") + "\n";
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_etudiants.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary.main" fontWeight="bold" gutterBottom>
          Student Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Manage your students and their information
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
      </Box>

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error message */}
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}

      {/* Statistics Cards */}
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
                  Total des Students
                </Typography>
                <PersonIcon 
                  fontSize="medium" 
                  sx={{ color: theme.palette.primary.main }} 
                />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
                  {etudiants.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Registered students
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
        >
          Download Template
        </Button>
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
          sx={{ mr: 2 }}
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
        >
          Nouvel Student
        </Button>
      </Box>

      {/* Sélecteur de classe pour filtrer les étudiants */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Filter by class
        </Typography>
        <Grid container spacing={2}>
          {["All", ...classes.map(c => c.nom)].map((classe) => (
            <Grid item key={classe}>
              <Button
                variant={selectedClass === classe ? "contained" : "outlined"}
                color="primary"
                onClick={() => setSelectedClass(classe)}
                sx={{ 
                  textTransform: 'none',
                  transition: "all 0.3s",
                  '&:hover': {
                    transform: selectedClass !== classe ? "scale(1.05)" : "none"
                  }
                }}
              >
                {classe}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Table of students */}
      <Card elevation={2}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Full Name</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>N° Apogee</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Class</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEtudiants && filteredEtudiants.length > 0 ? (
                  filteredEtudiants.map((etudiant) => (
                    <TableRow 
                      key={etudiant.id}
                      hover
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell>{etudiant.first_name} {etudiant.last_name}</TableCell>
                      <TableCell align="center">{etudiant.n_appogie}</TableCell>
                      <TableCell align="center">{etudiant.email}</TableCell>
                      <TableCell align="center">{etudiant.phone}</TableCell>
                      <TableCell align="center">
                        {etudiant.classe ? etudiant.classe.nom : "No class"}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(etudiant)}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(etudiant.id)}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No students available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog for adding/editing student */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? "Edit Student" : "Create a New Student"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nom"
                label="Last Name"
                fullWidth
                value={formData.nom}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="prénom"
                label="First Name"
                fullWidth
                value={formData.prénom}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="numeroApogee"
                label="Apogee Number"
                fullWidth
                value={formData.numeroApogee}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="téléphone"
                label="Phone"
                fullWidth
                value={formData.téléphone}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                name="classes"
                label="Class"
                fullWidth
                value={formData.classes[0] || ""}
                onChange={handleInputChange}
                SelectProps={{ native: false }}
              >
                {classes.map((classe) => (
                  <MenuItem key={classe.nom} value={classe.nom}>
                    {classe.nom}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminEtudiants;