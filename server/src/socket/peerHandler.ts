import { Server, Socket } from 'socket.io';

interface PeerUser {
    socketId: string;
    roomId: string;
    userId?: string; // Optional: map to DB user ID if authenticated
}

const users: { [key: string]: PeerUser } = {};

export const handlePeerEvents = (io: Server, socket: Socket) => {
    // Join Room
    socket.on('join-room', (roomId: string, userId: string) => {
        socket.join(roomId);
        users[socket.id] = { socketId: socket.id, roomId, userId };

        console.log(`User ${socket.id} joined room ${roomId}`);

        // Notify others in room
        socket.to(roomId).emit('user-connected', socket.id);

        // Send existing users to new user (simple 2-peer logic for now)
        const roomUsers = Object.values(users).filter(u => u.roomId === roomId && u.socketId !== socket.id);
        if (roomUsers.length > 0) {
            // Tell the new user about the existing peer(s)
            // For simple-peer mesh, usually the new user initiates
            // usage varies, but here we just notify availability
            socket.emit('existing-peers', roomUsers.map(u => u.socketId));
        }
    });

    // WebRTC Signaling (Offer, Answer, Candidates)
    socket.on('signal', (data: { to: string; signal: any }) => {
        io.to(data.to).emit('signal', {
            from: socket.id,
            signal: data.signal
        });
    });

    // Code Change
    socket.on('code-change', (data: { roomId: string; code: string }) => {
        socket.to(data.roomId).emit('code-change', data.code);
    });

    // Chat Message
    socket.on('chat-message', (data: { roomId: string; message: string; sender: string }) => {
        socket.to(data.roomId).emit('chat-message', {
            message: data.message,
            sender: data.sender,
            timestamp: new Date()
        });
    });

    // Disconnect
    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            console.log(`User ${socket.id} left room ${user.roomId}`);
            socket.to(user.roomId).emit('user-disconnected', socket.id);
            delete users[socket.id];
        }
    });
};
