import re
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from app.services.ghost_tracks_service import (
    get_owned_playlists,
    scan_playlists_parallel,
    remove_tracks_from_playlists
)
from app.exceptions import SpotifyReauthorizationRequiredException
from app.services.session_service import get_session_user, with_user_access_token


DEFAULT_COUNTRY_CODE = "CO"


def get_token_and_user(request):
    try:
        user = get_session_user(request)
        return user, None
    except Exception as e:
        return None, Response(
            {"error": f"Failed to authenticate user: {str(e)}"},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def get_playlists(request):
    user, error_response = get_token_and_user(request)

    if error_response:
        return error_response

    try:
        playlists = with_user_access_token(
            user,
            lambda access_token: get_owned_playlists(access_token, user.id)
        )
        return Response({"playlists": playlists}, status=status.HTTP_200_OK)
    except SpotifyReauthorizationRequiredException:
        raise
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def scan_ghost_tracks(request):
    user, error_response = get_token_and_user(request)
    if error_response:
        return error_response

    # Parse request body
    playlist_ids = request.data.get("playlistIds", [])
    country_code = request.data.get("countryCode", DEFAULT_COUNTRY_CODE)

    # Validate playlist IDs
    if not playlist_ids or not isinstance(playlist_ids, list):
        return Response(
            {"error": "playlistIds is required and must be a non-empty array"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # T042: Validate country code format (ISO 3166-1 alpha-2)
    if not re.match(r'^[A-Z]{2}$', country_code):
        return Response(
            {"error": "countryCode must be a valid ISO 3166-1 alpha-2 code (e.g., 'CO', 'US')"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Get playlist names for the response
        owned_playlists = with_user_access_token(
            user,
            lambda access_token: get_owned_playlists(access_token, user.id)
        )
        playlist_map = {p["id"]: p["name"] for p in owned_playlists}

        # Build playlist info list
        playlist_infos = []
        for pid in playlist_ids:
            name = playlist_map.get(pid, "Unknown Playlist")
            playlist_infos.append({"id": pid, "name": name})

        # Scan playlists
        result = with_user_access_token(
            user,
            lambda access_token: scan_playlists_parallel(access_token, playlist_infos, country_code)
        )
        return Response(result, status=status.HTTP_200_OK)
    except SpotifyReauthorizationRequiredException:
        raise
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def remove_ghost_tracks(request):
    user, error_response = get_token_and_user(request)
    if error_response:
        return error_response

    # Parse request body
    removals = request.data.get("removals", [])

    # Validate removals
    if not removals or not isinstance(removals, list):
        return Response(
            {"error": "removals is required and must be a non-empty array"},
            status=status.HTTP_400_BAD_REQUEST
        )

    for removal in removals:
        if not removal.get("playlistId") or not removal.get("trackUris"):
            return Response(
                {"error": "Each removal must have playlistId and trackUris"},
                status=status.HTTP_400_BAD_REQUEST
            )

    try:
        # Get playlist names for the response
        owned_playlists = with_user_access_token(
            user,
            lambda access_token: get_owned_playlists(access_token, user.id)
        )
        playlist_map = {p["id"]: p["name"] for p in owned_playlists}

        # Add playlist names to removals
        for removal in removals:
            removal["playlistName"] = playlist_map.get(removal["playlistId"], "Unknown Playlist")

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
    except SpotifyReauthorizationRequiredException:
        raise
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
