from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.conf import settings
import requests
from pathlib import Path
from app.constants import AppInfo

# Local paths for development
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # <project_root>/backend
LEGAL_DIR = BASE_DIR.parent / "legal"
LOCAL_EULA_FILE = LEGAL_DIR / "eula.md"
LOCAL_PRIVACY_FILE = LEGAL_DIR / "privacy.md"

# GitHub URLs for production
GITHUB_EULA_URL = f"https://raw.githubusercontent.com/{AppInfo.DEVELOPER}/{AppInfo.APP_NAME}/develop/legal/eula.md"
GITHUB_PRIVACY_URL = f"https://raw.githubusercontent.com/{AppInfo.DEVELOPER}/{AppInfo.APP_NAME}/develop/legal/privacy.md"

DEFAULT_VERSION = "1.0.0"


def _read_local_markdown(file_path: Path):
  """Read markdown content from local file."""
  try:
    if file_path.exists():
      return file_path.read_text(encoding="utf-8")
    return None
  except Exception:
    return None


def _fetch_markdown_from_github(url: str):
  """Fetch markdown content from GitHub raw URL."""
  try:
    response = requests.get(url, timeout=10)
    if response.status_code == 200:
      return response.text
    return None
  except requests.RequestException:
    return None


def get_legal_content(local_file: Path, github_url: str):
  if settings.DEBUG: return _read_local_markdown(local_file)
  else: return _fetch_markdown_from_github(github_url)


@require_GET
def get_eula(request):
  """Return the EULA markdown file as JSON."""
  content = get_legal_content(LOCAL_EULA_FILE, GITHUB_EULA_URL)
  if content is None:
    return JsonResponse({"error": "Terms of Service not found"}, status=404)

  return JsonResponse({
    "version": DEFAULT_VERSION,
    "content": content,
  })


@require_GET
def get_privacy_policy(request):
  """Return the Privacy Policy markdown file as JSON."""
  content = get_legal_content(LOCAL_PRIVACY_FILE, GITHUB_PRIVACY_URL)
  if content is None:
    return JsonResponse({"error": "Privacy Policy not found"}, status=404)

  return JsonResponse({
    "version": DEFAULT_VERSION,
    "content": content,
  })
