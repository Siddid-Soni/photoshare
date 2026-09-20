from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

    def validate(self, attrs):
        if attrs['password1'] != attrs['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        validate_password(attrs['password1'])
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password1'],
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    photos_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar', 'photos_count']
        read_only_fields = ['id', 'avatar', 'photos_count']

    def get_avatar(self, obj):
        try:
            url = obj.profile.image.url
        except Exception:
            return None
        request = self.context.get('request')
        if request is not None and url:
            return request.build_absolute_uri(url)
        return url

    def get_photos_count(self, obj):
        try:
            return obj.photo_set.count()
        except Exception:
            return 0


class ProfileSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    avatar = serializers.SerializerMethodField(read_only=True)
    image = serializers.ImageField(write_only=True, required=False)

    def get_avatar(self, obj):
        # obj is a User
        try:
            url = obj.profile.image.url
        except Exception:
            return None
        request = self.context.get('request')
        if request is not None and url:
            return request.build_absolute_uri(url)
        return url

    def to_representation(self, instance):
        return {
            'username': instance.username,
            'email': instance.email,
            'avatar': self.get_avatar(instance),
        }

    def update(self, instance, validated_data):
        if 'username' in validated_data:
            instance.username = validated_data['username']
        if 'email' in validated_data:
            instance.email = validated_data['email']
        instance.save()
        image = validated_data.get('image')
        if image is not None:
            profile = instance.profile
            profile.image = image
            profile.save()
        return instance
