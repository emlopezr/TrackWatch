import { SetStateAction, useState } from "react";
import { SpotifyArtistResponse } from '../../types/spotify/SpotifyArtistResponse';
import { searchArtists } from "../../services/spotify/spotifySearch";
import searchIcon from "../../assets/svg/search.svg";
import './SearchArtists.css';
import Artist from "../Artist/Artist";
import { TrackifyArtist } from "../../types/trackify/TrackifyArtist";
import { TrackifyUser } from "../../types/trackify/TrackifyUser";

interface SearchArtistsProps {
  accessToken: string;
  followedArtists: TrackifyArtist[];
  searching: boolean;
  setUserData: (value: TrackifyUser) => void;
  setSearching: (value: SetStateAction<boolean>) => void;
}

const SearchArtists = ({ accessToken, searching, setSearching }: SearchArtistsProps) => {

  const [searchQuery, setSearchQuery] = useState('')
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [artistsData, setArtistsData] = useState<SpotifyArtistResponse[] | null>(null);

  const handleInputChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query) {
      setSearching(true);
    } else {
      setSearching(false);
      setArtistsData(null);
    }

    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    setSearchTimer(setTimeout(() => {
      if (searchQuery) {
        searchArtists(accessToken, query as string, setArtistsData);
      }
    }, 350));
  };

  return (
    <>
      <div className="search-artists">
        <img src={searchIcon} alt="Buscar" className="search-artists__icon" />
        <input
          type="text"
          className="search-artists__input"
          placeholder="Buscar artistas..."
          value={searchQuery}
          onChange={handleInputChange}
        />
      </div>

      {searching && artistsData && (
        <ul className="search-results">
          {artistsData.map((artist) => (
            <li key={artist.id} className="followed-artists__item">
              <Artist
                data={artist}
                allowedActions={['follow']}
                onFollow={() => {}}
                onUnfollow={() => {}}
              />
            </li>
          ))}
        </ul>
      )
      }
    </>
  );
}

export default SearchArtists