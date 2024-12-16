import { useEffect, useState } from 'react';
import { batchGetArtists } from '../../services/spotify/spotifyArtists';
import { SpotifyArtistResponse } from '../../types/spotify/SpotifyArtistResponse';
import FollowedArtist from './FollowedArtist/FollowedArtist';
import './FollowedArtists.css';

interface FollowedArtistsProps {
  accessToken: string;
  artists: string[];
}

const FollowedArtists = ({ accessToken, artists }: FollowedArtistsProps) => {
  const [artistsData, setArtistsData] = useState<SpotifyArtistResponse[] | null>(null);

  const handleUnfollow = (artistId: string) => {
    const updatedArtistsData = artistsData?.filter(artist => artist.id !== artistId) || [];
    setArtistsData(updatedArtistsData);
  };

  useEffect(() => {
    batchGetArtists(accessToken, artists, setArtistsData);
  }, [accessToken, artists]);

  return (
    <div className="followed-artists">
      <h2 className="followed-artists__title">Artistas seguidos</h2>
      {artistsData ? (
        <ul className="followed-artists__list">
          {artistsData.map((artist) => (
            <li key={artist.id} className="followed-artists__item">
              <FollowedArtist
                data={artist}
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
