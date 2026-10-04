const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, execute } = require('../db/database');
const crypto = require('crypto'); // For generating UUIDs if sqlite

const generateId = () => crypto.randomUUID();

// Registration Endpoint
router.post('/register', async (req, res) => {
    const { email, password, role, fullName, institution } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    if (!['student', 'teacher', 'master'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    try {
        // Check if user exists
        const existingUsers = await query("SELECT id FROM users WHERE email = $1", [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'Email already in use' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        let userId;

        if (process.env.DB_TYPE === 'postgres') {
            const queryText = "INSERT INTO users(email, password_hash, role) VALUES($1, $2, $3) RETURNING id";
            const result = await execute(queryText, [email, passwordHash, role]);
            userId = result.rows[0].id;
        } else {
            userId = generateId();
            const queryText = "INSERT INTO users(id, email, password_hash, role) VALUES(?, ?, ?, ?)";
            await execute(queryText, [userId, email, passwordHash, role]);
        }

        // Create profile
        if (fullName || institution) {
            if (process.env.DB_TYPE === 'postgres') {
                await execute("INSERT INTO profiles(user_id, full_name, institution) VALUES($1, $2, $3)", [userId, fullName, institution]);
            } else {
                await execute("INSERT INTO profiles(user_id, full_name, institution) VALUES(?, ?, ?)", [userId, fullName, institution]);
            }
        }

        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login Endpoint
router.post('/login', async (req, res) => {
    let { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    let normalizedEmail = email.toLowerCase().trim();

    // Support convenient shorthand entries (e.g. "1" -> "1@intemass.com", "teacher" -> "teacher@intemass.com")
    if (!normalizedEmail.includes('@')) {
        normalizedEmail = `${normalizedEmail}@intemass.com`;
    }

    // ALLOWED ACCOUNTS
    const ALLOWED_ACCOUNTS = [
        '1@intemass.com',
        '2@intemass.com',
        '3@intemass.com',
        '4@intemass.com',
        'student@intemass.com',
        'teacher@intemass.com',
        'master@intemass.com'
    ];

    if (!ALLOWED_ACCOUNTS.includes(normalizedEmail)) {
        return res.status(401).json({ error: 'Access Denied. Please use an authorized Student, Teacher, or Master account.' });
    }

    try {
        let users;
        if (process.env.DB_TYPE === 'postgres') {
            users = await query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);
        } else {
            users = await query("SELECT * FROM users WHERE email = ?", [normalizedEmail]);
        }

        // Determine user role and details
        let role = 'student';
        let defaultFullName = 'Student User';
        if (normalizedEmail.startsWith('teacher')) {
            role = 'teacher';
            defaultFullName = 'Teacher User';
        } else if (normalizedEmail.startsWith('master')) {
            role = 'master';
            defaultFullName = 'Master Admin';
        } else if (normalizedEmail === 'student@intemass.com') {
            role = 'student';
            defaultFullName = 'Student User';
        } else {
            const rollNum = normalizedEmail.split('@')[0];
            role = 'student';
            defaultFullName = `Student ${rollNum} (Roll: ${String(rollNum).padStart(3, '0')})`;
        }

        // Auto-provision if user does not exist in DB yet
        if (users.length === 0) {
            const passwordHash = await bcrypt.hash(password, 10);
            const institution = 'MegaForte Singapore';
            let newUserId;

            if (process.env.DB_TYPE === 'postgres') {
                const result = await execute(
                    "INSERT INTO users(email, password_hash, role) VALUES($1, $2, $3) RETURNING id",
                    [normalizedEmail, passwordHash, role]
                );
                newUserId = result.rows[0].id;
                await execute("INSERT INTO profiles(user_id, full_name, institution) VALUES($1, $2, $3)", [newUserId, defaultFullName, institution]);
            } else {
                newUserId = generateId();
                await execute("INSERT INTO users(id, email, password_hash, role) VALUES(?, ?, ?, ?)", [newUserId, normalizedEmail, passwordHash, role]);
                await execute("INSERT INTO profiles(user_id, full_name, institution) VALUES(?, ?, ?)", [newUserId, defaultFullName, institution]);
            }

            const payload = {
                id: newUserId,
                email: normalizedEmail,
                role: role,
                fullName: defaultFullName,
                institution: institution
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
            return res.json({ message: 'Login successful', token, user: payload });
        }

        const user = users[0];

        // Flexible password matching for demo reliability
        let isMatch = await bcrypt.compare(password, user.password_hash);
        
        // Demo fallback password checks (password123, teacher123, master123, student123)
        if (!isMatch) {
            if (
                password === 'password123' ||
                (user.role === 'teacher' && password === 'teacher123') ||
                (user.role === 'master' && password === 'master123') ||
                (user.role === 'student' && password === 'student123')
            ) {
                isMatch = true;
                // Update password in DB to new hash
                const newHash = await bcrypt.hash(password, 10);
                if (process.env.DB_TYPE === 'postgres') {
                    await execute("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, user.id]);
                } else {
                    await execute("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, user.id]);
                }
            }
        }

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password. Please check your password.' });
        }

        let profile = null;
        if (process.env.DB_TYPE === 'postgres') {
            const pRes = await query("SELECT full_name, institution FROM profiles WHERE user_id = $1", [user.id]);
            if (pRes.length > 0) profile = pRes[0];
        } else {
            const pRes = await query("SELECT full_name, institution FROM profiles WHERE user_id = ?", [user.id]);
            if (pRes.length > 0) profile = pRes[0];
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            fullName: profile ? profile.full_name : (user.email.split('@')[0]),
            institution: profile ? profile.institution : 'MegaForte Singapore'
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ message: 'Login successful', token, user: payload });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
