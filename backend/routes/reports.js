const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { query, execute } = require('../db/database');
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

// Security helper: enforce strict school isolation
// Teachers and students can ONLY access their own school. Master admin can access any school.
const verifySchoolAccess = (req, requestedSchoolId) => {
    if (req.user && req.user.role === 'master') return true;
    const userSchoolId = req.user ? (req.user.school_id || 'sch-mf-001') : null;
    return userSchoolId === requestedSchoolId;
};

// ---------------------------------------------------------------------------
// 1. GET /api/reports/schools
// Returns accessible schools (all schools for master admin; own school for teacher/student)
// ---------------------------------------------------------------------------
router.get('/schools', authenticate, async (req, res) => {
    try {
        let schools;
        if (req.user.role === 'master') {
            schools = await query(`
                SELECT s.*, 
                       (SELECT COUNT(*) FROM users u WHERE u.school_id = s.id AND u.role = 'student') as student_count,
                       (SELECT COUNT(*) FROM assignments a WHERE a.school_id = s.id) as assignment_count,
                       (SELECT COUNT(*) FROM submissions sub WHERE sub.school_id = s.id) as submission_count
                FROM schools s
                ORDER BY s.name ASC
            `);
        } else {
            const userSchoolId = req.user.school_id || 'sch-mf-001';
            schools = await query(`
                SELECT s.*, 
                       (SELECT COUNT(*) FROM users u WHERE u.school_id = s.id AND u.role = 'student') as student_count,
                       (SELECT COUNT(*) FROM assignments a WHERE a.school_id = s.id) as assignment_count,
                       (SELECT COUNT(*) FROM submissions sub WHERE sub.school_id = s.id) as submission_count
                FROM schools s
                WHERE s.id = $1
            `, [userSchoolId]);
        }
        res.json(schools || []);
    } catch (error) {
        console.error("Error fetching schools for reports:", error);
        res.status(500).json({ error: 'Failed to fetch school list' });
    }
});

// ---------------------------------------------------------------------------
// 2. GET /api/reports/school/:schoolId/master
// Generates the whole-school master report aggregating all students in that school
// ---------------------------------------------------------------------------
router.get('/school/:schoolId/master', authenticate, authorize(['teacher', 'master']), async (req, res) => {
    const { schoolId } = req.params;
    const { subject, assignmentId } = req.query;

    if (!verifySchoolAccess(req, schoolId)) {
        return res.status(403).json({
            error: 'Forbidden: Access denied. You do not have permission to view reports for this school. Different schools have completely separated data.'
        });
    }

    try {
        // Fetch school details
        const schoolRows = await query(`SELECT * FROM schools WHERE id = $1`, [schoolId]);
        if (schoolRows.length === 0) {
            return res.status(404).json({ error: 'School not found' });
        }
        const school = schoolRows[0];

        // Fetch students in this school
        const studentRows = await query(`
            SELECT u.id, u.email, p.full_name, p.roll_number, p.class_name
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.school_id = $1 AND u.role = 'student'
            ORDER BY p.roll_number ASC, p.full_name ASC
        `, [schoolId]);

        // Fetch assignments for this school
        let assignmentSql = `SELECT id, title, subject, sub_category, due_date FROM assignments WHERE school_id = $1`;
        const assignmentParams = [schoolId];
        if (assignmentId) {
            assignmentSql += ` AND id = $2`;
            assignmentParams.push(assignmentId);
        } else if (subject && subject !== 'All') {
            assignmentSql += ` AND subject = $2`;
            assignmentParams.push(subject);
        }
        const assignments = await query(assignmentSql, assignmentParams);

        // Fetch questions and point maxima for these assignments
        const assignmentIds = assignments.map(a => a.id);
        let maxPointsByAssignment = {};
        let questionMap = {};

        if (assignmentIds.length > 0) {
            const placeholders = assignmentIds.map((_, i) => `$${i + 1}`).join(',');
            const aqRows = await query(`
                SELECT aq.assignment_id, aq.question_id, aq.max_points, q.question_text, q.subject, q.sub_category, q.max_marks
                FROM assignment_questions aq
                JOIN questions q ON aq.question_id = q.id
                WHERE aq.assignment_id IN (${placeholders})
            `, assignmentIds);

            aqRows.forEach(aq => {
                const pts = aq.max_points || aq.max_marks || 10;
                maxPointsByAssignment[aq.assignment_id] = (maxPointsByAssignment[aq.assignment_id] || 0) + pts;
                questionMap[aq.question_id] = {
                    id: aq.question_id,
                    text: aq.question_text,
                    subject: aq.subject,
                    sub_category: aq.sub_category,
                    max_points: pts
                };
            });
        }

        // Fetch all submissions strictly belonging to this school
        let submissionSql = `
            SELECT s.id, s.student_id, s.assignment_id, s.question_id, s.marks_awarded, s.feedback, s.submitted_at,
                   a.title as assignment_title, a.subject as assignment_subject
            FROM submissions s
            JOIN assignments a ON s.assignment_id = a.id
            WHERE s.school_id = $1
        `;
        const submissionParams = [schoolId];
        if (assignmentId) {
            submissionSql += ` AND s.assignment_id = $2`;
            submissionParams.push(assignmentId);
        } else if (subject && subject !== 'All') {
            submissionSql += ` AND a.subject = $2`;
            submissionParams.push(subject);
        }
        const submissions = await query(submissionSql, submissionParams);

        // Calculate total possible marks for the evaluated scope
        const totalSchoolMaxMarks = assignments.reduce((sum, a) => sum + (maxPointsByAssignment[a.id] || 100), 0);

        // Group submissions by student
        const studentStats = {};
        studentRows.forEach(st => {
            studentStats[st.id] = {
                student_id: st.id,
                student_name: st.full_name || st.email.split('@')[0],
                student_email: st.email,
                roll_number: st.roll_number || 'N/A',
                class_name: st.class_name || 'General Batch',
                total_marks: 0,
                max_total_marks: totalSchoolMaxMarks > 0 ? totalSchoolMaxMarks : 100,
                assignments_taken: new Set(),
                subject_scores: {},
                question_scores: {},
                submissions_count: 0
            };
        });

        // Question performance accumulator for weakness analytics
        const questionStats = {};

        submissions.forEach(sub => {
            if (!studentStats[sub.student_id]) {
                studentStats[sub.student_id] = {
                    student_id: sub.student_id,
                    student_name: 'Student',
                    student_email: 'unknown',
                    roll_number: 'N/A',
                    class_name: 'General',
                    total_marks: 0,
                    max_total_marks: totalSchoolMaxMarks > 0 ? totalSchoolMaxMarks : 100,
                    assignments_taken: new Set(),
                    subject_scores: {},
                    question_scores: {},
                    submissions_count: 0
                };
            }

            const marks = sub.marks_awarded !== null ? sub.marks_awarded : 0;
            const targetStudent = studentStats[sub.student_id];
            targetStudent.total_marks += marks;
            targetStudent.submissions_count += 1;
            targetStudent.assignments_taken.add(sub.assignment_id);

            // By subject
            const subj = sub.assignment_subject || 'General';
            if (!targetStudent.subject_scores[subj]) {
                targetStudent.subject_scores[subj] = { score: 0, count: 0 };
            }
            targetStudent.subject_scores[subj].score += marks;
            targetStudent.subject_scores[subj].count += 1;

            // Question weakness tracking
            if (!questionStats[sub.question_id]) {
                questionStats[sub.question_id] = {
                    question_id: sub.question_id,
                    question_text: questionMap[sub.question_id] ? questionMap[sub.question_id].text : 'Question',
                    subject: sub.assignment_subject,
                    total_marks: 0,
                    max_marks: questionMap[sub.question_id] ? questionMap[sub.question_id].max_points : 10,
                    attempt_count: 0
                };
            }
            questionStats[sub.question_id].total_marks += marks;
            questionStats[sub.question_id].attempt_count += 1;
        });

        // Convert studentStats to array and rank them
        let rankedStudents = Object.values(studentStats).map(st => {
            const maxM = st.max_total_marks > 0 ? st.max_total_marks : 100;
            const percentage = parseFloat(((st.total_marks / maxM) * 100).toFixed(1));
            return {
                student_id: st.student_id,
                student_name: st.student_name,
                student_email: st.student_email,
                roll_number: st.roll_number,
                class_name: st.class_name,
                total_marks: st.total_marks,
                max_total_marks: maxM,
                percentage,
                grade: computeGrade(percentage),
                modules_completed: st.assignments_taken.size,
                submissions_count: st.submissions_count,
                has_submitted: st.submissions_count > 0
            };
        });

        // Sort descending by total marks
        rankedStudents.sort((a, b) => b.total_marks - a.total_marks);
        rankedStudents = rankedStudents.map((st, idx) => ({ ...st, rank: idx + 1 }));

        // School Summary Calculations
        const evaluatedStudents = rankedStudents.filter(s => s.has_submitted);
        const totalEnrolled = rankedStudents.length;
        const totalEvaluated = evaluatedStudents.length;

        const schoolAverageScore = totalEvaluated > 0
            ? parseFloat((evaluatedStudents.reduce((sum, s) => sum + s.total_marks, 0) / totalEvaluated).toFixed(1))
            : 0;

        const schoolAveragePct = totalEvaluated > 0
            ? parseFloat((evaluatedStudents.reduce((sum, s) => sum + s.percentage, 0) / totalEvaluated).toFixed(1))
            : 0;

        const passingCount = evaluatedStudents.filter(s => s.percentage >= 50).length;
        const passRate = totalEvaluated > 0
            ? parseFloat(((passingCount / totalEvaluated) * 100).toFixed(1))
            : 0;

        // Grade Distribution
        const gradeDistribution = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
        evaluatedStudents.forEach(s => {
            if (gradeDistribution[s.grade] !== undefined) {
                gradeDistribution[s.grade]++;
            }
        });

        // Subject Breakdown
        const subjectMap = {};
        assignments.forEach(a => {
            const subj = a.subject || 'General';
            if (!subjectMap[subj]) {
                subjectMap[subj] = { subject: subj, assignment_count: 0, total_submissions: 0, total_score: 0 };
            }
            subjectMap[subj].assignment_count++;
        });

        submissions.forEach(sub => {
            const subj = sub.assignment_subject || 'General';
            if (subjectMap[subj]) {
                subjectMap[subj].total_submissions++;
                subjectMap[subj].total_score += (sub.marks_awarded || 0);
            }
        });

        const subjectBreakdown = Object.values(subjectMap).map(sb => ({
            subject: sb.subject,
            assignment_count: sb.assignment_count,
            total_submissions: sb.total_submissions,
            average_score: sb.total_submissions > 0 ? parseFloat((sb.total_score / sb.total_submissions).toFixed(1)) : 0
        }));

        // Topic / Question Weakness Analytics (lowest average % across school)
        const topicWeaknesses = Object.values(questionStats).map(q => {
            const avgPct = q.attempt_count > 0 && q.max_marks > 0
                ? parseFloat(((q.total_marks / (q.attempt_count * q.max_marks)) * 100).toFixed(1))
                : 0;
            return {
                question_id: q.question_id,
                question_text: q.question_text.length > 80 ? q.question_text.substring(0, 80) + '...' : q.question_text,
                subject: q.subject,
                attempts: q.attempt_count,
                average_percentage: avgPct,
                needs_intervention: avgPct < 60
            };
        }).sort((a, b) => a.average_percentage - b.average_percentage).slice(0, 5);

        res.json({
            school: {
                id: school.id,
                name: school.name,
                code: school.code,
                address: school.address,
                contact_email: school.contact_email
            },
            summary: {
                total_enrolled_students: totalEnrolled,
                total_evaluated_students: totalEvaluated,
                total_submissions: submissions.length,
                total_assignments: assignments.length,
                school_average_score: schoolAverageScore,
                school_average_percentage: schoolAveragePct,
                pass_rate: passRate,
                highest_percentage: evaluatedStudents.length > 0 ? evaluatedStudents[0].percentage : 0,
                lowest_percentage: evaluatedStudents.length > 0 ? evaluatedStudents[evaluatedStudents.length - 1].percentage : 0,
                grade_distribution: gradeDistribution
            },
            subject_breakdown: subjectBreakdown,
            topic_weaknesses: topicWeaknesses,
            students: rankedStudents,
            assignments: assignments
        });

    } catch (error) {
        console.error("Error generating School Master Report:", error);
        res.status(500).json({ error: 'Failed to generate school master report: ' + error.message });
    }
});

// ---------------------------------------------------------------------------
// 3. GET /api/reports/school/:schoolId/student/:studentId
// Generates Individual Student Report Card scoped strictly to their school
// ---------------------------------------------------------------------------
router.get('/school/:schoolId/student/:studentId', authenticate, async (req, res) => {
    const { schoolId, studentId } = req.params;

    // Check school access
    if (!verifySchoolAccess(req, schoolId)) {
        return res.status(403).json({
            error: 'Forbidden: Access denied. You cannot view student reports from other schools.'
        });
    }

    // If student role, they can only view their own report
    if (req.user.role === 'student' && req.user.id !== studentId) {
        return res.status(403).json({ error: 'Forbidden: You can only view your own student report.' });
    }

    try {
        // Fetch student profile and verify school
        const studentRows = await query(`
            SELECT u.id, u.email, u.school_id, p.full_name, p.roll_number, p.class_name, p.institution,
                   s.name as school_name, s.code as school_code, s.address as school_address
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            LEFT JOIN schools s ON u.school_id = s.id
            WHERE u.id = $1
        `, [studentId]);

        if (studentRows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const student = studentRows[0];
        if (student.school_id !== schoolId) {
            return res.status(403).json({ error: 'Forbidden: Student does not belong to this school.' });
        }

        // Fetch all assignments for this school
        const assignments = await query(`
            SELECT id, title, subject, sub_category, due_date, created_at
            FROM assignments
            WHERE school_id = $1
            ORDER BY created_at DESC
        `, [schoolId]);

        // Fetch all submissions by this student for this school
        const submissions = await query(`
            SELECT s.*, q.question_text, q.type as question_type, q.max_marks,
                   a.title as assignment_title, a.subject as assignment_subject
            FROM submissions s
            JOIN questions q ON s.question_id = q.id
            JOIN assignments a ON s.assignment_id = a.id
            WHERE s.student_id = $1 AND s.school_id = $2
            ORDER BY s.submitted_at DESC
        `, [studentId, schoolId]);

        // Compute school benchmark (school average %)
        const allSchoolSubs = await query(`
            SELECT marks_awarded, question_id FROM submissions WHERE school_id = $1 AND marks_awarded IS NOT NULL
        `, [schoolId]);
        const schoolAvgScore = allSchoolSubs.length > 0
            ? parseFloat((allSchoolSubs.reduce((sum, s) => sum + s.marks_awarded, 0) / allSchoolSubs.length).toFixed(1))
            : 0;

        // Group submissions by assignment
        const assignmentMap = {};
        assignments.forEach(a => {
            assignmentMap[a.id] = {
                assignment_id: a.id,
                title: a.title,
                subject: a.subject,
                sub_category: a.sub_category,
                due_date: a.due_date,
                status: 'pending',
                total_marks: 0,
                max_points: 0,
                submissions: []
            };
        });

        let studentTotalMarks = 0;
        let studentTotalMaxPoints = 0;

        submissions.forEach(sub => {
            const aId = sub.assignment_id;
            if (!assignmentMap[aId]) {
                assignmentMap[aId] = {
                    assignment_id: aId,
                    title: sub.assignment_title,
                    subject: sub.assignment_subject,
                    status: 'completed',
                    total_marks: 0,
                    max_points: 0,
                    submissions: []
                };
            }

            const marks = sub.marks_awarded !== null ? sub.marks_awarded : 0;
            const maxM = sub.max_marks || 10;

            assignmentMap[aId].status = 'completed';
            assignmentMap[aId].total_marks += marks;
            assignmentMap[aId].max_points += maxM;
            assignmentMap[aId].submissions.push(sub);

            studentTotalMarks += marks;
            studentTotalMaxPoints += maxM;
        });

        const overallPercentage = studentTotalMaxPoints > 0
            ? parseFloat(((studentTotalMarks / studentTotalMaxPoints) * 100).toFixed(1))
            : 0;
        const overallGrade = computeGrade(overallPercentage);

        // Calculate School Rank for this student
        const schoolRankRows = await query(`
            SELECT s.student_id, SUM(COALESCE(s.marks_awarded, 0)) as total
            FROM submissions s
            WHERE s.school_id = $1
            GROUP BY s.student_id
            ORDER BY total DESC
        `, [schoolId]);

        const rankIndex = schoolRankRows.findIndex(r => r.student_id === studentId);
        const rank = rankIndex >= 0 ? rankIndex + 1 : schoolRankRows.length + 1;

        res.json({
            student: {
                id: student.id,
                email: student.email,
                name: student.full_name || student.email.split('@')[0],
                roll_number: student.roll_number || 'N/A',
                class_name: student.class_name || 'General Cohort',
                school_id: student.school_id,
                school_name: student.school_name || 'MegaForte Academy',
                school_code: student.school_code || 'MF-SG'
            },
            performance: {
                total_marks: studentTotalMarks,
                max_total_marks: studentTotalMaxPoints,
                overall_percentage: overallPercentage,
                overall_grade: overallGrade,
                school_rank: rank,
                total_peers_in_school: schoolRankRows.length,
                school_average_benchmark: schoolAvgScore,
                performance_vs_school: overallPercentage >= 50 ? 'Above Average' : 'Needs Reinforcement'
            },
            assignments: Object.values(assignmentMap),
            detailed_submissions: submissions
        });

    } catch (error) {
        console.error("Error generating Individual Student Report:", error);
        res.status(500).json({ error: 'Failed to generate individual student report: ' + error.message });
    }
});

// ---------------------------------------------------------------------------
// 4. GET /api/reports/school/:schoolId/master/export/csv
// Exports School Master Report to CSV with strict school isolation
// ---------------------------------------------------------------------------
router.get('/school/:schoolId/master/export/csv', authenticate, authorize(['teacher', 'master']), async (req, res) => {
    const { schoolId } = req.params;

    if (!verifySchoolAccess(req, schoolId)) {
        return res.status(403).json({ error: 'Forbidden: Access denied to other school reports.' });
    }

    try {
        const schoolRows = await query(`SELECT * FROM schools WHERE id = $1`, [schoolId]);
        const school = schoolRows[0] || { name: 'School', code: 'SCH' };

        const studentRows = await query(`
            SELECT u.id, u.email, p.full_name, p.roll_number, p.class_name,
                   COALESCE(SUM(s.marks_awarded), 0) as total_marks,
                   COUNT(s.id) as sub_count
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            LEFT JOIN submissions s ON (u.id = s.student_id AND s.school_id = $1)
            WHERE u.school_id = $1 AND u.role = 'student'
            GROUP BY u.id
            ORDER BY total_marks DESC
        `, [schoolId]);

        let csv = `School: "${school.name}",Code: "${school.code}",Export Date: "${new Date().toISOString()}"\n\n`;
        csv += 'Rank,Roll Number,Student Name,Email,Class,Total Marks,Percentage,Grade\n';

        studentRows.forEach((st, idx) => {
            const maxM = 100;
            const pct = ((st.total_marks / maxM) * 100).toFixed(1);
            const grade = computeGrade(pct);
            csv += `"${idx + 1}","${st.roll_number || 'N/A'}","${st.full_name || 'Student'}","${st.email}","${st.class_name || 'General'}",${st.total_marks},${pct}%,${grade}\n`;
        });

        res.setHeader('Content-disposition', `attachment; filename="Master_Report_${encodeURIComponent(school.code)}_${Date.now()}.csv"`);
        res.setHeader('Content-type', 'text/csv');
        res.send(csv);

    } catch (error) {
        console.error("Error exporting school CSV:", error);
        res.status(500).json({ error: 'Failed to export CSV' });
    }
});

// ---------------------------------------------------------------------------
// 5. GET /api/reports/school/:schoolId/master/export/pdf
// Exports School Master Report to PDF with official header and statistics
// ---------------------------------------------------------------------------
router.get('/school/:schoolId/master/export/pdf', authenticate, authorize(['teacher', 'master']), async (req, res) => {
    const { schoolId } = req.params;

    if (!verifySchoolAccess(req, schoolId)) {
        return res.status(403).json({ error: 'Forbidden: Access denied to other school reports.' });
    }

    try {
        const schoolRows = await query(`SELECT * FROM schools WHERE id = $1`, [schoolId]);
        const school = schoolRows[0] || { name: 'School', code: 'SCH', address: 'Campus' };

        const studentRows = await query(`
            SELECT u.id, u.email, p.full_name, p.roll_number, p.class_name,
                   COALESCE(SUM(s.marks_awarded), 0) as total_marks,
                   COUNT(s.id) as sub_count
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            LEFT JOIN submissions s ON (u.id = s.student_id AND s.school_id = $1)
            WHERE u.school_id = $1 AND u.role = 'student'
            GROUP BY u.id
            ORDER BY total_marks DESC
        `, [schoolId]);

        const totalStudents = studentRows.length;
        const totalScore = studentRows.reduce((sum, s) => sum + s.total_marks, 0);
        const schoolAvg = totalStudents > 0 ? (totalScore / totalStudents).toFixed(1) : 0;

        const doc = new PDFDocument({ margin: 36 });
        res.setHeader('Content-disposition', `attachment; filename="Master_Report_${encodeURIComponent(school.code)}.pdf"`);
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);

        // Header
        doc.fontSize(20).text(school.name, { align: 'center' });
        doc.fontSize(11).text(`School Code: ${school.code} | ${school.address || ''}`, { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(14).text(`WHOLE-SCHOOL MASTER CONSOLIDATED REPORT`, { align: 'center', underline: true });
        doc.moveDown();

        // Stats summary block
        doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()} | Total Students: ${totalStudents} | Cohort Average: ${schoolAvg} pts | Status: Multi-Tenant Isolated`);
        doc.moveDown();

        // Table Header
        doc.fontSize(10).text(`Rank   Roll No    Student Name                   Email                           Total   Grade`, { underline: true });
        doc.moveDown(0.5);

        studentRows.forEach((st, idx) => {
            const rankStr = `#${idx + 1}`.padEnd(7);
            const rollStr = (st.roll_number || '-').padEnd(11);
            const nameStr = (st.full_name || 'Student').padEnd(31).substring(0, 30);
            const emailStr = st.email.padEnd(32).substring(0, 31);
            const totalStr = `${st.total_marks}`.padEnd(8);
            const grade = computeGrade(st.total_marks);
            doc.fontSize(9).text(`${rankStr}${rollStr}${nameStr}${emailStr}${totalStr}${grade}`);
        });

        doc.end();

    } catch (error) {
        console.error("Error exporting school PDF:", error);
        res.status(500).json({ error: 'Failed to export PDF' });
    }
});

// ---------------------------------------------------------------------------
// 6. GET /api/reports/school/:schoolId/student/:studentId/export/pdf
// Exports Individual Student Report Card to PDF
// ---------------------------------------------------------------------------
router.get('/school/:schoolId/student/:studentId/export/pdf', authenticate, async (req, res) => {
    const { schoolId, studentId } = req.params;

    if (!verifySchoolAccess(req, schoolId)) {
        return res.status(403).json({ error: 'Forbidden: Access denied to other school reports.' });
    }
    if (req.user.role === 'student' && req.user.id !== studentId) {
        return res.status(403).json({ error: 'Forbidden: You can only export your own report.' });
    }

    try {
        const studentRows = await query(`
            SELECT u.id, u.email, p.full_name, p.roll_number, p.class_name,
                   s.name as school_name, s.code as school_code
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            LEFT JOIN schools s ON u.school_id = s.id
            WHERE u.id = $1 AND u.school_id = $2
        `, [studentId, schoolId]);

        if (studentRows.length === 0) {
            return res.status(404).json({ error: 'Student record not found in this school' });
        }
        const student = studentRows[0];

        const subs = await query(`
            SELECT s.*, q.question_text, q.max_marks, a.title as assignment_title
            FROM submissions s
            JOIN questions q ON s.question_id = q.id
            JOIN assignments a ON s.assignment_id = a.id
            WHERE s.student_id = $1 AND s.school_id = $2
        `, [studentId, schoolId]);

        const totalEarned = subs.reduce((sum, s) => sum + (s.marks_awarded || 0), 0);
        const totalMax = subs.reduce((sum, s) => sum + (s.max_marks || 10), 0);
        const pct = totalMax > 0 ? ((totalEarned / totalMax) * 100).toFixed(1) : 0;
        const grade = computeGrade(pct);

        const doc = new PDFDocument({ margin: 36 });
        res.setHeader('Content-disposition', `attachment; filename="Student_Report_${encodeURIComponent(student.roll_number || student.email)}.pdf"`);
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);

        doc.fontSize(18).text(student.school_name || 'Academic Institution', { align: 'center' });
        doc.fontSize(10).text(`School Code: ${student.school_code || 'N/A'}`, { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(14).text(`INDIVIDUAL STUDENT PERFORMANCE REPORT CARD`, { align: 'center', underline: true });
        doc.moveDown();

        doc.fontSize(10).text(`Student Name: ${student.full_name || 'Student'}`);
        doc.text(`Roll Number:  ${student.roll_number || 'N/A'}`);
        doc.text(`Class/Cohort: ${student.class_name || 'General'}`);
        doc.text(`Email:        ${student.email}`);
        doc.moveDown(0.5);

        doc.fontSize(11).text(`Overall Score: ${totalEarned} / ${totalMax} (${pct}%)   |   Grade: ${grade}   |   Evaluation Status: Complete`, { underline: true });
        doc.moveDown();

        doc.fontSize(11).text('Assessment & Question Breakdown:', { underline: true });
        doc.moveDown(0.5);

        subs.forEach((sub, i) => {
            doc.fontSize(10).text(`${i + 1}. Assessment: ${sub.assignment_title}`);
            doc.fontSize(9).text(`   Question: ${(sub.question_text || '').substring(0, 100)}...`);
            doc.text(`   Score: ${sub.marks_awarded !== null ? sub.marks_awarded : 0} / ${sub.max_marks || 10} pts`);
            doc.text(`   Feedback: ${sub.feedback || 'Evaluated successfully'}`);
            doc.moveDown(0.5);
        });

        doc.end();

    } catch (error) {
        console.error("Error exporting student report PDF:", error);
        res.status(500).json({ error: 'Failed to export student PDF' });
    }
});

// ---------------------------------------------------------------------------
// 7. Backward compatibility endpoint: GET /api/reports/assignment/:assignmentId/consolidated
// ---------------------------------------------------------------------------
router.get('/assignment/:assignmentId/consolidated', authenticate, authorize(['teacher', 'master']), async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const assignmentRows = await query(`SELECT * FROM assignments WHERE id = $1`, [assignmentId]);
        if (assignmentRows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        const assignment = assignmentRows[0];

        // School isolation check
        if (assignment.school_id && !verifySchoolAccess(req, assignment.school_id)) {
            return res.status(403).json({ error: 'Forbidden: Access denied to assignments from other schools.' });
        }

        const questionRows = await query(`
            SELECT q.id, q.question_text, q.type, q.max_marks, aq.max_points
            FROM assignment_questions aq
            JOIN questions q ON aq.question_id = q.id
            WHERE aq.assignment_id = $1
        `, [assignmentId]);

        const submissionRows = await query(`
            SELECT s.*, p.full_name as student_name, u.email as student_email
            FROM submissions s
            JOIN users u ON s.student_id = u.id
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE s.assignment_id = $1
        `, [assignmentId]);

        const totalMaxPoints = questionRows.reduce((sum, q) => sum + (q.max_points || q.max_marks || 5), 0);
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

        let studentList = Object.values(studentMap);
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

module.exports = router;
