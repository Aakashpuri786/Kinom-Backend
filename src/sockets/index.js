const { Server } = require('socket.io');
const { isOriginAllowed } = require('../config/env');

let ioInstance = null;

const setupSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin(origin, callback) {
        if (isOriginAllowed(origin)) return callback(null, true);
        return callback(new Error('Origin not allowed by Socket.IO'));
      },
      methods: ['GET', 'POST']
    }
  });

  ioInstance.on('connection', (socket) => {
    socket.on('join', (room) => {
      if (room) socket.join(room);
    });

    socket.on('message', (payload) => {
      if (payload && payload.room) {
        socket.to(payload.room).emit('message', payload);
      }
    });
  });

  return ioInstance;
};

const getIo = () => ioInstance;

module.exports = { setupSocket, getIo };
