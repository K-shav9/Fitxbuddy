import app from './app.js';
import "./config/database.js";
import { createServer } from 'http';
import { colorizeText } from './utils/others.js';

const PORT = process.env.DB_PORT || 3000;
const HOST = process.env.HOST || 'localhost'; // fallback added for safety

const server = createServer(app);

server.listen(PORT, () => {
    console.log(colorizeText(`Server running on http://${HOST}:${PORT}`,"green"));
});
