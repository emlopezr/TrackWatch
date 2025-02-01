import { useEffect, useState } from 'react';
import { batchGetArtists } from '../../services/spotify/spotifyArtists';
import { SpotifyArtistResponse } from '../../types/spotify/SpotifyArtistResponse';
import Artist from '../Artist/Artist';
import './FollowedArtists.css';
import { TrackifyArtist } from '../../types/trackify/TrackifyArtist';
import { useUser } from '../../context/useUser';
import { followArtist, unfollowArtist } from '../../services/trackify/trackifyArtists';
import left from '../../assets/png/left.png';
import right from '../../assets/png/right.png';
import Spinner from '../Spinner/Spinner';

interface FollowedArtistsProps {
  accessToken: string;
  followedArtists: TrackifyArtist[];
}

const FollowedArtists = ({ accessToken, followedArtists }: FollowedArtistsProps) => {
  const { userData, setUserData } = useUser();

  const [artistsData, setArtistsData] = useState<SpotifyArtistResponse[] | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);

  useEffect(() => {
    batchGetArtists(accessToken, followedArtists, setArtistsData);
  }, [accessToken, followedArtists]);

  const totalPages = artistsData ? Math.ceil(artistsData.length / recordsPerPage) : 0;

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
  const currentRecords = artistsData ? artistsData.slice(indexOfFirstRecord, indexOfLastRecord) : [];

  const nextPage = () => { if (currentPage < totalPages) setCurrentPage((prev) => prev + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage((prev) => prev - 1); };

  const handleRecordsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRecordsPerPage = parseInt(e.target.value);
    setRecordsPerPage(newRecordsPerPage);
    setCurrentPage(1);
  };

  if (followedArtists.length === 0) {
    return (
      <div className="followed-artists__empty">
        <p className="followed-artists__empty">
          Aún no sigues a ningún artista 😔 <br />
          Busca artistas en la barra de búsqueda!
        </p>
      </div>
    );
  }

  return (
    <div className="followed-artists">
      <div className="followed-artists-header">
        <div className="followed-artists-header__left">
          <h2 className="followed-artists__title">Artistas Seguidos</h2>

          {totalPages > 1 && (
          <div className="pagination-inline">
            <button onClick={prevPage} disabled={currentPage === 1}>
              <img src={left} alt="Unfollow" className="pagination-inline__icon" />
            </button>
            <span>
              {currentPage} de {totalPages}
            </span>
            <button onClick={nextPage} disabled={currentPage === totalPages}>
              <img src={right} alt="Unfollow" className="pagination-inline__icon" />
            </button>
          </div>
          )}
        </div>

        <div className="followed-artists-header__right">
          <div className="records-per-page">
            <label htmlFor="recordsPerPage">Mostrar:</label>
            <select
              id="recordsPerPage"
              value={recordsPerPage}
              onChange={handleRecordsPerPageChange}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={artistsData?.length}>Todos</option>
            </select>
          </div>
        </div>
      </div>

      {artistsData ? (
        <>
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
        </>
      ) : (
        <Spinner/>
      )}
    </div>
  );
};

export default FollowedArtists;
