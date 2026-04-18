from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Avg, Count
from django.db.models.functions import TruncMonth
from ..models import Note, Performance, Matiere

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_performance_trend(request):
    """
    Retrieve overall performance trend
    """
    # Calculate average performance by month
    performance_data = Note.objects.annotate(
        month=TruncMonth('date_ajout')
    ).values('month').annotate(
        average=Avg('note_module')
    ).order_by('month')

    # Transform data for frontend
    chart_data = [
        {
            'month': entry['month'].strftime('%B %Y'),
            'average': round(entry['average'], 2)
        } for entry in performance_data
    ]

    return Response(chart_data)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_attendance_rate(request):
    """
    Retrieve attendance rate data
    """
    # Calculate average attendance by month
    attendance_data = Note.objects.annotate(
        month=TruncMonth('date_ajout')
    ).values('month').annotate(
        rate=Avg('presence')
    ).order_by('month')

    # Transform data for frontend
    chart_data = [
        {
            'month': entry['month'].strftime('%B %Y'),
            'rate': round(entry['rate'], 2)
        } for entry in attendance_data
    ]

    return Response(chart_data)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_category_distribution(request):
    """
    Retrieve student performance category distribution
    """
    # Count students in each risk category
    category_data = Performance.objects.values('categorie_risque').annotate(
        count=Count('etudiant')
    )

    # Color mapping for categories
    color_map = {
        'À risque': '#F44336',  # Red
        'Moyenne performance': '#FFC107',   # Amber
        'Bon performeur': '#4CAF50',     # Green
    }

    # Transform data for frontend
    chart_data = [
        {
            'name': entry['categorie_risque'],
            'value': entry['count'],
            'color': color_map.get(entry['categorie_risque'], '#9C27B0')
        } for entry in category_data
    ]

    return Response(chart_data)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_subject_success_rate(request):
    """
    Retrieve success rate by subject
    """
    # Calculate success rate for each subject
    subject_data = Matiere.objects.annotate(
        success_rate=Avg('note__note_module')
    ).values('nom', 'success_rate')

    # Transform data for frontend
    chart_data = [
        {
            'subject': entry['nom'],
            'success_rate': round(entry['success_rate'], 2)
        } for entry in subject_data
    ]

    return Response(chart_data)
