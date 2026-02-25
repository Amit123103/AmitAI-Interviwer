const { io } = require('socket.io-client');

const socket = io('http://localhost:5001', {
    transports: ['websocket']
});

socket.on('connect', () => {
    console.log('Connected to server!');
    socket.emit('join-interview', {
        userId: '6990d4d4ee93deaa535455a5',
        role: 'candidate',
        difficulty: 'Intermediate',
        sector: 'FAANG',
        persona: 'Friendly Mentor'
    });
});

socket.on('ai-response', (data) => {
    console.log('\n[SUCCESS] AI Response Received:');
    console.log('Text:', data.text);
    console.log('Audio:', data.audio ? 'Received (len=' + data.audio.length + ')' : 'None');
    console.log('isLast:', data.isLast);
    process.exit(0);
});

socket.on('error', (err) => {
    console.log('\n[ERROR] Socket Error:', err);
    process.exit(1);
});

socket.on('connect_error', (err) => {
    console.log('\n[ERROR] Connection Error:', err.message);
    process.exit(1);
});

// Timeout after 30 seconds (AI might take a while to "think")
setTimeout(() => {
    console.log('\n[TIMEOUT] AI did not respond in time.');
    process.exit(1);
}, 30000);
