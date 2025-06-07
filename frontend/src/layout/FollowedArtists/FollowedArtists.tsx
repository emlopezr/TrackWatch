import { useEffect, useState } from 'react';
import SpotifyArtistResponse from '../../types/spotify/SpotifyArtistResponse';
import TrackWatchArtist from '../../types/trackwatch/TrackWatchArtist';
import { batchGetArtists } from '../../services/spotify/spotifyArtists';
import ArtistList from '../ArtistList/ArtistList';

interface FollowedArtistsProps {
  accessToken: string;
  followedArtists: TrackWatchArtist[];
}

const FollowedArtists = ({ accessToken, followedArtists }: FollowedArtistsProps) => {
  const [artistsData, setArtistsData] = useState<SpotifyArtistResponse[]>([]);
  const [loadingPage, setLoadingPage] = useState<boolean>(false);

  useEffect(() => {
    const loadArtists = async () => {
      setLoadingPage(true);
      const data = await batchGetArtists(accessToken, followedArtists);
      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));

      setArtistsData(sortedData);
      setLoadingPage(false);
    };

    loadArtists();
  }, [accessToken, followedArtists]);

  const emptyStateMessage = (
    <p>
      You're not following any artists yet 😔 <br />
      Follow your first artist by searching in the bar above!
    </p>
  );

  return (
    <ArtistList
      title="Followed Artists"
      artistsData={artistsData}
      isLoading={loadingPage}
      emptyStateMessage={followedArtists.length === 0 ? emptyStateMessage : undefined}
    />
  );
};

export default FollowedArtists;
