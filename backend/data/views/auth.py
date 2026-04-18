from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status

def get_user_info_by_role(user):
    """
    Retourne les informations de l'utilisateur en fonction de son rôle.
    """
    if user.user_type == 'admin':
        return {
            'id': user.id,
            'username': user.username,
            'role': 'admin',
            'full_name': f"{user.first_name} {user.last_name}",
        }
    elif user.user_type == 'teacher':
        return {
            'id': user.id,
            'username': user.username,
            'role': 'teacher',
            'full_name': f"{user.first_name} {user.last_name}",
        }
    elif user.user_type == 'student':
        return {
            'id': user.id,
            'username': user.username,
            'role': 'student',
            'full_name': f"{user.first_name} {user.last_name}",
            'n_appogie': user.n_appogie,
            'classe_id': user.classe.id if user.classe else None,
            'classe_nom': user.classe.nom if user.classe else None,
        }
    return None

@api_view(['POST'])
def login_view(request):
    """
    Vue pour la connexion des utilisateurs.
    """
    username = request.data.get('username')
    password = request.data.get('password')
    role = request.data.get('role')
    
    user = authenticate(username=username, password=password)
    
    if user is not None and user.user_type == role:
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.user_type,
            }
        })
    else:
        return Response({
            'success': False,
            'message': 'Nom d\'utilisateur ou mot de passe invalide'
        }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def logout_view(request):
    """
    Vue pour la déconnexion des utilisateurs.
    """
    return Response({
        'success': True,
        'message': 'Déconnexion réussie'
    })

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    """
    Vue pour obtenir les informations de l'utilisateur connecté.
    """
    user = request.user
    user_info = get_user_info_by_role(user)
    if user_info:
        return Response({
            'success': True,
            'user': user_info
        })
    else:
        return Response({
            'success': False,
            'message': 'Rôle utilisateur inconnu'
        }, status=status.HTTP_403_FORBIDDEN)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def teacher_profile(request):
    """
    Vue pour récupérer les informations du profil de l'enseignant.
    """
    try:
        teacher = request.user
        if teacher.user_type != 'teacher':
            return Response({'success': False, 'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        profile_data = {
            'first_name': teacher.first_name,
            'last_name': teacher.last_name,
            'email': teacher.email,
            'phone': teacher.phone,
        }
        return Response({'success': True, 'data': profile_data})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_teacher_password(request):
    """
    Vue pour mettre à jour le mot de passe de l'enseignant.
    """
    try:
        teacher = request.user
        if teacher.user_type != 'teacher':
            return Response({'success': False, 'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        new_password = request.data.get('password')

        if not new_password:
            return Response({'success': False, 'error': 'New password is required'}, status=status.HTTP_400_BAD_REQUEST)

        teacher.set_password(new_password)
        teacher.save()
        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def student_profile(request):
    """
    Vue pour récupérer les informations du profil de l'étudiant.
    """
    try:
        student = request.user
        if student.user_type != 'student':
            return Response({'success': False, 'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        profile_data = {
            'first_name': student.first_name,
            'last_name': student.last_name,
            'email': student.email,
            'phone': student.phone,
            'n_appogie': student.n_appogie,
            'classe': student.classe.nom if student.classe else "Non assigné",
        }
        return Response({'success': True, 'data': profile_data})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_student_password(request):
    """
    Vue pour mettre à jour le mot de passe de l'étudiant.
    """
    try:
        student = request.user
        if student.user_type != 'student':
            return Response({'success': False, 'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        new_password = request.data.get('password')

        if not new_password:
            return Response({'success': False, 'error': 'New password is required'}, status=status.HTTP_400_BAD_REQUEST)

        student.set_password(new_password)
        student.save()
        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
