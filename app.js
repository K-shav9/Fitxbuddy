import express from 'express';
import cors from "cors";
import allRoutes from "./routes/index.js";
import { morgan, customFormat } from "./utils/morganSettings.js";
import passportConfig from "./middlewares/passportConfig.js";
import { globalResponse } from './utils/others.js';
import ErrorMiddleware from './middlewares/error.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './config/database.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan(customFormat));
app.use(globalResponse);
app.use("/api/v1", allRoutes);
app.use(passportConfig.initialize());

app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
    console.log("serving");
    res.send("running.....");
});

app.get('/reset-password', async (req, res) => {
    const { token } = req.query;
    const tokenRecord = await db?.PasswordResetToken.findOne({ where: { token } });

    if (!tokenRecord || new Date(tokenRecord.expiresAt) < new Date()) {
        return res.sendFile(path.join(__dirname, 'public', 'pages','reset-link-expired.html'));
    }

    return res.sendFile(path.join(__dirname, 'public', 'pages','reset-password.html'));
});
  
  

app.use('/logos', express.static(path.join(__dirname, 'public/logos')));





export default app;

app.use("/", (req, res) => {
    res.send("Route not found");
});
// app.use("/", (req, res) => {
//     res.status(404).json({ message: "Route not found" });
// });

app.use(ErrorMiddleware);