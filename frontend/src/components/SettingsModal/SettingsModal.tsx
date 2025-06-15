import { useState } from 'react';
import Modal from '../Modal/Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentValue: boolean;
  onSave: (enabled: boolean) => void;
}

const SettingsModal = ({ isOpen, onClose, currentValue, onSave }: SettingsModalProps) => {
  const [enabled, setEnabled] = useState<boolean>(currentValue);

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <label style={{ display: 'flex', alignItems: 'left', gap: '1rem' }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <span style={{ textAlign: 'left' }}>
          <strong>Automatic update: </strong>
          TrackWatch will add new releases to your playlist while this option is active.
        </span>
      </label>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      content={content}
      primaryButtonText="Save"
      secondaryButtonText="Cancel"
      onPrimaryAction={() => onSave(enabled)}
      onSecondaryAction={onClose}
      secondaryButtonModificator="modal__button--cancel"
      primaryButtonModificator="modal__button--save"
    />
  );
};

export default SettingsModal; 