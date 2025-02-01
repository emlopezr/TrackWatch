import { SpotifyArtistResponse } from "../../types/spotify/SpotifyArtistResponse";
import Artist from "../Artist/Artist";
import './SearchResults.css';
import { useUser } from "../../context/useUser";
import { followArtist, unfollowArtist } from "../../services/trackify/trackifyArtists";
import Spinner from "../Spinner/Spinner";

interface SearchResultsProps {
  artistsData: SpotifyArtistResponse[] | null;
}

const SearchResults = ({ artistsData }: SearchResultsProps) => {
  const { userData, setUserData } = useUser();

  if (!artistsData || artistsData.length === 0) {
    return <Spinner />;
  }

  return (
    <div className="search-results">
      <h2 className="search-results__title">Resultados</h2>
      <ul className="search-results__list">
        {artistsData.map((artist) => (
          <li key={artist.id} className="followed-artists__item">
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