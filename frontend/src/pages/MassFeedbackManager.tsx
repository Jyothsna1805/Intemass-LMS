import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, CheckCircle, ArrowLeft, RefreshCw, Sparkles, Users } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '../components/NotificationCenter';

interface Assignment {
    id: string;
    title: string;
}

interface MassFeedbackItem {
    id: string;
    student_name: string;
    student_email: string;
    score_band: string;
    feedback_text: string;
    is_viewed: number;
    viewed_at: string | null;
    created_at: string;
}

export const MassFeedbackManager: React.FC = () => {
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<string>('');
    const [feedbacks, setFeedbacks] = useState<MassFeedbackItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Default template text states
    const [excellentTemplate, setExcellentTemplate] = useState<string>(
        "Outstanding performance! You have demonstrated a complete understanding of the core concepts, excellent critical thinking, and clear presentation."
    );
    const [needsImpTemplate, setNeedsImpTemplate] = useState<string>(
        "Good effort! You understand the foundational principles, but some key details and explanations require further clarity and depth."
    );
    const [reqAttnTemplate, setReqAttnTemplate] = useState<string>(
        "Additional review recommended. Please revisit the core concepts and standard answers. Reach out during office hours for guidance."
    );

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await axios.get('/api/assignments', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAssignments(res.data || []);
                if (res.data && res.data.length > 0) {
                    setSelectedAssignment(res.data[0].id);
                }
            } catch (err) {
                console.error("Failed to load assignments:", err);
            }
        };
        fetchAssignments();
    }, [token]);

    const fetchFeedbacks = async () => {
        if (!selectedAssignment) return;
        setLoading(true);
        try {
            const res = await axios.get(`/api/mass-feedback/assignment/${selectedAssignment}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFeedbacks(res.data.feedbacks || []);
        } catch (err) {
            console.error("Failed to fetch mass feedback:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, [selectedAssignment, token]);

    const handleGenerateMassFeedback = async () => {
        if (!selectedAssignment) return;
        setIsGenerating(true);
        setSuccessMsg(null);

        try {
            const res = await axios.post('/api/mass-feedback/generate', {
                assignmentId: selectedAssignment,
                customTemplates: {
                    'Excellent': excellentTemplate,
                    'Needs Improvement': needsImpTemplate,
                    'Requires Attention': reqAttnTemplate
                }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMsg(res.data.message);
            fetchFeedbacks();
        } catch (err) {
            console.error("Failed to generate mass feedback:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">
            {/* Header */}
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
                                Mass Feedback Generation & Analytics System
                            </h1>
                            <p className="text-xs text-indigo-300">Phase 1.4 Automated Band Feedback & Delivery Tracking</p>
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Templates Setup Card */}
                    <div className="lg:col-span-6 bg-slate-950 p-6 rounded-2xl border border-indigo-900/50 shadow-xl space-y-6">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Performance Band Templates</h2>
                                <p className="text-xs text-indigo-300">Customize default feedback text for each score band</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">
                                Target Assignment
                            </label>
                            <select
                                value={selectedAssignment}
                                onChange={(e) => setSelectedAssignment(e.target.value)}
                                className="w-full bg-slate-900 border border-indigo-800/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {assignments.map(a => (
                                    <option key={a.id} value={a.id}>{a.title}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                                Band A: Excellent (&ge; 80%)
                            </label>
                            <textarea
                                rows={3}
                                value={excellentTemplate}
                                onChange={(e) => setExcellentTemplate(e.target.value)}
                                className="w-full bg-slate-900 border border-emerald-900/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                                Band B: Needs Improvement (50% - 79%)
                            </label>
                            <textarea
                                rows={3}
                                value={needsImpTemplate}
                                onChange={(e) => setNeedsImpTemplate(e.target.value)}
                                className="w-full bg-slate-900 border border-amber-900/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2">
                                Band C: Requires Attention (&lt; 50%)
                            </label>
                            <textarea
                                rows={3}
                                value={reqAttnTemplate}
                                onChange={(e) => setReqAttnTemplate(e.target.value)}
                                className="w-full bg-slate-900 border border-rose-900/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                            />
                        </div>

                        <button
                            onClick={handleGenerateMassFeedback}
                            disabled={isGenerating}
                            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    <span>Dispatching Mass Feedback...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    <span>Bulk Dispatch Personalized Feedback</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Feedback Delivery Analytics */}
                    <div className="lg:col-span-6 bg-slate-950 p-6 rounded-2xl border border-indigo-900/50 shadow-xl space-y-6">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Feedback Delivery Tracker</h2>
                                <p className="text-xs text-indigo-300">Live view status & read analytics per student</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="py-20 text-center text-indigo-400">
                                <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-indigo-500" />
                                <span>Loading feedback delivery status...</span>
                            </div>
                        ) : feedbacks.length === 0 ? (
                            <div className="py-16 text-center text-indigo-400/60">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-indigo-600/40" />
                                <p className="text-sm">No mass feedback dispatched for this assignment yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                {feedbacks.map((f) => (
                                    <div key={f.id} className="p-4 bg-slate-900 rounded-xl border border-indigo-900/40 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-sm font-bold text-white">{f.student_name}</h4>
                                                <p className="text-xs text-indigo-300">{f.student_email}</p>
                                            </div>
                                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                                                f.score_band === 'Excellent' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                                                f.score_band === 'Needs Improvement' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                                                'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                            }`}>
                                                {f.score_band}
                                            </span>
                                        </div>

                                        <p className="text-xs text-indigo-200 bg-slate-950 p-2.5 rounded-lg border border-indigo-900/30">
                                            "{f.feedback_text}"
                                        </p>

                                        <div className="flex justify-between items-center text-[11px] pt-1">
                                            <span className="text-indigo-400">
                                                Dispatched: {new Date(f.created_at).toLocaleDateString()}
                                            </span>
                                            {f.is_viewed ? (
                                                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    <span>Viewed on {new Date(f.viewed_at!).toLocaleDateString()}</span>
                                                </span>
                                            ) : (
                                                <span className="text-amber-400 font-semibold">Unread by student</span>
                                            )}
                                        </div>
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

export default MassFeedbackManager;
