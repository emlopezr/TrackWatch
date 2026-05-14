from .spotify_api_client import spotify_api_request
from app.exceptions import InternalServerErrorException, ErrorCode, CustomException
from app.classes import Artist


def get_followed_artists(access_token: str) -> list[Artist]:
    """
    Get all artists the user follows on Spotify.
    Handles pagination automatically using cursor-based pagination.
    """
    artists = []
    after = None

    try:
        while True:
            params = {"type": "artist", "limit": 50}
            if after:
                params["after"] = after

            response = spotify_api_request(
                method="GET",
                endpoint="/me/following",
                token=access_token,
                params=params
            )

            artists_data = response.get("artists", {})
            items = artists_data.get("items", [])

            for item in items:
                images = item.get("images", [])
                image_url = images[0]["url"] if images else ""
                artist = Artist(
                    id=item.get("id"),
                    name=item.get("name"),
                    image_url=image_url
                )
                artists.append(artist)

            cursors = artists_data.get("cursors", {})
            after = cursors.get("after")

            if not after:
                break

        return artists

    except CustomException:
        raise
    except Exception as e:
        raise InternalServerErrorException(
            ErrorCode.UNHANDLED_EXCEPTION,
            f"Error while fetching followed artists from Spotify: {str(e)}"
        )


def follow_artist(access_token: str, artist_id: str) -> None:
    """
    Follow an artist on Spotify.
    """
    try:
        spotify_api_request(
            method="PUT",
            endpoint="/me/following",
            token=access_token,
            params={"type": "artist", "ids": artist_id}
        )
    except CustomException:
        raise
    except Exception as e:
        raise InternalServerErrorException(
            ErrorCode.UNHANDLED_EXCEPTION,
            f"Error while following artist on Spotify: {str(e)}"
        )


def unfollow_artist(access_token: str, artist_id: str) -> None:
    """
    Unfollow an artist on Spotify.
    """
    try:
        spotify_api_request(
            method="DELETE",
            endpoint="/me/following",
            token=access_token,
            params={"type": "artist", "ids": artist_id}
        )
    except CustomException:
        raise
    except Exception as e:
        raise InternalServerErrorException(
            ErrorCode.UNHANDLED_EXCEPTION,
            f"Error while unfollowing artist on Spotify: {str(e)}"
        )
