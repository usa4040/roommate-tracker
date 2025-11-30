import { io, Socket } from 'socket.io-client';

// Remove '/api' suffix from VITE_API_URL if present
const apiUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const SOCKET_URL: string = apiUrl.replace('/api', '');

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
