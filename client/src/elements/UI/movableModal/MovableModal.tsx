import React, { ReactNode } from 'react';
import Draggable, { DraggableEvent } from 'react-draggable';
import { createPortal } from 'react-dom';

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  id: string;
}

const MovableModal: React.FC<ModalProps> = ({ children, isOpen, onClose, id }) => {
  if (!isOpen) return null;

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    maxWidth: '90vw',
    minWidth: 300,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    maxHeight: '90vh',
    width: 'auto',
  };

  const headerStyle: React.CSSProperties = {
    flex: '0 0 40px',
    padding: '0.75rem 1rem',
    backgroundColor: '#f5f5f5',
    cursor: 'grab',
    userSelect: 'none',
    width: '100%',
  };

  const bodyStyle: React.CSSProperties = {
    flex: '1 1 auto',
    padding: '1rem',
    overflowY: 'auto',
    touchAction: 'manipulation',
  };

  return createPortal(
    <div style={backdropStyle} onClick={onClose}>
      <Draggable
        key={id}
        handle='[data-drag-handle]'
        onStart={(e: DraggableEvent) => e.stopPropagation()}
        onDrag={(e: DraggableEvent) => e.stopPropagation()}
        onStop={(e: DraggableEvent) => e.stopPropagation()}
      >
        <div style={containerStyle} onClick={e => e.stopPropagation()}>
          <div
            data-drag-handle
            style={headerStyle}
          >
            Перетащите меня
          </div>
          <div style={bodyStyle}>
            {children}
          </div>
        </div>
      </Draggable>
    </div>,
    document.body
  );
};

export default MovableModal;
