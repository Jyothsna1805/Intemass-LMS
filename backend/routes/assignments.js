const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { query, execute } = require('../db/database');
const crypto = require('crypto');

const generateId = () => crypto.randomUUID();

// Get assignments
router.get('/', authenticate, async (req, res) => {
    try {
        // Auto-seed BIT 1 Nov 2026 course modules if not already present
        try {
            const { seedBitCurriculum } = require('../seed_bit_questions');
            await seedBitCurriculum(req.user.id);
        } catch (seedErr) {
            console.error("Non-critical BIT auto-seed note:", seedErr.message);
        }

        let assignments;
        if (process.env.DB_TYPE === 'postgres') {
            assignments = await query("SELECT * FROM assignments ORDER BY created_at DESC");
        } else {
            assignments = await query("SELECT * FROM assignments ORDER BY created_at DESC");
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

        // Auto-link all available subject questions if missing
        if (assignment.subject) {
            const subjectQuestions = await query(
                "SELECT id FROM questions WHERE subject = $1",
                [assignment.subject]
            );
            for (const sq of subjectQuestions) {
                const linkExisting = await query(
                    "SELECT question_id FROM assignment_questions WHERE assignment_id = $1 AND question_id = $2",
                    [id, sq.id]
                );
                if (linkExisting.length === 0) {
                    await execute(
                        "INSERT INTO assignment_questions (assignment_id, question_id, max_points) VALUES ($1, $2, 100)",
                        [id, sq.id]
                    );
                }
            }
        }

        // Fetch questions
        let questionRows;
        if (process.env.DB_TYPE === 'postgres') {
            questionRows = await query(`
                SELECT q.id, q.question_text, q.type, q.subject, q.sub_category, aq.max_points 
                FROM questions q 
                JOIN assignment_questions aq ON q.id = aq.question_id 
                WHERE aq.assignment_id = $1 AND (q.subject = $2 OR $2 IS NULL)
                ORDER BY q.question_text ASC
            `, [id, assignment.subject]);
        } else {
            questionRows = await query(`
                SELECT q.id, q.question_text, q.type, q.subject, q.sub_category, aq.max_points 
                FROM questions q 
                JOIN assignment_questions aq ON q.id = aq.question_id 
                WHERE aq.assignment_id = ? AND (q.subject = ? OR ? IS NULL)
                ORDER BY q.question_text ASC
            `, [id, assignment.subject, assignment.subject]);
        }

        res.json({ ...assignment, questions: questionRows });

    } catch (error) {
        console.error("Error fetching assignment details:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get submissions for an assignment (Teacher only)
router.get('/:id/submissions', authenticate, authorize(['teacher', 'master']), async (req, res) => {
    const { id } = req.params;
    try {
        let submissions;
        if (process.env.DB_TYPE === 'postgres') {
            submissions = await query(`
                SELECT s.id, s.marks_awarded, s.submitted_at, p.full_name as student_name, q.question_text
                FROM submissions s
                JOIN users u ON s.student_id = u.id
                JOIN profiles p ON s.student_id = p.user_id
                JOIN questions q ON s.question_id = q.id
                WHERE s.assignment_id = $1 AND u.email IN ('1@intemass.com', '2@intemass.com', '3@intemass.com', '4@intemass.com')
                ORDER BY s.submitted_at DESC
            `, [id]);
        } else {
            submissions = await query(`
                SELECT s.id, s.marks_awarded, s.submitted_at, p.full_name as student_name, q.question_text
                FROM submissions s
                JOIN users u ON s.student_id = u.id
                JOIN profiles p ON s.student_id = p.user_id
                JOIN questions q ON s.question_id = q.id
                WHERE s.assignment_id = ? AND u.email IN ('1@intemass.com', '2@intemass.com', '3@intemass.com', '4@intemass.com')
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

        // Auto-link all available subject questions if missing
        if (assignment.subject) {
            const subjectQuestions = await query(
                "SELECT id FROM questions WHERE subject = $1",
                [assignment.subject]
            );
            for (const sq of subjectQuestions) {
                const linkExisting = await query(
                    "SELECT question_id FROM assignment_questions WHERE assignment_id = $1 AND question_id = $2",
                    [id, sq.id]
                );
                if (linkExisting.length === 0) {
                    await execute(
                        "INSERT INTO assignment_questions (assignment_id, question_id, max_points) VALUES ($1, $2, 100)",
                        [id, sq.id]
                    );
                }
            }
        }

        // Fetch questions for this assignment in natural order
        let questionRows;
        if (process.env.DB_TYPE === 'postgres') {
            questionRows = await query(`
                SELECT q.id, q.question_text, q.type, q.subject, q.sub_category, q.standard_answer, 
                       COALESCE(aq.max_points, q.max_marks, 5) as max_marks,
                       q.mcq_options_json, q.blank_answers_json
                FROM questions q 
                JOIN assignment_questions aq ON q.id = aq.question_id 
                WHERE aq.assignment_id = $1 AND (q.subject = $2 OR $2 IS NULL)
                ORDER BY q.question_text ASC
            `, [id, assignment.subject]);
        } else {
            questionRows = await query(`
                SELECT q.id, q.question_text, q.type, q.subject, q.sub_category, q.standard_answer, 
                       COALESCE(aq.max_points, q.max_marks, 5) as max_marks,
                       q.mcq_options_json, q.blank_answers_json
                FROM questions q 
                JOIN assignment_questions aq ON q.id = aq.question_id 
                WHERE aq.assignment_id = ? AND (q.subject = ? OR ? IS NULL)
                ORDER BY q.question_text ASC
            `, [id, assignment.subject, assignment.subject]);
        }

        // Fetch strictly the 4 authorized student accounts (Roll 1 to 4)
        let allStudents;
        if (process.env.DB_TYPE === 'postgres') {
            allStudents = await query(`
                SELECT u.id, u.email, COALESCE(p.full_name, u.email) as student_name
                FROM users u
                LEFT JOIN profiles p ON u.id = p.user_id
                WHERE u.role = 'student' AND u.email IN ('1@intemass.com', '2@intemass.com', '3@intemass.com', '4@intemass.com')
                ORDER BY u.email ASC
            `);
        } else {
            allStudents = await query(`
                SELECT u.id, u.email, COALESCE(p.full_name, u.email) as student_name
                FROM users u
                LEFT JOIN profiles p ON u.id = p.user_id
                WHERE u.role = 'student' AND u.email IN ('1@intemass.com', '2@intemass.com', '3@intemass.com', '4@intemass.com')
                ORDER BY u.email ASC
            `);
        }

        // Fetch submissions strictly for the 4 authorized students
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
                WHERE s.assignment_id = $1 AND u.email IN ('1@intemass.com', '2@intemass.com', '3@intemass.com', '4@intemass.com')
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
                WHERE s.assignment_id = ? AND u.email IN ('1@intemass.com', '2@intemass.com', '3@intemass.com', '4@intemass.com')
                ORDER BY s.submitted_at ASC
            `, [id]);
        }

        // Clean feedback JSON helper
        const cleanFeedbackString = (fb) => {
            if (!fb) return '';
            if (typeof fb === 'string' && fb.trim().startsWith('{')) {
                try {
                    const parsed = JSON.parse(fb);
                    if (parsed.debug) return '';
                    if (parsed.comment) return parsed.comment;
                    if (parsed.feedback) return parsed.feedback;
                    return '';
                } catch (e) {
                    return fb;
                }
            }
            return fb;
        };

        // Clean HTML text helper (strip messy inline style attributes that ruin readability)
        const sanitizeStudentText = (str) => {
            if (!str) return '';
            return str
                .replace(/style\s*=\s*"[^"]*"/gi, '')
                .replace(/style\s*=\s*'[^']*'/gi, '')
                .trim();
        };

        // Map submissions with cleaned text and feedback
        const cleanedSubmissions = submissionRows.map(s => ({
            ...s,
            answer_text: sanitizeStudentText(s.answer_text),
            feedback: cleanFeedbackString(s.feedback)
        }));

        // Group student responses by question including all class students
        let totalSubmissionsCount = cleanedSubmissions.length;
        let totalGradedCount = 0;

        const questionsWithAnswers = (questionRows || []).map((q, idx) => {
            const answersForQ = cleanedSubmissions.filter(s => s.question_id === q.id);
            const submittedStudentIds = new Set(answersForQ.map(s => s.student_id));

            // Include submitted answers
            const studentAnswersList = [...answersForQ.map(s => ({
                ...s,
                is_submitted: true
            }))];

            // Also append registered students who haven't submitted yet
            allStudents.forEach(stu => {
                if (!submittedStudentIds.has(stu.id)) {
                    studentAnswersList.push({
                        id: `pending_${stu.id}_${q.id}`,
                        student_id: stu.id,
                        question_id: q.id,
                        answer_text: null,
                        file_url: null,
                        extracted_diagram_url: null,
                        ocr_text: null,
                        topology_json: null,
                        marks_awarded: null,
                        feedback: '',
                        submitted_at: null,
                        marked_at: null,
                        student_name: stu.student_name || stu.email,
                        student_email: stu.email,
                        is_submitted: false
                    });
                }
            });

            // Sort by student email
            studentAnswersList.sort((a, b) => (a.student_email || '').localeCompare(b.student_email || ''));

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
                    total_students_roster: allStudents.length,
                    graded_answers: gradedAnswers.length,
                    pending_answers: answersForQ.length - gradedAnswers.length,
                    unsubmitted_answers: allStudents.length - answersForQ.length,
                    average_score: avgScore,
                    highest_score: highestScore
                },
                student_answers: studentAnswersList
            };
        });

        res.json({
            assignment,
            questions: questionsWithAnswers,
            stats: {
                total_students: allStudents.length,
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

// Auto-seed sample submissions from all 4 whitelist students for testing/grading
router.post('/:id/seed-sample-submissions', authenticate, authorize(['teacher', 'master']), async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch questions for assignment
        let questions;
        if (process.env.DB_TYPE === 'postgres') {
            questions = await query(`
                SELECT q.id, q.question_text, q.standard_answer, COALESCE(aq.max_points, q.max_marks, 5) as max_marks
                FROM questions q JOIN assignment_questions aq ON q.id = aq.question_id
                WHERE aq.assignment_id = $1
            `, [id]);
        } else {
            questions = await query(`
                SELECT q.id, q.question_text, q.standard_answer, COALESCE(aq.max_points, q.max_marks, 5) as max_marks
                FROM questions q JOIN assignment_questions aq ON q.id = aq.question_id
                WHERE aq.assignment_id = ?
            `, [id]);
        }

        if (!questions || questions.length === 0) {
            return res.status(400).json({ error: 'No questions found for this assignment.' });
        }

        // Fetch strictly the 4 student accounts
        let students;
        if (process.env.DB_TYPE === 'postgres') {
            students = await query("SELECT id, email FROM users WHERE role = 'student' AND email IN ('1@intemass.com', '2@intemass.com', '3@intemass.com', '4@intemass.com') ORDER BY email ASC");
        } else {
            students = await query("SELECT id, email FROM users WHERE role = 'student' AND email IN ('1@intemass.com', '2@intemass.com', '3@intemass.com', '4@intemass.com') ORDER BY email ASC");
        }

        if (!students || students.length === 0) {
            return res.status(400).json({ error: 'No student accounts found.' });
        }

        const sampleTemplates = [
            (std) => `The core principle involves the following: ${std ? std.slice(0, 120) : 'Detailed step-by-step reasoning with structural analysis and empirical validation.'} As stated in the primary literature, this establishes sustainable equilibrium.`,
            (std) => `According to the framework, this can be explained through two dimensions: first, the foundational constraints; second, the strategic outcome. Consequently, the findings align closely with standard theorems.`,
            (std) => `A comprehensive overview demonstrates that key variables directly correlate with the target outcome. In particular, the historical context and legislative precedents substantiate this conclusion.`,
            (std) => `Based on the assigned material, the critical factors include systemic efficiency, regulatory compliance, and operational dynamics. Thus, the solution satisfies all core criteria.`
        ];

        let insertedCount = 0;
        for (let sIdx = 0; sIdx < students.length; sIdx++) {
            const student = students[sIdx];
            for (let qIdx = 0; qIdx < questions.length; qIdx++) {
                const question = questions[qIdx];
                
                // Check if already submitted
                let existing;
                if (process.env.DB_TYPE === 'postgres') {
                    existing = await query("SELECT id FROM submissions WHERE student_id = $1 AND assignment_id = $2 AND question_id = $3", [student.id, id, question.id]);
                } else {
                    existing = await query("SELECT id FROM submissions WHERE student_id = ? AND assignment_id = ? AND question_id = ?", [student.id, id, question.id]);
                }

                if (!existing || existing.length === 0) {
                    const templateFn = sampleTemplates[(sIdx + qIdx) % sampleTemplates.length];
                    const generatedAnswer = templateFn(question.standard_answer);

                    if (process.env.DB_TYPE === 'postgres') {
                        await execute(
                            "INSERT INTO submissions(student_id, assignment_id, question_id, answer_text, marks_awarded, feedback) VALUES($1, $2, $3, $4, $5, $6)",
                            [student.id, id, question.id, generatedAnswer, null, null]
                        );
                    } else {
                        const subId = generateId();
                        await execute(
                            "INSERT INTO submissions(id, student_id, assignment_id, question_id, answer_text, marks_awarded, feedback) VALUES(?, ?, ?, ?, ?, ?, ?)",
                            [subId, student.id, id, question.id, generatedAnswer, null, null]
                        );
                    }
                    insertedCount++;
                }
            }
        }

        res.json({ message: `Successfully populated ${insertedCount} student submissions across all questions!`, insertedCount });
    } catch (error) {
        console.error("Error seeding sample submissions:", error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
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
