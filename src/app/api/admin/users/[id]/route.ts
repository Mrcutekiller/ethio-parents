import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import StudentProfile from '@/lib/models/StudentProfile';
import TeacherProfile from '@/lib/models/TeacherProfile';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();
    const targetUser = await User.findById(id).select('-password_hash');
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const obj = targetUser.toObject();
    if (targetUser.role === 'student') {
      obj.profile = await StudentProfile.findOne({ user_id: id });
    } else if (targetUser.role === 'teacher') {
      obj.profile = await TeacherProfile.findOne({ user_id: id });
    }

    return NextResponse.json({ user: obj });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    await connectDB();

    const allowedUpdates = ['name', 'email', 'phone', 'status'];
    const updates: Record<string, unknown> = {};
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    const updated = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password_hash');
    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await User.findByIdAndDelete(id);
    if (targetUser.role === 'student') {
      await StudentProfile.deleteMany({ user_id: id });
    } else if (targetUser.role === 'teacher') {
      await TeacherProfile.deleteMany({ user_id: id });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
