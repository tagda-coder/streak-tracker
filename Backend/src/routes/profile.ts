import { Router } from 'express';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { authMiddleware, AuthedRequest } from '../middleware/auth';
import { buildDailyCompletionMap, computeCompletionPct, computeLongestStreak } from '../services/streaks';
import { addDays, todayStr } from '../utils/date';

const router = Router();
router.use(authMiddleware);

router.put('/', async (req: AuthedRequest, res) => {
  const { name, tagline, theme } = req.body ?? {};
  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (tagline !== undefined) update.tagline = tagline;
  if (theme !== undefined) update.theme = theme;
  const user = await User.findByIdAndUpdate(req.userId, { $set: update }, { new: true });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user: { id: String(user._id), name: user.name, email: user.email, tagline: user.tagline, theme: user.theme } });
});

router.get('/stats', async (req: AuthedRequest, res) => {
  const end = todayStr();
  const start = addDays(end, -364);
  const categories = await Category.find({ userId: req.userId }).lean();
  const map = await buildDailyCompletionMap(req.userId as string, start, end);

  let totalCompleted = 0;
  let cursor = start;
  while (cursor <= end) {
    if ((map[cursor]?.size ?? 0) > 0) totalCompleted++;
    cursor = addDays(cursor, 1);
  }
  const pct = computeCompletionPct(map, start, end);
  const longest = computeLongestStreak(map, start, end);

  res.json({
    totalDaysTracked: 365,
    totalCompleted,
    completionRate: pct,
    longestStreak: longest,
    categoryCount: categories.length
  });
});

export default router;
