const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { query, execute } = require('../db/database');
const crypto = require('crypto');

const generateId = () => crypto.randomUUID();

// Helper to create notification programmatically from backend
const createNotification = async ({ userId, type, title, message, link }) => {
    try {
        const id = generateId();
        if (process.env.DB_TYPE === 'postgres') {
            await execute(`
                INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, 0, NOW())
            `, [id, userId, type, title, message, link || null]);
        } else {
            await execute(`
                INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
            `, [id, userId, type, title, message, link || null]);
        }
    } catch (err) {
        console.error("Error creating notification:", err);
    }
};

// GET /api/notifications - List notifications for logged in user
router.get('/', authenticate, async (req, res) => {
    try {
        let rows;
        if (process.env.DB_TYPE === 'postgres') {
            rows = await query(`
                SELECT * FROM notifications 
                WHERE user_id = $1 
                ORDER BY created_at DESC 
                LIMIT 50
            `, [req.user.id]);
        } else {
            rows = await query(`
                SELECT * FROM notifications 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 50
            `, [req.user.id]);
        }
        res.json({ notifications: rows });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// GET /api/notifications/unread-count
router.get('/unread-count', authenticate, async (req, res) => {
    try {
        let rows;
        if (process.env.DB_TYPE === 'postgres') {
            rows = await query(`
                SELECT COUNT(*) as unread FROM notifications 
                WHERE user_id = $1 AND is_read = 0
            `, [req.user.id]);
        } else {
            rows = await query(`
                SELECT COUNT(*) as unread FROM notifications 
                WHERE user_id = ? AND is_read = 0
            `, [req.user.id]);
        }
        const count = rows[0] ? parseInt(rows[0].unread || 0) : 0;
        res.json({ unreadCount: count });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
});

// PUT /api/notifications/:id/read - Mark single as read
router.put('/:id/read', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        if (process.env.DB_TYPE === 'postgres') {
            await execute(`UPDATE notifications SET is_read = 1 WHERE id = $1 AND user_id = $2`, [id, req.user.id]);
        } else {
            await execute(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, [id, req.user.id]);
        }
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error("Error marking notification read:", error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', authenticate, async (req, res) => {
    try {
        if (process.env.DB_TYPE === 'postgres') {
            await execute(`UPDATE notifications SET is_read = 1 WHERE user_id = $1`, [req.user.id]);
        } else {
            await execute(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [req.user.id]);
        }
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error("Error marking all read:", error);
        res.status(500).json({ error: 'Failed to mark notifications read' });
    }
});

module.exports = {
    router,
    createNotification
};
