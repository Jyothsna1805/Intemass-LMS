const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { query, execute } = require('../db/database');
const crypto = require('crypto');

const generateId = () => crypto.randomUUID();

// Save a submission
router.post('/', authenticate, authorize('student'), async (req, res) => {
    const { submissionId } = req.body;

    if (!submissionId) return res.status(400).json({ error: 'Submission ID is required' });

    try {
        let savedEssayId;
        if (process.env.DB_TYPE === 'postgres') {
            const result = await execute(
                "INSERT INTO saved_essays(student_id, submission_id) VALUES($1, $2) RETURNING id",
                [req.user.id, submissionId]
            );
            savedEssayId = result.rows[0].id;
        } else {
            savedEssayId = generateId();
            await execute(
                "INSERT INTO saved_essays(id, student_id, submission_id) VALUES(?, ?, ?)",
                [savedEssayId, req.user.id, submissionId]
            );
        }
        res.status(201).json({ message: 'Essay saved successfully', savedEssayId });
    } catch (error) {
        console.error("Error saving essay:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// List saved essays for student
router.get('/', authenticate, authorize('student'), async (req, res) => {
    try {
        let savedRows;
        if (process.env.DB_TYPE === 'postgres') {
            savedRows = await query(`
                SELECT se.id as saved_id, se.saved_at, s.*, a.title 
                FROM saved_essays se
                JOIN submissions s ON se.submission_id = s.id
                JOIN assignments a ON s.assignment_id = a.id
                WHERE se.student_id = $1
              `, [req.user.id]);
        } else {
            savedRows = await query(`
                SELECT se.id as saved_id, se.saved_at, s.*, a.title 
                FROM saved_essays se
                JOIN submissions s ON se.submission_id = s.id
                JOIN assignments a ON s.assignment_id = a.id
                WHERE se.student_id = ?
              `, [req.user.id]);
        }
        res.json(savedRows);
    } catch (error) {
        console.error("Error retrieving saved essays:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
