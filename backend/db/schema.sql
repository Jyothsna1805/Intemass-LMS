-- Postgres Schema
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'teacher', 'master')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100),
    institution VARCHAR(100),
    PRIMARY KEY (user_id)
);

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES users(id),
    question_text TEXT NOT NULL,
    standard_answer TEXT,        
    type VARCHAR(20) CHECK (type IN ('essay', 'short_answer', 'mcq', 'fill_blank')),
    subject VARCHAR(100) DEFAULT 'Uncategorized',
    sub_category VARCHAR(100) DEFAULT 'General',
    max_marks INTEGER DEFAULT 5,
    mcq_options_json TEXT,
    blank_answers_json TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id),
    title VARCHAR(200),
    instructions TEXT,
    subject VARCHAR(100) DEFAULT 'General',
    sub_category VARCHAR(100) DEFAULT 'General',
    due_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_questions (
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    max_points INTEGER DEFAULT 100,
    PRIMARY KEY (assignment_id, question_id)
);

CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id),
    assignment_id UUID REFERENCES assignments(id),
    question_id UUID REFERENCES questions(id),
    answer_text TEXT,
    file_url VARCHAR(500),
    extracted_diagram_url VARCHAR(500),
    ocr_text TEXT,
    topology_json TEXT,
    marks_awarded INTEGER,
    feedback TEXT,
    reassessment_status VARCHAR(20) DEFAULT 'none',
    reassessment_request TEXT,
    reassessment_teacher_comment TEXT,
    marked_by UUID REFERENCES users(id),   
    submitted_at TIMESTAMP DEFAULT NOW(),
    marked_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saved_essays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id),
    submission_id UUID REFERENCES submissions(id),
    saved_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batch_upload_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id),
    assignment_id UUID REFERENCES assignments(id),
    total_files INTEGER DEFAULT 0,
    processed_files INTEGER DEFAULT 0,
    failed_files_json TEXT,
    status VARCHAR(20) DEFAULT 'queued',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('reassessment', 'batch_complete', 'feedback_ready', 'system_error', 'info')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teacher_feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id),
    category VARCHAR(100) DEFAULT 'General',
    rating INTEGER DEFAULT 5,
    comments TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mass_feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id),
    student_id UUID REFERENCES users(id),
    score_band VARCHAR(50) NOT NULL,
    feedback_text TEXT NOT NULL,
    is_viewed INTEGER DEFAULT 0,
    is_downloaded INTEGER DEFAULT 0,
    viewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

