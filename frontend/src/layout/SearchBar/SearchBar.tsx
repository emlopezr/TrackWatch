import { SetStateAction, useState, useImperativeHandle, forwardRef, useRef } from "react";
import { searchArtists } from "../../services/spotify/spotifySearch";
import searchIcon from "../../assets/svg/search.svg";
import closeIcon from "../../assets/svg/delete.svg";
import './SearchBar.css';
import SpotifyArtistResponse from "../../types/spotify/SpotifyArtistResponse";

interface SearchBarProps {
  setArtistsData: (data: SpotifyArtistResponse[]) => void;
  setSearching: (value: SetStateAction<boolean>) => void;
  debounceTime?: number; // Optional debounce time in milliseconds
}

export interface SearchBarHandle {
  clearSearch: () => void;
}

const SearchBar = forwardRef<SearchBarHandle, SearchBarProps>(({ setArtistsData, setSearching, debounceTime = 350 }, ref) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const isEmptySearch = useRef(false);

  const handleInputChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    const query = event.target.value;
    setSearchQuery(query);

    // Flag to track if search is empty to prevent race conditions
    isEmptySearch.current = !query || query === '';

    // If query is empty, immediately clear results and hide dropdown
    if (isEmptySearch.current) {
      setSearching(false);
      setArtistsData([]);
      return; // Exit early, no need to set a timer for empty search
    } else {
      setSearching(true);
    }

    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    setSearchTimer(setTimeout(() => {
      if (query && !isEmptySearch.current) {
        // Only call the API and update results if the search is not empty
        // This prevents race conditions where API results arrive after clearing
        searchArtists(query as string, (results) => {
          // Double-check we're not in an empty search state before updating results
          if (!isEmptySearch.current) {
            setArtistsData(results);
          }
        });
      }
    }, debounceTime));
  };

  const clearSearch = () => {
    setSearchQuery('');
    setArtistsData([]);
    setSearching(false);
    isEmptySearch.current = true;  // Mark search as empty
    if (searchTimer) clearTimeout(searchTimer);
  };
  
  useImperativeHandle(ref, () => ({
    clearSearch
  }));

  return (
    <div className="search-bar">
      <img src={searchIcon} alt="Search" className="search-bar__icon" />
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
});

export default SearchBar;
