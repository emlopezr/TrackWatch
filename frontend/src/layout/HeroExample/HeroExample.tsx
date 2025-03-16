import musicIcon from '../../assets/svg/music.svg';
import discIcon from '../../assets/svg/disc.svg';
import playIcon from '../../assets/svg/play.svg';
import './HeroExample.css'

const HeroExample = () => {
  const followedArtists = [
    { id: 1, name: "Bad Bunny", img: "/webp/artist-01.webp" },
    { id: 2, name: "Kendrick Lamar", img: "/webp/artist-02.webp" },
    { id: 3, name: "Duki", img: "/webp/artist-03.webp" },
    { id: 4, name: "Milo j", img: "/webp/artist-04.webp" }
  ];

  const newSongs = [
    { id: 1, title: "DtMF", artist: "Bad Bunny", img: "/webp/song-01.webp" },
    { id: 2, title: "Not Like Us", artist: "Kendrick Lamar", img: "/webp/song-02.webp" },
    { id: 3, title: "Nueva Era", artist: "Duki, Myke Towers", img: "/webp/song-03.webp" },
    { id: 4, title: "OJALA", artist: "Milo j, Bhavi", img: "/webp/song-04.webp" }
  ];

  return (
    <div className="hero-example">
      <div className="followed-artists-box">
        <div className="box-header">
          <img src={musicIcon} alt="Music icon" className="box-header-icon icon-white" />
          <h3 className="box-title">Followed Artists</h3>
        </div>

        <div className="artist-list">
          {followedArtists.map(artist => (
            <div key={artist.id} className="artist-card">
              <img
                src={artist.img}
                alt={artist.name}
                className="artist-image"
              />
              <div className="artist-info">
                <p className="artist-name">{artist.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="new-releases-box">
        <div className="box-header">
          <img src={discIcon} alt="Disc icon" className="box-header-icon icon-white" />
          <h3 className="box-title">New Releases</h3>
        </div>

        <div className="songs-grid">
          {newSongs.map(song => (
            <div key={song.id} className="song-card">
              <div className="song-image-container">
                <img
                  src={song.img}
                  alt={song.title}
                  className="song-image"
                />
                <div className="song-overlay">
                  <button className="play-button">
                    <img src={playIcon} alt="Play" className="play-icon" />
                  </button>
                </div>
              </div>
              <p className="song-title">{song.title}</p>
              <p className="song-artist">{song.artist}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroExample;