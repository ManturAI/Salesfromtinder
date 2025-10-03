import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import authRouter from './routes/auth.js';
import meRouter from './routes/me.js';
import topicsRouter from './routes/topics.js';
import subtopicsRouter from './routes/subtopics.js';
import lessonsRouter from './routes/lessons.js';
import devRouter from './routes/dev.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
// Allow multiple dev origins (3001/3002) or a comma-separated CORS_ORIGIN
const allowedOrigins = (process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
  : ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3000', 'http://localhost:3003']);

const corsOptions = {
  origin: (reqOrigin, cb) => {
    if (!reqOrigin) return cb(null, true);
    const ok = allowedOrigins.includes(reqOrigin);
    cb(null, ok ? reqOrigin : false);
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return cors(corsOptions)(req, res, () => res.sendStatus(204));
  }
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/auth', authRouter);
app.use('/me', meRouter);
app.use('/topics', topicsRouter);
app.use('/subtopics', subtopicsRouter);
app.use('/lessons', lessonsRouter);

if (process.env.DEV_ADMIN === 'true') {
  app.use('/dev', devRouter);
  console.log('DEV_ADMIN enabled: POST /dev/login available');
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});