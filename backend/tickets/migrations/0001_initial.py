from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('color', models.CharField(default='#6366f1', max_length=7)),
                ('icon', models.CharField(default='tag', max_length=50)),
            ],
            options={'verbose_name': 'Catégorie', 'verbose_name_plural': 'Catégories'},
        ),
        migrations.CreateModel(
            name='Ticket',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255, verbose_name='Titre')),
                ('description', models.TextField(verbose_name='Description')),
                ('status', models.CharField(choices=[('ouvert', 'Ouvert'), ('en_cours', 'En cours'), ('resolu', 'Résolu'), ('ferme', 'Fermé'), ('rejete', 'Rejeté')], default='ouvert', max_length=20)),
                ('priority', models.CharField(choices=[('faible', 'Faible'), ('normale', 'Normale'), ('haute', 'Haute'), ('urgente', 'Urgente')], default='normale', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('resolved_at', models.DateTimeField(null=True, blank=True)),
                ('attachment', models.FileField(blank=True, null=True, upload_to='tickets/attachments/')),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='created_tickets', to=settings.AUTH_USER_MODEL, verbose_name='Auteur')),
                ('assigned_to', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_tickets', to=settings.AUTH_USER_MODEL, verbose_name='Responsable assigné')),
                ('category', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tickets', to='tickets.category')),
            ],
            options={'verbose_name': 'Ticket', 'verbose_name_plural': 'Tickets', 'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
                ('is_internal', models.BooleanField(default=False)),
                ('is_solution_step', models.BooleanField(default=False)),
                ('step_number', models.PositiveIntegerField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('ticket', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='tickets.ticket')),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to=settings.AUTH_USER_MODEL)),
            ],
            options={'verbose_name': 'Commentaire', 'verbose_name_plural': 'Commentaires', 'ordering': ['created_at']},
        ),
        migrations.CreateModel(
            name='TicketHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('field_changed', models.CharField(max_length=100)),
                ('old_value', models.CharField(blank=True, max_length=255)),
                ('new_value', models.CharField(blank=True, max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('ticket', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='history', to='tickets.ticket')),
                ('changed_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]
