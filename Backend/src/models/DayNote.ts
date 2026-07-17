import { Schema, model, Document, Types } from 'mongoose';

export interface IDayNote extends Document {
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  text: string;
}

const dayNoteSchema = new Schema<IDayNote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true },
    text: { type: String, default: '' }
  },
  { timestamps: true }
);

dayNoteSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DayNote = model<IDayNote>('DayNote', dayNoteSchema);
