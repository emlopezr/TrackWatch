import { SetStateAction, useState } from "react";
import { searchArtists } from "../../services/spotify/spotifySearch";
import searchIcon from "../../assets/svg/search.svg";
import closeIcon from "../../assets/png/delete.png";
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
      if (query) {  // usamos "query" en lugar de "searchQuery" para asegurarnos de tener el valor actualizado
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
      <img src={searchIcon} alt="Buscar" className="search-bar__icon" />
      <input
        type="text"
        className="search-bar__input"
        placeholder="Buscar artistas..."
        value={searchQuery}
        onChange={handleInputChange}
      />
      {searchQuery && (
        <button onClick={clearSearch} className="search-bar__clear-btn">
          <img src={closeIcon} alt="Borrar" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
