import { Schema, model, Document, Types } from 'mongoose';

export interface ITask extends Document {
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  title: string;
  done: boolean;
}

const taskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false }
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, date: 1 });

export const Task = model<ITask>('Task', taskSchema);
