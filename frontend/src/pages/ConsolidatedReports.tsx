import React, { useState, useEffect } from 'react';
import { Download, FileText, ArrowLeft, Trophy, Award, Search, RefreshCw, BarChart2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '../components/NotificationCenter';

interface Assignment {
    id: string;
    title: string;
}

interface StudentReport {
    student_id: string;
    student_name: string;
    student_email: string;
    total_marks: number;
    max_total_marks: number;
    percentage: number;
    grade: string;
    rank: number;
    question_scores: Record<string, number>;
}

interface ReportData {
    assignment: {
        id: string;
        title: string;
        total_max_points: number;
    };
    questions: Array<{ id: string; question_text: string; max_points: number }>;
    students: StudentReport[];
    summary: {
        total_students: number;
        class_average: number;
        highest_score: number;
        lowest_score: number;
    };
}

export const ConsolidatedReports: React.FC = () => {
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<string>('');
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [gradeFilter, setGradeFilter] = useState<string>('ALL');

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

    useEffect(() => {
        if (!selectedAssignment) return;
        const fetchReport = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/reports/assignment/${selectedAssignment}/consolidated`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReportData(res.data);
            } catch (err) {
                console.error("Failed to load consolidated report:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [selectedAssignment, token]);

    const handleExportCSV = () => {
        if (!selectedAssignment) return;
        window.open(`/api/reports/assignment/${selectedAssignment}/export/csv?token=${token}`, '_blank');
    };

    const handleExportPDF = () => {
        if (!selectedAssignment) return;
        window.open(`/api/reports/assignment/${selectedAssignment}/export/pdf?token=${token}`, '_blank');
    };

    const filteredStudents = (reportData?.students || []).filter(st => {
        const matchesSearch = st.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              st.student_email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGrade = gradeFilter === 'ALL' || st.grade === gradeFilter;
        return matchesSearch && matchesGrade;
    });

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">
            {/* Top Bar */}
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
                                Consolidated Marks & Results Dashboard
                            </h1>
                            <p className="text-xs text-indigo-300">Phase 1.3 Master Score Sheet Generator</p>
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
                {/* Selector and Export Bar */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-indigo-900/50 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-4 w-full md:w-auto">
                        <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider whitespace-nowrap">
                            Select Assignment:
                        </label>
                        <select
                            value={selectedAssignment}
                            onChange={(e) => setSelectedAssignment(e.target.value)}
                            className="bg-slate-900 border border-indigo-800/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                        >
                            {assignments.map(a => (
                                <option key={a.id} value={a.id}>{a.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <button
                            onClick={handleExportCSV}
                            className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export CSV / Excel</span>
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="flex-1 md:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                        >
                            <FileText className="w-4 h-4" />
                            <span>Export PDF Report</span>
                        </button>
                    </div>
                </div>

                {/* Summary Metrics */}
                {reportData && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-950 p-5 rounded-xl border border-indigo-900/40 flex items-center space-x-4">
                            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-lg">
                                <BarChart2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-indigo-300">Total Students</p>
                                <p className="text-2xl font-bold text-white">{reportData.summary.total_students}</p>
                            </div>
                        </div>

                        <div className="bg-slate-950 p-5 rounded-xl border border-purple-900/40 flex items-center space-x-4">
                            <div className="p-3 bg-purple-600/20 text-purple-400 rounded-lg">
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-purple-300">Class Average</p>
                                <p className="text-2xl font-bold text-purple-300">{reportData.summary.class_average} pts</p>
                            </div>
                        </div>

                        <div className="bg-slate-950 p-5 rounded-xl border border-emerald-900/40 flex items-center space-x-4">
                            <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-lg">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-emerald-300">Highest Score</p>
                                <p className="text-2xl font-bold text-emerald-400">{reportData.summary.highest_score} pts</p>
                            </div>
                        </div>

                        <div className="bg-slate-950 p-5 rounded-xl border border-amber-900/40 flex items-center space-x-4">
                            <div className="p-3 bg-amber-600/20 text-amber-400 rounded-lg">
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-amber-300">Lowest Score</p>
                                <p className="text-2xl font-bold text-amber-400">{reportData.summary.lowest_score} pts</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter and Search Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 text-indigo-400 absolute left-3 top-3.5" />
                        <input
                            type="text"
                            placeholder="Search by student name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 border border-indigo-900/60 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <label className="text-xs text-indigo-300">Grade Filter:</label>
                        <select
                            value={gradeFilter}
                            onChange={(e) => setGradeFilter(e.target.value)}
                            className="bg-slate-950 border border-indigo-900/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        >
                            <option value="ALL">All Grades</option>
                            <option value="A+">Grade A+</option>
                            <option value="A">Grade A</option>
                            <option value="B">Grade B</option>
                            <option value="C">Grade C</option>
                            <option value="D">Grade D</option>
                            <option value="F">Grade F</option>
                        </select>
                    </div>
                </div>

                {/* Master Report Table */}
                <div className="bg-slate-950 border border-indigo-900/50 rounded-2xl overflow-hidden shadow-2xl">
                    {loading ? (
                        <div className="py-20 text-center text-indigo-400">
                            <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-indigo-500" />
                            <span>Generating Master Consolidated Sheet...</span>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="py-16 text-center text-indigo-400/60">
                            No student records found matching the criteria.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-indigo-100">
                                <thead className="bg-slate-900/90 border-b border-indigo-900/60 text-indigo-300 uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="py-4 px-6">Rank</th>
                                        <th className="py-4 px-6">Student Name</th>
                                        <th className="py-4 px-6">Email</th>
                                        <th className="py-4 px-6 text-center">Total Marks</th>
                                        <th className="py-4 px-6 text-center">Max Marks</th>
                                        <th className="py-4 px-6 text-center">Percentage</th>
                                        <th className="py-4 px-6 text-center">Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-indigo-900/30">
                                    {filteredStudents.map((st) => (
                                        <tr key={st.student_id} className="hover:bg-indigo-950/40 transition-colors">
                                            <td className="py-4 px-6 font-bold text-indigo-400">#{st.rank}</td>
                                            <td className="py-4 px-6 font-medium text-white">{st.student_name}</td>
                                            <td className="py-4 px-6 text-indigo-300">{st.student_email}</td>
                                            <td className="py-4 px-6 text-center font-bold text-emerald-400">{st.total_marks} pts</td>
                                            <td className="py-4 px-6 text-center text-indigo-400">{st.max_total_marks} pts</td>
                                            <td className="py-4 px-6 text-center font-semibold">{st.percentage}%</td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                    st.grade.startsWith('A') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                                                    st.grade === 'B' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' :
                                                    st.grade === 'C' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                                                    'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                                }`}>
                                                    {st.grade}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ConsolidatedReports;
