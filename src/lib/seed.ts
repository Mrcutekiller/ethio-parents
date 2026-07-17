import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ethio-parents-portal';

let mongod: unknown = null;

// Import models
import User from './models/User';
import StudentProfile from './models/StudentProfile';
import TeacherProfile from './models/TeacherProfile';
import ParentLink from './models/ParentLink';
import Class from './models/Class';
import Subject from './models/Subject';
import AttendanceRecord from './models/AttendanceRecord';
import Grade from './models/Grade';
import CalendarEvent from './models/CalendarEvent';
import Notification from './models/Notification';

async function seed() {
  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
  } catch {
    console.log('MongoDB not found locally. Starting in-memory MongoDB...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongod = await MongoMemoryServer.create({ instance: { port: 27017 } });
    const uri = (mongod as { getUri: () => string }).getUri();
    await mongoose.connect(uri);
    console.log(`In-memory MongoDB started at ${uri}`);
  }
  console.log('Connected!\n');

  // Clear existing data
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    StudentProfile.deleteMany({}),
    TeacherProfile.deleteMany({}),
    ParentLink.deleteMany({}),
    Class.deleteMany({}),
    Subject.deleteMany({}),
    AttendanceRecord.deleteMany({}),
    Grade.deleteMany({}),
    CalendarEvent.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('Cleared!\n');

  const password_hash = await bcrypt.hash('password123', 12);

  // 1. Create Admin
  console.log('Creating Admin...');
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@ethioparentsschool.edu.et',
    role: 'admin',
    password_hash,
    status: 'active',
    firstLogin: false,
  });
  console.log(`  Admin: ${admin.email}`);

  // 2. Create Teachers (before classes, since classes need homeroom_teacher_id)
  console.log('\nCreating Teachers...');
  const teacher1 = await User.create({
    name: 'Mr. Abebe Kebede',
    email: 'abebe@ethioparentsschool.edu.et',
    role: 'teacher',
    password_hash,
    status: 'active',
    firstLogin: false,
  });
  const teacher2 = await User.create({
    name: 'Mrs. Fatima Hassan',
    email: 'fatima@ethioparentsschool.edu.et',
    role: 'teacher',
    password_hash,
    status: 'active',
    firstLogin: false,
  });
  const teacher3 = await User.create({
    name: 'Mr. Daniel Tesfaye',
    email: 'daniel@ethioparentsschool.edu.et',
    role: 'teacher',
    password_hash,
    status: 'active',
    firstLogin: false,
  });

  console.log(`  Teacher 1: ${teacher1.name} (${teacher1.email})`);
  console.log(`  Teacher 2: ${teacher2.name} (${teacher2.email})`);
  console.log(`  Teacher 3: ${teacher3.name} (${teacher3.email})`);

  // 3. Create Classes (after teachers, since classes need homeroom_teacher_id)
  console.log('\nCreating Classes...');
  const class1 = await Class.create({ name: 'Grade 5 - Blue', grade_level: 5, homeroom_teacher_id: teacher1._id.toString() });
  const class2 = await Class.create({ name: 'Grade 6 - Gold', grade_level: 6, homeroom_teacher_id: teacher3._id.toString() });
  console.log(`  Class 1: ${class1.name} (${class1._id})`);
  console.log(`  Class 2: ${class2.name} (${class2._id})`);

  // 4. Create Teacher Profiles
  await TeacherProfile.create({ user_id: teacher1._id.toString(), assigned_classes: [class1._id.toString()], assigned_subjects: [] });
  await TeacherProfile.create({ user_id: teacher2._id.toString(), assigned_classes: [class1._id.toString(), class2._id.toString()], assigned_subjects: [] });
  await TeacherProfile.create({ user_id: teacher3._id.toString(), assigned_classes: [class2._id.toString()], assigned_subjects: [] });

  // 4. Create Students (5 per class = 10 total)
  console.log('\nCreating Students...');
  const students = [];
  const studentNames = [
    'Hana Mulugeta', 'Yonas Tadesse', 'Sara Bekele', 'Daniel Alemayehu', 'Meron Girma',
    'Liam Ochieng', 'Ruth Wanjiku', 'Elias Njoroge', 'Grace Achieng', 'Samuel Odhiambo',
  ];

  for (let i = 0; i < 10; i++) {
    const classId = i < 5 ? class1._id.toString() : class2._id.toString();
    const student_id = `EPS24${String(i + 1).padStart(3, '0')}`;
    const verification_code = uuidv4().substring(0, 8).toUpperCase();

    const user = await User.create({
      name: studentNames[i],
      email: `student${i + 1}@ethioparentsschool.edu.et`,
      role: 'student',
      password_hash,
      status: 'active',
      firstLogin: false,
    });

    const profile = await StudentProfile.create({
      user_id: user._id.toString(),
      student_id,
      class_id: classId,
      verification_code,
      admission_date: new Date('2024-09-01'),
    });

    students.push({ user, profile });
    console.log(`  Student ${i + 1}: ${user.name} (ID: ${student_id}, Code: ${verification_code})`);
  }

  // 5. Create Subjects
  console.log('\nCreating Subjects...');
  const subjects = [];
  const subjectNames = ['Mathematics', 'English', 'Science', 'Amharic', 'Social Studies'];

  for (const name of subjectNames) {
    const subject = await Subject.create({
      name,
      class_id: class1._id.toString(),
      teacher_id: teacher1._id.toString(),
    });
    subjects.push(subject);
    console.log(`  Subject: ${name} (${subject._id})`);
  }

  // 6. Create Parents (6 parents, some linked to multiple children)
  console.log('\nCreating Parents...');
  const parents = [];
  const parentData = [
    { name: 'Mrs. Alemitu Mulugeta', email: 'alemitu@gmail.com', children: [0], relationship: 'mother' },
    { name: 'Mr. Tadesse Bekele', email: 'tadesse@gmail.com', children: [1, 2], relationship: 'father' },
    { name: 'Mrs. Girma Alemayehu', email: 'girma@gmail.com', children: [3], relationship: 'mother' },
    { name: 'Mrs. Achieng Ochieng', email: 'achieng@gmail.com', children: [5], relationship: 'mother' },
    { name: 'Mr. Njoroge Wanjiku', email: 'njoroge@gmail.com', children: [6, 7], relationship: 'father' },
    { name: 'Mrs. Odhiambo Achieng', email: 'odhiambo@gmail.com', children: [8, 9], relationship: 'mother' },
  ];

  for (const pd of parentData) {
    const user = await User.create({
      name: pd.name,
      email: pd.email,
      role: 'parent',
      password_hash,
      status: 'active',
      firstLogin: false,
    });

    for (const childIdx of pd.children) {
      await ParentLink.create({
        parent_id: user._id.toString(),
        student_id: students[childIdx].profile._id.toString(),
        relationship: pd.relationship,
        verified_at: new Date(),
      });
    }

    parents.push(user);
    console.log(`  Parent: ${pd.name} (${pd.email}) - linked to ${pd.children.length} child(ren)`);
  }

  // 7. Create Sample Attendance
  console.log('\nCreating Sample Attendance...');
  const today = new Date();
  for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split('T')[0];

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (const student of students) {
      const statuses: ('present' | 'absent' | 'late' | 'excused')[] = ['present', 'present', 'present', 'present', 'present', 'present', 'present', 'absent', 'late', 'excused'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      await AttendanceRecord.create({
        student_id: student.profile._id.toString(),
        class_id: student.profile.class_id,
        date: dateStr,
        status,
        marked_by: teacher1._id.toString(),
      });
    }
  }
  console.log('  Created 10 days of attendance records');

  // 8. Create Sample Grades
  console.log('\nCreating Sample Grades...');
  for (const student of students) {
    for (const subject of subjects) {
      for (const assignment of ['Homework 1', 'Quiz 1', 'Mid-term', 'Homework 2']) {
        const score = Math.floor(Math.random() * 40) + 60; // 60-100
        await Grade.create({
          student_id: student.profile._id.toString(),
          subject_id: subject._id.toString(),
          term: 'Term 1 - 2024',
          assignment_name: assignment,
          score,
          max_score: 100,
          posted_by: teacher1._id.toString(),
        });
      }
    }
  }
  console.log('  Created grades for all students');

  // 9. Create Calendar Events
  console.log('\nCreating Calendar Events...');
  const events = [
    { title: 'School Holiday - Meskel', date: new Date('2024-09-27'), scope: 'school' as const },
    { title: 'Parent-Teacher Conference', date: new Date('2024-10-15'), scope: 'school' as const },
    { title: 'Mid-term Exams Begin', date: new Date('2024-10-20'), scope: 'school' as const },
    { title: 'Math Quiz Due', date: new Date('2024-10-05'), scope: 'class' as const, scope_id: class1._id.toString() },
    { title: 'Science Project Deadline', date: new Date('2024-10-10'), scope: 'class' as const, scope_id: class2._id.toString() },
  ];

  for (const event of events) {
    await CalendarEvent.create({
      ...event,
      created_by: admin._id.toString(),
    });
  }
  console.log(`  Created ${events.length} calendar events`);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('SEED COMPLETE!');
  console.log('='.repeat(50));
  console.log('\nDemo Credentials (all passwords: password123):');
  console.log(`  Admin:   admin@ethioparentsschool.edu.et`);
  console.log(`  Teacher: abebe@ethioparentsschool.edu.et`);
  console.log(`  Teacher: fatima@ethioparentsschool.edu.et`);
  console.log(`  Teacher: daniel@ethioparentsschool.edu.et`);
  console.log(`  Student: student1@ethioparentsschool.edu.et`);
  console.log(`  Parent:  alemitu@gmail.com`);
  console.log(`  Parent:  tadesse@gmail.com`);
  console.log(`  Parent:  achieng@gmail.com`);
  console.log(`\nStudent IDs & Verification Codes:`);
  for (const s of students) {
    console.log(`  ${s.user.name}: ID=${s.profile.student_id}, Code=${s.profile.verification_code}`);
  }

  await mongoose.disconnect();
  if (mongod) {
    await (mongod as { stop: () => Promise<void> }).stop();
  }
  console.log('\nDone!');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
