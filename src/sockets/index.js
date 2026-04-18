const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { isOriginAllowed, jwtSecret, jwtAdminSecret } = require('../config/env');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Admin = require('../models/Admin');

let ioInstance = null;

const getTokenFromSocket = (socket) => {
  const authToken = socket.handshake.auth && socket.handshake.auth.token;
  if (authToken) return String(authToken).replace(/^Bearer\s+/i, '').trim();

  const header = socket.handshake.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.replace('Bearer ', '').trim();
  return null;
};

const authenticateSocket = async (socket) => {
  const token = getTokenFromSocket(socket);
  if (!token) return null;

  try {
    const payload = jwt.verify(token, jwtSecret);
    if (payload.role === 'user') {
      const user = await User.findById(payload.sub).select('_id');
      if (user) return { role: 'user', id: user._id.toString() };
    }
  } catch (err) {
    // Fall through to admin token verification.
  }

  try {
    const payload = jwt.verify(token, jwtAdminSecret);
    if (payload.role === 'admin') {
      const admin = await Admin.findById(payload.sub).select('_id');
      if (admin) return { role: 'admin', id: admin._id.toString() };
    }
  } catch (err) {
    return null;
  }

  return null;
};

const canJoinRoom = async (actor, room) => {
  if (room.startsWith('public:')) return true;
  if (!actor) return false;

  if (room.startsWith('user:')) return room === `user:${actor.id}`;
  if (room.startsWith('admin:')) return actor.role === 'admin' && room === `admin:${actor.id}`;

  if (room.startsWith('conversation:')) {
    const conversationId = room.slice('conversation:'.length);
    if (!conversationId) return false;
    if (actor.role === 'admin') return true;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: actor.id
    }).select('_id');
    return Boolean(conversation);
  }

  return false;
};

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

  ioInstance.use(async (socket, next) => {
    try {
      socket.data.actor = await authenticateSocket(socket);
      next();
    } catch (err) {
      socket.data.actor = null;
      next();
    }
  });

  ioInstance.on('connection', (socket) => {
    socket.on('join', async (room) => {
      if (!room || typeof room !== 'string') return;
      if (!(await canJoinRoom(socket.data.actor, room))) return;
      socket.join(room);
    });

    socket.on('message', async (payload) => {
      if (payload && payload.room && (await canJoinRoom(socket.data.actor, payload.room))) {
        socket.to(payload.room).emit('message', payload);
      }
    });
  });

  return ioInstance;
};

const getIo = () => ioInstance;

module.exports = { setupSocket, getIo };
