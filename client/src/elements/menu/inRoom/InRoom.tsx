import React, {useContext, useEffect, useState} from 'react';
import {jsonRoom, Owner, parseRoom, Player, Room} from '../../../typesDefinitions/room.ts';
import socket from '../../../socket.ts';
import {useLocation, useNavigate} from 'react-router-dom';
import MyModal from '../../UI/modal/MyModal.tsx';
import ConnectionIndicator from './ConnectionIndicator.tsx';
import Map from '../../gameboard/map/Map.tsx';
import Select from '../../UI/select/Select.tsx';
import UserContext from '../../../context/UserContext.ts';


const InRoom = () => {
  const [room, setRoom] = useState<Room|undefined|null>(undefined);
  const {user} = useContext(UserContext)!;
  const [me, setMe] = useState<Player|undefined|null>(undefined);
  const [unsuccessful, setUnsuccessful] = useState<boolean>(false);
  const [errorWithRoom, setErrorWithRoom] = useState<boolean>(false);
  const [color, setColor] = useState<Owner>(Owner.nobody);
  const [isMyTurnNow, setIsMyTurnNow] = useState<boolean>(false);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const params = queryParams.get('id');
  const roomId = parseInt(params ? params : '0');
  const navigate = useNavigate();
  
  
  function SetUpRoom(roomJ: jsonRoom|null): void {
    const parsedRoom: Room|null = parseRoom(roomJ);
    setRoom(parsedRoom);
    if (parsedRoom === null) {
      setErrorWithRoom(true);
      return;
    }
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
      default: return Owner.nobody;
    }
  }
  function applyColor(strColor: string): void {
    const color: Owner = chooseColor(strColor);
    setColor(color);
    socket.emit('apply-color', color);
  }
  function start(): void {
    socket.emit('start-room', roomId, (success: boolean): void => {
      if (success) {
        console.log('start room');
      } else {
        console.log('cant start room');
      }
    });
  }
  
  
  const colorOptions = [
    { value: 'nobody', label: 'Не выбран'},
    { value: 'black', label: 'Черный' },
    { value: 'blue', label: 'Синий' },
    { value: 'green', label: 'Зеленый' },
    { value: 'orange', label: 'Оранжевый' },
  ];
  const colors: string[] = [
    'Не выбран',
    'Черный',
    'Синий',
    'Зеленый',
    'Оранжевый'
  ]
  
  // первичная загрузка и обновление состояния комнаты
  useEffect(() => {
    socket.emit('load-room', roomId, (roomJ: jsonRoom | null): void => {
      SetUpRoom(roomJ);
    });
    socket.on('room-update', (updatedRoom: jsonRoom | null): void => {
      SetUpRoom(updatedRoom);
    })
    return () => {
      socket.off('room-update');
    };
  }, [])
  
  useEffect(() => {
    setMe(room?.players.find((player: Player): boolean => player.username === user.username));
    if (user.username && room) setIsMyTurnNow(room?.activePlayer === user.username);
  }, [user, room]);
  
  
  
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

          <button onClick={() => console.log(me)}>
            вывести в консоль себя
          </button>

          <button onClick={start}>
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
                    <span>{colors[player.color]}</span>
                  </li>
                ))}
              </ul>
              
              <Select
                options={colorOptions.slice(1)}
                initial={colorOptions[0]}
                value={colorOptions[me?.color || color].value}
                onChange={(value: string): void => applyColor(value)}
              />
              
              {room.haveStarted && me &&
                <div>
                  <Map owner={me.color || color} room={room} isMyTurnNow={isMyTurnNow} inventory={me.inventory}/>
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

          <button
            onClick={() => {
              socket.emit('load-room', roomId, (roomJ: jsonRoom | null): void => {
                SetUpRoom(roomJ);
              });
            }}
          >
            попробовать загрузить снова
          </button>
        </div>
      }
    </div>
  );
};

export default InRoom;