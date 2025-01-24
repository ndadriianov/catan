import express from 'express';
import {createServer} from 'http';
import {Server, Socket} from 'socket.io';
import cors from 'cors';
import {User} from './typesDefinitions/User';
import {Room} from './typesDefinitions/Room';


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

const users: Array<User> = [];
const rooms: Array<Room> = [];


io.on('connection', (socket: Socket): void => {
  console.log(`Client connected: ${socket.id}`);
  
  
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
  
  
  socket.on('login', (username: string, password: string, callback: (succeed: boolean) => void): void => {
    const user: User|undefined = users.find((user: User): boolean => user.username === username);
    if (user && user.password === password) {
      socket.data.user = user;
      callback(true);
    } else {
      callback(false);
    }
  });
  
  
  socket.on('show-rooms', (callback: (res: Array<number>) => void): void => {
    callback(rooms.map((room: Room): number =>  room.id));
  });
  
  
  socket.on('create-room', (id: number, callback: (succeed: boolean) => void): void => {
    if (rooms.find((room: Room): boolean => room.id === id)) {
      callback(false);
      return;
    }
    const room: Room = new Room(id);
    rooms.push(room);
    room.addPlayer(socket.data.user.username);
    io.emit('update-room-list', rooms.map((room: Room): number => room.id));
    console.log(rooms);
    socket.data.user.activeRoom = room;
    socket.join(id.toString());
    callback(true);
  });
  
  
  socket.on('load-room', (id: number, callback: (currentRoom: any) => void): void => {
    const room: Room|undefined = rooms.find((room: Room): boolean => room.id === id);
    socket.join(id.toString());
    callback(room ? room.toJSON() : null);
  });
  
  
  socket.on('go-back-to-choose', (id: number) => {
    socket.leave(id.toString());
    const room = rooms.find((room: Room): boolean => room.id === id);
    if (room) {
      console.log(room.removePlayer(socket.data.user.username));
      console.log(rooms);
      updateRoomState(room);
    }
  })
  
  
  socket.on('join-room', (id: number, callback: (succeed: boolean) => void): void => {
    const room: Room|undefined = rooms.find((room: Room): boolean => room.id === id);
    if (!room) {
      callback(false);
      return;
    }
    if (room.addPlayer(socket.data.user.username)) {
      updateRoomState(room);
      callback(true);
    }
    callback(false);
  });
  
  
  
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});


server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});




function updateRoomState(room: Room) {
  io.to(room.id.toString()).emit('room-update', room.toJSON());
}