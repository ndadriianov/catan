import {useEffect, useState} from 'react';
import {parseRoom, Room} from '../../../typesDefinitions/room.ts';
import socket from '../../../socket.ts';
import {useLocation, useNavigate} from 'react-router-dom';
import MyModal from '../../modal/MyModal.tsx';
import ConnectionIndicator from './ConnectionIndicator.tsx';


const InRoom = () => {
  const [room, setRoom] = useState<Room|undefined|null>(undefined);
  const [unsuccessful, setUnsuccessful] = useState<boolean>(false);
  const [errorWithRoom, setErrorWithRoom] = useState<boolean>(false);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const params = queryParams.get('id');
  const roomId = parseInt(params ? params : '0');
  const navigate = useNavigate();
  
  function loadRoom(): void {
    socket.emit('load-room', roomId, (room: Room | null): void => {
      setRoom(parseRoom(room));
      if (room === null) setErrorWithRoom(true);
    });
  }
  function joinRoom(): void {
    socket.emit('join-room', roomId, (succeed: boolean): void => {
      if (!succeed) setUnsuccessful(true);
    });
  }
  
  // первичная загрузка и обновление состояния комнаты
  useEffect(() => {
    loadRoom();
    socket.on('room-update', (updatedRoom: Room): void => {
      setRoom(parseRoom(updatedRoom));
      if (room === null) setErrorWithRoom(true);
    })
  }, [])
  
  return (
    <div>
      <h2>InRoom {roomId}</h2>
      
      {!errorWithRoom &&
        <div>
          {room != undefined ? (
            <div>
              <ul>
                {room.players.map((player, index) => (
                  <li key={index} style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <span>{player.username}</span>
                    <ConnectionIndicator status={player.status}/>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <h3>Список игроков пуст</h3>
          )}

          <button onClick={joinRoom}>
            присоединиться
          </button>

          <button onClick={() => console.log(room)}>
            вывести в консоль комнату
          </button>

          <MyModal visible={unsuccessful} setVisible={setUnsuccessful}>
            Не удалось подключиться к комнате
          </MyModal>
          
          <button onClick={() => socket.emit('log-room', roomId)}>
            Вывести в консоль на сервере состояние комнаты
          </button>
        </div>
      }
      
      {errorWithRoom &&
        <div>
          <h2>Не удалось получить данные о комнате</h2>

          <button onClick={loadRoom}>попробовать загрузить снова</button>
        </div>
      }
      
      <button onClick={() => {
        socket.emit('go-back-to-choose', roomId);
        navigate('/choose-room');
      }}>
        вернуться к выбору комнаты
      </button>
    </div>
  );
};

export default InRoom;