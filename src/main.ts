import { loadEnvFile } from 'node:process'; 'node'
import assert from 'node:assert';
import express from 'express';
import session from 'express-session'
import cookieParser from 'cookie-parser'
import cors from 'cors'

loadEnvFile('.env');
const app = express();

app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.WEB_URL,
    credentials: true
}));
app.use(
    express.urlencoded({
        extended: true,
    })
);

assert(typeof process.env.SESSION_SECRET === "string")

app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: {
        maxAge: 7*24*3600*1000,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    },
    saveUninitialized: false,
    resave: false
}));
app.set('trust proxy', 1);

app.use(`${process.env.API_PATH}/auth/start`, require("./routes/auth/start.js"))  
app.use(`${process.env.API_PATH}/auth/final`, require("./routes/auth/final.js"))
app.use(`${process.env.API_PATH}/users`, require("./routes/user.js"))
app.use(`${process.env.API_PATH}/images`, require("./routes/image.js"))

app.use((err: any, _req: express.Request, res: express.Response, _next: any) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    
    res.status(statusCode).json({ message: err.message });
    return;
});

app.listen(process.env.PORT, () => {
    console.log(`api started yipee`);
});