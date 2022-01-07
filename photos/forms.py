from django.forms import ModelForm, Textarea, Select, FileInput, ValidationError, CheckboxInput
from .models import Photo
from taggit.forms import TagWidget

class Upload(ModelForm):
    image = FileInput(attrs={'class': 'form-select border-secondary' ,'type': 'file', 'required': True})
    class Meta:
        model = Photo
        fields = ['description', 'image', 'tags', 'is_private']
        widgets = {
                    'description': Textarea(
                        attrs={'class': 'form-control border-secondary', 'placeholder': 'enter description', 'id': 'validationTextarea','rows': 5, 'required': True}),
                    'image': FileInput(
                        attrs={'class': 'form-control border-secondary' ,'type': 'file', 'required': True}),
                    'tags': TagWidget(
                        attrs={'class': 'form-control border-secondary', 'data-role' : "tagsinput"}),
                    'is_private': CheckboxInput(
                        attrs={'class': 'form-check-input', 'role': 'switch', 'id': 'flexSwitchCheckDefault'}
                    )
                }

    def clean_image(self):
        data = self.cleaned_data.get("image")
        if data.size > 5242880:
            raise ValidationError("file too large...!(>5MB)")
        return data
    
    def clean_tags(self):
        data = self.cleaned_data["tags"]
        data.remove(':')
        data.remove('[{')
        data.remove('}]')
        data.remove('value')
        if '{' in data:
            data.remove('{')
            data.remove('}')
        if len(data) < 3:
            raise ValidationError("atleast three tags required!!")
        return data
    
    
    
class Update(ModelForm):
    class Meta:
        model = Photo
        fields = ['description', 'tags', 'is_private']
        widgets = {
                    'description': Textarea(
                        attrs={'class': 'form-control border-secondary', 'placeholder': 'enter description', 'id': 'validationTextarea','rows': 5, 'required': True}),
                    'category': Select(
                        attrs={'class': 'form-select border-secondary', 'aria-label': "Default select example"}),
                    'tags': TagWidget(
                        attrs={'class': 'form-control border-secondary', 'data-role' : "tagsinput"}),
                    'is_private': CheckboxInput(
                        attrs={'class': 'form-check-input', 'role': 'switch', 'id': 'flexSwitchCheckDefault'}
                    )
                    }

    def clean_tags(self):
        data = self.cleaned_data["tags"]
        data.remove(':')
        data.remove('[{')
        data.remove('}]')
        data.remove('value')
        if '{' in data:
            data.remove('{')
            data.remove('}')
        if len(data) < 3:
            raise ValidationError("atleast three tags required!!")
        return data
        
        
            