import mongoose, { Schema, Document } from 'mongoose';

export interface IMessageDoc extends Document {
  thread_id: string;
  sender_id: string;
  recipient_id: string;
  student_context_id: string;
  body: string;
  sent_at: Date;
  read_at?: Date;
}

const MessageSchema = new Schema<IMessageDoc>({
  thread_id: { type: String, required: true },
  sender_id: { type: String, required: true, ref: 'User' },
  recipient_id: { type: String, required: true, ref: 'User' },
  student_context_id: { type: String, required: true, ref: 'StudentProfile' },
  body: { type: String, required: true },
  sent_at: { type: Date, default: Date.now },
  read_at: { type: Date },
});

MessageSchema.index({ thread_id: 1 });
MessageSchema.index({ recipient_id: 1, read_at: 1 });

export default mongoose.models.Message || mongoose.model<IMessageDoc>('Message', MessageSchema);
