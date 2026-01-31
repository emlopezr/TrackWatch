import type { PlaylistScanResult, GhostTrack, Playlist } from '../../types/trackwatch/GhostTrack';
import blank from '../../assets/png/blank.png';
import './GhostTrackList.css';

interface GhostTrackListProps {
  scanResults: PlaylistScanResult[];
  playlists: Playlist[];
  selectedTrackKeys: Set<string>;
  onSelectionChange: (keys: Set<string>) => void;
  selectionEnabled?: boolean;
}

const GhostTrackList = ({
  scanResults,
  playlists,
  selectedTrackKeys,
  onSelectionChange,
  selectionEnabled = false
}: GhostTrackListProps) => {

  const getPlaylistImage = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    return playlist?.imageUrl || blank;
  };

  const getTrackKey = (track: GhostTrack) => `${track.playlistId}:${track.trackUri}`;

  const handleTrackToggle = (track: GhostTrack) => {
    if (!selectionEnabled) return;
    const key = getTrackKey(track);
    const newSelection = new Set(selectedTrackKeys);
    if (newSelection.has(key)) {
      newSelection.delete(key);
    } else {
      newSelection.add(key);
    }
    onSelectionChange(newSelection);
  };

  const handleSelectAllPlaylist = (playlist: PlaylistScanResult) => {
    if (!selectionEnabled) return;
    const newSelection = new Set(selectedTrackKeys);
    playlist.ghostTracks.forEach(track => {
      newSelection.add(getTrackKey(track));
    });
    onSelectionChange(newSelection);
  };

  const handleDeselectAllPlaylist = (playlist: PlaylistScanResult) => {
    if (!selectionEnabled) return;
    const newSelection = new Set(selectedTrackKeys);
    playlist.ghostTracks.forEach(track => {
      newSelection.delete(getTrackKey(track));
    });
    onSelectionChange(newSelection);
  };

  const getPlaylistSelectedCount = (playlist: PlaylistScanResult) => {
    return playlist.ghostTracks.filter(t => selectedTrackKeys.has(getTrackKey(t))).length;
  };

  const totalGhostTracks = scanResults.reduce((sum, r) => sum + r.ghostTracks.length, 0);

  if (totalGhostTracks === 0) {
    return null;
  }

  return (
    <div className="ghost-track-list">
      {scanResults.map((result) => {
        if (result.ghostTracks.length === 0) {
          return null;
        }

        const selectedCount = getPlaylistSelectedCount(result);

        return (
          <div key={result.playlistId} className="ghost-track-list__playlist">
            <div className="ghost-track-list__playlist-header">
              <div className="ghost-track-list__playlist-info">
                <img
                  src={getPlaylistImage(result.playlistId)}
                  alt={result.playlistName}
                  className="ghost-track-list__playlist-image"
                />
                <div className="ghost-track-list__playlist-details">
                  <h4 className="ghost-track-list__playlist-name">{result.playlistName}</h4>
                    <span className="ghost-track-list__playlist-count">
                    {result.ghostTracks.length} ghost track{result.ghostTracks.length !== 1 ? 's' : ''} found
                    {selectionEnabled && selectedCount > 0 && (
                      <span className="ghost-track-list__selected-badge">
                        {selectedCount} selected
                      </span>
                    )}
                  </span>
                </div>
              </div>
              {selectionEnabled && (
                <div className="ghost-track-list__playlist-actions">
                  <button
                    className="ghost-track-list__btn ghost-track-list__btn--select-all"
                    onClick={() => handleSelectAllPlaylist(result)}
                  >
                    Select All
                  </button>
                  <button
                    className="ghost-track-list__btn ghost-track-list__btn--deselect-all"
                    onClick={() => handleDeselectAllPlaylist(result)}
                  >
                    Deselect All
                  </button>
                </div>
              )}
            </div>

            <div className="ghost-track-list__tracks">
              {result.ghostTracks.map((track) => {
                const isSelected = selectedTrackKeys.has(getTrackKey(track));
                return (
                  <div
                    key={getTrackKey(track)}
                    className={`ghost-track-list__track ${selectionEnabled ? 'selectable' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleTrackToggle(track)}
                  >
                    {selectionEnabled && (
                      <input
                        type="checkbox"
                        className="ghost-track-list__checkbox"
                        checked={isSelected}
                        onChange={() => handleTrackToggle(track)}
                      />
                    )}
                    <div className="ghost-track-list__track-image">
                      <img
                        src={track.albumImageUrl || blank}
                        alt={track.albumName}
                      />
                    </div>
                    <div className="ghost-track-list__track-info">
                      <div className="ghost-track-list__track-name">{track.trackName}</div>
                      <div className="ghost-track-list__track-artist">
                        {track.artistNames.join(', ')}
                      </div>
                      <div className="ghost-track-list__track-album">{track.albumName}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {result.error && (
              <div className="ghost-track-list__error">
                Error scanning playlist: {result.error}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GhostTrackList;