import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, BrainCircuit, CheckCircle, FileText, Folder, UserCheck, Award, Clock, ArrowRight, Filter } from 'lucide-react';
import NotificationCenter from '../components/NotificationCenter';

interface Assignment {
    id: string;
    title: string;
    instructions: string;
    due_date: string;
    subject?: string;
    sub_category?: string;
}

interface Submission {
    id: string;
    assignment_id: string;
    marks_awarded: number | null;
    assignment_title: string;
    submitted_at?: string;
}

export default function StudentDashboard() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [aRes, sRes] = await Promise.all([
                    api.get('/assignments'),
                    api.get('/submissions/student/my_submissions')
                ]);
                setAssignments(aRes.data);
                setSubmissions(sRes.data);
            } catch (err: unknown) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    // Extract roll number and display name
    const studentEmail = user?.email || 'student@intemass.com';
    const emailPrefix = studentEmail.split('@')[0];
    const isNumberedStudent = /^\d+$/.test(emailPrefix);
    const studentRollNo = isNumberedStudent ? String(emailPrefix).padStart(3, '0') : emailPrefix.toUpperCase();
    const studentDisplayName = user?.fullName || (isNumberedStudent ? `Student ${emailPrefix} (Roll: ${studentRollNo})` : `Student (${studentEmail})`);

    // Calculate completed vs pending modules
    const completedAssignmentIds = new Set(submissions.map(s => s.assignment_id));
    const completedCount = assignments.filter(a => completedAssignmentIds.has(a.id)).length;
    const pendingCount = assignments.length - completedCount;

    // Subjects list for filtering
    const subjects = Array.from(new Set(assignments.map(a => a.subject || 'General')));
    const filteredAssignments = selectedSubject === 'All'
        ? assignments
        : assignments.filter(a => (a.subject || 'General').toLowerCase() === selectedSubject.toLowerCase());

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* MegaForte Navbar for Authenticated Users */}
            <nav className="bg-primary-900 px-4 sm:px-6 lg:px-8 shadow-sm">
                <div className="flex h-16 items-center justify-between max-w-7xl mx-auto">
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/logo.png" alt="MegaForte" className="h-10 w-10 object-contain bg-white rounded-full shadow-sm" />
                        <span className="text-white font-bold text-lg hidden sm:inline">Intemass Student Evaluation</span>
                    </div>

                    <div className="flex items-center gap-4 text-white/90">
                        <NotificationCenter />
                        <div className="flex items-center gap-3">
                            <div className="bg-primary-800/80 border border-primary-700 px-3 py-1.5 rounded flex items-center gap-2 text-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                <span className="font-bold text-white">Roll No: {studentRollNo}</span>
                            </div>
                            <button onClick={logout} className="bg-rose-600 text-white px-3 py-1.5 text-xs font-bold uppercase hover:bg-rose-700 rounded transition">
                                SIGNOUT
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[70vh]">

                {/* Student Profile & Progress Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 p-6 rounded-2xl border border-primary-800/50 shadow-xl text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-primary-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                                    Student Portal
                                </span>
                                <span className="text-primary-300 text-xs font-semibold">
                                    MegaForte Singapore
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                                <UserCheck className="text-emerald-400 w-6 h-6" />
                                {studentDisplayName}
                            </h1>
                            <p className="text-xs text-primary-200/80 mt-0.5">
                                Login Account: <span className="font-mono text-white font-bold">{studentEmail}</span>
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-primary-700/50">
                            <div className="text-center px-3 border-r border-gray-700">
                                <div className="text-lg font-black text-emerald-400">{completedCount}</div>
                                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Completed</div>
                            </div>
                            <div className="text-center px-3 border-r border-gray-700">
                                <div className="text-lg font-black text-amber-400">{pendingCount}</div>
                                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Pending</div>
                            </div>
                            <div className="text-center px-3">
                                <div className="text-lg font-black text-primary-300">{assignments.length}</div>
                                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Modules</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* My Course Modules Section */}
                <div className="bg-white p-6 sm:p-8 shadow-sm border border-gray-200 rounded-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2.5">
                                <Lightbulb className="text-primary-700 w-6 h-6" />
                                My Course Modules ({filteredAssignments.length})
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Assignments available for your student login and roll number
                            </p>
                        </div>

                        {/* Subject Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-3.5 h-3.5 text-gray-400" />
                            <select
                                className="border border-gray-300 rounded text-xs font-bold text-gray-800 px-3 py-1.5 outline-none bg-gray-50 focus:border-primary-500"
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                            >
                                <option value="All">All Subjects</option>
                                {subjects.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAssignments.map((a: Assignment) => {
                            const sub = submissions.find(s => s.assignment_id === a.id);
                            const isCompleted = !!sub;

                            return (
                                <div
                                    key={a.id}
                                    className={`border rounded-xl p-5 flex flex-col justify-between transition-all relative overflow-hidden bg-white ${
                                        isCompleted
                                            ? 'border-emerald-300 shadow-sm hover:border-emerald-500'
                                            : 'border-gray-200 shadow-sm hover:border-primary-400 hover:shadow-md'
                                    }`}
                                >
                                    {/* Top Status Bar */}
                                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${isCompleted ? 'bg-emerald-500' : 'bg-primary-600'}`} />

                                    <div>
                                        {/* Badges */}
                                        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-800 text-[10px] font-bold px-2 py-0.5 rounded border border-primary-200">
                                                    <Folder className="w-3 h-3 text-primary-600" />
                                                    {a.subject || 'General'}
                                                </span>
                                                {a.sub_category && a.sub_category !== 'General' && (
                                                    <span className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-200">
                                                        {a.sub_category}
                                                    </span>
                                                )}
                                            </div>

                                            {isCompleted ? (
                                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                                                    Completed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded">
                                                    <Clock className="w-3 h-3 text-amber-600" />
                                                    To Do
                                                </span>
                                            )}
                                        </div>

                                        {/* Title & Instructions */}
                                        <div className="flex items-start gap-3 mb-2">
                                            <BrainCircuit
                                                className={`w-8 h-8 flex-shrink-0 mt-0.5 ${isCompleted ? 'text-emerald-500' : 'text-primary-600'}`}
                                            />
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 leading-snug">
                                                    {a.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                                    {a.instructions || 'Click below to answer and submit for automated evaluation.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                                        <span className="text-gray-400 font-medium">Due: {a.due_date || 'No deadline'}</span>
                                        
                                        {isCompleted ? (
                                            <button
                                                onClick={() => navigate(`/student/saved/${sub.id}`)}
                                                className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 font-bold px-3 py-1.5 rounded flex items-center gap-1 text-[11px] transition"
                                            >
                                                <Award className="w-3.5 h-3.5 text-emerald-600" />
                                                View Score ({sub.marks_awarded ?? '-'})
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate(`/student/assignment/${a.id}`)}
                                                className="bg-primary-700 text-white hover:bg-primary-800 font-bold px-3.5 py-1.5 rounded flex items-center gap-1 text-[11px] transition shadow-sm"
                                            >
                                                Start Assessment
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {filteredAssignments.length === 0 && (
                            <div className="col-span-3 border border-dashed border-gray-200 bg-gray-50 rounded-xl p-12 text-center">
                                <p className="text-gray-400 text-sm font-semibold">No active modules available under this subject.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Handed-in Submissions Log */}
                <div className="bg-white p-6 sm:p-8 shadow-sm border border-gray-200 rounded-xl">
                    <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2.5">
                        <CheckCircle className="text-emerald-600 w-6 h-6" />
                        My Handed-In Assignments & Evaluation Records ({submissions.length})
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {submissions.map((s: Submission) => (
                            <div key={s.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition bg-gray-50/70">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-lg">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">{s.assignment_title}</h4>
                                        <p className="text-xs text-gray-500 font-medium">
                                            Score: {s.marks_awarded !== null ? (
                                                <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded ml-1">
                                                    {s.marks_awarded} Points
                                                </span>
                                            ) : (
                                                <span className="text-yellow-600 italic">Pending Grading</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/student/saved/${s.id}`)}
                                    className="bg-primary-50 text-primary-800 border border-primary-200 hover:bg-primary-100 px-3.5 py-1.5 rounded uppercase tracking-wider text-[10px] font-black transition-colors"
                                >
                                    Feedback &gt;
                                </button>
                            </div>
                        ))}
                        {submissions.length === 0 && (
                            <div className="col-span-2 p-8 text-center text-gray-400 text-xs font-semibold uppercase tracking-wider border border-dashed border-gray-200 rounded-lg">
                                You have not submitted any assignments yet. Click on any module above to complete your first test.
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}
