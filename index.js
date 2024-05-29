const express = require('express')
const connectDB = require("./config/db")
const dotenv = require('dotenv')
const authRouter = require('./routes/auth.route')
const postRouter = require('./routes/post.route')
const searchRouter = require('./routes/search.route')
const timelineRouter = require('./routes/timeline.route')
const userRouter = require('./routes/user.route')
const cors = require('cors')


dotenv.config()
const app = express();
connectDB()
const allowedOrigins = [process.env.ALLOWED_ORIGIN]
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));


app.use(express.json())
// parse application/x-www-form-urlencoded, basically can only parse incoming Request Object if strings or arrays
app.use(express.urlencoded({ extended: false }))
app.use('/api', userRouter)
app.use('/api', postRouter)
app.use('/api', searchRouter)
app.use('/api', timelineRouter)
app.use('/auth', authRouter)

const PORT = process.env.PORT
app.listen(PORT,  console.log('server running'))
