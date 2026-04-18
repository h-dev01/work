import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Divider, CircularProgress, 
  Alert, useTheme, Avatar
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Groups as GroupsIcon,
  Class as ClassIcon,
  FactCheck as FactCheckIcon
} from '@mui/icons-material';

import { api, endpoints } from '../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

import { Helmet } from 'react-helmet-async';

const TeacherDashboard = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await api.get(endpoints.dashboard.teacher);
                const data = await response.json();

                if (data.success) {
                    setStats(data);
                } else {
                    throw new Error(data.message || "Impossible de charger les statistiques.");
                }
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <Box p={3} display="flex" justifyContent="center"><CircularProgress /></Box>;
    if (error) return <Box p={3}><Alert severity="error">{error}</Alert></Box>;

    return (
        <Box>
            <Helmet>
                <title>StudyPulse AI - Teacher Workspace</title>
                <meta name="description" content="Teacher dashboard: classes, students, performance." />
            </Helmet>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="800" color="primary" gutterBottom>
                    Teacher Workspace
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Track classes, performance, and engagement.
                </Typography>
                <Divider sx={{ mt: 2 }} />
            </Box>

            {/* --- 4 CARDS --- */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="My Classes"
                        value={stats?.cards?.total_classes || 0}
                        icon={<ClassIcon />}
                        color={theme.palette.primary.main}
                        subtitle="Active classes"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Total Students"
                        value={stats?.cards?.total_students || 0}
                        icon={<GroupsIcon />}
                        color={theme.palette.secondary.main}
                        subtitle="Under your responsibility"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="General Average"
                        value={stats?.cards?.my_avg || "N/A"}
                        icon={<TrendingUpIcon />}
                        color={theme.palette.success.main}
                        subtitle="Average across your subjects"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="At-Risk Students"
                        value={stats?.cards?.at_risk_count || 0}
                        icon={<WarningIcon />}
                        color={theme.palette.error.main}
                        subtitle="Need support"
                    />
                </Grid>
            </Grid>

            {/* --- 4 CHARTS (GRID 2x2) --- */}
            <Grid container spacing={3}>
                
                {/* Chart 1: Class Comparison (Bar) */}
                <Grid item xs={12} md={6}>
                    <Card elevation={2} sx={{ height: 400 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Class Comparison (Average)
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats?.charts?.class_comparison || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 20]} />
                                    <Tooltip />
                                    <Bar dataKey="avg" fill={theme.palette.primary.main} name="Average" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Chart 2: Grade Distribution (Bar) */}
                <Grid item xs={12} md={6}>
                    <Card elevation={2} sx={{ height: 400 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Grade Distribution
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats?.charts?.grade_distribution || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="range" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill={theme.palette.secondary.main} name="Number of students" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Chart 3: Pass/Fail Rate (Donut) */}
                <Grid item xs={12} md={6}>
                    <Card elevation={2} sx={{ height: 400 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Success Rate (Overall)
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={stats?.charts?.pass_fail || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}
                                    >
                                        {stats?.charts?.pass_fail?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? theme.palette.success.main : theme.palette.error.main} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                 {/* Chart 4: Activity Trend (Line) */}
                 <Grid item xs={12} md={6}>
                    <Card elevation={2} sx={{ height: 400 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Activity and Participation (Trend)
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={stats?.charts?.activity_trend || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="msgs" stroke={theme.palette.primary.main} name="Messages" strokeWidth={2} />
                                    <Line type="monotone" dataKey="files" stroke={theme.palette.secondary.main} name="Fichiers" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>
        </Box>
    );
};

export default TeacherDashboard;