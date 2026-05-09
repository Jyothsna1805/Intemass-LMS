import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Printer, Bell, ShoppingCart } from 'lucide-react';

interface SubmissionDetail { id: string; answer_text: string; marks_awarded: number | null; feedback: string | null; student_name: string; question_text: string; standard_answer: string | null; assignment_id: string; }

export default function StudentSavedEssay() {
    const { id } = useParams() as { id: string };
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSubmission = async () => {
            try { const res = await api.get(`/submissions/${id}`); setSubmission(res.data); } catch (err) { console.error(err); setError('Failed to load essay details.'); }
        };
        fetchSubmission();
    }, [id]);

    const handlePrintFeedback = async () => {
        try {
            const response = await api.get(`/submissions/print-feedback/${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url; link.setAttribute('download', `Feedback_${id}.pdf`);
            document.body.appendChild(link); link.click(); link.parentNode?.removeChild(link);
        } catch (err) { console.error('Error downloading PDF', err); alert('Failed to download PDF feedback.'); }
    };

    if (!submission) return <div className="p-12 text-center text-primary-900 font-black uppercase tracking-widest text-sm">Loading details...</div>;

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

            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
                <button onClick={() => navigate('/student-dashboard')} className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-primary-600 hover:text-primary-800 transition">
                    <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                </button>

                <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-6 border-b-2 border-primary-100 pb-4">
                        <div>
                            <h1 className="text-sm font-extrabold text-primary-900 uppercase tracking-widest mb-1">Essay Feedback Report</h1>
                            <p className="text-xs text-gray-500 font-bold uppercase">Student: {submission.student_name}</p>
                        </div>
                        <button onClick={handlePrintFeedback} className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100 px-4 py-2 uppercase tracking-widest text-[10px] font-black transition-colors shadow-sm">
                            <Printer size={14} /> Print PDF
                        </button>
                    </div>

                    {error && <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs font-bold border border-red-200">{error}</div>}

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Question Prompt</h3>
                            <div className="bg-gray-50 p-6 border border-gray-200 text-gray-900 text-sm font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: submission.question_text }} />
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-200 pb-2">Your Answer</h3>
                            <div className="bg-white border border-gray-300 p-6 min-h-[150px] text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                                {submission.answer_text ? (
                                    <div dangerouslySetInnerHTML={{ __html: submission.answer_text }} />
                                ) : (
                                    <span className="text-gray-400 italic">No text provided.</span>
                                )}
                            </div>
                        </div>

                        <div className="bg-green-50 p-6 border border-green-200">
                            <h3 className="text-sm font-extrabold text-green-900 mb-4 border-b-2 border-green-200 pb-2 uppercase tracking-widest">Final Evaluation</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <p className="text-[10px] font-black text-green-800 uppercase tracking-widest mb-1">Marks Awarded</p>
                                    <p className="text-4xl font-black text-green-900">
                                        {submission.marks_awarded !== null ? submission.marks_awarded : '---'}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-[10px] font-black text-green-800 uppercase tracking-widest mb-1">Tutor's Feedback</p>
                                    <p className="text-green-900 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                        {submission.feedback || 'No feedback provided yet.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
