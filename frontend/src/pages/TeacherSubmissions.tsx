import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle, Bell, ShoppingCart } from 'lucide-react';

interface Submission { id: string; marks_awarded: number | null; submitted_at: string; student_name: string; question_text: string; }

export default function TeacherSubmissions() {
    const { id } = useParams() as { id: string };
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [assignmentTitle, setAssignmentTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const [subRes, assignRes] = await Promise.all([
                    api.get(`/assignments/${id}/submissions`), api.get(`/assignments/${id}`)
                ]);
                setSubmissions(subRes.data); setAssignmentTitle(assignRes.data.title);
            } catch (err) { console.error('Failed to fetch submissions', err); } finally { setLoading(false); }
        };
        fetchSubmissions();
    }, [id]);

    if (loading) return <div className="p-12 text-center text-primary-900 font-black uppercase tracking-widest text-sm">Loading submissions...</div>;

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
                <button onClick={() => navigate('/teacher-dashboard')} className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-primary-600 hover:text-primary-800 transition">
                    <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                </button>

                <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
                    <div className="border-b-2 border-primary-100 pb-4 mb-6">
                        <h1 className="text-sm font-extrabold text-primary-900 uppercase tracking-widest mb-1">Submissions Overview</h1>
                        <p className="text-xs text-gray-500 font-bold uppercase">{assignmentTitle}</p>
                    </div>

                    <div className="overflow-hidden border border-gray-200 shadow-sm rounded-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-[10px] font-black tracking-widest text-gray-500 uppercase sm:pl-6">Student</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-[10px] font-black tracking-widest text-gray-500 uppercase">Question Prompt</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-[10px] font-black tracking-widest text-gray-500 uppercase">Received Time</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-[10px] font-black tracking-widest text-gray-500 uppercase">Evaluation</th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Action</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {submissions.map((submission) => (
                                    <tr key={submission.id} className="hover:bg-gray-50 transition">
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-gray-900 sm:pl-6">
                                            {submission.student_name}
                                        </td>
                                        <td className="px-3 py-4 text-xs font-medium text-gray-600 max-w-xs truncate" dangerouslySetInnerHTML={{ __html: submission.question_text }} />
                                        <td className="whitespace-nowrap px-3 py-4 text-xs font-bold text-gray-400">
                                            {new Date(submission.submitted_at).toLocaleString()}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-xs font-bold text-gray-500">
                                            {submission.marks_awarded !== null ? (
                                                <span className="inline-flex items-center gap-1 text-green-800 bg-green-100 px-3 py-1 text-[10px] uppercase tracking-widest font-black border border-green-200">
                                                    <CheckCircle size={12} /> Scored ({submission.marks_awarded})
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-yellow-800 bg-yellow-100 px-3 py-1 text-[10px] uppercase tracking-widest font-black border border-yellow-200">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-xs font-bold sm:pr-6">
                                            <button onClick={() => navigate(`/teacher/submissions/${submission.id}`)} className="bg-primary-600 text-white px-4 py-2 uppercase tracking-widest hover:bg-primary-700 transition shadow-sm">
                                                {submission.marks_awarded !== null ? 'Modify Mark' : 'Evaluate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {submissions.length === 0 && (
                            <div className="text-center py-12 text-gray-400 text-xs font-bold uppercase tracking-widest">No submissions received yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
