import dotenv from 'dotenv';
const envResult = dotenv.config();
console.info(
    `[startup] .env ${envResult.error ? "not loaded" : "loaded"}; MONGO_URL ${process.env.MONGO_URL ? "present" : "missing"}; loading dependencies`
);
import mongoose from 'mongoose';
import app from "./app";

console.info("[startup] Dependencies loaded; connecting to MongoDB (10s timeout)");
mongoose.connect(process.env.MONGO_URL as string, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
})
    .then((data) => {
        console.log("MongoDB connection succeed");
        const PORT = process.env.PORT ?? 3003;
        app.listen(PORT, function () {
            console.info(`The server is running successfully on port: ${PORT}`);
            console.info(`Admin project on http://localhost:${PORT}/admin \n`);
        });
    })
    .catch((err => console.error("ERROR on connection MongoDB", {
        name: err.name,
        code: err.code,
        syscall: err.syscall,
    })));
