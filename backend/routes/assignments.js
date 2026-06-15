const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { query, execute } = require('../db/database');
const crypto = require('crypto');

const generateId = () => crypto.randomUUID();

// Get assignments
router.get('/', authenticate, async (req, res) => {
    try {
        let assignments;
        if (req.user.role === 'teacher') {
            if (process.env.DB_TYPE === 'postgres') {
                assignments = await query("SELECT * FROM assignments WHERE teacher_id = $1", [req.user.id]);
            } else {
                assignments = await query("SELECT * FROM assignments WHERE teacher_id = ?", [req.user.id]);
            }
        } else if (req.user.role === 'student' || req.user.role === 'master') {
            // Students see all assignments for now (could be filtered by enrollment later)
            if (process.env.DB_TYPE === 'postgres') {
                assignments = await query("SELECT * FROM assignments");
            } else {
                assignments = await query("SELECT * FROM assignments");
            }
        }
        res.json(assignments);
    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create assignment (Teacher only)
router.post('/', authenticate, authorize('teacher'), async (req, res) => {
    const { title, instructions, dueDate, questionIds } = req.body;

    if (!title || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({ error: 'Title and at least one question are required' });
    }

    try {
        let assignmentId;
        if (process.env.DB_TYPE === 'postgres') {
            const result = await execute(
                "INSERT INTO assignments(teacher_id, title, instructions, due_date) VALUES($1, $2, $3, $4) RETURNING id",
                [req.user.id, title, instructions, dueDate]
            );
            assignmentId = result.rows[0].id;

            for (const qId of questionIds) {
                await execute("INSERT INTO assignment_questions(assignment_id, question_id) VALUES($1, $2)", [assignmentId, qId]);
            }

        } else {
            assignmentId = generateId();
            await execute(
                "INSERT INTO assignments(id, teacher_id, title, instructions, due_date) VALUES(?, ?, ?, ?, ?)",
                [assignmentId, req.user.id, title, instructions, dueDate]
            );

            for (const qId of questionIds) {
                await execute("INSERT INTO assignment_questions(assignment_id, question_id) VALUES(?, ?)", [assignmentId, qId]);
            }
        }

        res.status(201).json({ message: 'Assignment created successfully', assignmentId });
    } catch (error) {
        console.error("Error creating assignment:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get assignment details + questions
router.get('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    try {
        let assignmentRows;
        if (process.env.DB_TYPE === 'postgres') {
            assignmentRows = await query("SELECT * FROM assignments WHERE id = $1", [id]);
        } else {
            assignmentRows = await query("SELECT * FROM assignments WHERE id = ?", [id]);
        }

        if (assignmentRows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        const assignment = assignmentRows[0];

        // Fetch questions
        let questionRows;
        if (process.env.DB_TYPE === 'postgres') {
            questionRows = await query(`
                SELECT q.id, q.question_text, q.type, aq.max_points 
                FROM questions q 
                JOIN assignment_questions aq ON q.id = aq.question_id 
                WHERE aq.assignment_id = $1
            `, [id]);
        } else {
            questionRows = await query(`
                SELECT q.id, q.question_text, q.type, aq.max_points 
                FROM questions q 
                JOIN assignment_questions aq ON q.id = aq.question_id 
                WHERE aq.assignment_id = ?
            `, [id]);
        }

        res.json({ ...assignment, questions: questionRows });

    } catch (error) {
        console.error("Error fetching assignment details:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get submissions for an assignment (Teacher only)
router.get('/:id/submissions', authenticate, authorize('teacher'), async (req, res) => {
    const { id } = req.params;
    try {
        let submissions;
        if (process.env.DB_TYPE === 'postgres') {
            submissions = await query(`
                SELECT s.id, s.marks_awarded, s.submitted_at, p.full_name as student_name, q.question_text
                FROM submissions s
                JOIN profiles p ON s.student_id = p.user_id
                JOIN questions q ON s.question_id = q.id
                WHERE s.assignment_id = $1
                ORDER BY s.submitted_at DESC
            `, [id]);
        } else {
            submissions = await query(`
                SELECT s.id, s.marks_awarded, s.submitted_at, p.full_name as student_name, q.question_text
                FROM submissions s
                JOIN profiles p ON s.student_id = p.user_id
                JOIN questions q ON s.question_id = q.id
                WHERE s.assignment_id = ?
                ORDER BY s.submitted_at DESC
            `, [id]);
        }
        res.json(submissions);
    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Temporary endpoint to clear old assignments for the demo
router.get('/danger/clear-all', async (req, res) => {
    try {
        if (process.env.DB_TYPE === 'postgres') {
            // Keep the most recent assignment, delete the rest
            const result = await query("SELECT id FROM assignments ORDER BY created_at DESC LIMIT 1");
            if (result.length > 0) {
                const keepId = result[0].id;
                await execute("DELETE FROM submissions WHERE assignment_id != $1", [keepId]);
                await execute("DELETE FROM assignment_questions WHERE assignment_id != $1", [keepId]);
                await execute("DELETE FROM assignments WHERE id != $1", [keepId]);
                res.send("Cleared all old assignments. Kept 1 recent assignment.");
            } else {
                res.send("No assignments found to clear.");
            }
        } else {
            res.send("This endpoint is only for the live postgres database.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error clearing assignments");
    }
});

module.exports = router;
