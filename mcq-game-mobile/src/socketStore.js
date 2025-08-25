import { create } from 'zustand';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSocketStore = create((set, get) => ({
    socket: null,
    connected: false,

    initSocket: async () => {
        const existing = get().socket;
        if (existing) return;

        const socket = io('http://10.249.1.23:3001', {
            withCredentials: true,
            autoConnect: false,
        });

        socket.on('connect', async () => {
            console.log('Socket connected:', socket.id);
            alert('connected')
            const userId = await AsyncStorage.getItem('name');

            if (userId) {
                socket.emit('register_user', userId);
            }
            set({ connected: true });
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            set({ connected: false });
        });

        set({ socket: socket });

        return
    },

    connectSocket: () => {
        const socket = get().socket;
        if (socket && !get().connected) {
            socket.connect();
        }
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket && get().connected) {
            socket.disconnect();
        }
    },
}));
