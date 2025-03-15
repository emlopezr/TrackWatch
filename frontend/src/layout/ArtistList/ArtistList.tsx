import { useEffect, useState } from 'react';
import SpotifyArtistResponse from '../../types/spotify/SpotifyArtistResponse';
import Artist from '../../components/Artist/Artist';
import Spinner from '../../components/Spinner/Spinner';
import { useUser } from '../../context/useUser';
import { followArtist, unfollowArtist } from '../../services/trackwatch/trackwatchArtists';
import { PaginatedHeader } from '../PaginatedHeader/PaginatedHeader';
import './ArtistList.css';

interface ArtistListProps {
  title: string;
  artistsData: SpotifyArtistResponse[] | null;
  isLoading?: boolean;
  emptyStateMessage?: React.ReactNode;
}

const ArtistList = ({
  title,
  artistsData,
  isLoading = false,
  emptyStateMessage
}: ArtistListProps) => {
  const { userData, setUserData } = useUser();
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(15);

  const totalItems = artistsData?.length || 0;
  const totalPages = totalItems ? Math.ceil(totalItems / recordsPerPage) : 0;

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [artistsData]);

  // Handle case where current page is out of bounds
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

  // Show empty state if no artists
  if (!artistsData || artistsData.length === 0) {
    if (isLoading) {
      return <Spinner />;
    }
    
    if (emptyStateMessage) {
      return <div className="artist-list__empty">{emptyStateMessage}</div>;
    }
    
    return <Spinner />;
  }

  return (
    <div className="artist-list">
      <PaginatedHeader
        title={title}
        currentPage={currentPage}
        totalPages={totalPages}
        recordsPerPage={recordsPerPage}
        totalRecords={totalItems}
        onPageChange={setCurrentPage}
        onRecordsPerPageChange={handleRecordsPerPageChange}
      />

      {isLoading ? (
        <Spinner />
      ) : (
        <ul className="artist-list__list">
          {currentRecords.map((artist) => (
            <li key={artist.id} className="artist-list__item">
              <Artist
                data={artist}
                isFollowed={userData?.followedArtists.some((followedArtist) => followedArtist.id === artist.id) || false}
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

export default ArtistList; 