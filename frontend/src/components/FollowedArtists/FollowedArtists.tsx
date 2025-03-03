import { useEffect, useState } from 'react';
import { SpotifyArtistResponse } from '../../types/spotify/SpotifyArtistResponse';
import Artist from '../Artist/Artist';
import './FollowedArtists.css';
import { TrackWatchArtist } from '../../types/trackwatch/TrackWatchArtist';
import { useUser } from '../../context/useUser';
import { followArtist, unfollowArtist } from '../../services/trackwatch/trackwatchArtists';
import Spinner from '../Spinner/Spinner';
import { batchGetArtists } from '../../services/spotify/spotifyArtists';
import { PaginatedHeader } from '../PaginatedHeader/PaginatedHeader';

interface FollowedArtistsProps {
  accessToken: string;
  followedArtists: TrackWatchArtist[];
}

const FollowedArtists = ({ accessToken, followedArtists }: FollowedArtistsProps) => {
  const { userData, setUserData } = useUser();

  const [artistsData, setArtistsData] = useState<SpotifyArtistResponse[]>([]);
  const [loadingPage, setLoadingPage] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);

  useEffect(() => {
    const loadArtists = async () => {
      setLoadingPage(true);

      const data = await batchGetArtists(accessToken, followedArtists);

      setArtistsData(data);
      setLoadingPage(false);
    };

    loadArtists();
  }, [accessToken, followedArtists]);

  const totalPages = Math.ceil(artistsData.length / recordsPerPage);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
    if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = artistsData.slice(indexOfFirstRecord, indexOfLastRecord);

  const handleRecordsPerPageChange = (records: number) => {
    setRecordsPerPage(records);
    setCurrentPage(1);
  };

  if (followedArtists.length === 0) {
    return (
      <div className="followed-artists__empty">
        <p className="followed-artists__empty">
          Aún no sigues a ningún artista 😔 <br />
          Sigue tu primer artista, buscándolo en la barra de arriba!
        </p>
      </div>
    );
  }

  return (
    <div className="followed-artists">

      <PaginatedHeader
        title="Artistas Seguidos"
        currentPage={currentPage}
        totalPages={totalPages}
        recordsPerPage={recordsPerPage}
        totalRecords={followedArtists.length}
        onPageChange={setCurrentPage}
        onRecordsPerPageChange={handleRecordsPerPageChange}
      />

      {loadingPage ? (
        <Spinner />
      ) : (
        <ul className="followed-artists__list">
          {currentRecords.map((artist) => (
            <li key={artist.id} className="followed-artists__item">
              <Artist
                data={artist}
                isFollowed={true}
                onFollow={() => userData && followArtist(userData, setUserData, artist)}
                onUnfollow={() => userData && unfollowArtist(artist.id, userData, setUserData)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FollowedArtists;
