import logging
from django.apps import apps
from django.db.models import Avg, Count, F
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status
from django.utils import timezone
import pandas as pd
import random

from ..models import Utilisateur, Performance, Alerte, Note, Recommandation
from ..ml_utils import predict_student, prepare_student_data
from ..display import display_performance_label

logger = logging.getLogger(__name__)

def _update_class_predictions(class_id):
    """
    Helper function to run predictions for a class and update Performance/Alerts/Recommendations tables.
    """
    students = Utilisateur.objects.filter(classe_id=class_id, user_type='student')
    
    count_updated = 0
    
    for student in students:
        # Predict
        try:
            grade_pred, category_idx = predict_student(student)
        except Exception as e:
            logger.error(f"Prediction failed for student {student.id}: {e}")
            continue
        
        if grade_pred is None:
            continue
            
        # Map category index to label
        categories = ['At Risk', 'Average Performance', 'High Performer']
        category_label = categories[category_idx] if 0 <= category_idx < len(categories) else 'Unknown'
        
        # Update/Create Performance
        Performance.objects.update_or_create(
            etudiant=student,
            defaults={
                'moyenne_generale': grade_pred,
                'categorie_risque': category_label,
                'date_calcul': timezone.now()
            }
        )
        
        # Handle Alerts & Recommendations
        # Clear old ones to avoid duplicates/stale data
        Alerte.objects.filter(etudiant=student).delete()
        Recommandation.objects.filter(etudiant=student).delete()
        
        # 1. ALERTS
        if category_label == 'At Risk':
            Alerte.objects.create(
                etudiant=student,
                message=f"Attention: You have been identified as 'At Risk' with a predicted average of {grade_pred}/20. Please review your recommendations."
            )
        
        # 2. RECOMMENDATIONS
        recs_to_create = []
        if category_label == 'At Risk':
            recs_to_create = [
                "Strengthen the fundamentals in mathematics and algorithms.",
                "Attend weekly tutoring sessions."
            ]
        elif category_label == 'Average Performance':
            recs_to_create = [
                "Deepen hands-on projects to consolidate learning.",
                "Review additional online resources."
            ]
        else:
            recs_to_create = [
                "Explore advanced topics such as AI and big data.",
                "Join hackathons or research projects."
            ]
            
        for rec_msg in recs_to_create:
            Recommandation.objects.create(
                etudiant=student,
                contenu=rec_msg,
                date_creation=timezone.now()
            )
            
        count_updated += 1
        
    return count_updated

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def classify_class_students(request):
    """
    Explicitly trigger classification.
    """
    try:
        class_id = request.data.get('class_id')
        if not class_id:
            return Response({'error': 'class_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        _update_class_predictions(class_id)
        
        # Return results using the dashboard format or simple list
        return class_dashboard(request._request)

    except Exception as e:
        logger.error(f"Error in classify_class_students: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def predict_grades(request):
    """
    Simulation endpoint.
    If 'class_id' is provided: return predictions for all students in the class.
    If raw data provided: return single prediction.
    """
    try:
        data = request.data
        if not data:
             return Response({'error': 'No data provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if class_id is present (Class Mode)
        class_id = data.get('class_id')
        if class_id:
            # Predict for entire class
            students = Utilisateur.objects.filter(classe_id=class_id, user_type='student')
            student_results = []
            
            for student in students:
                # Use helper to get data (G1=S1, G2=S2)
                df = prepare_student_data(student)
                g1 = float(df['G1'].iloc[0])
                g2 = float(df['G2'].iloc[0])
                
                # Predict
                try:
                    grade, _ = predict_student(student)
                except:
                    grade = 0
                
                student_results.append({
                    'student_id': student.id,
                    'student_name': f"{student.first_name} {student.last_name}",
                    's1_avg': round(g1, 2),
                    's2_avg': round(g2, 2),
                    'predicted_avg': {'note': grade} 
                })
                
            # Define the dynamic column for frontend
            matieres = [{
                'id': 'pred_s3_s4',
                'nom': 'Estimated Overall Average',
                'semestre': '3 & 4',
                'coef': 1,
                'field_name': 'predicted_avg'
            }]
            
            # Fetch Class Name
            try:
                class_name = students.first().classe.nom if students.exists() else "Classe"
            except:
                class_name = "Classe"

            return Response({
                'success': True,
                'class_name': class_name,
                'students': student_results,
                'matieres': matieres
            })

        # Existing Mode (Raw Data)
        api_config = apps.get_app_config('data')
        model = api_config.model_reg
        
        if not model:
            return Response({'error': 'Model not loaded'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        if isinstance(data, dict):
            df = pd.DataFrame([data])
        elif isinstance(data, list):
            df = pd.DataFrame(data)
        else:
            return Response({'error': 'Invalid data format'}, status=status.HTTP_400_BAD_REQUEST)

        # Predict
        predictions = model.predict(df)
        
        return Response({'success': True, 'predictions': predictions.tolist()})

    except Exception as e:
        logger.error(f"Error in predict_grades: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_class_alerts(request):
    try:
        class_id = request.data.get('class_id')
        if not class_id:
            return Response({'error': 'class_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Fetch alerts joined with Performance to get risk category
        alerts = Alerte.objects.filter(etudiant__classe_id=class_id).select_related('etudiant', 'etudiant__performance')
        
        alerts_data = []
        for alert in alerts:
            # Safe access to performance
            perf_cat = 'Unknown'
            try:
                perf_cat = alert.etudiant.performance.categorie_risque
            except Performance.DoesNotExist:
                perf_cat = 'Unknown'

            # Mock recommendations based on risk (Frontend Expects this structure in alerts too)
            recommendations = []
            if perf_cat in ['À risque', 'At Risk']:
                recommendations = [
                    {'subject': 'General Support', 'resources': [{'name': 'Methodology guide', 'link': '#'}]},
                ]

            alerts_data.append({
                'student_id': alert.etudiant.id,
                'student_name': f"{alert.etudiant.first_name} {alert.etudiant.last_name}",
                'alert_message': alert.message, 
                'performance_category': display_performance_label(perf_cat), 
                'date': alert.date_creation,
                'course_recommendations': recommendations
            })
            
        return Response({'alerts': alerts_data})
    except Exception as e:
        logger.error(f"Error in get_class_alerts: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_class_recommendations(request):
    try:
        class_id = request.data.get('class_id')
        if not class_id:
             return Response({'error': 'class_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Get students with their performance
        students = Utilisateur.objects.filter(classe_id=class_id, user_type='student').select_related('performance')
        
        recommendations_data = []
        
        for student in students:
            try:
                perf = student.performance
            except Performance.DoesNotExist:
                continue 
            
            # Read real recommendations from DB
            db_recs = Recommandation.objects.filter(etudiant=student)
            
            recs_list = []
            for r in db_recs:
                 recs_list.append({'priority': 'medium', 'message': r.contenu})
                 
            # Fallback if specific structure needed for frontend, or map DB recs
            # If DB is empty (shouldn't be if classified), generate fallback?
            # Keeping orientation logic for display
            orientation = {}
            if perf.categorie_risque in ['À risque', 'At Risk']:
                orientation = {'orientation': 'Intensive Support', 'description': 'Remediation program needed for S3.'}
            elif perf.categorie_risque in ['Moyenne performance', 'Average Performance']:
                orientation = {'orientation': 'Standard', 'description': 'Continue the standard curriculum.'}
            else: 
                orientation = {'orientation': 'Excellence', 'description': 'Move toward advanced specializations.'}
            
            recommendations_data.append({
                'student_id': student.id,
                'student_name': f"{student.first_name} {student.last_name}",
                'performance_category': display_performance_label(perf.categorie_risque),
                'recommendations': recs_list,
                'academic_orientation': orientation
            })
            
        return Response({'recommendations': recommendations_data})
        
    except Exception as e:
        logger.error(f"Error in get_class_recommendations: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def class_dashboard(request):
    try:
        class_id = request.data.get('class_id')
        if not class_id:
            return Response({'error': 'class_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        perfs = Performance.objects.filter(etudiant__classe_id=class_id).select_related('etudiant')
        
        classification = []
        for p in perfs:
            classification.append({
                'student_id': p.etudiant.id,
                'student_name': f"{p.etudiant.first_name} {p.etudiant.last_name}",
                'average_score': p.moyenne_generale,
                'performance_category': display_performance_label(p.categorie_risque),
            })
            
        if perfs.exists():
            stats_data = {
                'average_score': perfs.aggregate(Avg('moyenne_generale'))['moyenne_generale__avg'] or 0,
                'at_risk_count': perfs.filter(categorie_risque__in=['À risque', 'At Risk']).count(),
                'good_performers': perfs.filter(categorie_risque__in=['Bon performeur', 'High Performer']).count(),
                'total_students': perfs.count()
            }
        else:
             stats_data = None
        
        alerts = [] 
        db_alerts = Alerte.objects.filter(etudiant__classe_id=class_id)
        for a in db_alerts:
             alerts.append({'student_id': a.etudiant.id, 'message': a.message})

        return Response({
            'classification': classification,
            'statistics': stats_data,
            'alerts': alerts,
            'recommendations': [] 
        })
    except Exception as e:
        logger.error(f"Error in class_dashboard: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
