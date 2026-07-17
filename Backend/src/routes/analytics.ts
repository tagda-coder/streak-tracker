import { Router } from 'express';
import { Category } from '../models/Category';
import { authMiddleware, AuthedRequest } from '../middleware/auth';
import {
  buildDailyCompletionMap,
  buildHeatmapWeeks,
  computeCategoryStats,
  computeCompletionPct,
  computeCurrentStreak,
  computeLongestStreak
} from '../services/streaks';
import { addDays, todayStr } from '../utils/date';

const router = Router();
router.use(authMiddleware);

router.get('/overview', async (req: AuthedRequest, res) => {
  const end = todayStr();
  const start = addDays(end, -364);
  const categories = await Category.find({ userId: req.userId }).lean();
  const map = await buildDailyCompletionMap(req.userId as string, start, end);

  const pct = computeCompletionPct(map, start, end);
  let totalCompletedDays = 0;
  let cursor = start;
  while (cursor <= end) {
    if ((map[cursor]?.size ?? 0) > 0) totalCompletedDays++;
    cursor = addDays(cursor, 1);
  }
  const currentStreak = computeCurrentStreak(map);
  const longestStreak = computeLongestStreak(map, start, end);
  const heatmap = buildHeatmapWeeks(map, end, 30, categories.length);

  res.json({
    completionPct: pct,
    totalCompletedDays,
    totalDays: 365,
    currentStreak,
    longestStreak,
    heatmap
  });
});

router.get('/categories', async (req: AuthedRequest, res) => {
  const stats = await computeCategoryStats(req.userId as string);
  res.json({
    categories: stats.map((s) => ({
      id: String(s.category._id),
      name: s.category.name,
      icon: s.category.icon,
      color: s.category.color,
      streak: s.streak,
      pct: s.pct
    }))
  });
});

router.get('/streaks', async (req: AuthedRequest, res) => {
  const stats = await computeCategoryStats(req.userId as string);
  const sorted = [...stats].sort((a, b) => b.streak - a.streak);
  res.json({
    categories: sorted.map((s) => ({
      id: String(s.category._id),
      name: s.category.name,
      icon: s.category.icon,
      color: s.category.color,
      streak: s.streak
    }))
  });
});

router.get('/home-heatmap', async (req: AuthedRequest, res) => {
  const end = todayStr();
  const start = addDays(end, -363);
  const categories = await Category.find({ userId: req.userId }).lean();
  const map = await buildDailyCompletionMap(req.userId as string, start, end);
  const heatmap = buildHeatmapWeeks(map, end, 52, categories.length);
  res.json({ heatmap });
});

export default router;
