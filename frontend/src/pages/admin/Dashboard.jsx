import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Box, Typography, Grid, Card, CardContent, Divider, CircularProgress, 
  Snackbar, Alert, useTheme, Avatar, LinearProgress
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Groups as GroupsIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';

import { api, endpoints } from '../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const StatCard = ({ title, value, icon, color, subtitle }) => {
  return (
    <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 0 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" alignItems="center" gap={2}>
            <Avatar 
                variant="square" 
                sx={{ 
                    bgcolor: `${color}15`, 
                    color: color,
                    width: 48,
                    height: 48,
                    borderRadius: 0
                }}
            >
                {React.cloneElement(icon, { sx: { fontSize: 24 } })}
            </Avatar>
            <Box overflow="hidden">
                <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="h5" fontWeight="700" noWrap title={value} sx={{ lineHeight: 1.2, my: 0.5 }}>
                    {value}
                </Typography>
                {subtitle && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }} noWrap>
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null); // Unified stats
    const [subjectStats, setSubjectStats] = useState([]); // Separate endpoint

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Unified Dashboard Stats
                const dashboardRes = await api.get(endpoints.dashboard.admin);
                const dashboardData = await dashboardRes.json();

                if (dashboardData.success) {
                    setStats(dashboardData);
                } else {
                    throw new Error(dashboardData.message || "Error loading dashboard");
                }

                // 2. Fetch Subject Success Rate (Existing endpoint)
                const subjectsRes = await api.get(endpoints.stats.subjectSuccessRate);
                const subjectsData = await subjectsRes.json();
                setSubjectStats(subjectsData);

            } catch (err) {
                console.error("Dashboard Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    if (loading) return <Box p={3} display="flex" justifyContent="center"><CircularProgress /></Box>;
    if (error) return <Box p={3}><Alert severity="error">{error}</Alert></Box>;

    return (
        <Box>
            <Helmet>
                <title>StudyPulse AI - Administration</title>
                <meta name="description" content="System overview and global statistics." />
            </Helmet>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="800" color="primary" gutterBottom>
                    Admin Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Overview of academic performance and attendance.
                </Typography>
                <Divider sx={{ mt: 2 }} />
            </Box>

            {/* --- 4 INFO CARDS --- */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Total Students"
                        value={stats?.cards?.total_students || 0}
                        icon={<GroupsIcon />}
                        color={theme.palette.primary.main}
                        subtitle="Enrolled this year"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Overall Average"
                        value={stats?.cards?.global_avg?.toFixed(2) || "N/A"}
                        icon={<SpeedIcon />}
                        color={theme.palette.info.main}
                        subtitle="Across all subjects"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Taux de Presence"
                        value={`${stats?.cards?.attendance_rate}%`}
                        icon={<CheckCircleIcon />}
                        color={theme.palette.success.main}
                        subtitle="General average"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="At-Risk Students"
                        value={stats?.cards?.at_risk_count || 0}
                        icon={<WarningIcon />}
                        color={theme.palette.error.main}
                        subtitle="Need attention"
                    />
                </Grid>
            </Grid>

            {/* --- 4 CHARTS (GRID 2x2) --- */}
            <Grid container spacing={3}>
                
                {/* Chart 1: Global Performance Distribution (Pie) */}
                <Grid item xs={12} md={6}>
                    <Card elevation={2} sx={{ height: 400 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Distribution des Performances IA
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={stats?.charts?.performance_distribution || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {stats?.charts?.performance_distribution?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Chart 2: Attendance Trends (Area) */}
                <Grid item xs={12} md={6}>
                    <Card elevation={2} sx={{ height: 400 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Tendance de l'Attendance (Mensuelle)
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={stats?.charts?.attendance_trend || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="rate" stroke={theme.palette.success.main} fill={theme.palette.success.light} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Chart 3: Subject Success Rate (Bar - Existing) */}
                <Grid item xs={12} md={6}>
                    <Card elevation={2} sx={{ height: 400 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Success Rate by Subject
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={subjectStats}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="subject" tick={false} /> {/* Hide labels if too long */}
                                    <YAxis domain={[0, 20]} />
                                    <Tooltip />
                                    <Bar dataKey="success_rate" fill={theme.palette.primary.main} name="Note Moy." />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Chart 4: Teacher Workload (Bar - Horizontal) */}
                 <Grid item xs={12} md={6}>
                    <Card elevation={2} sx={{ height: 400 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Charge Teacher (Top 5)
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart layout="vertical" data={stats?.charts?.teacher_workload || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="students" fill={theme.palette.secondary.main} name="Nb Students" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>
        </Box>
    );
};

export default AdminDashboard;