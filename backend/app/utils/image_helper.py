import requests
import base64

def encode_image_to_base64(image_url: str) -> str:
  try:
    response = requests.get(image_url, timeout=10)
    response.raise_for_status()
    encoded = base64.b64encode(response.content).decode("utf-8")
    return encoded

  except Exception as e:
    print(f"Error while encoding image to base64: {str(e)}")
    return None
