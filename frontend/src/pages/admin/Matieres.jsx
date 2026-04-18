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
  MenuItem,
  IconButton,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Divider,
  CircularProgress,
  useTheme
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GetAppIcon from "@mui/icons-material/GetApp";
import SchoolIcon from "@mui/icons-material/School";

import { api, endpoints } from "../../services/api";

const AdminMatieres = () => {
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nom: "",
    coefficient: "",
    semestre: "",
    classe: null,
    enseignant: null,
  });
  const [editMode, setEditMode] = useState(false);
  const [classes, setClasses] = useState([]);
  const [enseignants, setTeachers] = useState([]);
  const [filters, setFilters] = useState({
    semestre: "",
    classe: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [error, setError] = useState(null);
  const theme = useTheme();

  // Fetch matieres, classes, and enseignants from the backend
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [matieresResponse, classesResponse, enseignantsResponse] = await Promise.all([
        api.get(endpoints.subjects.list),
        api.get(endpoints.classes.list),
        api.get(endpoints.teachers.list)
      ]);

      const matieresData = await matieresResponse.json();
      const classesData = await classesResponse.json();
      const enseignantsData = await enseignantsResponse.json();
      
      setMatieres(matieresData);
      setClasses(classesData);
      setTeachers(enseignantsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch matieres from the backend
  const fetchMatieres = async () => {
    try {
      const response = await api.get(endpoints.subjects.list);
      const data = await response.json();
      setMatieres(data);
    } catch (error) {
      console.error("Error fetching matieres:", error);
      setSnackbar({
        open: true,
        message: "Error loading subjects",
        severity: "error",
      });
    }
  };

  // Handle CSV file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
  
    try {
      const response = await api.post(endpoints.subjects.import, formDataUpload, true);
  
      if (response.ok) {
        fetchMatieres();
        setSnackbar({
          open: true,
          message: "Subjects imported successfully",
          severity: "success",
        });
      } else {
        const errorData = await response.json();
        console.error("Server Error:", errorData);
        throw new Error(errorData.error || "Error importing CSV file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setSnackbar({
        open: true,
        message: error.message || "Une erreur est survenue",
        severity: "error",
      });
    }
  };

  // Handle downloading the CSV template
  const downloadTemplate = () => {
    const headers = ["Nom", "Coefficient", "Semestre", "Classe", "Email"];
    let csvContent = headers.join(",") + "\n";

    if (matieres.length > 0) {
        matieres.forEach((matiere) => {
            const row = [
                matiere.nom,
                matiere.coefficient,
                matiere.semestre,
                matiere.classe?.nom || "Unknown",
                matiere.enseignant?.email || "Unknown",
            ];
            csvContent += row.join(",") + "\n";
        });
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_matieres.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Open dialog for adding/editing a matiere
  const handleOpenDialog = (matiere = null) => {
    if (matiere) {
      setFormData({
        id: matiere.id,
        nom: matiere.nom,
        coefficient: matiere.coefficient,
        semestre: matiere.semestre,
        classe: matiere.classe?.id || null,
        enseignant: matiere.enseignant?.id || null,
      });
      setEditMode(true);
    } else {
      setFormData({
        id: null,
        nom: "",
        coefficient: "",
        semestre: "",
        classe: null,
        enseignant: null,
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

  // Filter matieres by semestre and classe
  const filteredMatieres = matieres.filter((matiere) => {
    return (
      (filters.semestre === "" || matiere.semestre === parseInt(filters.semestre)) &&
      (filters.classe === "" || matiere.classe?.id === parseInt(filters.classe))
    );
  });

  // Submit form (create or update a matiere)
  const handleSubmit = async () => {
    try {
      let response;
      const data = {
        nom: formData.nom,
        coefficient: parseFloat(formData.coefficient),
        semestre: parseInt(formData.semestre),
        classe_id: formData.classe,
        enseignant_id: formData.enseignant,
      };

      if (editMode) {
        response = await api.put(endpoints.subjects.update(formData.id), data);
      } else {
        response = await api.post(endpoints.subjects.create, data);
      }

      if (response.ok) {
        fetchMatieres();
        setSnackbar({
          open: true,
          message: editMode
            ? "Subject updated successfully"
            : "Subject created successfully",
          severity: "success",
        });
        handleCloseDialog();
      } else {
        throw new Error("Request error");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Une erreur est survenue",
        severity: "error",
      });
    }
  };

  // Delete a matiere
  const handleDelete = async (id) => {
    if (!id) {
      console.error("Error: subject ID is not defined");
      return;
    }

    try {
      const response = await api.delete(endpoints.subjects.delete(id));
      const data = await response.json();
      
      if (data.success) {
        setMatieres(matieres.filter((matiere) => matiere.id !== id));
        setSnackbar({
          open: true,
          message: "Subject deleted successfully",
          severity: "success",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error deleting item :", error);
      setSnackbar({
        open: true,
        message: "Error deleting item",
        severity: "error",
      });
    }
  };

  // Close Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary.main" fontWeight="bold" gutterBottom>
          Subject Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Manage your subjects and their information
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
      </Box>

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
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
                  Total Subjects
                </Typography>
                <SchoolIcon 
                  fontSize="medium" 
                  sx={{ color: theme.palette.primary.main }} 
                />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
                  {matieres.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Saved subjects
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
          New Subject
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Filter by semester and class
        </Typography>
        <Grid container spacing={2}>
          {/* Semester Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Semestre"
              name="semestre"
              value={filters.semestre}
              onChange={(e) => setFilters({...filters, semestre: e.target.value})}
            >
              <MenuItem value="">Tous</MenuItem>
              {[1, 2, 3, 4].map((semester) => (
                <MenuItem key={semester} value={semester}>
                  Semestre {semester}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Class Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Class"
              name="classe"
              value={filters.classe}
              onChange={(e) => setFilters({...filters, classe: e.target.value})}
            >
              <MenuItem value="">All</MenuItem>
              {classes.map((classe) => (
                <MenuItem key={classe.id} value={classe.id}>
                  {classe.nom}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* Table of matieres */}
      <Card elevation={2}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Subject Name</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Coefficient</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Semestre</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Class</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Teacher</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMatieres.length > 0 ? (
                  filteredMatieres.map((matiere) => (
                    <TableRow
                      key={matiere.id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell>{matiere.nom}</TableCell>
                      <TableCell align="center">{matiere.coefficient}</TableCell>
                      <TableCell align="center">{matiere.semestre}</TableCell>
                      <TableCell align="center">
                        {matiere.classe?.nom || "Unknown"}
                      </TableCell>
                      <TableCell align="center">
                        {matiere.enseignant
                          ? `${matiere.enseignant.first_name} ${matiere.enseignant.last_name}`
                          : "Unknown"}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(matiere)}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(matiere.id)}
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
                    No subjects available
                  </TableCell>
                </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog for adding/editing a matiere */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? "Edit Subject" : "Create une New Subject"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nom"
                label="Subject Name"
                fullWidth
                value={formData.nom}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="coefficient"
                label="Coefficient"
                fullWidth
                type="number"
                value={formData.coefficient}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="semestre"
                label="Semestre"
                fullWidth
                value={formData.semestre}
                onChange={handleInputChange}
                required
              >
                <MenuItem value={1}>Semestre 1</MenuItem>
                <MenuItem value={2}>Semestre 2</MenuItem>
                <MenuItem value={3}>Semestre 3</MenuItem>
                <MenuItem value={4}>Semestre 4</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="classe"
                label="Class"
                fullWidth
                value={formData.classe || ""}
                onChange={handleInputChange}
                required
              >
                {classes.map((classe) => (
                  <MenuItem key={classe.id} value={classe.id}>
                    {classe.nom}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="enseignant"
                label="Teacher"
                fullWidth
                value={formData.enseignant || ""}
                onChange={handleInputChange}
                required
              >
                {enseignants.map((enseignant) => (
                  <MenuItem key={enseignant.id} value={enseignant.id}>
                    {enseignant.first_name} {enseignant.last_name}
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
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

export default AdminMatieres;