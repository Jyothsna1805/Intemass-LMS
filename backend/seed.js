const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const dbFile = process.env.DB_FILE || './lms.db';
const db = new sqlite3.Database(dbFile);

const generateId = () => crypto.randomUUID();

const seedDatabase = async () => {
    console.log('Seeding SQLite database...');

    // Hash password for all test users: 'password123'
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const masterId = generateId();
    const teacherId = generateId();
    const studentId = generateId();

    const insertUsersAndProfiles = () => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                // Insert Users
                const userStmt = db.prepare("INSERT INTO users(id, email, password_hash, role) VALUES(?, ?, ?, ?)");
                userStmt.run(masterId, 'master@intemass.com', hashedPassword, 'master');
                userStmt.run(teacherId, 'teacher@intemass.com', hashedPassword, 'teacher');
                userStmt.run(studentId, 'student@intemass.com', hashedPassword, 'student');
                userStmt.finalize();

                // Insert Profiles
                const profileStmt = db.prepare("INSERT INTO profiles(user_id, full_name) VALUES(?, ?)");
                profileStmt.run(masterId, 'Master Admin');
                profileStmt.run(teacherId, 'Mr. Smith');
                profileStmt.run(studentId, 'Jane Doe');
                profileStmt.finalize((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    };

    const insertQuestions = () => {
        return new Promise((resolve, reject) => {
            const q1Id = generateId();
            const q2Id = generateId();

            db.serialize(() => {
                const qStmt = db.prepare("INSERT INTO questions(id, created_by, question_text, standard_answer, type) VALUES(?, ?, ?, ?, ?)");
                qStmt.run(q1Id, masterId, 'Describe the process of photosynthesis.', 'Photosynthesis is the process by which green plants transform light energy into chemical energy.', 'essay');
                qStmt.run(q2Id, masterId, 'What is the capital of France?', 'Paris', 'short_answer');
                qStmt.finalize((err) => {
                    if (err) reject(err);
                    else resolve({ q1Id, q2Id });
                });
            });
        });
    };

    const insertAssignment = (q1Id, q2Id) => {
        return new Promise((resolve, reject) => {
            const assignmentId = generateId();
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            db.serialize(() => {
                const aStmt = db.prepare("INSERT INTO assignments(id, teacher_id, title, instructions, due_date) VALUES(?, ?, ?, ?, ?)");
                aStmt.run(assignmentId, teacherId, 'Biology & Geography Basics', 'Please answer the following questions clearly.', tomorrow.toISOString());
                aStmt.finalize();

                const aqStmt = db.prepare("INSERT INTO assignment_questions(assignment_id, question_id, max_points) VALUES(?, ?, ?)");
                aqStmt.run(assignmentId, q1Id, 10);
                aqStmt.run(assignmentId, q2Id, 5);
                aqStmt.finalize((err) => {
                    if (err) reject(err);
                    else resolve(assignmentId);
                });
            });
        });
    };

    try {
        await insertUsersAndProfiles();
        console.log('Test users created (Passwords: "password123"):');
        console.log('- master@intemass.com');
        console.log('- teacher@intemass.com');
        console.log('- student@intemass.com');

        const { q1Id, q2Id } = await insertQuestions();
        console.log('Test questions added to the bank.');

        await insertAssignment(q1Id, q2Id);
        console.log('Sample assignment created and linked to questions.');

        console.log('\nDatabase seeding completed successfully!');
    } catch (err) {
        console.error('Error during seeding:', err);
    } finally {
        db.close();
    }
};

// Check if schema exists before seeding
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
    if (err) {
        console.error(err);
    } else if (!row) {
        console.log("Database schema not found. Please start the backend server once to initialize tables before seeding.");
        db.close();
    } else {
        seedDatabase();
    }
});
