from django.db import models
from django.contrib.auth.models import AbstractUser

class Utilisateur(AbstractUser):
    USER_TYPE_CHOICES = (
        ('admin', 'Administrateur'),
        ('teacher', 'Enseignant'),
        ('student', 'Etudiant'),
    )
    
    phone = models.CharField(max_length=15, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='student')

    # Champs spécifiques aux étudiants
    n_appogie = models.CharField(max_length=20, blank=True, null=True, unique=True)  # Add unique=True
    classe = models.ForeignKey('Classe', on_delete=models.SET_NULL, null=True, blank=True, related_name='students')

    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        related_name='utilisateur_set',  
        related_query_name='utilisateur'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        related_name='utilisateur_set', 
        related_query_name='utilisateur'
    )

    def is_administrateur(self):
        return self.user_type == 'admin'
    
    def is_enseignant(self):
        return self.user_type == 'teacher'
    
    def is_etudiant(self):
        return self.user_type == 'student'


class Classe(models.Model):
    nom = models.CharField(max_length=100)
    enseignant_responsable = models.ForeignKey(
        Utilisateur, on_delete=models.SET_NULL, null=True, blank=True,
        limit_choices_to={'user_type': 'teacher'}, related_name='classes_enseignees'
    )

    def __str__(self):
        return self.nom


class Matiere(models.Model):
    SEMESTRE_CHOICES = [
        (1, 'Semestre 1'),
        (2, 'Semestre 2'),
        (3, 'Semestre 3'),
        (4, 'Semestre 4'),
    ]

    nom = models.CharField(max_length=100)
    coefficient = models.FloatField()
    semestre = models.IntegerField(choices=SEMESTRE_CHOICES)  
    classe = models.ForeignKey('Classe', on_delete=models.CASCADE, null=True,blank=True,related_name='matieres')
    enseignant = models.ForeignKey(
        Utilisateur, on_delete=models.SET_NULL, null=True, blank=True,
        limit_choices_to={'user_type': 'teacher'}, related_name='matieres_enseignees'
    )

    def __str__(self):
        return f"{self.nom} - {self.get_semestre_display()}"

    
class Note(models.Model):
    etudiant = models.ForeignKey(
        Utilisateur, on_delete=models.CASCADE, limit_choices_to={'user_type': 'student'}
    )
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE)
    note_module = models.FloatField()
    note_devoir_projet = models.FloatField()
    assiduite = models.FloatField()
    presence = models.IntegerField()
    date_ajout = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.etudiant.username} - {self.matiere.nom}"


class Performance(models.Model):
    etudiant = models.OneToOneField(
        Utilisateur, on_delete=models.CASCADE, limit_choices_to={'user_type': 'student'}
    )
    moyenne_generale = models.FloatField()
    categorie_risque = models.CharField(max_length=50)
    date_calcul = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.etudiant.username} - {self.moyenne_generale}"


class Alerte(models.Model):
    etudiant = models.ForeignKey(
        Utilisateur, on_delete=models.CASCADE, limit_choices_to={'user_type': 'student'}
    )
    message = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Alerte pour {self.etudiant.username}"


class Recommandation(models.Model):
    etudiant = models.ForeignKey(
        Utilisateur, on_delete=models.CASCADE, limit_choices_to={'user_type': 'student'}
    )
    matiere = models.ForeignKey(Matiere, on_delete=models.SET_NULL, null=True, blank=True)
    contenu = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recommandation pour {self.etudiant.username}"