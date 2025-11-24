require('dotenv').config();
const express = require('express');
const http = require('http');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const LRUCache = require('./utils/lrucache');
const createRoutes = require('./routes/requests');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eduzap';
const uploadDir = process.env.UPLOAD_DIR || 'uploads';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// serve uploaded images statically
app.use(`/${uploadDir}`, express.static(path.join(process.cwd(), uploadDir)));

connectDB(MONGO_URI);

// instantiate cache
const cache = new LRUCache(200);

// mount routes with io & cache
app.use('/', createRoutes(io, cache));

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
