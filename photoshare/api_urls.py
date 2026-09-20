from django.urls import include, path
from rest_framework.routers import DefaultRouter

from photos.api_views import PhotoViewSet
from users import api_views as user_api

router = DefaultRouter()
router.register('photos', PhotoViewSet, basename='api-photos')

urlpatterns = [
    path('csrf/', user_api.CsrfView.as_view(), name='api-csrf'),
    path('me/', user_api.MeView.as_view(), name='api-me'),
    path('profile/', user_api.ProfileView.as_view(), name='api-profile'),
    path('auth/register/', user_api.RegisterView.as_view(), name='api-register'),
    path('auth/login/', user_api.LoginView.as_view(), name='api-login'),
    path('auth/logout/', user_api.LogoutView.as_view(), name='api-logout'),
    path('', include(router.urls)),
]
