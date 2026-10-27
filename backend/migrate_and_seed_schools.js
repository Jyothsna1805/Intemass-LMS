const { initDb, query, execute } = require('./db/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const generateId = () => crypto.randomUUID();

async function runMigration() {
    console.log("==================================================");
    console.log("MIGRATING DATABASE FOR MULTI-TENANT SCHOOL REPORTING");
    console.log("==================================================");

    await initDb();
    // Allow DB connection to settle
    await new Promise(r => setTimeout(r, 600));

    // 1. Create tables if not existing
    console.log("[1/5] Ensuring schools, classes, and school_reports tables exist...");
    
    await execute(`
        CREATE TABLE IF NOT EXISTS schools (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            code TEXT UNIQUE NOT NULL,
            address TEXT,
            contact_email TEXT,
            logo_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await execute(`
        CREATE TABLE IF NOT EXISTS classes (
            id TEXT PRIMARY KEY,
            school_id TEXT REFERENCES schools(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            academic_year TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await execute(`
        CREATE TABLE IF NOT EXISTS school_reports (
            id TEXT PRIMARY KEY,
            school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
            report_type TEXT NOT NULL CHECK (report_type IN ('master_school', 'individual_student', 'subject_master', 'class_master')),
            student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
            assignment_id TEXT REFERENCES assignments(id) ON DELETE CASCADE,
            subject TEXT DEFAULT 'All',
            title TEXT NOT NULL,
            academic_term TEXT DEFAULT '2026-Term1',
            summary_data_json TEXT NOT NULL,
            generated_by TEXT REFERENCES users(id),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 2. Add columns safely
    console.log("[2/5] Adding school_id columns to existing tables...");
    const alterCommands = [
        "ALTER TABLE users ADD COLUMN school_id TEXT REFERENCES schools(id)",
        "ALTER TABLE profiles ADD COLUMN school_id TEXT REFERENCES schools(id)",
        "ALTER TABLE profiles ADD COLUMN class_name TEXT",
        "ALTER TABLE profiles ADD COLUMN roll_number TEXT",
        "ALTER TABLE assignments ADD COLUMN school_id TEXT REFERENCES schools(id)",
        "ALTER TABLE submissions ADD COLUMN school_id TEXT REFERENCES schools(id)"
    ];

    for (const cmd of alterCommands) {
        try {
            await execute(cmd);
            console.log(`  + Applied: ${cmd}`);
        } catch (err) {
            // SQLite errors when column already exists; safe to ignore
            console.log(`  - Note: Column likely already present (${err.message})`);
        }
    }

    // 3. Seed Distinct Schools
    console.log("[3/5] Seeding Distinct Schools...");
    const school1 = {
        id: 'sch-mf-001',
        name: 'MegaForte Academy Singapore',
        code: 'MF-SG',
        address: '10 Collyer Quay, Ocean Financial Centre, Singapore 049315',
        contact_email: 'admin@megaforte.sg'
    };

    const school2 = {
        id: 'sch-stj-002',
        name: 'St. Jude STEM Institute',
        code: 'STJ-01',
        address: '45 Science Park Rd, The Capricorn, Singapore 117528',
        contact_email: 'office@stjude-stem.edu'
    };

    const existingS1 = await query("SELECT id FROM schools WHERE id = ?", [school1.id]);
    if (existingS1.length === 0) {
        await execute(
            "INSERT INTO schools (id, name, code, address, contact_email) VALUES (?, ?, ?, ?, ?)",
            [school1.id, school1.name, school1.code, school1.address, school1.contact_email]
        );
        console.log(`  + Inserted School 1: ${school1.name} [${school1.code}]`);
    }

    const existingS2 = await query("SELECT id FROM schools WHERE id = ?", [school2.id]);
    if (existingS2.length === 0) {
        await execute(
            "INSERT INTO schools (id, name, code, address, contact_email) VALUES (?, ?, ?, ?, ?)",
            [school2.id, school2.name, school2.code, school2.address, school2.contact_email]
        );
        console.log(`  + Inserted School 2: ${school2.name} [${school2.code}]`);
    }

    // 4. Associate existing users and assignments with School 1 (MF-SG)
    console.log("[4/5] Associating existing records with School 1 (MegaForte Academy)...");
    await execute("UPDATE users SET school_id = ? WHERE school_id IS NULL AND email NOT LIKE '%stj%'", [school1.id]);
    await execute("UPDATE profiles SET school_id = ? WHERE school_id IS NULL AND user_id IN (SELECT id FROM users WHERE school_id = ?)", [school1.id, school1.id]);
    await execute("UPDATE assignments SET school_id = ? WHERE school_id IS NULL", [school1.id]);
    await execute("UPDATE submissions SET school_id = ? WHERE school_id IS NULL", [school1.id]);

    // Update roll numbers on profiles for School 1 students
    await execute("UPDATE profiles SET roll_number = '001', class_name = 'Engineering Year 1' WHERE user_id = '11111111-1111-4111-8111-111111111111'");
    await execute("UPDATE profiles SET roll_number = '002', class_name = 'Engineering Year 1' WHERE user_id = '22222222-2222-4222-8222-222222222222'");
    await execute("UPDATE profiles SET roll_number = '003', class_name = 'Engineering Year 1' WHERE user_id = '33333333-3333-4333-8333-333333333333'");
    await execute("UPDATE profiles SET roll_number = '004', class_name = 'Engineering Year 1' WHERE user_id = '44444444-4444-4444-8444-444444444444'");
    await execute("UPDATE profiles SET roll_number = '005', class_name = 'Engineering Year 1' WHERE user_id = 'df5ee1f9-d43b-45b5-985d-ef6c4d5a02f4'");

    // 5. Seed School 2 (St. Jude STEM Institute) Users, Assignment & Submissions
    console.log("[5/5] Seeding School 2 (St. Jude) specific users and assignments...");
    const defaultPassword = await bcrypt.hash('password123', 10);
    const teacherPassword = await bcrypt.hash('teacher123', 10);

    // School 2 Teacher
    const stjTeacherId = 'stj-teacher-0001';
    const existingStjTeacher = await query("SELECT id FROM users WHERE email = 'teacher.stj@intemass.com'");
    if (existingStjTeacher.length === 0) {
        await execute(
            "INSERT INTO users (id, email, password_hash, role, school_id) VALUES (?, ?, ?, ?, ?)",
            [stjTeacherId, 'teacher.stj@intemass.com', teacherPassword, 'teacher', school2.id]
        );
        await execute(
            "INSERT INTO profiles (user_id, full_name, institution, school_id, class_name) VALUES (?, ?, ?, ?, ?)",
            [stjTeacherId, 'Dr. Marcus Vance (St. Jude Faculty Lead)', 'St. Jude STEM Institute', school2.id, 'Faculty']
        );
        console.log("  + Created St. Jude Teacher: teacher.stj@intemass.com");
    }

    // School 2 Students
    const stjStudents = [
        { id: 'stj-stu-0001', email: 'stj.student1@intemass.com', name: 'Alice Walker', roll: 'STJ-001', class: 'Physics Cohort A' },
        { id: 'stj-stu-0002', email: 'stj.student2@intemass.com', name: 'Bob Miller', roll: 'STJ-002', class: 'Physics Cohort A' },
        { id: 'stj-stu-0003', email: 'stj.student3@intemass.com', name: 'Charlie Evans', roll: 'STJ-003', class: 'Physics Cohort A' }
    ];

    for (const stu of stjStudents) {
        const uCheck = await query("SELECT id FROM users WHERE email = ?", [stu.email]);
        if (uCheck.length === 0) {
            await execute(
                "INSERT INTO users (id, email, password_hash, role, school_id) VALUES (?, ?, ?, ?, ?)",
                [stu.id, stu.email, defaultPassword, 'student', school2.id]
            );
            await execute(
                "INSERT INTO profiles (user_id, full_name, institution, school_id, class_name, roll_number) VALUES (?, ?, ?, ?, ?, ?)",
                [stu.id, stu.name, 'St. Jude STEM Institute', school2.id, stu.class, stu.roll]
            );
            console.log(`  + Created St. Jude Student: ${stu.email} (${stu.name})`);
        }
    }

    // School 2 Assignment
    const stjAssignmentId = 'stj-assign-0001';
    const existingStjAssign = await query("SELECT id FROM assignments WHERE id = ?", [stjAssignmentId]);
    if (existingStjAssign.length === 0) {
        await execute(
            "INSERT INTO assignments (id, teacher_id, school_id, title, instructions, subject, sub_category, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                stjAssignmentId,
                stjTeacherId,
                school2.id,
                'St. Jude - Circuit Theory & Advanced Mechanics (ENGR-201)',
                'Complete all technical problems accurately. Show step-by-step derivations.',
                'Physics',
                'Mechanics',
                '2026-11-15'
            ]
        );
        console.log("  + Created St. Jude Assignment: Circuit Theory & Advanced Mechanics");

        // Link with questions
        const questions = await query("SELECT id FROM questions LIMIT 5");
        for (const q of questions) {
            await execute(
                "INSERT OR IGNORE INTO assignment_questions (assignment_id, question_id, max_points) VALUES (?, ?, ?)",
                [stjAssignmentId, q.id, 20]
            );
        }

        // Seed submissions for Alice (92 pts), Bob (76 pts), Charlie (48 pts)
        if (questions.length > 0) {
            const subScores = [
                { stuId: 'stj-stu-0001', score: 18, feedback: 'Excellent analytical precision and derivation.' },
                { stuId: 'stj-stu-0002', score: 15, feedback: 'Good conceptual grasp; minor algebraic simplification mistake.' },
                { stuId: 'stj-stu-0003', score: 10, feedback: 'Missing boundary condition in final step.' }
            ];

            for (const item of subScores) {
                const subId = generateId();
                await execute(
                    `INSERT INTO submissions (id, student_id, assignment_id, question_id, school_id, answer_text, marks_awarded, feedback, marked_by, submitted_at, marked_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                    [
                        subId,
                        item.stuId,
                        stjAssignmentId,
                        questions[0].id,
                        school2.id,
                        'Step-by-step derivation for technical mechanical problem.',
                        item.score,
                        item.feedback,
                        stjTeacherId
                    ]
                );
            }
            console.log("  + Seeded School 2 Submissions for Alice, Bob, and Charlie.");
        }
    }

    // Ensure sample submissions for School 1 students if none exist
    const s1Subs = await query("SELECT COUNT(*) as count FROM submissions WHERE school_id = ?", [school1.id]);
    if (s1Subs[0].count === 0) {
        console.log("  + Seeding sample submissions for School 1 students (Students 1 to 4)...");
        const s1Assigns = await query("SELECT id FROM assignments WHERE school_id = ? LIMIT 1", [school1.id]);
        const s1Questions = await query("SELECT id FROM questions LIMIT 4");
        if (s1Assigns.length > 0 && s1Questions.length > 0) {
            const aId = s1Assigns[0].id;
            const stuProfiles = [
                { id: '11111111-1111-4111-8111-111111111111', score: 88, feedback: 'Outstanding answer and comprehensive rubric coverage.' },
                { id: '22222222-2222-4222-8222-222222222222', score: 78, feedback: 'Solid work. Thorough explanation of concepts.' },
                { id: '33333333-3333-4333-8333-333333333333', score: 65, feedback: 'Good effort. Requires more precision in formula explanations.' },
                { id: '44444444-4444-4444-8444-444444444444', score: 54, feedback: 'Basic requirements met. Needs revision of key definitions.' }
            ];

            for (const st of stuProfiles) {
                const sId = generateId();
                await execute(
                    `INSERT INTO submissions (id, student_id, assignment_id, question_id, school_id, answer_text, marks_awarded, feedback, submitted_at, marked_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                    [
                        sId,
                        st.id,
                        aId,
                        s1Questions[0].id,
                        school1.id,
                        'Comprehensive technical response submitted by student.',
                        st.score,
                        st.feedback
                    ]
                );
            }
            console.log("  + Seeded School 1 submissions successfully.");
        }
    }

    console.log("==================================================");
    console.log("MIGRATION & SCHOOL SEEDING COMPLETED SUCCESSFULLY!");
    console.log("==================================================");
    process.exit(0);
}

runMigration().catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
});
