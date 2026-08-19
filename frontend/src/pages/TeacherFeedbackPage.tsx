import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle, ArrowLeft, Send, History } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '../components/NotificationCenter';

interface FeedbackItem {
    id: string;
    category: string;
    rating: number;
    comments: string;
    created_at: string;
}

export const TeacherFeedbackPage: React.FC = () => {
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();

    const [category, setCategory] = useState<string>('Mass Exam Script Uploader');
    const [rating, setRating] = useState<number>(5);
    const [comments, setComments] = useState<string>('');
    const [pastFeedbacks, setPastFeedbacks] = useState<FeedbackItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fetchFeedbacks = async () => {
        try {
            const res = await axios.get('/api/teacher-feedback', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPastFeedbacks(res.data.feedbacks || []);
        } catch (err) {
            console.error("Failed to load teacher feedbacks:", err);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!comments.trim()) {
            setErrorMsg('Please enter your detailed feedback comments.');
            return;
        }

        try {
            setIsSubmitting(true);
            await axios.post('/api/teacher-feedback', {
                category,
                rating,
                comments
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMsg('Thank you! Your feedback has been recorded and submitted to the platform development team.');
            setComments('');
            fetchFeedbacks();
        } catch (err: any) {
            console.error("Failed to submit feedback:", err);
            setErrorMsg(err.response?.data?.error || 'Failed to submit feedback.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">
            {/* Top Bar */}
            <header className="bg-slate-950/80 backdrop-blur-md border-b border-indigo-900/50 sticky top-0 z-40 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/teacher-dashboard')}
                            className="p-2 text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/80 rounded-lg border border-indigo-800/40 transition-colors flex items-center space-x-1"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="text-xs font-semibold">Dashboard</span>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-300">
                                Teacher Platform Feedback Page
                            </h1>
                            <p className="text-xs text-indigo-300">Phase 3.1 Multi-Field Teacher Insights & Experience Feedback</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <NotificationCenter />
                        <span className="text-sm font-medium text-indigo-200">{user?.full_name || user?.email}</span>
                        <button onClick={logout} className="text-xs px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {successMsg && (
                    <div className="mb-6 p-4 bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 rounded-xl flex items-center space-x-3">
                        <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                )}
                {errorMsg && (
                    <div className="mb-6 p-4 bg-rose-950/80 border border-rose-700/60 text-rose-200 rounded-xl flex items-center space-x-3">
                        <MessageSquare className="w-6 h-6 text-rose-400 flex-shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Submission Form */}
                    <div className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl border border-indigo-900/50 shadow-xl space-y-6">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Share Your Feedback & Suggestions</h2>
                                <p className="text-xs text-indigo-300">Help us continuously refine the Intemass Automated Evaluation Platform</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">
                                    Feedback Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-slate-900 border border-indigo-800/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="Mass Exam Script Uploader">Mass Exam Script Uploader & Marker</option>
                                    <option value="Automated Diagram Extraction">Automated Diagram & Non-Text Extraction</option>
                                    <option value="Question Types (MCQs & Fill-Blanks)">Question Types (MCQs & Fill-in-Blanks)</option>
                                    <option value="Consolidated Reports & Export">Consolidated Reports & PDF/CSV Export</option>
                                    <option value="Notification Center & Alerts">Notification Center & Alerts</option>
                                    <option value="General Usability & UI">General Usability & User Experience</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">
                                    Satisfaction Rating (1 to 5 Stars)
                                </label>
                                <div className="flex items-center space-x-2 bg-slate-900 p-4 rounded-xl border border-indigo-800/40">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                                        >
                                            <Star className={`w-8 h-8 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                                        </button>
                                    ))}
                                    <span className="ml-4 text-sm font-bold text-amber-400">{rating} / 5 Stars</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">
                                    Detailed Feedback & Insights
                                </label>
                                <textarea
                                    rows={5}
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Describe your experience, usability suggestions, or feature requests..."
                                    className="w-full bg-slate-900 border border-indigo-800/60 rounded-xl p-4 text-sm text-white placeholder-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                                <Send className="w-5 h-5" />
                                <span>Submit Feedback Entry</span>
                            </button>
                        </form>
                    </div>

                    {/* Past Submissions */}
                    <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-indigo-900/50 shadow-xl space-y-6">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
                                <History className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Your Past Submissions</h2>
                                <p className="text-xs text-indigo-300">History of your feedback entries</p>
                            </div>
                        </div>

                        {pastFeedbacks.length === 0 ? (
                            <div className="py-16 text-center text-indigo-400/60">
                                No feedback submitted yet.
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                                {pastFeedbacks.map((f) => (
                                    <div key={f.id} className="p-4 bg-slate-900 rounded-xl border border-indigo-900/40 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-indigo-300">{f.category}</span>
                                            <div className="flex items-center space-x-1">
                                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                <span className="text-xs font-bold text-amber-400">{f.rating}/5</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-indigo-100 bg-slate-950 p-3 rounded-lg border border-indigo-900/30">
                                            "{f.comments}"
                                        </p>
                                        <span className="text-[10px] text-indigo-400 block text-right">
                                            Submitted: {new Date(f.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeacherFeedbackPage;
