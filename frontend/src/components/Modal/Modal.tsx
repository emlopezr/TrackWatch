import { ReactNode, useState } from 'react';
import './Modal.css';
import Spinner from '../Spinner/Spinner';

type ModalType = 'success' | 'error' | 'info';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: ReactNode;
  type?: ModalType;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryAction?: () => Promise<void> | void;
  onSecondaryAction?: () => void;
  secondaryButtonModificator?: string;
  primaryButtonModificator?: string;
  secondaryButtonIcon?: ReactNode;
  primaryButtonIcon?: ReactNode;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  content,
  type = 'info',
  primaryButtonText = 'OK',
  secondaryButtonText,
  onPrimaryAction,
  onSecondaryAction,
  secondaryButtonModificator,
  primaryButtonModificator,
  secondaryButtonIcon,
  primaryButtonIcon
}: ModalProps) => {
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;

  const getIconByType = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="modal__icon modal__icon--success" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case 'error':
        return (
          <svg className="modal__icon modal__icon--error" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="modal__icon modal__icon--info" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  const handlePrimaryAction = async () => {
    if (onPrimaryAction) {
      setLoading(true);
      try {
        const result = onPrimaryAction();
        if (result instanceof Promise) {
          await result;
        }
      } catch (error) {
        console.error('Modal primary action error', error);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    onClose();
  };

  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal modal--${type}`} onClick={(e) => e.stopPropagation()} style={{position:'relative'}}>
        <div className="modal__header">
          {getIconByType()}
          <h2 className="modal__title">{title}</h2>
        </div>
        <div className="modal__content">{content}</div>
        {loading && (
          <div className="modal__loading-overlay"><Spinner /></div>
        )}
        <div className="modal__actions">
          {secondaryButtonText && (
            <button
              className={`modal__button modal__button--secondary ${secondaryButtonModificator}`}
              onClick={handleSecondaryAction}
            >
              {secondaryButtonIcon && <span className="modal__button-icon">{secondaryButtonIcon}</span>}
              {secondaryButtonText}
            </button>
          )}
          <button
            className={`modal__button modal__button--primary ${primaryButtonModificator}`}
            onClick={handlePrimaryAction}
          >
            {primaryButtonIcon && <span className="modal__button-icon">{primaryButtonIcon}</span>}
            {primaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
