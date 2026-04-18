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
  useTheme
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GetAppIcon from "@mui/icons-material/GetApp";
import PersonIcon from "@mui/icons-material/Person";

import { api, endpoints } from "../../services/api";

const AdminEnseignants = () => {
  const [enseignants, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();

  // Fetch enseignants from the backend
  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(endpoints.teachers.list);
      const data = await response.json();
      setTeachers(Array.isArray(data) ? data : data.enseignants || []);
    } catch (error) {
      console.error("Error fetching enseignants:", error);
      setError("Error loading teachers");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Open dialog for adding/editing an enseignant
  const handleOpenDialog = (enseignant = null) => {
    if (enseignant) {
      setFormData({
        id: enseignant.id,
        first_name: enseignant.first_name,
        last_name: enseignant.last_name,
        email: enseignant.email,
        phone: enseignant.phone,
      });
      setEditMode(true);
    } else {
      setFormData({
        id: null,
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
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

  // Submit form (create or update enseignant)
  const handleSubmit = async () => {
    try {
      let response;
      const data = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
      };

      if (editMode) {
        response = await api.put(endpoints.teachers.update(formData.id), data);
      } else {
        response = await api.post(endpoints.teachers.create, data);
      }

      if (response.ok) {
        await fetchTeachers();
        setOpenDialog(false);
      } else {
        throw new Error("Request error");
      }
    } catch (error) {
      setError("Une erreur est survenue lors de la sauvegarde");
    }
  };

  // Delete an enseignant
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(endpoints.teachers.delete(id));

      const data = await response.json();
      if (data.success) {
        await fetchTeachers();
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
      const response = await api.post(endpoints.teachers.import, formData, true);
  
      if (response.ok) {
        await fetchTeachers();
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
    const headers = ["Last Name", "First Name", "Email", "Phone"];
    let csvContent = headers.join(",") + "\n";

    if (enseignants.length > 0) {
      enseignants.forEach((enseignant) => {
        const row = [
          enseignant.last_name,
          enseignant.first_name,
          enseignant.email,
          enseignant.phone,
        ];
        csvContent += row.join(",") + "\n";
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_enseignants.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary.main" fontWeight="bold" gutterBottom>
          Teacher Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Manage your teachers and their information
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
                  Total des Teachers
                </Typography>
                <PersonIcon 
                  fontSize="medium" 
                  sx={{ color: theme.palette.primary.main }} 
                />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
                  {enseignants.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Registered teachers
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
          Nouvel Teacher
        </Button>
      </Box>

      {/* Table of enseignants */}
      <Card elevation={2}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Last Name</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>First Name</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enseignants && enseignants.length > 0 ? (
                  enseignants.map((enseignant) => (
                    <TableRow 
                      key={enseignant.id}
                      hover
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell>{enseignant.last_name}</TableCell>
                      <TableCell align="center">{enseignant.first_name}</TableCell>
                      <TableCell align="center">{enseignant.email}</TableCell>
                      <TableCell align="center">{enseignant.phone}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(enseignant)}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(enseignant.id)}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Aucun enseignant disponible
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog for adding/editing enseignant */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? "Edit Teacher" : "Create a New Teacher"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="last_name"
                label="Last Name"
                fullWidth
                value={formData.last_name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="first_name"
                label="First Name"
                fullWidth
                value={formData.first_name}
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
                name="phone"
                label="Phone"
                fullWidth
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
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

export default AdminEnseignants;