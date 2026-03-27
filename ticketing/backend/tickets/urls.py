from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, CommentViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = router.urls + [
    path(
        'tickets/<int:ticket_pk>/comments/',
        CommentViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='ticket-comments-list'
    ),
    path(
        'tickets/<int:ticket_pk>/comments/<int:pk>/',
        CommentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='ticket-comments-detail'
    ),
]
