import csv
import logging
from django.db.models import Avg, Max, Count, Case, When, Value
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status

from ..models import Utilisateur, Classe, Matiere, Note, Alerte, Recommandation, Performance
from ..serializers import UtilisateurSerializer, ClasseSerializer, MatiereSerializer, NoteSerializer

logger = logging.getLogger(__name__)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_teacher_matieres(request):
    if request.user.user_type != 'teacher':
        return Response({'success': False, 'message': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

    matieres = Matiere.objects.filter(enseignant=request.user)
    serializer = MatiereSerializer(matieres, many=True)
    return Response({'success': True, 'matieres': serializer.data})

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_teacher_notes(request):
    if request.user.user_type != 'teacher':
        return Response({'success': False, 'message': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

    matiere_id = request.query_params.get('matiere_id')
    if not matiere_id:
        return Response({'success': False, 'message': 'matiere_id est requis'}, status=status.HTTP_400_BAD_REQUEST)

    matiere = Matiere.objects.filter(id=matiere_id, enseignant=request.user).first()
    if not matiere:
        return Response({'success': False, 'message': 'Matière non trouvée ou accès non autorisé'}, status=status.HTTP_404_NOT_FOUND)

    notes = Note.objects.filter(matiere=matiere)
    serializer = NoteSerializer(notes, many=True)
    return Response({'success': True, 'notes': serializer.data})

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_or_update_note(request):
    """
    Vue pour créer ou mettre à jour une note.
    """
    if request.user.user_type != 'teacher':
        return Response({'success': False, 'message': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    matiere_id = data.get('matiere_id')
    etudiant_id = data.get('etudiant_id')

    matiere = Matiere.objects.filter(id=matiere_id, enseignant=request.user).first()
    if not matiere:
        return Response({'success': False, 'message': 'Matière non trouvée ou accès non autorisé'}, status=status.HTTP_404_NOT_FOUND)

    etudiant = Utilisateur.objects.filter(id=etudiant_id, user_type='student', classe=matiere.classe).first()
    if not etudiant:
        return Response({'success': False, 'message': 'Étudiant non trouvé ou accès non autorisé'}, status=status.HTTP_404_NOT_FOUND)

    note, created = Note.objects.update_or_create(
        matiere=matiere,
        etudiant=etudiant,
        defaults={
            'note_module': data.get('note_module'),
            'note_devoir_projet': data.get('note_devoir_projet'),
            'assiduite': data.get('assiduite'),
            'presence': data.get('presence'),
        }
    )

    serializer = NoteSerializer(note)
    return Response({
        'success': True,
        'note': serializer.data,
        'message': 'Note créée/mise à jour avec succès'
    })

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_note(request, id):
    """
    Vue pour supprimer une note.
    """
    if request.user.user_type != 'teacher':
        return Response({'success': False, 'message': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

    note = Note.objects.filter(id=id, matiere__enseignant=request.user).first()
    if not note:
        return Response({'success': False, 'message': 'Note non trouvée ou accès non autorisé'}, status=status.HTTP_404_NOT_FOUND)

    note.delete()
    return Response({'success': True, 'message': 'Note supprimée avec succès'})

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def import_notes(request):
    """
    Vue pour importer des notes à partir d'un fichier CSV.
    """
    if request.user.user_type != 'teacher':
        return Response({'success': False, 'message': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

    if not request.FILES.get('file'):
        return Response({'success': False, 'message': 'Aucun fichier trouvé'}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['file']
    if not file.name.endswith('.csv'):
        return Response({'success': False, 'message': 'Le fichier doit être un CSV'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        decoded_file = file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)

        for row in reader:
            matiere_id = row.get('matiere_id')
            etudiant_id = row.get('etudiant_id')

            matiere = Matiere.objects.filter(id=matiere_id, enseignant=request.user).first()
            if not matiere:
                continue

            etudiant = Utilisateur.objects.filter(id=etudiant_id, user_type='student', classe=matiere.classe).first()
            if not etudiant:
                continue

            Note.objects.update_or_create(
                matiere=matiere,
                etudiant=etudiant,
                defaults={
                    'note_module': row.get('note_module'),
                    'note_devoir_projet': row.get('note_devoir_projet'),
                    'assiduite': row.get('assiduite'),
                    'presence': row.get('presence'),
                }
            )

        return Response({'success': True, 'message': 'Notes importées avec succès'})
    except Exception as e:
        return Response({'success': False, 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_students_by_matiere(request):
    if request.user.user_type != 'teacher':
        return Response({'success': False, 'message': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

    matiere_id = request.query_params.get('matiere_id')
    if not matiere_id:
        return Response({'success': False, 'message': 'matiere_id est requis'}, status=status.HTTP_400_BAD_REQUEST)

    matiere = Matiere.objects.filter(id=matiere_id, enseignant=request.user).first()
    if not matiere:
        return Response({'success': False, 'message': 'Matière non trouvée ou accès non autorisé'}, status=status.HTTP_404_NOT_FOUND)

    students = Utilisateur.objects.filter(classe=matiere.classe, user_type='student')
    serializer = UtilisateurSerializer(students, many=True)
    return Response({'success': True, 'students': serializer.data})

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_teacher_classes(request):
    if request.user.user_type != 'teacher':
        return Response({'success': False, 'message': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

    classes = Classe.objects.filter(enseignant_responsable=request.user)
    serializer = ClasseSerializer(classes, many=True)
    return Response({'success': True, 'classes': serializer.data})

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_teacher_statistics(request):
    try:
        if request.user.user_type != 'teacher':
            return Response({'success': False, 'message': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

        matiere_id = request.query_params.get('matiere_id')
        if not matiere_id:
            return Response({'success': False, 'message': 'matiere_id est requis'}, status=status.HTTP_400_BAD_REQUEST)

        matiere = Matiere.objects.filter(id=matiere_id, enseignant=request.user).first()
        if not matiere:
            return Response({'success': False, 'message': 'Matière non trouvée ou accès non autorisé'}, status=status.HTTP_404_NOT_FOUND)

        notes = Note.objects.filter(matiere=matiere)
        if notes.exists():
            average_grade = notes.aggregate(Avg('note_module'))['note_module__avg']
            highest_grade = notes.aggregate(Max('note_module'))['note_module__max']
        else:
            average_grade = 0
            highest_grade = 0

        return Response({
            'success': True,
            'matiere_stats': [{
                'matiere_id': matiere.id,
                'matiere_nom': matiere.nom,
                'average_grade': round(average_grade, 2),
                'highest_grade': highest_grade,
            }]
        })

    except Exception as e:
        logger.error(f"Error in get_teacher_statistics: {str(e)}", exc_info=True)
        return Response({'success': False, 'message': 'Une erreur est survenue lors de la récupération des statistiques'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_grade_distribution(request):
    if request.user.user_type != 'teacher':
        return Response({'success': False, 'message': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

    matiere_id = request.query_params.get('matiere_id')
    if not matiere_id:
        return Response({'success': False, 'message': 'matiere_id est requis'}, status=status.HTTP_400_BAD_REQUEST)

    matiere = Matiere.objects.filter(id=matiere_id, enseignant=request.user).first()
    if not matiere:
        return Response({'success': False, 'message': 'Matière non trouvée ou accès non autorisé'}, status=status.HTTP_404_NOT_FOUND)

    notes = Note.objects.filter(matiere=matiere)
    grade_distribution = [
        {'range': '0-5', 'count': notes.filter(note_module__gte=0, note_module__lte=5).count()},
        {'range': '6-10', 'count': notes.filter(note_module__gte=6, note_module__lte=10).count()},
        {'range': '11-15', 'count': notes.filter(note_module__gte=11, note_module__lte=15).count()},
        {'range': '16-20', 'count': notes.filter(note_module__gte=16, note_module__lte=20).count()},
    ]

    return Response({'success': True, 'grade_distribution': grade_distribution})

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_teacher_alerts(request):
    """
    Vue pour récupérer les alertes pour une matière spécifique
    Retourne les étudiants à risque avec leurs informations
    """
    try:
        matiere_id = request.query_params.get('matiere_id')
        if not matiere_id:
            return Response({'success': False, 'message': 'Le paramètre matiere_id est requis'}, status=status.HTTP_400_BAD_REQUEST)

        matiere = Matiere.objects.filter(id=matiere_id, enseignant=request.user).first()
        if not matiere:
            return Response({'success': False, 'message': 'Matière non trouvée ou accès non autorisé'}, status=status.HTTP_404_NOT_FOUND)

        alerts = Alerte.objects.filter(matiere_id=matiere_id).select_related('etudiant')
        
        alerts_data = []
        for alert in alerts:
            avg_score = Note.objects.filter(
                matiere_id=matiere_id,
                etudiant=alert.etudiant
            ).aggregate(avg_score=Avg('note_module'))['avg_score'] or 0

            alerts_data.append({
                'student_id': alert.etudiant.id,
                'student_name': f"{alert.etudiant.first_name} {alert.etudiant.last_name}",
                'message': alert.message,
                'performance_category': 'À risque',
                'average_score': round(float(avg_score), 2),
                'matiere_id': matiere_id,
                'matiere_name': matiere.nom
            })

        return Response({'success': True, 'alerts': alerts_data})

    except Exception as e:
        logger.error(f"Erreur dans get_teacher_alerts: {str(e)}", exc_info=True)
        return Response({'success': False, 'message': 'Une erreur est survenue lors de la récupération des alertes'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_teacher_classifications(request):
    """
    Vue pour récupérer les classifications des étudiants par matière.
    Affiche TOUS les étudiants de la classe, même sans note.
    Enrichie avec les prédictions IA globales.
    """
    try:
        if request.user.user_type != 'teacher':
            return Response({'success': False, 'message': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

        matiere_id = request.query_params.get('matiere_id')
        if not matiere_id:
            return Response({'success': False, 'message': 'Le paramètre matiere_id est requis'}, status=status.HTTP_400_BAD_REQUEST)

        matiere = Matiere.objects.filter(id=matiere_id, enseignant=request.user).select_related('classe').first()
        if not matiere:
            return Response({'success': False, 'message': 'Matière non trouvée ou accès non autorisé'}, status=status.HTTP_404_NOT_FOUND)

        # 1. Fetch ALL students in the class
        students = Utilisateur.objects.filter(classe=matiere.classe, user_type='student')
        
        # 2. Get AI Predictions (Performance)
        performances = Performance.objects.filter(etudiant__in=students)
        perf_map = {p.etudiant_id: p for p in performances}
        
        # 3. Get Subject Grades (Notes)
        notes = Note.objects.filter(matiere=matiere, etudiant__in=students).values('etudiant').annotate(avg=Avg('note_module'))
        note_map = {n['etudiant']: n['avg'] for n in notes}

        classifications_data = []
        for student in students:
            # Subject Performance (Real Grades)
            avg_score = note_map.get(student.id)
            
            if avg_score is not None:
                if avg_score >= 16:
                    perf_cat = 'Bon performeur'
                elif avg_score >= 12:
                    perf_cat = 'Moyenne performance'
                else:
                    perf_cat = 'À risque'
                display_score = round(avg_score, 2)
            else:
                perf_cat = 'Non évalué'
                display_score = "N/A"

            # AI Global Performance
            ai_data = perf_map.get(student.id)
            ai_category = ai_data.categorie_risque if ai_data else "Non Analysé"
            ai_prediction = round(ai_data.moyenne_generale, 2) if ai_data and ai_data.moyenne_generale else "-"

            classifications_data.append({
                'student_id': student.id,
                'student_name': f"{student.first_name} {student.last_name}",
                'performance_category': perf_cat,
                'average_score': display_score,
                'ai_category': ai_category,
                'ai_prediction': ai_prediction,
                'matiere_id': matiere_id,
                'matiere_name': matiere.nom
            })

        return Response({'success': True, 'classifications': classifications_data})

    except Exception as e:
        logger.error(f"Erreur dans get_teacher_classifications: {str(e)}", exc_info=True)
        return Response({'success': False, 'message': 'Une erreur est survenue lors de la récupération des classifications'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_teacher_recommendations(request):
    try:
        if request.user.user_type != 'teacher':
            return Response({'success': False, 'message': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

        matiere_id = request.query_params.get('matiere_id')
        if not matiere_id:
            return Response({'success': False, 'message': 'Le paramètre matiere_id est requis'}, status=status.HTTP_400_BAD_REQUEST)

        matiere = Matiere.objects.filter(id=matiere_id, enseignant=request.user).first()
        if not matiere:
            return Response({'success': False, 'message': 'Matière non trouvée ou accès non autorisé'}, status=status.HTTP_404_NOT_FOUND)

        recommendations = Recommandation.objects.filter(
            matiere_id=matiere_id
        ).select_related('etudiant')

        recommendations_dict = {}
        for rec in recommendations:
            if rec.etudiant.id not in recommendations_dict:
                recommendations_dict[rec.etudiant.id] = {
                    'student_id': rec.etudiant.id,
                    'student_name': f"{rec.etudiant.first_name} {rec.etudiant.last_name}",
                    'recommendations': []
                }
            recommendations_dict[rec.etudiant.id]['recommendations'].append({
                'message': rec.contenu,
                'type': 'matiere' if rec.matiere else 'general'
            })

        recommendations_data = list(recommendations_dict.values())

        return Response({'success': True, 'recommendations': recommendations_data})

    except Exception as e:
        logger.error(f"Erreur dans get_teacher_recommendations: {str(e)}", exc_info=True)
        return Response({'success': False, 'message': 'Une erreur est survenue lors de la récupération des recommandations'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
