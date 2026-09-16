import binascii
import os

from django.contrib.auth.models import User
from django.db import models
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from taggit.models import Tag

from .models import Photo
from .serializers import PhotoSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            if not obj.is_private:
                return True
            if not request.user.is_authenticated:
                return False
            return obj.auther_id == request.user.id
        if not request.user.is_authenticated:
            return False
        return obj.auther_id == request.user.id


def visible_queryset(user):
    qs = Photo.objects.select_related('auther').order_by('-date_posted')
    if user.is_authenticated:
        return qs.filter(models.Q(is_private=False) | models.Q(auther=user))
    return qs.filter(is_private=False)


class PhotoViewSet(viewsets.ModelViewSet):
    serializer_class = PhotoSerializer
    permission_classes = [IsOwnerOrReadOnly]

    def get_queryset(self):
        qs = visible_queryset(self.request.user)
        params = self.request.query_params
        tag = (params.get('tag') or '').strip()
        search = (params.get('search') or params.get('tags') or '').strip()
        username = (params.get('username') or '').strip()
        if username:
            qs = qs.filter(auther__username=username)
        if tag:
            qs = qs.filter(tags__slug=tag)
        if search:
            terms = [t.strip() for t in search.replace(',', ' ').split() if t.strip()]
            if terms:
                qs = qs.filter(
                    models.Q(description__icontains=search)
                    | models.Q(tags__name__in=terms)
                ).distinct()
        return qs

    def perform_create(self, serializer):
        image = serializer.validated_data.get('image')
        name = getattr(image, 'name', '') or 'upload'
        # Prefix a random hex to avoid collisions (keeps original behaviour)
        prefix = binascii.hexlify(os.urandom(8)).decode()
        image.name = f'{prefix}_{name}'
        serializer.save(auther=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def tags(self, request):
        tags = Tag.objects.all().order_by('name')[:100]
        return Response([{'name': t.name, 'slug': t.slug} for t in tags])

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return super().get_permissions()
