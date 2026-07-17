import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import entryRoutes from './routes/entries';
import noteRoutes from './routes/notes';
import analyticsRoutes from './routes/analytics';
import profileRoutes from './routes/profile';
import exportRoutes from './routes/export';

const app = express();

const LOCALHOST_ORIGIN = /^http:\/\/localhost:\d+$/;
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || LOCALHOST_ORIGIN.test(origin) || origin === process.env.CLIENT_ORIGIN) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  })
);
// A user with months of daily entries can produce a backup export/restore
// payload larger than Express's small default body limit.
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/export', exportRoutes);

const PORT = process.env.PORT ?? 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Streak Tracker API listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
