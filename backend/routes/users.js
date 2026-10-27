const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query, execute } = require('../db/database');

const generateId = () => crypto.randomUUID();

// Get all users (Master only)
router.get('/', authenticate, authorize('master'), async (req, res) => {
    try {
        let sql = `
            SELECT u.id, u.email, u.role, u.created_at, p.full_name, p.institution
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            ORDER BY u.created_at DESC
        `;
        const users = await query(sql, []);
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: 'Internal server error fetching users' });
    }
});

// Generate multiple student logins (Teacher & Master)
router.post('/generate-students', authenticate, authorize(['master', 'teacher']), async (req, res) => {
    const { count = 5, startNumber = 1, password = 'password123', prefix = '' } = req.body;
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const createdStudents = [];

        const schoolId = req.user.school_id || 'sch-mf-001';
        const institution = req.user.school_name || 'MegaForte Academy Singapore';

        for (let i = 0; i < count; i++) {
            const num = parseInt(startNumber) + i;
            const rollNumber = String(num).padStart(3, '0');
            const email = prefix ? `${prefix}${num}@intemass.com` : `${num}@intemass.com`;
            const fullName = `Student ${num} (Roll: ${rollNumber})`;

            // Check if user already exists
            const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
            if (existing.length === 0) {
                let userId;
                if (process.env.DB_TYPE === 'postgres') {
                    const result = await execute(
                        "INSERT INTO users(email, password_hash, role, school_id) VALUES($1, $2, $3, $4) RETURNING id",
                        [email, passwordHash, 'student', schoolId]
                    );
                    userId = result.rows[0].id;
                    await execute(
                        "INSERT INTO profiles(user_id, full_name, institution, school_id, roll_number) VALUES($1, $2, $3, $4, $5)",
                        [userId, fullName, institution, schoolId, rollNumber]
                    );
                } else {
                    userId = generateId();
                    await execute(
                        "INSERT INTO users(id, email, password_hash, role, school_id) VALUES(?, ?, ?, ?, ?)",
                        [userId, email, passwordHash, 'student', schoolId]
                    );
                    await execute(
                        "INSERT INTO profiles(user_id, full_name, institution, school_id, roll_number) VALUES(?, ?, ?, ?, ?)",
                        [userId, fullName, institution, schoolId, rollNumber]
                    );
                }
                createdStudents.push({ email, fullName, rollNumber, schoolId });
            }
        }

        res.json({ message: `Successfully generated student logins`, created: createdStudents });
    } catch (error) {
        console.error("Error generating students:", error);
        res.status(500).json({ error: 'Internal server error generating students' });
    }
});

module.exports = router;
