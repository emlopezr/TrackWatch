import { SetStateAction } from "react";
import { useUser } from "../../context/useUser";
import SpotifyArtistResponse from "../../types/spotify/SpotifyArtistResponse";
import ArtistList from "../ArtistList/ArtistList"
import FollowedArtists from "../FollowedArtists/FollowedArtists"
import SearchBar from "../SearchBar/SearchBar";
import TrackWatchUser from "../../types/trackwatch/TrackWatchUser";

interface HomePageProps {
  accessToken: string | null;
  searching: boolean;
  artistsData: SpotifyArtistResponse[];
  setArtistsData: (data: SpotifyArtistResponse[]) => void;
  setSearching: (value: SetStateAction<boolean>) => void;
}

const HomePage = ({ accessToken, searching, artistsData, setArtistsData, setSearching }: HomePageProps) => {
  const { userData } = useUser();

  const renderList = (searching: boolean, userData: TrackWatchUser | null, accessToken: string | null) => {
    if (searching) {
      return <ArtistList title="Search Results" artistsData={artistsData} />
    } else if (userData && accessToken) {
      const followedArtists = userData.followedArtists
      return <FollowedArtists accessToken={accessToken} followedArtists={followedArtists} />
    }
  }

  return (
    <>
      {accessToken && (
        <div className="search-container sticky-element">
          <SearchBar
            accessToken={accessToken}
            setArtistsData={setArtistsData}
            setSearching={setSearching}
          />
        </div>
      )}

      {renderList(searching, userData, accessToken)}
    </>
  )
}

export default HomePage