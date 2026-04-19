from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Avg, Count
from ..models import Utilisateur, Classe, Matiere, Note, Performance, Alerte
from ..display import display_performance_label, display_subject_name
import logging
import math

logger = logging.getLogger(__name__)

# --- HELPERS ---

def get_performance_distribution(students_queryset):
    """Calculates distribution of global performance categories."""
    perfs = Performance.objects.filter(etudiant__in=students_queryset)
    # Categories: 'Bon performeur', 'Moyenne performance', 'À risque', 'Non Analysé'
    # Since 'categorie_risque' is a CharField, we group by it.
    dist = perfs.values('categorie_risque').annotate(count=Count('id'))
    
    # Format for Recharts Pie [ {name: 'Bon', value: 10}, ... ]
    formatted = []
    total = 0
    for d in dist:
        formatted.append({'name': display_performance_label(d['categorie_risque']), 'value': d['count']})
        total += d['count']
        
    return formatted, total

# --- ADMIN VIEW ---

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    """
    Returns data for Admin Dashboard:
    - Cards: Total Students, Avg Global Grade, Attendance, At Risk
    - Charts: Performance Dist, Attendance Trend, Teacher Workload
    """
    if request.user.user_type != 'admin':
        return Response({'success': False, 'message': 'Forbidden'}, status=403)
        
    try:
        students = Utilisateur.objects.filter(user_type='student')
        
        # 1. Cards Data
        total_students = students.count()
        
        # Avg Global Grade (from Performance model)
        global_avg_q = Performance.objects.aggregate(Avg('moyenne_generale'))
        global_avg = global_avg_q['moyenne_generale__avg'] or 0
        
        # At Risk Count
        at_risk_count = Performance.objects.filter(categorie_risque__in=['À risque', 'At Risk']).count()
        
        # Mock Attendance (since Note has assiduite/presence, we aggregate that)
        # Note: 'presence' in Note model is integer. Let's assume it's hours/days.
        # We'll use a mock "Rate" for now if data is scarce.
        # Check actual Note data
        avg_presence = Note.objects.aggregate(Avg('presence'))['presence__avg'] or 95
        
        # 2. Charts Data
        
        # Chart: Performance Distribution (Pie)
        perf_dist, _ = get_performance_distribution(students)
        if not perf_dist:
             perf_dist = [{'name': 'Not Analyzed', 'value': total_students}]

        # Chart: Teacher Workload (Top 5 Teachers by Student Count)
        # Assuming teachers are linked to classes, and classes to students.
        # Classes -> Enseignant Responsable
        teachers = Utilisateur.objects.filter(user_type='teacher')
        teacher_workload = []
        for t in teachers:
            # Count students in classes where he is responsible
            cnt = Utilisateur.objects.filter(classe__enseignant_responsable=t).count()
            if cnt > 0:
                teacher_workload.append({'name': f"{t.first_name} {t.last_name}", 'students': cnt})
        
        teacher_workload = sorted(teacher_workload, key=lambda x: x['students'], reverse=True)[:5]
        
        # Chart: Attendance Trend (Mock/Area)
        # Since we don't have historical "daily" attendance in DB, we generate plausible trend data based on current avg
        base_att = avg_presence
        attendance_trend = [
            {'month': 'Sep', 'rate': min(100, base_att + 2)},
            {'month': 'Oct', 'rate': min(100, base_att + 1)},
            {'month': 'Nov', 'rate': base_att},
            {'month': 'Dec', 'rate': max(0, base_att - 2)}, # Winter dip
            {'month': 'Jan', 'rate': max(0, base_att - 1)},
        ]

        return Response({
            'success': True,
            'cards': {
                'total_students': total_students,
                'global_avg': round(global_avg, 2),
                'attendance_rate': round(avg_presence, 1),
                'at_risk_count': at_risk_count
            },
            'charts': {
                'performance_distribution': perf_dist,
                'teacher_workload': teacher_workload,
                'attendance_trend': attendance_trend
            }
        })
        
    except Exception as e:
        logger.error(f"Error in admin_dashboard_stats: {e}")
        return Response({'success': False, 'message': str(e)}, status=500)


# --- TEACHER VIEW ---

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def teacher_dashboard_stats(request):
    """
    Returns data for Teacher Dashboard:
    - Cards: Classes count, Students count, Avg Grade, At Risk (in my classes)
    - Charts: Class Comparison, Pass/Fail, Recent Activity
    """
    if request.user.user_type != 'teacher':
        return Response({'success': False, 'message': 'Forbidden'}, status=403)

    try:
        # Teacher's Matieres (Subjects they teach)
        matieres = Matiere.objects.filter(enseignant=request.user).select_related('classe')
        my_classes = list(set([m.classe for m in matieres if m.classe]))
        
        # Students in these classes
        students_ids = Utilisateur.objects.filter(classe__in=my_classes).values_list('id', flat=True)
        
        # 1. Cards
        total_classes = len(my_classes)
        total_students = len(students_ids)
        
        # Avg grade in MY subjects (Note objects linked to my matieres)
        my_notes = Note.objects.filter(matiere__in=matieres)
        my_avg = my_notes.aggregate(Avg('note_module'))['note_module__avg'] or 0
        
        # At Risk in my classes (Global Status)
        at_risk = Performance.objects.filter(etudiant_id__in=students_ids, categorie_risque__in=['À risque', 'At Risk']).count()
        
        # 2. Charts
        
        # Chart: Class Comparison (Bar) - Compare averages of different classes taught by this teacher
        class_comparison = []
        for cls in my_classes:
            # Avg of notes for this teacher in this class
            # teacher -> matieres -> notes. Filter by class.
            cls_avg = Note.objects.filter(matiere__enseignant=request.user, etudiant__classe=cls).aggregate(Avg('note_module'))['note_module__avg'] or 0
            if cls_avg > 0:
                class_comparison.append({'name': cls.nom, 'avg': round(cls_avg, 2)})
        
        # Chart: Success/Fail Rate (Donut) - Across all my students
        # Pass >= 10 (or 12 depending on rule, usually 10 for absolute pass)
        pass_count = my_notes.filter(note_module__gte=10).count()
        fail_count = my_notes.filter(note_module__lt=10).count()
        pass_fail_data = [
            {'name': 'Pass (>10)', 'value': pass_count},
            {'name': 'Fail (<10)', 'value': fail_count}
        ]
        if pass_count == 0 and fail_count == 0:
             pass_fail_data = [] # Or placeholder

        # Chart: Grade Distribution (Existing logic, but simplified return here for unity)
        # We can implement a simple histogram
        distribution = {
            '0-5': my_notes.filter(note_module__lt=5).count(),
            '5-10': my_notes.filter(note_module__gte=5, note_module__lt=10).count(),
            '10-15': my_notes.filter(note_module__gte=10, note_module__lt=15).count(),
            '15-20': my_notes.filter(note_module__gte=15).count()
        }
        dist_chart = [{'range': k, 'count': v} for k, v in distribution.items()]

        return Response({
            'success': True,
            'cards': {
                'total_classes': total_classes,
                'total_students': total_students,
                'my_avg': round(my_avg, 2),
                'at_risk_count': at_risk
            },
            'charts': {
                'class_comparison': class_comparison,
                'pass_fail': pass_fail_data,
                'grade_distribution': dist_chart,
                'activity_trend': [ # Mock participation trend
                    {'month': 'Sep', 'files': 5, 'msgs': 12}, 
                    {'month': 'Oct', 'files': 8, 'msgs': 20},
                    {'month': 'Nov', 'files': 12, 'msgs': 25}, 
                    {'month': 'Dec', 'files': 6, 'msgs': 10},
                    {'month': 'Jan', 'files': 10, 'msgs': 18}
                ]
            }
        })

    except Exception as e:
        logger.error(f"Error in teacher_dashboard_stats: {e}")
        return Response({'success': False, 'message': str(e)}, status=500)

# --- STUDENT VIEW ---

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def student_dashboard_stats(request):
    """
    Returns data for Student Dashboard:
    - Cards: My Avg, Rank, Attendance, Alerts
    - Charts: Skills Radar (Me vs Class), Monthly Attendance, Perf Trend
    """
    if request.user.user_type != 'student':
        return Response({'success': False, 'message': 'Forbidden'}, status=403)
        
    try:
        student = request.user
        
        # 1. Cards
        # My Avg
        my_notes = Note.objects.filter(etudiant=student)
        my_avg = my_notes.aggregate(Avg('note_module'))['note_module__avg'] or 0
        
        # Alerts
        # Assuming you have an Alerte model imported? 
        # Wait, I need to check imports. I imported Alerte? No.
        # I imported Performance. Check models.py
        alert_count = Alerte.objects.filter(etudiant=student).count()
        
        # Attendance
        my_presence = my_notes.aggregate(Avg('presence'))['presence__avg'] or 100
        
        # Global Perf (for Rank/Status)
        perf = Performance.objects.filter(etudiant=student).first()
        status_label = display_performance_label(perf.categorie_risque) if perf else "Not Analyzed"
        
        # 2. Charts
        
        # Chart: Radar (My Grades vs Class Avg per Subject)
        # Subjects the student has
        radar_data = []
        for note in my_notes.select_related('matiere'):
            subject_name = display_subject_name(note.matiere.nom)
            my_grade = note.note_module
            
            # Class Avg for this subject
            # note.matiere -> all notes for this matiere
            class_avg = Note.objects.filter(matiere=note.matiere).aggregate(Avg('note_module'))['note_module__avg'] or 0
            
            radar_data.append({
                'subject': subject_name,
                'Me': round(my_grade, 2),
                'Class': round(class_avg, 2),
                'fullMark': 20
            })
            
        # Chart: Monthly Attendance (Mock)
        # Generate varied data based on current overall
        monthly_att = [
            {'name': 'Sep', 'present': 10, 'absent': 0},
            {'name': 'Oct', 'present': 9, 'absent': 1},
            {'name': 'Nov', 'present': 10, 'absent': 0},
            {'name': 'Dec', 'present': 8, 'absent': 2},
        ]
        
        return Response({
            'success': True,
            'cards': {
                'my_avg': round(my_avg, 2),
                'status_label': status_label,
                'attendance_rate': round(my_presence, 1),
                'alert_count': alert_count
            },
            'charts': {
                'radar_data': radar_data,
                'monthly_attendance': monthly_att
            }
        })
        
    except Exception as e:
        logger.error(f"Error in student_dashboard_stats: {e}")
        return Response({'success': False, 'message': str(e)}, status=500)
