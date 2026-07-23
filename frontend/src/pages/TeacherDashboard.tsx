import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, BrainCircuit, Bell, ShoppingCart, Loader2, Database, BookOpen } from 'lucide-react';

interface Question { id: string; question_text: string; type: string; subject: string; standard_answer: string; }
interface Assignment { id: string; title: string; due_date: string; }

export default function TeacherDashboard() {
    const { logout } = useAuth();
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
    const [qMaxMarks, setQMaxMarks] = useState<number>(10);
    const [filterSubject, setFilterSubject] = useState('All');

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
        try {
            await api.post('/questions', {
                questionText: qText,
                standardAnswer: qStandardAnswer,
                type: qType,
                subject: qSubject || 'Uncategorized',
                maxMarks: qMaxMarks
            });
            setQText(''); setQStandardAnswer('');
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
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <img src="/logo.png" alt="MegaForte" className="h-10 w-10 object-contain bg-white rounded-full shadow-sm" />
                    </div>

                    <div className="hidden lg:flex items-center gap-6">
                        <div className="flex items-center gap-4 text-white/90">
                            <Bell size={18} className="cursor-pointer hover:text-white" />
                            <div className="flex items-center text-sm font-bold cursor-pointer hover:text-white">
                                <ShoppingCart size={18} className="mr-1" /> Cart (0)
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="border border-white/50 text-white px-4 py-1.5 text-sm font-semibold hover:bg-white/10">Account</button>
                            <button onClick={logout} className="bg-green-500 text-white px-4 py-1.5 text-sm font-bold uppercase hover:bg-green-600">SIGNOUT</button>
                            <button className="bg-blue-500 text-white px-6 py-1.5 text-sm font-bold hover:bg-blue-600 ml-2">Start Here</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

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
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Questions</label>
                                    <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 p-2 bg-gray-50">
                                        {questions.map((q) => (
                                            <div key={q.id} className="flex items-start gap-2 p-1 hover:bg-white cursor-pointer" onClick={() => toggleQuestion(q.id)}>
                                                <input type="checkbox" className="mt-1" checked={selectedQuestions.includes(q.id)} readOnly />
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[10px] bg-primary-100 text-primary-800 px-1 py-0.5 uppercase font-bold">{q.type.replace('_', ' ')}</span>
                                                        <span className="text-[10px] bg-gray-200 text-gray-600 px-1 py-0.5 uppercase font-bold truncate max-w-[80px]">{q.subject || 'Misc'}</span>
                                                    </div>
                                                    <p className="text-xs mt-1 text-gray-800 line-clamp-2 leading-tight" dangerouslySetInnerHTML={{ __html: q.question_text }} />
                                                </div>
                                            </div>
                                        ))}
                                        {questions.length === 0 && <p className="text-[10px] text-gray-400 p-2 uppercase font-bold">No questions available.</p>}
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
                                    <input required type="text" className="w-full border border-gray-300 p-2 text-sm focus:border-primary-500 outline-none" placeholder="e.g. Biology 101" value={qSubject} onChange={(e) => setQSubject(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Format</label>
                                    <div className="flex gap-4">
                                        <select className="flex-1 border border-gray-300 p-2 text-sm focus:border-primary-500 outline-none" value={qType} onChange={(e) => setQType(e.target.value)}>
                                            <option value="essay">Essay</option>
                                            <option value="short_answer">Short Answer</option>
                                        </select>
                                        <div className="w-24">
                                            <label className="sr-only">Max Marks</label>
                                            <input required type="number" min="1" placeholder="Marks" className="w-full border border-gray-300 p-2 text-sm focus:border-primary-500 outline-none" value={qMaxMarks} onChange={(e) => setQMaxMarks(Number(e.target.value))} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Question Prompt</label>
                                    <textarea required className="w-full border border-gray-300 p-2 text-sm focus:border-primary-500 outline-none font-mono text-xs" rows={4} value={qText} onChange={(e) => setQText(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Standard Answer (Mark Scheme)</label>
                                    <textarea required className="w-full border border-gray-300 p-2 text-sm focus:border-primary-500 outline-none font-mono text-xs" rows={4} value={qStandardAnswer} onChange={(e) => setQStandardAnswer(e.target.value)} />
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-2 text-[10px] tracking-widest font-black uppercase hover:bg-primary-700 transition flex justify-center items-center shadow-sm">
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : "+ Save to Databank"}
                                </button>
                            </form>
                        </div>

                        {/* RIGHT COLUMN: QUESTION BANK */}
                        <div className="lg:col-span-3 bg-white p-8 rounded-sm shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-primary-100">
                                <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                                    <BookOpen className="text-primary-700" size={28} /> Global Databank
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
                                {filteredQuestions.map((q) => (
                                    <div key={q.id} className="border border-gray-200 p-5 rounded-sm bg-gray-50 hover:bg-white transition shadow-sm group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-primary-900 text-white text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded-sm shadow-sm">
                                                    {q.subject || 'Uncategorized'}
                                                </span>
                                                <span className="bg-gray-200 text-gray-600 text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded-sm">
                                                    {q.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-bold tracking-widest">ID: {q.id.slice(0, 8)}...</span>
                                        </div>
                                        <div className="text-sm font-bold text-gray-900 mb-2" dangerouslySetInnerHTML={{ __html: q.question_text }} />
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-green-700 mb-1">Standard Answer (Model):</p>
                                            <div className="text-sm font-medium text-gray-600 italic whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: q.standard_answer || 'No standard answer.' }} />
                                        </div>
                                    </div>
                                ))}
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
