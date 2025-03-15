import musicIcon from '../../assets/svg/music.svg';
import discIcon from '../../assets/svg/disc.svg';
import playIcon from '../../assets/svg/play.svg';
import './HeroExample.css'

const HeroExample = () => {
  const followedArtists = [
    { id: 1, name: "Bad Bunny", img: "https://i.scdn.co/image/ab6761610000f17881f47f44084e0a09b5f0fa13" },
    { id: 2, name: "Kendrick Lamar", img: "https://i.scdn.co/image/ab6761610000f17839ba6dcd4355c03de0b50918" },
    { id: 3, name: "Duki", img: "https://i.scdn.co/image/ab6761610000f1780f682e8d99b232d621a25c3b" },
    { id: 4, name: "Milo j", img: "https://i.scdn.co/image/ab6761610000f1785b2ed98931971ce81f0f22e7" }
  ];

  const newSongs = [
    { id: 1, title: "DtMF", artist: "Bad Bunny", img: "https://i.scdn.co/image/ab67616d00001e02bbd45c8d36e0e045ef640411" },
    { id: 2, title: "Not Like Us", artist: "Kendrick Lamar", img: "https://i.scdn.co/image/ab67616d00001e021ea0c62b2339cbf493a999ad" },
    { id: 3, title: "Nueva Era", artist: "Duki, Myke Towers", img: "https://i.scdn.co/image/ab67616d00001e02ee67e1ebdbc7a30772972a48" },
    { id: 4, title: "OJALA", artist: "Milo j, Bhavi", img: "https://i.scdn.co/image/ab67616d00001e0299a66dbad79409a0ce37ae7b" }
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