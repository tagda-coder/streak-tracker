import { Router } from 'express';
import { DayNote } from '../models/DayNote';
import { authMiddleware, AuthedRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/:date', async (req: AuthedRequest, res) => {
  const note = await DayNote.findOne({ userId: req.userId, date: req.params.date }).lean();
  res.json({ date: req.params.date, text: note?.text ?? '' });
});

router.put('/:date', async (req: AuthedRequest, res) => {
  const { text } = req.body ?? {};
  const note = await DayNote.findOneAndUpdate(
    { userId: req.userId, date: req.params.date },
    { $set: { text: text ?? '' } },
    { new: true, upsert: true }
  );
  res.json({ date: note.date, text: note.text });
});

export default router;
