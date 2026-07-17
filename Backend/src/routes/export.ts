import { Router } from 'express';
import { Types } from 'mongoose';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Entry } from '../models/Entry';
import { DayNote } from '../models/DayNote';
import { authMiddleware, AuthedRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const EXPORT_VERSION = 1;

router.get('/', async (req: AuthedRequest, res) => {
  const [user, categories, entries, notes] = await Promise.all([
    User.findById(req.userId).lean(),
    Category.find({ userId: req.userId }).lean(),
    Entry.find({ userId: req.userId }).lean(),
    DayNote.find({ userId: req.userId }).lean()
  ]);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    profile: {
      name: user.name,
      email: user.email,
      tagline: user.tagline,
      theme: user.theme
    },
    categories: categories.map((c) => ({
      id: String(c._id),
      name: c.name,
      icon: c.icon,
      color: c.color,
      reminderEnabled: c.reminderEnabled,
      reminderTime: c.reminderTime
    })),
    entries: entries.map((e) => ({
      categoryId: String(e.categoryId),
      date: e.date,
      status: e.status
    })),
    notes: notes.map((n) => ({
      date: n.date,
      text: n.text
    }))
  });
});

router.post('/restore', async (req: AuthedRequest, res) => {
  const body = req.body ?? {};
  const { categories, entries, notes } = body;

  if (!Array.isArray(categories) || !Array.isArray(entries) || !Array.isArray(notes)) {
    res.status(400).json({ error: 'Invalid backup file: categories, entries and notes must be arrays' });
    return;
  }

  const validCategoryIds = new Set<string>();
  for (const c of categories) {
    if (!c || typeof c.id !== 'string') {
      res.status(400).json({ error: 'Invalid backup file: each category needs an id' });
      return;
    }
    if (typeof c.name !== 'string' || typeof c.icon !== 'string' || typeof c.color !== 'string') {
      res.status(400).json({ error: 'Invalid backup file: category missing name/icon/color' });
      return;
    }
    validCategoryIds.add(c.id);
  }

  for (const e of entries) {
    if (
      !e ||
      typeof e.categoryId !== 'string' ||
      !validCategoryIds.has(e.categoryId) ||
      typeof e.date !== 'string' ||
      (e.status !== 'completed' && e.status !== 'skipped')
    ) {
      res.status(400).json({
        error: 'Invalid backup file: malformed entry, or entry references a category not present in this backup'
      });
      return;
    }
  }

  for (const n of notes) {
    if (!n || typeof n.date !== 'string' || typeof n.text !== 'string') {
      res.status(400).json({ error: 'Invalid backup file: malformed note' });
      return;
    }
  }

  const userId = req.userId as string;

  await Category.deleteMany({ userId });
  await Entry.deleteMany({ userId });
  await DayNote.deleteMany({ userId });

  // Fresh ObjectIds (rather than reusing the exported ones) avoid a
  // duplicate-key crash if this backup is ever restored into a different
  // account than the one that exported it.
  const idMap = new Map<string, Types.ObjectId>();
  const categoryDocs = categories.map((c: { id: string; name: string; icon: string; color: string; reminderEnabled?: boolean; reminderTime?: string }) => {
    const newId = new Types.ObjectId();
    idMap.set(c.id, newId);
    return {
      _id: newId,
      userId,
      name: c.name,
      icon: c.icon,
      color: c.color,
      reminderEnabled: !!c.reminderEnabled,
      reminderTime: c.reminderTime || '09:00'
    };
  });
  if (categoryDocs.length > 0) await Category.insertMany(categoryDocs);

  const entryDocs = entries.map((e: { categoryId: string; date: string; status: 'completed' | 'skipped' }) => ({
    userId,
    categoryId: idMap.get(e.categoryId),
    date: e.date,
    status: e.status
  }));
  if (entryDocs.length > 0) await Entry.insertMany(entryDocs);

  const noteDocs = notes.map((n: { date: string; text: string }) => ({
    userId,
    date: n.date,
    text: n.text
  }));
  if (noteDocs.length > 0) await DayNote.insertMany(noteDocs);

  res.json({
    ok: true,
    categoriesRestored: categoryDocs.length,
    entriesRestored: entryDocs.length,
    notesRestored: noteDocs.length
  });
});

export default router;
