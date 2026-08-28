import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

export class ChatRepository {
  async findOrCreateConversation(participant1Id, participant2Id, bookingId = null) {
    let conversation = await Conversation.findOne({
      participants: { $all: [participant1Id, participant2Id] }
    }).populate('participants', 'name email avatar role');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [participant1Id, participant2Id],
        booking: bookingId,
        unreadCount: {
          [participant1Id.toString()]: 0,
          [participant2Id.toString()]: 0
        }
      });
      conversation = await conversation.populate('participants', 'name email avatar role');
    }

    return conversation;
  }

  async findConversationById(conversationId) {
    return Conversation.findById(conversationId)
      .populate('participants', 'name email avatar role providerProfile')
      .populate('booking');
  }

  async findUserConversations(userId) {
    return Conversation.find({
      participants: userId
    })
      .populate('participants', 'name email avatar role providerProfile')
      .populate({
        path: 'booking',
        select: 'bookingNumber status service',
        populate: { path: 'service', select: 'name' }
      })
      .sort({ lastMessageAt: -1 });
  }

  async createMessage(data) {
    return Message.create(data);
  }

  async getConversationMessages(conversationId, { page = 1, limit = 50 } = {}) {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      Message.find({ conversation: conversationId })
        .populate('sender', 'name avatar')
        .populate('recipient', 'name avatar')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ conversation: conversationId })
    ]);
    return { messages, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async markMessagesAsRead(conversationId, recipientId) {
    await Message.updateMany(
      { conversation: conversationId, recipient: recipientId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    // Reset unread count for recipient
    const conv = await Conversation.findById(conversationId);
    if (conv && conv.unreadCount) {
      conv.unreadCount.set(recipientId.toString(), 0);
      await conv.save();
    }
  }

  async updateConversationLastMessage(conversationId, lastMessage, senderId) {
    const conv = await Conversation.findById(conversationId);
    if (conv) {
      conv.lastMessage = lastMessage;
      conv.lastMessageSender = senderId;
      conv.lastMessageAt = new Date();
      // Increment unread count for other participants
      conv.participants.forEach((pId) => {
        if (pId.toString() !== senderId.toString()) {
          const current = conv.unreadCount?.get(pId.toString()) || 0;
          conv.unreadCount.set(pId.toString(), current + 1);
        }
      });
      await conv.save();
    }
    return conv;
  }
}

export const chatRepository = new ChatRepository();
