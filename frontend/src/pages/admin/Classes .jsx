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
  FormControl,
  InputLabel,
  Select,
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
import SchoolIcon from "@mui/icons-material/School";

import { api, endpoints } from "../../services/api";

const AdminClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nom: "",
    enseignant_responsable: null,
  });
  const [editMode, setEditMode] = useState(false);
  const [enseignants, setTeachers] = useState([]);
  const [error, setError] = useState(null);
  const theme = useTheme();

  // Fetch classes and enseignants from the backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [classesResponse, enseignantsResponse] = await Promise.all([
          api.get(endpoints.classes.list),
          api.get(endpoints.teachers.list)
        ]);

        const classesData = await classesResponse.json();
        const enseignantsData = await enseignantsResponse.json();

        setClasses(Array.isArray(classesData) ? classesData : classesData.classes || []);
        setTeachers(Array.isArray(enseignantsData) ? enseignantsData : enseignantsData.enseignants || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Rest of the existing methods (handleOpenDialog, handleCloseDialog, etc.) remain the same as in the previous version

  const handleOpenDialog = (classe = null) => {
    if (classe) {
      setFormData({
        id: classe.id,
        nom: classe.nom,
        enseignant_responsable: classe.enseignant_responsable?.id || null,
      });
      setEditMode(true);
    } else {
      setFormData({
        id: null,
        nom: "",
        enseignant_responsable: null,
      });
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      let response;
      const data = {
        nom: formData.nom,
        enseignant_responsable_id: formData.enseignant_responsable,
      };

      if (editMode) {
        response = await api.put(endpoints.classes.update(formData.id), data);
      } else {
        response = await api.post(endpoints.classes.create, data);
      }

      if (response.ok) {
        // Refresh data
        const updatedClassesResponse = await api.get(endpoints.classes.list);
        const updatedClassesData = await updatedClassesResponse.json();
        setClasses(Array.isArray(updatedClassesData) ? updatedClassesData : updatedClassesData.classes || []);

        setOpenDialog(false);
      } else {
        throw new Error("Request error");
      }
    } catch (error) {
      setError("Une erreur est survenue lors de la sauvegarde");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(endpoints.classes.delete(id));

      const data = await response.json();
      if (data.success) {
        // Refresh data
        const updatedClassesResponse = await api.get(endpoints.classes.list);
        const updatedClassesData = await updatedClassesResponse.json();
        setClasses(Array.isArray(updatedClassesData) ? updatedClassesData : updatedClassesData.classes || []);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setError("Error deleting item");
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary.main" fontWeight="bold" gutterBottom>
          Class Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Manage your classes and their information
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
                  Total Classes
                </Typography>
                <SchoolIcon 
                  fontSize="medium" 
                  sx={{ color: theme.palette.primary.main }} 
                />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
                  {classes.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Existing classes
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Class
        </Button>
      </Box>

      {/* Table of classes */}
      <Card elevation={2}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Class Name</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Teacher Responsable</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classes && classes.length > 0 ? (
                  classes.map((classe) => (
                    <TableRow 
                      key={classe.id}
                      hover
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell>{classe.nom}</TableCell>
                      <TableCell align="center">
                        {classe.enseignant_responsable
                          ? `${classe.enseignant_responsable.first_name} ${classe.enseignant_responsable.last_name}`
                          : "Unknown"}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(classe)}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(classe.id)}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No classes available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog for adding/editing a class (remains mostly unchanged) */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? "Edit Class" : "Create une New Class"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nom"
                label="Class Name"
                fullWidth
                value={formData.nom}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="enseignant-label">
                  Teacher Responsable
                </InputLabel>
                <Select
                  labelId="enseignant-label"
                  name="enseignant_responsable"
                  value={formData.enseignant_responsable || ""}
                  onChange={handleInputChange}
                >
                  {enseignants.map((enseignant) => (
                    <MenuItem key={enseignant.id} value={enseignant.id}>
                      {enseignant.first_name} {enseignant.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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

export default AdminClasses;