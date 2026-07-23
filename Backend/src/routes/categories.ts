import { Router } from 'express';
import { Category } from '../models/Category';
import { Entry } from '../models/Entry';
import { authMiddleware, AuthedRequest } from '../middleware/auth';
import { buildDailyCompletionMap, computeCurrentStreak, computeCompletionPct } from '../services/streaks';
import { addDays, todayStr, toDateStr } from '../utils/date';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthedRequest, res) => {
  const categories = await Category.find({ userId: req.userId }).sort({ createdAt: 1 }).lean();
  const end = todayStr();
  const start = addDays(end, -364);
  const map = await buildDailyCompletionMap(req.userId as string, start, end);
  const withStats = categories.map((c) => ({
    id: String(c._id),
    name: c.name,
    icon: c.icon,
    color: c.color,
    reminderEnabled: c.reminderEnabled,
    reminderTime: c.reminderTime,
    createdDate: toDateStr(new Date(c.createdAt)),
    streak: computeCurrentStreak(map, String(c._id)),
    pct: computeCompletionPct(map, start, end, String(c._id))
  }));
  res.json({ categories: withStats });
});

router.post('/', async (req: AuthedRequest, res) => {
  const { name, icon, color, reminderEnabled, reminderTime } = req.body ?? {};
  if (!name || !icon || !color) {
    res.status(400).json({ error: 'name, icon and color are required' });
    return;
  }
  const category = await Category.create({
    userId: req.userId,
    name,
    icon,
    color,
    reminderEnabled: !!reminderEnabled,
    reminderTime: reminderTime || '09:00'
  });
  res.status(201).json({
    category: {
      id: String(category._id),
      name: category.name,
      icon: category.icon,
      color: category.color,
      reminderEnabled: category.reminderEnabled,
      reminderTime: category.reminderTime,
      createdDate: toDateStr(category.createdAt),
      streak: 0,
      pct: 0
    }
  });
});

router.put('/:id', async (req: AuthedRequest, res) => {
  const { name, icon, color, reminderEnabled, reminderTime } = req.body ?? {};
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: { name, icon, color, reminderEnabled, reminderTime } },
    { new: true }
  );
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  res.json({ category });
});

router.delete('/:id', async (req: AuthedRequest, res) => {
  const category = await Category.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  await Entry.deleteMany({ userId: req.userId, categoryId: req.params.id });
  res.json({ ok: true });
});

export default router;
