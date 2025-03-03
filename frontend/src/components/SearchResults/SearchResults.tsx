import { SpotifyArtistResponse } from "../../types/spotify/SpotifyArtistResponse";
import Artist from "../Artist/Artist";
import './SearchResults.css';
import { useUser } from "../../context/useUser";
import { followArtist, unfollowArtist } from "../../services/trackwatch/trackwatchArtists";
import Spinner from "../Spinner/Spinner";
import { useEffect, useState } from "react";
import { PaginatedHeader } from '../PaginatedHeader/PaginatedHeader';

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

  const handleRecordsPerPageChange = (records: number) => {
    setRecordsPerPage(records);
    setCurrentPage(1);
  };

  if (!artistsData || artistsData.length === 0) {
    return <Spinner />;
  }

  return (
    <div className="search-results">
      <PaginatedHeader
        title="Resultados de búsqueda"
        currentPage={currentPage}
        totalPages={totalPages}
        recordsPerPage={recordsPerPage}
        totalRecords={artistsData.length}
        onPageChange={setCurrentPage}
        onRecordsPerPageChange={handleRecordsPerPageChange}
      />

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