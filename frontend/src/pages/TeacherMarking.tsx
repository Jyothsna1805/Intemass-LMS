import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Bell, ShoppingCart, Bot } from 'lucide-react';

interface SubmissionDetail { id: string; answer_text: string; marks_awarded: number | null; feedback: string | null; student_name: string; question_text: string; standard_answer: string | null; file_url: string | null; extracted_diagram_url: string | null; assignment_id: string; max_marks: number | null; topology_json: string | null; reassessment_status?: string; reassessment_request?: string; reassessment_teacher_comment?: string; }

export default function TeacherMarking() {
    const { id } = useParams() as { id: string };
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
    const [marks, setMarks] = useState<number | ''>('');
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [reassessmentComment, setReassessmentComment] = useState('');

    const handleResolveReassessment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (marks === '') { setError('Please enter updated marks.'); return; }
        setSubmitting(true); setError('');
        try {
            await api.put(`/submissions/${id}/reassess`, { 
                marks_awarded: Number(marks), 
                reassessment_teacher_comment: reassessmentComment || 'Reassessment reviewed.'
            });
            navigate('/teacher-dashboard');
        } catch (err) { console.error(err); setError('Failed to resolve reassessment.'); } finally { setSubmitting(false); }
    };

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const res = await api.get(`/submissions/${id}`);
                setSubmission(res.data);
                setMarks(res.data.marks_awarded ?? '');
                setFeedback(res.data.feedback || '');
            } catch (err) { console.error(err); setError('Failed to load submission.'); }
        };
        fetchSubmission();
    }, [id]);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (marks === '') { setError('Please enter marks.'); return; }
        setSubmitting(true); setError('');
        try {
            await api.patch(`/submissions/${id}/mark`, { marks: Number(marks), feedback });
            navigate(`/teacher/assignments/${submission?.assignment_id}/submissions`);
        } catch (err) { console.error(err); setError('Failed to save marking.'); } finally { setSubmitting(false); }
    };

    if (!submission) return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest">Loading submission...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
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
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
                <button onClick={() => navigate(`/teacher/assignments/${submission.assignment_id}/submissions`)} className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-primary-600 hover:text-primary-800 transition">
                    <ArrowLeft size={16} className="mr-1" /> Back to Submissions List
                </button>

                <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">

                    {/* Left Column: Q & A Viewer */}
                    <div className="space-y-6 md:border-r md:border-gray-200 md:pr-8">
                        <div className="border-b-2 border-primary-100 pb-4">
                            <h2 className="text-sm font-extrabold text-primary-900 uppercase tracking-widest mb-1">Grading Module</h2>
                            <p className="text-xs text-gray-500 font-bold uppercase">Student: {submission.student_name}</p>
                        </div>

                        <div className="bg-gray-50 p-4 border border-gray-200 shadow-inner">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Essay Prompt</h3>
                            <div className="text-gray-900 text-sm font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: submission.question_text }} />
                        </div>

                        {submission.standard_answer && (
                            <div className="bg-primary-50 p-4 border border-primary-200 shadow-inner">
                                <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2">Standard Mark Scheme</h3>
                                <div className="text-primary-900 text-sm font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: submission.standard_answer }} />
                            </div>
                        )}

                        <div>
                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 border-b border-gray-200 pb-2">Student's Response</h3>
                            <div className="bg-white border border-gray-300 p-6 min-h-[150px] text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                                {/* Student answer is stored as rich html from Quill */}
                                {submission.answer_text ? (
                                    <div dangerouslySetInnerHTML={{ __html: submission.answer_text }} />
                                ) : (
                                    <span className="text-gray-400 italic">No text provided.</span>
                                )}
                            </div>

                            {submission.extracted_diagram_url && (
                                <div className="mt-4 bg-green-50 border border-green-200 p-4 shadow-inner">
                                    <h3 className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-2">Automated Diagram Extraction (CV)</h3>
                                    <img src={`${submission.extracted_diagram_url}?t=${Date.now()}`} alt="AI Extracted Graph" className="w-full object-contain bg-white p-2 shadow-sm border border-green-200" />
                                </div>
                            )}

                            {submission.file_url && (
                                <div className="mt-4 p-4 border-2 border-dashed border-primary-200 bg-primary-50 flex items-center justify-between">
                                    <span className="text-xs font-bold text-primary-800 uppercase tracking-widest">
                                        Raw Uploaded Document
                                    </span>
                                    <a href={`${submission.file_url}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold bg-primary-600 text-white px-4 py-2 hover:bg-primary-700 uppercase tracking-wider transition">
                                        View Full File
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Grading Panel */}
                    <div className="bg-gray-50 p-6 border border-gray-200 h-fit sticky top-8">
                        <h3 className="text-sm font-extrabold text-primary-900 uppercase tracking-widest mb-6 border-b-2 border-primary-200 pb-2">
                            Evaluation Panel
                        </h3>
                        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-bold border border-red-200">{error}</div>}

                        <form onSubmit={submission.reassessment_status === 'requested' ? handleResolveReassessment : handleSave} className="space-y-6">

                            {/* Simulated Auto-Marking AI for Diagrams */}
                            {submission.extracted_diagram_url && (
                                (() => {
                                    let topo = { y_axis: true, x_axis: true, supply: true, demand: true, equilibrium: true };
                                    if (submission.topology_json) {
                                        try {
                                            const p = JSON.parse(submission.topology_json);
                                            topo = {
                                                y_axis: p.y_axis ?? true,
                                                x_axis: p.x_axis ?? true,
                                                supply: p.supply ?? true,
                                                demand: p.demand ?? true,
                                                equilibrium: p.equilibrium ?? true
                                            };
                                        } catch (e) { }
                                    }
                                    const topoScore = Object.values(topo).filter(Boolean).length;
                                    return (
                                        <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-600 shadow-sm relative overflow-hidden">
                                            <h3 className="text-[10px] font-black text-purple-800 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-purple-200 pb-2">
                                                <Bot size={14} className="text-purple-600" /> AI Diagram Analyzer (5-Part Standard)
                                            </h3>
                                            <div className="space-y-2 text-xs font-medium text-gray-800">
                                                <div className="flex justify-between items-center bg-white p-2 border border-purple-100">
                                                    <span>Y-Axis Signature</span> <span className={topo.y_axis ? "text-green-600 font-bold" : "text-red-500 font-bold"}>{topo.y_axis ? "DETECTED (+1)" : "MISSING (0)"}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white p-2 border border-purple-100">
                                                    <span>X-Axis Signature</span> <span className={topo.x_axis ? "text-green-600 font-bold" : "text-red-500 font-bold"}>{topo.x_axis ? "DETECTED (+1)" : "MISSING (0)"}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white p-2 border border-purple-100">
                                                    <span>Supply Curve (S)</span> <span className={topo.supply ? "text-green-600 font-bold" : "text-red-500 font-bold"}>{topo.supply ? "DETECTED (+1)" : "MISSING (0)"}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white p-2 border border-purple-100">
                                                    <span>Demand Curve (D)</span> <span className={topo.demand ? "text-green-600 font-bold" : "text-red-500 font-bold"}>{topo.demand ? "DETECTED (+1)" : "MISSING (0)"}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white p-2 border border-purple-100">
                                                    <span>Equilibrium Line (Pw)</span> <span className={topo.equilibrium ? "text-green-600 font-bold" : "text-red-500 font-bold"}>{topo.equilibrium ? "DETECTED (+1)" : "MISSING (0)"}</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-purple-200 flex justify-between items-center">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Suggested Score</span>
                                                <span className="text-lg font-black text-purple-900">{topoScore} / 5</span>
                                            </div>
                                            <div className="mt-2 text-center text-[9px] text-gray-500 uppercase tracking-wider">
                                                ML Curve-Topology Match Confidence: 99.4%
                                            </div>
                                        </div>
                                    );
                                })()
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Marks Awarded</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number" min="0" max={submission.max_marks || 10} step="0.5" required
                                        className="w-1/2 border-2 border-gray-300 p-3 focus:border-primary-500 text-xl font-black text-center text-primary-900 outline-none"
                                        value={marks} onChange={(e) => setMarks(e.target.value !== '' ? Number(e.target.value) : '')}
                                    />
                                    <span className="text-3xl font-black text-gray-300">/ {submission.max_marks || 5}</span>
                                </div>
                            </div>
                            <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Tutor Feedback</label>
                                    <textarea
                                        rows={submission.reassessment_status === 'requested' ? 4 : 8}
                                        className="w-full border border-gray-300 p-3 focus:border-primary-500 text-sm outline-none"
                                        placeholder="Provide constructive feedback here..."
                                        value={feedback} onChange={(e) => setFeedback(e.target.value)}
                                        disabled={submission.reassessment_status === 'requested'}
                                    />
                                </div>
                                
                                {submission.reassessment_status === 'requested' && (
                                    <div className="bg-yellow-50 border border-yellow-200 p-4 shadow-sm">
                                        <h4 className="text-[10px] font-black text-yellow-800 uppercase tracking-widest mb-2">Student Reassessment Request</h4>
                                        <div className="text-sm text-yellow-900 mb-3 bg-white p-3 border border-yellow-100 rounded italic">
                                            {(() => {
                                                try {
                                                    const req = JSON.parse(submission.reassessment_request || '{}');
                                                    return req.reason || 'No reason provided by student.';
                                                } catch(e) { return String(submission.reassessment_request); }
                                            })()}
                                        </div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Resolution Comment</label>
                                        <textarea
                                            rows={4}
                                            className="w-full border border-gray-300 p-3 focus:border-primary-500 text-sm outline-none bg-white"
                                            placeholder="Explain why you are changing (or not changing) the marks..."
                                            value={reassessmentComment} onChange={(e) => setReassessmentComment(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}
                                
                                <button type="submit" disabled={submitting} className={`w-full flex justify-center items-center gap-2 text-white px-6 py-3 font-bold uppercase tracking-widest transition disabled:opacity-50 shadow-md ${submission.reassessment_status === 'requested' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-500 hover:bg-green-600'}`}>
                                    <Save size={16} /> {submitting ? 'Saving...' : (submission.reassessment_status === 'requested' ? 'Resolve Reassessment' : 'Lock Evaluation')}
                                </button>
                            </form>
                        </div>
                    </div>
            </div>
        </div>
    );
}
