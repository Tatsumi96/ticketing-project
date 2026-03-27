from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Ticket, Comment, Category, TicketHistory

User = get_user_model()


class AuthorSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'role', 'department', 'avatar']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class CommentSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    author_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Comment
        fields = ['id', 'ticket', 'author', 'author_id', 'content',
                  'is_internal', 'is_solution_step', 'step_number', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'author']

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class TicketHistorySerializer(serializers.ModelSerializer):
    changed_by = AuthorSerializer(read_only=True)

    class Meta:
        model = TicketHistory
        fields = ['id', 'field_changed', 'old_value', 'new_value', 'changed_by', 'created_at']


class TicketListSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    assigned_to = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = ['id', 'title', 'status', 'priority', 'category',
                  'author', 'assigned_to', 'created_at', 'updated_at', 'comments_count']

    def get_comments_count(self, obj):
        return obj.comments.count()


class TicketDetailSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    assigned_to = AuthorSerializer(read_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    comments = CommentSerializer(many=True, read_only=True)
    history = TicketHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = ['id', 'title', 'description', 'status', 'priority',
                  'category', 'category_id', 'author', 'assigned_to', 'assigned_to_id',
                  'attachment', 'created_at', 'updated_at', 'resolved_at',
                  'comments', 'history']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context['request']
        # Track changes for history
        track_fields = ['status', 'priority', 'assigned_to_id']
        for field in track_fields:
            if field in validated_data:
                old_val = str(getattr(instance, field.replace('_id', '') if field.endswith('_id') else field, '') or '')
                TicketHistory.objects.create(
                    ticket=instance,
                    changed_by=request.user,
                    field_changed=field,
                    old_value=old_val,
                    new_value=str(validated_data[field] or '')
                )
        return super().update(instance, validated_data)
