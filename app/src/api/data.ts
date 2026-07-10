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
  AIReportAnalysis,
} from '@/types';

function createApiError(code: number, message: string): ApiError {
  return { code, message };
}

// ===== Schools =====
export async function createSchool(data: Partial<School>): Promise<School> {
  const user = await requireRole(['admin']);

  const { data: row, error } = await supabase
    .from('schools')
    .insert({
      name: data.name || 'My School',
      board_type: data.boardType || 'CBSE',
      address: data.address,
      admin_id: user.id,
      subscription_plan: 'basic',
      student_seat_limit: 250,
    })
    .select()
    .single();

  if (error || !row) throw createApiError(500, error?.message || 'Could not create school');

  // Update profile with school_id
  await supabase.from('profiles').update({ school_id: row.id }).eq('id', user.id);

  return {
    id: row.id,
    name: row.name,
    boardType: row.board_type,
    address: row.address,
    adminId: row.admin_id,
    subscriptionPlan: row.subscription_plan,
    studentSeatLimit: row.student_seat_limit,
    createdAt: row.created_at,
  };
}

export async function getMySchool(): Promise<School | null> {
  const user = await requireAuth();
  if (!user.schoolId) return null;

  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', user.schoolId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    boardType: data.board_type,
    address: data.address,
    adminId: data.admin_id,
    subscriptionPlan: data.subscription_plan,
    studentSeatLimit: data.student_seat_limit,
    createdAt: data.created_at,
  };
}

export async function updateSchool(id: string, data: Partial<School>): Promise<School> {
  await requireRole(['admin']);

  const updates: Record<string, unknown> = {};
  if (data.name) updates.name = data.name;
  if (data.boardType) updates.board_type = data.boardType;
  if (data.address) updates.address = data.address;
  if (data.subscriptionPlan) updates.subscription_plan = data.subscriptionPlan;
  if (data.studentSeatLimit) updates.student_seat_limit = data.studentSeatLimit;

  const { data: row, error } = await supabase
    .from('schools')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !row) throw createApiError(404, error?.message || 'School not found');

  return {
    id: row.id,
    name: row.name,
    boardType: row.board_type,
    address: row.address,
    adminId: row.admin_id,
    subscriptionPlan: row.subscription_plan,
    studentSeatLimit: row.student_seat_limit,
    createdAt: row.created_at,
  };
}

// ===== Classes =====
export async function createClass(data: {
  grade: number;
  section: string;
  teacherId?: string;
}): Promise<Class> {
  const user = await requireRole(['admin']);
  if (!user.schoolId) throw createApiError(400, 'No school associated');

  const { data: row, error } = await supabase
    .from('classes')
    .insert({
      school_id: user.schoolId,
      grade: data.grade,
      section: data.section,
      teacher_id: data.teacherId || null,
    })
    .select()
    .single();

  if (error || !row) throw createApiError(500, error?.message || 'Could not create class');

  return {
    id: row.id,
    schoolId: row.school_id,
    grade: row.grade,
    section: row.section,
    teacherId: row.teacher_id ?? '',
    createdAt: row.created_at,
  };
}

export async function getClasses(filters?: {
  schoolId?: string;
  teacherId?: string;
}): Promise<Class[]> {
  const user = await requireAuth();

  let query = supabase.from('classes').select('*');

  if (filters?.schoolId) {
    query = query.eq('school_id', filters.schoolId);
  } else if (filters?.teacherId) {
    query = query.eq('teacher_id', filters.teacherId);
  } else if (user.role === 'admin' && user.schoolId) {
    query = query.eq('school_id', user.schoolId);
  } else if (user.role === 'teacher') {
    query = query.eq('teacher_id', user.id);
  } else {
    return [];
  }

  const { data, error } = await query.order('grade', { ascending: true });

  if (error) throw createApiError(500, error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    schoolId: row.school_id,
    grade: row.grade,
    section: row.section,
    teacherId: row.teacher_id ?? '',
    createdAt: row.created_at,
  }));
}

export async function updateClass(id: string, data: Partial<Class>): Promise<Class> {
  await requireRole(['admin']);

  const updates: Record<string, unknown> = {};
  if (data.grade) updates.grade = data.grade;
  if (data.section) updates.section = data.section;
  if (data.teacherId !== undefined) updates.teacher_id = data.teacherId || null;

  const { data: row, error } = await supabase
    .from('classes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !row) throw createApiError(404, error?.message || 'Class not found');

  return {
    id: row.id,
    schoolId: row.school_id,
    grade: row.grade,
    section: row.section,
    teacherId: row.teacher_id ?? '',
    createdAt: row.created_at,
  };
}

export async function deleteClass(id: string): Promise<void> {
  await requireRole(['admin']);

  const { error } = await supabase.from('classes').delete().eq('id', id);
  if (error) throw createApiError(500, error.message);
}

// ===== Students =====
export async function addStudent(data: {
  fullName: string;
  rollNumber: string;
  classId: string;
  parentName?: string;
  parentEmail?: string;
}): Promise<Student> {
  const user = await requireAuth();

  // Get the class to find schoolId
  const { data: classRow } = await supabase
    .from('classes')
    .select('school_id')
    .eq('id', data.classId)
    .single();

  if (!classRow) throw createApiError(404, 'Class not found');

  let parentUserId = user.id;

  if (user.role === 'admin' && data.parentEmail) {
    // Try to find existing parent profile by email
    const { data: existingParent } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'parent')
      .maybeSingle();

    // We can't search by email easily — profiles don't have email column
    // Fallback: use the admin's user ID as parent reference
    // Parents will link via signup flow
    parentUserId = user.id;
  }

  const { data: row, error } = await supabase
    .from('students')
    .insert({
      user_id: parentUserId,
      full_name: data.fullName,
      school_id: classRow.school_id,
      class_id: data.classId,
      roll_number: data.rollNumber,
    })
    .select()
    .single();

  if (error || !row) throw createApiError(500, error?.message || 'Could not add student');

  return {
    id: row.id,
    schoolId: row.school_id ?? classRow.school_id,
    classId: row.class_id,
    rollNumber: row.roll_number ?? '',
    fullName: row.full_name,
    parentId: row.user_id,
    createdAt: row.created_at,
  };
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
  const user = await requireAuth();

  // Parent: fetch from Supabase scoped to parent
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

  // Admin / teacher: fetch from Supabase
  let query = supabase.from('students').select('*');

  if (filters?.classId) {
    query = query.eq('class_id', filters.classId);
  }
  if (filters?.schoolId) {
    query = query.eq('school_id', filters.schoolId);
  }
  // If admin, scope to school
  if (!filters?.classId && !filters?.schoolId && user.role === 'admin' && user.schoolId) {
    query = query.eq('school_id', user.schoolId);
  }
  // If teacher, scope by their classes
  if (!filters?.classId && !filters?.schoolId && user.role === 'teacher') {
    const classes = await getClasses();
    const classIds = classes.map((c) => c.id);
    if (classIds.length > 0) {
      query = query.in('class_id', classIds);
    } else {
      return [];
    }
  }

  const { data, error } = await query.order('full_name', { ascending: true });

  if (error) throw createApiError(500, error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    schoolId: row.school_id ?? '',
    classId: row.class_id ?? '',
    rollNumber: row.roll_number ?? '',
    fullName: row.full_name,
    parentId: row.user_id,
    createdAt: row.created_at,
  }));
}

export async function getStudent(id: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    schoolId: data.school_id ?? '',
    classId: data.class_id ?? '',
    rollNumber: data.roll_number ?? '',
    fullName: data.full_name,
    parentId: data.user_id,
    createdAt: data.created_at,
  };
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<Student> {
  await requireAuth();

  const updates: Record<string, unknown> = {};
  if (data.fullName) updates.full_name = data.fullName;
  if (data.rollNumber) updates.roll_number = data.rollNumber;
  if (data.classId) updates.class_id = data.classId;

  const { data: row, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !row) throw createApiError(404, error?.message || 'Student not found');

  return {
    id: row.id,
    schoolId: row.school_id ?? '',
    classId: row.class_id ?? '',
    rollNumber: row.roll_number ?? '',
    fullName: row.full_name,
    parentId: row.user_id,
    createdAt: row.created_at,
  };
}

export async function deleteStudent(id: string): Promise<void> {
  await requireRole(['admin']);

  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw createApiError(500, error.message);
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

  let reportCards: ReportCard[] = [];

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
      }
      // If no students found (teacher/admin), don't scope — RLS handles it
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      reportCards = data.map((row) => ({
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

    if (reportCards.length === 0) {
      // Supabase returned no data — try localStorage for backwards compat
      await delay(50);
      reportCards = storage.getReportCards();
    }
  } else {
    // Fallback: localStorage (admin/teacher without Supabase tables)
    await delay(100);
    await requireAuth();
    reportCards = storage.getReportCards();
  }

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
  await requireAuth();
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
  await requireAuth();

  // Data is primarily in report_cards.ai_response — this is a legacy cache
  // Insert into Supabase subject_grades table if needed
  const rows = grades.map((grade) => ({
    report_card_id: reportCardId,
    subject_name: grade.subjectName || '',
    grade: grade.grade || '',
    normalized_score: grade.normalizedScore || 0,
    flag: grade.flag || 'green',
    ai_note: grade.aiNote || null,
  }));

  // Try Supabase; silently fall back to localStorage for backwards compat
  const { error } = await supabase.from('subject_grades').insert(rows);
  if (error) {
    // localStorage fallback
    const allGrades = storage.getSubjectGrades();
    const newGrades: SubjectGrade[] = grades.map((grade) => ({
      id: `${reportCardId}-${Math.random().toString(36).slice(2)}`,
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

  // If Supabase succeeded, also cache in localStorage for fast reads
  storage.setSubjectGrades(storage.getSubjectGrades().concat(
    (rows as any[]).map((r) => ({
      id: `${reportCardId}-${Math.random().toString(36).slice(2)}`,
      reportCardId,
      subjectName: r.subject_name,
      grade: r.grade,
      normalizedScore: r.normalized_score,
      teacherComment: '',
      flag: r.flag,
      aiNote: r.ai_note,
      createdAt: new Date().toISOString(),
    }))
  ));

  return [];
}

export async function getSubjectGrades(reportCardId: string): Promise<SubjectGrade[]> {
  await requireAuth();

  const cached = storage.getSubjectGrades().filter((grade) => grade.reportCardId === reportCardId);
  if (cached.length > 0) return cached;

  const { data, error } = await supabase
    .from('report_cards')
    .select('ai_response')
    .eq('id', reportCardId)
    .single();

  if (error || !data?.ai_response) return [];

  const analysis = data.ai_response as AIReportAnalysis;
  return analysis.subjects.map((subject, i) => ({
    id: `${reportCardId}-${i}`,
    reportCardId,
    subjectName: subject.subject,
    grade: subject.grade,
    normalizedScore: subject.normalizedScore,
    teacherComment: subject.teacherComment,
    flag: subject.flag,
    aiNote: subject.reasoning,
    createdAt: new Date().toISOString(),
  }));
}

// ===== Clarity Checks =====
export async function getClarityCheck(reportCardId: string): Promise<ClarityCheck | null> {
  await requireRole(['parent']);

  // Try reading from localStorage cache first
  const cached = storage.getClarityChecks().find((check) => check.reportCardId === reportCardId);
  if (cached) return cached;

  // Fallback: reconstruct from Supabase report_cards.ai_response
  const { data, error } = await supabase
    .from('report_cards')
    .select('ai_response, uploaded_by')
    .eq('id', reportCardId)
    .single();

  if (error || !data?.ai_response) return null;

  const analysis = data.ai_response as AIReportAnalysis;

  return {
    id: `clarity-${reportCardId}`,
    reportCardId,
    parentId: data.uploaded_by,
    overallStatus: analysis.overallStatus || 'green',
    summaryText: analysis.summaryText || '',
    conversationScript: analysis.conversationScript || {},
    teacherQuestions: analysis.teacherQuestions || [],
    thirtyDayPlan: analysis.thirtyDayPlan || [],
    generatedAt: new Date().toISOString(),
  };
}

export async function saveClarityCheck(data: Omit<ClarityCheck, 'id'>): Promise<ClarityCheck> {
  await requireRole(['parent']);

  // Primary data is already in report_cards.ai_response — this is a cache
  const checks = storage.getClarityChecks();
  const existingIndex = checks.findIndex((check) => check.reportCardId === data.reportCardId);

  const clarityCheck: ClarityCheck = {
    ...data,
    id: existingIndex >= 0 ? checks[existingIndex].id : `clarity-${data.reportCardId}`,
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
  const user = await requireRole(['teacher']);

  const { data: row, error } = await supabase
    .from('teacher_notes')
    .insert({
      student_id: data.studentId,
      teacher_id: user.id,
      note: data.note,
    })
    .select()
    .single();

  if (error || !row) throw createApiError(500, error?.message || 'Could not add note');

  return {
    id: row.id,
    studentId: row.student_id,
    teacherId: row.teacher_id,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.created_at,
  };
}

export async function getTeacherNotes(studentId: string): Promise<TeacherNote[]> {
  await requireRole(['teacher']);

  const { data, error } = await supabase
    .from('teacher_notes')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) throw createApiError(500, error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    studentId: row.student_id,
    teacherId: row.teacher_id,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.created_at,
  }));
}

export async function updateTeacherNote(id: string, note: string): Promise<TeacherNote> {
  const user = await requireRole(['teacher']);

  const { data: row, error } = await supabase
    .from('teacher_notes')
    .update({ note })
    .eq('id', id)
    .eq('teacher_id', user.id)
    .select()
    .single();

  if (error || !row) throw createApiError(404, error?.message || 'Note not found');

  return {
    id: row.id,
    studentId: row.student_id,
    teacherId: row.teacher_id,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.created_at,
  };
}

// ===== Plan Progress =====
export async function getPlanProgress(clarityCheckId: string): Promise<PlanProgress | null> {
  await requireRole(['parent']);

  const { data, error } = await supabase
    .from('plan_progress')
    .select('*')
    .eq('clarity_check_id', clarityCheckId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    clarityCheckId: data.clarity_check_id,
    parentId: data.parent_id,
    actionItems: data.action_items as PlanProgress['actionItems'],
    completionRate: data.completion_rate,
    updatedAt: data.updated_at,
  };
}

export async function createPlanProgress(
  clarityCheckId: string,
  actionItems: PlanProgress['actionItems']
): Promise<PlanProgress> {
  const user = await requireRole(['parent']);

  const { data, error } = await supabase
    .from('plan_progress')
    .insert({
      clarity_check_id: clarityCheckId,
      parent_id: user.id,
      action_items: JSON.parse(JSON.stringify(actionItems)),
      completion_rate: 0,
    })
    .select()
    .single();

  if (error || !data) throw createApiError(500, error?.message || 'Could not create plan progress');

  return {
    id: data.id,
    clarityCheckId: data.clarity_check_id,
    parentId: data.parent_id,
    actionItems: data.action_items as PlanProgress['actionItems'],
    completionRate: data.completion_rate,
    updatedAt: data.updated_at,
  };
}

export async function updateActionItem(
  progressId: string,
  itemIndex: number,
  completed: boolean
): Promise<PlanProgress> {
  await requireRole(['parent']);

  // Read current progress
  const { data: current, error: readError } = await supabase
    .from('plan_progress')
    .select('*')
    .eq('id', progressId)
    .single();

  if (readError || !current) throw createApiError(404, 'Progress not found');

  const actionItems = [...(current.action_items as PlanProgress['actionItems'])];
  if (itemIndex >= actionItems.length) throw createApiError(400, 'Invalid action item index');

  actionItems[itemIndex].completed = completed;

  const total = actionItems.length;
  const done = actionItems.filter((a) => a.completed).length;
  const completionRate = Math.round((done / total) * 100);

  const { data, error } = await supabase
    .from('plan_progress')
    .update({
      action_items: JSON.parse(JSON.stringify(actionItems)),
      completion_rate: completionRate,
    })
    .eq('id', progressId)
    .select()
    .single();

  if (error || !data) throw createApiError(500, error?.message || 'Could not update progress');

  return {
    id: data.id,
    clarityCheckId: data.clarity_check_id,
    parentId: data.parent_id,
    actionItems: data.action_items as PlanProgress['actionItems'],
    completionRate: data.completion_rate,
    updatedAt: data.updated_at,
  };
}

// ===== Dashboard =====
export async function getAdminDashboard(): Promise<DashboardSummary> {
  const user = await requireRole(['admin']);

  if (!user.schoolId) {
    return {
      totalStudents: 0, totalTeachers: 0, totalClasses: 0,
      reportCardsThisTerm: 0, flaggedStudents: 0,
      flagDistribution: { green: 0, yellow: 0, red: 0 },
    };
  }

  const schoolId = user.schoolId;

  // Fetch students and classes for this school
  const [students, classes, teachersResult] = await Promise.all([
    getStudents({ schoolId }),
    getClasses({ schoolId }),
    supabase.from('profiles').select('id').eq('school_id', schoolId).eq('role', 'teacher'),
  ]);

  const totalStudents = students.length;
  const totalClasses = classes.length;
  const totalTeachers = teachersResult.data?.length ?? 0;

  // Get report cards for all students in this school
  const studentIds = students.map((s) => s.id);
  let reportCardsThisTerm = 0;
  let flaggedStudents = 0;
  let green = 0;
  let yellow = 0;
  let red = 0;

  if (studentIds.length > 0) {
    const { data: cards } = await supabase
      .from('report_cards')
      .select('id, student_id, ai_response, status')
      .in('student_id', studentIds)
      .order('created_at', { ascending: false });

    if (cards) {
      // Group by student to get latest
      const latestByStudent = new Map<string, typeof cards[0]>();
      for (const card of cards) {
        if (!latestByStudent.has(card.student_id)) {
          latestByStudent.set(card.student_id, card);
        }
      }

      reportCardsThisTerm = cards.length;

      for (const [, card] of latestByStudent) {
        if (card.ai_response) {
          const analysis = card.ai_response as AIReportAnalysis;
          const subjects = analysis.subjects ?? [];
          const hasRed = subjects.some((s) => s.flag === 'red');
          const hasYellow = subjects.some((s) => s.flag === 'yellow');

          if (hasRed) { red++; flaggedStudents++; }
          else if (hasYellow) { yellow++; flaggedStudents++; }
          else { green++; }
        }
      }
    }
  }

  return {
    totalStudents,
    totalTeachers,
    totalClasses,
    reportCardsThisTerm,
    flaggedStudents,
    flagDistribution: { green, yellow, red },
  };
}

export async function getTeacherDashboard(): Promise<{
  classes: Class[];
  totalStudents: number;
  reportCardCount: number;
  flaggedCount: number;
}> {
  const user = await requireRole(['teacher']);

  const myClasses = await getClasses();
  const classIds = myClasses.map((c) => c.id);
  const students = await getStudents();
  const studentIds = students.map((s) => s.id);

  let reportCardCount = 0;
  let flaggedCount = 0;

  if (studentIds.length > 0) {
    const { data: cards } = await supabase
      .from('report_cards')
      .select('id, student_id, ai_response')
      .in('student_id', studentIds)
      .order('created_at', { ascending: false });

    if (cards) {
      // Group by student for latest
      const latestByStudent = new Map<string, typeof cards[0]>();
      for (const card of cards) {
        if (!latestByStudent.has(card.student_id)) {
          latestByStudent.set(card.student_id, card);
        }
      }

      reportCardCount = cards.length;

      for (const [, card] of latestByStudent) {
        if (card.ai_response) {
          const analysis = card.ai_response as AIReportAnalysis;
          const subjects = analysis.subjects ?? [];
          if (subjects.some((s) => s.flag === 'red' || s.flag === 'yellow')) {
            flaggedCount++;
          }
        }
      }
    }
  }

  return {
    classes: myClasses,
    totalStudents: students.length,
    reportCardCount,
    flaggedCount,
  };
}

// Helper to get user by ID from Supabase profiles
export async function getUserById(id: string): Promise<{
  id: string;
  email: string;
  fullName: string;
  role: string;
} | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    email: '',
    fullName: data.full_name,
    role: data.role,
  };
}
