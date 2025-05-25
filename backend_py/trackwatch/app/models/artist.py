class Artist:
  def __init__(self, id, name, image_url=""):
      self.id = id
      self.name = name
      self.image_url = image_url

  def is_equal_to(self, other):
    if not isinstance(other, Artist): return False
    return self.id == other.id and self.name == other.name