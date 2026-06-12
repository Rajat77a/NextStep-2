export type UserRole = 'parent' | 'teacher' | 'admin';
export type BoardType = 'CBSE' | 'ICSE' | 'IGCSE' | 'State' | 'Other';
export type FlagStatus = 'green' | 'yellow' | 'red';
export type UploadMethod = 'manual' | 'bulk' | 'parent';
export type ReportStatus = 'processing' | 'ready' | 'error';
export type SubscriptionPlan = 'free' | 'basic' | 'premium';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  schoolId: string | null;
  invitationStatus?: 'pending' | 'accepted';
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  isActive: boolean;
}

export interface School {
  id: string;
  name: string;
  boardType: BoardType;
  address?: string;
  adminId: string;
  subscriptionPlan: SubscriptionPlan;
  studentSeatLimit: number;
  createdAt: string;
}

export interface Class {
  id: string;
  schoolId: string;
  grade: number;
  section: string;
  teacherId: string;
  createdAt: string;
}

export interface Student {
  id: string;
  schoolId: string;
  classId: string;
  rollNumber: string;
  fullName: string;
  parentId: string;
  createdAt: string;
}

export interface ReportCard {
  id: string;
  studentId: string;
  classId: string;
  term: string;
  uploadedBy: string;
  uploadMethod: UploadMethod;
  fileUrl?: string;
  boardType: BoardType;
  createdAt: string;
  status: ReportStatus;
  /** Raw OCR text extracted from the uploaded report card file */
  raw_text?: string;
  /** Structured JSON returned by the Grok AI analysis */
  ai_response?: AIReportAnalysis;
}

export interface SubjectGrade {
  id: string;
  reportCardId: string;
  subjectName: string;
  grade: string;
  normalizedScore: number;
  teacherComment?: string;
  flag: FlagStatus;
  aiNote?: string;
  createdAt: string;
}

export interface ConversationScript {
  openingLine?: string;
  avoidSaying?: string[];
  tryInstead?: string[];
  opening?: string;
  acknowledgeGood?: string[];
  exploreChallenges?: string[];
  closeWithSupport?: string;
}

export interface TeacherQuestion {
  subject: string;
  question: string;
  context: string;
  whyItMatters: string;
}

export interface PlanAction {
  text: string;
  timeEstimate: string;
  whyItHelps: string;
}

export interface PlanWeek {
  week?: number;
  habit?: string;
  weekNumber?: number;
  weekTitle?: string;
  dateRange?: string;
  actions?: PlanAction[];
}

export interface ClarityCheckRouteState { reportCardId?: string; }
export interface ClassPatternsRouteState { classId?: string; }

export interface ClarityCheck {
  id: string;
  reportCardId: string;
  parentId: string;
  overallStatus: FlagStatus;
  summaryText: string;
  conversationScript: ConversationScript;
  teacherQuestions: Array<string | TeacherQuestion>;
  thirtyDayPlan: PlanWeek[];
  generatedAt: string;
}

export interface AIReportSubject {
  subject: string;
  grade: string;
  normalizedScore: number;
  flag: FlagStatus;
  teacherComment: string;
  reasoning: string;
}

export interface AIReportAnalysis {
  studentName: string;
  term: string;
  subjects: AIReportSubject[];
  summaryText: string;
  overallStatus: FlagStatus;
  teacherQuestions: TeacherQuestion[];
  conversationScript: ConversationScript;
  thirtyDayPlan: PlanWeek[];
}

export interface TeacherNote {
  id: string;
  studentId: string;
  teacherId: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanProgress {
  id: string;
  clarityCheckId: string;
  parentId: string;
  actionItems: {
    text: string;
    completed: boolean;
    week: number;
  }[];
  completionRate: number;
  updatedAt: string;
}

export interface ApiError {
  code: number;
  message: string;
  field?: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
}

export interface DashboardSummary {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  reportCardsThisTerm: number;
  flaggedStudents: number;
  flagDistribution: { green: number; yellow: number; red: number };
}

export interface StudentWithDetails extends Student {
  className?: string;
  teacherName?: string;
  parentName?: string;
  parentEmail?: string;
  flagCounts?: { green: number; yellow: number; red: number };
  overallFlag?: FlagStatus;
  latestReportCard?: ReportCard;
}

