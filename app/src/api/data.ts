import { storage } from './storage';
import { generateId, delay } from '@/lib/crypto';
import { requireAuth, requireRole } from './auth';
import { supabase } from '@/lib/supabase';
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

  const user = await requireRole(['admin']);
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

  const user = await requireAuth();

  if (!user.schoolId) return null;

  const schools = storage.getSchools();
  return schools.find((school) => school.id === user.schoolId) || null;
}

export async function updateSchool(id: string, data: Partial<School>): Promise<School> {
  await delay(150);

  await requireRole(['admin']);

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

  const user = await requireRole(['admin']);

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

  const user = await requireAuth();
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

  await requireRole(['admin']);

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

  await requireRole(['admin']);

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

  const user = await requireAuth();
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

export async function addParentStudent(fullName: string): Promise<Student> {
  // Get current Supabase session to find parent ID
  const { data: sessionData } = await supabase.auth.getSession();
  const supaUserId = sessionData.session?.user?.id;
  if (!supaUserId) throw createApiError(401, 'Please sign in to continue');

  // Check for duplicate in Supabase
  const { data: existing } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', supaUserId)
    .ilike('full_name', fullName)
    .maybeSingle();

  if (existing) {
    return {
      id: existing.id,
      schoolId: existing.school_id ?? 'parent-local-school',
      classId: existing.class_id ?? 'parent-local-class',
      rollNumber: existing.roll_number ?? '',
      fullName: existing.full_name,
      parentId: existing.user_id,
      createdAt: existing.created_at,
    };
  }

  const { data, error } = await supabase
    .from('students')
    .insert({
      user_id: supaUserId,
      full_name: fullName,
      school_id: null,
      class_id: null,
      roll_number: '',
    })
    .select()
    .single();

  if (error || !data) throw createApiError(500, error?.message || 'Could not add student');

  return {
    id: data.id,
    schoolId: data.school_id ?? 'parent-local-school',
    classId: data.class_id ?? 'parent-local-class',
    rollNumber: data.roll_number ?? '',
    fullName: data.full_name,
    parentId: data.user_id,
    createdAt: data.created_at,
  };
}

export async function getStudents(filters?: {
  classId?: string;
  parentId?: string;
  schoolId?: string;
}): Promise<Student[]> {
  // Parent: fetch from Supabase
  if (filters?.parentId) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', filters.parentId)
      .order('created_at', { ascending: true });

    if (error) throw createApiError(500, error.message);

    return (data ?? []).map((row) => ({
      id: row.id,
      schoolId: row.school_id ?? 'parent-local-school',
      classId: row.class_id ?? 'parent-local-class',
      rollNumber: row.roll_number ?? '',
      fullName: row.full_name,
      parentId: row.user_id,
      createdAt: row.created_at,
    }));
  }

  // Admin / teacher: keep localStorage path
  await delay(100);
  let students = storage.getStudents();
  if (filters?.classId) students = students.filter((s) => s.classId === filters.classId);
  if (filters?.schoolId) students = students.filter((s) => s.schoolId === filters.schoolId);
  return students;
}

export async function getStudent(id: string): Promise<Student | null> {
  await delay(80);

  const students = await getStudents();
  return students.find((student) => student.id === id) || null;
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<Student> {
  await delay(150);

  await requireAuth();

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

  await requireRole(['admin']);

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

  await requireRole(['admin']);

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
  /** Raw OCR text extracted from the uploaded file — saved to ReportCard.raw_text */
  raw_text?: string;
}): Promise<ReportCard> {
  const { data: sessionData } = await supabase.auth.getSession();
  const supaUserId = sessionData.session?.user?.id;
  if (!supaUserId) throw createApiError(401, 'Please sign in to continue');

  const { data: row, error } = await supabase
    .from('report_cards')
    .insert({
      student_id: data.studentId,
      uploaded_by: supaUserId,
      upload_source: data.uploadMethod || 'self_uploaded',
      board_type: data.boardType,
      term: data.term,
      raw_text: data.raw_text ?? null,
      ai_response: null,
      status: 'processing',
    })
    .select()
    .single();

  if (error || !row) throw createApiError(500, error?.message || 'Could not save report card');

  return {
    id: row.id,
    studentId: row.student_id,
    classId: row.class_id ?? 'parent-local-class',
    term: row.term,
    uploadedBy: row.uploaded_by,
    uploadMethod: (row.upload_source as any) || 'parent',
    boardType: row.board_type as any,
    createdAt: row.created_at,
    status: row.status as any,
    raw_text: row.raw_text ?? undefined,
    ai_response: row.ai_response ?? undefined,
  };
}

export async function getReportCards(filters?: {
  studentId?: string;
  classId?: string;
}): Promise<ReportCard[]> {
  const { data: sessionData } = await supabase.auth.getSession();
  const supaUserId = sessionData.session?.user?.id;

  // Build query — fetch from Supabase for authenticated users
  if (supaUserId) {
    let query = supabase
      .from('report_cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.studentId) {
      query = query.eq('student_id', filters.studentId);
    } else {
      // Scope to parent's own children
      const { data: myStudents } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', supaUserId);

            const studentIds = (myStudents ?? []).map((s: any) => s.id);
      if (studentIds.length > 0) {
        query = query.in('student_id', studentIds);
      } else {
        query = query.eq('uploaded_by', supaUserId);
      }
    }

    const { data, error } = await query;
    if (error) throw createApiError(500, error.message);

    return (data ?? []).map((row) => ({
      id: row.id,
      studentId: row.student_id,
      classId: row.class_id ?? 'parent-local-class',
      term: row.term,
      uploadedBy: row.uploaded_by,
      uploadMethod: (row.upload_source as any) || 'parent',
      boardType: row.board_type as any,
      createdAt: row.created_at,
      status: row.status as any,
      raw_text: row.raw_text ?? undefined,
      ai_response: row.ai_response ?? undefined,
    }));
  }

  // Fallback: localStorage (admin/teacher without Supabase tables)
  await delay(100);
  await requireAuth();
  let reportCards = storage.getReportCards();
  if (filters?.studentId) reportCards = reportCards.filter((c) => c.studentId === filters.studentId);
  if (filters?.classId) reportCards = reportCards.filter((c) => c.classId === filters.classId);
  return reportCards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function deleteReportCard(id: string): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user) {
    const { error } = await supabase.from('report_cards').delete().eq('id', id);
    if (error) throw createApiError(500, error.message);
    return;
  }

  await delay(150);
  await requireAuth();
  const reportCards = storage.getReportCards().filter((card) => card.id !== id);
  storage.setReportCards(reportCards);
}

/**
 * Patches the structured Grok AI response onto an existing ReportCard record in Supabase.
 * Called immediately after analyzeReportText() returns successfully.
 */
export async function updateReportCardAiResponse(
  id: string,
  ai_response: import('@/types').AIReportAnalysis
): Promise<ReportCard> {
  const { data, error } = await supabase
    .from('report_cards')
    .update({ ai_response, status: 'ready' })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) throw createApiError(500, error?.message || 'Could not save AI response');

  return {
    id: data.id,
    studentId: data.student_id,
    classId: data.class_id ?? 'parent-local-class',
    term: data.term,
    uploadedBy: data.uploaded_by,
    uploadMethod: (data.upload_source as any) || 'parent',
    boardType: data.board_type as any,
    createdAt: data.created_at,
    status: data.status as any,
    raw_text: data.raw_text ?? undefined,
    ai_response: data.ai_response ?? undefined,
  };
}

// ===== Subject Grades =====
export async function addSubjectGrades(
  reportCardId: string,
  grades: Partial<SubjectGrade>[]
): Promise<SubjectGrade[]> {
  await delay(200);

  await requireAuth();

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

  await requireAuth();

  return storage.getSubjectGrades().filter((grade) => grade.reportCardId === reportCardId);
}

// ===== Clarity Checks =====
export async function getClarityCheck(reportCardId: string): Promise<ClarityCheck | null> {
  await delay(100);

  await requireRole(['parent']);

  return storage.getClarityChecks().find((check) => check.reportCardId === reportCardId) || null;
}

export async function saveClarityCheck(data: Omit<ClarityCheck, 'id'>): Promise<ClarityCheck> {
  await delay(200);

  await requireRole(['parent']);

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

  const user = await requireRole(['teacher']);
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

  await requireRole(['teacher']);

  return storage.getTeacherNotes().filter((note) => note.studentId === studentId);
}

export async function updateTeacherNote(id: string, note: string): Promise<TeacherNote> {
  await delay(150);

  const user = await requireRole(['teacher']);
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

  await requireRole(['parent']);

  return storage.getPlanProgress().find((progress) => progress.clarityCheckId === clarityCheckId) || null;
}

export async function createPlanProgress(
  clarityCheckId: string,
  actionItems: PlanProgress['actionItems']
): Promise<PlanProgress> {
  await delay(150);

  const user = await requireRole(['parent']);

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

  await requireRole(['parent']);

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

  const user = await requireRole(['admin']);

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

  const user = await requireRole(['teacher']);
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
