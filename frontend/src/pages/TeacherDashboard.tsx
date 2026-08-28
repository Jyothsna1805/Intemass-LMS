import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, BrainCircuit, ShoppingCart, Loader2, Database, BookOpen, UploadCloud, BarChart2, MessageSquare, Star } from 'lucide-react';
import NotificationCenter from '../components/NotificationCenter';

interface Question { id: string; question_text: string; type: string; subject: string; standard_answer: string; }
interface Assignment { id: string; title: string; due_date: string; }

export default function TeacherDashboard() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'modules' | 'databank' | 'reassessments'>('modules');
    const [pendingReassessments, setPendingReassessments] = useState<any[]>([]);

    // Create Module state
    const [title, setTitle] = useState('');
    const [instructions, setInstructions] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

    // Create Databank Question state
    const [qSubject, setQSubject] = useState('');
    const [qType, setQType] = useState('essay');
    const [qText, setQText] = useState('');
    const [qStandardAnswer, setQStandardAnswer] = useState('');
    const [qMaxMarks, setQMaxMarks] = useState<number>(5);
    const [filterSubject, setFilterSubject] = useState('All');

    // MCQ & Cloze Passage states
    const [mcqOptA, setMcqOptA] = useState('');
    const [mcqOptB, setMcqOptB] = useState('');
    const [mcqOptC, setMcqOptC] = useState('');
    const [mcqOptD, setMcqOptD] = useState('');
    const [mcqCorrectKey, setMcqCorrectKey] = useState('A');
    const [blankAnswersInput, setBlankAnswersInput] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [qs, as, pr] = await Promise.all([
                api.get('/questions'),
                api.get('/assignments'),
                api.get('/submissions/reassessments/pending')
            ]);
            setQuestions(qs.data);
            setAssignments(as.data);
            setPendingReassessments(pr.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/assignments', {
                title, instructions, dueDate, questionIds: selectedQuestions
            });
            setTitle(''); setInstructions(''); setDueDate(''); setSelectedQuestions([]);
            fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        let mcqOpts = null;
        let stdAns = qStandardAnswer;

        if (qType === 'mcq') {
            mcqOpts = [
                { key: 'A', text: mcqOptA },
                { key: 'B', text: mcqOptB },
                { key: 'C', text: mcqOptC },
                { key: 'D', text: mcqOptD }
            ];
            stdAns = mcqCorrectKey;
        }

        let blankAnswers = null;
        if (qType === 'fill_blank') {
            blankAnswers = blankAnswersInput.split(',').map(s => s.trim()).filter(Boolean);
            if (!stdAns && blankAnswers.length > 0) stdAns = blankAnswers[0];
        }

        try {
            await api.post('/questions', {
                questionText: qText,
                standardAnswer: stdAns,
                type: qType,
                subject: qSubject || 'Uncategorized',
                maxMarks: qMaxMarks,
                mcqOptions: mcqOpts,
                blankAnswers: blankAnswers
            });
            setQText(''); setQStandardAnswer('');
            setMcqOptA(''); setMcqOptB(''); setMcqOptC(''); setMcqOptD('');
            setBlankAnswersInput('');
            fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleQuestion = (id: string) => {
        setSelectedQuestions((prev) =>
            prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
        );
    };

    const uniqueSubjects = Array.from(new Set(questions.map(q => q.subject || 'Uncategorized')));
    const filteredQuestions = filterSubject === 'All'
        ? questions
        : questions.filter(q => (q.subject || 'Uncategorized') === filterSubject);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* MegaForte Navbar */}
            <nav className="bg-primary-900 px-4 sm:px-6 lg:px-8 shadow-sm">
                <div className="flex h-16 items-center justify-between max-w-7xl mx-auto">
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/logo.png" alt="MegaForte" className="h-10 w-10 object-contain bg-white rounded-full shadow-sm" />
                        <span className="text-white font-bold text-lg hidden sm:inline">Intemass Automated Evaluation</span>
                    </div>
                    <div className="flex items-center gap-4 text-white/90">
                        <NotificationCenter />
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => navigate('/teacher-dashboard')} 
                                className="border border-white/50 text-white px-3 py-1.5 text-xs font-semibold hover:bg-white/10 transition flex items-center gap-1.5 rounded"
                            >
                                Account ({user ? user.email.split('@')[0] : 'Teacher'})
                            </button>
                            <button onClick={logout} className="bg-rose-600 text-white px-3 py-1.5 text-xs font-bold uppercase hover:bg-rose-700 rounded">SIGNOUT</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Flagship Modules Banner */}
                <div className="mb-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-800/40 shadow-xl text-white">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-indigo-200">Intemass Automated Assessment System</h2>
                            <p className="text-xs text-indigo-300">Phase 1 - Phase 4 Scope of Work Modules</p>
                        </div>
                        <span className="bg-indigo-600/40 border border-indigo-400/40 text-indigo-200 text-xs px-3 py-1 rounded-full font-semibold">
                            Full-Stack Active
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div 
                            onClick={() => navigate('/mass-upload')}
                            className="bg-slate-900/90 p-4 rounded-xl border border-indigo-800/50 hover:border-indigo-400 cursor-pointer transition-all hover:scale-[1.02] shadow-md group"
                        >
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2.5 bg-indigo-600/30 text-indigo-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <UploadCloud className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-bold text-white group-hover:text-indigo-300">Mass Script Uploader</h3>
                            </div>
                            <p className="text-[11px] text-indigo-300/80">ZIP batch upload, OCR parsing & auto-marker</p>
                        </div>

                        <div 
                            onClick={() => navigate('/consolidated-reports')}
                            className="bg-slate-900/90 p-4 rounded-xl border border-purple-800/50 hover:border-purple-400 cursor-pointer transition-all hover:scale-[1.02] shadow-md group"
                        >
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2.5 bg-purple-600/30 text-purple-400 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <BarChart2 className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-bold text-white group-hover:text-purple-300">Consolidated Reports</h3>
                            </div>
                            <p className="text-[11px] text-indigo-300/80">Master mark sheet, ranking & PDF/CSV export</p>
                        </div>

                        <div 
                            onClick={() => navigate('/mass-feedback-manager')}
                            className="bg-slate-900/90 p-4 rounded-xl border border-emerald-800/50 hover:border-emerald-400 cursor-pointer transition-all hover:scale-[1.02] shadow-md group"
                        >
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2.5 bg-emerald-600/30 text-emerald-400 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-bold text-white group-hover:text-emerald-300">Mass Feedback Manager</h3>
                            </div>
                            <p className="text-[11px] text-indigo-300/80">Score band templates & delivery tracker</p>
                        </div>

                        <div 
                            onClick={() => navigate('/teacher-feedback')}
                            className="bg-slate-900/90 p-4 rounded-xl border border-amber-800/50 hover:border-amber-400 cursor-pointer transition-all hover:scale-[1.02] shadow-md group"
                        >
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2.5 bg-amber-600/30 text-amber-400 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                    <Star className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs font-bold text-white group-hover:text-amber-300">Teacher Feedback Page</h3>
                            </div>
                            <p className="text-[11px] text-indigo-300/80">Multi-field rating & feature suggestions</p>
                        </div>
                    </div>
                </div>

                {/* MegaForte Tabs */}
                <div className="flex border-b border-gray-300 mb-8 space-x-8">
                    <button
                        onClick={() => setActiveTab('modules')}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition border-b-4 ${activeTab === 'modules' ? 'border-primary-900 text-primary-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        My Course Modules
                    </button>
                    <button
                        onClick={() => setActiveTab('databank')}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition border-b-4 ${activeTab === 'databank' ? 'border-primary-900 text-primary-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Answer Databank
                    </button>
                    <button
                        onClick={() => setActiveTab('reassessments')}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition border-b-4 ${activeTab === 'reassessments' ? 'border-primary-900 text-primary-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Reassessments {pendingReassessments.length > 0 && <span className="bg-red-500 text-white rounded-full px-2 py-0.5 ml-1 text-[10px]">{pendingReassessments.length}</span>}
                    </button>
                </div>

                {activeTab === 'modules' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* LEFT COLUMN: CREATE ASSIGNMENT */}
                        <div className="lg:col-span-1 bg-white p-6 rounded-sm shadow-sm border border-gray-100 h-fit">
                            <h2 className="text-md font-bold mb-4 uppercase tracking-wide text-gray-800 border-b pb-2">Create Module</h2>
                            <form onSubmit={handleCreateAssignment} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                                    <input required type="text" className="w-full border border-gray-300 p-2 text-sm focus:border-primary-500 outline-none" placeholder="e.g. IGCSE Econ Unit 1" value={title} onChange={(e) => setTitle(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instructions</label>
                                    <textarea required className="w-full border border-gray-300 p-2 text-sm focus:border-primary-500 outline-none" rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Due Date</label>
                                    <input required type="date" className="w-full border border-gray-300 p-2 text-sm focus:border-primary-500 outline-none" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Questions ({selectedQuestions.length})</label>
                                    <div className="border border-gray-300 p-2 max-h-48 overflow-y-auto space-y-2 bg-gray-50">
                                        {questions.map((q) => (
                                            <div key={q.id} className="flex items-start gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    id={`q-${q.id}`}
                                                    checked={selectedQuestions.includes(q.id)}
                                                    onChange={() => toggleQuestion(q.id)}
                                                    className="mt-0.5"
                                                />
                                                <label htmlFor={`q-${q.id}`} className="cursor-pointer">
                                                    <span className="font-bold text-primary-900">[{q.type.toUpperCase()}]</span> {q.question_text.substring(0, 60)}...
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" disabled={loading || selectedQuestions.length === 0} className="w-full disabled:opacity-50 bg-green-500 text-white py-2 text-sm font-bold uppercase hover:bg-green-600 transition flex justify-center items-center shadow-sm">
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : "Publish Module"}
                                </button>
                            </form>
                        </div>

                        {/* RIGHT COLUMN: MY COURSES / MODULES */}
                        <div className="lg:col-span-3 bg-white p-8 rounded-sm shadow-sm border border-gray-100">
                            <h1 className="text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
                                <Lightbulb className="text-primary-700" size={28} /> My Courses/Modules
                            </h1>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0 border-t border-l border-gray-200">
                                {assignments.map((a: Assignment) => (
                                    <div
                                        key={a.id}
                                        onClick={() => navigate(`/teacher/assignments/${a.id}/submissions`)}
                                        className="border-b border-r border-gray-200 bg-white aspect-[4/3] flex flex-col items-center justify-center p-6 text-center hover:bg-gray-50 transition cursor-pointer group"
                                    >
                                        <BrainCircuit className="mb-4 text-gray-200 stroke-[1px] group-hover:text-primary-400 transition-colors w-12 h-12" />
                                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2 leading-snug">
                                            {a.title}
                                        </h3>
                                        <p className="text-[10px] text-gray-500 uppercase font-black">Submissions &gt;</p>
                                    </div>
                                ))}
                                {assignments.length === 0 && (
                                    <div className="col-span-3 p-12 text-center text-gray-400 text-sm font-semibold border-b border-r border-gray-200">No modules created yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'databank' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* LEFT COLUMN: CREATE QUESTION */}
                        <div className="lg:col-span-1 bg-white p-6 rounded-sm shadow-sm border border-gray-100 h-fit">
                            <h2 className="text-md font-bold mb-4 uppercase tracking-wide text-gray-800 border-b pb-2 flex items-center gap-2">
                                <Database size={18} className="text-primary-600" /> Add Databank
                            </h2>
                            <form onSubmit={handleCreateQuestion} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject / Category</label>
                                    <input required type="text" className="w-full border border-gray-300 p-2 text-sm focus:border-primary-500 outline-none" placeholder="e.g. CBSE AI/ML Olympiad - Class 10" value={qSubject} onChange={(e) => setQSubject(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Format</label>
                                    <div className="flex gap-4">
                                        <select className="flex-1 border border-gray-300 p-2 text-sm focus:border-primary-500 outline-none" value={qType} onChange={(e) => setQType(e.target.value)}>
                                            <option value="essay">Essay</option>
                                            <option value="short_answer">Short Answer</option>
                                            <option value="mcq">Multiple Choice (MCQ)</option>
                                            <option value="fill_blank">Cloze Passage (Fill-in-Blank)</option>
                                        </select>
                                        <div className="w-24">
                                            <label className="sr-only">Max Marks</label>
                                            <input required type="number" min="1" placeholder="Marks" className="w-full border border-gray-300 p-2 text-sm focus:border-primary-500 outline-none" value={qMaxMarks} onChange={(e) => setQMaxMarks(Number(e.target.value))} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Question Prompt</label>
                                    <textarea required className="w-full border border-gray-300 p-2 text-sm focus:border-primary-500 outline-none font-mono text-xs" rows={3} value={qText} onChange={(e) => setQText(e.target.value)} placeholder="e.g. Which algorithm is used for continuous price forecasting?" />
                                </div>

                                {qType === 'mcq' ? (
                                    <div className="space-y-3 bg-indigo-50/60 p-3 border border-indigo-200 rounded">
                                        <p className="text-[11px] font-bold text-indigo-900 uppercase">MCQ Options (A, B, C, D)</p>
                                        <input required type="text" className="w-full border p-1.5 text-xs" placeholder="Option A" value={mcqOptA} onChange={e => setMcqOptA(e.target.value)} />
                                        <input required type="text" className="w-full border p-1.5 text-xs" placeholder="Option B" value={mcqOptB} onChange={e => setMcqOptB(e.target.value)} />
                                        <input required type="text" className="w-full border p-1.5 text-xs" placeholder="Option C" value={mcqOptC} onChange={e => setMcqOptC(e.target.value)} />
                                        <input required type="text" className="w-full border p-1.5 text-xs" placeholder="Option D" value={mcqOptD} onChange={e => setMcqOptD(e.target.value)} />
                                        <div>
                                            <label className="block text-[11px] font-bold text-indigo-900 uppercase mb-1">Correct Answer Key</label>
                                            <select className="w-full border p-1.5 text-xs font-bold bg-white" value={mcqCorrectKey} onChange={e => setMcqCorrectKey(e.target.value)}>
                                                <option value="A">Option A</option>
                                                <option value="B">Option B</option>
                                                <option value="C">Option C</option>
                                                <option value="D">Option D</option>
                                            </select>
                                        </div>
                                    </div>
                                ) : qType === 'fill_blank' ? (
                                    <div className="space-y-2 bg-amber-50/60 p-3 border border-amber-200 rounded">
                                        <label className="block text-[11px] font-bold text-amber-900 uppercase">Accepted Answers / Synonyms (comma separated)</label>
                                        <input required type="text" className="w-full border p-1.5 text-xs" placeholder="e.g. Linear Regression, Regression" value={blankAnswersInput} onChange={e => setBlankAnswersInput(e.target.value)} />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Standard Answer (Mark Scheme)</label>
                                        <textarea required className="w-full border border-gray-300 p-2 text-sm focus:border-primary-500 outline-none font-mono text-xs" rows={3} value={qStandardAnswer} onChange={(e) => setQStandardAnswer(e.target.value)} />
                                    </div>
                                )}

                                <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-2 text-[10px] tracking-widest font-black uppercase hover:bg-primary-700 transition flex justify-center items-center shadow-sm">
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : "+ Save to Databank"}
                                </button>
                            </form>
                        </div>

                        {/* RIGHT COLUMN: QUESTION BANK */}
                        <div className="lg:col-span-3 bg-white p-8 rounded-sm shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-primary-100">
                                <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                                    <BookOpen className="text-primary-700" size={28} /> Global Databank ({filteredQuestions.length})
                                </h1>
                                <select
                                    className="border border-gray-300 text-sm font-bold uppercase tracking-widest text-primary-900 p-2 outline-none shadow-sm"
                                    value={filterSubject}
                                    onChange={(e) => setFilterSubject(e.target.value)}
                                >
                                    <option value="All">ALL SUBJECTS</option>
                                    {uniqueSubjects.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-4">
                                {filteredQuestions.map((q: any) => {
                                    let opts = [];
                                    if (q.mcq_options_json) {
                                        try { opts = typeof q.mcq_options_json === 'string' ? JSON.parse(q.mcq_options_json) : q.mcq_options_json; } catch (e) {}
                                    }
                                    return (
                                        <div key={q.id} className="border border-gray-200 p-5 rounded-sm bg-gray-50 hover:bg-white transition shadow-sm group">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-primary-900 text-white text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded-sm shadow-sm">
                                                        {q.subject || 'Uncategorized'}
                                                    </span>
                                                    <span className={`text-white text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded-sm ${
                                                        q.type === 'mcq' ? 'bg-indigo-600' :
                                                        q.type === 'fill_blank' ? 'bg-amber-600' : 'bg-gray-600'
                                                    }`}>
                                                        {q.type.replace('_', ' ')}
                                                    </span>
                                                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                                        {q.max_marks || 5} Marks
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-bold tracking-widest">ID: {q.id.slice(0, 8)}...</span>
                                            </div>
                                            <div className="text-sm font-bold text-gray-900 mb-2" dangerouslySetInnerHTML={{ __html: q.question_text }} />
                                            
                                            {q.type === 'mcq' && opts.length > 0 && (
                                                <div className="grid grid-cols-2 gap-2 my-3">
                                                    {opts.map((opt: any) => {
                                                        const isAns = q.standard_answer === opt.key || q.standard_answer === opt.text;
                                                        return (
                                                            <div key={opt.key} className={`p-2 border text-xs font-semibold rounded ${isAns ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold' : 'bg-white border-gray-200 text-gray-700'}`}>
                                                                <span className="font-bold mr-1">{opt.key}:</span> {opt.text} {isAns && '✓ (Correct)'}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            <div className="mt-4 pt-3 border-t border-gray-200">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-green-700 mb-1">Standard Answer / Key:</p>
                                                <div className="text-xs font-bold text-gray-800 bg-white p-2 border border-gray-200 inline-block rounded">
                                                    {q.standard_answer || 'No standard answer.'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredQuestions.length === 0 && (
                                    <div className="text-center py-12 text-gray-400 text-xs font-bold uppercase tracking-widest">No questions found for this subject.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'reassessments' && (
                    <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
                        <h1 className="text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
                            <BookOpen className="text-primary-700" size={28} /> Pending Reassessments
                        </h1>
                        <div className="space-y-4">
                            {pendingReassessments.map(req => (
                                <div key={req.id} className="border border-gray-200 p-5 rounded-sm bg-gray-50 flex justify-between items-center hover:bg-white transition shadow-sm cursor-pointer"
                                     onClick={() => navigate(`/teacher/submissions/${req.id}`)}
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-yellow-500 text-white text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded-sm shadow-sm">
                                                Reassessment
                                            </span>
                                            <span className="text-xs font-bold text-gray-700">{req.student_name}</span>
                                            <span className="text-xs text-gray-500">• {req.assignment_title}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 line-clamp-2" dangerouslySetInnerHTML={{ __html: req.question_text }} />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-gray-500 uppercase">Current Score</div>
                                        <div className="text-xl font-black text-gray-900">{req.marks_awarded}</div>
                                    </div>
                                </div>
                            ))}
                            {pendingReassessments.length === 0 && (
                                <div className="text-center py-12 text-gray-400 text-xs font-bold uppercase tracking-widest">No pending reassessments! You're all caught up.</div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
