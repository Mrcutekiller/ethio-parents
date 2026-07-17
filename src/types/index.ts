export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  password_hash: string;
  status: 'active' | 'inactive' | 'pending';
  firstLogin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentProfile {
  _id: string;
  user_id: string;
  student_id: string;
  class_id: string;
  verification_code: string;
  DOB?: Date;
  admission_date: Date;
}

export interface ITeacherProfile {
  _id: string;
  user_id: string;
  assigned_classes: string[];
  assigned_subjects: string[];
}

export interface IParentLink {
  _id: string;
  parent_id: string;
  student_id: string;
  relationship: string;
  verified_at?: Date;
  code_attempts: number;
  last_attempt_at?: Date;
}

export interface IClass {
  _id: string;
  name: string;
  grade_level: number;
  homeroom_teacher_id: string;
}

export interface ISubject {
  _id: string;
  name: string;
  class_id: string;
  teacher_id: string;
}

export interface IAttendanceRecord {
  _id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  marked_by: string;
  createdAt: Date;
}

export interface IGrade {
  _id: string;
  student_id: string;
  subject_id: string;
  term: string;
  assignment_name: string;
  score: number;
  max_score: number;
  posted_by: string;
  posted_at: Date;
}

export interface IAssignment {
  _id: string;
  subject_id: string;
  teacher_id: string;
  type: 'assignment' | 'test' | 'quiz';
  title: string;
  description: string;
  due_date: Date;
  questions: IQuestion[];
  time_limit_minutes?: number;
  max_score: number;
  randomized: boolean;
}

export interface IQuestion {
  _id?: string;
  type: 'multiple_choice' | 'short_answer';
  question: string;
  options?: string[];
  correct_answer: string;
  points: number;
}

export interface IQuizAttempt {
  _id: string;
  test_id: string;
  student_id: string;
  answers: { question_index: number; answer: string }[];
  score: number;
  max_score: number;
  violations: { type: string; timestamp: Date }[];
  started_at: Date;
  submitted_at?: Date;
  auto_submitted: boolean;
}

export interface IMessage {
  _id: string;
  thread_id: string;
  sender_id: string;
  recipient_id: string;
  student_context_id: string;
  body: string;
  sent_at: Date;
  read_at?: Date;
}

export interface ICalendarEvent {
  _id: string;
  scope: 'school' | 'class' | 'personal';
  scope_id?: string;
  title: string;
  description?: string;
  date: Date;
  end_date?: Date;
  created_by: string;
}

export interface INotification {
  _id: string;
  user_id: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  sent_at: Date;
}

export interface IProgressReport {
  _id: string;
  student_id: string;
  term: string;
  generated_at: Date;
  summary_data: {
    attendance_percentage: number;
    grade_average: number;
    teacher_comments: string;
    subject_grades: { subject: string; average: number }[];
  };
}
