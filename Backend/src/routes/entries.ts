import { Router } from 'express';
import { Entry } from '../models/Entry';
import { authMiddleware, AuthedRequest } from '../middleware/auth';
import { todayStr } from '../utils/date';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthedRequest, res) => {
  const { start, end } = req.query as { start?: string; end?: string };
  if (!start || !end) {
    res.status(400).json({ error: 'start and end query params are required (YYYY-MM-DD)' });
    return;
  }
  const entries = await Entry.find({ userId: req.userId, date: { $gte: start, $lte: end } }).lean();
  res.json({
    entries: entries.map((e) => ({
      id: String(e._id),
      categoryId: String(e.categoryId),
      date: e.date,
      status: e.status
    }))
  });
});

router.put('/', async (req: AuthedRequest, res) => {
  const { categoryId, date, status } = req.body ?? {};
  if (!categoryId || !date || !status) {
    res.status(400).json({ error: 'categoryId, date and status are required' });
    return;
  }
  if (status !== 'completed' && status !== 'skipped') {
    res.status(400).json({ error: 'status must be "completed" or "skipped"' });
    return;
  }
  if (date < todayStr()) {
    res.status(403).json({ error: 'Cannot modify entries for past dates' });
    return;
  }
  const entry = await Entry.findOneAndUpdate(
    { userId: req.userId, categoryId, date },
    { $set: { status } },
    { new: true, upsert: true }
  );
  res.json({ entry: { id: String(entry._id), categoryId: String(entry.categoryId), date: entry.date, status: entry.status } });
});

router.delete('/', async (req: AuthedRequest, res) => {
  const { categoryId, date } = req.body ?? {};
  if (!categoryId || !date) {
    res.status(400).json({ error: 'categoryId and date are required' });
    return;
  }
  if (date < todayStr()) {
    res.status(403).json({ error: 'Cannot modify entries for past dates' });
    return;
  }
  await Entry.findOneAndDelete({ userId: req.userId, categoryId, date });
  res.json({ ok: true });
});

export default router;
