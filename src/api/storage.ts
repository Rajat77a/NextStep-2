import type { User, School, Class, Student, ReportCard, SubjectGrade, ClarityCheck, TeacherNote, PlanProgress } from '@/types';

const KEYS = {
  users: 'nsa_users',
  schools: 'nsa_schools',
  classes: 'nsa_classes',
  students: 'nsa_students',
  reportCards: 'nsa_reportCards',
  subjectGrades: 'nsa_subjectGrades',
  clarityChecks: 'nsa_clarityChecks',
  teacherNotes: 'nsa_teacherNotes',
  planProgress: 'nsa_planProgress',
  token: 'nsa_auth_token',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getUsers: (): User[] => getItem<User[]>(KEYS.users, []),
  setUsers: (users: User[]) => setItem(KEYS.users, users),

  getSchools: (): School[] => getItem<School[]>(KEYS.schools, []),
  setSchools: (schools: School[]) => setItem(KEYS.schools, schools),

  getClasses: (): Class[] => getItem<Class[]>(KEYS.classes, []),
  setClasses: (classes: Class[]) => setItem(KEYS.classes, classes),

  getStudents: (): Student[] => getItem<Student[]>(KEYS.students, []),
  setStudents: (students: Student[]) => setItem(KEYS.students, students),

  getReportCards: (): ReportCard[] => getItem<ReportCard[]>(KEYS.reportCards, []),
  setReportCards: (cards: ReportCard[]) => setItem(KEYS.reportCards, cards),

  getSubjectGrades: (): SubjectGrade[] => getItem<SubjectGrade[]>(KEYS.subjectGrades, []),
  setSubjectGrades: (grades: SubjectGrade[]) => setItem(KEYS.subjectGrades, grades),

  getClarityChecks: (): ClarityCheck[] => getItem<ClarityCheck[]>(KEYS.clarityChecks, []),
  setClarityChecks: (checks: ClarityCheck[]) => setItem(KEYS.clarityChecks, checks),

  getTeacherNotes: (): TeacherNote[] => getItem<TeacherNote[]>(KEYS.teacherNotes, []),
  setTeacherNotes: (notes: TeacherNote[]) => setItem(KEYS.teacherNotes, notes),

  getPlanProgress: (): PlanProgress[] => getItem<PlanProgress[]>(KEYS.planProgress, []),
  setPlanProgress: (progress: PlanProgress[]) => setItem(KEYS.planProgress, progress),

  getToken: (): string | null => localStorage.getItem(KEYS.token),
  setToken: (token: string) => localStorage.setItem(KEYS.token, token),
  clearToken: () => localStorage.removeItem(KEYS.token),

  clearAll: () => {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  },
};

export function isStorageEmpty(): boolean {
  return !localStorage.getItem(KEYS.users);
}
