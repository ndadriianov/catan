import classes from './myModal.module.css'
import clsx from 'clsx'
import React, {ReactNode} from 'react';

type MyModalProps = | {
  children: ReactNode;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  close?: never;
} | {
  children: ReactNode;
  visible: boolean;
  setVisible?: never;
  close: () => void;
}


const MyModal: React.FC<MyModalProps> = ({children, visible, setVisible, close}: MyModalProps) => {
  return (
    <div
      className={visible ? clsx(classes.MyModal, classes.active) : classes.MyModal}
      onClick={(): void => {
        if (close) {
          close();
        } else {
          setVisible(false);
        }
      }}
    >
      <div
        className={classes.MyModalContent}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default MyModal;