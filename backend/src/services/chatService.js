import { chatRepository } from '../repositories/chatRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { notificationService } from './notificationService.js';
import { emitToRoom, emitToUser } from '../sockets/socketHandler.js';
import { SOCKET_EVENTS } from '../sockets/socketEvents.js';
import { NOTIFICATION_TYPES } from '../constants/notificationTypes.js';
import { AppError } from '../utils/appError.js';

export class ChatService {
  async getOrCreateConversation(userId, targetUserId, bookingId = null) {
    if (userId.toString() === targetUserId.toString()) {
      throw new AppError('Cannot create conversation with yourself', 400);
    }

    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) throw new AppError('User not found', 404);

    return chatRepository.findOrCreateConversation(userId, targetUserId, bookingId);
  }

  async getUserConversations(userId) {
    return chatRepository.findUserConversations(userId);
  }

  async getConversationById(conversationId, user) {
    const conversation = await chatRepository.findConversationById(conversationId);
    if (!conversation) throw new AppError('Conversation not found', 404);

    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === user._id.toString()
    );
    if (!isParticipant && user.role !== 'ADMIN') {
      throw new AppError('You are not authorized to access this conversation', 403);
    }

    return conversation;
  }

  async getMessages(conversationId, user, options) {
    await this.getConversationById(conversationId, user);
    // Mark messages as read for this user
    await chatRepository.markMessagesAsRead(conversationId, user._id);
    return chatRepository.getConversationMessages(conversationId, options);
  }

  async sendMessage(conversationId, user, { text, attachments = [] }) {
    const conversation = await this.getConversationById(conversationId, user);

    const recipient = conversation.participants.find(
      (p) => p._id.toString() !== user._id.toString()
    );

    if (!recipient) {
      throw new AppError('Recipient not found in this conversation', 400);
    }

    const message = await chatRepository.createMessage({
      conversation: conversationId,
      sender: user._id,
      recipient: recipient._id,
      text,
      attachments
    });

    await chatRepository.updateConversationLastMessage(conversationId, text, user._id);

    const populatedMessage = await message.populate('sender', 'name avatar role');

    // Emit live to conversation room
    emitToRoom(`conv_${conversationId}`, SOCKET_EVENTS.CHAT_MESSAGE_NEW, populatedMessage);

    // Persist and emit notification to recipient
    await notificationService.sendNotification({
      recipient: recipient._id,
      sender: user._id,
      type: NOTIFICATION_TYPES.NEW_MESSAGE,
      title: `New message from ${user.name}`,
      message: text.slice(0, 80),
      data: { conversationId, messageId: message._id }
    });

    return populatedMessage;
  }

  async markAsRead(conversationId, user) {
    await chatRepository.markMessagesAsRead(conversationId, user._id);
    emitToRoom(`conv_${conversationId}`, SOCKET_EVENTS.CHAT_MESSAGES_READ, {
      conversationId,
      userId: user._id
    });
    return { success: true };
  }
}

export const chatService = new ChatService();
