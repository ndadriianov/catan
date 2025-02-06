import classes from './myModal.module.css'
import clsx from 'clsx'
import React, {ReactNode} from 'react';

type MyModalProps = {
  children: ReactNode;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const MyModal: React.FC<MyModalProps> = ({children, visible, setVisible}: MyModalProps) => {
  return (
    <div
      className={visible ? clsx(classes.MyModal, classes.active) : classes.MyModal}
      onClick={() => setVisible(false)}
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