import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Grid, Card, CardContent, Divider, CircularProgress, 
  Alert, useTheme, Avatar
} from "@mui/material";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { 
  School, TrendingUp, Warning, CheckCircle, SentimentSatisfiedAlt, 
  NotificationsActive
} from "@mui/icons-material";
import { api, endpoints } from "../../services/api";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const StudentStatCard = ({ title, value, icon, color, subtitle }) => {
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
                <Typography variant="h6" fontWeight="700" sx={{ lineHeight: 1.2, my: 0.5 }}>
                    {value}
                </Typography>
                {subtitle && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', lineHeight: 1.1 }}>
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

const StudentDashboard = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [legacyData, setLegacyData] = useState(null);
    const [newData, setNewData] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
             setLoading(true);
             try {
                 // 1. Fetch Legacy Data (Perf Trends, Subject Pie)
                 const legacyRes = await api.get(endpoints.studentDashboard.dashboard);
                 const legData = await legacyRes.json();
                 
                 // 2. Fetch New Stats (Radar, Attendance Bar, Cards)
                 const newRes = await api.get(endpoints.dashboard.student);
                 const nData = await newRes.json();

                 if (legData.success && nData.success) {
                     setLegacyData(legData);
                     setNewData(nData);
                 } else {
                     throw new Error("Error loading data");
                 }

             } catch (err) {
                 console.error(err);
                 setError("Unable to load the dashboard.");
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
                <title>StudyPulse AI - Student Dashboard</title>
                <meta name="description" content="Track your performance, absences, and recommendations." />
            </Helmet>
             <Box mb={4}>
                <Typography variant="h4" fontWeight="800" color="primary" gutterBottom>
                    Welcome, {legacyData?.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Your personal academic tracking area.
                </Typography>
                <Divider sx={{ mt: 2 }} />
            </Box>

            {/* --- 4 CARDS --- */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <StudentStatCard 
                        title="My Average"
                        value={newData?.cards?.my_avg?.toFixed(2) || "N/A"}
                        icon={<School />}
                        color={theme.palette.primary.main}
                        subtitle="Current average"
                    />
                </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                    <StudentStatCard 
                        title="AI Status"
                        value={newData?.cards?.status_label || "-"}
                        icon={<SentimentSatisfiedAlt />}
                        color={theme.palette.secondary.main}
                        subtitle="Overall performance"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StudentStatCard 
                        title="Attendance"
                        value={`${newData?.cards?.attendance_rate}%` || "-"}
                        icon={<CheckCircle />}
                        color={theme.palette.success.main}
                        subtitle="Presence rate"
                    />
                </Grid>
               
                <Grid item xs={12} sm={6} md={3}>
                    <StudentStatCard 
                        title="Warnings"
                        value={newData?.cards?.alert_count || 0}
                        icon={<NotificationsActive />}
                        color={theme.palette.warning.main}
                        subtitle="Active alerts"
                    />
                </Grid>
            </Grid>

            {/* --- 4 CHARTS --- */}
            <Grid container spacing={3}>
                
                {/* Chart 1: Performance Trend (Line - Legacy) */}
                <Grid item xs={12} md={6}>
                    <Card elevation={2} sx={{ height: 400 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Grade Progression
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                             <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={legacyData?.monthlyPerformance || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis domain={[0, 20]} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="average" stroke={theme.palette.primary.main} strokeWidth={3} dot={{r:4}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Chart 2: Skills Radar (Radar - New) */}
                <Grid item xs={12} md={6}>
                    <Card elevation={2} sx={{ height: 400 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Comparison: Me vs Class
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={newData?.charts?.radar_data || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="subject" tick={{ fontSize: 12 }} interval={0} />
                                    <YAxis domain={[0, 20]} />
                                    <Tooltip 
                                        formatter={(value, name) => [value, name === 'Me' ? 'My Grade' : 'Class Average']}
                                        contentStyle={{ borderRadius: 8 }}
                                    />
                                    <Legend formatter={(value) => value === 'Me' ? 'My Grade' : 'Class Average'} />
                                    <Bar dataKey="Me" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Class" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Chart 3: Subject Breakdown (Pie - Legacy) */}
                <Grid item xs={12} md={6}>
                    <Card elevation={2} sx={{ height: 400 }}>
                         <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Performance by Subject
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                             <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={legacyData?.subjectPerformance || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        dataKey="value"
                                        label={({name, value}) => `${name}: ${value}`}
                                    >
                                        {legacyData?.subjectPerformance?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Chart 4: Monthly Attendance (Bar - New) */}
                <Grid item xs={12} md={6}>
                    <Card elevation={2} sx={{ height: 400 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Attendance History
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                             <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={newData?.charts?.monthly_attendance || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="present" stackId="a" fill={theme.palette.success.main} name="Present" />
                                    <Bar dataKey="absent" stackId="a" fill={theme.palette.error.main} name="Absent" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>
        </Box>
    );
};

export default StudentDashboard;