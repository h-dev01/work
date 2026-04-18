import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Divider,
  alpha,
  useTheme,
  InputAdornment,
  IconButton,
  LinearProgress,
  Grid
} from "@mui/material";
import {
  Person,
  Email,
  Phone,
  Lock,
  Visibility,
  VisibilityOff,
  Save
} from "@mui/icons-material";
import { fetchWithTokenRefresh, logout } from "../../utils/auth";
import { API_BASE_URL } from "../../config";

const Profilee = () => {
  const [teacher, setTeacher] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  
  const theme = useTheme();
  // Couleur de thème pour l'enseignant
  const teacherColor = theme.palette.primary.main;

  // Récupérer les données de l'enseignant au montage du composant
  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      const response = await fetchWithTokenRefresh(`${API_BASE_URL}/teacher/profile/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();

        setTeacher(data.data);
      } else {
        throw new Error("Failed to fetch profile data");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to fetch profile data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (password !== confirmPassword) {
      setSnackbar({
        open: true,
        message: "Les mots de passe ne correspondent pas",
        severity: "error",
      });
      return;
    }

    if (password.length < 8) {
      setSnackbar({
        open: true,
        message: "Password must be at least 8 characters long",
        severity: "warning",
      });
      return;
    }
  
    try {
      const response = await fetchWithTokenRefresh(`${API_BASE_URL}/teacher/update-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ password }),
      });
  
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Password updated successfully",
          severity: "success",
        });
        setPassword("");
        setConfirmPassword("");
      } else {
        throw new Error("Failed to update password");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress sx={{ 
          height: 6, 
          backgroundColor: alpha(teacherColor, 0.15),
          '& .MuiLinearProgress-bar': {
            backgroundColor: teacherColor
          }
        }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: "bold", 
              color: teacherColor 
            }}
          >
            Profilee
          </Typography>
        </Box>
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          gutterBottom
          sx={{ ml: 0.5 }}
        >
          View and update your personal information
        </Typography>
        <Divider sx={{ mt: 1, mb: 3 }} />
      </Box>

      <Grid container spacing={3}>
        {/* Section Personal Information */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: "100%",
              boxShadow: 3,
              position: "relative",
              overflow: "hidden",
              border: `1px solid ${alpha(teacherColor, 0.1)}`
            }}
          >
            <Box 
              sx={{ 
                height: 8, 
                backgroundColor: teacherColor,
                width: "100%",
                position: "absolute",
                top: 0
              }} 
            />
            <CardContent sx={{ pt: 4 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  display: "flex", 
                  alignItems: "center",
                  fontWeight: 600
                }}
              >
                <Person sx={{ mr: 1, color: teacherColor }} />
                Personal Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    value={teacher.first_name}
                    fullWidth
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: alpha(teacherColor, 0.7) }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: alpha(theme.palette.background.paper, 0.5)
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: alpha(theme.palette.divider, 0.7)
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    value={teacher.last_name}
                    fullWidth
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: alpha(teacherColor, 0.7) }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: alpha(theme.palette.background.paper, 0.5)
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: alpha(theme.palette.divider, 0.7)
                      }
                    }}
                  />
                </Grid>
              </Grid>
              
              <TextField
                label="Email"
                value={teacher.email}
                fullWidth
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: alpha(teacherColor, 0.7) }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: alpha(theme.palette.background.paper, 0.5)
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: alpha(theme.palette.divider, 0.7)
                  }
                }}
              />
              
              <TextField
                label="Phone"
                value={teacher.phone}
                fullWidth
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: alpha(teacherColor, 0.7) }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: alpha(theme.palette.background.paper, 0.5)
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: alpha(theme.palette.divider, 0.7)
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Section Changement de Mot de Passe */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: "100%",
              boxShadow: 3,
              position: "relative",
              overflow: "hidden",
              border: `1px solid ${alpha(teacherColor, 0.1)}`,
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                boxShadow: 4
              }
            }}
          >
            <Box 
              sx={{ 
                height: 8, 
                backgroundColor: teacherColor,
                width: "100%",
                position: "absolute",
                top: 0
              }} 
            />
            <CardContent sx={{ pt: 4 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  display: "flex", 
                  alignItems: "center",
                  fontWeight: 600
                }}
              >
                <Lock sx={{ mr: 1, color: teacherColor }} />
                Change Password
              </Typography>
              
              <Box sx={{ p: 1 }}>
                <TextField
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: alpha(teacherColor, 0.7) }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="Show/Hide password"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ 
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: alpha(teacherColor, 0.5)
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: teacherColor
                      }
                    }
                  }}
                />
                
                <TextField
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: alpha(teacherColor, 0.7) }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="Show/Hide confirmation password"
                          onClick={handleToggleConfirmPasswordVisibility}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ 
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: alpha(teacherColor, 0.5)
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: teacherColor
                      }
                    }
                  }}
                />
                
                {/* Indicateur de force du mot de passe si le mot de passe n'est pas vide */}
                {password && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                      Password strength :
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={
                        password.length > 0 && password.length < 6 ? 25 :
                        password.length >= 6 && password.length < 8 ? 50 :
                        password.length >= 8 && !/[A-Z]/.test(password) ? 75 : 100
                      } 
                      sx={{
                        height: 8,
                        backgroundColor: alpha(theme.palette.grey[300], 0.5),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 
                            password.length > 0 && password.length < 6 ? theme.palette.error.main :
                            password.length >= 6 && password.length < 8 ? theme.palette.warning.main :
                            password.length >= 8 && !/[A-Z]/.test(password) ? theme.palette.info.main : 
                            theme.palette.success.main
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      {password.length > 0 && password.length < 6 ? "Weak - Minimum 6 characters" :
                      password.length >= 6 && password.length < 8 ? "Medium - Minimum 8 characters recommendeds" :
                      password.length >= 8 && !/[A-Z]/.test(password) ? "Good - Add an uppercase letter for more security" : 
                      "Excellent"}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    sx={{ 
                      minWidth: 200,
                      py: 1.2,
                      fontWeight: "bold",
                      boxShadow: 2,
                      transition: "transform 0.2s",
                      backgroundColor: teacherColor,
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 3,
                        backgroundColor: alpha(teacherColor, 0.85)
                      }
                    }}
                    onClick={handlePasswordChange}
                    disabled={!password || !confirmPassword}
                    startIcon={<Save />}
                  >
                    Update Password
                  </Button>
                </Box>
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: "block", textAlign: "center" }}>
                  For optimal security, use at least 8 characters with uppercase letters, lowercase letters, and numbers.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar pour les Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          // @ts-ignore
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: "100%",
            boxShadow: 3
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profilee;