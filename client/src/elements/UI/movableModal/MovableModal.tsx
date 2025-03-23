import React, {ReactNode} from 'react';
import Draggable from 'react-draggable';

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const MovableModal: React.FC<ModalProps> = ({children, isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9998
      }}
      onClick={onClose}
    >
      <Draggable>
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            zIndex: 9999,
          }}
          onClick={e => e.stopPropagation()}
        >
          {children}
        </div>
      </Draggable>
    </div>
  );
};

export default MovableModal;