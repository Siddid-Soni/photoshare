from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.forms import FileInput
from .models import Profile


class UserRegistrationForm(UserCreationForm):
    email=forms.EmailField()
    
    class Meta:
        model=User
        fields=['username', 'email', 'password1', 'password2']

class UserUpdatefrom(forms.ModelForm):
    email=forms.EmailField()
    
    class Meta:
        model=User
        fields=['username', 'email']

class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model=Profile
        fields = ['image']
        widgets = {
            'image': FileInput(
                        attrs={'class': 'form-control border-secondary' ,'type': 'file', 'required': True}),
        }