import cors from "cors";
import express from 'express'
import path from 'path'
import router from './router'
import routerAdmin from './router-admin'
import morgan from 'morgan';
import { MORGAN_FORMAT } from './libs/config';

import session from 'express-session';
import ConnectMongoDB from 'connect-mongodb-session';
import { T } from './libs/types/common';
import cookieParser from 'cookie-parser'


const MongoDBStore = ConnectMongoDB(session);

const store = new MongoDBStore({
    uri: String(process.env.MONGO_URL),
    collection: 'sessions'
});




// 1 - Starting Codes`
const app = express()
// console.log("__dirname", __dirname);
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({credentials: true, origin: true}));
app.use(cookieParser())
app.use(morgan(MORGAN_FORMAT));


// 2 - Session Codes
//cookiess =  Id.Signature

app.use(
    session({
        secret: String(process.env.SESSION_SECRET),
        cookie: {
            maxAge: 1000 * 3600 * 3 // 3hours
        },
        store: store,
        resave: true,   // true bolsa har 3 soat ichida yangilanib vaqaqti yana 3 soatga uzayadi
        saveUninitialized: true
    }));


app.use(function (req, res, next) {
    // console.log("req.session", req.session)
    const sessionInstance = req.session as T;
    // console.log("sessionInstance", sessionInstance)
    res.locals.member = sessionInstance.member;
    // console.log("res.locals.member2", res.locals.member)
    next()

})





// 3 - Views Codes
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs")


// 4 - Router Codes
app.use("/admin", routerAdmin)   // SSR: EJS     2-Admin uchun SSRda quramiz
app.use("/", router)  // SPA: REACT   1-Bu yerda RESTAPI serverda sifatida ishlatamiz             Middleware Design Pattern


export default app
