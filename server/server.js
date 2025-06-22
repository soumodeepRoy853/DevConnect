import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import connectDb from './config/connectDb.js';
import userRouter from './routes/user.route.js';


//app config
const app = express();
const port = process.env.PORT || 5000;
connectDb();

// middleware
app.use(express.json())
app.use(cors());

// api endpoint
app.use('/api/user', userRouter)

app.get('/', (req, res) => {
    res.send("Api Working")
});

app.listen(port, () => {
    console.log(`Server running on ${port}`)
})