const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { query, execute } = require('../db/database');
const crypto = require('crypto');

const generateId = () => crypto.randomUUID();

// Get all questions (Master & Teacher)
router.get('/', authenticate, authorize(['master', 'teacher']), async (req, res) => {
    try {
        let questions;
        if (process.env.DB_TYPE === 'postgres') {
            questions = await query("SELECT id, created_by, question_text, type, subject, standard_answer, max_marks, created_at FROM questions");
        } else {
            questions = await query("SELECT id, created_by, question_text, type, subject, standard_answer, max_marks, created_at FROM questions");
        }
        res.json(questions);
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new question (Master & Teacher)
router.post('/', authenticate, authorize(['master', 'teacher']), async (req, res) => {
    const { questionText, standardAnswer, type, subject, maxMarks } = req.body;
    const qSubject = subject || 'Uncategorized';
    const qMaxMarks = maxMarks ? parseInt(maxMarks) : 5;

    if (!questionText || !type) {
        return res.status(400).json({ error: 'Question text and type are required' });
    }

    if (!['essay', 'short_answer'].includes(type)) {
        return res.status(400).json({ error: 'Invalid question type' });
    }

    try {
        let questionId;
        if (process.env.DB_TYPE === 'postgres') {
            const result = await execute(
                "INSERT INTO questions(created_by, question_text, standard_answer, type, subject, max_marks) VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
                [req.user.id, questionText, standardAnswer, type, qSubject, qMaxMarks]
            );
            questionId = result.rows[0].id;
        } else {
            questionId = generateId();
            await execute(
                "INSERT INTO questions(id, created_by, question_text, standard_answer, type, subject, max_marks) VALUES(?, ?, ?, ?, ?, ?, ?)",
                [questionId, req.user.id, questionText, standardAnswer, type, qSubject, qMaxMarks]
            );
        }

        res.status(201).json({ message: 'Question created successfully', questionId });
    } catch (error) {
        console.error("Error creating question:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
