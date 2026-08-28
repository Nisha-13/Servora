import { Router } from 'express';
import { ConversationController, MessageController } from '../controllers/conversationController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { uploadMultipleImages } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.use(authenticate);

// Conversations
router.post('/', ConversationController.getOrCreate);
router.get('/', ConversationController.getUserConversations);
router.get('/:id', ConversationController.getById);

// Messages in conversation
router.get('/:conversationId/messages', MessageController.getMessages);
router.post('/:conversationId/messages', uploadMultipleImages('attachments', 3), MessageController.sendMessage);
router.patch('/:conversationId/read', MessageController.markRead);

export default router;
