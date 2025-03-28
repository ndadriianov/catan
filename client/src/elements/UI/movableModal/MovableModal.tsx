import React, { ReactNode } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { createPortal } from 'react-dom';

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  id: string;
}

const MovableModal: React.FC<ModalProps> = ({ children, isOpen, onClose, id }) => {
  if (!isOpen) {
    return null;
  }
  
  return createPortal(
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
        zIndex: 1000, // Фон ниже выпадающих меню MUI
      }}
      onClick={onClose}
    >
      <Draggable
        key={id} // Уникальный ключ для каждого экземпляра
        onStart={(e: DraggableEvent, data: DraggableData) => e.stopPropagation()}
        onDrag={(e: DraggableEvent, data: DraggableData) => e.stopPropagation()}
        onStop={(e: DraggableEvent, data: DraggableData) => e.stopPropagation()}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            zIndex: 1001, // Содержимое ниже выпадающих меню MUI
            position: 'relative',
            cursor: 'move', // Курсор для перетаскивания всего окна
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </Draggable>
    </div>,
    document.body
  );
};

export default MovableModal;