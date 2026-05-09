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
    type TEXT CHECK (type IN ('essay', 'short_answer')),
    subject TEXT DEFAULT 'Uncategorized',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY,
    teacher_id TEXT REFERENCES users(id),
    title TEXT,
    instructions TEXT,
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
    marks_awarded INTEGER,
    feedback TEXT,
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
