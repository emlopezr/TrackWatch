import type { Playlist } from '../../types/trackwatch/GhostTrack';
import blank from '../../assets/png/blank.png';
import './PlaylistSelector.css';

interface PlaylistSelectorProps {
  playlists: Playlist[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  disabled?: boolean;
}

const PlaylistSelector = ({
  playlists,
  selectedIds,
  onSelectionChange,
  disabled = false
}: PlaylistSelectorProps) => {
  const handleToggle = (playlistId: string) => {
    if (disabled) return;
    const newSelection = new Set(selectedIds);
    if (newSelection.has(playlistId)) {
      newSelection.delete(playlistId);
    } else {
      newSelection.add(playlistId);
    }
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    const allIds = new Set(playlists.map(p => p.id));
    onSelectionChange(allIds);
  };

  const handleDeselectAll = () => {
    if (disabled) return;
    onSelectionChange(new Set());
  };

  return (
    <div className="playlist-selector">
      <div className="playlist-selector__header">
        <h3 className="playlist-selector__title">Select Playlists to Scan</h3>
        <div className="playlist-selector__actions">
          <button
            className="playlist-selector__btn playlist-selector__btn--select-all"
            onClick={handleSelectAll}
            disabled={disabled}
          >
            Select All
          </button>
          <button
            className="playlist-selector__btn playlist-selector__btn--deselect-all"
            onClick={handleDeselectAll}
            disabled={disabled}
          >
            Deselect All
          </button>
        </div>
      </div>

      <div className="playlist-selector__list">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className={`playlist-selector__item ${selectedIds.has(playlist.id) ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => handleToggle(playlist.id)}
          >
            <input
              type="checkbox"
              className="playlist-selector__checkbox"
              checked={selectedIds.has(playlist.id)}
              onChange={() => handleToggle(playlist.id)}
              disabled={disabled}
            />
            <div className="playlist-selector__image">
              <img
                src={playlist.imageUrl || blank}
                alt={playlist.name}
              />
            </div>
            <div className="playlist-selector__info">
              <div className="playlist-selector__name">{playlist.name}</div>
              <div className="playlist-selector__tracks">{playlist.trackCount} tracks</div>
            </div>
          </div>
        ))}
      </div>

      {selectedIds.size > 0 && (
        <div className="playlist-selector__selected-count">
          {selectedIds.size} playlist{selectedIds.size !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};

export default PlaylistSelector;