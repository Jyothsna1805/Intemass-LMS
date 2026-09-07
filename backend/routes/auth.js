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
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        let users;
        if (process.env.DB_TYPE === 'postgres') {
            users = await query("SELECT * FROM users WHERE email = $1", [email]);
        } else {
            users = await query("SELECT * FROM users WHERE email = ?", [email]);
        }

        // Strictly allowed student logins limit (1 to 4)
        const ALLOWED_DEMO_STUDENTS = ['1@intemass.com', '2@intemass.com', '3@intemass.com', '4@intemass.com', 'student@intemass.com'];
        const normalizedEmail = email.toLowerCase().trim();

        if (users.length === 0) {
            // Strictly check if it's within the allowed 4 student logins (1 to 4)
            if (ALLOWED_DEMO_STUDENTS.includes(normalizedEmail) && password === 'password123') {
                const passwordHash = await bcrypt.hash(password, 10);
                const rollNum = normalizedEmail.split('@')[0];
                const fullName = `Student ${rollNum} (Roll: ${String(rollNum).padStart(3, '0')})`;
                const institution = 'MegaForte Singapore';
                let newUserId;

                if (process.env.DB_TYPE === 'postgres') {
                    const result = await execute(
                        "INSERT INTO users(email, password_hash, role) VALUES($1, $2, $3) RETURNING id",
                        [normalizedEmail, passwordHash, 'student']
                    );
                    newUserId = result.rows[0].id;
                    await execute("INSERT INTO profiles(user_id, full_name, institution) VALUES($1, $2, $3)", [newUserId, fullName, institution]);
                } else {
                    newUserId = generateId();
                    await execute("INSERT INTO users(id, email, password_hash, role) VALUES(?, ?, ?, ?)", [newUserId, normalizedEmail, passwordHash, 'student']);
                    await execute("INSERT INTO profiles(user_id, full_name, institution) VALUES(?, ?, ?)", [newUserId, fullName, institution]);
                }

                const payload = {
                    id: newUserId,
                    email: normalizedEmail,
                    role: 'student',
                    fullName: fullName,
                    institution: institution
                };
                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
                return res.json({ message: 'Login successful', token, user: payload });
            }

            return res.status(401).json({ error: 'Invalid credentials. Only authorized student logins (Students 1 to 4) can access.' });
        }

        const user = users[0];

        // If an unauthorized numbered account outside 1-4 exists, block it
        if (/^\d+@intemass\.com$/i.test(normalizedEmail) && !ALLOWED_DEMO_STUDENTS.includes(normalizedEmail)) {
            return res.status(401).json({ error: 'This student login is not authorized. Please use Students 1 to 4.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
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
