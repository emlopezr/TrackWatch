from django.utils import timezone

# Non-persistent models for API data transfer
class Track:
  def __init__(
    self,
    id,
    uri,
    name,
    artists,
    release_date,
    is_explicit,
    album_name,
    album_images,
    album_type,
    disc_number,
    album_order,
    duration_ms
  ):
    self.id = id
    self.uri = uri
    self.name = name
    self.artists = artists
    self.release_date = release_date
    self.is_explicit = is_explicit
    self.album_name = album_name
    self.album_images = album_images
    self.album_type = album_type
    self.disc_number = disc_number
    self.album_order = album_order
    self.duration_ms = duration_ms

  def is_equal_to(self, other):
    if not isinstance(other, Track): return False
    return (self.name == other.name and self._is_equal_artists(other))

  def is_equal_strict(self, other):
    if not isinstance(other, Track): return False
    return (
      self.name == other.name and
      self.is_explicit == other.is_explicit and
      self.album_type == other.album_type and
      self.disc_number == other.disc_number and
      self.album_order == other.album_order and
      self.album_name == other.album_name and
      self._is_equal_artists(other)
    )

  def _is_equal_artists(self, other):
    sorted_artists = sorted(self.artists, key=lambda x: x.name)
    other_sorted_artists = sorted(other.artists, key=lambda x: x.name)

    if len(sorted_artists) != len(other_sorted_artists): return False
    return all(a.is_equal_to(b) for a, b in zip(sorted_artists, other_sorted_artists))

  def to_persisted_track(self):
    return {
      "track_id": self.id,
      "track_name": self.name,
      "track_added_at": timezone.now()
    }

class TrackImage:
    """Non-persistent TrackImage class"""
    def __init__(self, url, height, width):
        self.url = url
        self.height = height
        self.width = width
