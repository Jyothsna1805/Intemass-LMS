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
            const qResult = await query("SELECT standard_answer, max_marks FROM questions WHERE id = $1", [questionId]);
            if (qResult.length > 0) {
                stdAns = qResult[0].standard_answer || "";
                qMaxMarks = qResult[0].max_marks || 5;
            }
        } else {
            const qResult = await query("SELECT standard_answer, max_marks FROM questions WHERE id = ?", [questionId]);
            if (qResult.length > 0) {
                stdAns = qResult[0].standard_answer || "";
                qMaxMarks = qResult[0].max_marks || 5;
            }
        }

        const studentFinalText = ocrText ? ocrText.trim() : (answerText ? answerText.trim() : "");
        
        let stdAnsClean = stdAns.replace(/<[^>]+>/g, ' ').trim();
        let studentTextClean = studentFinalText.replace(/<[^>]+>/g, ' ').trim();

        if (stdAnsClean && studentTextClean) {
            let aiUrl = process.env.HF_GRADING_API_URL || 'http://127.0.0.1:5000/grade';
            console.log("Attempting to use AI URL:", aiUrl);
            let pythonResult = { score: null, feedback: null };
            
            if (aiUrl) {
                const http = aiUrl.startsWith('https') ? require('https') : require('http');
                const url = require('url');
                const parsedUrl = url.parse(aiUrl);
                const postData = JSON.stringify({
                    student_answer: studentTextClean,
                    model_answer: stdAnsClean,
                    max_marks: qMaxMarks
                });
                
                const options = {
                    hostname: parsedUrl.hostname,
                    port: parsedUrl.port || (aiUrl.startsWith('https') ? 443 : 80),
                    path: parsedUrl.path,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                };

                try {
                    const parsed = await new Promise((resolve, reject) => {
                        const req = http.request(options, (res) => {
                            let body = '';
                            res.on('data', (chunk) => body += chunk);
                            res.on('end', () => {
                                try {
                                    resolve(JSON.parse(body));
                                } catch (e) {
                                    reject(e);
                                }
                            });
                        });
                        req.on('error', (e) => reject(e));
                        req.setTimeout(15000, () => {
                            req.destroy();
                            reject(new Error('AI API request timed out'));
                        });
                        req.write(postData);
                        req.end();
                    });
                    
                    if (parsed.success && parsed.data) {
                        pythonResult = { score: parsed.data.score, feedback: JSON.stringify(parsed.data) };
                    } else {
                        console.error('AI API Error in parsed data:', parsed.error);
                    }
                } catch (e) {
                    console.error('Failed to call AI API:', e.message);
                }
            } else {
                console.log("AI_GRADING_API_URL is undefined, falling back to math logic.");
            }
            
            if (pythonResult.score !== null) {
                marksAwarded = pythonResult.score;
                var advancedFeedback = pythonResult.feedback;
            } else {
                // Fallback to local math keyword logic
                const splitRegex = /(?:\n+)|(?=\b\d+\.\s)/g;
                const stdParagraphs = stdAnsClean.split(splitRegex).map(p => p.trim()).filter(p => p.length > 0);
                if (stdParagraphs.length > 0) {
                    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'as', 'into', 'through', 'and', 'or', 'but', 'if', 'then', 'that', 'this', 'it', 'its', 'from']);
                    const tokenise = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
                    const studentTokensSet = new Set(tokenise(studentTextClean));
                    let matchCount = 0;
                    for (const para of stdParagraphs) {
                        const paraTokens = tokenise(para);
                        const matchedTokens = paraTokens.filter(t => studentTokensSet.has(t)).length;
                        if (matchedTokens >= Math.min(2, paraTokens.length / 3)) matchCount++;
                    }
                    marksAwarded = Math.round((matchCount / stdParagraphs.length) * qMaxMarks);

                    const stdTokensSet = new Set(tokenise(stdAnsClean));
                    if (stdTokensSet.size <= 3 && marksAwarded > 0) {
                        let questionTextStr = "";
                        if (process.env.DB_TYPE === 'postgres') {
                            const qRes = await execute("SELECT question_text FROM questions WHERE id = $1", [questionId]);
                            if (qRes.rows.length > 0) questionTextStr = qRes.rows[0].question_text || "";
                        } else {
                            const qRes = await execute("SELECT question_text FROM questions WHERE id = ?", [questionId]);
                            if (qRes.length > 0) questionTextStr = qRes[0].question_text || "";
                        }
                        const questionTokensSet = new Set(tokenise(questionTextStr.replace(/<[^>]+>/g, ' ')));
                        let guessingTokensCount = 0;
                        for (const t of studentTokensSet) {
                            if (!stdTokensSet.has(t) && !questionTokensSet.has(t)) guessingTokensCount++;
                        }
                        if (guessingTokensCount > 0) {
                            marksAwarded = Math.round(marksAwarded * (stdTokensSet.size / (stdTokensSet.size + guessingTokensCount)));
                        }
                    }
                } else {
                    marksAwarded = 0;
                }
                var advancedFeedback = JSON.stringify({
                    debug: "MATH_LOGIC",
                    qMaxMarks,
                    stdAnsClean,
                    studentTextClean,
                    matchCount: matchCount || 0,
                    stdParagraphsLength: stdParagraphs.length,
                    pythonResult,
                    aiUrl
                });
            }
        } else {
            marksAwarded = 0;
            var advancedFeedback = JSON.stringify({ debug: "SKIPPED_IF_BLOCK", stdAnsClean, studentTextClean });
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
