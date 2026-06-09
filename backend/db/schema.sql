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
    type VARCHAR(20) CHECK (type IN ('essay', 'short_answer')),
    subject VARCHAR(100) DEFAULT 'Uncategorized',
    max_marks INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id),
    title VARCHAR(200),
    instructions TEXT,
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
