import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDoc extends Document {
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  password_hash: string;
  status: 'active' | 'inactive' | 'pending';
  firstLogin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDoc>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['admin', 'teacher', 'student', 'parent'], required: true },
  password_hash: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  firstLogin: { type: Boolean, default: true },
}, { timestamps: true });

UserSchema.index({ role: 1 });
UserSchema.index({ email: 1 });

export default mongoose.models.User || mongoose.model<IUserDoc>('User', UserSchema);
