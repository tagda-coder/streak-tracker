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
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/profile', profileRoutes);

const PORT = process.env.PORT ?? 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Streak Tracker API listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
