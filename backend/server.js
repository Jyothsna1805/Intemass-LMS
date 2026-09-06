const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDb } = require('./db/database');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const assignmentRoutes = require('./routes/assignments');
const submissionRoutes = require('./routes/submissions');
const savedEssayRoutes = require('./routes/saved_essays');
const usersRoutes = require('./routes/users');
const massUploaderRoutes = require('./routes/mass_uploader');
const reportsRoutes = require('./routes/reports');
const massFeedbackRoutes = require('./routes/mass_feedback');
const { router: notificationsRoutes } = require('./routes/notifications');
const teacherFeedbackRoutes = require('./routes/teacher_feedback');

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/saved-essays', savedEssayRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/mass-upload', massUploaderRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/mass-feedback', massFeedbackRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/teacher-feedback', teacherFeedbackRoutes);

app.get('/api/health', async (req, res) => {
    try {
        const { query } = require('./db/database');
        await query('SELECT 1'); // Keeps Supabase database active (prevents auto-pause)
        res.json({ status: 'ok', message: 'INTEMASS LMS Backend is running', db: 'connected' });
    } catch (e) {
        res.json({ status: 'ok', message: 'INTEMASS LMS Backend is running', db: 'error: ' + e.message });
    }
});

// Serve the compiled React application directly with no-cache on HTML to prevent stale browser caches
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));

// Catch-all route to allow React Router to continuously handle client-side navigating securely 
app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await initDb();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
