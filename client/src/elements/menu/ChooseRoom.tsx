import {useEffect, useState} from 'react';
import socket from '../../socket.ts';
import {useNavigate} from 'react-router-dom';
import MyModal from '../UI/modal/MyModal.tsx';
import classes from './menu.module.css';
import globalClasses from '../../styles.module.css';
import MovableModal from '../UI/movableModal/MovableModal.tsx';

type RoomIdArrays = {
  currentRoomIds: number[],
  otherRoomIds: number[]
};


const ChooseRoom = () => {
  const [roomIdArrays, setRoomIdArrays] = useState<RoomIdArrays>({currentRoomIds: [], otherRoomIds: []});
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [roomId, setRoomId] = useState<number>();
  const [showTaken, setShowTaken] = useState<boolean>(false);
  
  const navigate = useNavigate();
  
  
  function CreateRoom(id: number): void {
    if (id > 0) {
      socket.emit('create-room', id, (succeed: boolean): void => {
        if (succeed) navigate(`/room?id=${id}`);
        else setShowTaken(true);
      });
    }
  }
  
  // первичная загрузка и обновление списка комнат
  useEffect(() => {
    socket.emit('show-rooms', (res: RoomIdArrays): void => {
      setRoomIdArrays(res);
    });
    socket.on('update-room-list', (updatedRoomIds: RoomIdArrays): void => {
      setRoomIdArrays(updatedRoomIds);
    });
    return () => {
      socket.off('update-room-list');
    }
  }, []);
  
  return (
    <div style={{backgroundColor: 'cadetblue', height: '100vh'}}>
      <div style={{paddingTop: '20px'}}>
        <button
          className={globalClasses.bigButton}
          onClick={(): void => setShowCreateRoomModal(true)}
        >
          Создать комнату
        </button>
        
        
        <div className={classes.chooseRoomContainer}>
          <div className={classes.chooseRoomContent}>
            <h3>Комнаты, в которых вы принимаете участие</h3>
            {roomIdArrays.currentRoomIds.length > 0 ? (
              <div className={classes.chooseRoomRooms}>
                <h4>Доступные комнаты:</h4>
                <ul className={classes.chooseRoomList}>
                  {roomIdArrays.currentRoomIds.map((id: number, index: number) => (
                    <li
                      className={classes.chooseRoomListElement}
                      key={index}
                      onClick={() => navigate(`/room?id=${id}`)}
                    >
                      {id}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <h4>Нет доступных комнат</h4>
            )}
          </div>
          
          <div className={classes.chooseRoomContent}>
            <h3>Остальные комнаты</h3>
            {roomIdArrays.otherRoomIds.length > 0 ? (
              <div className={classes.chooseRoomRooms}>
                <h4>Доступные комнаты:</h4>
                <ul className={classes.chooseRoomList}>
                  {roomIdArrays.otherRoomIds.map((id: number, index: number) => (
                    <li
                      className={classes.chooseRoomListElement}
                      key={index}
                      onClick={() => navigate(`/room?id=${id}`)}
                    >
                      {id}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <h4>Нет доступных комнат</h4>
            )}
          </div>
        </div>
      </div>
      
      <MovableModal isOpen={showCreateRoomModal} onClose={(): void => setShowCreateRoomModal(false)}>
        <input
          className={globalClasses.numberInput}
          min={1}
          type={'number'}
          value={roomId}
          onChange={(e) => setRoomId(parseInt(e.target.value))}
        />
        <button className={globalClasses.button} onClick={() => roomId && CreateRoom(roomId)}>
          Создать комнату
        </button>
      </MovableModal>
      
      <MyModal visible={showTaken} setVisible={setShowTaken}>
        Комната с данным id уже существует!
      </MyModal>
    </div>
  );
};

export default ChooseRoom;