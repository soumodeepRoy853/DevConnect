import express from 'express';
import authUser from '../middleware/auth.middleware.js';
import { sendMessage, getConversationController, getConversationsController, deleteConversationController } from '../controllers/message.controller.js';

const router = express.Router();

router.post('/', authUser, sendMessage);
router.get('/conversations', authUser, getConversationsController);
router.delete('/conversation/:id', authUser, deleteConversationController);
router.get('/:id', authUser, getConversationController);

export default router;
