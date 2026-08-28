import { chatService } from '../services/chatService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class ConversationController {
  static async getOrCreate(req, res, next) {
    try {
      const { targetUserId, bookingId } = req.body;
      const conversation = await chatService.getOrCreateConversation(
        req.user._id,
        targetUserId,
        bookingId
      );
      return ApiResponse.success(res, 'Conversation retrieved', { conversation });
    } catch (err) {
      next(err);
    }
  }

  static async getUserConversations(req, res, next) {
    try {
      const conversations = await chatService.getUserConversations(req.user._id);
      return ApiResponse.success(res, 'Conversations retrieved', { conversations });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const conversation = await chatService.getConversationById(req.params.id, req.user);
      return ApiResponse.success(res, 'Conversation retrieved', { conversation });
    } catch (err) {
      next(err);
    }
  }
}

export class MessageController {
  static async getMessages(req, res, next) {
    try {
      const result = await chatService.getMessages(req.params.conversationId, req.user, req.query);
      return ApiResponse.success(res, 'Messages retrieved', result);
    } catch (err) {
      next(err);
    }
  }

  static async sendMessage(req, res, next) {
    try {
      let attachments = [];
      if (req.files && req.files.length > 0) {
        attachments = req.files.map((f) => ({
          url: `/uploads/${f.filename}`,
          fileName: f.originalname,
          fileType: f.mimetype.startsWith('image/') ? 'image' : 'file'
        }));
      }
      const text = req.body.text || req.body.content || req.body.message || '';
      const message = await chatService.sendMessage(req.params.conversationId, req.user, {
        text,
        attachments
      });
      return ApiResponse.created(res, 'Message sent successfully', { message });
    } catch (err) {
      next(err);
    }
  }

  static async markRead(req, res, next) {
    try {
      await chatService.markAsRead(req.params.conversationId, req.user);
      return ApiResponse.success(res, 'Messages marked as read');
    } catch (err) {
      next(err);
    }
  }
}
