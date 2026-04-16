import { saveMessage, getConversation, getConversations, markConversationRead, deleteConversation } from '../services/message.service.js';
import User from '../models/User.model.js';

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { recipient, text } = req.body;
    if (!recipient || !text) return res.status(400).json({ message: 'recipient and text required' });

    const sender = await User.findById(senderId);
    const recipientUser = await User.findById(recipient);
    if (!sender || !recipientUser) return res.status(404).json({ message: 'User not found' });

    const related = sender.followers.includes(recipient) || sender.following.includes(recipient) || recipientUser.followers.includes(senderId) || recipientUser.following.includes(senderId);
    if (!related) return res.status(403).json({ message: 'Not allowed to message this user' });

    const message = await saveMessage(senderId, recipient, text);
    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getConversationController = async (req, res) => {
  try {
    const userA = req.user.id;
    const userB = req.params.id;
    // mark unread messages as read for this conversation
    await markConversationRead(userA, userB);
    const conv = await getConversation(userA, userB);
    res.status(200).json(conv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getConversationsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const convs = await getConversations(userId);
    res.status(200).json(convs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteConversationController = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherId = req.params.id;
    await deleteConversation(userId, otherId);
    res.status(200).json({ message: 'Conversation deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
