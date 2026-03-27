from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Ticket, Comment, Category, TicketHistory
from .serializers import (
    TicketListSerializer, TicketDetailSerializer,
    CommentSerializer, CategorySerializer
)


class IsAdminOrResponsable(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['admin', 'responsable']


class TicketViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'category', 'assigned_to']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Ticket.objects.select_related('author', 'assigned_to', 'category').all()
        elif user.role == 'responsable':
            return Ticket.objects.select_related('author', 'assigned_to', 'category').filter(
                assigned_to=user
            )
        else:
            return Ticket.objects.select_related('author', 'assigned_to', 'category').filter(
                author=user
            )

    def get_serializer_class(self):
        if self.action == 'list':
            return TicketListSerializer
        return TicketDetailSerializer

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def assign(self, request, pk=None):
        ticket = self.get_object()
        if request.user.role not in ['admin', 'responsable']:
            return Response({'detail': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)
        responsable_id = request.data.get('responsable_id')
        if responsable_id:
            ticket.assigned_to_id = responsable_id
        ticket.status = 'en_cours'
        ticket.save()
        return Response(TicketDetailSerializer(ticket, context={'request': request}).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def resolve(self, request, pk=None):
        ticket = self.get_object()
        if request.user.role not in ['admin', 'responsable']:
            return Response({'detail': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)
        ticket.status = 'resolu'
        ticket.resolved_at = timezone.now()
        ticket.save()
        return Response(TicketDetailSerializer(ticket, context={'request': request}).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        ticket = self.get_object()
        if request.user.role not in ['admin', 'responsable']:
            return Response({'detail': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)
        ticket.status = 'rejete'
        ticket.save()
        return Response(TicketDetailSerializer(ticket, context={'request': request}).data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        if request.user.role not in ['admin', 'responsable']:
            return Response({'detail': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)
        qs = self.get_queryset()
        return Response({
            'total': qs.count(),
            'ouvert': qs.filter(status='ouvert').count(),
            'en_cours': qs.filter(status='en_cours').count(),
            'resolu': qs.filter(status='resolu').count(),
            'ferme': qs.filter(status='ferme').count(),
            'rejete': qs.filter(status='rejete').count(),
            'urgente': qs.filter(priority='urgente').count(),
            'haute': qs.filter(priority='haute').count(),
        })


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Comment.objects.select_related('author').filter(
            ticket_id=self.kwargs.get('ticket_pk')
        )
        if user.role not in ['admin', 'responsable']:
            qs = qs.filter(is_internal=False)
        return qs

    def perform_create(self, serializer):
        ticket = Ticket.objects.get(pk=self.kwargs['ticket_pk'])
        # Only admins/responsables can mark as solution step
        is_solution = self.request.data.get('is_solution_step', False)
        if is_solution and self.request.user.role not in ['admin', 'responsable']:
            is_solution = False
        serializer.save(
            author=self.request.user,
            ticket=ticket,
            is_solution_step=is_solution
        )


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminOrResponsable()]
        return [permissions.IsAuthenticated()]
