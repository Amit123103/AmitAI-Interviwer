console.log("Starting socket test...");
try {
    const socketIo = require('socket.io');
    console.log("Required socket.io:", typeof socketIo);

    // Check if Server exists
    if (socketIo.Server) {
        console.log("socket.io.Server exists");
    } else {
        console.log("socket.io.Server MISSING");
    }

    // Try detailed import
    const { Server } = require('socket.io');
    console.log("Destructured Server:", typeof Server);

    // Try importing index
    console.log("Require ./socket/index...");
    const socketIndex = require('./socket/index');
    console.log("Imported socket/index:", socketIndex);

} catch (e) {
    console.error("Socket test failed:", e);
}
