import mongoose, { Schema, Document } from 'mongoose';

export interface IClassDoc extends Document {
  name: string;
  grade_level: number;
  homeroom_teacher_id: string;
}

const ClassSchema = new Schema<IClassDoc>({
  name: { type: String, required: true },
  grade_level: { type: Number, required: true },
  homeroom_teacher_id: { type: String, required: true, ref: 'User' },
});

ClassSchema.index({ homeroom_teacher_id: 1 });

export default mongoose.models.Class || mongoose.model<IClassDoc>('Class', ClassSchema);
