import pandas as pd
import numpy as np
from django.apps import apps
from django.db.models import Avg
from .models import Note

# ⚠️ DOIT ÊTRE IDENTIQUE À TON X_TRAIN DANS LE NOTEBOOK
REQUIRED_COLUMNS = [
    'school', 'sex', 'age', 'address', 'famsize', 'Pstatus', 'Medu', 'Fedu',
    'Mjob', 'Fjob', 'reason', 'guardian', 'traveltime', 'studytime', 'failures',
    'schoolsup', 'famsup', 'paid', 'activities', 'nursery', 'higher', 'internet',
    'romantic', 'famrel', 'freetime', 'goout', 'Dalc', 'Walc', 'health', 'absences',
    'G1', 'G2'
]

def prepare_student_data(student):
    """Convertit un étudiant Django en DataFrame Pandas pour l'IA"""
    # 1. Récupération des notes réelles (Moyenne S1/S2)
    notes = Note.objects.filter(etudiant=student)
    g1 = notes.filter(matiere__semestre=1).aggregate(avg=Avg('note_module'))['avg'] or 10.0
    g2 = notes.filter(matiere__semestre=2).aggregate(avg=Avg('note_module'))['avg'] or g1
    
    # 2. Calcul des absences (ex: 20 séances - présence)
    total_absences = sum([(20 - n.presence) for n in notes]) if notes.exists() else 0

    # 3. Valeurs par défaut (Imputation) pour les données démographiques manquantes
    # On utilise des médianes statistiques pour ne pas bloquer la prédiction
    data = {
        'school': 0, 'sex': 0, 'age': 18, 'address': 1, 'famsize': 1, 'Pstatus': 1,
        'Medu': 2, 'Fedu': 2, 'Mjob': 2, 'Fjob': 2, 'reason': 1, 'guardian': 1,
        'traveltime': 1, 'studytime': 2, 'failures': 0, 'schoolsup': 0, 'famsup': 1,
        'paid': 0, 'activities': 1, 'nursery': 1, 'higher': 1, 'internet': 1,
        'romantic': 0, 'famrel': 4, 'freetime': 3, 'goout': 3, 'Dalc': 1, 'Walc': 1,
        'health': 5,
        # Données dynamiques
        'absences': total_absences,
        'G1': float(g1),
        'G2': float(g2)
    }

    return pd.DataFrame([data], columns=REQUIRED_COLUMNS)

def predict_student(student):
    """Exécute la prédiction en utilisant les modèles chargés"""
    api_config = apps.get_app_config('data')
    
    if not api_config.model_classif or not api_config.model_reg:
        return None, None

    df = prepare_student_data(student)
    
    grade = api_config.model_reg.predict(df)[0]
    category = api_config.model_classif.predict(df)[0] # 0, 1, 2
    
    return round(grade, 2), int(category)