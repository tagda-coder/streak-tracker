export interface User {
  id: string;
  name: string;
  email: string;
  tagline: string;
  theme: 'Dark' | 'Light';
}

export interface Category {
  id: string;
  name: string;
  icon: IconName;
  color: string;
  reminderEnabled: boolean;
  reminderTime: string;
  createdDate: string;
  streak: number;
  pct: number;
}

export type EntryStatus = 'completed' | 'skipped';

export interface Entry {
  id: string;
  categoryId: string;
  date: string;
  status: EntryStatus;
}

export interface Task {
  id: string;
  date: string;
  title: string;
  done: boolean;
}

export interface HeatmapDay {
  key: string;
  date: string;
  level: number;
  color: string;
}

export interface HeatmapWeek {
  key: string;
  monthLabel: string | null;
  days: HeatmapDay[];
}

export type IconName =
  | 'home'
  | 'calendar'
  | 'plus'
  | 'chart'
  | 'user'
  | 'back'
  | 'bell'
  | 'filter'
  | 'chevLeft'
  | 'chevRight'
  | 'chevDown'
  | 'edit'
  | 'gear'
  | 'calendarSmall'
  | 'clock'
  | 'x'
  | 'check'
  | 'circle'
  | 'flame'
  | 'linkedin'
  | 'youtube'
  | 'code'
  | 'dumbbell'
  | 'book'
  | 'flower'
  | 'download'
  | 'upload';
