import { io } from 'socket.io-client';

// const socket = io('http://192.168.1.72:4000');
const socket = io('http://localhost:4000'); // Адрес сервера
export default socket;
