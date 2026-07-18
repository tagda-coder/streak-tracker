import { Router } from 'express';
import { Task } from '../models/Task';
import { authMiddleware, AuthedRequest } from '../middleware/auth';

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
  const task = await Task.create({ userId: req.userId, date, title: String(title).trim(), done: false });
  res.status(201).json({ task: serialize(task) });
});

router.put('/:id', async (req: AuthedRequest, res) => {
  const { title, done } = req.body ?? {};
  const update: Record<string, unknown> = {};
  if (title !== undefined) update.title = String(title).trim();
  if (done !== undefined) update.done = !!done;
  const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, { $set: update }, { new: true });
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json({ task: serialize(task) });
});

router.delete('/:id', async (req: AuthedRequest, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json({ ok: true });
});

export default router;
