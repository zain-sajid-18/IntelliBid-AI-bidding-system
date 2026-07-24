import { io } from 'socket.io-client';

const BASE_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socket = null;

// Extract the JWT token from cookies (browser-side)
const getTokenFromCookie = () => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.split(';').find(c => c.trim().startsWith('token='));
    return match ? match.split('=')[1] : null;
};

export const getSocket = () => {
    if (!socket) {
        socket = io(BASE_URL, {
            withCredentials: true,
            autoConnect: false,
            auth: (cb) => {
                cb({ token: getTokenFromCookie() });
            },
        });

        socket.on('connect_error', (err) => {
            // Suppress auth errors silently — user may not be logged in yet
            if (err.message !== 'Authentication required') {
                console.warn('[Socket] Connection error:', err.message);
            }
        });
    }
    return socket;
};

export const connectSocket = () => {
    const s = getSocket();
    if (!s.connected) s.connect();
    return s;
};

export const disconnectSocket = () => {
    if (socket?.connected) socket.disconnect();
};
