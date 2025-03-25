import React, {useContext, useEffect, useState} from 'react';
import Room, {jsonRoom, parseRoom} from '../../../typesDefinitions/room/room.ts';
import socket from '../../../socket.ts';
import {useLocation, useNavigate} from 'react-router-dom';
import MyModal from '../../UI/modal/MyModal.tsx';
import Gameboard from '../../gameboard/map/Gameboard.tsx';
import Select from '../../UI/select/Select.tsx';
import UserContext from '../../../context/UserContext.ts';
import Player from '../../../typesDefinitions/room/player.ts';
import Owner from '../../../typesDefinitions/owner.ts';
import globalClasses from '../../../styles.module.css';
import classes from './InRoom.module.css';
import MovableModal from '../../UI/movableModal/MovableModal.tsx';
import PlayersList from '../../gameboard/map/PlayersList.tsx';


const InRoom = () => {
  const [room, setRoom] = useState<Room | undefined | null>(undefined);
  const {user} = useContext(UserContext)!;
  const [me, setMe] = useState<Player | undefined | null>(undefined);
  const [unsuccessful, setUnsuccessful] = useState<boolean>(false);
  const [color, setColor] = useState<Owner>(Owner.nobody);
  const [isMyTurnNow, setIsMyTurnNow] = useState<boolean>(false);
  const [isAdditionalButtonsOpen, setIsAdditionalButtonsOpen] = useState<boolean>(false);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const params = queryParams.get('id');
  const roomId = parseInt(params ? params : '0');
  const navigate = useNavigate();
  
  
  function SetUpRoom(roomJ: jsonRoom | null): void {
    const parsedRoom: Room | null = parseRoom(roomJ);
    setRoom(parsedRoom);
  }
  
  function joinRoom(): void {
    socket.emit('join-room', roomId, (succeed: boolean): void => {
      if (!succeed) setUnsuccessful(true);
    });
  }
  
  function chooseColor(input: string): Owner {
    switch (input) {
      case 'черный':
        return Owner.black;
      case 'синий':
        return Owner.blue;
      case 'зеленый':
        return Owner.green;
      case 'оранжевый':
        return Owner.orange;
      default:
        return Owner.nobody;
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
  
  const colors: string[] = [
    'не выбран',
    'черный',
    'синий',
    'зеленый',
    'оранжевый'
  ];
  
  // первичная загрузка и обновление состояния комнаты
  useEffect(() => {
    socket.emit('load-room', roomId, (roomJ: jsonRoom | null): void => {
      SetUpRoom(roomJ);
    });
    socket.on('room-update', (updatedRoom: jsonRoom | null): void => {
      SetUpRoom(updatedRoom);
    });
    return () => {
      socket.off('room-update');
    };
  }, []);
  
  useEffect(() => {
    setMe(room?.players.find((player: Player): boolean => player.username === user.username));
    if (user.username && room) setIsMyTurnNow(room?.activePlayer === user.username);
  }, [user, room]);
  
  
  return (
    <div>
      <div className={classes.roomHeader}>
        <div className={classes.roomName}>комната {roomId}</div>
        
        <button className={globalClasses.button} onClick={() => {
          socket.emit('go-back-to-choose', roomId);
          navigate('/choose-room');
        }}>
          вернуться к выбору комнаты
        </button>
        
        <button onClick={() => setIsAdditionalButtonsOpen(true)}>tmp</button>
      </div>
      
      
      {
        room
          ?
          <div>
            {room.haveStarted && me
              ?
              <Gameboard owner={me.color || color} room={room} isMyTurnNow={isMyTurnNow} inventory={me.inventory}/>
              :
              <div>
                <button onClick={joinRoom} className={globalClasses.button}>
                  присоединиться
                </button>
                
                <Select
                  className={globalClasses.OptionsInput}
                  options={colors}
                  initial={colors[0]}
                  value={colors[me?.color || color]}
                  onChange={(value: string): void => applyColor(value)}
                />
                
                <button onClick={start} className={globalClasses.button}>начать</button>
                
                <PlayersList players={room.players}/>
              </div>
            }
          </div>
          :
          <div>
            <h2>Не удалось получить данные о комнате</h2>
            
            <button
              onClick={() => {
                socket.emit('load-room', roomId, (roomJ: jsonRoom | null): void => { SetUpRoom(roomJ); });
              }}
            >
              попробовать загрузить снова
            </button>
          </div>
      }
      
      
      <MovableModal isOpen={isAdditionalButtonsOpen} onClose={(): void => setIsAdditionalButtonsOpen(false)}>
        <button onClick={() => console.log(room)}>
          вывести в консоль комнату
        </button>
        
        <button onClick={() => console.log(me)}>
          вывести в консоль себя
        </button>
        
        <button onClick={() => socket.emit('log-room', roomId)}> {/*временная кнопка*/}
          Вывести в консоль на сервере состояние комнаты
        </button>
      </MovableModal>
      
      <MyModal visible={unsuccessful} setVisible={setUnsuccessful}>
        Не удалось подключиться к комнате
      </MyModal>
    </div>
  );
};

export default InRoom;