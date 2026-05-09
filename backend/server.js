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

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/saved-essays', savedEssayRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'INTEMASS LMS Backend is running' });
});

// Serve the compiled React application directly from the Express API Server
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// Catch-all route to allow React Router to continuously handle client-side navigating securely 
app.get('*', (req, res) => {
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
