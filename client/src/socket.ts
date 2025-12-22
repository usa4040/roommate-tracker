import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from './api/config';

export const socket: Socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
});

// Connection event handlers
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('connect_error', (error: Error) => {
    console.error('Connection error:', error);
});

export default socket;
