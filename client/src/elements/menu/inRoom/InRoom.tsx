import React, {useContext, useEffect, useState} from 'react';
import Room, {jsonRoom, parseRoom} from '../../../typesDefinitions/room/room.ts';
import socket from '../../../socket.ts';
import {useLocation, useNavigate} from 'react-router-dom';
import MyModal from '../../UI/modal/MyModal.tsx';
import Gameboard from '../../gameboard/map/Gameboard.tsx';
import UserContext from '../../../context/UserContext.ts';
import Player from '../../../typesDefinitions/room/player.ts';
import Owner from '../../../typesDefinitions/owner.ts';
import PlayersList from '../../gameboard/map/PlayersList.tsx';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';


function ReplayIcon() {
  return null;
}

const InRoom = () => {
  const [room, setRoom] = useState<Room | undefined | null>(undefined);
  const {user} = useContext(UserContext)!;
  const [me, setMe] = useState<Player | undefined | null>(undefined);
  const [unsuccessful, setUnsuccessful] = useState<boolean>(false);
  const [color, setColor] = useState<Owner>(Owner.nobody);
  const [isMyTurnNow, setIsMyTurnNow] = useState<boolean>(false);
  const [robberEnabled, setRobberEnabled] = useState<boolean>(false);
  const [pointsToWin, setPointsToWin] = useState<number>(10);
  const [pointsError, setPointsError] = useState<boolean>(false);
  const [arePlayersOk, setArePlayersOk] = useState<boolean>(false);
  
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
    socket.emit('apply-color', color);
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
    if (pointsError) return;
    socket.emit('start-room', roomId, (success: boolean): void => {
      if (success) {
        console.log('start room');
      } else {
        console.log('cant start room');
      }
    });
  }
  
  function handleBackToChoose():void {
    socket.emit('go-back-to-choose', roomId);
    navigate('/choose-room');
  }
  
  function handlePointsToWinChange(e: React.ChangeEvent<HTMLInputElement>):void {
    const value = parseInt(e.target.value, 10);
    setPointsToWin(value);
    if (value < 3 || value > 20) setPointsError(true);
    else setPointsError(false);
  }
  
  function checkPlayers(players: Player[]): boolean {
    if (players.some(p => p.color === Owner.nobody)) return false;
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        if (players[i].color === players[j].color) return false;
      }
    }
    return true;
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
    if (room) {
      setRobberEnabled(room.playWithRobber);
      setPointsToWin(room.pointsToWin);
    }
  }, [user, room]);
  
  useEffect(() => {
    if (room?.players) {
      setArePlayersOk(checkPlayers(room.players));
    }
  }, [room?.players]);
  
  
  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" p={0.2} sx={{ backgroundColor: '#2c4fff', borderRadius: 1 }}>
        <Typography variant="h5" component="h1" sx={{color: 'white'}}>
          Комната {roomId}
        </Typography>
        <Button variant='contained' color="primary" onClick={handleBackToChoose}>
          Вернуться к выбору комнаты
        </Button>
      </Box>
      
      
      {room ? (
        <Container maxWidth="md">
          {room.haveStarted && me ? (
            <Gameboard
              owner={me.color || color}
              room={room}
              isMyTurnNow={isMyTurnNow}
              me={me}
              inventory={me.inventory}
            />
          ) : (
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
              <Typography variant="h5" gutterBottom align="center">
                Настройки комнаты
              </Typography>
              
              <Stack spacing={2} alignItems="center">
                <Box sx={{ width: '100%', maxWidth: 400 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={joinRoom}
                    size="large"
                    sx={{ mb: 2 }}
                  >
                    Присоединиться
                  </Button>
                </Box>
                
                <Divider sx={{ width: '100%', my: 2 }} />
                
                <Box sx={{width: '100%', maxWidth: 400}}>
                  <FormControl fullWidth>
                    <InputLabel id="color-select-label">Выберите цвет</InputLabel>
                    <Select
                      labelId="color-select-label"
                      id="color-select"
                      value={(me && colors[me?.color]) || colors[0]}
                      label="Выберите цвет"
                      onChange={(e) => applyColor(e.target.value as string)}
                      renderValue={(selected) => selected === "не выбран" ? "не выбран" : selected}
                      disabled={!me}
                    >
                      <MenuItem value="не выбран" disabled>
                        не выбран
                      </MenuItem>
                      {colors.slice(1).map((colorOption) => (
                        <MenuItem key={colorOption} value={colorOption}>
                          {colorOption}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ width: '100%', maxWidth: 400 }}>
                  <FormControl fullWidth>
                    <InputLabel id="robber-mode-label">Режим разбойника</InputLabel>
                    <Select
                      labelId="robber-mode-label"
                      id="robber-mode-select"
                      value={robberEnabled ? "enabled" : "disabled"}
                      label="Режим разбойника"
                      onChange={(e) => socket.emit('change-robber-mode', e.target.value === "enabled")}
                      disabled={!me}
                    >
                      <MenuItem value="enabled">включен</MenuItem>
                      <MenuItem value="disabled">выключен</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ width: '100%', maxWidth: 400 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Очков для победы"
                      value={pointsToWin}
                      error={pointsError}
                      helperText={pointsError || "Введите число от 3 до 20"}
                      onChange={handlePointsToWinChange}
                      disabled={!me}
                      type="number"
                      inputProps={{
                        min: 3,
                        max: 20
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          height: '100%'
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        if (!pointsError) socket.emit('change-win', pointsToWin);
                      }}
                      disabled={!me || pointsError || room.pointsToWin === pointsToWin}
                      sx={{
                        minWidth: '120px',
                        height: '56px'
                      }}
                    >
                      Подтвердить
                    </Button>
                  </Box>
                </Box>
                
                <Box sx={{ width: '100%', maxWidth: 400 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    onClick={start}
                    size="large"
                    disabled={!me || pointsError || !arePlayersOk}
                  >
                    Начать игру
                  </Button>
                </Box>
                
                <Box sx={{ width: '100%', mt: 3 }}>
                  <PlayersList players={room.players} />
                </Box>
              </Stack>
            </Paper>
          )}
        </Container>
      ) : (
        <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Не удалось получить данные о комнате
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                socket.emit('load-room', roomId, (roomJ: jsonRoom | null) => {
                  SetUpRoom(roomJ);
                });
              }}
              sx={{ mt: 2 }}
              startIcon={<ReplayIcon />}
            >
              Попробовать загрузить снова
            </Button>
          </Paper>
        </Container>
      )}
      
      <MyModal visible={unsuccessful} setVisible={setUnsuccessful}>
        Не удалось подключиться к комнате
      </MyModal>
    </div>
  );
};

export default InRoom;