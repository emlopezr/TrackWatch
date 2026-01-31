import { useState, useEffect, type ReactNode } from 'react';
import { useTokenManager } from '../../hooks/useTokenManager';
import {
  getOwnedPlaylists,
  scanGhostTracks,
  removeGhostTracks
} from '../../services/trackwatch/ghostTracks';
import type {
  Playlist,
  ScanResult,
  RemoveResponse
} from '../../types/trackwatch/GhostTrack';
import PlaylistSelector from '../../components/PlaylistSelector/PlaylistSelector';
import GhostTrackList from '../../components/GhostTrackList/GhostTrackList';
import Spinner from '../../components/Spinner/Spinner';
import Modal from '../../components/Modal/Modal';
import './GhostTracksPage.css';

type PagePhase = 'select' | 'results';

const GhostTracksPage = () => {
  const { accessToken } = useTokenManager();

  // Phase state
  const [phase, setPhase] = useState<PagePhase>('select');

  // Playlist selection state
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<Set<string>>(new Set());
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);

  // Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Track selection state
  const [selectedTrackKeys, setSelectedTrackKeys] = useState<Set<string>>(new Set());

  // Removal state
  const [isRemoving, setIsRemoving] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<{
    title: string;
    content: ReactNode;
    type: 'success' | 'error' | 'info';
  }>({ title: '', content: '', type: 'info' });

  // Load playlists on mount
  useEffect(() => {
    if (accessToken) {
      loadPlaylists();
    }
  }, [accessToken]);

  const loadPlaylists = async () => {
    if (!accessToken) return;
    setIsLoadingPlaylists(true);
    try {
      const response = await getOwnedPlaylists(accessToken);
      setPlaylists(response.playlists);
    } catch (error) {
      // Handle token expiration
      console.error('Failed to load playlists:', error);
      setModalData({
        title: 'Error',
        content: 'Failed to load playlists. Please try refreshing the page.',
        type: 'error'
      });
      setShowModal(true);
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const handleScan = async () => {
    if (!accessToken || selectedPlaylistIds.size === 0) return;

    setIsScanning(true);
    setScanResult(null);
    setSelectedTrackKeys(new Set());

    try {
      const result = await scanGhostTracks(accessToken, {
        playlistIds: Array.from(selectedPlaylistIds),
        countryCode: 'CO' // Default country code
      });

      setScanResult(result);
      setPhase('results');

      // T024: Show message if no ghost tracks found
      if (result.totalGhostTracks === 0) {
        setModalData({
          title: 'All Clear!',
          content: 'No ghost tracks found in the selected playlists. All your tracks are playable!',
          type: 'success'
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error('Scan failed:', error);
      setModalData({
        title: 'Scan Failed',
        content: 'Failed to scan playlists. Please try again.',
        type: 'error'
      });
      setShowModal(true);
    } finally {
      setIsScanning(false);
    }
  };

  // Global select all / deselect all
  const handleSelectAllTracks = () => {
    if (!scanResult) return;
    const allKeys = new Set<string>();
    scanResult.playlists.forEach(playlist => {
      playlist.ghostTracks.forEach(track => {
        allKeys.add(`${track.playlistId}:${track.trackUri}`);
      });
    });
    setSelectedTrackKeys(allKeys);
  };

  const handleDeselectAllTracks = () => {
    setSelectedTrackKeys(new Set());
  };

  // Remove selected tracks
  const handleRemove = async () => {
    if (!accessToken || selectedTrackKeys.size === 0 || !scanResult) return;

    // Warn if all tracks in a playlist are selected
    const playlistsToEmpty: string[] = [];
    scanResult.playlists.forEach(playlist => {
      const playlistTrackKeys = playlist.ghostTracks.map(t => `${t.playlistId}:${t.trackUri}`);
      const allSelected = playlistTrackKeys.every(key => selectedTrackKeys.has(key));
      if (allSelected && playlist.ghostTracks.length > 0) {
        // Check if all tracks in playlist are ghost tracks
        const playlistInfo = playlists.find(p => p.id === playlist.playlistId);
        if (playlistInfo && playlistInfo.trackCount === playlist.ghostTracks.length) {
          playlistsToEmpty.push(playlist.playlistName);
        }
      }
    });

    if (playlistsToEmpty.length > 0) {
      const confirmEmpty = window.confirm(
        `Warning: Removing all selected tracks will empty the following playlist(s):\n\n${playlistsToEmpty.join('\n')}\n\nDo you want to continue?`
      );
      if (!confirmEmpty) return;
    }

    setIsRemoving(true);

    try {
      // Group selected tracks by playlist
      const removalsByPlaylist = new Map<string, { playlistId: string; playlistName: string; trackUris: string[] }>();

      selectedTrackKeys.forEach(key => {
        const colonIndex = key.indexOf(':');
        const playlistId = key.substring(0, colonIndex);
        const trackUri = key.substring(colonIndex + 1);

        if (!removalsByPlaylist.has(playlistId)) {
          const playlist = scanResult.playlists.find(p => p.playlistId === playlistId);
          removalsByPlaylist.set(playlistId, {
            playlistId,
            playlistName: playlist?.playlistName || 'Unknown',
            trackUris: []
          });
        }
        removalsByPlaylist.get(playlistId)!.trackUris.push(trackUri);
      });

      const response: RemoveResponse = await removeGhostTracks(accessToken, {
        removals: Array.from(removalsByPlaylist.values())
      });

      // Show summary modal
      const summaryContent = (
        <div className="ghost-tracks-page__removal-summary">
          <p><strong>Total removed:</strong> {response.totalRemoved} tracks</p>
          {response.totalFailed > 0 && (
            <p className="ghost-tracks-page__removal-failed">
              <strong>Failed:</strong> {response.totalFailed} tracks
            </p>
          )}
          <div className="ghost-tracks-page__removal-details">
            {response.results.map(result => (
              <div key={result.playlistId} className="ghost-tracks-page__removal-playlist">
                <span className="ghost-tracks-page__removal-playlist-name">{result.playlistName}</span>
                <span className="ghost-tracks-page__removal-playlist-count">
                  {result.removedCount} removed
                  {result.failedCount > 0 && `, ${result.failedCount} failed`}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

      setModalData({
        title: response.totalFailed > 0 ? 'Removal Partially Complete' : 'Removal Complete',
        content: summaryContent,
        type: response.totalFailed > 0 ? 'info' : 'success'
      });
      setShowModal(true);

    } catch (error) {
      console.error('Removal failed:', error);
      setModalData({
        title: 'Removal Failed',
        content: 'Failed to remove tracks. Please try again.',
        type: 'error'
      });
      setShowModal(true);
    } finally {
      setIsRemoving(false);
    }
  };

  // Return to playlist selection on modal dismiss
  const handleModalClose = () => {
    setShowModal(false);
    // If we were in results phase and just completed removal, go back to select
    if (phase === 'results' && !isScanning && !isRemoving) {
      setPhase('select');
      setSelectedPlaylistIds(new Set());
      setScanResult(null);
      setSelectedTrackKeys(new Set());
      // Reload playlists to get updated track counts
      loadPlaylists();
    }
  };

  const handleBackToSelect = () => {
    setPhase('select');
    setScanResult(null);
    setSelectedTrackKeys(new Set());
  };

  // Calculate selection count
  const totalGhostTracks = scanResult?.totalGhostTracks || 0;
  const selectedCount = selectedTrackKeys.size;

  return (
    <>
      <h1 className="ghost-tracks-page__title">Ghost Tracks Cleaner</h1>

      {phase === 'select' && (
        <div className="ghost-tracks-page__select-phase">
          {isLoadingPlaylists ? (
            <div className="ghost-tracks-page__loading">
              <Spinner />
              <p>Loading your playlists...</p>
            </div>
          ) : (
            <>
              <p className="ghost-tracks-page__description">
                Find and remove unplayable tracks from your playlists. Select the playlists you want to scan for ghost tracks.
              </p>

              <PlaylistSelector
                playlists={playlists}
                selectedIds={selectedPlaylistIds}
                onSelectionChange={setSelectedPlaylistIds}
                disabled={isScanning}
              />

              <div className="ghost-tracks-page__actions">
                <button
                  className="ghost-tracks-page__btn ghost-tracks-page__btn--primary"
                  onClick={handleScan}
                  disabled={selectedPlaylistIds.size === 0 || isScanning}
                >
                  {isScanning ? 'Scanning...' : 'Scan for Ghost Tracks'}
                </button>
              </div>
            </>
          )}

          {/* Loading overlay during scan */}
          {isScanning && (
            <div className="ghost-tracks-page__loading-overlay">
              <div className="ghost-tracks-page__loading-message">
                Scanning playlists...
              </div>
              <div className="ghost-tracks-page__loading-submessage">
                This may take a while for large playlists...
              </div>
              <Spinner />
            </div>
          )}
        </div>
      )}

      {phase === 'results' && scanResult && (
        <div className="ghost-tracks-page__results-phase">
          <div className="ghost-tracks-page__results-header">
            <button
              className="ghost-tracks-page__btn ghost-tracks-page__btn--secondary"
              onClick={handleBackToSelect}
              disabled={isRemoving}
            >
              ← Back to Playlist Selection
            </button>

            <div className="ghost-tracks-page__results-summary">
              <span className="ghost-tracks-page__results-count">
                Found {totalGhostTracks} ghost track{totalGhostTracks !== 1 ? 's' : ''}
              </span>
              <span className="ghost-tracks-page__scan-time">
                Scanned in {(scanResult.scanDurationMs / 1000).toFixed(1)}s
              </span>
            </div>
          </div>

          {totalGhostTracks > 0 && (
            <>
              {/* Global selection controls */}
              <div className="ghost-tracks-page__selection-controls">
                <div className="ghost-tracks-page__selection-info">
                  {/* Selection count */}
                  <span>{selectedCount} of {totalGhostTracks} selected</span>
                </div>
                <div className="ghost-tracks-page__selection-actions">
                  <button
                    className="ghost-tracks-page__btn ghost-tracks-page__btn--secondary"
                    onClick={handleSelectAllTracks}
                    disabled={isRemoving}
                  >
                    Select All
                  </button>
                  <button
                    className="ghost-tracks-page__btn ghost-tracks-page__btn--secondary"
                    onClick={handleDeselectAllTracks}
                    disabled={isRemoving}
                  >
                    Deselect All
                  </button>
                  {/* T034: Remove button */}
                  <button
                    className="ghost-tracks-page__btn ghost-tracks-page__btn--danger"
                    onClick={handleRemove}
                    disabled={selectedCount === 0 || isRemoving}
                  >
                    {isRemoving ? 'Removing...' : `Remove Selected (${selectedCount})`}
                  </button>
                </div>
              </div>

              <GhostTrackList
                scanResults={scanResult.playlists}
                selectedTrackKeys={selectedTrackKeys}
                onSelectionChange={setSelectedTrackKeys}
                selectionEnabled={true}
              />
            </>
          )}

          {/* Loading overlay during removal */}
          {isRemoving && (
            <div className="ghost-tracks-page__loading-overlay">
              <div className="ghost-tracks-page__loading-message">
                Removing selected tracks...
              </div>
              <Spinner />
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={modalData.title}
        content={modalData.content}
        type={modalData.type}
        primaryButtonText="OK"
      />
    </>
  );
};

export default GhostTracksPage;