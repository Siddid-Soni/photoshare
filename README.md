# PhotoShare

PhotoShare is a web application built with Django that allows users to upload, manage, and share photos. It features user authentication, photo galleries, tagging, and cloud storage integration (Amazon S3).

## Features

- User registration, login, and profile management
- Upload, update, and delete photos
- Tagging system for photos (using django-taggit)
- Responsive photo gallery
- Email notifications (password reset, etc.)
- Cloud storage support via Amazon S3
- Modern UI with Bootstrap and custom CSS

## Tech Stack

- **Backend:** Django 3.1.7
- **Frontend:** HTML, CSS (Bootstrap, custom styles), JavaScript
- **Database:** SQLite (default, can be changed)
- **Cloud Storage:** Amazon S3 (via django-storages)
- **Other:** django-crispy-forms, django-taggit

## Getting Started

### Prerequisites

- Python 3.7+
- pip
- (Optional) Virtualenv

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

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   - Create a `.env` file in the project root (optional, but recommended for secrets).
   - Add your sensitive settings (see below).

5. **Apply migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser:**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run the development server:**
   ```bash
   python manage.py runserver
   ```

8. **Access the app:**
   - Visit [http://127.0.0.1:8000/](http://127.0.0.1:8000/) in your browser.

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
│   ├── views.py
│   ├── templates/
│   └── ...
├── users/
│   ├── models.py
│   ├── views.py
│   ├── templates/
│   └── ...
├── photoshare/
│   ├── settings.py
│   ├── urls.py
│   └── ...
├── static/
│   ├── css/
│   ├── js/
│   └── images/
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
