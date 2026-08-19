const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { query, execute } = require('../db/database');
const { createNotification } = require('./notifications');
const crypto = require('crypto');

const generateId = () => crypto.randomUUID();

// Default templates per score band
const DEFAULT_TEMPLATES = {
    'Excellent': "Outstanding performance! You have demonstrated a complete understanding of the core concepts, excellent critical thinking, and clear presentation.",
    'Needs Improvement': "Good effort! You understand the foundational principles, but some key details and explanations require further clarity and depth.",
    'Requires Attention': "Additional review recommended. Please revisit the core concepts and standard answers. Reach out during office hours for guidance."
};

// POST /api/mass-feedback/generate - Bulk generate feedback templates for an assignment
router.post('/generate', authenticate, authorize(['teacher', 'master']), async (req, res) => {
    const { assignmentId, customTemplates } = req.body;

    if (!assignmentId) {
        return res.status(400).json({ error: 'Assignment ID is required' });
    }

    try {
        const templates = { ...DEFAULT_TEMPLATES, ...(customTemplates || {}) };

        // Fetch all student submissions with scores
        let submissionRows, questionRows;
        if (process.env.DB_TYPE === 'postgres') {
            questionRows = await query(`
                SELECT aq.max_points FROM assignment_questions aq WHERE aq.assignment_id = $1
            `, [assignmentId]);
            submissionRows = await query(`
                SELECT s.student_id, SUM(COALESCE(s.marks_awarded, 0)) as total_marks
                FROM submissions s
                WHERE s.assignment_id = $1
                GROUP BY s.student_id
            `, [assignmentId]);
        } else {
            questionRows = await query(`
                SELECT aq.max_points FROM assignment_questions aq WHERE aq.assignment_id = ?
            `, [assignmentId]);
            submissionRows = await query(`
                SELECT s.student_id, SUM(COALESCE(s.marks_awarded, 0)) as total_marks
                FROM submissions s
                WHERE s.assignment_id = ?
                GROUP BY s.student_id
            `, [assignmentId]);
        }

        const maxTotal = questionRows.reduce((sum, q) => sum + (q.max_points || 5), 0);

        let createdCount = 0;
        for (const sub of submissionRows) {
            const studentId = sub.student_id;
            const totalMarks = parseFloat(sub.total_marks || 0);
            const percentage = maxTotal > 0 ? (totalMarks / maxTotal) * 100 : 0;

            let scoreBand = 'Requires Attention';
            if (percentage >= 80) scoreBand = 'Excellent';
            else if (percentage >= 50) scoreBand = 'Needs Improvement';

            const feedbackText = templates[scoreBand];
            const id = generateId();

            // Insert or replace feedback
            if (process.env.DB_TYPE === 'postgres') {
                await execute(`
                    INSERT INTO mass_feedbacks (id, assignment_id, student_id, score_band, feedback_text, created_at)
                    VALUES ($1, $2, $3, $4, $5, NOW())
                `, [id, assignmentId, studentId, scoreBand, feedbackText]);
            } else {
                await execute(`
                    INSERT INTO mass_feedbacks (id, assignment_id, student_id, score_band, feedback_text, created_at)
                    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                `, [id, assignmentId, studentId, scoreBand, feedbackText]);
            }

            // Trigger notification to student
            await createNotification({
                userId: studentId,
                type: 'feedback_ready',
                title: 'Mass Evaluation & Feedback Published',
                message: `Feedback available for assignment (${scoreBand}): "${feedbackText.substring(0, 50)}..."`,
                link: '/student-dashboard'
            });

            createdCount++;
        }

        res.json({ message: `Successfully generated and delivered mass feedback to ${createdCount} students`, count: createdCount });

    } catch (error) {
        console.error("Error generating mass feedback:", error);
        res.status(500).json({ error: 'Failed to generate mass feedback' });
    }
});

// GET /api/mass-feedback/assignment/:assignmentId - List mass feedback for an assignment (Teacher view)
router.get('/assignment/:assignmentId', authenticate, authorize(['teacher', 'master']), async (req, res) => {
    const { assignmentId } = req.params;

    try {
        let rows;
        if (process.env.DB_TYPE === 'postgres') {
            rows = await query(`
                SELECT mf.*, p.full_name as student_name, u.email as student_email
                FROM mass_feedbacks mf
                JOIN users u ON mf.student_id = u.id
                LEFT JOIN profiles p ON u.id = p.user_id
                WHERE mf.assignment_id = $1
                ORDER BY mf.created_at DESC
            `, [assignmentId]);
        } else {
            rows = await query(`
                SELECT mf.*, p.full_name as student_name, u.email as student_email
                FROM mass_feedbacks mf
                JOIN users u ON mf.student_id = u.id
                LEFT JOIN profiles p ON u.id = p.user_id
                WHERE mf.assignment_id = ?
                ORDER BY mf.created_at DESC
            `, [assignmentId]);
        }

        res.json({ feedbacks: rows });
    } catch (error) {
        console.error("Error fetching mass feedback:", error);
        res.status(500).json({ error: 'Failed to fetch mass feedback' });
    }
});

// GET /api/mass-feedback/student - Get mass feedback for logged in student
router.get('/student', authenticate, authorize('student'), async (req, res) => {
    try {
        let rows;
        if (process.env.DB_TYPE === 'postgres') {
            rows = await query(`
                SELECT mf.*, a.title as assignment_title
                FROM mass_feedbacks mf
                JOIN assignments a ON mf.assignment_id = a.id
                WHERE mf.student_id = $1
                ORDER BY mf.created_at DESC
            `, [req.user.id]);
        } else {
            rows = await query(`
                SELECT mf.*, a.title as assignment_title
                FROM mass_feedbacks mf
                JOIN assignments a ON mf.assignment_id = a.id
                WHERE mf.student_id = ?
                ORDER BY mf.created_at DESC
            `, [req.user.id]);
        }

        res.json({ feedbacks: rows });
    } catch (error) {
        console.error("Error fetching student mass feedback:", error);
        res.status(500).json({ error: 'Failed to fetch student feedback' });
    }
});

// PUT /api/mass-feedback/:id/view - Mark feedback as viewed
router.put('/:id/view', authenticate, authorize('student'), async (req, res) => {
    const { id } = req.params;
    try {
        if (process.env.DB_TYPE === 'postgres') {
            await execute(`UPDATE mass_feedbacks SET is_viewed = 1, viewed_at = NOW() WHERE id = $1 AND student_id = $2`, [id, req.user.id]);
        } else {
            await execute(`UPDATE mass_feedbacks SET is_viewed = 1, viewed_at = CURRENT_TIMESTAMP WHERE id = ? AND student_id = ?`, [id, req.user.id]);
        }
        res.json({ message: 'Marked feedback as viewed' });
    } catch (error) {
        console.error("Error marking feedback viewed:", error);
        res.status(500).json({ error: 'Failed to update feedback view status' });
    }
});

module.exports = router;
