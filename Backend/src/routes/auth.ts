import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { authMiddleware, AuthedRequest } from '../middleware/auth';

const router = Router();

function signToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '30d' });
}

function toPublicUser(user: { _id: unknown; name: string; email: string; tagline: string; theme: string }) {
  return { id: String(user._id), name: user.name, email: user.email, tagline: user.tagline, theme: user.theme };
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password) {
    res.status(400).json({ error: 'name, email and password are required' });
    return;
  }
  if (String(password).length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }
  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  const token = signToken(String(user._id));
  res.status(201).json({ token, user: toPublicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  const token = signToken(String(user._id));
  res.json({ token, user: toPublicUser(user) });
});

router.get('/me', authMiddleware, async (req: AuthedRequest, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user: toPublicUser(user) });
});

export default router;
