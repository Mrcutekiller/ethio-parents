import mongoose, { Schema, Document } from 'mongoose';

export interface ISubjectDoc extends Document {
  name: string;
  class_id: string;
  teacher_id: string;
}

const SubjectSchema = new Schema<ISubjectDoc>({
  name: { type: String, required: true },
  class_id: { type: String, required: true, ref: 'Class' },
  teacher_id: { type: String, required: true, ref: 'User' },
});

SubjectSchema.index({ class_id: 1 });
SubjectSchema.index({ teacher_id: 1 });

export default mongoose.models.Subject || mongoose.model<ISubjectDoc>('Subject', SubjectSchema);
