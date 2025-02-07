import {useEffect, useState} from 'react';
import {jsonRoom, Owner, parseRoom, Room} from '../../../typesDefinitions/room.ts';
import socket from '../../../socket.ts';
import {useLocation, useNavigate} from 'react-router-dom';
import MyModal from '../../UI/modal/MyModal.tsx';
import ConnectionIndicator from './ConnectionIndicator.tsx';
import Map from '../../gameboard/map/Map.tsx';
import Select from '../../UI/select/Select.tsx';


const InRoom = () => {
  const [room, setRoom] = useState<Room|undefined|null>(undefined);
  const [unsuccessful, setUnsuccessful] = useState<boolean>(false);
  const [errorWithRoom, setErrorWithRoom] = useState<boolean>(false);
  const [color, setColor] = useState<Owner>(Owner.nobody);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const params = queryParams.get('id');
  const roomId = parseInt(params ? params : '0');
  const navigate = useNavigate();
  
  function loadRoom(): void {
    socket.emit('load-room', roomId, (room: jsonRoom | null): void => {
      setRoom(parseRoom(room));
      if (room === null) setErrorWithRoom(true);
    });
  }
  function joinRoom(): void {
    socket.emit('join-room', roomId, (succeed: boolean): void => {
      if (!succeed) setUnsuccessful(true);
    });
  }
  function chooseColor(input: string): Owner {
    switch (input) {
      case 'black': return Owner.black;
      case 'blue': return Owner.blue;
      case 'green': return Owner.green;
      case 'orange': return Owner.orange;
      case 'red': return Owner.red;
      case 'yellow': return Owner.yellow;
      default: return Owner.nobody;
    }
  }
  
  
  const colorOptions = [
    { value: 'nobody', label: 'Не выбран'},
    { value: 'black', label: 'Черный' },
    { value: 'blue', label: 'Синий' },
    { value: 'green', label: 'Зеленый' },
    { value: 'orange', label: 'Оранжевый' },
    { value: 'red', label: 'Красный' },
    { value: 'yellow', label: 'Желтый' }
  ];
  
  // первичная загрузка и обновление состояния комнаты
  useEffect(() => {
    loadRoom();
    socket.on('room-update', (updatedRoom: jsonRoom): void => {
      setRoom(parseRoom(updatedRoom));
      if (room === null) setErrorWithRoom(true);
    })
  }, [])
  
  return (
    <div>
      <button onClick={() => {
        socket.emit('go-back-to-choose', roomId);
        navigate('/choose-room');
      }}>
        вернуться к выбору комнаты
      </button>
      
      <h2>InRoom {roomId}</h2>
      
      {!errorWithRoom &&
        <div>
          <button onClick={joinRoom}>
            присоединиться
          </button>

          <button onClick={() => console.log(room)}>
            вывести в консоль комнату
          </button>

          <button onClick={() => socket.emit('start-room', roomId)}>
            начать
          </button>

          <MyModal visible={unsuccessful} setVisible={setUnsuccessful}>
            Не удалось подключиться к комнате
          </MyModal>

          <button onClick={() => socket.emit('log-room', roomId)}> {/*временная кнопка*/}
            Вывести в консоль на сервере состояние комнаты
          </button>
          
          {room != undefined ? (
            <div>
              <h3>игра {room.haveStarted ? ' ' : ' не '} началась</h3>
              
              <ul>
                {room.players.map((player, index) => (
                  <li key={index} style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <span>{player.username}</span>
                    <ConnectionIndicator status={player.status}/>
                  </li>
                ))}
              </ul>
              
              <Select
                options={colorOptions.slice(1)}
                initial={colorOptions[0]}
                value={colorOptions[color].value}
                onChange={(value: string): void => setColor(chooseColor(value))}
              />
              
              {room.haveStarted &&
                <div>
                  <Map owner={color}/>
                </div>
              }
            </div>
          ) : (
            <h3>Список игроков пуст</h3>
          )}
        </div>
      }
      
      {errorWithRoom &&
        <div>
          <h2>Не удалось получить данные о комнате</h2>

          <button onClick={loadRoom}>попробовать загрузить снова</button>
        </div>
      }
    </div>
  );
};

export default InRoom;