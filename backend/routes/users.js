const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { query } = require('../db/database');

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

module.exports = router;
