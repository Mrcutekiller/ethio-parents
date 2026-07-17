import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacherProfileDoc extends Document {
  user_id: string;
  assigned_classes: string[];
  assigned_subjects: string[];
}

const TeacherProfileSchema = new Schema<ITeacherProfileDoc>({
  user_id: { type: String, required: true, ref: 'User' },
  assigned_classes: [{ type: String, ref: 'Class' }],
  assigned_subjects: [{ type: String, ref: 'Subject' }],
});

TeacherProfileSchema.index({ user_id: 1 });

export default mongoose.models.TeacherProfile || mongoose.model<ITeacherProfileDoc>('TeacherProfile', TeacherProfileSchema);
