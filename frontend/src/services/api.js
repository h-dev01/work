import { API_BASE_URL } from '../config';
import { fetchWithTokenRefresh } from '../utils/auth';

export const endpoints = {
  auth: {
    login: `${API_BASE_URL}/login/`,
    logout: `${API_BASE_URL}/logout/`,
    userInfo: `${API_BASE_URL}/user-info/`,
  },
  students: {
    list: `${API_BASE_URL}/students/`,
    create: `${API_BASE_URL}/students/create/`,
    update: (id) => `${API_BASE_URL}/students/update/${id}/`,
    delete: (id) => `${API_BASE_URL}/students/delete/${id}/`,
    import: `${API_BASE_URL}/students/import/`,
  },
  teachers: {
    list: `${API_BASE_URL}/enseignants/`,
    create: `${API_BASE_URL}/enseignants/create/`,
    update: (id) => `${API_BASE_URL}/enseignants/update/${id}/`,
    delete: (id) => `${API_BASE_URL}/enseignants/delete/${id}/`,
    import: `${API_BASE_URL}/enseignants/import/`,
  },
  classes: {
    list: `${API_BASE_URL}/classes/`,
    create: `${API_BASE_URL}/classes/create/`,
    update: (id) => `${API_BASE_URL}/classes/update/${id}/`,
    delete: (id) => `${API_BASE_URL}/classes/delete/${id}/`,
  },
  subjects: {
    list: `${API_BASE_URL}/matieres/`,
    create: `${API_BASE_URL}/matieres/create/`,
    update: (id) => `${API_BASE_URL}/matieres/update/${id}/`,
    delete: (id) => `${API_BASE_URL}/matieres/delete/${id}/`,
    import: `${API_BASE_URL}/matieres/import/`,
  },
  notes: {
      adminCreateUpdate: `${API_BASE_URL}/admin/notes/create-update/`,
      adminDelete: (id) => `${API_BASE_URL}/admin/notes/delete/${id}/`,
      adminImport: `${API_BASE_URL}/admin/notes/import/`,
      teacherCreateUpdate: `${API_BASE_URL}/teacher/notes/create-update/`,
      teacherDelete: (id) => `${API_BASE_URL}/teacher/notes/delete/${id}/`,
      teacherImport: `${API_BASE_URL}/teacher/notes/import/`,
  },
  
  // Dashboard Stats (Unified)
  dashboard: {
    admin: `${API_BASE_URL}/dashboard/admin/`,
    teacher: `${API_BASE_URL}/dashboard/teacher/`,
    student: `${API_BASE_URL}/dashboard/student/`,
  },

  stats: {
    performanceTrend: `${API_BASE_URL}/charts/performance-trend/`,
    attendanceRate: `${API_BASE_URL}/charts/attendance-rate/`,
    categoryDistribution: `${API_BASE_URL}/charts/category-distribution/`,
    subjectSuccessRate: `${API_BASE_URL}/charts/subject-success-rate/`,
  },
  ml: {
      predictGrades: `${API_BASE_URL}/predict-grades/`,
      classifyClass: `${API_BASE_URL}/ml/classify-class/`,
      classAlerts: `${API_BASE_URL}/ml/class-alerts/`,
      classRecommendations: `${API_BASE_URL}/ml/class-recommendations/`,
      classDashboard: `${API_BASE_URL}/ml/class-dashboard/`,
  },
  teacherDashboard: {
    matieres: `${API_BASE_URL}/teacher/matieres/`,
    statistics: `${API_BASE_URL}/teacher/statistics/`,
    gradeDistribution: `${API_BASE_URL}/teacher/grade-distribution/`,
    studentsByMatiere: `${API_BASE_URL}/teacher/students-by-matiere/`,
    notes: `${API_BASE_URL}/teacher/notes/`,
  },
  studentDashboard: {
      dashboard: `${API_BASE_URL}/student/dashboard/`,
  }
};

export const api = {
  get: (url) => fetchWithTokenRefresh(url, { method: 'GET' }),
  post: (url, body, isFormData = false) => {
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    const options = {
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    };
    return fetchWithTokenRefresh(url, options);
  },
  put: (url, body) => fetchWithTokenRefresh(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }),
  delete: (url) => fetchWithTokenRefresh(url, { method: 'DELETE' }),
};
