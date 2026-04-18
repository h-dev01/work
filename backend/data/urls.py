from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import auth, stats, admin, teacher, student, ml, dashboard_stats

urlpatterns = [
    # Authentication
    path('api/login/', auth.login_view, name='login'),
    path('api/logout/', auth.logout_view, name='logout'),
    path('api/user-info/', auth.get_user_info, name='user-info'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # New Unified Dashboard Stats
    path('api/dashboard/admin/', dashboard_stats.admin_dashboard_stats, name='admin-dashboard-stats'),
    path('api/dashboard/teacher/', dashboard_stats.teacher_dashboard_stats, name='teacher-dashboard-stats'),
    path('api/dashboard/student/', dashboard_stats.student_dashboard_stats, name='student-dashboard-stats'),

    # Dashboard Chart Data Endpoints (Legacy/Specific)
    path('api/charts/performance-trend/', stats.get_performance_trend, name='performance-trend'),
    path('api/charts/attendance-rate/', stats.get_attendance_rate, name='attendance-rate'),
    path('api/charts/category-distribution/', stats.get_category_distribution, name='category-distribution'),
    path('api/charts/subject-success-rate/', stats.get_subject_success_rate, name='subject-success-rate'),

    # Students 
    path('api/students/', admin.list_students, name='list-students'),
    path('api/students/create/', admin.create_student, name='create-student'),
    path('api/students/update/<int:id>/', admin.update_student, name='update-student'),
    path('api/students/delete/<int:id>/', admin.delete_student, name='delete-student'),
    path('api/students/import/', admin.import_students, name='import_students'),

    # Classes 
    path('api/classes/', admin.list_classes, name='list-classes'),
    path('api/classes/create/', admin.create_class, name='create-class'),
    path('api/classes/update/<int:id>/', admin.update_class, name='update-class'),
    path('api/classes/delete/<int:id>/', admin.delete_class, name='delete-class'),

    # Teachers 
    path('api/enseignants/', admin.list_enseignants, name='list-enseignants'),
    path('api/enseignants/create/', admin.create_enseignant, name='create-enseignant'),
    path('api/enseignants/update/<int:id>/', admin.update_enseignant, name='update-enseignant'),
    path('api/enseignants/delete/<int:id>/', admin.delete_enseignant, name='delete-enseignant'),
    path('api/enseignants/import/', admin.import_enseignants, name='import_enseignants'),

    # Subjects 
    path('api/matieres/', admin.list_matieres, name='list-matieres'),
    path('api/matieres/create/', admin.create_matiere, name='create-matiere'),
    path('api/matieres/update/<int:id>/', admin.update_matiere, name='update-matiere'),
    path('api/matieres/delete/<int:id>/', admin.delete_matiere, name='delete-matiere'),
    path('api/matieres/import/', admin.import_matieres, name='import-matieres'),

    # Notes (Admin)
    path('api/admin/matieres/', admin.get_all_matieres, name='get_all_matieres'),
    path('api/admin/notes/', admin.get_all_notes, name='get_all_notes'),
    path('api/admin/students-by-matiere/', admin.get_students_by_matiere_admin, name='get_students_by_matiere_admin'),
    path('api/admin/notes/create-update/', admin.admin_create_or_update_note, name='admin_create_or_update_note'),
    path('api/admin/notes/delete/<int:id>/', admin.admin_delete_note, name='admin_delete_note'),
    path('api/admin/notes/import/', admin.admin_import_notes, name='admin_import_notes'),

    # Machine Learning
    path('api/ml/classify-class/', ml.classify_class_students, name='classify-class-students'),
    path('api/ml/class-alerts/', ml.get_class_alerts, name='get-class-alerts'),
    path('api/ml/class-recommendations/', ml.get_class_recommendations, name='get-class-recommendations'),
    path('api/ml/class-dashboard/', ml.class_dashboard, name='class-dashboard'),
    path('api/predict-grades/', ml.predict_grades, name='predict-grades'),
   
    # Teacher Dashboard
    path('api/teacher/matieres/', teacher.get_teacher_matieres, name='get_teacher_matieres'),
    path('api/teacher/notes/', teacher.get_teacher_notes, name='get_teacher_notes'),
    path('api/teacher/notes/create-update/', teacher.create_or_update_note, name='create_or_update_note'),
    path('api/teacher/notes/delete/<int:id>/', teacher.delete_note, name='delete_note'),
    path('api/teacher/notes/import/', teacher.import_notes, name='import_notes'),
    path('api/teacher/classes/', teacher.get_teacher_classes, name='get_teacher_classes'),
    path('api/teacher/students-by-matiere/', teacher.get_students_by_matiere, name='get_students_by_matiere'),
    path('api/teacher/statistics/', teacher.get_teacher_statistics, name='get_teacher_statistics'),
    path('api/teacher/grade-distribution/', teacher.get_grade_distribution, name='get_grade_distribution'),
    path('api/teacher/alerts/', teacher.get_teacher_alerts, name='get_teacher_alerts'),
    path('api/teacher/classifications/', teacher.get_teacher_classifications, name='get_teacher_classifications'),
    path('api/teacher/recommendations/', teacher.get_teacher_recommendations, name='get_teacher_recommendations'),
    path('api/teacher/profile/', auth.teacher_profile, name='teacher-profile'),
    path('api/teacher/update-password/', auth.update_teacher_password, name='update-teacher-password'),
     
    # Student Dashboard
    path('api/student/notes/', student.get_student_notes, name='get_student_notes'),
    path('api/student/dashboard/', student.student_dashboard, name='student_dashboard'),
    path('api/student/recommendations/', student.student_recommendations, name='student_recommendations'),
    path('api/student/alerts/', student.student_alerts, name='student_alerts'),
    path('api/student/profile/', auth.student_profile, name='student-profile'),
    path('api/student/update-password/', auth.update_student_password, name='update-student-password'),
]