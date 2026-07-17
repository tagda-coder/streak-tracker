import { Types } from 'mongoose';
import { Entry } from '../models/Entry';
import { Category, ICategory } from '../models/Category';
import { addDays, todayStr } from '../utils/date';

export const HEATMAP_LEVEL_COLORS = ['#1c2620', '#1e4028', '#1f6b34', '#22a348', '#22c55e'];

export interface DailyCompletionMap {
  // date -> set of categoryIds completed that day
  [date: string]: Set<string>;
}

export async function buildDailyCompletionMap(
  userId: string,
  start: string,
  end: string,
  categoryId?: string
): Promise<DailyCompletionMap> {
  const query: Record<string, unknown> = {
    userId: new Types.ObjectId(userId),
    status: 'completed',
    date: { $gte: start, $lte: end }
  };
  if (categoryId) query.categoryId = new Types.ObjectId(categoryId);

  const entries = await Entry.find(query).lean();
  const map: DailyCompletionMap = {};
  for (const e of entries) {
    if (!map[e.date]) map[e.date] = new Set();
    map[e.date].add(String(e.categoryId));
  }
  return map;
}

/** Consecutive-day streak ending today (or the most recent day with any completion), for a single category if categoryId given, else "any category completed" per day. */
export function computeCurrentStreak(map: DailyCompletionMap, categoryId?: string): number {
  const isDone = (date: string) => (categoryId ? map[date]?.has(categoryId) : (map[date]?.size ?? 0) > 0);
  let cursor = todayStr();
  // allow the streak to still count if today hasn't been logged yet but yesterday continues
  if (!isDone(cursor)) cursor = addDays(cursor, -1);
  let streak = 0;
  while (isDone(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Longest consecutive-day run found within the supplied map's date range. */
export function computeLongestStreak(map: DailyCompletionMap, start: string, end: string, categoryId?: string): number {
  const isDone = (date: string) => (categoryId ? map[date]?.has(categoryId) : (map[date]?.size ?? 0) > 0);
  let longest = 0;
  let running = 0;
  let cursor = start;
  while (cursor <= end) {
    if (isDone(cursor)) {
      running++;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
    cursor = addDays(cursor, 1);
  }
  return longest;
}

export function computeCompletionPct(map: DailyCompletionMap, start: string, end: string, categoryId?: string): number {
  const isDone = (date: string) => (categoryId ? map[date]?.has(categoryId) : (map[date]?.size ?? 0) > 0);
  let totalDays = 0;
  let doneDays = 0;
  let cursor = start;
  while (cursor <= end) {
    totalDays++;
    if (isDone(cursor)) doneDays++;
    cursor = addDays(cursor, 1);
  }
  if (totalDays === 0) return 0;
  return Math.round((doneDays / totalDays) * 100);
}

export interface HeatmapWeek {
  key: string;
  monthLabel: string | null;
  days: { key: string; date: string; level: number; color: string }[];
}

/** Builds a GitHub-style contribution heatmap ending on `end`, going back `weeks` weeks, aligned to Monday-start columns. */
export function buildHeatmapWeeks(
  map: DailyCompletionMap,
  end: string,
  weeks: number,
  totalCategories: number,
  categoryId?: string
): HeatmapWeek[] {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const endDate = end;
  // find the Monday on/before the end date's week, then step back (weeks-1) more weeks
  const [y, m, d] = endDate.split('-').map(Number);
  const endJsDate = new Date(y, m - 1, d);
  const dayIdx = (endJsDate.getDay() + 6) % 7; // 0=Mon
  const lastMonday = new Date(endJsDate);
  lastMonday.setDate(endJsDate.getDate() - dayIdx);
  const firstMonday = new Date(lastMonday);
  firstMonday.setDate(lastMonday.getDate() - (weeks - 1) * 7);

  const result: HeatmapWeek[] = [];
  let seenMonths = new Set<string>();
  for (let w = 0; w < weeks; w++) {
    const weekStart = new Date(firstMonday);
    weekStart.setDate(firstMonday.getDate() + w * 7);
    const days: HeatmapWeek['days'] = [];
    let monthLabel: string | null = null;
    for (let d2 = 0; d2 < 7; d2++) {
      const cur = new Date(weekStart);
      cur.setDate(weekStart.getDate() + d2);
      const dateStr = cur.getFullYear() + '-' + String(cur.getMonth() + 1).padStart(2, '0') + '-' + String(cur.getDate()).padStart(2, '0');
      const monthKey = `${cur.getFullYear()}-${cur.getMonth()}`;
      if (d2 === 0 && !seenMonths.has(monthKey) && dateStr <= endDate) {
        monthLabel = MONTHS[cur.getMonth()];
        seenMonths.add(monthKey);
      }
      let level = 0;
      if (dateStr <= endDate) {
        const completedCount = categoryId ? (map[dateStr]?.has(categoryId) ? 1 : 0) : map[dateStr]?.size ?? 0;
        const denom = categoryId ? 1 : Math.max(totalCategories, 1);
        const ratio = completedCount / denom;
        if (completedCount === 0) level = 0;
        else if (ratio <= 0.25) level = 1;
        else if (ratio <= 0.5) level = 2;
        else if (ratio <= 0.75) level = 3;
        else level = 4;
      }
      days.push({ key: `${w}-${d2}`, date: dateStr, level, color: HEATMAP_LEVEL_COLORS[level] });
    }
    result.push({ key: 'w' + w, monthLabel, days });
  }
  return result;
}

export interface CategoryStats {
  category: ICategory;
  streak: number;
  pct: number;
}

export async function computeCategoryStats(userId: string, windowDays = 365): Promise<CategoryStats[]> {
  const categories = await Category.find({ userId }).lean();
  if (categories.length === 0) return [];
  const end = todayStr();
  const start = addDays(end, -(windowDays - 1));
  const map = await buildDailyCompletionMap(userId, start, end);
  return categories.map((category) => ({
    category: category as unknown as ICategory,
    streak: computeCurrentStreak(map, String(category._id)),
    pct: computeCompletionPct(map, start, end, String(category._id))
  }));
}
