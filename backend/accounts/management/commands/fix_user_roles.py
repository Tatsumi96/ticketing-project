from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Fix permissions for existing users based on their roles'

    def handle(self, *args, **options):
        users = User.objects.all()
        count = 0
        for user in users:
            old_is_staff = user.is_staff
            old_is_superuser = user.is_superuser
            
            # The save() method we added will handle the logic
            user.save()
            
            if old_is_staff != user.is_staff or old_is_superuser != user.is_superuser:
                self.stdout.write(self.style.SUCCESS(f'Updated permissions for user: {user.email} (Role: {user.role})'))
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully updated {count} users.'))
