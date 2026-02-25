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

let greetingReceived = false;

socket.on('ai-response', (data) => {
    if (!greetingReceived) {
        console.log('\n[SUCCESS] AI Greeting Received:', data.text);
        greetingReceived = true;

        console.log('Sending audio response...');
        const dummyAudio = Buffer.alloc(1000);
        socket.emit('audio-response', {
            audio: dummyAudio,
            emotion: 'Happy',
            focusScore: 95
        });
    } else {
        console.log('\n[SUCCESS] AI Follow-up Received:');
        console.log('Text:', data.text);
        console.log('Audio:', data.audio ? 'Received (len=' + data.audio.length + ')' : 'None');
        console.log('isLast:', data.isLast);
        process.exit(0);
    }
});

socket.on('error', (err) => {
    console.log('\n[ERROR] Socket Error:', err);
    process.exit(1);
});

socket.on('connect_error', (err) => {
    console.log('\n[ERROR] Connection Error:', err.message);
    process.exit(1);
});

// Timeout after 120 seconds
setTimeout(() => {
    console.log('\n[TIMEOUT] AI did not respond in time.');
    process.exit(1);
}, 120000);
