import { SpotifyArtistResponse } from "../../types/spotify/SpotifyArtistResponse";
import unlike from '../../assets/png/unlike.png';
import like from '../../assets/png/like.png';
import blank from '../../assets/png/blank.png';
import Tag from "../common/Tag/Tag";
import './Artist.css';

interface ArtistProps {
  data: SpotifyArtistResponse;
  allowedActions?: string[];
  onFollow: (id: string) => void | null;
  onUnfollow: (id: string) => void | null;
}

const Artist = ({ data, allowedActions, onFollow, onUnfollow }: ArtistProps) => {

  const handleUnfollow = () => {
    onUnfollow(data.id);
  }

  return (
    <div className="artist">
      <div className="artist__content">
        <a href={data.external_urls.spotify} target="_blank" rel="noreferrer">
          <img
            src={data.images[0]?.url || blank}
            alt={data.name}
            className="artist__image"
          />
        </a>
        <div className="artist__info">
          <h3 className="artist__name">{data.name}</h3>
          <div className="artist__tags">
            {data.genres.slice(0, 3).map((genre, index) => (
              <Tag key={index} text={genre} />
            ))}
          </div>
        </div>
      </div>

      {allowedActions?.includes('unfollow') && (
        <button
          onClick={handleUnfollow}
          className="artist__button artist__button--unfollow"
        >
          <img src={unlike} alt="Unfollow" className="artist__icon" />
        </button>
      )}

      {allowedActions?.includes('follow') && (
        <button
          onClick={() => onFollow(data.id)}
          className="artist__button artist__button--follow"
        >
          <img src={like} alt="Follow" className="artist__icon" />
        </button>
      )}
    </div>
  );
};

export default Artist;
