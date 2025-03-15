import { SetStateAction, useState } from "react";
import { searchArtists } from "../../services/spotify/spotifySearch";
import searchIcon from "../../assets/svg/search.svg";
import closeIcon from "../../assets/svg/delete.svg";
import './SearchBar.css';
import { SpotifyArtistResponse } from "../../types/spotify/SpotifyArtistResponse";

interface SearchBarProps {
  accessToken: string;
  setArtistsData: (data: SpotifyArtistResponse[]) => void;
  setSearching: (value: SetStateAction<boolean>) => void;
}

const SearchBar = ({ accessToken, setArtistsData, setSearching }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query) {
      setSearching(true);
    } else {
      setSearching(false);
      setArtistsData([]);
    }

    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    setSearchTimer(setTimeout(() => {
      if (query) {
        searchArtists(accessToken, query as string, setArtistsData);
      }
    }, 350));
  };

  const clearSearch = () => {
    setSearchQuery('');
    setArtistsData([]);
    setSearching(false);
    if (searchTimer) clearTimeout(searchTimer);
  };

  return (
    <div className="search-bar">
      <img src={searchIcon} alt="Search" className="search-bar__icon icon-white" />
      <input
        type="text"
        className="search-bar__input"
        placeholder="Search artists..."
        value={searchQuery}
        onChange={handleInputChange}
      />
      {searchQuery && (
        <button onClick={clearSearch} className="search-bar__clear-btn">
          <img src={closeIcon} alt="Clear" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
