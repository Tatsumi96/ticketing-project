from django.urls import path, include
from rest_framework_nested import routers
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, CommentViewSet, CategoryViewSet

# Try nested router, fallback to manual
try:
    from rest_framework_nested import routers as nested_routers
    router = nested_routers.DefaultRouter()
    router.register(r'tickets', TicketViewSet, basename='ticket')
    router.register(r'categories', CategoryViewSet, basename='category')

    tickets_router = nested_routers.NestedDefaultRouter(router, r'tickets', lookup='ticket')
    tickets_router.register(r'comments', CommentViewSet, basename='ticket-comments')

    urlpatterns = [
        path('', include(router.urls)),
        path('', include(tickets_router.urls)),
    ]
except ImportError:
    router = DefaultRouter()
    router.register(r'tickets', TicketViewSet, basename='ticket')
    router.register(r'categories', CategoryViewSet, basename='category')

    urlpatterns = [
        path('', include(router.urls)),
        path('tickets/<int:ticket_pk>/comments/', CommentViewSet.as_view({'get': 'list', 'post': 'create'}), name='ticket-comments'),
        path('tickets/<int:ticket_pk>/comments/<int:pk>/', CommentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='ticket-comment-detail'),
    ]
