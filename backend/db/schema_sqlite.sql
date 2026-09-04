-- SQLite Schema
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('student', 'teacher', 'master')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT,
    institution TEXT,
    PRIMARY KEY (user_id)
);

CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    created_by TEXT REFERENCES users(id),
    question_text TEXT NOT NULL,
    standard_answer TEXT,        
    type TEXT CHECK (type IN ('essay', 'short_answer', 'mcq', 'fill_blank')),
    subject TEXT DEFAULT 'Uncategorized',
    sub_category TEXT DEFAULT 'General',
    max_marks INTEGER DEFAULT 5,
    mcq_options_json TEXT,
    blank_answers_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY,
    teacher_id TEXT REFERENCES users(id),
    title TEXT,
    instructions TEXT,
    subject TEXT DEFAULT 'General',
    sub_category TEXT DEFAULT 'General',
    due_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignment_questions (
    assignment_id TEXT REFERENCES assignments(id) ON DELETE CASCADE,
    question_id TEXT REFERENCES questions(id) ON DELETE CASCADE,
    max_points INTEGER DEFAULT 100,
    PRIMARY KEY (assignment_id, question_id)
);

CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES users(id),
    assignment_id TEXT REFERENCES assignments(id),
    question_id TEXT REFERENCES questions(id),
    answer_text TEXT,
    file_url TEXT,
    extracted_diagram_url TEXT,
    ocr_text TEXT,
    topology_json TEXT,
    marks_awarded INTEGER,
    feedback TEXT,
    reassessment_status TEXT DEFAULT 'none',
    reassessment_request TEXT,
    reassessment_teacher_comment TEXT,
    marked_by TEXT REFERENCES users(id),   
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    marked_at DATETIME
);

CREATE TABLE IF NOT EXISTS saved_essays (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES users(id),
    submission_id TEXT REFERENCES submissions(id),
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS batch_upload_jobs (
    id TEXT PRIMARY KEY,
    teacher_id TEXT REFERENCES users(id),
    assignment_id TEXT REFERENCES assignments(id),
    total_files INTEGER DEFAULT 0,
    processed_files INTEGER DEFAULT 0,
    failed_files_json TEXT,
    status TEXT DEFAULT 'queued',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('reassessment', 'batch_complete', 'feedback_ready', 'system_error', 'info')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teacher_feedbacks (
    id TEXT PRIMARY KEY,
    teacher_id TEXT REFERENCES users(id),
    category TEXT DEFAULT 'General',
    rating INTEGER DEFAULT 5,
    comments TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mass_feedbacks (
    id TEXT PRIMARY KEY,
    assignment_id TEXT REFERENCES assignments(id),
    student_id TEXT REFERENCES users(id),
    score_band TEXT NOT NULL,
    feedback_text TEXT NOT NULL,
    is_viewed INTEGER DEFAULT 0,
    is_downloaded INTEGER DEFAULT 0,
    viewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

