import os
from django.http import request
from django.shortcuts import redirect, get_object_or_404
from django.urls.base import reverse
from .models import Photo
from .forms import Upload, Update
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib.auth.models import User
from django.urls import reverse_lazy
from taggit.models import Tag
import binascii

# Create your views here.
"""      
def gallery(request):
    category=request.GET.get('category')
    if category==None:
        photos=Photo.objects.all()
    else:
        photos=Photo.objects.filter(category__name=category)
    categories=Category.objects.all()
    context={
        'categories': categories,
        'photos': photos
    }
    return render(request, 'photos/gallery.html', context)

def viewPhoto(request, pk):
    photo=Photo.objects.get(id=pk)
    context={
        'photo': photo
    }
    return render(request, 'photos/photo.html', context)
"""

class ViewPhoto(UserPassesTestMixin, DetailView):
    model = Photo
    template_name = 'photos/photo.html'

    def get_context_data(self, **kwargs):
        context = super(ViewPhoto, self).get_context_data(**kwargs)
        prev_url = self.request.META.get('HTTP_REFERER')
        if prev_url==None:
            prev_url=reverse('gallery')
        if prev_url==self.request.build_absolute_uri('update')+'/':
            prev_url=reverse('gallery')
        context['prev_url']=prev_url
        return context

    def test_func(self):
        photo=self.get_object()
        if photo.is_private == True:
            if self.request.user==photo.auther:
                return True
            else:
                return False
        else:
            return True




class Gallery(ListView):
    model = Photo
    template_name = 'photos/gallery.html'
    context_object_name = 'photos'
    paginate_by=9

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super(Gallery, self).get_context_data(**kwargs)
        _tag = self.request.GET.get('tag') or ''
        search_tag=self.request.GET.get('tags') or ''
        if _tag:
            tag = get_object_or_404(Tag, slug=_tag)
            context['is_tag'] = True
            context['tag'] = tag.name
        context['search_input'] = search_tag
        return context

    def get_queryset(self):
        _tag = self.request.GET.get('tag') or ''
        _search_tag = self.request.GET.get('tags') or ''
        lst=_search_tag.split()
        if _tag:
            qs=[]
            for i in Photo.objects.filter(tags__slug=_tag):
                if i.is_private:
                    if i.auther==self.request.user:
                        qs.append(i)
                else:
                    qs.append(i)
            
            return qs
        
        if _search_tag:
            qs=[]
            for i in Photo.objects.filter(tags__name__in=lst).distinct():
                if i.is_private:
                    if i.auther==self.request.user:
                        qs.append(i)
                else:
                    qs.append(i)
            
            return qs

        else:
            qs=[]
            for i in Photo.objects.all():
                if i.is_private:
                    if i.auther==self.request.user:
                        qs.append(i)
                else:
                    qs.append(i)
            
            return qs




class UserGallery(ListView):
    model = Photo
    template_name='photos/user_photos.html'
    context_object_name='photos'
    paginate_by=9

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super(UserGallery, self).get_context_data(**kwargs)
        _tag = self.request.GET.get('tag') or ''
        search_tag=self.request.GET.get('tags') or ''
        if _tag:
            tag = get_object_or_404(Tag, slug=_tag)
            context['is_tag'] = True
            context['tag'] = tag.name
            context['utag'] = 'Tagged by ' + tag.name
        context['search_input'] = search_tag
        return context

    def get_queryset(self):
        user = get_object_or_404(User, username=self.kwargs.get('username'))
        _tag = self.request.GET.get('tag') or ''
        _search_tag = self.request.GET.get('tags') or ''
        lst=_search_tag.split()
        if _tag:
            qs=[]
            for i in Photo.objects.filter(auther=user,tags__slug=_tag).order_by('-date_posted'):
                if i.is_private:
                    if i.auther==self.request.user:
                        qs.append(i)
                else:
                    qs.append(i)
            return qs
        
        if _search_tag:
            qs=[]
            for i in Photo.objects.filter(auther=user, tags__name__in=lst).distinct().order_by('-date_posted'):
                if i.is_private:
                    if i.auther==self.request.user:
                        qs.append(i)
                else:
                    qs.append(i)
            return qs

        else:
            qs=[]
            for i in Photo.objects.filter(auther=user).order_by('-date_posted'):
                if i.is_private:
                    if i.auther==self.request.user:
                        qs.append(i)
                else:
                    qs.append(i)
            return qs


"""
@login_required
def addPhoto(request):
    if request.method == 'POST':
        form=Upload(request.POST, request.FILES)
        if form.is_valid():
            Photo.auther = request.user
            form.save()
            return redirect('gallery')
    else:
        form=Upload()
    context={
        'form':form
    }
    return render(request, 'photos/add.html', context)
"""

class AddPhoto(LoginRequiredMixin, CreateView):
    model = Photo
    template_name='photos/add.html'
    form_class = Upload
    success_url = reverse_lazy('gallery')

    def form_valid(self, form):
        form.instance.auther=self.request.user
        salt=str(binascii.hexlify(os.urandom(32)))
        lst=[]
        for i in salt:
            lst.append(i)
        lst.remove('b')
        lst.remove("'")
        lst.remove("'")
        form.instance.image.name= ''.join(lst) + form.instance.image.name
        return super().form_valid(form)




class PhotoUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Photo
    template_name='photos/update.html'
    context_object_name='photos'
    form_class=Update

    def form_valid(self, form):
        form.instance.auther=self.request.user
        return super(PhotoUpdateView, self).form_valid(form)

    def test_func(self):
        post=self.get_object()
        if self.request.user==post.auther:
            return True
        return False




class PhotoDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Photo
    success_url='/'


    def test_func(self):
        post=self.get_object()
        if self.request.user==post.auther:
            return True
        return False
