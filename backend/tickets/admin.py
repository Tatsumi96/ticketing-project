from django.contrib import admin
from .models import Ticket, Comment, Category, TicketHistory


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'color']
    search_fields = ['name']


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'status', 'priority', 'author', 'assigned_to', 'created_at']
    list_filter = ['status', 'priority', 'category']
    search_fields = ['title', 'description']
    raw_id_fields = ['author', 'assigned_to']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'ticket', 'author', 'is_solution_step', 'created_at']
    list_filter = ['is_solution_step', 'is_internal']


@admin.register(TicketHistory)
class TicketHistoryAdmin(admin.ModelAdmin):
    list_display = ['ticket', 'field_changed', 'old_value', 'new_value', 'changed_by', 'created_at']
    readonly_fields = ['ticket', 'changed_by', 'field_changed', 'old_value', 'new_value', 'created_at']
