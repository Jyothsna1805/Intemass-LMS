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

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ message: 'Login successful', token, user: payload });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
