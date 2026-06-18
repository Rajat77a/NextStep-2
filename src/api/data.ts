import { storage } from './storage';
import { generateId, delay } from '@/lib/crypto';
import { requireAuth, requireRole } from './auth';
import type {
  School,
  Class,
  Student,
  ReportCard,
  SubjectGrade,
  ClarityCheck,
  TeacherNote,
  PlanProgress,
  ApiError,
  DashboardSummary,
} from '@/types';

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
  const currentUser = users.find((storedUser) => storedUser.id === user.id);

  if (currentUser) {
    currentUser.schoolId = school.id;
    storage.setUsers(users);
  }

  return school;
}

export async function getMySchool(): Promise<School | null> {
  await delay(100);

  const user = requireAuth();

  if (!user.schoolId) return null;

  const schools = storage.getSchools();
  return schools.find((school) => school.id === user.schoolId) || null;
}

export async function updateSchool(id: string, data: Partial<School>): Promise<School> {
  await delay(150);

  requireRole(['admin']);

  const schools = storage.getSchools();
  const index = schools.findIndex((school) => school.id === id);

  if (index === -1) throw createApiError(404, 'School not found');

  schools[index] = {
    ...schools[index],
    ...data,
  };

  storage.setSchools(schools);
  return schools[index];
}

// ===== Classes =====
export async function createClass(data: {
  grade: number;
  section: string;
  teacherId?: string;
}): Promise<Class> {
  await delay(150);

  const user = requireRole(['admin']);

  if (!user.schoolId) throw createApiError(400, 'No school associated');

  const classes = storage.getClasses();

  const classItem: Class = {
    id: generateId(),
    schoolId: user.schoolId,
    grade: data.grade,
    section: data.section,
    teacherId: data.teacherId || '',
    createdAt: new Date().toISOString(),
  };

  classes.push(classItem);
  storage.setClasses(classes);

  return classItem;
}

export async function getClasses(filters?: {
  schoolId?: string;
  teacherId?: string;
}): Promise<Class[]> {
  await delay(100);

  const user = requireAuth();
  const classes = storage.getClasses();

  if (filters?.schoolId) {
    return classes.filter((classItem) => classItem.schoolId === filters.schoolId);
  }

  if (filters?.teacherId) {
    return classes.filter((classItem) => classItem.teacherId === filters.teacherId);
  }

  if (user.role === 'admin' && user.schoolId) {
    return classes.filter((classItem) => classItem.schoolId === user.schoolId);
  }

  if (user.role === 'teacher') {
    return classes.filter((classItem) => classItem.teacherId === user.id);
  }

  return [];
}

export async function updateClass(id: string, data: Partial<Class>): Promise<Class> {
  await delay(150);

  requireRole(['admin']);

  const classes = storage.getClasses();
  const index = classes.findIndex((classItem) => classItem.id === id);

  if (index === -1) throw createApiError(404, 'Class not found');

  classes[index] = {
    ...classes[index],
    ...data,
  };

  storage.setClasses(classes);
  return classes[index];
}

export async function deleteClass(id: string): Promise<void> {
  await delay(150);

  requireRole(['admin']);

  const classes = storage.getClasses().filter((classItem) => classItem.id !== id);
  storage.setClasses(classes);
}

// ===== Students =====
export async function addStudent(data: {
  fullName: string;
  rollNumber: string;
  classId: string;
  parentName?: string;
  parentEmail?: string;
}): Promise<Student> {
  await delay(200);

  const user = requireAuth();
  const classes = storage.getClasses();
  const classItem = classes.find((storedClass) => storedClass.id === data.classId);

  if (!classItem) throw createApiError(404, 'Class not found');

  let parentId = user.id;

  if (user.role === 'admin' && data.parentEmail) {
    const users = storage.getUsers();
    let parent = users.find((storedUser) => storedUser.email === data.parentEmail);

    if (!parent) {
      parent = {
        id: generateId(),
        email: data.parentEmail,
        passwordHash: await (await import('@/lib/crypto')).hashPassword('welcome123'),
        fullName: data.parentName || data.fullName + "'s Parent",
        role: 'parent',
        schoolId: classItem.schoolId,
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
    schoolId: classItem.schoolId,
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

export async function getStudents(filters?: {
  classId?: string;
  parentId?: string;
  schoolId?: string;
}): Promise<Student[]> {
  await delay(100);

  const user = requireAuth();
  let students = storage.getStudents();

  if (filters?.classId) {
    students = students.filter((student) => student.classId === filters.classId);
  }

  if (filters?.parentId) {
    students = students.filter((student) => student.parentId === filters.parentId);
  }

  if (filters?.schoolId) {
    students = students.filter((student) => student.schoolId === filters.schoolId);
  }

  if (user.role === 'parent') {
    students = students.filter((student) => student.parentId === user.id);
  } else if (user.role === 'teacher') {
    const classes = storage.getClasses().filter((classItem) => classItem.teacherId === user.id);
    const classIds = classes.map((classItem) => classItem.id);

    students = students.filter((student) => classIds.includes(student.classId));
  } else if (user.role === 'admin' && user.schoolId) {
    students = students.filter((student) => student.schoolId === user.schoolId);
  }

  return students;
}

export async function getStudent(id: string): Promise<Student | null> {
  await delay(80);

  const students = await getStudents();
  return students.find((student) => student.id === id) || null;
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<Student> {
  await delay(150);

  requireAuth();

  const students = storage.getStudents();
  const index = students.findIndex((student) => student.id === id);

  if (index === -1) throw createApiError(404, 'Student not found');

  students[index] = {
    ...students[index],
    ...data,
  };

  storage.setStudents(students);
  return students[index];
}

export async function deleteStudent(id: string): Promise<void> {
  await delay(150);

  requireRole(['admin']);

  const students = storage.getStudents().filter((student) => student.id !== id);
  storage.setStudents(students);
}

export async function bulkUploadStudents(
  classId: string,
  rows: {
    rollNumber: string;
    fullName: string;
    parentName: string;
    parentEmail: string;
  }[]
): Promise<{ added: number; errors: string[] }> {
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
    } catch (error: any) {
      errors.push(`${row.fullName}: ${error.message}`);
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
  const student = students.find((storedStudent) => storedStudent.id === data.studentId);

  if (!student) throw createApiError(404, 'Student not found');

  const reportCard: ReportCard = {
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

  const reportCards = storage.getReportCards();
  reportCards.push(reportCard);
  storage.setReportCards(reportCards);

  setTimeout(() => {
    const allReportCards = storage.getReportCards();
    const index = allReportCards.findIndex((storedCard) => storedCard.id === reportCard.id);

    if (index !== -1) {
      allReportCards[index].status = 'ready';
      storage.setReportCards(allReportCards);
    }
  }, 2000);

  return reportCard;
}

export async function getReportCards(filters?: {
  studentId?: string;
  classId?: string;
}): Promise<ReportCard[]> {
  await delay(100);

  const user = requireAuth();
  let reportCards = storage.getReportCards();

  if (filters?.studentId) {
    reportCards = reportCards.filter((card) => card.studentId === filters.studentId);
  }

  if (filters?.classId) {
    reportCards = reportCards.filter((card) => card.classId === filters.classId);
  }

  if (user.role === 'parent') {
    const students = storage.getStudents().filter((student) => student.parentId === user.id);
    const studentIds = students.map((student) => student.id);

    reportCards = reportCards.filter((card) => studentIds.includes(card.studentId));
  } else if (user.role === 'teacher') {
    const classes = storage.getClasses().filter((classItem) => classItem.teacherId === user.id);
    const classIds = classes.map((classItem) => classItem.id);

    reportCards = reportCards.filter((card) => classIds.includes(card.classId));
  } else if (user.role === 'admin' && user.schoolId) {
    const students = storage.getStudents().filter((student) => student.schoolId === user.schoolId);
    const studentIds = students.map((student) => student.id);

    reportCards = reportCards.filter((card) => studentIds.includes(card.studentId));
  }

  return reportCards.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function deleteReportCard(id: string): Promise<void> {
  await delay(150);

  requireAuth();

  const reportCards = storage.getReportCards().filter((card) => card.id !== id);
  storage.setReportCards(reportCards);
}

// ===== Subject Grades =====
export async function addSubjectGrades(
  reportCardId: string,
  grades: Partial<SubjectGrade>[]
): Promise<SubjectGrade[]> {
  await delay(200);

  requireAuth();

  const allGrades = storage.getSubjectGrades();

  const newGrades: SubjectGrade[] = grades.map((grade) => ({
    id: generateId(),
    reportCardId,
    subjectName: grade.subjectName || '',
    grade: grade.grade || '',
    normalizedScore: grade.normalizedScore || 0,
    teacherComment: grade.teacherComment,
    flag: grade.flag || 'green',
    aiNote: grade.aiNote,
    createdAt: new Date().toISOString(),
  }));

  allGrades.push(...newGrades);
  storage.setSubjectGrades(allGrades);

  return newGrades;
}

export async function getSubjectGrades(reportCardId: string): Promise<SubjectGrade[]> {
  await delay(80);

  requireAuth();

  return storage.getSubjectGrades().filter((grade) => grade.reportCardId === reportCardId);
}

// ===== Clarity Checks =====
export async function getClarityCheck(reportCardId: string): Promise<ClarityCheck | null> {
  await delay(100);

  requireRole(['parent']);

  return storage.getClarityChecks().find((check) => check.reportCardId === reportCardId) || null;
}

export async function saveClarityCheck(data: Omit<ClarityCheck, 'id'>): Promise<ClarityCheck> {
  await delay(200);

  requireRole(['parent']);

  const checks = storage.getClarityChecks();
  const existingIndex = checks.findIndex((check) => check.reportCardId === data.reportCardId);

  const clarityCheck: ClarityCheck = {
    ...data,
    id: existingIndex >= 0 ? checks[existingIndex].id : generateId(),
  };

  if (existingIndex >= 0) {
    checks[existingIndex] = clarityCheck;
  } else {
    checks.push(clarityCheck);
  }

  storage.setClarityChecks(checks);

  return clarityCheck;
}

// ===== Teacher Notes =====
export async function addTeacherNote(data: {
  studentId: string;
  note: string;
}): Promise<TeacherNote> {
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

  return storage.getTeacherNotes().filter((note) => note.studentId === studentId);
}

export async function updateTeacherNote(id: string, note: string): Promise<TeacherNote> {
  await delay(150);

  const user = requireRole(['teacher']);
  const notes = storage.getTeacherNotes();
  const index = notes.findIndex((storedNote) => storedNote.id === id && storedNote.teacherId === user.id);

  if (index === -1) throw createApiError(404, 'Note not found');

  notes[index] = {
    ...notes[index],
    note,
    updatedAt: new Date().toISOString(),
  };

  storage.setTeacherNotes(notes);
  return notes[index];
}

// ===== Plan Progress =====
export async function getPlanProgress(clarityCheckId: string): Promise<PlanProgress | null> {
  await delay(80);

  requireRole(['parent']);

  return storage.getPlanProgress().find((progress) => progress.clarityCheckId === clarityCheckId) || null;
}

export async function createPlanProgress(
  clarityCheckId: string,
  actionItems: PlanProgress['actionItems']
): Promise<PlanProgress> {
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

  const allProgress = storage.getPlanProgress();
  allProgress.push(progress);
  storage.setPlanProgress(allProgress);

  return progress;
}

export async function updateActionItem(
  progressId: string,
  itemIndex: number,
  completed: boolean
): Promise<PlanProgress> {
  await delay(100);

  requireRole(['parent']);

  const allProgress = storage.getPlanProgress();
  const index = allProgress.findIndex((progress) => progress.id === progressId);

  if (index === -1) throw createApiError(404, 'Progress not found');

  allProgress[index].actionItems[itemIndex].completed = completed;

  const total = allProgress[index].actionItems.length;
  const done = allProgress[index].actionItems.filter((action) => action.completed).length;

  allProgress[index].completionRate = Math.round((done / total) * 100);
  allProgress[index].updatedAt = new Date().toISOString();

  storage.setPlanProgress(allProgress);

  return allProgress[index];
}

// ===== Dashboard =====
export async function getAdminDashboard(): Promise<DashboardSummary> {
  await delay(200);

  const user = requireRole(['admin']);

  if (!user.schoolId) {
    return {
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      reportCardsThisTerm: 0,
      flaggedStudents: 0,
      flagDistribution: {
        green: 0,
        yellow: 0,
        red: 0,
      },
    };
  }

  const students = storage.getStudents().filter((student) => student.schoolId === user.schoolId);
  const classes = storage.getClasses().filter((classItem) => classItem.schoolId === user.schoolId);
  const users = storage.getUsers();

  const assignedTeacherIds = new Set(
    classes
      .map((classItem) => classItem.teacherId)
      .filter(Boolean)
  );

  const activeTeachers = users.filter((storedUser) => {
    return (
      storedUser.role === 'teacher' &&
      (
        storedUser.invitationStatus === 'accepted' ||
        assignedTeacherIds.has(storedUser.id)
      )
    );
  });

  const uniqueTeacherEmails = new Set(
    activeTeachers.map((teacher) => teacher.email.toLowerCase())
  );

  const reportCards = storage.getReportCards();
  const studentIds = students.map((student) => student.id);
  const schoolReportCards = reportCards.filter((reportCard) => {
    return studentIds.includes(reportCard.studentId);
  });

  const allGrades = storage.getSubjectGrades();

  let green = 0;
  let yellow = 0;
  let red = 0;

  const flaggedStudentIds = new Set<string>();

  for (const student of students) {
    const studentCards = schoolReportCards.filter((reportCard) => {
      return reportCard.studentId === student.id;
    });

    if (studentCards.length === 0) continue;

    const latestCard = studentCards.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    const grades = allGrades.filter((grade) => grade.reportCardId === latestCard.id);

    const hasRed = grades.some((grade) => grade.flag === 'red');
    const hasYellow = grades.some((grade) => grade.flag === 'yellow');

    if (hasRed) {
      red++;
      flaggedStudentIds.add(student.id);
    } else if (hasYellow) {
      yellow++;
      flaggedStudentIds.add(student.id);
    } else {
      green++;
    }
  }

  return {
    totalStudents: students.length,
    totalTeachers: uniqueTeacherEmails.size,
    totalClasses: classes.length,
    reportCardsThisTerm: schoolReportCards.length,
    flaggedStudents: flaggedStudentIds.size,
    flagDistribution: {
      green,
      yellow,
      red,
    },
  };
}

export async function getTeacherDashboard(): Promise<{
  classes: Class[];
  totalStudents: number;
  reportCardCount: number;
  flaggedCount: number;
}> {
  await delay(200);

  const user = requireRole(['teacher']);
  const classes = storage.getClasses().filter((classItem) => classItem.teacherId === user.id);
  const classIds = classes.map((classItem) => classItem.id);

  const students = storage.getStudents().filter((student) => classIds.includes(student.classId));
  const reportCards = storage.getReportCards();
  const studentIds = students.map((student) => student.id);
  const studentCards = reportCards.filter((card) => studentIds.includes(card.studentId));

  const allGrades = storage.getSubjectGrades();

  let flaggedCount = 0;

  for (const student of students) {
    const cards = studentCards.filter((card) => card.studentId === student.id);

    if (cards.length === 0) continue;

    const latest = cards.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    const grades = allGrades.filter((grade) => grade.reportCardId === latest.id);

    if (grades.some((grade) => grade.flag === 'red' || grade.flag === 'yellow')) {
      flaggedCount++;
    }
  }

  return {
    classes,
    totalStudents: students.length,
    reportCardCount: studentCards.length,
    flaggedCount,
  };
}

// Helper to get user by ID
export function getUserById(id: string): {
  id: string;
  email: string;
  fullName: string;
  role: string;
} | null {
  const users = storage.getUsers();
  const user = users.find((storedUser) => storedUser.id === id);

  if (!user) return null;

  const { passwordHash: _, ...rest } = user;
  return rest;
}
