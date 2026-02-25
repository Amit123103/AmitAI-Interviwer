import { io } from 'socket.io-client';

const socket = io('http://localhost:5001', {
    transports: ['websocket']
});

socket.on('connect', () => {
    print('Connected to server!');
    socket.emit('join-interview', {
        userId: 'test_user_123',
        difficulty: 'Intermediate',
        sector: 'FAANG',
        persona: 'Friendly Mentor'
    });
});

socket.on('ai-response', (data) => {
    print('\n[SUCCESS] AI Response Received:');
    print('Text:', data.text);
    print('Audio Length:', data.audio ? data.audio.length : 0);
    print('isLast:', data.isLast);
    process.exit(0);
});

socket.on('error', (err) => {
    print('\n[ERROR] Socket Error:', err);
    process.exit(1);
});

socket.on('connect_error', (err) => {
    print('\n[ERROR] Connection Error:', err.message);
    process.exit(1);
});

function print(...args: any[]) {
    console.log(...args);
}

// Timeout after 15 seconds
setTimeout(() => {
    print('\n[TIMEOUT] AI did not respond in time.');
    process.exit(1);
}, 15000);
