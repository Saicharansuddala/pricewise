import { io } from 'socket.io-client';

let socket;

export const connectSocket = async (getToken) => {
  if (socket) return socket;
  
  const token = await getToken();
  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
    auth: { token }
  });

  socket.on('connect', () => {
    console.log('Connected to socket server');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const onEvent = (event, callback) => {
  if (socket) socket.on(event, callback);
};

export const offEvent = (event, callback) => {
  if (socket) socket.off(event, callback);
};
