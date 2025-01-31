import { useEffect, useState } from 'react';
import { batchGetArtists } from '../../services/spotify/spotifyArtists';
import { SpotifyArtistResponse } from '../../types/spotify/SpotifyArtistResponse';
import Artist from '../Artist/Artist';
import './FollowedArtists.css';
import { TrackifyArtist } from '../../types/trackify/TrackifyArtist';

interface FollowedArtistsProps {
  accessToken: string;
  followedArtists: TrackifyArtist[];
}

const FollowedArtists = ({ accessToken, followedArtists }: FollowedArtistsProps) => {
  const [artistsData, setArtistsData] = useState<SpotifyArtistResponse[] | null>(null);

  const handleUnfollow = (artistId: string) => {
    const updatedArtistsData = artistsData?.filter(artist => artist.id !== artistId) || [];
    setArtistsData(updatedArtistsData);
  };

  useEffect(() => {
    batchGetArtists(accessToken, followedArtists, setArtistsData);
  }, [accessToken, followedArtists]);

  return (
    <div className="followed-artists">
      <h2 className="followed-artists__title">Artistas seguidos</h2>
      {artistsData ? (
        <ul className="followed-artists__list">
          {artistsData.map((artist) => (
            <li key={artist.id} className="followed-artists__item">
              <Artist
                data={artist}
                allowedActions={['unfollow']}
                onFollow={() => {}}
                onUnfollow={handleUnfollow}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="followed-artists__loading">Cargando...</p>
      )}
    </div>
  );
};

export default FollowedArtists;
