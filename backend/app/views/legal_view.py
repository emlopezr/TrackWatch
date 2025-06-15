from django.http import JsonResponse
from django.views.decorators.http import require_GET
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # <project_root>/backend
LEGAL_DIR = BASE_DIR.parent / "legal"

EULA_FILE = LEGAL_DIR / "eula.md"
PRIVACY_FILE = LEGAL_DIR / "privacy.md"

DEFAULT_VERSION = "1.0.0"


def _read_markdown(file_path: Path):
  if not file_path.exists():
    return None
  return file_path.read_text(encoding="utf-8")


@require_GET
def get_eula(request):
  """Return the EULA markdown file as JSON."""
  content = _read_markdown(EULA_FILE)
  if content is None:
    return JsonResponse({"error": "EULA not found"}, status=404)

  return JsonResponse({
    "version": DEFAULT_VERSION,
    "content": content,
  })


@require_GET
def get_privacy_policy(request):
  """Return the Privacy Policy markdown file as JSON."""
  content = _read_markdown(PRIVACY_FILE)
  if content is None:
    return JsonResponse({"error": "Privacy Policy not found"}, status=404)

  return JsonResponse({
    "version": DEFAULT_VERSION,
    "content": content,
  })
