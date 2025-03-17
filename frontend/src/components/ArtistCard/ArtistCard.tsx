import SpotifyArtistResponse from "../../types/spotify/SpotifyArtistResponse";
import blank from '../../assets/png/blank.png';
import Tag from "../Tag/Tag";
import './ArtistCard.css';

interface ArtistCardProps {
  data: SpotifyArtistResponse;
  onClick: (artist: SpotifyArtistResponse) => void;
}

const ArtistCard = ({ data, onClick }: ArtistCardProps) => {
  return (
    <div className="artist-card" onClick={() => onClick(data)}>
      <div className="artist-card__content">
        <div className="artist-card__image-container">
          <img
            src={data.images[0]?.url || blank}
            alt={data.name}
            className="artist-card__image"
          />
        </div>
        <div className="artist-card__info">
          <h3 className="artist-card__name">{data.name}</h3>
          <div className="artist-card__tags">
            {data.genres.slice(0, 3).map((genre, index) => (
              <Tag key={index} text={genre} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistCard;
