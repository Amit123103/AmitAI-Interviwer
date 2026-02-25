import { Server, Socket } from 'socket.io';

export const handleCollaborationEvents = (io: Server, socket: Socket) => {

    // JOIN ROOM
    socket.on('join-room', (roomId: string, userId: string) => {
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);

        // Notify others in room
        socket.to(roomId).emit('user-connected', userId);

        socket.on('disconnect', () => {
            console.log(`User ${userId} disconnected from room ${roomId}`);
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });

    // WEBRTC SIGNALING
    socket.on('offer', (payload: any) => {
        // payload: { target: string, caller: string, sdp: any }
        io.to(payload.target).emit('offer', payload);
    });

    socket.on('answer', (payload: any) => {
        // payload: { target: string, caller: string, sdp: any }
        io.to(payload.target).emit('answer', payload);
    });

    socket.on('ice-candidate', (payload: any) => {
        // payload: { target: string, candidate: any }
        io.to(payload.target).emit('ice-candidate', payload);
    });

    // CHAT
    socket.on('chat-message', (roomId: string, message: any) => {
        // message: { sender: string, text: string, timestamp: string }
        socket.to(roomId).emit('chat-message', message);
    });

    // COLLABORATIVE CODING (Simple Broadcast)
    socket.on('code-change', (roomId: string, code: string) => {
        socket.to(roomId).emit('code-update', code);
    });

    socket.on('cursor-move', (roomId: string, position: any) => {
        // position: { userId: string, lineNumber: number, column: number }
        socket.to(roomId).emit('cursor-update', position);
    });

    // WHITEBOARD
    socket.on('whiteboard-draw', (roomId: string, data: any) => {
        // data: drawing coordinates/paths
        socket.to(roomId).emit('whiteboard-draw', data);
    });

    socket.on('whiteboard-clear', (roomId: string) => {
        socket.to(roomId).emit('whiteboard-clear');
    });
};
