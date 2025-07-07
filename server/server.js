import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import connectDb from './config/connectDb.js';
import userRouter from './routes/user.route.js';
import profileRouter from './routes/profile.route.js';
import postRouter from './routes/post.route.js';
import followRouter from './routes/follow.route.js';
import searchRouter from './routes/search.routes.js';
import uploadRouter from './routes/upload.route.js';


//app config
const app = express();
const port = process.env.PORT || 5000;
connectDb();

// middleware
app.use(express.json())
app.use(cors());

// api endpoint
app.use('/api/user', userRouter);
app.use('/api/profile', profileRouter);
app.use('/api/post', postRouter);
app.use('/api/follow', followRouter);
app.use('/api/search/', searchRouter);
app.use("/api/upload", uploadRouter);

app.use("/uploads", express.static("uploads"));


app.get('/', (req, res) => {
    res.send("Api Working")
});

app.listen(port, () => {
    console.log(`Server running on ${port}`)
})