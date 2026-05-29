const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { query, execute } = require('../db/database');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');

const generateId = () => crypto.randomUUID();

// Generate PDF Feedback
router.get('/print-feedback/:submissionId', authenticate, authorize(['student', 'teacher', 'master']), async (req, res) => {
    const { submissionId } = req.params;

    try {
        let submissionRows;
        if (process.env.DB_TYPE === 'postgres') {
            submissionRows = await query(`
                SELECT s.*, q.question_text, a.title as assignment_title, p.full_name as student_name
                FROM submissions s
                JOIN questions q ON s.question_id = q.id
                JOIN assignments a ON s.assignment_id = a.id
                JOIN profiles p ON s.student_id = p.user_id
                WHERE s.id = $1
            `, [submissionId]);
        } else {
            submissionRows = await query(`
                SELECT s.*, q.question_text, a.title as assignment_title, p.full_name as student_name
                FROM submissions s
                JOIN questions q ON s.question_id = q.id
                JOIN assignments a ON s.assignment_id = a.id
                JOIN profiles p ON s.student_id = p.user_id
                WHERE s.id = ?
            `, [submissionId]);
        }

        if (submissionRows.length === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        const submission = submissionRows[0];

        // Ensure students can only print their own
        if (req.user.role === 'student' && submission.student_id !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Generate PDF
        const doc = new PDFDocument();
        let filename = encodeURIComponent(`Feedback_${submission.assignment_title}.pdf`);

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        doc.fontSize(20).text(`Feedback for: ${submission.assignment_title}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Student: ${submission.student_name}`);
        doc.text(`Submitted On: ${new Date(submission.submitted_at).toLocaleString()}`);
        doc.moveDown();

        doc.fontSize(16).text('Question:', { underline: true });
        doc.fontSize(12).text(submission.question_text);
        doc.moveDown();

        doc.fontSize(16).text('Your Answer:', { underline: true });
        doc.fontSize(12).text(submission.answer_text);
        doc.moveDown();

        doc.fontSize(16).text('Evaluation:', { underline: true });
        doc.fontSize(12).text(`Marks Awarded: ${submission.marks_awarded !== null ? submission.marks_awarded : 'Pending'}`);
        doc.text(`Feedback: ${submission.feedback || 'None provided yet'}`);

        doc.end();

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: 'Internal server error while generating PDF' });
    }
});

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

const util = require('util');
const execProc = util.promisify(require('child_process').exec);

// Submit answer to a question (Student)
router.post('/', authenticate, authorize('student'), upload.single('file'), async (req, res) => {
    const { assignmentId, questionId, answerText } = req.body;
    const file = req.file;

    if (!assignmentId || !questionId) {
        return res.status(400).json({ error: 'Assignment ID and Question ID are required' });
    }

    const fileUrl = file ? `/uploads/${file.filename}` : null;
    let extractedUrl = null;
    let ocrText = null;
    let topologyJson = null;

    if (file) {
        const inputPath = path.join(__dirname, '..', 'uploads', file.filename);
        const extractedFilename = 'extracted_' + file.filename;
        const extractedPath = path.join(__dirname, '..', 'uploads', extractedFilename);
        const scriptPath = path.join(__dirname, '..', '..', 'ml_service', 'extract.py');
        const pyCmd = process.platform === 'win32' ? 'python' : 'python3';
        try {
            const { stdout } = await execProc(`${pyCmd} "${scriptPath}" "${inputPath}" "${extractedPath}"`);
            if (stdout.includes('SUCCESS')) {
                extractedUrl = `/uploads/${extractedFilename}`;
            }
            const textPath = path.join(__dirname, '..', 'uploads', extractedFilename.replace('.png', '_text.txt'));
            if (fs.existsSync(textPath)) {
                ocrText = fs.readFileSync(textPath, 'utf8');
            }
            const topoPath = path.join(__dirname, '..', 'uploads', extractedFilename.replace('.png', '_topo.json'));
            if (fs.existsSync(topoPath)) {
                topologyJson = fs.readFileSync(topoPath, 'utf8');
            }
        } catch (err) {
            console.error("Extraction error:", err);
        }
    }

    try {
        let submissionId;

        // ------------------ FREE AUTO-GRADING NLP PIPELINE ------------------
        let marksAwarded = null;
        let qMaxMarks = 5; // Default capacity fallback
        let stdAns = "";

        if (process.env.DB_TYPE === 'postgres') {
            const qResult = await execute("SELECT standard_answer, max_marks FROM questions WHERE id = $1", [questionId]);
            if (qResult.rows.length > 0) {
                stdAns = qResult.rows[0].standard_answer || "";
                qMaxMarks = qResult.rows[0].max_marks || 5;
            }
        } else {
            const qResult = await execute("SELECT standard_answer, max_marks FROM questions WHERE id = ?", [questionId]);
            if (qResult.length > 0) {
                stdAns = qResult[0].standard_answer || "";
                qMaxMarks = qResult[0].max_marks || 5;
            }
        }

        const studentFinalText = ocrText ? ocrText.trim() : (answerText ? answerText.trim() : "");
        
        let stdAnsClean = stdAns.replace(/<[^>]+>/g, ' ').trim();
        let studentTextClean = studentFinalText.replace(/<[^>]+>/g, ' ').trim();

        if (stdAnsClean && studentTextClean) {
            const { execFile } = require('child_process');
            const path = require('path');
            
            const pythonResult = await new Promise((resolve) => {
                const pythonArgs = [
                    path.join(__dirname, '../grading_engine.py'),
                    JSON.stringify({
                        student_answer: studentTextClean,
                        model_answer: stdAnsClean,
                        max_marks: qMaxMarks
                    })
                ];
                
                execFile('python3', pythonArgs, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Python Error:', error);
                        console.error('Stderr:', stderr);
                        resolve({ score: 0, feedback: null });
                    } else {
                        try {
                            const parsed = JSON.parse(stdout);
                            if (parsed.success && parsed.data) {
                                resolve({ score: parsed.data.score, feedback: JSON.stringify(parsed.data) });
                            } else {
                                console.error('Python Script Error:', parsed.error);
                                resolve({ score: 0, feedback: null });
                            }
                        } catch (e) {
                            console.error('Failed to parse Python stdout:', stdout);
                            resolve({ score: 0, feedback: null });
                        }
                    }
                });
            });
            
            marksAwarded = pythonResult.score;
            // Store feedback in the feedback column if it exists in schema
            var advancedFeedback = pythonResult.feedback;
        } else {
            marksAwarded = 0;
            var advancedFeedback = null;
        }
        // ----------------------------------------------------------------------

        if (process.env.DB_TYPE === 'postgres') {
            const result = await execute(
                "INSERT INTO submissions(student_id, assignment_id, question_id, answer_text, file_url, extracted_diagram_url, ocr_text, topology_json, feedback, marks_awarded) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id",
                [req.user.id, assignmentId, questionId, answerText || null, fileUrl, extractedUrl, ocrText, topologyJson, advancedFeedback, marksAwarded]
            );
            submissionId = result.rows[0].id;
            if (marksAwarded !== null) {
                await execute("UPDATE submissions SET marked_at = NOW() WHERE id = $1", [submissionId]);
            }
        } else {
            submissionId = generateId();
            await execute(
                "INSERT INTO submissions(id, student_id, assignment_id, question_id, answer_text, file_url, extracted_diagram_url, ocr_text, topology_json, feedback, marks_awarded) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [submissionId, req.user.id, assignmentId, questionId, answerText || null, fileUrl, extractedUrl, ocrText, topologyJson, advancedFeedback, marksAwarded]
            );
            if (marksAwarded !== null) {
                await execute("UPDATE submissions SET marked_at = CURRENT_TIMESTAMP WHERE id = ?", [submissionId]);
            }
        }

        res.status(201).json({
            message: 'Submitted successfully',
            submissionId,
            marksAwarded,
            ocrText,
            extractedUrl,
            topologyJson
        });
    } catch (error) {
        console.error("Error creating submission:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update marks and feedback (Teacher)
router.patch('/:id/mark', authenticate, authorize('teacher'), async (req, res) => {
    const { id } = req.params;
    const { marks, feedback } = req.body;

    try {
        if (process.env.DB_TYPE === 'postgres') {
            await execute(
                "UPDATE submissions SET marks_awarded = $1, feedback = $2, marked_by = $3, marked_at = NOW() WHERE id = $4",
                [marks, feedback, req.user.id, id]
            );
        } else {
            const now = new Date().toISOString();
            await execute(
                "UPDATE submissions SET marks_awarded = ?, feedback = ?, marked_by = ?, marked_at = ? WHERE id = ?",
                [marks, feedback, req.user.id, now, id]
            );
        }
        res.json({ message: 'Submission marked successfully' });
    } catch (error) {
        console.error("Error marking submission:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get student's own submissions
router.get('/student/my_submissions', authenticate, authorize('student'), async (req, res) => {
    try {
        let submissions;
        if (process.env.DB_TYPE === 'postgres') {
            submissions = await query(`
                SELECT s.id, s.assignment_id, s.marks_awarded, a.title as assignment_title
                FROM submissions s
                JOIN assignments a ON s.assignment_id = a.id
                WHERE s.student_id = $1
                ORDER BY s.submitted_at DESC
            `, [req.user.id]);
        } else {
            submissions = await query(`
                SELECT s.id, s.assignment_id, s.marks_awarded, a.title as assignment_title
                FROM submissions s
                JOIN assignments a ON s.assignment_id = a.id
                WHERE s.student_id = ?
                ORDER BY s.submitted_at DESC
            `, [req.user.id]);
        }
        res.json(submissions);
    } catch (error) {
        console.error("Error fetching student submissions:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Retrieve a submission
router.get('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    try {
        let submissionRows;
        if (process.env.DB_TYPE === 'postgres') {
            submissionRows = await query(`
                SELECT s.*, p.full_name as student_name, q.question_text, q.standard_answer, q.max_marks, s.topology_json, a.title as assignment_title
                FROM submissions s
                JOIN profiles p ON s.student_id = p.user_id
                JOIN questions q ON s.question_id = q.id 
                JOIN assignments a ON s.assignment_id = a.id
                WHERE s.id = $1
            `, [id]);
        } else {
            submissionRows = await query(`
                SELECT s.*, p.full_name as student_name, q.question_text, q.standard_answer, q.max_marks, s.topology_json, a.title as assignment_title
                FROM submissions s
                JOIN profiles p ON s.student_id = p.user_id
                JOIN questions q ON s.question_id = q.id 
                JOIN assignments a ON s.assignment_id = a.id
                WHERE s.id = ?
            `, [id]);
        }

        if (submissionRows.length === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        // Only owner or teachers can see
        if (req.user.role === 'student' && submissionRows[0].student_id !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        res.json(submissionRows[0]);
    } catch (error) {
        console.error("Error retrieving submission:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
