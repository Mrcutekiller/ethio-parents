import mongoose, { Schema, Document } from 'mongoose';

export interface IParentLinkDoc extends Document {
  parent_id: string;
  student_id: string;
  relationship: string;
  verified_at?: Date;
  code_attempts: number;
  last_attempt_at?: Date;
}

const ParentLinkSchema = new Schema<IParentLinkDoc>({
  parent_id: { type: String, required: true, ref: 'User' },
  student_id: { type: String, required: true, ref: 'StudentProfile' },
  relationship: { type: String, required: true },
  verified_at: { type: Date },
  code_attempts: { type: Number, default: 0 },
  last_attempt_at: { type: Date },
});

ParentLinkSchema.index({ parent_id: 1 });
ParentLinkSchema.index({ student_id: 1 });

export default mongoose.models.ParentLink || mongoose.model<IParentLinkDoc>('ParentLink', ParentLinkSchema);
