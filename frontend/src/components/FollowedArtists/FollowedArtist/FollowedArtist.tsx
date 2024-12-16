import { SpotifyArtistResponse } from "../../../types/spotify/SpotifyArtistResponse";
import unlike from '../../../assets/png/unlike.png';
import Tag from "../../common/Tag/Tag";
import './FollowedArtist.css';

interface FollowedArtistProps {
  data: SpotifyArtistResponse;
  onUnfollow: (id: string) => void;
}

const FollowedArtist = ({ data, onUnfollow }: FollowedArtistProps) => {

  const handleUnfollow = () => {
    onUnfollow(data.id);
  }

  return (
    <div className="followed-artist">
      <div className="followed-artist__content">
        <a href={data.external_urls.spotify} target="_blank" rel="noreferrer">
          <img
            src={data.images[0]?.url}
            alt={data.name}
            className="followed-artist__image"
          />
        </a>
        <div className="followed-artist__info">
          <h3 className="followed-artist__name">{data.name}</h3>
          <div className="followed-artist__tags">
            {data.genres.slice(0, 3).map((genre, index) => (
              <Tag key={index} text={genre} />
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleUnfollow}
        className="followed-artist__button"
      >
        <img src={unlike} alt="Unfollow" className="followed-artist__icon" />
      </button>
    </div>
  );
};

export default FollowedArtist;
