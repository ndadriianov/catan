import {useEffect, useState} from 'react';
import {Room} from '../../typesDefinitions/room.ts';
import socket from '../../socket.ts';
import {useLocation, useNavigate} from 'react-router-dom';
import MyModal from '../modal/MyModal.tsx';


const InRoom = () => {
  const [room, setRoom] = useState<Room|null>(null);
  const [unsuccessful, setUnsuccessful] = useState<boolean>(false);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const params = queryParams.get('id');
  const roomId = parseInt(params ? params : '0');
  const navigate = useNavigate();
  
  function loadRoom(): void {
    socket.emit('load-room', roomId, (room: Room | null): void => {
      setRoom(room);
    });
  }
  function joinRoom(): void {
    socket.emit('join-room', roomId, (succeed: boolean): void => {
      if (!succeed) setUnsuccessful(true);
    });
  }
  
  useEffect(() => {
    loadRoom();
    socket.on('room-update', (updatedRoom: Room): void => {
      setRoom(updatedRoom);
    })
  }, [])
  
  return (
    <div>
      <h2>InRoom {roomId}</h2>
      
      {room != undefined ? (
        <div>
          <ul>
            {room.players.map((player, index) => (
              <li key={index}>
                {player.username}
              </li>
            ))}
          </ul>
        </div>
        ):(
        <h3>Список игроков пуст</h3>
      )}
      
      <button onClick={joinRoom} >
        присоединиться
      </button>
      
      <button onClick={() => {socket.emit('go-back-to-choose', roomId); navigate('/choose-room')}}>
        вернуться к выбору комнаты
      </button>
      
      <MyModal visible={unsuccessful} setVisible={setUnsuccessful}>
        Не удалось подключиться к комнате
      </MyModal>
    </div>
  );
};

export default InRoom;