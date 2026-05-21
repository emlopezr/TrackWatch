import os
from decouple import config
from pathlib import Path
from urllib.parse import unquote, urlparse

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("SECRET_KEY")
DEBUG = config("DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="*").split(",")

INSTALLED_APPS = [
  "django.contrib.admin",
  "django.contrib.auth",
  "django.contrib.contenttypes",
  "django.contrib.sessions",
  "django.contrib.messages",
  "django.contrib.staticfiles",
  "rest_framework",
  "corsheaders",
  "django_apscheduler",
  "app",
]

MIDDLEWARE = [
  "django.middleware.security.SecurityMiddleware",
  "whitenoise.middleware.WhiteNoiseMiddleware",
  "corsheaders.middleware.CorsMiddleware",
  "django.contrib.sessions.middleware.SessionMiddleware",
  "django.middleware.common.CommonMiddleware",
  "django.middleware.csrf.CsrfViewMiddleware",
  "django.contrib.auth.middleware.AuthenticationMiddleware",
  "django.contrib.messages.middleware.MessageMiddleware",
  "django.middleware.clickjacking.XFrameOptionsMiddleware",
  "app.exceptions.middleware.GlobalExceptionMiddleware",
]

ROOT_URLCONF = "trackwatch.urls"

def _database_settings():
  database_url = os.getenv("DATABASE_URL")
  if database_url:
    parsed = urlparse(database_url)
    return {
      "ENGINE": "django.db.backends.postgresql",
      "NAME": parsed.path.lstrip("/"),
      "USER": unquote(parsed.username or ""),
      "PASSWORD": unquote(parsed.password or ""),
      "HOST": parsed.hostname or "localhost",
      "PORT": str(parsed.port or "5432"),
    }

  default_host = "localhost" if DEBUG else None
  database_settings = {
    "ENGINE": "django.db.backends.postgresql",
    "NAME": config("DATABASE_NAME", default=os.getenv("PGDATABASE")),
    "USER": config("DATABASE_USER", default=os.getenv("PGUSER", "postgres")),
    "PASSWORD": config("DATABASE_PASSWORD", default=os.getenv("PGPASSWORD", "")),
    "HOST": config("DATABASE_HOST", default=os.getenv("PGHOST", default_host)),
    "PORT": config("DATABASE_PORT", default=os.getenv("PGPORT", "5432")),
  }

  if not database_settings["NAME"]:
    raise ValueError("Database name is not configured. Set DATABASE_URL or DATABASE_NAME/PGDATABASE.")

  if not database_settings["HOST"]:
    raise ValueError("Database host is not configured. Set DATABASE_URL or DATABASE_HOST/PGHOST.")

  return database_settings

DATABASES = {"default": _database_settings()}

REST_FRAMEWORK = {
  "DEFAULT_AUTHENTICATION_CLASSES": [
    "rest_framework.authentication.SessionAuthentication",
    "rest_framework.authentication.TokenAuthentication",
  ],
  "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
  "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
  "PAGE_SIZE": 20
}

TEMPLATES = [
  {
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {
      "context_processors": [
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
      ],
    },
  },
]

CORS_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://trackwatch.emlopezr.com",
]

CORS_ALLOW_HEADERS = ['accept', 'accept-encoding', 'authorization', 'content-type', 'dnt', 'origin', 'user-agent', 'x-csrftoken', 'x-requested-with', 'x-admin-key']
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://trackwatch.emlopezr.com",
]

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SECURE = not DEBUG

WSGI_APPLICATION = "trackwatch.wsgi.application"

AUTH_USER_MODEL = "app.User"

AUTH_PASSWORD_VALIDATORS = [
  {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
  {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
  {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
  {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "es-co"
TIME_ZONE = "America/Bogota"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
