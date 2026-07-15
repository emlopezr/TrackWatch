import re
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from app.authentication import TrackWatchSessionAuthentication
from app.services.ghost_tracks_service import (
    get_owned_playlists,
    scan_playlists_parallel,
    remove_tracks_from_playlists
)
from app.exceptions import BadRequestException, ErrorCode, ForbiddenException
from app.services.session_service import with_user_access_token


DEFAULT_COUNTRY_CODE = "CO"
MAX_PLAYLISTS_PER_REQUEST = 50
MAX_TRACKS_PER_PLAYLIST = 1000
MAX_TRACKS_PER_REQUEST = 5000
SPOTIFY_ID_PATTERN = re.compile(r"^[A-Za-z0-9]{22}$")
SPOTIFY_TRACK_URI_PATTERN = re.compile(r"^spotify:track:[A-Za-z0-9]{22}$")


def _validate_playlist_ids(playlist_ids):
    if not isinstance(playlist_ids, list) or not playlist_ids:
        raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY, details="playlistIds must be a non-empty array")
    if len(playlist_ids) > MAX_PLAYLISTS_PER_REQUEST:
        raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY, details="Too many playlists requested")
    if any(not isinstance(playlist_id, str) or not SPOTIFY_ID_PATTERN.fullmatch(playlist_id) for playlist_id in playlist_ids):
        raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY, details="Invalid Spotify playlist ID")
    if len(set(playlist_ids)) != len(playlist_ids):
        raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY, details="playlistIds must be unique")
    return playlist_ids


def _validate_removals(removals):
    if not isinstance(removals, list) or not removals:
        raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY, details="removals must be a non-empty array")
    if len(removals) > MAX_PLAYLISTS_PER_REQUEST:
        raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY, details="Too many playlists requested")

    validated = []
    total_tracks = 0
    playlist_ids = []
    for removal in removals:
        if not isinstance(removal, dict):
            raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY, details="Each removal must be an object")

        playlist_id = removal.get("playlistId")
        track_uris = removal.get("trackUris")
        if not isinstance(playlist_id, str) or not SPOTIFY_ID_PATTERN.fullmatch(playlist_id):
            raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY, details="Invalid Spotify playlist ID")
        if not isinstance(track_uris, list) or not track_uris or len(track_uris) > MAX_TRACKS_PER_PLAYLIST:
            raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY, details="Invalid trackUris list")
        if any(not isinstance(uri, str) or not SPOTIFY_TRACK_URI_PATTERN.fullmatch(uri) for uri in track_uris):
            raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY, details="Invalid Spotify track URI")
        if len(set(track_uris)) != len(track_uris):
            raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY, details="trackUris must be unique")

        playlist_ids.append(playlist_id)
        total_tracks += len(track_uris)
        validated.append({"playlistId": playlist_id, "trackUris": track_uris})

    if len(set(playlist_ids)) != len(playlist_ids):
        raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY, details="Playlist removals must be unique")
    if total_tracks > MAX_TRACKS_PER_REQUEST:
        raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY, details="Too many tracks requested")
    return validated


def _owned_playlist_map(user):
    owned_playlists = with_user_access_token(
        user,
        lambda access_token: get_owned_playlists(access_token, user.id)
    )
    return {playlist["id"]: playlist["name"] for playlist in owned_playlists}


def _require_owned_playlists(playlist_ids, playlist_map):
    if any(playlist_id not in playlist_map for playlist_id in playlist_ids):
        raise ForbiddenException(ErrorCode.PLAYLIST_ACCESS_DENIED)


@api_view(['GET'])
@authentication_classes([TrackWatchSessionAuthentication])
@permission_classes([IsAuthenticated])
def get_playlists(request):
    user = request.user
    playlists = with_user_access_token(
        user,
        lambda access_token: get_owned_playlists(access_token, user.id)
    )
    return Response({"playlists": playlists}, status=status.HTTP_200_OK)


@api_view(['POST'])
@authentication_classes([TrackWatchSessionAuthentication])
@permission_classes([IsAuthenticated])
def scan_ghost_tracks(request):
    user = request.user

    playlist_ids = _validate_playlist_ids(request.data.get("playlistIds"))
    country_code = request.data.get("countryCode", DEFAULT_COUNTRY_CODE)

    if not isinstance(country_code, str) or not re.fullmatch(r'[A-Z]{2}', country_code):
        raise BadRequestException(ErrorCode.INVALID_REQUEST_BODY, details="Invalid countryCode")

    playlist_map = _owned_playlist_map(user)
    _require_owned_playlists(playlist_ids, playlist_map)

    playlist_infos = [{"id": playlist_id, "name": playlist_map[playlist_id]} for playlist_id in playlist_ids]

    result = with_user_access_token(
        user,
        lambda access_token: scan_playlists_parallel(access_token, playlist_infos, country_code)
    )
    return Response(result, status=status.HTTP_200_OK)


@api_view(['POST'])
@authentication_classes([TrackWatchSessionAuthentication])
@permission_classes([IsAuthenticated])
def remove_ghost_tracks(request):
    user = request.user

    removals = _validate_removals(request.data.get("removals"))

    playlist_map = _owned_playlist_map(user)
    _require_owned_playlists([removal["playlistId"] for removal in removals], playlist_map)

    for removal in removals:
        removal["playlistName"] = playlist_map[removal["playlistId"]]

    results = with_user_access_token(
        user,
        lambda access_token: remove_tracks_from_playlists(access_token, removals)
    )

    total_removed = sum(r["removedCount"] for r in results)
    total_failed = sum(r["failedCount"] for r in results)

    return Response({
        "results": results,
        "totalRemoved": total_removed,
        "totalFailed": total_failed
    }, status=status.HTTP_200_OK)
