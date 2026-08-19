const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { query, execute } = require('../db/database');
const { createNotification } = require('./notifications');
const crypto = require('crypto');

const generateId = () => crypto.randomUUID();

// POST /api/teacher-feedback - Submit teacher feedback
router.post('/', authenticate, authorize(['teacher', 'master']), async (req, res) => {
    const { category, rating, comments } = req.body;
    if (!comments || !comments.trim()) {
        return res.status(400).json({ error: 'Comments field is required' });
    }

    try {
        const id = generateId();
        const numRating = parseInt(rating) || 5;
        const cat = category || 'General Usability';

        if (process.env.DB_TYPE === 'postgres') {
            await execute(`
                INSERT INTO teacher_feedbacks (id, teacher_id, category, rating, comments, created_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
            `, [id, req.user.id, cat, numRating, comments.trim()]);
        } else {
            await execute(`
                INSERT INTO teacher_feedbacks (id, teacher_id, category, rating, comments, created_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, [id, req.user.id, cat, numRating, comments.trim()]);
        }

        // Notify Master Admins about new teacher feedback
        try {
            const masterUsers = await query("SELECT id FROM users WHERE role = 'master'");
            for (const master of masterUsers) {
                await createNotification({
                    userId: master.id,
                    type: 'info',
                    title: 'New Teacher Feedback Received',
                    message: `Rating: ${numRating}/5 ⭐ (${cat}): ${comments.substring(0, 60)}...`,
                    link: '/master-dashboard'
                });
            }
        } catch (e) {
            console.error("Could not notify master admin of feedback:", e);
        }

        res.json({ message: 'Feedback submitted successfully', id });
    } catch (error) {
        console.error("Error submitting teacher feedback:", error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

// GET /api/teacher-feedback - List feedback entries (Master/Teacher)
router.get('/', authenticate, authorize(['teacher', 'master']), async (req, res) => {
    try {
        let rows;
        if (req.user.role === 'master') {
            if (process.env.DB_TYPE === 'postgres') {
                rows = await query(`
                    SELECT tf.*, p.full_name as teacher_name, u.email as teacher_email
                    FROM teacher_feedbacks tf
                    LEFT JOIN profiles p ON tf.teacher_id = p.user_id
                    LEFT JOIN users u ON tf.teacher_id = u.id
                    ORDER BY tf.created_at DESC
                `);
            } else {
                rows = await query(`
                    SELECT tf.*, p.full_name as teacher_name, u.email as teacher_email
                    FROM teacher_feedbacks tf
                    LEFT JOIN profiles p ON tf.teacher_id = p.user_id
                    LEFT JOIN users u ON tf.teacher_id = u.id
                    ORDER BY tf.created_at DESC
                `);
            }
        } else {
            if (process.env.DB_TYPE === 'postgres') {
                rows = await query(`
                    SELECT * FROM teacher_feedbacks WHERE teacher_id = $1 ORDER BY created_at DESC
                `, [req.user.id]);
            } else {
                rows = await query(`
                    SELECT * FROM teacher_feedbacks WHERE teacher_id = ? ORDER BY created_at DESC
                `, [req.user.id]);
            }
        }
        res.json({ feedbacks: rows });
    } catch (error) {
        console.error("Error fetching teacher feedbacks:", error);
        res.status(500).json({ error: 'Failed to fetch feedback entries' });
    }
});

module.exports = router;
