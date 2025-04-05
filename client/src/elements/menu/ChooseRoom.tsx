import { useEffect, useState } from 'react';
import socket from '../../socket.ts';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Modal,
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Divider
} from '@mui/material';
import BackgroundPicture from '../../assets/BackgroundPicture.png';


type RoomIdArrays = {
  currentRoomIds: number[];
  otherRoomIds: number[];
};

const MAX_ROOMS_VISIBLE = 5;
const ROOM_ITEM_HEIGHT = 48;


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
  
  const handleRoomIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value > 0) {
      setRoomId(value);
    }
  };
  
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
    <Box sx={{
      backgroundColor: '#2c4fff',
      backgroundImage: `url(${BackgroundPicture})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      height: '100vh',
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3
      }}>
        <Button
          variant="contained"
          size="large"
          onClick={(): void => setShowCreateRoomModal(true)}
          sx={{ width: '300px' }}
        >
          Создать комнату
        </Button>
        
        <Box sx={{
          display: 'flex',
          gap: 4,
          width: '100%',
          maxWidth: '800px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Paper elevation={3} sx={{
            width: '350px',
            bgcolor: 'background.paper',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <Typography variant="h6" sx={{
              p: 2,
              textAlign: 'center',
              bgcolor: '#2c4fff',
              color: 'white'
            }}>
              Ваши комнаты
            </Typography>
            <Divider />
            {roomIdArrays.currentRoomIds.length > 0 ? (
              <List sx={{
                maxHeight: MAX_ROOMS_VISIBLE * ROOM_ITEM_HEIGHT,
                overflow: 'auto',
                p: 0
              }}>
                {roomIdArrays.currentRoomIds.map((id: number) => (
                  <ListItem key={id} disablePadding>
                    <ListItemButton
                      onClick={() => navigate(`/room?id=${id}`)}
                      sx={{
                        '&:hover': { bgcolor: '#f0f4ff' },
                        px: 3,
                        py: 1.5
                      }}
                    >
                      <ListItemText
                        primary={`Комната ${id}`}
                        primaryTypographyProps={{
                          fontSize: '1.1rem',
                          fontWeight: 'medium',
                          color: 'text.primary'
                        }}
                        sx={{ textAlign: 'center' }}
                      />
                    </ListItemButton>
                    <Divider component="li" />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography sx={{
                p: 3,
                textAlign: 'center',
                color: 'text.secondary'
              }}>
                Нет доступных комнат
              </Typography>
            )}
          </Paper>
          
          <Paper elevation={3} sx={{
            width: '350px',
            bgcolor: 'background.paper',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <Typography variant="h6" sx={{
              p: 2,
              textAlign: 'center',
              bgcolor: '#2c4fff',
              color: 'white'
            }}>
              Другие комнаты
            </Typography>
            <Divider />
            {roomIdArrays.otherRoomIds.length > 0 ? (
              <List sx={{
                maxHeight: MAX_ROOMS_VISIBLE * ROOM_ITEM_HEIGHT,
                overflow: 'auto',
                p: 0
              }}>
                {roomIdArrays.otherRoomIds.map((id: number) => (
                  <ListItem key={id} disablePadding>
                    <ListItemButton
                      onClick={() => navigate(`/room?id=${id}`)}
                      sx={{
                        '&:hover': { bgcolor: '#f0f4ff' },
                        px: 3,
                        py: 1.5
                      }}
                    >
                      <ListItemText
                        primary={`Комната ${id}`}
                        primaryTypographyProps={{
                          fontSize: '1.1rem',
                          fontWeight: 'medium',
                          color: 'text.primary'
                        }}
                        sx={{ textAlign: 'center' }}
                      />
                    </ListItemButton>
                    <Divider component="li" />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography sx={{
                p: 3,
                textAlign: 'center',
                color: 'text.secondary'
              }}>
                Нет доступных комнат
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>
      
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
            inputProps={{ min: 1, step: 1 }}
            value={roomId || ''}
            onChange={handleRoomIdChange}
            fullWidth
            margin="normal"
            placeholder="Введите ID комнаты (больше 0)"
          />
          <Button
            variant="contained"
            onClick={() => roomId && CreateRoom(roomId)}
            fullWidth
            disabled={!roomId || roomId <= 0}
            sx={{ mt: 2 }}
          >
            Создать комнату
          </Button>
        </Box>
      </Modal>
      
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
    </Box>
  );
};

export default ChooseRoom;