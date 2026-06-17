import { storage } from './storage';
import { generateId, delay } from '@/lib/crypto';
import { requireAuth, requireRole } from './auth';
import type { School, Class, Student, ReportCard, SubjectGrade, ClarityCheck, TeacherNote, PlanProgress, ApiError, DashboardSummary } from '@/types';

function createApiError(code: number, message: string): ApiError {
  return { code, message };
}

// ===== Schools =====
export async function createSchool(data: Partial<School>): Promise<School> {
  await delay(150);
  const user = requireRole(['admin']);
  const schools = storage.getSchools();
  const school: School = {
    id: generateId(),
    name: data.name || 'My School',
    boardType: data.boardType || 'CBSE',
    address: data.address,
    adminId: user.id,
    subscriptionPlan: 'basic',
    studentSeatLimit: 250,
    createdAt: new Date().toISOString(),
  };
  schools.push(school);
  storage.setSchools(schools);

  const users = storage.getUsers();
  const u = users.find(u => u.id === user.id);
  if (u) { u.schoolId = school.id; storage.setUsers(users); }

  return school;
}

export async function getMySchool(): Promise<School | null> {
  await delay(100);
  const user = requireAuth();
  if (!user.schoolId) return null;
  const schools = storage.getSchools();
  return schools.find(s => s.id === user.schoolId) || null;
}

export async function updateSchool(id: string, data: Partial<School>): Promise<School> {
  await delay(150);
  requireRole(['admin']);
  const schools = storage.getSchools();
  const idx = schools.findIndex(s => s.id === id);
  if (idx === -1) throw createApiError(404, 'School not found');
  schools[idx] = { ...schools[idx], ...data };
  storage.setSchools(schools);
  return schools[idx];
}

// ===== Classes =====
export async function createClass(data: { grade: number; section: string; teacherId?: string }): Promise<Class> {
  await delay(150);
  const user = requireRole(['admin']);
  if (!user.schoolId) throw createApiError(400, 'No school associated');
  const classes = storage.getClasses();
  const cls: Class = {
    id: generateId(),
    schoolId: user.schoolId,
    grade: data.grade,
    section: data.section,
    teacherId: data.teacherId || '',
    createdAt: new Date().toISOString(),
  };
  classes.push(cls);
  storage.setClasses(classes);
  return cls;
}

export async function getClasses(filters?: { schoolId?: string; teacherId?: string }): Promise<Class[]> {
  await delay(100);
  const user = requireAuth();
  const classes = storage.getClasses();
  if (filters?.schoolId) return classes.filter(c => c.schoolId === filters.schoolId);
  if (filters?.teacherId) return classes.filter(c => c.teacherId === filters.teacherId);
  if (user.role === 'admin' && user.schoolId) return classes.filter(c => c.schoolId === user.schoolId);
  if (user.role === 'teacher') return classes.filter(c => c.teacherId === user.id);
  return [];
}

export async function updateClass(id: string, data: Partial<Class>): Promise<Class> {
  await delay(150);
  requireRole(['admin']);
  const classes = storage.getClasses();
  const idx = classes.findIndex(c => c.id === id);
  if (idx === -1) throw createApiError(404, 'Class not found');
  classes[idx] = { ...classes[idx], ...data };
  storage.setClasses(classes);
  return classes[idx];
}

export async function deleteClass(id: string): Promise<void> {
  await delay(150);
  requireRole(['admin']);
  const classes = storage.getClasses().filter(c => c.id !== id);
  storage.setClasses(classes);
}

// ===== Students =====
export async function addStudent(data: { fullName: string; rollNumber: string; classId: string; parentName?: string; parentEmail?: string }): Promise<Student> {
  await delay(200);
  const user = requireAuth();
  const classes = storage.getClasses();
  const cls = classes.find(c => c.id === data.classId);
  if (!cls) throw createApiError(404, 'Class not found');

  let parentId = user.id;
  if (user.role === 'admin' && data.parentEmail) {
    const users = storage.getUsers();
    let parent = users.find(u => u.email === data.parentEmail);
    if (!parent) {
      parent = {
        id: generateId(),
        email: data.parentEmail,
        passwordHash: await (await import('@/lib/crypto')).hashPassword('welcome123'),
        fullName: data.parentName || data.fullName + "'s Parent",
        role: 'parent',
        schoolId: cls.schoolId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: null,
        isActive: true,
      };
      users.push(parent);
      storage.setUsers(users);
    }
    parentId = parent.id;
  }

  const students = storage.getStudents();
  const student: Student = {
    id: generateId(),
    schoolId: cls.schoolId,
    classId: data.classId,
    rollNumber: data.rollNumber,
    fullName: data.fullName,
    parentId,
    createdAt: new Date().toISOString(),
  };
  students.push(student);
  storage.setStudents(students);
  return student;
}

export async function getStudents(filters?: { classId?: string; parentId?: string; schoolId?: string }): Promise<Student[]> {
  await delay(100);
  const user = requireAuth();
  let students = storage.getStudents();

  if (filters?.classId) students = students.filter(s => s.classId === filters.classId);
  if (filters?.parentId) students = students.filter(s => s.parentId === filters.parentId);
  if (filters?.schoolId) students = students.filter(s => s.schoolId === filters.schoolId);

  if (user.role === 'parent') students = students.filter(s => s.parentId === user.id);
  else if (user.role === 'teacher') {
    const classes = storage.getClasses().filter(c => c.teacherId === user.id);
    const classIds = classes.map(c => c.id);
    students = students.filter(s => classIds.includes(s.classId));
  } else if (user.role === 'admin' && user.schoolId) {
    students = students.filter(s => s.schoolId === user.schoolId);
  }

  return students;
}

export async function getStudent(id: string): Promise<Student | null> {
  await delay(80);
  const students = await getStudents();
  return students.find(s => s.id === id) || null;
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<Student> {
  await delay(150);
  requireAuth();
  const students = storage.getStudents();
  const idx = students.findIndex(s => s.id === id);
  if (idx === -1) throw createApiError(404, 'Student not found');
  students[idx] = { ...students[idx], ...data };
  storage.setStudents(students);
  return students[idx];
}

export async function deleteStudent(id: string): Promise<void> {
  await delay(150);
  requireRole(['admin']);
  const students = storage.getStudents().filter(s => s.id !== id);
  storage.setStudents(students);
}

export async function bulkUploadStudents(classId: string, rows: { rollNumber: string; fullName: string; parentName: string; parentEmail: string }[]): Promise<{ added: number; errors: string[] }> {
  await delay(400);
  requireRole(['admin']);
  let added = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      await addStudent({
        fullName: row.fullName,
        rollNumber: row.rollNumber,
        classId,
        parentName: row.parentName,
        parentEmail: row.parentEmail,
      });
      added++;
    } catch (e: any) {
      errors.push(`${row.fullName}: ${e.message}`);
    }
  }
  return { added, errors };
}

// ===== Report Cards =====
export async function uploadReportCard(data: {
  studentId: string;
  term: string;
  boardType: string;
  file?: File;
  uploadMethod?: string;
}): Promise<ReportCard> {
  await delay(300);
  const user = requireAuth();
  const students = storage.getStudents();
  const student = students.find(s => s.id === data.studentId);
  if (!student) throw createApiError(404, 'Student not found');

  const card: ReportCard = {
    id: generateId(),
    studentId: data.studentId,
    classId: student.classId,
    term: data.term,
    uploadedBy: user.id,
    uploadMethod: (data.uploadMethod as any) || 'parent',
    boardType: data.boardType as any,
    createdAt: new Date().toISOString(),
    status: 'processing',
  };

  const cards = storage.getReportCards();
  cards.push(card);
  storage.setReportCards(cards);

  setTimeout(() => {
    const allCards = storage.getReportCards();
    const idx = allCards.findIndex(c => c.id === card.id);
    if (idx !== -1) {
      allCards[idx].status = 'ready';
      storage.setReportCards(allCards);
    }
  }, 2000);

  return card;
}

export async function getReportCards(filters?: { studentId?: string; classId?: string }): Promise<ReportCard[]> {
  await delay(100);
  const user = requireAuth();
  let cards = storage.getReportCards();

  if (filters?.studentId) cards = cards.filter(c => c.studentId === filters.studentId);
  if (filters?.classId) cards = cards.filter(c => c.classId === filters.classId);

  if (user.role === 'parent') {
    const students = storage.getStudents().filter(s => s.parentId === user.id);
    const studentIds = students.map(s => s.id);
    cards = cards.filter(c => studentIds.includes(c.studentId));
  } else if (user.role === 'teacher') {
    const classes = storage.getClasses().filter(c => c.teacherId === user.id);
    const classIds = classes.map(c => c.id);
    cards = cards.filter(c => classIds.includes(c.classId));
  } else if (user.role === 'admin' && user.schoolId) {
    const students = storage.getStudents().filter(s => s.schoolId === user.schoolId);
    const studentIds = students.map(s => s.id);
    cards = cards.filter(c => studentIds.includes(c.studentId));
  }

  return cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function deleteReportCard(id: string): Promise<void> {
  await delay(150);
  requireAuth();
  const cards = storage.getReportCards().filter(c => c.id !== id);
  storage.setReportCards(cards);
}

// ===== Subject Grades =====
export async function addSubjectGrades(reportCardId: string, grades: Partial<SubjectGrade>[]): Promise<SubjectGrade[]> {
  await delay(200);
  requireAuth();
  const allGrades = storage.getSubjectGrades();
  const newGrades: SubjectGrade[] = grades.map(g => ({
    id: generateId(),
    reportCardId,
    subjectName: g.subjectName || '',
    grade: g.grade || '',
    normalizedScore: g.normalizedScore || 0,
    teacherComment: g.teacherComment,
    flag: g.flag || 'green',
    aiNote: g.aiNote,
    createdAt: new Date().toISOString(),
  }));
  allGrades.push(...newGrades);
  storage.setSubjectGrades(allGrades);
  return newGrades;
}

export async function getSubjectGrades(reportCardId: string): Promise<SubjectGrade[]> {
  await delay(80);
  requireAuth();
  return storage.getSubjectGrades().filter(g => g.reportCardId === reportCardId);
}

// ===== Clarity Checks =====
export async function getClarityCheck(reportCardId: string): Promise<ClarityCheck | null> {
  await delay(100);
  requireRole(['parent']);
  return storage.getClarityChecks().find(c => c.reportCardId === reportCardId) || null;
}

export async function saveClarityCheck(data: Omit<ClarityCheck, 'id'>): Promise<ClarityCheck> {
  await delay(200);
  requireRole(['parent']);
  const checks = storage.getClarityChecks();
  const existing = checks.findIndex(c => c.reportCardId === data.reportCardId);
  const check: ClarityCheck = { ...data, id: existing >= 0 ? checks[existing].id : generateId() };
  if (existing >= 0) checks[existing] = check;
  else checks.push(check);
  storage.setClarityChecks(checks);
  return check;
}

// ===== Teacher Notes =====
export async function addTeacherNote(data: { studentId: string; note: string }): Promise<TeacherNote> {
  await delay(150);
  const user = requireRole(['teacher']);
  const notes = storage.getTeacherNotes();
  const note: TeacherNote = {
    id: generateId(),
    studentId: data.studentId,
    teacherId: user.id,
    note: data.note,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  notes.push(note);
  storage.setTeacherNotes(notes);
  return note;
}

export async function getTeacherNotes(studentId: string): Promise<TeacherNote[]> {
  await delay(80);
  requireRole(['teacher']);
  return storage.getTeacherNotes().filter(n => n.studentId === studentId);
}

export async function updateTeacherNote(id: string, note: string): Promise<TeacherNote> {
  await delay(150);
  const user = requireRole(['teacher']);
  const notes = storage.getTeacherNotes();
  const idx = notes.findIndex(n => n.id === id && n.teacherId === user.id);
  if (idx === -1) throw createApiError(404, 'Note not found');
  notes[idx] = { ...notes[idx], note, updatedAt: new Date().toISOString() };
  storage.setTeacherNotes(notes);
  return notes[idx];
}

// ===== Plan Progress =====
export async function getPlanProgress(clarityCheckId: string): Promise<PlanProgress | null> {
  await delay(80);
  requireRole(['parent']);
  return storage.getPlanProgress().find(p => p.clarityCheckId === clarityCheckId) || null;
}

export async function createPlanProgress(clarityCheckId: string, actionItems: PlanProgress['actionItems']): Promise<PlanProgress> {
  await delay(150);
  const user = requireRole(['parent']);
  const progress: PlanProgress = {
    id: generateId(),
    clarityCheckId,
    parentId: user.id,
    actionItems,
    completionRate: 0,
    updatedAt: new Date().toISOString(),
  };
  const all = storage.getPlanProgress();
  all.push(progress);
  storage.setPlanProgress(all);
  return progress;
}

export async function updateActionItem(progressId: string, itemIndex: number, completed: boolean): Promise<PlanProgress> {
  await delay(100);
  requireRole(['parent']);
  const all = storage.getPlanProgress();
  const idx = all.findIndex(p => p.id === progressId);
  if (idx === -1) throw createApiError(404, 'Progress not found');
  all[idx].actionItems[itemIndex].completed = completed;
  const total = all[idx].actionItems.length;
  const done = all[idx].actionItems.filter(a => a.completed).length;
  all[idx].completionRate = Math.round((done / total) * 100);
  all[idx].updatedAt = new Date().toISOString();
  storage.setPlanProgress(all);
  return all[idx];
}

// ===== Dashboard =====
export async function getAdminDashboard(): Promise<DashboardSummary> {
  await delay(200);
  const user = requireRole(['admin']);
  if (!user.schoolId) {
    return { totalStudents: 0, totalTeachers: 0, totalClasses: 0, reportCardsThisTerm: 0, flaggedStudents: 0, flagDistribution: { green: 0, yellow: 0, red: 0 } };
  }

  const students = storage.getStudents().filter(s => s.schoolId === user.schoolId);
  const classes = storage.getClasses().filter(c => c.schoolId === user.schoolId);
  const users = storage.getUsers();
  const teachers = users.filter(u => u.role === 'teacher');
  const reportCards = storage.getReportCards();
  const studentIds = students.map(s => s.id);
  const schoolReportCards = reportCards.filter(r => studentIds.includes(r.studentId));

  const allGrades = storage.getSubjectGrades();
  let green = 0, yellow = 0, red = 0;
  const flaggedStudentIds = new Set<string>();

  for (const student of students) {
    const studentCards = schoolReportCards.filter(r => r.studentId === student.id);
    if (studentCards.length === 0) continue;
    const latestCard = studentCards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const grades = allGrades.filter(g => g.reportCardId === latestCard.id);
    const hasRed = grades.some(g => g.flag === 'red');
    const hasYellow = grades.some(g => g.flag === 'yellow');
    if (hasRed) { red++; flaggedStudentIds.add(student.id); }
    else if (hasYellow) { yellow++; flaggedStudentIds.add(student.id); }
    else green++;
  }

  return {
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalClasses: classes.length,
    reportCardsThisTerm: schoolReportCards.length,
    flaggedStudents: flaggedStudentIds.size,
    flagDistribution: { green, yellow, red },
  };
}

export async function getTeacherDashboard(): Promise<{ classes: Class[]; totalStudents: number; reportCardCount: number; flaggedCount: number }> {
  await delay(200);
  const user = requireRole(['teacher']);
  const classes = storage.getClasses().filter(c => c.teacherId === user.id);
  const classIds = classes.map(c => c.id);
  const students = storage.getStudents().filter(s => classIds.includes(s.classId));
  const reportCards = storage.getReportCards();
  const studentIds = students.map(s => s.id);
  const studentCards = reportCards.filter(r => studentIds.includes(r.studentId));

  const allGrades = storage.getSubjectGrades();
  let flaggedCount = 0;
  for (const student of students) {
    const cards = studentCards.filter(r => r.studentId === student.id);
    if (cards.length === 0) continue;
    const latest = cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const grades = allGrades.filter(g => g.reportCardId === latest.id);
    if (grades.some(g => g.flag === 'red' || g.flag === 'yellow')) flaggedCount++;
  }

  return { classes, totalStudents: students.length, reportCardCount: studentCards.length, flaggedCount };
}

// Helper to get user by ID
export function getUserById(id: string): { id: string; email: string; fullName: string; role: string } | null {
  const users = storage.getUsers();
  const user = users.find(u => u.id === id);
  if (!user) return null;
  const { passwordHash: _, ...rest } = user;
  return rest;
}
