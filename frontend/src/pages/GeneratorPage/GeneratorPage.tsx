import { useState, useRef, type ReactNode } from 'react';
import { useTokenManager } from '../../hooks/useTokenManager';
import SearchBar, { SearchBarHandle } from '../../layout/SearchBar/SearchBar';
import type SpotifyArtistResponse from '../../types/spotify/SpotifyArtistResponse';
import './GeneratorPage.css';
import blank from '../../assets/png/blank.png';
import { useUser } from '../../context/useUser';
import { generatePlaylist, GeneratePlaylistResponse } from '../../services/trackwatch/playlistGeneration';
import Spinner from '../../components/Spinner/Spinner';
import Modal from '../../components/Modal/Modal';
import spotifyLogo from '../../assets/svg/spotify.svg';

const GeneratorPage = () => {
  const { accessToken } = useTokenManager();
  const [artistsData, setArtistsData] = useState<SpotifyArtistResponse[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<SpotifyArtistResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<{
    title: string;
    content: ReactNode;
    type: 'success' | 'error' | 'info';
    secondaryButtonText?: string;
    secondaryButtonIcon?: ReactNode;
    onSecondaryAction?: () => void;
  }>({ title: '', content: '', type: 'info' });

  // Reference to the SearchBar component
  const searchBarRef = useRef<SearchBarHandle>(null);
  const { userData } = useUser();

  const handleClearArtist = () => {
    setSelectedArtist(null);
  };

  const handleArtistSelect = (artist: SpotifyArtistResponse) => {
    setSelectedArtist(artist);
    setArtistsData([]);
    setShowResults(false);

    // Clear the search bar when artist is selected
    if (searchBarRef.current) {
      searchBarRef.current.clearSearch();
    }
  };

  const handleGeneratePlaylist = async () => {
    if (!selectedArtist || !userData || !accessToken) {
      setModalData({
        title: 'Error',
        content: 'Missing required information to generate playlist',
        type: 'error'
      });
      setShowModal(true);
      return;
    }

    setIsGenerating(true);

    try {
      const response: GeneratePlaylistResponse = await generatePlaylist(
        accessToken,
        userData.id,
        selectedArtist.id
      );

      const link = `https://open.spotify.com/playlist/${response.playlistId}`;

      // Show success modal
      setModalData({
        title: '¡Playlist creada!',
        content: (
          <>
            Playlist has been successfully generated! Enjoy all the tracks from {selectedArtist.name}! :)
            <br />
          </>
        ),
        type: 'success',
        secondaryButtonText: 'Ver en Spotify',
        secondaryButtonIcon: <img src={spotifyLogo} alt="Spotify" />,
        onSecondaryAction: () => window.open(link, '_blank')
      });
      setShowModal(true);

      handleClearArtist();
    } catch {
      setModalData({
        title: 'Error',
        content: 'Failed to generate playlist. Please try again.',
        type: 'error'
      });
      setShowModal(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <h1 className="generator-page__title">Playlist Generator</h1>

      <div className="generator-page__search-container">
        <SearchBar
          ref={searchBarRef}
          accessToken={accessToken || ''}
          debounceTime={150}
          setArtistsData={(data) => {
            setArtistsData(data);
            setShowResults(data.length > 0);
          }}
          setSearching={(value) => {
            if (!value) { setShowResults(false); }
          }}
        />

        {showResults && (
          <div className="generator-page__search-results">
            {artistsData.slice(0, 10).map((artist) => (
              <div
                key={artist.id}
                className="generator-page__search-result-item"
                onClick={() => handleArtistSelect(artist)}
              >
                <div className="generator-page__search-result-image">
                  <img
                    src={artist.images[0]?.url || blank}
                    alt={artist.name}
                  />
                </div>
                <div className="generator-page__search-result-info">
                  <div className="generator-page__search-result-name">{artist.name}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="generator-page__selected-artist">
        {isGenerating && (
          <div className="generator-page__loading-overlay">
            <div className="generator-page__loading-message">
              Generating playlist...
            </div>
            <div className="generator-page__loading-submessage">
              This may take a while as we process all the artist's tracks...
            </div>
            <Spinner />
          </div>
        )}
        <div className="generator-page__artist-image-large">
          {selectedArtist ? (
            <a
              href={selectedArtist.external_urls.spotify}
              target="_blank"
              rel="noreferrer"
              className="generator-page__artist-image-link"
            >
              <img
                src={selectedArtist.images[0]?.url}
                alt={selectedArtist.name}
              />
              <span className="generator-page__artist-spotify-badge">
                <img src={spotifyLogo} alt="Spotify" />
              </span>
            </a>
          ) : (
            <img
              src={blank}
              alt="No artist selected"
            />
          )}
        </div>

        <div className="generator-page__artist-info">
          {selectedArtist ? (
            <>
              <h2 className="generator-page__artist-title">
                All of: {selectedArtist.name}
              </h2>

              <p className="generator-page__artist-description">
                Do you want to generate a playlist with every track from {selectedArtist.name}?
              </p>

              <div className="generator-page__actions">
                <button
                  className="generator-page__button generator-page__button--cancel"
                  onClick={handleClearArtist}
                  disabled={isGenerating}
                >
                  Cancel
                </button>
                <button
                  className="generator-page__button generator-page__button--generate"
                  onClick={handleGeneratePlaylist}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate Playlist'}
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="generator-page__artist-title">
                No artist selected
              </h2>
              <p className="generator-page__artist-description">
                Search for an artist above and click on their result to select them for playlist generation.
              </p>
            </>
          )}
        </div>
      </div>
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalData.title}
        content={modalData.content}
        type={modalData.type}
        primaryButtonText="OK"
        secondaryButtonText={modalData.secondaryButtonText}
        secondaryButtonIcon={modalData.secondaryButtonIcon}
        onSecondaryAction={modalData.onSecondaryAction}
      />
    </>
  );
};

export default GeneratorPage;
