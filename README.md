# PhotoShare

PhotoShare is a web application that allows users to upload, manage, and share photos. It features user authentication, photo galleries, tagging, and cloud storage integration (Amazon S3).

## Features

- User registration, login, and profile management (with avatars)
- Upload, update, and delete photos (5MB limit, private/public visibility)
- Tagging system for photos (using django-taggit)
- Search across descriptions and tags, tag browsing, per-user galleries
- Professional React single-page app (Vite) + Django REST API backend
- Legacy server-rendered Django pages kept at `/legacy/` as fallback
- Email notifications (password reset, etc.)
- Cloud storage support via Amazon S3 (optional)

## Tech Stack

- **Backend:** Django 5.2 + Django REST Framework (session auth, `/api/` endpoints)
- **Frontend:** React 19 + React Router + Vite (in `frontend/`), custom professional dark UI
- **Database:** SQLite (default, can be changed)
- **Cloud Storage:** Amazon S3 (via django-storages, optional)
- **Other:** django-taggit, django-crispy-forms (legacy pages), Pillow

## Getting Started

### Prerequisites

- Python 3.10+
- pip
- Node.js 18+ and npm
- (Optional) Virtualenv (recommended — the repo already uses `venv/`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd photoshare
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install backend dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install frontend dependencies:**
   ```bash
   cd frontend && npm install && cd ..
   ```

5. **Set up environment variables:**
   - Create a `.env` file in the project root (optional, but recommended for secrets).
   - Add your sensitive settings (see below).

6. **Apply migrations:**
   ```bash
   python manage.py migrate
   ```

7. **Create a superuser:**
   ```bash
   python manage.py createsuperuser
   ```

8. **Run the app (two terminals):**
   ```bash
   # Terminal 1 — Django API (http://127.0.0.1:8000)
   python manage.py runserver
   ```
   ```bash
   # Terminal 2 — React dev server with hot reload (http://localhost:5173)
   cd frontend && npm run dev
   ```

9. **Access the app:**
   - React UI (dev): [http://localhost:5173/](http://localhost:5173/)
   - Django serving the built React app: [http://127.0.0.1:8000/](http://127.0.0.1:8000/) (requires `cd frontend && npm run build` first)
   - Legacy Django UI: [http://127.0.0.1:8000/legacy/](http://127.0.0.1:8000/legacy/)
   - API: `http://127.0.0.1:8000/api/photos/`, `http://127.0.0.1:8000/api/me/`, etc.

## API reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/csrf/` | Set CSRF cookie (for session auth) |
| GET/PATCH | `/api/me/` | Current user (auth required for PATCH) |
| POST | `/api/auth/register/` | Register + auto-login |
| POST | `/api/auth/login/` | Login with username/password |
| POST | `/api/auth/logout/` | Logout |
| GET/PATCH | `/api/profile/` | Profile + avatar upload (multipart) |
| GET/POST | `/api/photos/?search=&tag=&username=&page=` | List (paginated) / upload (multipart, auth) |
| GET/PATCH/DELETE | `/api/photos/<id>/` | Detail / edit (owner) / delete (owner) |
| GET | `/api/photos/tags/` | Tag list for discovery |

## Configuration

### Email (for password reset, etc.)

Edit `photoshare/settings.py` or use environment variables:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = '<your-email>'
EMAIL_HOST_PASSWORD = '<your-app-password>'
```

### Amazon S3 Storage

Set the following in your `.env` or `settings.py`:

```python
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_ACCESS_KEY_ID = '<your-access-key>'
AWS_SECRET_ACCESS_KEY = '<your-secret-key>'
AWS_STORAGE_BUCKET_NAME = '<your-bucket-name>'
AWS_DEFAULT_ACL = 'public-read'
AWS_QUERYSTRING_AUTH = False
```

> **Note:** For local development, you can comment out the S3 settings to use local storage.

## Project Structure

```
photoshare/
├── manage.py
├── photos/
│   ├── models.py
│   ├── views.py          # legacy server-rendered pages
│   ├── api_views.py      # DRF ViewSet (JSON API)
│   ├── serializers.py
│   └── ...
├── users/
│   ├── models.py
│   ├── views.py          # legacy pages
│   ├── api_views.py      # auth/me/profile endpoints
│   ├── serializers.py
│   └── ...
├── photoshare/
│   ├── settings.py
│   ├── urls.py           # /api/*, /legacy/*, React SPA fallback
│   ├── api_urls.py
│   └── ...
├── frontend/             # React + Vite SPA
│   ├── src/
│   │   ├── api/client.js
│   │   ├── auth/AuthContext.jsx
│   │   ├── components/
│   │   ├── pages/        # Gallery, PhotoDetail, Upload, Login, Register, Profile, UserPhotos
│   │   └── styles.css
│   ├── vite.config.js    # proxies /api, /images, /static → Django
│   └── dist/             # build output served by Django at / (git-ignored)
├── static/
│   ├── css/ js/          # legacy assets
│   └── images/           # uploaded media (MEDIA_ROOT)
├── requirements.txt
└── ...
```

## Running Tests

```bash
python manage.py test
```

## Deployment

- Set `DEBUG = False` in `settings.py`
- Configure allowed hosts and static/media file handling
- Set up environment variables for secrets and credentials
- Use a production-ready database (e.g., PostgreSQL)
- Use a production web server (e.g., Gunicorn, Nginx)
