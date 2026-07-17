import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentProfileDoc extends Document {
  user_id: string;
  student_id: string;
  class_id: string;
  verification_code: string;
  DOB?: Date;
  admission_date: Date;
}

const StudentProfileSchema = new Schema<IStudentProfileDoc>({
  user_id: { type: String, required: true, ref: 'User' },
  student_id: { type: String, required: true, unique: true },
  class_id: { type: String, required: true, ref: 'Class' },
  verification_code: { type: String, required: true, unique: true },
  DOB: { type: Date },
  admission_date: { type: Date, default: Date.now },
});

StudentProfileSchema.index({ user_id: 1 });
StudentProfileSchema.index({ verification_code: 1 });
StudentProfileSchema.index({ class_id: 1 });

export default mongoose.models.StudentProfile || mongoose.model<IStudentProfileDoc>('StudentProfile', StudentProfileSchema);
