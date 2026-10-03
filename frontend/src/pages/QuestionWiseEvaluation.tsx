import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Save,
    ChevronRight,
    ChevronLeft,
    FileText,
    BookOpen,
    Eye,
    Maximize2,
    X,
    Filter,
    Search,
    Sparkles,
    Layers,
    User,
    BarChart3,
    ArrowRight,
    Bell,
    ShoppingCart,
    Users,
    AlertCircle,
    RotateCcw
} from 'lucide-react';

interface StudentAnswer {
    id: string; // submission_id or pending_studentId_questionId
    student_id: string;
    question_id: string;
    answer_text: string | null;
    file_url: string | null;
    extracted_diagram_url: string | null;
    ocr_text: string | null;
    topology_json: string | null;
    marks_awarded: number | null;
    feedback: string | null;
    submitted_at: string | null;
    marked_at: string | null;
    student_name: string;
    student_email: string;
    is_submitted?: boolean;
    reassessment_status?: string;
    reassessment_request?: string;
    reassessment_teacher_comment?: string;
}

interface QuestionData {
    id: string;
    question_text: string;
    type: string;
    subject: string;
    sub_category?: string;
    standard_answer: string | null;
    max_marks: number;
    question_number: number;
    stats: {
        total_answers: number;
        total_students_roster?: number;
        graded_answers: number;
        pending_answers: number;
        unsubmitted_answers?: number;
        average_score: string | null;
        highest_score: number | null;
    };
    student_answers: StudentAnswer[];
}

interface AssignmentData {
    id: string;
    title: string;
    instructions?: string;
    due_date?: string;
    subject?: string;
    sub_category?: string;
}

interface OverallStats {
    total_students: number;
    total_submissions: number;
    total_graded: number;
    total_pending: number;
    completion_percentage: number;
}

// Clean text / HTML helper to ensure clean typography without dark background styles
function renderCleanAnswerText(text: string | null) {
    if (!text) return null;

    // Remove inline style tags that contain background-color / color that cause dark mode artifacts
    const cleaned = text
        .replace(/style\s*=\s*"[^"]*"/gi, '')
        .replace(/style\s*=\s*'[^']*'/gi, '')
        .trim();

    // If it contains HTML elements, render with sanitized container
    const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(cleaned);

    if (hasHtmlTags) {
        return (
            <div
                className="text-sm text-gray-900 leading-relaxed font-sans space-y-2 [&_p]:mb-2 [&_span]:text-gray-900 [&_span]:bg-transparent"
                dangerouslySetInnerHTML={{ __html: cleaned }}
            />
        );
    }

    return (
        <p className="text-sm text-gray-900 leading-relaxed font-sans whitespace-pre-wrap">
            {cleaned}
        </p>
    );
}

// Clean JSON feedback string to avoid displaying raw debug JSON
function sanitizeFeedback(fb: string | null | undefined): string {
    if (!fb) return '';
    const trimmed = fb.trim();
    if (trimmed.startsWith('{')) {
        try {
            const parsed = JSON.parse(trimmed);
            if (parsed.debug) return '';
            if (parsed.comment) return parsed.comment;
            if (parsed.feedback) return parsed.feedback;
            return '';
        } catch {
            return '';
        }
    }
    return fb;
}

export default function QuestionWiseEvaluation() {
    const { id } = useParams() as { id: string };
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [assignment, setAssignment] = useState<AssignmentData | null>(null);
    const [questions, setQuestions] = useState<QuestionData[]>([]);
    const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

    // Form inputs state mapped by submissionId
    const [marksState, setMarksState] = useState<{ [submissionId: string]: number | '' }>({});
    const [feedbackState, setFeedbackState] = useState<{ [submissionId: string]: string }>({});
    
    // UI filters & helpers
    const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'pending' | 'graded'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showStandardAnswer, setShowStandardAnswer] = useState(true);
    const [saving, setSaving] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
    const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

    const feedbackPresets = [
        'Excellent and thorough explanation!',
        'Accurate analysis with correct reasoning.',
        'Good attempt; needs more step-by-step clarity.',
        'Partially correct; review core definitions.',
        'Incomplete answer; please refer to model solution.'
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/assignments/${id}/question-wise`);
            const data = res.data;
            setAssignment(data.assignment);
            setQuestions(data.questions || []);
            setOverallStats(data.stats);

            // Populate form state
            const initialMarks: { [k: string]: number | '' } = {};
            const initialFeedback: { [k: string]: string } = {};

            (data.questions || []).forEach((q: QuestionData) => {
                q.student_answers.forEach((ans: StudentAnswer) => {
                    initialMarks[ans.id] = ans.marks_awarded !== null ? ans.marks_awarded : '';
                    initialFeedback[ans.id] = sanitizeFeedback(ans.feedback);
                });
            });

            setMarksState(initialMarks);
            setFeedbackState(initialFeedback);
        } catch (err) {
            console.error('Failed to load question-wise evaluation data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const activeQuestion = questions[activeQuestionIdx];

    const handleMarkChange = (submissionId: string, val: string, maxMarks: number) => {
        if (val === '') {
            setMarksState(prev => ({ ...prev, [submissionId]: '' }));
            return;
        }
        const num = Number(val);
        if (!isNaN(num)) {
            const clamped = Math.max(0, Math.min(maxMarks, num));
            setMarksState(prev => ({ ...prev, [submissionId]: clamped }));
        }
    };

    const handleFeedbackChange = (submissionId: string, text: string) => {
        setFeedbackState(prev => ({ ...prev, [submissionId]: text }));
    };

    const handleQuickScore = (submissionId: string, score: number) => {
        setMarksState(prev => ({ ...prev, [submissionId]: score }));
    };

    const handleQuickFeedback = (submissionId: string, preset: string) => {
        setFeedbackState(prev => {
            const current = prev[submissionId] || '';
            const updated = current ? `${current} | ${preset}` : preset;
            return { ...prev, [submissionId]: updated };
        });
    };

    // Auto seed sample submissions from all 4 student accounts
    const handleSeedAllStudents = async () => {
        if (!window.confirm('Populate sample answers from all 4 students for this assignment? This allows you to immediately test grading all students at once.')) {
            return;
        }
        setSeeding(true);
        try {
            const res = await api.post(`/assignments/${id}/seed-sample-submissions`);
            setSaveSuccessMsg(res.data.message || 'Sample student answers populated successfully!');
            await fetchData();
            setTimeout(() => setSaveSuccessMsg(''), 5000);
        } catch (err) {
            console.error('Failed to seed sample submissions', err);
            alert('Error generating sample answers. Please check server logs.');
        } finally {
            setSeeding(false);
        }
    };

    // Save marks for current question
    const handleSaveCurrentQuestion = async (advanceNext: boolean = false) => {
        if (!activeQuestion) return;
        setSaving(true);
        setSaveSuccessMsg('');

        try {
            // Filter only valid submitted student responses (skip pending non-submissions)
            const marksData = activeQuestion.student_answers
                .filter(ans => ans.is_submitted !== false && !ans.id.startsWith('pending_'))
                .map(ans => ({
                    submissionId: ans.id,
                    marks: marksState[ans.id] !== '' && marksState[ans.id] !== undefined ? Number(marksState[ans.id]) : null,
                    feedback: feedbackState[ans.id] || ''
                }));

            if (marksData.length === 0) {
                alert('No active submissions to save for this question yet.');
                setSaving(false);
                return;
            }

            await api.post('/submissions/batch-mark-question', { marksData });

            setSaveSuccessMsg(`Saved marks for Question ${activeQuestion.question_number} successfully!`);
            setTimeout(() => setSaveSuccessMsg(''), 4000);

            // Update local state without full reload
            setQuestions(prev => {
                const nextQs = [...prev];
                const q = { ...nextQs[activeQuestionIdx] };
                q.student_answers = q.student_answers.map(ans => {
                    if (ans.is_submitted === false || ans.id.startsWith('pending_')) return ans;
                    return {
                        ...ans,
                        marks_awarded: marksState[ans.id] !== '' && marksState[ans.id] !== undefined ? Number(marksState[ans.id]) : null,
                        feedback: feedbackState[ans.id] || '',
                        marked_at: new Date().toISOString()
                    };
                });

                const graded = q.student_answers.filter(a => a.is_submitted !== false && a.marks_awarded !== null);
                const scores = graded.map(a => Number(a.marks_awarded));
                const totalSub = q.student_answers.filter(a => a.is_submitted !== false).length;

                q.stats = {
                    ...q.stats,
                    total_answers: totalSub,
                    graded_answers: graded.length,
                    pending_answers: totalSub - graded.length,
                    average_score: scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null,
                    highest_score: scores.length > 0 ? Math.max(...scores) : null
                };

                nextQs[activeQuestionIdx] = q;
                return nextQs;
            });

            if (advanceNext && activeQuestionIdx < questions.length - 1) {
                setActiveQuestionIdx(activeQuestionIdx + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            console.error('Failed to batch save marks', err);
            alert('Error saving marks. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Quick fill all submitted students on current question
    const handleQuickFillAll = (ratio: number) => {
        if (!activeQuestion) return;
        const max = activeQuestion.max_marks;
        const targetScore = Math.round(max * ratio * 2) / 2;
        const updatedMarks = { ...marksState };
        activeQuestion.student_answers.forEach(ans => {
            if (ans.is_submitted !== false && !ans.id.startsWith('pending_')) {
                updatedMarks[ans.id] = targetScore;
            }
        });
        setMarksState(updatedMarks);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-8">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-primary-900 font-extrabold uppercase tracking-widest text-sm">Loading Question-Wise Studio...</p>
                <p className="text-xs text-gray-500 mt-1">Aggregating all student answers by question</p>
            </div>
        );
    }

    if (!assignment || questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow text-center space-y-4">
                    <h2 className="text-lg font-bold text-gray-800">No Questions Found</h2>
                    <p className="text-sm text-gray-500">This assignment does not have questions or submissions configured.</p>
                    <button onClick={() => navigate('/teacher-dashboard')} className="bg-primary-600 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Filter student answers
    const filteredAnswers = (activeQuestion?.student_answers || []).filter(ans => {
        const isSubmitted = ans.is_submitted !== false && !ans.id.startsWith('pending_');
        const isGraded = isSubmitted && marksState[ans.id] !== '' && marksState[ans.id] !== undefined && marksState[ans.id] !== null;

        if (filterStatus === 'submitted' && !isSubmitted) return false;
        if (filterStatus === 'pending' && (!isSubmitted || isGraded)) return false;
        if (filterStatus === 'graded' && !isGraded) return false;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const nameMatch = ans.student_name?.toLowerCase().includes(q);
            const emailMatch = ans.student_email?.toLowerCase().includes(q);
            const textMatch = ans.answer_text?.toLowerCase().includes(q);
            if (!nameMatch && !emailMatch && !textMatch) return false;
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col text-gray-900 font-sans pb-28">
            {/* Top Navbar */}
            <nav className="bg-primary-900 px-4 sm:px-6 lg:px-8 shadow sticky top-0 z-30">
                <div className="flex h-16 items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/teacher-dashboard')}>
                        <img src="/logo.png" alt="MegaForte" className="h-10 w-10 object-contain bg-white rounded-full shadow-sm" />
                        <div>
                            <span className="text-white font-extrabold text-sm tracking-widest uppercase block">MegaForte LMS</span>
                            <span className="text-primary-300 text-[10px] font-bold tracking-wider uppercase block">Question-Wise Horizontal Evaluation</span>
                        </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-6">
                        <div className="flex items-center gap-4 text-white/90">
                            <Bell size={18} className="cursor-pointer hover:text-white" onClick={() => alert("No pending unread alerts.")} />
                            <div onClick={() => navigate('/')} className="flex items-center text-sm font-bold cursor-pointer hover:text-white">
                                <ShoppingCart size={18} className="mr-1" /> Cart (0)
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => navigate('/teacher-dashboard')} 
                                className="border border-white/50 text-white px-4 py-1.5 text-xs font-semibold hover:bg-white/10 transition flex items-center gap-1.5 rounded"
                            >
                                Dashboard
                            </button>
                            <button onClick={logout} className="bg-green-500 text-white px-4 py-1.5 text-xs font-bold uppercase hover:bg-green-600 rounded">SIGNOUT</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sub-Header / Assignment Breadcrumb & Progress Banner */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <button
                                    onClick={() => navigate(`/teacher/assignments/${id}/submissions`)}
                                    className="text-xs font-bold text-primary-700 hover:text-primary-900 flex items-center gap-1 uppercase tracking-wider"
                                >
                                    <ArrowLeft size={14} /> Back to Submissions Table
                                </button>
                                <span className="text-gray-300">|</span>
                                <span className="bg-primary-50 text-primary-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded border border-primary-200 uppercase tracking-widest">
                                    {assignment.subject || 'General'}
                                </span>
                                {assignment.sub_category && (
                                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                                        {assignment.sub_category}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                                {assignment.title}
                            </h1>
                        </div>

                        {/* Overall Progress & Auto-Seed Actions */}
                        <div className="flex items-center gap-3">
                            {/* Auto-Populate Button */}
                            <button
                                disabled={seeding}
                                onClick={handleSeedAllStudents}
                                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black px-4 py-2 rounded-lg shadow transition flex items-center gap-1.5 disabled:opacity-50"
                                title="Populate sample submissions for all registered students"
                            >
                                <Users size={14} />
                                <span>{seeding ? 'Populating...' : '⚡ Populate All 4 Students'}</span>
                            </button>

                            {overallStats && (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:px-4 flex items-center gap-4">
                                    <div>
                                        <div className="flex items-center justify-between gap-3 mb-1">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">Grading Progress</span>
                                            <span className="text-xs font-black text-primary-900">{overallStats.completion_percentage}%</span>
                                        </div>
                                        <div className="w-36 bg-gray-200 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-green-600 h-full transition-all duration-500 rounded-full" 
                                                style={{ width: `${overallStats.completion_percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="border-l border-slate-200 pl-3 text-left">
                                        <p className="text-xs font-bold text-gray-800">
                                            <span className="text-green-700 font-extrabold">{overallStats.total_graded}</span> / {overallStats.total_submissions} Graded
                                        </p>
                                        <p className="text-[10px] text-gray-500 font-medium">{overallStats.total_students} Total Students</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Question Tabs Bar */}
                    <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                        {questions.map((q, idx) => {
                            const isCurrent = idx === activeQuestionIdx;
                            const isFullyGraded = q.stats.total_answers > 0 && q.stats.pending_answers === 0;
                            return (
                                <button
                                    key={q.id}
                                    onClick={() => {
                                        setActiveQuestionIdx(idx);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className={`flex-shrink-0 px-4 py-2.5 rounded-lg border text-left transition flex items-center gap-3 ${
                                        isCurrent
                                            ? 'bg-primary-900 border-primary-900 text-white shadow-md ring-2 ring-primary-500/20'
                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                                >
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                                        isCurrent ? 'bg-white text-primary-900' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {idx + 1}
                                    </span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-extrabold uppercase tracking-wider ${isCurrent ? 'text-white' : 'text-gray-900'}`}>
                                                Question {idx + 1}
                                            </span>
                                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                                isCurrent ? 'bg-primary-800 text-primary-200' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {q.type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className={`w-2 h-2 rounded-full ${isFullyGraded ? 'bg-green-400' : 'bg-amber-400'}`} />
                                            <span className={`text-[10px] font-semibold ${isCurrent ? 'text-primary-200' : 'text-gray-500'}`}>
                                                {q.stats.graded_answers}/{q.stats.total_answers} Graded ({q.max_marks} pts)
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">

                {/* Toast Success Message */}
                {saveSuccessMsg && (
                    <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between shadow-sm animate-fade-in">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-green-600" />
                            <span className="text-xs font-bold">{saveSuccessMsg}</span>
                        </div>
                        <button onClick={() => setSaveSuccessMsg('')} className="text-green-600 hover:text-green-800 text-xs font-bold">Dismiss</button>
                    </div>
                )}

                {/* CURRENT QUESTION CARD & MARKING SCHEME */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2">
                                <span className="bg-primary-900 text-white text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider">
                                    Question {activeQuestion.question_number} of {questions.length}
                                </span>
                                <span className="bg-blue-50 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-md border border-blue-200 uppercase">
                                    Max Score: {activeQuestion.max_marks} Points
                                </span>
                                {activeQuestion.stats.average_score && (
                                    <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-200">
                                        Avg: {activeQuestion.stats.average_score} / {activeQuestion.max_marks}
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={() => setShowStandardAnswer(!showStandardAnswer)}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:text-primary-900 bg-primary-50 px-3 py-1.5 rounded-md border border-primary-200 transition"
                            >
                                <BookOpen size={14} />
                                {showStandardAnswer ? 'Hide Standard Rubric' : 'Show Standard Rubric'}
                            </button>
                        </div>

                        {/* Question Text */}
                        <div className="text-gray-900 font-semibold text-base sm:text-lg leading-relaxed mt-2" dangerouslySetInnerHTML={{ __html: activeQuestion.question_text }} />
                    </div>

                    {/* Standard Model Answer & Rubric Panel */}
                    {showStandardAnswer && (
                        <div className="bg-indigo-50/70 border-t border-indigo-100 p-5">
                            <div className="flex items-center gap-2 mb-2 text-indigo-950 font-black text-xs uppercase tracking-wider">
                                <Sparkles size={16} className="text-indigo-600" />
                                Official Standard Model Answer & Marking Scheme
                            </div>
                            <div className="text-sm text-indigo-950 bg-white p-4 rounded-lg border border-indigo-200 leading-relaxed font-sans whitespace-pre-wrap shadow-xs">
                                {activeQuestion.standard_answer || 'No standard answer provided for this question.'}
                            </div>
                        </div>
                    )}
                </div>

                {/* BATCH STUDENT ANSWERS MATRIX HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Layers size={18} className="text-primary-700" />
                        <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                            Student Answers for Question {activeQuestion.question_number} ({filteredAnswers.length} Students Listed)
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Filter Tabs */}
                        <div className="flex items-center bg-gray-100 p-0.5 rounded-md text-xs font-bold">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-2.5 py-1 rounded ${filterStatus === 'all' ? 'bg-white text-primary-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                All ({activeQuestion.student_answers.length})
                            </button>
                            <button
                                onClick={() => setFilterStatus('submitted')}
                                className={`px-2.5 py-1 rounded ${filterStatus === 'submitted' ? 'bg-white text-blue-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Submitted ({activeQuestion.stats.total_answers})
                            </button>
                            <button
                                onClick={() => setFilterStatus('pending')}
                                className={`px-2.5 py-1 rounded ${filterStatus === 'pending' ? 'bg-white text-amber-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Pending ({activeQuestion.stats.pending_answers})
                            </button>
                            <button
                                onClick={() => setFilterStatus('graded')}
                                className={`px-2.5 py-1 rounded ${filterStatus === 'graded' ? 'bg-white text-green-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Graded ({activeQuestion.stats.graded_answers})
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search student..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 py-1 border border-gray-200 rounded-md text-xs outline-none focus:border-primary-500 w-36 sm:w-44"
                            />
                        </div>

                        {/* Quick fill all preset */}
                        <div className="hidden sm:flex items-center gap-1 border-l border-gray-200 pl-2">
                            <button
                                onClick={() => handleQuickFillAll(1.0)}
                                className="text-[10px] font-bold bg-green-50 text-green-700 hover:bg-green-100 px-2 py-1 rounded border border-green-200 transition"
                                title="Set full marks for all submitted students on this question"
                            >
                                +Full All
                            </button>
                            <button
                                onClick={() => handleQuickFillAll(0.5)}
                                className="text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 transition"
                                title="Set half marks for all submitted students on this question"
                            >
                                +Half All
                            </button>
                        </div>
                    </div>
                </div>

                {/* STUDENT CARDS LIST */}
                <div className="space-y-4">
                    {filteredAnswers.map((ans) => {
                        const isSubmitted = ans.is_submitted !== false && !ans.id.startsWith('pending_');
                        const currentMark = marksState[ans.id];
                        const isMarked = isSubmitted && currentMark !== '' && currentMark !== undefined && currentMark !== null;

                        return (
                            <div 
                                key={ans.id}
                                className={`bg-white rounded-xl border transition shadow-sm ${
                                    !isSubmitted 
                                        ? 'border-gray-200 bg-gray-50/50 opacity-80'
                                        : isMarked 
                                            ? 'border-gray-200' 
                                            : 'border-amber-300 ring-1 ring-amber-100'
                                }`}
                            >
                                {/* Card Header */}
                                <div className="p-4 border-b border-gray-100 bg-gray-50/70 rounded-t-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-full font-black text-xs flex items-center justify-center shadow-sm ${
                                            isSubmitted ? 'bg-primary-900 text-white' : 'bg-gray-300 text-gray-600'
                                        }`}>
                                            {ans.student_name ? ans.student_name.slice(0, 2).toUpperCase() : 'ST'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-extrabold text-gray-900">{ans.student_name || 'Student'}</h3>
                                                <span className="text-xs text-gray-500 font-mono">({ans.student_email})</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                                                {isSubmitted ? (
                                                    <>
                                                        <span>Submitted: {ans.submitted_at ? new Date(ans.submitted_at).toLocaleString() : 'Recent'}</span>
                                                        {ans.marked_at && (
                                                            <span>• Evaluated: {new Date(ans.marked_at).toLocaleDateString()}</span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 italic">No answer submitted yet by this student</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div>
                                        {!isSubmitted ? (
                                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">
                                                <AlertCircle size={13} /> Not Submitted
                                            </span>
                                        ) : isMarked ? (
                                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-black px-3 py-1 rounded-full border border-green-200">
                                                <CheckCircle2 size={13} /> Scored: {currentMark} / {activeQuestion.max_marks}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full border border-amber-200">
                                                <Clock size={13} /> Pending Grading
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Card Body: Two-Column Layout (Student Answer vs Teacher Marking Station) */}
                                {isSubmitted ? (
                                    <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">

                                        {/* Left Column: Student Answer & Attachments (7 Cols) */}
                                        <div className="lg:col-span-7 space-y-4">
                                            <div>
                                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                    <FileText size={13} /> Student Response
                                                </h4>
                                                
                                                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-inner text-gray-900">
                                                    {ans.answer_text ? (
                                                        renderCleanAnswerText(ans.answer_text)
                                                    ) : (
                                                        <div className="text-xs text-gray-400 italic">
                                                            No typed text submitted (check diagram or attachment below).
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Diagram or File Attachment Preview */}
                                            {(ans.extracted_diagram_url || ans.file_url) && (
                                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                                                            <Eye size={12} /> Handwritten / Diagram Attachment
                                                        </span>
                                                        <button
                                                            onClick={() => setActiveImageModal(ans.extracted_diagram_url || ans.file_url)}
                                                            className="text-[10px] text-primary-700 font-bold hover:underline flex items-center gap-1"
                                                        >
                                                            <Maximize2 size={11} /> Expand Diagram
                                                        </button>
                                                    </div>
                                                    <div 
                                                        className="cursor-pointer max-h-48 overflow-hidden rounded border border-gray-300 bg-white hover:opacity-90 transition flex justify-center items-center"
                                                        onClick={() => setActiveImageModal(ans.extracted_diagram_url || ans.file_url)}
                                                    >
                                                        <img 
                                                            src={ans.extracted_diagram_url || ans.file_url || ''} 
                                                            alt="Student Answer Diagram" 
                                                            className="max-h-48 object-contain"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* OCR Transcribed Text if available */}
                                            {ans.ocr_text && (
                                                <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 text-xs text-amber-950 font-mono">
                                                    <span className="font-bold text-[10px] uppercase tracking-wider block text-amber-800 mb-1">OCR Transcribed Text:</span>
                                                    <p className="line-clamp-3">{ans.ocr_text}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Column: Teacher Grading Station (5 Cols) */}
                                        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-4">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-xs font-black text-gray-800 uppercase tracking-wider">
                                                        Award Score (0 - {activeQuestion.max_marks})
                                                    </label>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuickScore(ans.id, 0)}
                                                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                        >
                                                            0
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuickScore(ans.id, Math.round(activeQuestion.max_marks * 0.5 * 2) / 2)}
                                                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                                                        >
                                                            Half
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuickScore(ans.id, activeQuestion.max_marks)}
                                                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-800 hover:bg-green-200"
                                                        >
                                                            Full ({activeQuestion.max_marks})
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Score Input Box */}
                                                <div className="flex items-center gap-2 mb-4">
                                                    <input
                                                        type="number"
                                                        step="0.5"
                                                        min="0"
                                                        max={activeQuestion.max_marks}
                                                        value={marksState[ans.id] !== undefined ? marksState[ans.id] : ''}
                                                        onChange={(e) => handleMarkChange(ans.id, e.target.value, activeQuestion.max_marks)}
                                                        placeholder="Score"
                                                        className="w-24 px-3 py-2 text-center text-lg font-black text-primary-900 bg-white border-2 border-gray-300 focus:border-primary-600 rounded-lg outline-none"
                                                    />
                                                    <span className="text-sm font-bold text-gray-400">/ {activeQuestion.max_marks} Points</span>
                                                </div>

                                                {/* Feedback Textarea */}
                                                <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5">
                                                    Student Feedback / Correction Notes
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={feedbackState[ans.id] || ''}
                                                    onChange={(e) => handleFeedbackChange(ans.id, e.target.value)}
                                                    placeholder="Provide actionable guidance or corrections..."
                                                    className="w-full text-xs p-2.5 bg-white border border-gray-300 focus:border-primary-600 rounded-lg outline-none resize-y"
                                                />

                                                {/* Feedback Presets Pills */}
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {feedbackPresets.map((preset, pIdx) => (
                                                        <button
                                                            key={pIdx}
                                                            type="button"
                                                            onClick={() => handleQuickFeedback(ans.id, preset)}
                                                            className="text-[9px] font-medium bg-white hover:bg-primary-50 text-gray-600 hover:text-primary-800 border border-gray-200 px-2 py-0.5 rounded transition"
                                                        >
                                                            + {preset.slice(0, 24)}...
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-gray-400 text-xs">
                                        Student has not submitted a response for Question {activeQuestion.question_number} yet.
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {filteredAnswers.length === 0 && (
                        <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300 text-gray-400 font-bold uppercase tracking-wider text-xs">
                            No student answers match the selected filter.
                        </div>
                    )}
                </div>
            </div>

            {/* STICKY BOTTOM ACTION BAR */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 z-40">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    
                    {/* Left: Previous Question */}
                    <button
                        disabled={activeQuestionIdx === 0 || saving}
                        onClick={() => {
                            if (activeQuestionIdx > 0) {
                                setActiveQuestionIdx(activeQuestionIdx - 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition ${
                            activeQuestionIdx === 0 || saving
                                ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        <ChevronLeft size={16} /> Question {activeQuestionIdx > 0 ? activeQuestionIdx : 1}
                    </button>

                    {/* Center: Save Current Question Marks */}
                    <div className="flex items-center gap-2">
                        <button
                            disabled={saving}
                            onClick={() => handleSaveCurrentQuestion(false)}
                            className="bg-primary-700 hover:bg-primary-800 text-white font-extrabold text-xs uppercase tracking-widest px-6 py-2.5 rounded-lg shadow-md transition flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save size={16} />
                            {saving ? 'Saving Marks...' : `Save All Marks (Question ${activeQuestion.question_number})`}
                        </button>

                        <button
                            disabled={saving || activeQuestionIdx >= questions.length - 1}
                            onClick={() => handleSaveCurrentQuestion(true)}
                            className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs uppercase tracking-widest px-5 py-2.5 rounded-lg shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                            Save & Next <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Right: Quick Finish / Summary */}
                    <button
                        onClick={() => navigate(`/teacher/assignments/${id}/submissions`)}
                        className="text-xs font-bold text-gray-500 hover:text-gray-800 uppercase tracking-wider"
                    >
                        Finish & View Summary
                    </button>
                </div>
            </div>

            {/* FULL RESOLUTION IMAGE MODAL */}
            {activeImageModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setActiveImageModal(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg p-2 overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setActiveImageModal(null)}
                            className="absolute top-3 right-3 bg-gray-900 text-white p-1 rounded-full hover:bg-red-600 transition z-10"
                        >
                            <X size={18} />
                        </button>
                        <img 
                            src={activeImageModal} 
                            alt="Full Resolution Diagram" 
                            className="max-w-full max-h-[85vh] object-contain mx-auto"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
