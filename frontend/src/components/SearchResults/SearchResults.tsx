import { SpotifyArtistResponse } from "../../types/spotify/SpotifyArtistResponse";
import Artist from "../Artist/Artist";
import './SearchResults.css';
import { useUser } from "../../context/useUser";
import { followArtist, unfollowArtist } from "../../services/trackwatch/trackwatchArtists";
import Spinner from "../Spinner/Spinner";
import { useEffect, useState } from "react";
import left from '../../assets/png/left.png';
import right from '../../assets/png/right.png';

interface SearchResultsProps {
  artistsData: SpotifyArtistResponse[] | null;
}

const SearchResults = ({ artistsData }: SearchResultsProps) => {
  const { userData, setUserData } = useUser();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);

  const totalPages = artistsData ? Math.ceil(artistsData.length / recordsPerPage) : 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [artistsData]);

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

  if (!artistsData || artistsData.length === 0) {
    return <Spinner />;
  }

  return (
    <div className="search-results">

      <div className="search-results-header">
        <div className="search-results-header__left">
          <h2 className="search-results__title">Resultados</h2>

          {totalPages > 1 && (
            <div className="pagination-inline">
              <button onClick={prevPage} disabled={currentPage === 1}>
                <img src={left} alt="Prev" className="pagination-inline__icon" />
              </button>
              <span>
                {currentPage} de {totalPages}
              </span>
              <button onClick={nextPage} disabled={currentPage === totalPages}>
                <img src={right} alt="Next" className="pagination-inline__icon" />
              </button>
            </div>
          )}
        </div>

        <div className="records-per-page">
          <label htmlFor="recordsPerPage">Mostrar:</label>
          <select id="recordsPerPage" value={recordsPerPage} onChange={handleRecordsPerPageChange}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <ul className="search-results__list">
        {currentRecords.map((artist) => (
          <li key={artist.id} className="search-results__item">
            <Artist
              data={artist}
              isFollowed={userData?.followedArtists.some((followedArtist) => followedArtist.id === artist.id) || false}
              onFollow={() => userData && followArtist(userData, setUserData, artist)}
              onUnfollow={() => userData && unfollowArtist(artist.id, userData, setUserData)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResults;