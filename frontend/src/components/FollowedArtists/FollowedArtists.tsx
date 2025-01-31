import { useEffect, useState } from 'react';
import { batchGetArtists } from '../../services/spotify/spotifyArtists';
import { SpotifyArtistResponse } from '../../types/spotify/SpotifyArtistResponse';
import Artist from '../Artist/Artist';
import './FollowedArtists.css';
import { TrackifyArtist } from '../../types/trackify/TrackifyArtist';
import { useUser } from '../../context/useUser';
import { followArtist, unfollowArtist } from '../../services/trackify/trackifyArtists';

interface FollowedArtistsProps {
  accessToken: string;
  followedArtists: TrackifyArtist[];
}

const FollowedArtists = ({ accessToken, followedArtists }: FollowedArtistsProps) => {
  const { userData, setUserData } = useUser();

  const [artistsData, setArtistsData] = useState<SpotifyArtistResponse[] | null>(null);

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
                isFollowed={true}
                onFollow={() => userData && followArtist(userData, setUserData, artist) }
                onUnfollow={() => userData && unfollowArtist(artist.id, userData, setUserData) }
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
