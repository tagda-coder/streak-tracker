import { Router } from 'express';
import { Task } from '../models/Task';
import { authMiddleware, AuthedRequest } from '../middleware/auth';
import { todayStr } from '../utils/date';

const router = Router();
router.use(authMiddleware);

function serialize(t: { _id: unknown; date: string; title: string; done: boolean }) {
  return { id: String(t._id), date: t.date, title: t.title, done: t.done };
}

router.get('/', async (req: AuthedRequest, res) => {
  const { date } = req.query as { date?: string };
  if (!date) {
    res.status(400).json({ error: 'date query param is required (YYYY-MM-DD)' });
    return;
  }
  const tasks = await Task.find({ userId: req.userId, date }).sort({ createdAt: 1 }).lean();
  res.json({ tasks: tasks.map(serialize) });
});

router.post('/', async (req: AuthedRequest, res) => {
  const { date, title } = req.body ?? {};
  if (!date || !title || !String(title).trim()) {
    res.status(400).json({ error: 'date and title are required' });
    return;
  }
  if (date < todayStr()) {
    res.status(403).json({ error: 'Cannot add tasks for past dates' });
    return;
  }
  const task = await Task.create({ userId: req.userId, date, title: String(title).trim(), done: false });
  res.status(201).json({ task: serialize(task) });
});

router.put('/:id', async (req: AuthedRequest, res) => {
  const existing = await Task.findOne({ _id: req.params.id, userId: req.userId });
  if (!existing) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  if (existing.date < todayStr()) {
    res.status(403).json({ error: 'Cannot modify tasks for past dates' });
    return;
  }
  const { title, done } = req.body ?? {};
  if (title !== undefined) existing.title = String(title).trim();
  if (done !== undefined) existing.done = !!done;
  await existing.save();
  res.json({ task: serialize(existing) });
});

router.delete('/:id', async (req: AuthedRequest, res) => {
  const existing = await Task.findOne({ _id: req.params.id, userId: req.userId });
  if (!existing) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  if (existing.date < todayStr()) {
    res.status(403).json({ error: 'Cannot modify tasks for past dates' });
    return;
  }
  await existing.deleteOne();
  res.json({ ok: true });
});

export default router;
