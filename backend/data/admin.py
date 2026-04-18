from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import Utilisateur, Classe, Matiere, Note, Performance, Alerte, Recommandation
from django.contrib.auth.forms import UserCreationForm, UserChangeForm

class UtilisateurCreationForm(UserCreationForm):
    class Meta:
        model = Utilisateur
        fields = ('username', 'email', 'user_type', 'first_name', 'last_name', 'phone', 'birth_date', 'n_appogie', 'classe')

class UtilisateurChangeForm(UserChangeForm):
    class Meta:
        model = Utilisateur
        fields = ('username', 'email', 'user_type', 'first_name', 'last_name', 'phone', 'birth_date', 'n_appogie', 'classe', 'is_staff', 'is_active')

class UtilisateurAdmin(UserAdmin):
    form = UtilisateurChangeForm
    add_form = UtilisateurCreationForm
    
    list_display = ('username', 'email', 'user_type', 'first_name', 'last_name', 'is_staff')
    list_filter = ('user_type', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'n_appogie')
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email', 'phone', 'birth_date')}),
        (_('User type'), {'fields': ('user_type',)}),
        (_('Student info'), {'fields': ('n_appogie', 'classe'), 'classes': ('collapse',), 'description': _('Only applicable for student users')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'user_type', 'first_name', 'last_name', 'phone', 'birth_date'),
        }),
        (_('Student info'), {
            'classes': ('collapse',),
            'fields': ('n_appogie', 'classe'),
            'description': _('Only fill these fields if user type is Student')
        }),
    )
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if obj and obj.user_type != 'student':
            if 'n_appogie' in form.base_fields:
                form.base_fields['n_appogie'].widget.attrs['disabled'] = True
            if 'classe' in form.base_fields:
                form.base_fields['classe'].widget.attrs['disabled'] = True
        return form

class ClasseAdmin(admin.ModelAdmin):
    list_display = ('nom', 'enseignant_responsable')
    search_fields = ('nom',)
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "enseignant_responsable":
            kwargs["queryset"] = Utilisateur.objects.filter(user_type='teacher')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

class NoteAdmin(admin.ModelAdmin):
    list_display = ('etudiant', 'matiere', 'note_module', 'note_devoir_projet', 'assiduite', 'presence', 'date_ajout')
    search_fields = ('etudiant__username', 'matiere__nom')
    list_filter = ('matiere', 'date_ajout')
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "etudiant":
            kwargs["queryset"] = Utilisateur.objects.filter(user_type='student')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

class PerformanceAdmin(admin.ModelAdmin):
    list_display = ('etudiant', 'moyenne_generale', 'categorie_risque', 'date_calcul')
    search_fields = ('etudiant__username',)
    list_filter = ('categorie_risque',)
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "etudiant":
            kwargs["queryset"] = Utilisateur.objects.filter(user_type='student')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

class AlerteAdmin(admin.ModelAdmin):
    list_display = ('etudiant', 'message', 'date_creation')
    search_fields = ('etudiant__username', 'message')
    list_filter = ('date_creation',)
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "etudiant":
            kwargs["queryset"] = Utilisateur.objects.filter(user_type='student')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

class RecommandationAdmin(admin.ModelAdmin):
    list_display = ('etudiant', 'matiere', 'contenu', 'date_creation')
    search_fields = ('etudiant__username', 'matiere__nom', 'contenu')
    list_filter = ('date_creation',)
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "etudiant":
            kwargs["queryset"] = Utilisateur.objects.filter(user_type='student')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

# Register your models
admin.site.register(Utilisateur, UtilisateurAdmin)
admin.site.register(Classe, ClasseAdmin)
admin.site.register(Matiere, admin.ModelAdmin)
admin.site.register(Note, NoteAdmin)
admin.site.register(Performance, PerformanceAdmin)
admin.site.register(Alerte, AlerteAdmin)
admin.site.register(Recommandation, RecommandationAdmin)