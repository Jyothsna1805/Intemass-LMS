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
            questions = await query("SELECT id, created_by, question_text, type, subject, standard_answer, max_marks, mcq_options_json, blank_answers_json, created_at FROM questions ORDER BY created_at DESC");
        } else {
            questions = await query("SELECT id, created_by, question_text, type, subject, standard_answer, max_marks, mcq_options_json, blank_answers_json, created_at FROM questions ORDER BY created_at DESC");
        }
        res.json(questions);
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new question (Master & Teacher)
router.post('/', authenticate, authorize(['master', 'teacher']), async (req, res) => {
    const { questionText, standardAnswer, type, subject, maxMarks, mcqOptions, blankAnswers } = req.body;
    const qSubject = subject || 'Uncategorized';
    const qMaxMarks = maxMarks ? parseInt(maxMarks) : 5;

    if (!questionText || !type) {
        return res.status(400).json({ error: 'Question text and type are required' });
    }

    if (!['essay', 'short_answer', 'mcq', 'fill_blank'].includes(type)) {
        return res.status(400).json({ error: 'Invalid question type' });
    }

    const mcqOptionsJson = mcqOptions ? (typeof mcqOptions === 'string' ? mcqOptions : JSON.stringify(mcqOptions)) : null;
    const blankAnswersJson = blankAnswers ? (typeof blankAnswers === 'string' ? blankAnswers : JSON.stringify(blankAnswers)) : null;

    try {
        let questionId;
        if (process.env.DB_TYPE === 'postgres') {
            const result = await execute(
                "INSERT INTO questions(created_by, question_text, standard_answer, type, subject, max_marks, mcq_options_json, blank_answers_json) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
                [req.user.id, questionText, standardAnswer, type, qSubject, qMaxMarks, mcqOptionsJson, blankAnswersJson]
            );
            questionId = result.rows[0].id;
        } else {
            questionId = generateId();
            await execute(
                "INSERT INTO questions(id, created_by, question_text, standard_answer, type, subject, max_marks, mcq_options_json, blank_answers_json) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [questionId, req.user.id, questionText, standardAnswer, type, qSubject, qMaxMarks, mcqOptionsJson, blankAnswersJson]
            );
        }

        res.status(201).json({ message: 'Question created successfully', questionId });
    } catch (error) {
        console.error("Error creating question:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
