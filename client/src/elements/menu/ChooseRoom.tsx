import {useEffect, useState} from 'react';
import socket from '../../socket.ts';
import {useNavigate} from 'react-router-dom';
import MyModal from '../UI/modal/MyModal.tsx';

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
    socket.emit('create-room', id, (succeed: boolean): void => {
      if (succeed) navigate(`/room?id=${id}`);
      else setShowTaken(true);
    });
  }
  
  // первичная загрузка и обновление списка комнат
  useEffect(() => {
    socket.emit('show-rooms', (res: RoomIdArrays): void => {
      setRoomIdArrays(res);
    })
    socket.on('update-room-list', (updatedRoomIds: RoomIdArrays): void => {
      setRoomIdArrays(updatedRoomIds);
    })
  }, [])
  
  return (
    <div>
      <h2>choose room</h2>
      
      <div>
        <h3>Комнаты, в которых вы принимаете участие</h3>
        {roomIdArrays.currentRoomIds.length > 0 ? (
          <div>
            <h3>Available Rooms:</h3>
            <ul>
              {roomIdArrays.currentRoomIds.map((id: number, index: number) => (
                <li key={index} onClick={() => navigate(`/room?id=${id}`)}>{id} </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No rooms available yet.</p>
        )}
      </div>
      
      <div>
        <h3>Остальные комнаты</h3>
        {roomIdArrays.otherRoomIds.length > 0 ? (
          <div>
            <h3>Available Rooms:</h3>
            <ul>
              {roomIdArrays.otherRoomIds.map((id: number, index: number) => (
                <li key={index} onClick={() => navigate(`/room?id=${id}`)}>{id} </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No rooms available yet.</p>
        )}
      </div>
      
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
      
      <button onClick={() => console.log(roomIdArrays)}>ids</button>
      
      <button onClick={() => socket.emit('test-room-lists')}>протестировать prepareRoomLists</button>
    </div>
  );
};

export default ChooseRoom;