from django.urls import path
from . import views

urlpatterns = [
    path('', views.Gallery.as_view(), name="gallery"),
    path('user/<str:username>/', views.UserGallery.as_view(), name='user-gallery'),
    path('photo/<int:pk>/update/', views.PhotoUpdateView.as_view(), name='update'),
    path('photo/<int:pk>/delete/', views.PhotoDeleteView.as_view(), name='delete'),
    path('photo/<int:pk>/', views.ViewPhoto.as_view(), name="photo"),
    path('add/', views.AddPhoto.as_view(), name="add"),
    
]