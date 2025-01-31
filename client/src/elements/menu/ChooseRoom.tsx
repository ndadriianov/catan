import {useEffect, useState} from 'react';
import socket from '../../socket.ts';
import {useNavigate} from 'react-router-dom';
import MyModal from '../modal/MyModal.tsx';

const ChooseRoom = () => {
  const [roomIds, setRoomIds] = useState<Array<number>>([]);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [roomId, setRoomId] = useState<number>();
  const [showTaken, setShowTaken] = useState<boolean>(false);
  
  const navigate = useNavigate();
  
  
  function CreateRoom(id: number): void {
    socket.emit('create-room', id, (succeed: boolean): void => {
      if (succeed) navigate(`/room?id=${id}`);
      else setShowTaken(true);
    });
  }
  
  // первичная загрузка и обновление списка комнат
  useEffect(() => {
    socket.emit('show-rooms', (res: Array<number>): void => {
      setRoomIds(res);
    })
    socket.on('update-room-list', (updatedRoomIds: Array<number>): void => {
      console.log(updatedRoomIds);
      setRoomIds(updatedRoomIds);
    })
  }, [])
  
  return (
    <div>
      <h2>choose room</h2>
      
      {roomIds?.length > 0 ? (
        <div>
          <h3>Available Rooms:</h3>
          <ul>
            {roomIds.map((id: number, index) => (
              <li key={index} onClick={() => navigate(`/room?id=${id}`) }>{id} </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No rooms available yet.</p>
      )}
      
      <button onClick={(): void => setShowCreateRoomModal(true)}>
        Создать комнату
      </button>
      
      <MyModal visible={showCreateRoomModal} setVisible={setShowCreateRoomModal}>
        <input
          type={'number'}
          value={roomId}
          onChange={(e) => setRoomId(parseInt(e.target.value))}
        />
        <button onClick={() => roomId && CreateRoom(roomId)}>
          Создать комнату
        </button>
      </MyModal>
      
      <MyModal visible={showTaken} setVisible={setShowTaken}>
        Комната с данным id уже существует!
      </MyModal>
      
      <button onClick={() => console.log(roomIds)}>ids</button>
    </div>
  );
};

export default ChooseRoom;