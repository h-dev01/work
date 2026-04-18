import csv
import logging
from django.db import IntegrityError
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status

from ..models import Utilisateur, Classe, Matiere, Note
from ..serializers import UtilisateurSerializer, ClasseSerializer, MatiereSerializer, NoteSerializer

logger = logging.getLogger(__name__)

# Student Views
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def list_students(request):
    """
    Vue pour lister tous les étudiants.
    """
    students = Utilisateur.objects.filter(user_type='student')
    serializer = UtilisateurSerializer(students, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_student(request):
    """
    Vue pour créer un étudiant.
    """
    data = request.data
    try:
        classe = Classe.objects.get(nom=data.get('classes')[0]) if data.get('classes') else None
        student = Utilisateur.objects.create_user(
            username=data.get('email'),
            email=data.get('email'),
            password=str(data.get('n_appogie')),
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            phone=data.get('phone'),
            n_appogie=data.get('n_appogie'),
            classe=classe,
            user_type='student'
        )
        return Response({'success': True, 'id': student.id})
    except IntegrityError:
        return Response({'success': False, 'error': 'Le numéro Apogee doit être unique.'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_student(request, id):
    """
    Vue pour mettre à jour un étudiant.
    """
    data = request.data
    try:
        student = Utilisateur.objects.get(id=id, user_type='student')
        if 'n_appogie' in data and data['n_appogie'] != student.n_appogie:
            if Utilisateur.objects.filter(n_appogie=data['n_appogie']).exists():
                return Response({'success': False, 'error': 'Le numéro Apogee doit être unique.'}, status=status.HTTP_400_BAD_REQUEST)
            student.n_appogie = data['n_appogie']
            student.set_password(str(data['n_appogie']))
        
        student.first_name = data.get('first_name', student.first_name)
        student.last_name = data.get('last_name', student.last_name)
        student.email = data.get('email', student.email)
        student.phone = data.get('phone', student.phone)
        student.classe = Classe.objects.get(nom=data.get('classes')[0]) if data.get('classes') else None
        student.save()
        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_student(request, id):
    """
    Vue pour supprimer un étudiant.
    """
    try:
        student = Utilisateur.objects.get(id=id, user_type='student')
        student.delete()
        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def import_students(request):
    if not request.FILES.get('file'):
        return Response({'success': False, 'error': 'Aucun fichier trouvé.'}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['file']
    if not file.name.endswith('.csv'):
        return Response({'success': False, 'error': 'Le fichier doit être un CSV.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        decoded_file = file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)

        for row in reader:
            classe = Classe.objects.get(nom=row['Classe']) if row.get('Classe') else None
            Utilisateur.objects.create_user(
                username=row['Email'],
                email=row['Email'],
                password=row['Numéro Apogee'],
                first_name=row['Prénom'],
                last_name=row['Nom'],
                phone=row['Téléphone'],
                n_appogie=row['Numéro Apogee'],
                classe=classe,
                user_type='student'
            )

        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Teacher Views
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def list_enseignants(request):
    """
    Vue pour lister tous les enseignants.
    """
    enseignants = Utilisateur.objects.filter(user_type='teacher')
    serializer = UtilisateurSerializer(enseignants, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_enseignant(request):
    """
    Vue pour créer un enseignant.
    """
    data = request.data
    try:
        password = data.get('phone')
        enseignant = Utilisateur.objects.create_user(
            username=data.get('email'),
            email=data.get('email'),
            password=password,
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            phone=data.get('phone'),
            user_type='teacher'
        )
        return Response({'success': True, 'id': enseignant.id})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_enseignant(request, id):
    """
    Vue pour mettre à jour un enseignant.
    """
    data = request.data
    try:
        enseignant = Utilisateur.objects.get(id=id, user_type='teacher')
        enseignant.first_name = data.get('first_name', enseignant.first_name)
        enseignant.last_name = data.get('last_name', enseignant.last_name)
        enseignant.email = data.get('email', enseignant.email)
        enseignant.save()
        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_enseignant(request, id):
    """
    Vue pour supprimer un enseignant.
    """
    try:
        enseignant = Utilisateur.objects.get(id=id, user_type='teacher')
        enseignant.delete()
        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def import_enseignants(request):
    if not request.FILES.get('file'):
        return Response({'success': False, 'error': 'Aucun fichier trouvé.'}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['file']
    logger.info(f"File received: {file.name}")

    if not file.name.endswith('.csv'):
        return Response({'success': False, 'error': 'Le fichier doit être un CSV.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        decoded_file = file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)

        for row in reader:
            if not all(key in row for key in ['Email', 'Prénom', 'Nom', 'Téléphone']):
                return Response({'success': False, 'error': 'Le fichier CSV doit contenir les colonnes: Email, Prénom, Nom, Téléphone.'}, status=status.HTTP_400_BAD_REQUEST)

            if Utilisateur.objects.filter(email=row['Email']).exists():
                continue

            password = row['Téléphone']
            Utilisateur.objects.create_user(
                username=row['Email'],
                email=row['Email'],
                password=password,
                first_name=row['Prénom'],
                last_name=row['Nom'],
                phone=row['Téléphone'],
                user_type='teacher'
            )

        return Response({'success': True})
    except Exception as e:
        logger.error(f"Error processing file: {e}")
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Class Views
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def list_classes(request):
    """
    Vue pour lister toutes les classes.
    """
    classes = Classe.objects.all()
    serializer = ClasseSerializer(classes, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_class(request):
    """
    Vue pour créer une classe.
    """
    data = request.data
    try:
        enseignant_responsable = Utilisateur.objects.get(id=data['enseignant_responsable_id'], user_type='teacher')
        classe = Classe.objects.create(
            nom=data['nom'],
            enseignant_responsable=enseignant_responsable
        )
        return Response({'success': True, 'id': classe.id})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_class(request, id):
    """
    Vue pour mettre à jour une classe.
    """
    data = request.data
    try:
        classe = Classe.objects.get(id=id)
        classe.nom = data.get('nom', classe.nom)
        if 'enseignant_responsable_id' in data:
            classe.enseignant_responsable = Utilisateur.objects.get(id=data['enseignant_responsable_id'], user_type='teacher')
        classe.save()
        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_class(request, id):
    """
    Vue pour supprimer une classe.
    """
    try:
        classe = Classe.objects.get(id=id)
        classe.delete()
        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Subject Views
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def list_matieres(request):
    """
    Vue pour lister toutes les matières.
    """
    matieres = Matiere.objects.all()
    serializer = MatiereSerializer(matieres, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_matiere(request):
    """
    Vue pour créer une matière.
    """
    data = request.data
    try:
        classe = Classe.objects.get(id=data['classe_id'])
        enseignant = Utilisateur.objects.get(id=data['enseignant_id'], user_type='teacher')
        matiere = Matiere.objects.create(
            nom=data['nom'],
            coefficient=data['coefficient'],
            semestre=data['semestre'],
            classe=classe,
            enseignant=enseignant
        )
        return Response({'success': True, 'id': matiere.id})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_matiere(request, id):
    """
    Vue pour mettre à jour une matière.
    """
    data = request.data
    try:
        matiere = Matiere.objects.get(id=id)
        matiere.nom = data.get('nom', matiere.nom)
        matiere.coefficient = data.get('coefficient', matiere.coefficient)
        matiere.semestre = data.get('semestre', matiere.semestre)
        if 'classe_id' in data:
            matiere.classe = Classe.objects.get(id=data['classe_id'])
        if 'enseignant_id' in data:
            matiere.enseignant = Utilisateur.objects.get(id=data['enseignant_id'], user_type='teacher')
        matiere.save()
        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_matiere(request, id):
    """
    Vue pour supprimer une matière.
    """
    try:
        matiere = Matiere.objects.get(id=id)
        matiere.delete()
        return Response({'success': True})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_all_matieres(request):
    if request.user.user_type != 'admin':
        return Response({'success': False, 'message': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

    matieres = Matiere.objects.all()
    serializer = MatiereSerializer(matieres, many=True)
    return Response({'success': True, 'matieres': serializer.data})

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def import_matieres(request):
    if not request.FILES.get('file'):
        return Response({'success': False, 'error': 'Aucun fichier trouvé.'}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['file']
    logger.info(f"File received: {file.name}")

    if not file.name.endswith('.csv'):
        return Response({'success': False, 'error': 'Le fichier doit être un CSV.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        decoded_file = file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)

        required_columns = ['Nom', 'Coefficient', 'Semestre', 'Classe', 'Email']
        if not all(column in reader.fieldnames for column in required_columns):
             return Response({'success': False, 'error': f'Le fichier CSV doit contenir les colonnes: {", ".join(required_columns)}.'}, status=status.HTTP_400_BAD_REQUEST)

        for row in reader:
            try:
                enseignant = Utilisateur.objects.get(email=row['Email'], user_type='teacher')
                classe = Classe.objects.get(nom=row['Classe'])

                Matiere.objects.create(
                    nom=row['Nom'],
                    coefficient=float(row['Coefficient']),
                    semestre=int(row['Semestre']),
                    classe=classe,
                    enseignant=enseignant
                )
            except Utilisateur.DoesNotExist:
                return Response({'success': False, 'error': f"Enseignant avec l'email {row['Email']} non trouvé."}, status=status.HTTP_400_BAD_REQUEST)
            except Classe.DoesNotExist:
                return Response({'success': False, 'error': f"Classe {row['Classe']} non trouvée."}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Error processing row: {row}, Error: {e}")
                return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'success': True})
    except Exception as e:
        logger.error(f"Error processing file: {e}")
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_all_notes(request):
    if request.user.user_type != 'admin':
        return Response({'success': False, 'message': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

    matiere_id = request.query_params.get('matiere_id')
    if matiere_id:
        notes = Note.objects.filter(matiere_id=matiere_id)
    else:
        notes = Note.objects.all()

    serializer = NoteSerializer(notes, many=True)
    return Response({'success': True, 'notes': serializer.data})

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_create_or_update_note(request):
    if request.user.user_type != 'admin':
        return Response({'success': False, 'message': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    matiere_id = data.get('matiere_id')
    etudiant_id = data.get('etudiant_id')

    matiere = Matiere.objects.filter(id=matiere_id).first()
    if not matiere:
        return Response({'success': False, 'message': 'Matière non trouvée'}, status=status.HTTP_404_NOT_FOUND)

    etudiant = Utilisateur.objects.filter(id=etudiant_id, user_type='student').first()
    if not etudiant:
        return Response({'success': False, 'message': 'Étudiant non trouvé'}, status=status.HTTP_404_NOT_FOUND)

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
def admin_delete_note(request, id):
    if request.user.user_type != 'admin':
        return Response({'success': False, 'message': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

    note = Note.objects.filter(id=id).first()
    if not note:
        return Response({'success': False, 'message': 'Note non trouvée'}, status=status.HTTP_404_NOT_FOUND)

    note.delete()
    return Response({'success': True, 'message': 'Note supprimée avec succès'})

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_students_by_matiere_admin(request):
    if request.user.user_type != 'admin':
        return Response({'success': False, 'message': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

    matiere_id = request.query_params.get('matiere_id')
    if not matiere_id:
        return Response({'success': False, 'message': 'matiere_id est requis'}, status=status.HTTP_400_BAD_REQUEST)

    matiere = Matiere.objects.filter(id=matiere_id).first()
    if not matiere:
        return Response({'success': False, 'message': 'Matière non trouvée'}, status=status.HTTP_404_NOT_FOUND)

    students = Utilisateur.objects.filter(classe=matiere.classe, user_type='student')
    serializer = UtilisateurSerializer(students, many=True)
    return Response({'success': True, 'students': serializer.data})

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_import_notes(request):
    if request.user.user_type != 'admin':
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

            matiere = Matiere.objects.filter(id=matiere_id).first()
            if not matiere:
                continue

            etudiant = Utilisateur.objects.filter(id=etudiant_id, user_type='student').first()
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
