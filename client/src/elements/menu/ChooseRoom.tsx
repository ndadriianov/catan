import { useEffect, useState } from 'react';
import socket from '../../socket.ts';
import { useNavigate } from 'react-router-dom';
import classes from './menu.module.css';
import globalClasses from '../../styles.module.css';
import { Button, Modal, Box, Typography, TextField } from '@mui/material';

type RoomIdArrays = {
  currentRoomIds: number[];
  otherRoomIds: number[];
};

const ChooseRoom = () => {
  const [roomIdArrays, setRoomIdArrays] = useState<RoomIdArrays>({ currentRoomIds: [], otherRoomIds: [] });
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
  
  useEffect(() => {
    socket.emit('show-rooms', (res: RoomIdArrays): void => {
      setRoomIdArrays(res);
    });
    socket.on('update-room-list', (updatedRoomIds: RoomIdArrays): void => {
      setRoomIdArrays(updatedRoomIds);
    });
    return () => {
      socket.off('update-room-list');
    };
  }, []);
  
  // Обработчик изменения значения в TextField
  const handleRoomIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value > 0) {
      setRoomId(value); // Устанавливаем только значения больше 0 или undefined (если пусто)
    }
  };
  
  // Стили для модальных окон
  const modalStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: '10px',
  };
  
  return (
    <div style={{ backgroundColor: 'cadetblue', height: '100vh' }}>
      <div style={{ paddingTop: '20px' }}>
        <Button
          variant="contained"
          size="large"
          onClick={(): void => setShowCreateRoomModal(true)}
          className={classes.createRoomButton}
        >
          Создать комнату
        </Button>
        
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
      
      {/* Модальное окно для создания комнаты */}
      <Modal
        open={showCreateRoomModal}
        onClose={(): void => setShowCreateRoomModal(false)}
        aria-labelledby="create-room-modal-title"
        aria-describedby="create-room-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="create-room-modal-title" variant="h6" component="h2">
            Создать новую комнату
          </Typography>
          <TextField
            type="number"
            inputProps={{ min: 1, step: 1 }} // Ограничение минимального значения и шага
            value={roomId || ''} // Если roomId undefined, показываем пустую строку
            onChange={handleRoomIdChange} // Используем кастомный обработчик
            fullWidth
            margin="normal"
            className={globalClasses.numberInput}
            placeholder="Введите ID комнаты (больше 0)"
          />
          <Button
            variant="contained"
            onClick={() => roomId && CreateRoom(roomId)}
            fullWidth
            className={globalClasses.button}
            disabled={!roomId || roomId <= 0} // Деактивируем кнопку, если значение <= 0
          >
            Создать комнату
          </Button>
        </Box>
      </Modal>
      
      {/* Модальное окно для уведомления о занятой комнате */}
      <Modal
        open={showTaken}
        onClose={(): void => setShowTaken(false)}
        aria-labelledby="taken-room-modal-title"
        aria-describedby="taken-room-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="taken-room-modal-title" variant="h6" component="h2">
            Ошибка
          </Typography>
          <Typography id="taken-room-modal-description" sx={{ mt: 2 }}>
            Комната с данным id уже существует!
          </Typography>
          <Button
            variant="contained"
            onClick={(): void => setShowTaken(false)}
            fullWidth
            sx={{ mt: 2 }}
          >
            Закрыть
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default ChooseRoom;