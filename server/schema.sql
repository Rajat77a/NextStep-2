PRAGMA foreign_keys = ON;

CREATE TABLE schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan_tier TEXT NOT NULL CHECK (plan_tier IN ('school_paid', 'coaching_center')),
  subscription_status TEXT NOT NULL DEFAULT 'active',
  renewal_date DATE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE classes (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  section TEXT,
  academic_year TEXT NOT NULL
);

CREATE TABLE teachers (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'invited',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teacher_class_assignments (
  teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  PRIMARY KEY (teacher_id, class_id)
);

CREATE TABLE parents (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('school_included', 'direct_free', 'direct_premium')),
  school_id TEXT REFERENCES schools(id) ON DELETE SET NULL,
  consent_status TEXT NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
  id TEXT PRIMARY KEY,
  school_id TEXT REFERENCES schools(id) ON DELETE SET NULL,
  class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  parent_id TEXT REFERENCES parents(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  board TEXT NOT NULL,
  external_student_ref TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE report_cards (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  uploaded_by_role TEXT NOT NULL CHECK (uploaded_by_role IN ('admin', 'teacher', 'parent')),
  uploaded_by_user_id TEXT NOT NULL,
  term_label TEXT NOT NULL,
  source_file_name TEXT,
  raw_text TEXT NOT NULL,
  parsed_json TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE flags (
  id TEXT PRIMARY KEY,
  report_card_id TEXT NOT NULL REFERENCES report_cards(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('green', 'yellow', 'red')),
  status_label TEXT NOT NULL,
  rationale TEXT NOT NULL,
  safety_caveat TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parent_guidance (
  id TEXT PRIMARY KEY,
  report_card_id TEXT NOT NULL REFERENCES report_cards(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id TEXT NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  teacher_questions_json TEXT NOT NULL,
  conversation_script_json TEXT NOT NULL,
  home_plan_json TEXT NOT NULL,
  safety_note TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teacher_notes (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  visible_to_parent BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE data_consents (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  granted_by_parent_id TEXT REFERENCES parents(id) ON DELETE SET NULL,
  granted_by_school_id TEXT REFERENCES schools(id) ON DELETE SET NULL,
  scope TEXT NOT NULL,
  retention_until DATE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_school_class ON students(school_id, class_id);
CREATE INDEX idx_report_cards_student ON report_cards(student_id, created_at);
CREATE INDEX idx_flags_student_subject ON flags(student_id, subject, status);
CREATE INDEX idx_parent_guidance_parent ON parent_guidance(parent_id, student_id);
