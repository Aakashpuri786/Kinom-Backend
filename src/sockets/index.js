const { Server } = require('socket.io');
const { corsOrigins } = require('../config/env');

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: corsOrigins.includes('*') ? '*' : corsOrigins,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    socket.on('join', (room) => {
      if (room) socket.join(room);
    });

    socket.on('message', (payload) => {
      if (payload && payload.room) {
        socket.to(payload.room).emit('message', payload);
      }
    });
  });
};

module.exports = { setupSocket };
