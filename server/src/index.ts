import express from 'express';
import {createServer} from 'http';
import {Server, Socket} from 'socket.io';
import cors from 'cors';
import {ConnectionStatus, LoginStatus, User} from './typesDefinitions/User';
import {Room} from './typesDefinitions/Room';
import {EventEmitter} from 'node:events';


const PORT = 4000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Адрес вашего клиента
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

const roomEmitter = new EventEmitter();

const users: Array<User> = [];
const rooms: Array<Room> = [];

// срабатывает когда изменяет список пользователей, либо haveStarted в комнате, аргумент - id данной комнаты
roomEmitter.on('update', (id: number): void => {
  const room: Room|undefined = rooms.find((room: Room): boolean => room.id === id);
  if (room) io.to(id.toString()).emit('room-update', room.toJSON());
});



io.on('connection', (socket: Socket): void => {
  console.log(`Client connected: ${socket.id}`);
  
  // Срабатывает когда пользователь создает аккаунт, одновременно с этим пользователь входит в аккаунт. Логика, связанная с login здесь не используется
  socket.on('register', (username: string, password: string, callback: (isAvailable: boolean) => void): void => {
    if (!users.find((user: User): boolean => user.username === username)) {
      const user: User = new User(username, password);
      users.push(user);
      socket.data.user = user;
      callback(true);
    } else {
      callback(false);
    }
  });
  
  // срабатывает когда пользователь входит в аккаунт
  socket.on('login', (username: string, password: string, callback: (succeed: LoginStatus) => void): void => {
    const user: User|undefined = users.find((user: User): boolean => user.username === username);
    if (user && user.password === password) {
      if (user.status !== ConnectionStatus.Green) { // пользователь не должен иметь текущей активности
        user.status = ConnectionStatus.Green; // восстановление соединения и подключение после долгой паузы
        socket.data.user = user;
        callback(LoginStatus.Success);
      } else {
        callback(LoginStatus.Duplicate)
      }
    } else {
      callback(LoginStatus.Incorrect);
    }
  });
  
  // срабатывает когда пользователь выходит из аккаунта
  socket.on('logout', () => {
    if (socket.data.user) {
      socket.data.user.status = ConnectionStatus.Red;
      socket.data.user = null;
    }
  })
  
  // срабатывает когда пользователь заходит на страницу выбора комнат
  socket.on('show-rooms', (callback: (res: Array<number>) => void): void => {
    callback(rooms.map((room: Room): number =>  room.id));
  });
  
  // срабатывает когда пользователь создает комнату
  socket.on('create-room', (id: number, callback: (succeed: boolean) => void): void => {
    if (rooms.find((room: Room): boolean => room.id === id)) {
      callback(false);
      return;
    }
    const room: Room = new Room(id, roomEmitter);
    rooms.push(room);
    room.addPlayer(socket.data.user.username);
    io.emit('update-room-list', rooms.map((room: Room): number => room.id)); // обновление списка комнат для пользователей
    socket.data.user.activeRoom = room;
    socket.join(id.toString());
    callback(true);
  });
  
  // срабатывает когда пользователь заходит в комнату, но не присоединяется
  socket.on('load-room', (id: number, callback: (currentRoom: any) => void): void => {
    const room: Room|undefined = rooms.find((room: Room): boolean => room.id === id);
    socket.join(id.toString());
    callback(room ? room.toJSON() : null);
  });
  
  // срабатывает когда пользователь выходит из комнаты, если он к ней присоединился, он из нее удаляется
  socket.on('go-back-to-choose', (id: number) => {
    socket.leave(id.toString());
    const room = rooms.find((room: Room): boolean => room.id === id);
    if (room) {
      room.removePlayer(socket.data.user.username);
    }
  })
  
  // срабатывает когда пользователь присоединяется к комнате (не путать с 'load room')
  socket.on('join-room', (id: number, callback: (succeed: boolean) => void): void => {
    const room: Room|undefined = rooms.find((room: Room): boolean => room.id === id);
    if (!room) {
      callback(false);
      return;
    }
    if (room.addPlayer(socket.data.user.username)) {
      socket.data.user.activeRoom = room;
      callback(true);
    }
    callback(false);
  });
  
  
  // пользователь отключился (закрыл страницу/перезагрузил/у него пропал интернет)
  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);
    if (socket.data.user) {
      socket.data.user.status = ConnectionStatus.Yellow;
    }
  });
});


server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
