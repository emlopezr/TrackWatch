import { TrackifyFollowedArtist } from '../../types/trackify/TrackifyFollowedArtist';

const flatFollowedArtists = (followedArtists: TrackifyFollowedArtist[]): string[] => {
  return followedArtists.map((artist: TrackifyFollowedArtist) => artist.spotify_id);
}

export const getFollowedArtists = async (accessToken: string, setFollowedArtists: (artists: string[]) => void) => {
  // Temporary mock data
  const mockData = {
    id: 1234,
    followed_artists: [
      {
        spotify_id: '2CIMQHirSU0MQqyYHq0eOx',
        name: 'Artist 1',
      },
      {
        spotify_id: '57dN52uHvrHOxijzpIgu3E',
        name: 'Artist 2',
      },
      {
        spotify_id: '1vCWHaC5f2uS3yhpwWbIA6',
        name: 'Artist 3',
      },
    ]
  };

  setFollowedArtists(flatFollowedArtists(mockData.followed_artists));
}