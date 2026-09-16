"""photoshare URL Configuration (API + React SPA + legacy Django pages)."""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path, re_path
from django.views.generic import TemplateView


class FrontendView(TemplateView):
    def get_template_names(self):
        return ['index.html']

    def get(self, request, *args, **kwargs):
        index_file = settings.BASE_DIR / 'frontend' / 'dist' / 'index.html'
        if not index_file.is_file():
            return HttpResponse(
                '<h1>PhotoShare React app not built yet</h1>'
                '<p>Run the Vite dev server (<code>cd frontend &amp;&amp; npm run dev</code>) '
                'and open <a href="http://localhost:5173">http://localhost:5173</a>, '
                'or build with <code>npm run build</code>.</p>'
                '<p>Legacy Django UI: <a href="/legacy/">/legacy/</a></p>',
                content_type='text/html',
            )
        return super().get(request, *args, **kwargs)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('photoshare.api_urls')),
    # Legacy server-rendered Django pages (kept as fallback)
    path('legacy/', include('photos.urls')),
    path('legacy/', include('users.urls')),
    # React SPA (serves built frontend; client-side routing handles the rest)
    path('', FrontendView.as_view(), name='frontend'),
    re_path(r'^(?!api/|admin/|legacy/|static/|images/|assets/).*$', FrontendView.as_view(), name='frontend-fallback'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
# Vite build output (frontend/dist/assets -> /assets/)
urlpatterns += static('/assets/', document_root=settings.BASE_DIR / 'frontend' / 'dist' / 'assets')
