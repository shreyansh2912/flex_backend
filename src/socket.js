const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const socketController = require('./controllers/socket.controller');

const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: (origin, callback) => callback(null, true),
            methods: ["GET", "POST"],
            credentials: true
        },
        path: "/socket.io/",
        transports: ['websocket', 'polling']
    });

    const JWT_SECRET = process.env.JWT_SECRET;

    // Socket.io Authentication Middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        const guestId = socket.handshake.auth?.guestId;

        if (!token) {
            socket.user = { _id: guestId || 'anonymous', name: 'Anonymous' };
            return next();
        }

        const cleanToken = token.toString().replace(/^Bearer\s+/i, '').trim();

        jwt.verify(cleanToken, JWT_SECRET, (err, decoded) => {
            if (err) {
                // If token is invalid, fallback to anonymous instead of erroring
                socket.user = { _id: guestId || 'anonymous', name: 'Anonymous' };
                return next();
            }
            socket.user = decoded;
            // Map userId to _id if present (from auth controller)
            if (socket.user.userId && !socket.user._id) {
                socket.user._id = socket.user.userId;
            }
            // Attach guestId to socket user for dual-auth checks
            if (guestId) {
                socket.user.guestId = guestId;
            }
            next();
        });
    });

    // Main connection handler
    io.on('connection', (socket) => {
        socketController.handleConnection(socket, io);
    });

    return io;
};

module.exports = { initSocket };
