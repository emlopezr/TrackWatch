import { TrackifyArtist } from "../../types/trackify/TrackifyArtist";

const flatFollowedArtists = (followedArtists: TrackifyArtist[]): string[] => {
  return followedArtists.map((artist: TrackifyArtist) => artist.id);
}

export const getFollowedArtists = async (accessToken: string, setFollowedArtists: (artists: string[]) => void) => {
  // Temporary mock data
  const mockData = {
    id: 1234,
    followed_artists: [
      {
        spotify_id: '1bAftSH8umNcGZ0uyV7LMg',
        name: 'Artist 1',
      },
      {
        spotify_id: '4q3ewBCX7sLwd24euuV69X',
        name: 'Artist 2',
      },
      {
        spotify_id: '2LRoIwlKmHjgvigdNGBHNo',
        name: 'Artist 3',
      },
      {
        spotify_id: '5XJDexmWFLWOkjOEjOVX3e',
        name: 'Artist 4',
      },
      {
        spotify_id: '6nVcHLIgY5pE2YCl8ubca1',
        name: 'Artist 5',
      },
      {
        spotify_id: '0GM7qgcRCORpGnfcN2tCiB',
        name: 'Artist 6',
      },
      {
        spotify_id: '19HM5j0ULGSmEoRcrSe5x3',
        name: 'Artist 7',
      }
    ]
  };

  setFollowedArtists(flatFollowedArtists(mockData.followed_artists));
}