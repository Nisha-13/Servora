import { Server } from 'socket.io';
import { socketAuthMiddleware } from './socketAuth.js';
import { SOCKET_EVENTS } from './socketEvents.js';
import { Conversation } from '../models/Conversation.js';
import { logger } from '../utils/logger.js';

let ioInstance = null;

export const initSocket = (httpServer, clientUrl) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000'],
      credentials: true,
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    logger.info(`[Socket Connected] User ${socket.user.name} (${userId}) connected on socket ${socket.id}`);

    // Join user's personal private room for direct notifications and updates
    socket.join(`user_${userId}`);

    // Join specific chat conversation room
    socket.on(SOCKET_EVENTS.CHAT_JOIN_ROOM, async (conversationId) => {
      try {
        // Verify user is authorized participant in conversation
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId
        });

        if (conversation) {
          socket.join(`conv_${conversationId}`);
          logger.debug(`User ${userId} joined room conv_${conversationId}`);
        }
      } catch (err) {
        logger.error(`[Socket Join Room Error]: ${err.message}`);
      }
    });

    // Leave conversation room
    socket.on(SOCKET_EVENTS.CHAT_LEAVE_ROOM, (conversationId) => {
      socket.leave(`conv_${conversationId}`);
      logger.debug(`User ${userId} left room conv_${conversationId}`);
    });

    // Typing indicator
    socket.on(SOCKET_EVENTS.CHAT_TYPING_START, ({ conversationId, recipientId }) => {
      socket.to(`conv_${conversationId}`).emit(SOCKET_EVENTS.CHAT_TYPING_START, {
        conversationId,
        senderId: userId,
        senderName: socket.user.name
      });
    });

    socket.on(SOCKET_EVENTS.CHAT_TYPING_STOP, ({ conversationId, recipientId }) => {
      socket.to(`conv_${conversationId}`).emit(SOCKET_EVENTS.CHAT_TYPING_STOP, {
        conversationId,
        senderId: userId
      });
    });

    socket.on('disconnect', (reason) => {
      logger.info(`[Socket Disconnected] User ${userId} disconnected: ${reason}`);
    });
  });

  ioInstance = io;
  return io;
};

export const getIO = () => {
  return ioInstance;
};

export const emitToUser = (userId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`user_${userId.toString()}`).emit(event, data);
  }
};

export const emitToRoom = (room, event, data) => {
  if (ioInstance) {
    ioInstance.to(room).emit(event, data);
  }
};

export const emitToAll = (event, data) => {
  if (ioInstance) {
    ioInstance.emit(event, data);
  }
};
