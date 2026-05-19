import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Lightbulb, BrainCircuit, Bell, ShoppingCart, CheckCircle, FileText } from 'lucide-react';

interface Assignment { id: string; title: string; instructions: string; due_date: string; }
interface Submission { id: string; assignment_id: string; marks_awarded: number | null; assignment_title: string; }

export default function StudentDashboard() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const aRes = await api.get('/assignments');
                setAssignments(aRes.data);

                const sRes = await api.get('/submissions/student/my_submissions');
                setSubmissions(sRes.data);
            } catch (err: unknown) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* MegaForte Navbar for Authenticated Users */}
            <nav className="bg-primary-900 px-4 sm:px-6 lg:px-8 shadow-sm">
                <div className="flex h-16 items-center justify-between max-w-7xl mx-auto">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <img src="/logo.png" alt="MegaForte" className="h-10 w-10 object-contain bg-white rounded-full shadow-sm" />
                    </div>

                    <div className="hidden lg:flex items-center gap-6">
                        <div className="flex items-center gap-4 text-white/90">
                            <Bell size={18} className="cursor-pointer hover:text-white" />
                            <div className="flex items-center text-sm font-bold cursor-pointer hover:text-white">
                                <ShoppingCart size={18} className="mr-1" />
                                Cart (0)
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="border border-white/50 text-white px-4 py-1.5 text-sm font-semibold hover:bg-white/10">
                                Account
                            </button>
                            <button onClick={logout} className="bg-green-500 text-white px-4 py-1.5 text-sm font-bold uppercase hover:bg-green-600">
                                SIGNOUT
                            </button>
                            <button className="bg-blue-500 text-white px-6 py-1.5 text-sm font-bold hover:bg-blue-600 ml-2">
                                Start Here
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Dashboard Content matching Screenshot 1 */}
            <main className="max-w-6xl mx-auto px-4 py-12 space-y-12 min-h-[70vh]">

                <div className="bg-white p-8 shadow-sm border border-gray-100">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                        <Lightbulb className="text-primary-600" size={32} />
                        My Courses/Modules
                    </h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {assignments.map((a: Assignment) => (
                            <div
                                key={a.id}
                                onClick={() => navigate(`/student/assignment/${a.id}`)}
                                className="border-2 border-gray-100 bg-white aspect-[4/3] flex flex-col items-center justify-center p-8 text-center hover:shadow-lg hover:border-primary-100 transition-all cursor-pointer group"
                            >
                                <BrainCircuit
                                    className="mb-6 text-gray-200 stroke-[1px] group-hover:text-primary-400 transition-colors w-16 h-16"
                                />
                                <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest mb-3 leading-snug">
                                    {a.title}
                                </h3>
                                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                                    {a.instructions}
                                </p>
                            </div>
                        ))}
                        {assignments.length === 0 && (
                            <div className="col-span-1 border-2 border-gray-100 bg-gray-50 aspect-[4/3] flex flex-col items-center justify-center p-8 text-center">
                                <p className="text-gray-400 text-sm font-semibold">No active modules available.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submissions Feed */}
                <div className="bg-white p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <CheckCircle className="text-green-600" size={28} />
                        My Handed-In Assignments
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {submissions.map((s: Submission) => (
                            <div key={s.id} className="border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary-100 p-2 rounded-full">
                                        <FileText size={20} className="text-primary-700" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800">{s.assignment_title}</h4>
                                        <p className="text-xs text-gray-500 font-medium">
                                            Score: {s.marks_awarded !== null ? <span className="text-green-600 font-bold">{s.marks_awarded} Points</span> : <span className="text-yellow-600 italic">Pending Grading</span>}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/student/saved/${s.id}`)}
                                    className="bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100 px-4 py-2 uppercase tracking-widest text-[10px] font-black transition-colors"
                                >
                                    View Feedback
                                </button>
                            </div>
                        ))}
                        {submissions.length === 0 && (
                            <div className="col-span-1 p-6 text-gray-400 text-sm italic">
                                You have not submitted any assignments yet.
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}
