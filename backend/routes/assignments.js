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
                assignments = await query("SELECT * FROM assignments WHERE teacher_id = $1 ORDER BY created_at DESC", [req.user.id]);
            } else {
                assignments = await query("SELECT * FROM assignments WHERE teacher_id = ? ORDER BY created_at DESC", [req.user.id]);
            }
        } else if (req.user.role === 'student' || req.user.role === 'master') {
            // Students see all assignments
            if (process.env.DB_TYPE === 'postgres') {
                assignments = await query("SELECT * FROM assignments ORDER BY created_at DESC");
            } else {
                assignments = await query("SELECT * FROM assignments ORDER BY created_at DESC");
            }
        }
        res.json(assignments || []);
    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create assignment (Teacher only)
router.post('/', authenticate, authorize('teacher'), async (req, res) => {
    const { title, instructions, dueDate, questionIds, subject, subCategory } = req.body;
    const aSubject = subject || 'General';
    const aSubCategory = subCategory || 'General';

    if (!title || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({ error: 'Title and at least one question are required' });
    }

    try {
        let assignmentId;
        if (process.env.DB_TYPE === 'postgres') {
            const result = await execute(
                "INSERT INTO assignments(teacher_id, title, instructions, due_date, subject, sub_category) VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
                [req.user.id, title, instructions, dueDate, aSubject, aSubCategory]
            );
            assignmentId = result.rows[0].id;

            for (const qId of questionIds) {
                await execute("INSERT INTO assignment_questions(assignment_id, question_id) VALUES($1, $2)", [assignmentId, qId]);
            }

        } else {
            assignmentId = generateId();
            await execute(
                "INSERT INTO assignments(id, teacher_id, title, instructions, due_date, subject, sub_category) VALUES(?, ?, ?, ?, ?, ?, ?)",
                [assignmentId, req.user.id, title, instructions, dueDate, aSubject, aSubCategory]
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

        if (!assignmentRows || assignmentRows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        const assignment = assignmentRows[0];

        // Fetch questions
        let questionRows;
        if (process.env.DB_TYPE === 'postgres') {
            questionRows = await query(`
                SELECT q.id, q.question_text, q.type, q.subject, q.sub_category, aq.max_points 
                FROM questions q 
                JOIN assignment_questions aq ON q.id = aq.question_id 
                WHERE aq.assignment_id = $1
            `, [id]);
        } else {
            questionRows = await query(`
                SELECT q.id, q.question_text, q.type, q.subject, q.sub_category, aq.max_points 
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

// Get Question-Wise Aggregated Submissions for Horizontal Evaluation (Teacher/Master)
router.get('/:id/question-wise', authenticate, authorize(['teacher', 'master']), async (req, res) => {
    const { id } = req.params;
    try {
        let assignmentRows;
        if (process.env.DB_TYPE === 'postgres') {
            assignmentRows = await query("SELECT * FROM assignments WHERE id = $1", [id]);
        } else {
            assignmentRows = await query("SELECT * FROM assignments WHERE id = ?", [id]);
        }

        if (!assignmentRows || assignmentRows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        const assignment = assignmentRows[0];

        // Fetch questions for this assignment
        let questionRows;
        if (process.env.DB_TYPE === 'postgres') {
            questionRows = await query(`
                SELECT q.id, q.question_text, q.type, q.subject, q.sub_category, q.standard_answer, 
                       COALESCE(aq.max_points, q.max_marks, 5) as max_marks,
                       q.mcq_options_json, q.blank_answers_json
                FROM questions q 
                JOIN assignment_questions aq ON q.id = aq.question_id 
                WHERE aq.assignment_id = $1
            `, [id]);
        } else {
            questionRows = await query(`
                SELECT q.id, q.question_text, q.type, q.subject, q.sub_category, q.standard_answer, 
                       COALESCE(aq.max_points, q.max_marks, 5) as max_marks,
                       q.mcq_options_json, q.blank_answers_json
                FROM questions q 
                JOIN assignment_questions aq ON q.id = aq.question_id 
                WHERE aq.assignment_id = ?
            `, [id]);
        }

        // Fetch all submissions for this assignment with student info
        let submissionRows;
        if (process.env.DB_TYPE === 'postgres') {
            submissionRows = await query(`
                SELECT s.id, s.student_id, s.question_id, s.answer_text, s.file_url, 
                       s.extracted_diagram_url, s.ocr_text, s.topology_json, 
                       s.marks_awarded, s.feedback, s.submitted_at, s.marked_at,
                       s.reassessment_status, s.reassessment_request, s.reassessment_teacher_comment,
                       COALESCE(p.full_name, u.email) as student_name,
                       u.email as student_email
                FROM submissions s
                JOIN users u ON s.student_id = u.id
                LEFT JOIN profiles p ON s.student_id = p.user_id
                WHERE s.assignment_id = $1
                ORDER BY s.submitted_at ASC
            `, [id]);
        } else {
            submissionRows = await query(`
                SELECT s.id, s.student_id, s.question_id, s.answer_text, s.file_url, 
                       s.extracted_diagram_url, s.ocr_text, s.topology_json, 
                       s.marks_awarded, s.feedback, s.submitted_at, s.marked_at,
                       s.reassessment_status, s.reassessment_request, s.reassessment_teacher_comment,
                       COALESCE(p.full_name, u.email) as student_name,
                       u.email as student_email
                FROM submissions s
                JOIN users u ON s.student_id = u.id
                LEFT JOIN profiles p ON s.student_id = p.user_id
                WHERE s.assignment_id = ?
                ORDER BY s.submitted_at ASC
            `, [id]);
        }

        // Distinct students count
        const uniqueStudentIds = new Set(submissionRows.map(s => s.student_id));

        // Group student responses by question
        let totalSubmissionsCount = submissionRows.length;
        let totalGradedCount = 0;

        const questionsWithAnswers = (questionRows || []).map((q, idx) => {
            const answersForQ = submissionRows.filter(s => s.question_id === q.id);
            const gradedAnswers = answersForQ.filter(s => s.marks_awarded !== null && s.marks_awarded !== undefined);
            totalGradedCount += gradedAnswers.length;

            const scores = gradedAnswers.map(s => Number(s.marks_awarded));
            const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;
            const highestScore = scores.length > 0 ? Math.max(...scores) : null;

            return {
                ...q,
                question_number: idx + 1,
                stats: {
                    total_answers: answersForQ.length,
                    graded_answers: gradedAnswers.length,
                    pending_answers: answersForQ.length - gradedAnswers.length,
                    average_score: avgScore,
                    highest_score: highestScore
                },
                student_answers: answersForQ
            };
        });

        res.json({
            assignment,
            questions: questionsWithAnswers,
            stats: {
                total_students: uniqueStudentIds.size,
                total_submissions: totalSubmissionsCount,
                total_graded: totalGradedCount,
                total_pending: totalSubmissionsCount - totalGradedCount,
                completion_percentage: totalSubmissionsCount > 0 ? Math.round((totalGradedCount / totalSubmissionsCount) * 100) : 0
            }
        });

    } catch (error) {
        console.error("Error fetching question-wise submissions:", error);
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
