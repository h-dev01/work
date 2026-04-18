import logging
from datetime import timedelta
from django.utils import timezone
from django.db.models import Avg
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status

from ..models import Note, Matiere, Alerte, Recommandation
from ..serializers import NoteSerializer

logger = logging.getLogger(__name__)

# --- Helper Functions (Local placeholders for missing utils) ---

MATIERE_RECOMMENDATIONS = {
    "default": {
        "noms": ["Ressource générale d'apprentissage"],
        "liens": ["https://www.coursera.org"]
    }
}

def get_subject_recommendations(matiere_nom):
    """Retourne les recommandations pour une matière spécifique"""
    if not matiere_nom:
        return MATIERE_RECOMMENDATIONS["default"]
    # Simple logic used as placeholder
    return MATIERE_RECOMMENDATIONS["default"]

def get_academic_orientation(student_notes):
    """Détermine l'orientation académique basée sur les notes"""
    # Placeholder logic
    return None

# -----------------------------------------------------------

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_student_notes(request):
    if request.user.user_type != 'student':
        return Response({'success': False, 'message': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

    notes = Note.objects.filter(etudiant=request.user)
    serializer = NoteSerializer(notes, many=True)
    return Response({'success': True, 'notes': serializer.data})

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def student_dashboard(request):
    """
    Improved version with better error handling and null checks
    """
    if not hasattr(request.user, 'is_etudiant') or not request.user.is_etudiant():
        return Response({'success': False, 'message': 'Seuls les étudiants peuvent accéder à ce tableau de bord.'}, status=status.HTTP_403_FORBIDDEN)
    
    student = request.user
    
    try:
        # Initialize default response structure
        data = {
            'success': True,
            'name': f"{student.first_name or ''} {student.last_name or ''}".strip(),
            'currentAverage': 0.0,
            'attendanceRate': 0,
            'recentGrades': [],
            'monthlyPerformance': [],
            'subjectPerformance': [],
            'notifications': []
        }

        # Get all notes for the student
        notes = Note.objects.filter(etudiant=student).select_related('matiere')
        
        # 1. Calculate current average
        if notes.exists():
            avg_result = notes.aggregate(avg=Avg('note_module'))
            data['currentAverage'] = round(float(avg_result['avg'] or 0), 1)
            
            # 2. Calculate attendance rate (assuming presence is percentage)
            attendance_avg = notes.aggregate(avg=Avg('presence'))['avg']
            data['attendanceRate'] = round(float(attendance_avg or 0))

        # 3. Recent grades (last 3 notes)
        recent_notes = notes.order_by('-date_ajout')[:3]
        data['recentGrades'] = [{
            'course': note.matiere.nom if note.matiere else 'Unknown',
            'grade': note.note_module,
            'date': note.date_ajout.strftime('%d/%m/%Y') if note.date_ajout else ''
        } for note in recent_notes]

        # 4. Monthly performance (last 6 months)
        now = timezone.now()
        monthly_performance = []
        
        for i in range(5, -1, -1):
            month_start = now - timedelta(days=30*i)
            month_end = month_start + timedelta(days=30)
            
            month_avg = notes.filter(
                date_ajout__gte=month_start,
                date_ajout__lte=month_end
            ).aggregate(avg=Avg('note_module'))['avg'] or 0
            
            monthly_performance.append({
                'month': month_start.strftime('%b'),
                'average': round(float(month_avg), 1)
            })
        
        data['monthlyPerformance'] = monthly_performance

        # 5. Subject performance
        subjects = Matiere.objects.filter(note__etudiant=student).distinct()
        data['subjectPerformance'] = [{
            'name': sub.nom,
            'value': round(float(
                notes.filter(matiere=sub).aggregate(avg=Avg('note_module'))['avg'] or 0
            ), 1)
        } for sub in subjects]

        # 6. Notifications (alerts + recommendations)
        alerts = Alerte.objects.filter(etudiant=student)
        recommendations = Recommandation.objects.filter(etudiant=student)
        
        data['notifications'] = [
            *[{'type': 'alert', 'message': a.message} for a in alerts],
            *[{'type': 'info', 'message': r.contenu} for r in recommendations]
        ]

        return Response(data)
    
    except Exception as e:
        logger.error(f"Dashboard error for {student}: {str(e)}", exc_info=True)
        return Response({'success': False, 'message': 'Une erreur est survenue lors du chargement du tableau de bord.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def student_recommendations(request):
    """
    API view for student's recommendations
    Returns all recommendations for the logged-in student
    """
    if not hasattr(request.user, 'is_etudiant') or not request.user.is_etudiant():
        return Response({'success': False, 'message': 'Seuls les étudiants peuvent accéder à leurs recommandations.'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        student = request.user
        # Récupérer les données générées par generate_recommendations_for_class
        notes = Note.objects.filter(etudiant=student).select_related('matiere')
        orientation = get_academic_orientation(notes)
        
        # Créer la structure similaire à l'admin
        recommendations = {
            'academic_orientation': {
                'orientation': orientation['orientation'] if orientation else None,
                'description': orientation['description'] if orientation else None
            },
            'performance_recommendations': [],
            'subject_recommendations': []
        }

        # Récupérer les recommandations en base
        db_recommendations = Recommandation.objects.filter(etudiant=student).order_by('-date_creation')
        
        for rec in db_recommendations:
            if rec.matiere:
                # Recommandation par matière
                rec_data = get_subject_recommendations(rec.matiere.nom)
                recommendations['subject_recommendations'].append({
                    'subject': rec.matiere.nom,
                    'message': rec.contenu,
                    'resources': [
                        {'name': name, 'link': link} 
                        for name, link in zip(rec_data['noms'], rec_data['liens'])
                    ],
                    'date': rec.date_creation
                })
            else:
                # Recommandation générale
                recommendations['performance_recommendations'].append({
                    'message': rec.contenu,
                    'date': rec.date_creation
                })

        return Response({'success': True, 'recommendations': recommendations})
        
    except Exception as e:
        return Response({'success': False, 'message': f'Une erreur est survenue: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def student_alerts(request):
    try:
        if not hasattr(request.user, 'is_etudiant') or not request.user.is_etudiant():
            return Response({'success': False, 'message': 'Seuls les étudiants peuvent accéder à leurs alertes.'}, status=status.HTTP_403_FORBIDDEN)
        
        student = request.user
        alerts = Alerte.objects.filter(etudiant=student).order_by('-date_creation')
        
        alerts_data = []
        for alert in alerts:
            # Trouver les matières faibles pour cet étudiant
            weak_notes = Note.objects.filter(
                etudiant=student,
                note_module__lt=10
            ).select_related('matiere')
            
            course_recommendations = []
            for note in weak_notes:
                rec = get_subject_recommendations(note.matiere.nom)
                course_recommendations.append({
                    'subject': note.matiere.nom,
                    'resources': [
                        {'name': name, 'link': link} 
                        for name, link in zip(rec['noms'], rec['liens'])
                    ]
                })
            
            alerts_data.append({
                'id': alert.id,
                'message': alert.message,
                'date_creation': alert.date_creation,
                'course_recommendations': course_recommendations,
                'is_expanded': False
            })
        
        return Response({'success': True, 'alerts': alerts_data})
        
    except Exception as e:
        return Response({'success': False, 'message': f'Une erreur est survenue: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
