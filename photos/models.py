from django.db import models
from django.contrib.auth.models import User
from django.db.models.expressions import F
from django.utils import timezone
from django.urls import reverse
from taggit.managers import TaggableManager


# Create your models here

class Photo(models.Model):
    image=models.ImageField(null=False, blank=False)
    description=models.TextField()
    date_posted=models.DateTimeField(default=timezone.now, null=False, blank=False)
    auther=models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    tags = TaggableManager(blank=False)
    is_private=models.BooleanField(default=False,null=False)

    def __str__(self):
        return self.description

    def get_absolute_url(self):
        return reverse("photo", kwargs={"pk": self.pk})
