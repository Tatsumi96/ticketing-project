from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        'tickets': request.build_absolute_uri('/api/tickets/'),
        'categories': request.build_absolute_uri('/api/categories/'),
        'auth_login': request.build_absolute_uri('/api/auth/login/'),
        'auth_register': request.build_absolute_uri('/api/auth/register/'),
        'auth_me': request.build_absolute_uri('/api/auth/me/'),
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('tickets.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
