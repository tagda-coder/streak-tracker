import { Schema, model, Document, Types } from 'mongoose';

export type EntryStatus = 'completed' | 'skipped';

export interface IEntry extends Document {
  userId: Types.ObjectId;
  categoryId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  status: EntryStatus;
}

const entrySchema = new Schema<IEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    date: { type: String, required: true },
    status: { type: String, enum: ['completed', 'skipped'], required: true }
  },
  { timestamps: true }
);

entrySchema.index({ userId: 1, categoryId: 1, date: 1 }, { unique: true });

export const Entry = model<IEntry>('Entry', entrySchema);
