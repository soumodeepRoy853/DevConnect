import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Server as IOServer } from 'socket.io';
import connectDb from './config/connectDb.js';
import userRouter from './routes/user.route.js';
import profileRouter from './routes/profile.route.js';
import postRouter from './routes/post.route.js';
import followRouter from './routes/follow.route.js';
import searchRouter from './routes/search.routes.js';
import uploadRouter from './routes/upload.route.js';
import messageRouter from './routes/message.route.js';
import User from './models/User.model.js';
import Message from './models/Message.model.js';


// app config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();
const port = process.env.PORT || 5000;
connectDb();

// middleware
app.use(express.json())
const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:3000", "https://devconnect.soumodeep.me", "https://dev-connect-jb8j.vercel.app"]; 
app.use(
	cors({
		origin: allowedOrigins,
		credentials: true,
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);

// api endpoint
app.use('/api/user', userRouter);
app.use('/api/profile', profileRouter);
app.use('/api/post', postRouter);
app.use('/api/follow', followRouter);
app.use('/api/search/', searchRouter);
app.use("/api/upload", uploadRouter);
app.use('/api/message', messageRouter);

app.use("/uploads", express.static("uploads"));


app.get('/', (req, res) => {
	res.send("Api Working")
});

// create http server and attach socket.io
const server = http.createServer(app);
const io = new IOServer(server, {
	cors: {
		origin: allowedOrigins,
		credentials: true,
	},
});

// Track online users and broadcast presence events
const onlineUsers = new Set();

// socket auth middleware (validate JWT)
io.use((socket, next) => {
	try {
		const token = socket.handshake.auth?.token || (socket.handshake.headers && socket.handshake.headers.authorization && socket.handshake.headers.authorization.split(' ')[1]);
		if (!token) return next(new Error('Unauthorized'));
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		socket.userId = decoded.id;
		next();
	} catch (err) {
		next(new Error('Unauthorized'));
	}
});

io.on('connection', (socket) => {
	console.log('Socket connected', socket.userId);
	socket.join(socket.userId);

	// add to online users and notify others
	try {
		onlineUsers.add(String(socket.userId));
		// clear lastSeen for this user (now online)
		(async () => {
			try {
				await User.findByIdAndUpdate(socket.userId, { lastSeen: null });
			} catch (e) {}
		})();
		io.emit('user_online', String(socket.userId));
		// send current online list to the connecting socket
		socket.emit('online_users', Array.from(onlineUsers));
	} catch (e) {
		// ignore
	}

	socket.on('private_message', async ({ to, text }) => {
		try {
			if (!to || !text) return;
			const senderId = socket.userId;
			const recipientId = to;

			const sender = await User.findById(senderId).lean();
			const recipient = await User.findById(recipientId).lean();
			if (!sender || !recipient) return;

			const related =
				(sender.followers && sender.followers.find(id => id.toString() === recipientId.toString())) ||
				(sender.following && sender.following.find(id => id.toString() === recipientId.toString())) ||
				(recipient.followers && recipient.followers.find(id => id.toString() === senderId.toString())) ||
				(recipient.following && recipient.following.find(id => id.toString() === senderId.toString()));

			if (!related) {
				socket.emit('error_message', { message: 'Not allowed to message this user' });
				return;
			}

			const message = await Message.create({ sender: senderId, recipient: recipientId, text });
			io.to(recipientId.toString()).emit('new_message', message);
			io.to(senderId.toString()).emit('new_message', message);
		} catch (err) {
			console.error('private_message error', err);
		}
	});

	socket.on('disconnect', () => {
		console.log('Socket disconnected', socket.userId);
		(async () => {
			try {
				onlineUsers.delete(String(socket.userId));
				const u = await User.findByIdAndUpdate(socket.userId, { lastSeen: new Date() }, { new: true }).lean();
				io.emit('user_offline', { id: String(socket.userId), lastSeen: u?.lastSeen || new Date() });
			} catch (e) {}
		})();
	});
});

server.listen(port, () => {
	console.log(`Server running on ${port}`);
});