import csv
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from data.models import Classe, Matiere, Note, Utilisateur

class Command(BaseCommand):
    help = 'Importe les vraies données UCI (student-mat.csv) dans la base Django'

    def handle(self, *args, **kwargs):
        self.stdout.write("📂 Lecture des données réelles UCI...")

        # 1. Localisation du fichier CSV
        # Assure-toi que le fichier est bien dans backend/raw_data/
        file_path = os.path.join(settings.BASE_DIR, 'raw_data', 'student-mat.csv')

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"❌ Fichier introuvable : {file_path}"))
            self.stdout.write("👉 Crée le dossier 'raw_data' dans 'backend' et colles-y 'student-mat.csv'")
            return

        # 2. Création des fondamentaux (Prof, Classe, Matières)
        self.stdout.write("🏗️ Création de l'architecture scolaire...")
        
        # Professeur par défaut
        prof, _ = Utilisateur.objects.get_or_create(
            username="prof@school.com",
            defaults={
                'email': "prof@school.com", 
                'user_type': 'teacher', 
                'first_name': "Professeur", 
                'last_name': "Principal"
            }
        )
        if _: 
            prof.set_password("prof123")
            prof.save()

        # Classe Unique (pour mettre tout le monde ensemble)
        classe, _ = Classe.objects.get_or_create(
            nom="Classe Data Science (UCI)",
            defaults={'enseignant_responsable': prof}
        )

        # Création des Matières pour simuler les semestres
        # G1 du CSV ira dans "Maths S1"
        matiere_s1, _ = Matiere.objects.get_or_create(
            nom="Mathématiques (S1)", 
            semestre=1, 
            classe=classe, 
            enseignant=prof, 
            defaults={'coefficient': 4}
        )
        # G2 du CSV ira dans "Maths S2"
        matiere_s2, _ = Matiere.objects.get_or_create(
            nom="Mathématiques (S2)", 
            semestre=2, 
            classe=classe, 
            enseignant=prof, 
            defaults={'coefficient': 4}
        )

        # 3. Importation des Étudiants et Notes
        self.stdout.write("🚀 Importation des étudiants...")
        
        with open(file_path, 'r', encoding='utf-8') as file:
            # Le fichier UCI utilise souvent le point-virgule ';' comme séparateur
            reader = csv.DictReader(file, delimiter=';')
            count = 0

            for row in reader:
                try:
                    # Génération d'un profil étudiant
                    student_email = f"student.uci.{count+1}@school.com"
                    
                    student, created = Utilisateur.objects.get_or_create(
                        username=student_email,
                        defaults={
                            'email': student_email,
                            'first_name': "Student",
                            'last_name': f"UCI-{count+1}",
                            'user_type': 'student',
                            'classe': classe,
                            'n_appogie': f"UCI{2024000+count}", # Faux CNE unique
                            'phone': "0600000000"
                        }
                    )
                    
                    if created:
                        student.set_password("student123")
                        student.save()

                    # Extraction des données du CSV
                    g1 = float(row['G1'])
                    g2 = float(row['G2'])
                    absences = int(row['absences'])

                    # Conversion Absences -> Présence (Sur une base de 20 séances par exemple)
                    # On divise les absences par 2 pour les répartir sur les semestres
                    presence_s1 = max(0, 20 - (absences // 2))
                    presence_s2 = max(0, 20 - (absences // 2))

                    # Création Note S1 (Correspond au G1 du modèle)
                    Note.objects.get_or_create(
                        etudiant=student, 
                        matiere=matiere_s1,
                        defaults={
                            'note_module': g1, 
                            'note_devoir_projet': g1,
                            'assiduite': 100.0, 
                            'presence': presence_s1
                        }
                    )

                    # Création Note S2 (Correspond au G2 du modèle)
                    Note.objects.get_or_create(
                        etudiant=student, 
                        matiere=matiere_s2,
                        defaults={
                            'note_module': g2, 
                            'note_devoir_projet': g2,
                            'assiduite': 100.0, 
                            'presence': presence_s2
                        }
                    )
                    
                    count += 1

                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"⚠️ Erreur ligne {count}: {e}"))
                    continue

        self.stdout.write(self.style.SUCCESS(f"✅ Importation Terminée ! {count} étudiants réels importés."))