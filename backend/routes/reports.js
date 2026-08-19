const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { query } = require('../db/database');
const PDFDocument = require('pdfkit');

// Helper to compute grade from percentage
const computeGrade = (pct) => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
};

// GET /api/reports/assignment/:assignmentId/consolidated
router.get('/assignment/:assignmentId/consolidated', authenticate, authorize(['teacher', 'master']), async (req, res) => {
    const { assignmentId } = req.params;

    try {
        // Fetch assignment info
        let assignmentRows;
        if (process.env.DB_TYPE === 'postgres') {
            assignmentRows = await query(`SELECT * FROM assignments WHERE id = $1`, [assignmentId]);
        } else {
            assignmentRows = await query(`SELECT * FROM assignments WHERE id = ?`, [assignmentId]);
        }

        if (assignmentRows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        const assignment = assignmentRows[0];

        // Fetch questions in assignment
        let questionRows;
        if (process.env.DB_TYPE === 'postgres') {
            questionRows = await query(`
                SELECT q.id, q.question_text, q.type, q.max_marks, aq.max_points
                FROM assignment_questions aq
                JOIN questions q ON aq.question_id = q.id
                WHERE aq.assignment_id = $1
            `, [assignmentId]);
        } else {
            questionRows = await query(`
                SELECT q.id, q.question_text, q.type, q.max_marks, aq.max_points
                FROM assignment_questions aq
                JOIN questions q ON aq.question_id = q.id
                WHERE aq.assignment_id = ?
            `, [assignmentId]);
        }

        // Fetch all submissions for assignment with student profiles
        let submissionRows;
        if (process.env.DB_TYPE === 'postgres') {
            submissionRows = await query(`
                SELECT s.*, p.full_name as student_name, u.email as student_email
                FROM submissions s
                JOIN users u ON s.student_id = u.id
                LEFT JOIN profiles p ON u.id = p.user_id
                WHERE s.assignment_id = $1
            `, [assignmentId]);
        } else {
            submissionRows = await query(`
                SELECT s.*, p.full_name as student_name, u.email as student_email
                FROM submissions s
                JOIN users u ON s.student_id = u.id
                LEFT JOIN profiles p ON u.id = p.user_id
                WHERE s.assignment_id = ?
            `, [assignmentId]);
        }

        // Calculate max total points available for this assignment
        const totalMaxPoints = questionRows.reduce((sum, q) => sum + (q.max_points || q.max_marks || 5), 0);

        // Group submissions by student
        const studentMap = {};

        submissionRows.forEach(sub => {
            if (!studentMap[sub.student_id]) {
                studentMap[sub.student_id] = {
                    student_id: sub.student_id,
                    student_name: sub.student_name || sub.student_email || 'Student',
                    student_email: sub.student_email,
                    total_marks: 0,
                    question_scores: {},
                    submissions: []
                };
            }

            const marks = sub.marks_awarded !== null ? sub.marks_awarded : 0;
            studentMap[sub.student_id].total_marks += marks;
            studentMap[sub.student_id].question_scores[sub.question_id] = marks;
            studentMap[sub.student_id].submissions.push(sub);
        });

        // Convert map to array and calculate ranks, percentages, and grades
        let studentList = Object.values(studentMap);

        // Sort descending by total marks for ranking
        studentList.sort((a, b) => b.total_marks - a.total_marks);

        studentList = studentList.map((st, idx) => {
            const percentage = totalMaxPoints > 0 ? parseFloat(((st.total_marks / totalMaxPoints) * 100).toFixed(1)) : 0;
            return {
                ...st,
                rank: idx + 1,
                max_total_marks: totalMaxPoints,
                percentage,
                grade: computeGrade(percentage)
            };
        });

        const classAverage = studentList.length > 0 
            ? parseFloat((studentList.reduce((sum, s) => sum + s.total_marks, 0) / studentList.length).toFixed(1))
            : 0;

        res.json({
            assignment: {
                id: assignment.id,
                title: assignment.title,
                instructions: assignment.instructions,
                due_date: assignment.due_date,
                total_max_points: totalMaxPoints
            },
            questions: questionRows,
            students: studentList,
            summary: {
                total_students: studentList.length,
                class_average: classAverage,
                highest_score: studentList.length > 0 ? studentList[0].total_marks : 0,
                lowest_score: studentList.length > 0 ? studentList[studentList.length - 1].total_marks : 0
            }
        });

    } catch (error) {
        console.error("Error generating consolidated report:", error);
        res.status(500).json({ error: 'Failed to generate consolidated report' });
    }
});

// GET /api/reports/assignment/:assignmentId/export/csv
router.get('/assignment/:assignmentId/export/csv', authenticate, authorize(['teacher', 'master']), async (req, res) => {
    const { assignmentId } = req.params;

    try {
        let questionRows, submissionRows, assignmentRows;
        if (process.env.DB_TYPE === 'postgres') {
            assignmentRows = await query(`SELECT title FROM assignments WHERE id = $1`, [assignmentId]);
            questionRows = await query(`
                SELECT q.id, q.question_text, aq.max_points FROM assignment_questions aq 
                JOIN questions q ON aq.question_id = q.id WHERE aq.assignment_id = $1
            `, [assignmentId]);
            submissionRows = await query(`
                SELECT s.*, p.full_name as student_name, u.email as student_email
                FROM submissions s
                JOIN users u ON s.student_id = u.id
                LEFT JOIN profiles p ON u.id = p.user_id
                WHERE s.assignment_id = $1
            `, [assignmentId]);
        } else {
            assignmentRows = await query(`SELECT title FROM assignments WHERE id = ?`, [assignmentId]);
            questionRows = await query(`
                SELECT q.id, q.question_text, aq.max_points FROM assignment_questions aq 
                JOIN questions q ON aq.question_id = q.id WHERE aq.assignment_id = ?
            `, [assignmentId]);
            submissionRows = await query(`
                SELECT s.*, p.full_name as student_name, u.email as student_email
                FROM submissions s
                JOIN users u ON s.student_id = u.id
                LEFT JOIN profiles p ON u.id = p.user_id
                WHERE s.assignment_id = ?
            `, [assignmentId]);
        }

        const title = assignmentRows[0] ? assignmentRows[0].title : 'Assignment';
        const maxTotal = questionRows.reduce((s, q) => s + (q.max_points || 5), 0);

        const studentMap = {};
        submissionRows.forEach(sub => {
            if (!studentMap[sub.student_id]) {
                studentMap[sub.student_id] = {
                    name: sub.student_name || sub.student_email || 'Student',
                    email: sub.student_email,
                    total: 0,
                    scores: {}
                };
            }
            const m = sub.marks_awarded !== null ? sub.marks_awarded : 0;
            studentMap[sub.student_id].total += m;
            studentMap[sub.student_id].scores[sub.question_id] = m;
        });

        let list = Object.values(studentMap).sort((a, b) => b.total - a.total);
        list = list.map((s, idx) => {
            const pct = maxTotal > 0 ? ((s.total / maxTotal) * 100).toFixed(1) : 0;
            return { ...s, rank: idx + 1, pct, grade: computeGrade(pct) };
        });

        // Build CSV string
        let csv = 'Rank,Student Name,Email,Total Marks,Max Marks,Percentage,Grade\n';
        list.forEach(item => {
            csv += `"${item.rank}","${item.name}","${item.email}",${item.total},${maxTotal},${item.pct}%,${item.grade}\n`;
        });

        res.setHeader('Content-disposition', `attachment; filename="Consolidated_Report_${encodeURIComponent(title)}.csv"`);
        res.setHeader('Content-type', 'text/csv');
        res.send(csv);

    } catch (error) {
        console.error("Error exporting CSV:", error);
        res.status(500).json({ error: 'Failed to export CSV report' });
    }
});

// GET /api/reports/assignment/:assignmentId/export/pdf
router.get('/assignment/:assignmentId/export/pdf', authenticate, authorize(['teacher', 'master']), async (req, res) => {
    const { assignmentId } = req.params;

    try {
        let questionRows, submissionRows, assignmentRows;
        if (process.env.DB_TYPE === 'postgres') {
            assignmentRows = await query(`SELECT title FROM assignments WHERE id = $1`, [assignmentId]);
            questionRows = await query(`
                SELECT q.id, q.question_text, aq.max_points FROM assignment_questions aq 
                JOIN questions q ON aq.question_id = q.id WHERE aq.assignment_id = $1
            `, [assignmentId]);
            submissionRows = await query(`
                SELECT s.*, p.full_name as student_name, u.email as student_email
                FROM submissions s
                JOIN users u ON s.student_id = u.id
                LEFT JOIN profiles p ON u.id = p.user_id
                WHERE s.assignment_id = $1
            `, [assignmentId]);
        } else {
            assignmentRows = await query(`SELECT title FROM assignments WHERE id = ?`, [assignmentId]);
            questionRows = await query(`
                SELECT q.id, q.question_text, aq.max_points FROM assignment_questions aq 
                JOIN questions q ON aq.question_id = q.id WHERE aq.assignment_id = ?
            `, [assignmentId]);
            submissionRows = await query(`
                SELECT s.*, p.full_name as student_name, u.email as student_email
                FROM submissions s
                JOIN users u ON s.student_id = u.id
                LEFT JOIN profiles p ON u.id = p.user_id
                WHERE s.assignment_id = ?
            `, [assignmentId]);
        }

        const title = assignmentRows[0] ? assignmentRows[0].title : 'Assignment';
        const maxTotal = questionRows.reduce((s, q) => s + (q.max_points || 5), 0);

        const studentMap = {};
        submissionRows.forEach(sub => {
            if (!studentMap[sub.student_id]) {
                studentMap[sub.student_id] = {
                    name: sub.student_name || sub.student_email || 'Student',
                    email: sub.student_email,
                    total: 0
                };
            }
            studentMap[sub.student_id].total += (sub.marks_awarded !== null ? sub.marks_awarded : 0);
        });

        let list = Object.values(studentMap).sort((a, b) => b.total - a.total);
        list = list.map((s, idx) => {
            const pct = maxTotal > 0 ? ((s.total / maxTotal) * 100).toFixed(1) : 0;
            return { ...s, rank: idx + 1, pct, grade: computeGrade(pct) };
        });

        const doc = new PDFDocument({ margin: 30 });
        res.setHeader('Content-disposition', `attachment; filename="Consolidated_Report_${encodeURIComponent(title)}.pdf"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        doc.fontSize(18).text(`Intemass Master Consolidated Report`, { align: 'center' });
        doc.fontSize(14).text(`Assignment: ${title}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Total Students: ${list.length} | Max Points: ${maxTotal} | Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();

        doc.fontSize(11).text(`Rank   Student Name                  Total   Max   Percentage   Grade`, { underline: true });
        doc.moveDown(0.5);

        list.forEach(st => {
            const rankStr = st.rank.toString().padEnd(6);
            const nameStr = st.name.padEnd(28).substring(0, 28);
            const totalStr = st.total.toString().padEnd(7);
            const maxStr = maxTotal.toString().padEnd(6);
            const pctStr = `${st.pct}%`.padEnd(12);
            doc.fontSize(10).text(`${rankStr}${nameStr}${totalStr}${maxStr}${pctStr}${st.grade}`);
        });

        doc.end();

    } catch (error) {
        console.error("Error exporting PDF:", error);
        res.status(500).json({ error: 'Failed to export PDF report' });
    }
});

module.exports = router;
