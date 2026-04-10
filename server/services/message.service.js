import Message from '../models/Message.model.js';
import User from '../models/User.model.js';
import mongoose from 'mongoose';

export const saveMessage = async (sender, recipient, text) => {
  const m = new Message({ sender, recipient, text });
  return m.save();
};

export const getConversation = async (userA, userB) => {
  return Message.find({
    $or: [
      { sender: userA, recipient: userB },
      { sender: userB, recipient: userA }
    ]
  }).sort({ createdAt: 1 });
};

export const markConversationRead = async (userA, userB) => {
  return Message.updateMany({ sender: userB, recipient: userA, read: false }, { $set: { read: true } });
};

export const getConversations = async (userId) => {
  // safer JS-based implementation: find messages involving user and aggregate in JS
  const msgs = await Message.find({ $or: [{ sender: userId }, { recipient: userId }] }).sort({ createdAt: -1 }).lean();

  const map = new Map();
  for (const m of msgs) {
    const otherId = String(m.sender) === String(userId) ? String(m.recipient) : String(m.sender);
    if (!map.has(otherId)) {
      map.set(otherId, { lastMessage: { text: m.text, sender: m.sender, recipient: m.recipient, createdAt: m.createdAt }, unreadCount: 0 });
    }
    // count unread messages where I'm the recipient
    if (String(m.recipient) === String(userId) && !m.read) {
      const current = map.get(otherId);
      current.unreadCount = (current.unreadCount || 0) + 1;
      map.set(otherId, current);
    }
  }

  const others = Array.from(map.keys());
  if (others.length === 0) return [];

  const users = await User.find({ _id: { $in: others } }).select('name email avatar lastSeen').lean();
  const usersById = new Map(users.map(u => [String(u._id), u]));

  // build result array ordered by lastMessage.createdAt desc (msgs already sorted)
  const result = [];
  for (const otherId of others) {
    const item = map.get(otherId);
    const user = usersById.get(String(otherId));
    if (!user) continue;
    result.push({ user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar }, lastMessage: item.lastMessage, unreadCount: item.unreadCount || 0 });
  }

  return result;
};
