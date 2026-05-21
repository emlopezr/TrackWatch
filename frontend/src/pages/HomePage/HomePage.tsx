import { SetStateAction } from "react";
import { useUser } from "../../context/useUser";
import SpotifyArtistResponse from "../../types/spotify/SpotifyArtistResponse";
import ArtistList from "../../layout/ArtistList/ArtistList"
import FollowedArtists from "../../layout/FollowedArtists/FollowedArtists"
import SearchBar from "../../layout/SearchBar/SearchBar";
import TrackWatchUser from "../../types/trackwatch/TrackWatchUser";

interface HomePageProps {
  searching: boolean;
  artistsData: SpotifyArtistResponse[];
  setArtistsData: (data: SpotifyArtistResponse[]) => void;
  setSearching: (value: SetStateAction<boolean>) => void;
}

const HomePage = ({ searching, artistsData, setArtistsData, setSearching }: HomePageProps) => {
  const { userData } = useUser();

  const renderList = (searching: boolean, userData: TrackWatchUser | null) => {
    if (searching) {
      return <ArtistList title="Search Results" artistsData={artistsData} />
    } else if (userData) {
      const followedArtists = userData.followedArtists
      return <FollowedArtists followedArtists={followedArtists} />
    }
  }

  return (
    <>
      {userData && (
        <div className="search-container sticky-element">
          <SearchBar
            setArtistsData={setArtistsData}
            setSearching={setSearching}
          />
        </div>
      )}

      {renderList(searching, userData)}
    </>
  )
}

export default HomePage
