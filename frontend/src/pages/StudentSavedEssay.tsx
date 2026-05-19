import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Bell, ShoppingCart, X } from 'lucide-react';

interface SubmissionDetail {
    id: string;
    answer_text: string;
    marks_awarded: number | null;
    feedback: string | null;
    student_name: string;
    question_text: string;
    standard_answer: string | null;
    assignment_id: string;
    assignment_title?: string;
    max_marks?: number;
    ocr_text?: string;
    submitted_at?: string;
}

export default function StudentSavedEssay() {
    const { id } = useParams() as { id: string };
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [activeFeedback, setActiveFeedback] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const res = await api.get(`/submissions/${id}`);
                setSubmission(res.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load essay details.');
            }
        };
        fetchSubmission();
    }, [id]);

    if (!submission) return <div className="p-12 text-center text-primary-900 font-black uppercase tracking-widest text-sm">Loading details...</div>;

    const dt = submission.submitted_at ? new Date(submission.submitted_at) : new Date();
    const dateStr = dt.toLocaleDateString('en-GB');
    const timeStr = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    // NLP Sentence Diffing Logic
    const rawStudentText = submission.ocr_text ? submission.ocr_text : (submission.answer_text ? submission.answer_text.replace(/<[^>]+>/g, '') : '');
    const standardSentences = submission.standard_answer ? submission.standard_answer.replace(/<[^>]+>/g, '').split(/(?<=[.!?])\s+/) : [];

    const parsedActualAnswer = standardSentences.map((sentence, idx) => {
        if (!sentence.trim()) return null;
        // Simple NLP boolean intersection (simulating string-similarity matching per phrase)
        const studentTokens = rawStudentText.toLowerCase().split(/\s+/);
        const standardTokens = sentence.toLowerCase().split(/\s+/);
        const matchCount = standardTokens.filter(t => studentTokens.includes(t) && t.length > 3).length;
        const isMatched = matchCount >= Math.min(2, standardTokens.length / 3);

        return (
            <div key={idx} className={`mb-2 font-medium text-sm leading-relaxed ${isMatched ? 'text-green-600' : 'text-red-500'}`}>
                {sentence}
            </div>
        );
    });

    const maxM = submission.max_marks || 6;
    const scoredM = submission.marks_awarded || 0;
    const cfPercent = ((scoredM / maxM) * 100).toFixed(2);

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
                <div className="flex justify-between items-center">
                    <button onClick={() => navigate('/student-dashboard')} className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-primary-600 hover:text-primary-800 transition">
                        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                    </button>
                    <button onClick={() => setShowModal(true)} className="bg-primary-800 text-white px-5 py-2 text-xs font-bold uppercase tracking-widest shadow-md hover:bg-primary-900 transition">
                        View Detailed Report
                    </button>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs font-bold border border-red-200">{error}</div>}

                {/* Detailed Feedback Grid Table */}
                <div className="bg-white border-2 border-black overflow-hidden shadow-sm">
                    {/* Header Table */}
                    <div className="grid grid-cols-[1fr_2fr_1fr_1fr] border-b-2 border-black text-sm font-bold divide-x-2 divide-black">
                        <div className="grid grid-rows-3 divide-y-2 divide-black text-center">
                            <div className="p-2 flex items-center justify-center">Student name</div>
                            <div className="p-2 flex items-center justify-center">Date</div>
                            <div className="p-2 flex items-center justify-center">Time</div>
                        </div>
                        <div className="grid grid-rows-3 divide-y-2 divide-black text-center font-normal">
                            <div className="p-2 flex items-center justify-center font-bold">{user?.email || 'student@domain.com'}</div>
                            <div className="p-2 flex items-center justify-center">{dateStr}</div>
                            <div className="p-2 flex items-center justify-center">{timeStr}</div>
                        </div>
                        <div className="grid grid-rows-3 divide-y-2 divide-black text-center">
                            <div className="p-2 flex items-center justify-center">Total Ques</div>
                            <div className="p-2 flex items-center justify-center">Total Score</div>
                            <div className="p-2 flex items-center justify-center">score</div>
                        </div>
                        <div className="grid grid-rows-3 divide-y-2 divide-black text-center font-bold">
                            <div className="p-2 flex items-center justify-center">1</div>
                            <div className="p-2 flex items-center justify-center">{maxM}</div>
                            <div className="p-2 flex items-center justify-center">{scoredM}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-[1fr_4fr] border-b-2 border-black divide-x-2 divide-black font-bold text-sm">
                        <div className="p-2 text-center flex items-center justify-center">Assignment</div>
                        <div className="p-2 text-center font-normal">{submission.assignment_title || 'Economics Unit Essay'}</div>
                    </div>

                    {/* Columns Details */}
                    <div className="flex border-b-2 border-black font-bold text-xs text-center divide-x-2 divide-black">
                        <div className="p-2 w-1/3 flex items-center justify-center">Student Answer</div>
                        <div className="p-2 w-[calc(66.666%-200px)] flex items-center justify-center">Actual Answer</div>
                        <div className="p-2 w-[50px] flex items-center justify-center">Max. Marks</div>
                        <div className="p-2 w-[50px] flex items-center justify-center">Scored</div>
                        <div className="p-2 w-[50px] flex items-center justify-center">C.F %</div>
                        <div className="p-2 w-[50px] flex items-center justify-center">Answer Explanation</div>
                    </div>

                    {/* Question Row */}
                    <div className="border-b-2 border-black p-4 text-xs font-bold bg-gray-50 flex gap-4">
                        <span className="shrink-0">Question: 1</span>
                        <div dangerouslySetInnerHTML={{ __html: submission.question_text }} />
                    </div>

                    {/* Content Row */}
                    <div className="flex divide-x-2 divide-black min-h-[400px]">
                        <div className="p-4 w-1/3 text-xs leading-relaxed whitespace-pre-wrap font-serif italic text-gray-800">
                            {rawStudentText || "No text provided."}
                        </div>
                        <div className="p-4 w-[calc(66.666%-200px)]">
                            {parsedActualAnswer}
                        </div>
                        <div className="p-4 w-[50px] text-center font-bold text-sm border-l-2 border-black border-r-0">{maxM}</div>
                        <div className="p-4 w-[50px] text-center font-bold text-sm border-l-2 border-black border-r-0">{scoredM}</div>
                        <div className="p-4 w-[50px] text-center font-bold text-sm border-l-2 border-black border-r-0">{cfPercent}</div>
                        <div className="p-4 w-[50px] text-center font-bold text-sm border-l-2 border-black border-r-0 border-r-transparent"></div>
                    </div>
                </div>

                {/* Pedagogical Modals */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                        <div className="bg-white w-full max-w-4xl shadow-2xl overflow-hidden relative border border-gray-400">
                            <div className="bg-[#483259] text-white px-6 py-4 flex justify-between items-center">
                                <h2 className="text-xl font-semibold tracking-wide">Student Report: {submission.assignment_title}</h2>
                                <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-300 transition">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 pb-12 overflow-x-auto">
                                <table className="w-full border-collapse border-2 border-black text-center text-sm font-bold">
                                    <thead className="bg-gray-50">
                                        <tr className="divide-x-2 divide-black border-b-2 border-black">
                                            <th className="p-4 bg-[#e5e1e8]"></th>
                                            <th className="p-4 w-[14%]">Task Achievement</th>
                                            <th className="p-4 w-[14%]">Coherence and Cohesion</th>
                                            <th className="p-4 w-[14%]">Lexical Resource</th>
                                            <th className="p-4 w-[14%]">Grammatical Range and Accuracy</th>
                                            <th className="p-4 w-[14%]">Creativity Index</th>
                                            <th className="p-4 w-[16%]">Final Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-black">
                                        <tr className="divide-x-2 divide-black bg-[#e5e1e8]">
                                            <td className="p-4 font-black">Weighted Mark</td>
                                            <td className="p-4 font-medium">{scoredM.toFixed(2)}</td>
                                            <td className="p-4 font-medium">0.00</td>
                                            <td className="p-4 font-medium">0.00</td>
                                            <td className="p-4 font-medium">0.00</td>
                                            <td className="p-4 font-medium">0.00</td>
                                            <td className="p-4 font-black bg-[#aa9cb6] text-white tracking-widest">{scoredM.toFixed(2)} / {maxM.toFixed(2)}</td>
                                        </tr>
                                        <tr className="divide-x-2 divide-black bg-white">
                                            <td className="p-4 font-black bg-[#e5e1e8]">Feedback</td>
                                            <td className="p-4">
                                                <button onClick={() => setActiveFeedback('task')} className="bg-[#2D1B42] text-white text-[10px] uppercase font-bold px-4 py-1.5 rounded-sm shadow hover:bg-purple-900 transition">Feedback</button>
                                            </td>
                                            <td className="p-4"></td>
                                            <td className="p-4"></td>
                                            <td className="p-4">
                                                <button onClick={() => setActiveFeedback('grammar')} className="bg-[#2D1B42] text-white text-[10px] uppercase font-bold px-4 py-1.5 rounded-sm shadow hover:bg-purple-900 transition">Feedback</button>
                                            </td>
                                            <td className="p-4"></td>
                                            <td className="p-4"></td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="mt-8 text-lg font-medium text-gray-800">
                                    Student's Name: <span className="font-normal">{submission.student_name}</span>
                                </div>
                            </div>

                            {/* Inner Modals for Feedback Category Buttons */}
                            {activeFeedback && (
                                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 bg-white shadow-2xl border border-gray-300 z-50">
                                    <div className="bg-[#483259] text-white text-xs font-bold uppercase tracking-widest p-2 flex justify-between items-center text-center">
                                        <span className="flex-1">FEEDBACK</span>
                                        <button onClick={() => setActiveFeedback(null)} className="hover:text-gray-300"><X size={14} /></button>
                                    </div>
                                    <div className="p-4 text-xs leading-relaxed text-gray-700 bg-white">
                                        {activeFeedback === 'task' ? (
                                            <>Click on the "Feedback" button at the bottom of each column of the feedback summary to get the detail result of each category of assessment.</>
                                        ) : (
                                            <>No extensive grammar remarks provided for this submission block.</>
                                        )}
                                        <div className="flex justify-end mt-4">
                                            <button onClick={() => setActiveFeedback(null)} className="border border-gray-300 px-4 py-1 rounded text-xs text-gray-600 hover:bg-gray-50 transition">Close</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
