const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const dbType = process.env.DB_TYPE || 'sqlite';
let dbInstance = null;

const initDb = async () => {
    if (dbType === 'postgres') {
        dbInstance = new Pool(
            process.env.DATABASE_URL 
                ? { connectionString: process.env.DATABASE_URL }
                : {
                    user: process.env.DB_USER,
                    host: process.env.DB_HOST,
                    database: process.env.DB_NAME,
                    password: process.env.DB_PASSWORD,
                    port: process.env.DB_PORT,
                }
        );

        // Create tables
        const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql')).toString();
        try {
            await dbInstance.query(schemaSql);
            console.log("Postgres database initialized");
            
            // Fix: Add missing columns to questions table if they don't exist
            try {
                await dbInstance.query('ALTER TABLE questions ADD COLUMN IF NOT EXISTS subject VARCHAR(100) DEFAULT \'Uncategorized\'');
                await dbInstance.query('ALTER TABLE questions ADD COLUMN IF NOT EXISTS max_marks INTEGER DEFAULT 5');
                
                // Add missing columns to submissions table
                await dbInstance.query('ALTER TABLE submissions ADD COLUMN IF NOT EXISTS extracted_diagram_url VARCHAR(500)');
                await dbInstance.query('ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ocr_text TEXT');
                await dbInstance.query('ALTER TABLE submissions ADD COLUMN IF NOT EXISTS topology_json TEXT');
            } catch (err) {
                console.error("Error adding columns:", err);
            }
            
            // Force reset to restore original data (CASCADE handles foreign keys)
            await dbInstance.query('TRUNCATE TABLE users CASCADE');
            
            // Seed default users and old assignments if they don't exist
            const res = await dbInstance.query('SELECT COUNT(*) FROM users');
            if (parseInt(res.rows[0].count) === 0) {
                const bcrypt = require('bcryptjs');
                const defaultPassword = await bcrypt.hash('password123', 10);
                
                // 1. Insert Users
                await dbInstance.query(`
                    INSERT INTO users (id, email, password_hash, role) VALUES 
                    ('f24a9b1c-b241-495c-8d7a-215ef9d1b8ef', 'teacher@intemass.com', $1, 'teacher'),
                    ('df5ee1f9-d43b-45b5-985d-ef6c4d5a02f4', 'student@intemass.com', $1, 'student'),
                    ('0ee276a7-6a4f-42a8-bb41-fd94bb2b8dab', 'master@intemass.com', $1, 'master')
                `, [defaultPassword]);
                
                // 2. Insert Profiles
                await dbInstance.query(`
                    INSERT INTO profiles (user_id, full_name, institution) VALUES 
                    ('f24a9b1c-b241-495c-8d7a-215ef9d1b8ef', 'Teacher User', 'Intemass'),
                    ('df5ee1f9-d43b-45b5-985d-ef6c4d5a02f4', 'Student User', 'Intemass'),
                    ('0ee276a7-6a4f-42a8-bb41-fd94bb2b8dab', 'Master Admin', 'Intemass')
                `);
                
                // 3. Insert Questions
                await dbInstance.query(`
                    INSERT INTO questions (id, created_by, question_text, standard_answer, type, created_at) VALUES 
                    ('5c4a6d4a-9d6f-4edc-8a3c-a3519e065243', '0ee276a7-6a4f-42a8-bb41-fd94bb2b8dab', 'Describe the process of photosynthesis.', 'Photosynthesis is the process by which green plants transform light energy into chemical energy.', 'essay', '2026-03-28 14:38:36'),
                    ('21280b98-ecd4-49a1-a50a-eaf56423afc6', '0ee276a7-6a4f-42a8-bb41-fd94bb2b8dab', 'What is the capital of France?', 'Paris', 'short_answer', '2026-03-28 14:38:36'),
                    ('4fe06705-7a43-4f8d-9e4a-019a0b7347a4', '0ee276a7-6a4f-42a8-bb41-fd94bb2b8dab', 'What is capital of India?', 'New Delhi', 'short_answer', '2026-03-28 14:46:22'),
                    ('13166cca-5091-43e5-9d59-b9118c42b89e', 'f24a9b1c-b241-495c-8d7a-215ef9d1b8ef', 'What is Economy?', 'a system of producing, distributing, and consuming goods and services, which determines how limited resources are allocated to satisfy human needs.', 'short_answer', '2026-04-25 16:19:10')
                `);

                // 4. Insert Assignments
                await dbInstance.query(`
                    INSERT INTO assignments (id, teacher_id, title, instructions, due_date, created_at) VALUES 
                    ('b302cd22-bac7-4ab5-82fc-a01175b806e3', 'f24a9b1c-b241-495c-8d7a-215ef9d1b8ef', 'Biology & Geography Basics', 'Please answer the following questions clearly.', '2026-03-29', '2026-03-28 14:38:36'),
                    ('7a155b0b-f87b-4551-af3a-e0f8f0c392d1', 'f24a9b1c-b241-495c-8d7a-215ef9d1b8ef', 'Science', '', '2026-03-30', '2026-03-28 15:44:49')
                `);

                // 5. Insert Assignment Questions
                await dbInstance.query(`
                    INSERT INTO assignment_questions (assignment_id, question_id, max_points) VALUES 
                    ('b302cd22-bac7-4ab5-82fc-a01175b806e3', '5c4a6d4a-9d6f-4edc-8a3c-a3519e065243', 10),
                    ('b302cd22-bac7-4ab5-82fc-a01175b806e3', '21280b98-ecd4-49a1-a50a-eaf56423afc6', 5),
                    ('7a155b0b-f87b-4551-af3a-e0f8f0c392d1', '5c4a6d4a-9d6f-4edc-8a3c-a3519e065243', 100)
                `);
                
                console.log("Fully restored all old users and assignments!");
            }
        } catch (e) {
            console.error("Error initializing postgres DB:", e);
        }

    } else {
        // SQLite
        const dbFile = process.env.DB_FILE || './lms.db';
        dbInstance = new sqlite3.Database(dbFile, (err) => {
            if (err) {
                console.error('Error opening database', err.message);
            } else {
                console.log('Connected to the SQLite database.');
                const schemaSql = fs.readFileSync(path.join(__dirname, 'schema_sqlite.sql')).toString();
                dbInstance.exec(schemaSql, (err) => {
                    if (err) {
                        console.error("Error initializing sqlite DB:", err);
                    } else {
                        console.log("SQLite DB initialized");
                    }
                });
            }
        });
    }
};

const query = async (text, params) => {
    if (dbType === 'postgres') {
        const res = await dbInstance.query(text, params);
        return res.rows;
    } else {
        return new Promise((resolve, reject) => {
            dbInstance.all(text, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
};

const execute = async (text, params) => {
    if (dbType === 'postgres') {
        const res = await dbInstance.query(text, params);
        return res;
    } else {
        return new Promise((resolve, reject) => {
            dbInstance.run(text, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    }
}

module.exports = {
    initDb,
    query,
    execute
};
