from rest_framework import serializers
from taggit.serializers import TagListSerializerField, TaggitSerializer
from .models import Photo


class PhotoSerializer(TaggitSerializer, serializers.ModelSerializer):
    tags = TagListSerializerField()
    author = serializers.CharField(source='auther.username', read_only=True, default=None)
    author_id = serializers.IntegerField(source='auther.id', read_only=True, default=None)
    author_avatar = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Photo
        fields = [
            'id', 'image', 'image_url', 'description', 'date_posted',
            'author', 'author_id', 'author_avatar',
            'tags', 'is_private', 'is_owner',
        ]
        read_only_fields = ['id', 'date_posted', 'author', 'author_id', 'author_avatar', 'image_url', 'is_owner']
        extra_kwargs = {
            'image': {'write_only': True, 'required': False},
        }

    def get_image_url(self, obj):
        if not obj.image:
            return None
        try:
            url = obj.image.url
        except Exception:
            return None
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(url)
        return url

    def get_author_avatar(self, obj):
        author = obj.auther
        if author is None:
            return None
        try:
            profile = author.profile
        except Exception:
            return None
        if not profile.image:
            return None
        try:
            url = profile.image.url
        except Exception:
            return None
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(url)
        return url

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request is None or not request.user.is_authenticated:
            return False
        return obj.auther_id == request.user.id

    def validate_image(self, value):
        if value is not None and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('Image too large (max 5MB).')
        return value

    def validate_tags(self, value):
        # TagListSerializerField gives a list of strings (tag names)
        cleaned = [str(t).strip() for t in (value or []) if str(t).strip()]
        if not cleaned:
            raise serializers.ValidationError('Add at least one tag.')
        return cleaned
