import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import MasterDashboard from './pages/MasterDashboard';
import StudentAssignment from './pages/StudentAssignment';
import StudentSavedEssay from './pages/StudentSavedEssay';
import TeacherSubmissions from './pages/TeacherSubmissions';
import TeacherMarking from './pages/TeacherMarking';
import MassUploadDashboard from './pages/MassUploadDashboard';
import ConsolidatedReports from './pages/ConsolidatedReports';
import MassFeedbackManager from './pages/MassFeedbackManager';
import TeacherFeedbackPage from './pages/TeacherFeedbackPage';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
    const { user, token } = useAuth();

    if (!token) return <Navigate to="/login" />;
    if (user && !allowedRoles.includes(user.role)) return <Navigate to="/login" />;

    return <>{children}</>;
};

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/student-dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
                    <Route path="/student/assignment/:id" element={<ProtectedRoute allowedRoles={['student']}><StudentAssignment /></ProtectedRoute>} />
                    <Route path="/student/saved/:id" element={<ProtectedRoute allowedRoles={['student']}><StudentSavedEssay /></ProtectedRoute>} />

                    <Route path="/teacher-dashboard" element={<ProtectedRoute allowedRoles={['teacher', 'master']}><TeacherDashboard /></ProtectedRoute>} />
                    <Route path="/mass-upload" element={<ProtectedRoute allowedRoles={['teacher', 'master']}><MassUploadDashboard /></ProtectedRoute>} />
                    <Route path="/consolidated-reports" element={<ProtectedRoute allowedRoles={['teacher', 'master']}><ConsolidatedReports /></ProtectedRoute>} />
                    <Route path="/mass-feedback-manager" element={<ProtectedRoute allowedRoles={['teacher', 'master']}><MassFeedbackManager /></ProtectedRoute>} />
                    <Route path="/teacher-feedback" element={<ProtectedRoute allowedRoles={['teacher', 'master']}><TeacherFeedbackPage /></ProtectedRoute>} />

                    <Route path="/teacher/assignments/:id/submissions" element={<ProtectedRoute allowedRoles={['teacher', 'master']}><TeacherSubmissions /></ProtectedRoute>} />
                    <Route path="/teacher/submissions/:id" element={<ProtectedRoute allowedRoles={['teacher', 'master']}><TeacherMarking /></ProtectedRoute>} />

                    <Route path="/master-dashboard" element={<ProtectedRoute allowedRoles={['master']}><MasterDashboard /></ProtectedRoute>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
