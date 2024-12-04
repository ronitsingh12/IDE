import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import ACTIONS from './src/Actions.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const userSocketMap = {}; // Maps socket ID to username
const roomClients = {}; // Maps room ID to the set of usernames

// Middleware to parse JSON requests
app.use(express.json());

function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.sockets.values()).filter(
        (socket) => socket.rooms.has(roomId)
    );
}

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        // Check if the username is already in the room
        if (roomClients[roomId] && roomClients[roomId].has(username)) {
            socket.emit('USERNAME_TAKEN'); // Emit a message to the client
            return;
        }

        // If not, add the user to the room
        userSocketMap[socket.id] = username;
        socket.join(roomId);

        // Initialize roomClients if not already done
        if (!roomClients[roomId]) {
            roomClients[roomId] = new Set();
        }
        roomClients[roomId].add(username);

        const clients = getAllConnectedClients(roomId).map((s) => ({
            socketId: s.id,
            username: userSocketMap[s.id],
        }));

        socket.to(roomId).emit(ACTIONS.JOINED, { clients, username });
        socket.emit(ACTIONS.JOINED, { clients, username });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, content }) => {
        socket.to(roomId).emit(ACTIONS.SYNC_CODE, content);
    });

    socket.on(ACTIONS.LEAVE, ({ roomId, username }) => {
        socket.leave(roomId);
        delete userSocketMap[socket.id];
    
        if (roomClients[roomId]) {
            roomClients[roomId].delete(username);
            if (roomClients[roomId].size === 0) {
                delete roomClients[roomId];
            }
        }
    
        const clients = getAllConnectedClients(roomId).map((s) => ({
            socketId: s.id,
            username: userSocketMap[s.id],
        }));
    
        io.to(roomId).emit(ACTIONS.DISCONNECTED, { clients, username });
    });
    
    
    socket.on('disconnect', () => {
        const username = userSocketMap[socket.id];
        const roomId = Object.keys(roomClients).find((room) =>
            roomClients[room]?.has(username)
        );
    
        if (roomId) {
            roomClients[roomId].delete(username);
            if (roomClients[roomId].size === 0) {
                delete roomClients[roomId];
            }
    
            const clients = getAllConnectedClients(roomId).map((s) => ({
                socketId: s.id,
                username: userSocketMap[s.id],
            }));
    
            io.to(roomId).emit(ACTIONS.DISCONNECTED, { clients, username });
        }
    
        delete userSocketMap[socket.id];
    });
        
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
