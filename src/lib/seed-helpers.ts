import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import User from './models/User';
import StudentProfile from './models/StudentProfile';
import TeacherProfile from './models/TeacherProfile';
import ParentLink from './models/ParentLink';
import Class from './models/Class';
import Subject from './models/Subject';
import AttendanceRecord from './models/AttendanceRecord';
import Grade from './models/Grade';
import CalendarEvent from './models/CalendarEvent';

export async function seedData() {
  const password_hash = await bcrypt.hash('password123', 12);

  // Admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@ethioparentsschool.edu.et',
    role: 'admin',
    password_hash,
    status: 'active',
    firstLogin: false,
  });

  // Teachers
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

  // Classes
  const class1 = await Class.create({ name: 'Grade 5 - Blue', grade_level: 5, homeroom_teacher_id: teacher1._id.toString() });
  const class2 = await Class.create({ name: 'Grade 6 - Gold', grade_level: 6, homeroom_teacher_id: teacher3._id.toString() });

  // Teacher Profiles
  await TeacherProfile.create({ user_id: teacher1._id.toString(), assigned_classes: [class1._id.toString()], assigned_subjects: [] });
  await TeacherProfile.create({ user_id: teacher2._id.toString(), assigned_classes: [class1._id.toString(), class2._id.toString()], assigned_subjects: [] });
  await TeacherProfile.create({ user_id: teacher3._id.toString(), assigned_classes: [class2._id.toString()], assigned_subjects: [] });

  // Students
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
  }

  // Subjects
  const subjects = [];
  for (const name of ['Mathematics', 'English', 'Science', 'Amharic', 'Social Studies']) {
    const subject = await Subject.create({
      name,
      class_id: class1._id.toString(),
      teacher_id: teacher1._id.toString(),
    });
    subjects.push(subject);
  }

  // Parents
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
  }

  // Sample Attendance
  const today = new Date();
  for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split('T')[0];
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

  // Sample Grades
  for (const student of students) {
    for (const subject of subjects) {
      for (const assignment of ['Homework 1', 'Quiz 1', 'Mid-term', 'Homework 2']) {
        const score = Math.floor(Math.random() * 40) + 60;
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

  // Calendar Events
  const events = [
    { title: 'School Holiday - Meskel', date: new Date('2024-09-27'), scope: 'school' as const },
    { title: 'Parent-Teacher Conference', date: new Date('2024-10-15'), scope: 'school' as const },
    { title: 'Mid-term Exams Begin', date: new Date('2024-10-20'), scope: 'school' as const },
    { title: 'Math Quiz Due', date: new Date('2024-10-05'), scope: 'class' as const, scope_id: class1._id.toString() },
    { title: 'Science Project Deadline', date: new Date('2024-10-10'), scope: 'class' as const, scope_id: class2._id.toString() },
  ];

  for (const event of events) {
    await CalendarEvent.create({ ...event, created_by: admin._id.toString() });
  }
}
