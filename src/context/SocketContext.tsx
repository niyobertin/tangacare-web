import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        console.log('[SocketContext] Mounting SocketProvider, checking user and token for socket connection.');
        const token = localStorage.getItem('access_token');

        if (!user || !token) {
            console.log('[SocketContext] No user or token found. Disconnecting existing socket if any.');
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        const apiUrl = import.meta.env.VITE_API || 'http://localhost:3000';
        const socketUrl = apiUrl.replace(/\/api\/?$/, '');

        console.log('[SocketContext] Connecting to socket at:', socketUrl);

        const socketInstance = io(socketUrl, {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling'],
            path: '/socket.io/', // Standard path, ensuring we don't accidentally inherit strange paths
            reconnectionAttempts: 5
        });

        socketInstance.on('connect', () => {
            console.log('Connected to Socket.IO server');
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Disconnected from Socket.IO server');
            setIsConnected(false);
        });

        socketInstance.on('error', (error: any) => {
            console.error('[SocketContext] Socket error:', error);
        });

        socketInstance.on('connect_error', (err) => {
            console.error('[SocketContext] Connection Error:', err.message);
        });

        console.log('[SocketContext] Initializing socket for user:', user.id, 'at', import.meta.env.VITE_API || 'http://localhost:3000');

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
