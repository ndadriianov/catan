import { io } from 'socket.io-client';


const server = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
console.log(server);
const socket = io(server); // Адрес сервера
export default socket;
