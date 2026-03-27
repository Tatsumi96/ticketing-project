from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from tickets.models import Category, Ticket, Comment

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed initial data for ticketing system'

    def handle(self, *args, **kwargs):
        self.stdout.write('Création des données initiales...')

        # Categories
        categories_data = [
            {'name': 'Informatique', 'color': '#6366f1', 'icon': 'monitor'},
            {'name': 'Réseau', 'color': '#0ea5e9', 'icon': 'wifi'},
            {'name': 'Matériel', 'color': '#f59e0b', 'icon': 'cpu'},
            {'name': 'Logiciel', 'color': '#10b981', 'icon': 'code'},
            {'name': 'Accès / Droits', 'color': '#ef4444', 'icon': 'lock'},
            {'name': 'Autre', 'color': '#8b5cf6', 'icon': 'tag'},
        ]
        for cat in categories_data:
            Category.objects.get_or_create(name=cat['name'], defaults=cat)
        self.stdout.write(self.style.SUCCESS(f'✓ {len(categories_data)} catégories créées'))

        # Admin user
        admin, created = User.objects.get_or_create(
            email='admin@ticketing.mg',
            defaults={
                'username': 'admin',
                'first_name': 'Admin',
                'last_name': 'Système',
                'role': 'admin',
                'department': 'Direction',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS('✓ Admin créé: admin@ticketing.mg / admin123'))

        # Responsable
        resp, created = User.objects.get_or_create(
            email='responsable@ticketing.mg',
            defaults={
                'username': 'responsable1',
                'first_name': 'Jean',
                'last_name': 'Responsable',
                'role': 'responsable',
                'department': 'Informatique',
            }
        )
        if created:
            resp.set_password('resp123')
            resp.save()
            self.stdout.write(self.style.SUCCESS('✓ Responsable créé: responsable@ticketing.mg / resp123'))

        # User
        user, created = User.objects.get_or_create(
            email='user@ticketing.mg',
            defaults={
                'username': 'user1',
                'first_name': 'Marie',
                'last_name': 'Utilisatrice',
                'role': 'user',
                'department': 'Comptabilité',
            }
        )
        if created:
            user.set_password('user123')
            user.save()
            self.stdout.write(self.style.SUCCESS('✓ Utilisateur créé: user@ticketing.mg / user123'))

        self.stdout.write(self.style.SUCCESS('\n✅ Données initiales créées avec succès!'))
