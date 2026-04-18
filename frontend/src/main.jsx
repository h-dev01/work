import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box } from '@mui/material';
import { getDesignTokens } from './theme';
import { HelmetProvider } from 'react-helmet-async';

// Lazy Load Pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const RoleSelection = lazy(() => import("./pages/RoleSelection"));
const LoginForm = lazy(() => import("./pages/LoginForm"));
const DashboardLayout = lazy(() => import("./DashboardLayout"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

// Dashboard Pages - Admin
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard.jsx"));
const AdminClasses = lazy(() => import("./pages/admin/Classes "));
const AdminEnseignants = lazy(() => import("./pages/admin/Enseignants.jsx"));
const Etudiants = lazy(() => import("./pages/admin/Etudiants"));
const AdminRecommendations = lazy(() => import("./pages/admin/AdminRecommendations"));
const AdminMatieres = lazy(() => import("./pages/admin/Matieres"));
const AdminClassment = lazy(() => import("./pages/admin/AdminClassment"));
const AdminAlerts = lazy(() => import("./pages/admin/AdminAlerts"));
const AdminNotes = lazy(() => import("./pages/admin/AdminNotes"));
const PredictNotes = lazy(() => import("./pages/admin/PredictNotes"));
const GlobalAIHub = lazy(() => import("./pages/admin/GlobalAIHub"));

// Dashboard Pages - Teacher
const TeacherDashboard = lazy(() => import("./pages/teacher/Dashboard"));
const TeacherNotes = lazy(() => import("./pages/teacher/Notes "));
const TeacherAnalysis = lazy(() => import("./pages/teacher/Analyse"));
const Profile = lazy(() => import("./pages/teacher/Profile"));

// Dashboard Pages - Student
const StudentDashboard = lazy(() => import("./pages/student/Dashboard"));
const StudentRecommendations = lazy(() => import("./pages/student/Recommendations"));
const StudentNotes = lazy(() => import("./pages/student/Mes Notes "));
const StudentProfile = lazy(() => import("./pages/student/StudentProfile"));

// @ts-ignore
const theme = createTheme(getDesignTokens("light", null));

// Loading Component
const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

// Wrapper to apply Suspense
const Loadable = (Component) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  { path: "/", element: Loadable(LandingPage) },
  { path: "/login", element: Loadable(RoleSelection) },
  { path: "/login/:role", element: Loadable(LoginForm) },

  // Admin Dashboard Routes
  {
    path: "/admin",
    element: (
      <Suspense fallback={<Loading />}>
        <ProtectedRoute requiredRole="admin">
          <DashboardLayout role="admin" />
        </ProtectedRoute>
      </Suspense>
    ),
    children: [
      { path: "dashboard", element: Loadable(AdminDashboard) },
      { path: "Classes", element: Loadable(AdminClasses) },
      { path: "Enseignants", element: Loadable(AdminEnseignants) },
      { path: "Etudiants", element: Loadable(Etudiants) },
      { path: "Matieres", element: Loadable(AdminMatieres) },
      { path: "Classment", element: Loadable(AdminClassment) },
      { path: "Alerts", element: Loadable(AdminAlerts) },
      { path: "Recommendations", element: Loadable(AdminRecommendations) },
      { path: "AdminNotes", element: Loadable(AdminNotes) },
      { path: "PredictNotes", element: Loadable(PredictNotes) },
      { path: "AIHub", element: Loadable(GlobalAIHub) },
    ],
  },

  // Teacher Dashboard Routes
  {
    path: "/teacher",
    element: (
      <Suspense fallback={<Loading />}>
        <ProtectedRoute requiredRole="teacher">
          <DashboardLayout role="teacher" />
        </ProtectedRoute>
      </Suspense>
    ),
    children: [
      { path: "dashboard", element: Loadable(TeacherDashboard) },
      { path: "Notes", element: Loadable(TeacherNotes) },
      { path: "Analyse", element: Loadable(TeacherAnalysis) },
      { path: "Profile", element: Loadable(Profile) },
    ],
  },

  // Student Dashboard Routes
  {
    path: "/student",
    element: (
      <Suspense fallback={<Loading />}>
        <ProtectedRoute requiredRole="student">
          <DashboardLayout role="student" />
        </ProtectedRoute>
      </Suspense>
    ),
    children: [
      { path: "dashboard", element: Loadable(StudentDashboard) },
      { path: "Guidance", element: Loadable(StudentRecommendations) },
      { path: "Notes", element: Loadable(StudentNotes) },
      { path: "StudentProfile", element: Loadable(StudentProfile) }, 
    ],
  },
]);



ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);