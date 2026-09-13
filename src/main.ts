import { loadEnvFile } from 'node:process'; 'node'
import assert from 'node:assert';
import express from 'express';
import session, { Session } from 'express-session'
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

let cookie: session.CookieOptions = {
    maxAge: 7*24*3600*1000,
    sameSite: 'lax'
}

let sessionConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET?? "please just set the secret",
    saveUninitialized: false,
    resave: false
};

if (!(process.env.TESTING === "true")) {
    app.set('trust proxy', 1);
    cookie.secure = true;
    cookie.sameSite = 'strict'
}

sessionConfig.cookie = cookie
app.use(session(sessionConfig))

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