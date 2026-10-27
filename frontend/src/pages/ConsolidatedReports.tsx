import React, { useState, useEffect } from 'react';
import { 
    Download, FileText, ArrowLeft, Trophy, Award, Search, RefreshCw, 
    BarChart2, ShieldCheck, UserCheck, TrendingUp, AlertTriangle, 
    School, BookOpen, CheckCircle, ChevronRight, User
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NotificationCenter from '../components/NotificationCenter';

interface SchoolItem {
    id: string;
    name: string;
    code: string;
    address?: string;
    student_count?: number;
    submission_count?: number;
}

interface RankedStudent {
    student_id: string;
    student_name: string;
    student_email: string;
    roll_number: string;
    class_name: string;
    total_marks: number;
    max_total_marks: number;
    percentage: number;
    grade: string;
    rank: number;
    modules_completed: number;
    submissions_count: number;
    has_submitted: boolean;
}

interface SchoolMasterReportData {
    school: {
        id: string;
        name: string;
        code: string;
        address?: string;
        contact_email?: string;
    };
    summary: {
        total_enrolled_students: number;
        total_evaluated_students: number;
        total_submissions: number;
        total_assignments: number;
        school_average_score: number;
        school_average_percentage: number;
        pass_rate: number;
        highest_percentage: number;
        lowest_percentage: number;
        grade_distribution: Record<string, number>;
    };
    subject_breakdown: Array<{
        subject: string;
        assignment_count: number;
        total_submissions: number;
        average_score: number;
    }>;
    topic_weaknesses: Array<{
        question_id: string;
        question_text: string;
        subject: string;
        attempts: number;
        average_percentage: number;
        needs_intervention: boolean;
    }>;
    students: RankedStudent[];
    assignments: Array<{ id: string; title: string; subject: string }>;
}

interface IndividualStudentReportData {
    student: {
        id: string;
        email: string;
        name: string;
        roll_number: string;
        class_name: string;
        school_id: string;
        school_name: string;
        school_code: string;
    };
    performance: {
        total_marks: number;
        max_total_marks: number;
        overall_percentage: number;
        overall_grade: string;
        school_rank: number;
        total_peers_in_school: number;
        school_average_benchmark: number;
        performance_vs_school: string;
    };
    assignments: Array<{
        assignment_id: string;
        title: string;
        subject: string;
        status: string;
        total_marks: number;
        max_points: number;
        due_date?: string;
    }>;
    detailed_submissions: Array<{
        id: string;
        assignment_title: string;
        question_text: string;
        marks_awarded: number | null;
        max_marks: number;
        feedback?: string;
        submitted_at?: string;
    }>;
}

export const ConsolidatedReports: React.FC = () => {
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Mode: 'master' for whole-school report, 'individual' for single student report
    const [activeTab, setActiveTab] = useState<'master' | 'individual'>('master');

    // Schools state
    const [schools, setSchools] = useState<SchoolItem[]>([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState<string>(user?.school_id || 'sch-mf-001');

    // Master report state
    const [masterReport, setMasterReport] = useState<SchoolMasterReportData | null>(null);
    const [loadingMaster, setLoadingMaster] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [gradeFilter, setGradeFilter] = useState<string>('ALL');
    const [subjectFilter, setSubjectFilter] = useState<string>('All');

    // Individual student report state
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [studentReport, setStudentReport] = useState<IndividualStudentReportData | null>(null);
    const [loadingStudent, setLoadingStudent] = useState<boolean>(false);

    // Initial load: Fetch accessible schools
    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const res = await axios.get('/api/reports/schools', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSchools(res.data || []);
                if (res.data && res.data.length > 0) {
                    const defaultSchool = user?.school_id && res.data.some((s: SchoolItem) => s.id === user.school_id)
                        ? user.school_id
                        : res.data[0].id;
                    setSelectedSchoolId(defaultSchool);
                }
            } catch (err) {
                console.error("Failed to load schools:", err);
            }
        };
        fetchSchools();
    }, [token, user?.school_id]);

    // Check URL params if student query param passed e.g. ?studentId=xxx
    useEffect(() => {
        const studentParam = searchParams.get('studentId');
        if (studentParam) {
            setSelectedStudentId(studentParam);
            setActiveTab('individual');
        }
    }, [searchParams]);

    // Fetch School Master Report when selectedSchoolId or subjectFilter changes
    useEffect(() => {
        if (!selectedSchoolId) return;
        const fetchMaster = async () => {
            setLoadingMaster(true);
            try {
                const url = subjectFilter !== 'All'
                    ? `/api/reports/school/${selectedSchoolId}/master?subject=${encodeURIComponent(subjectFilter)}`
                    : `/api/reports/school/${selectedSchoolId}/master`;
                const res = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMasterReport(res.data);

                // Default first student for individual report if not selected
                if (res.data.students && res.data.students.length > 0 && !selectedStudentId) {
                    setSelectedStudentId(res.data.students[0].student_id);
                }
            } catch (err: unknown) {
                console.error("Failed to load school master report:", err);
            } finally {
                setLoadingMaster(false);
            }
        };
        fetchMaster();
    }, [selectedSchoolId, subjectFilter, token]);

    // Fetch Individual Student Report when activeTab === 'individual' and student selected
    useEffect(() => {
        if (activeTab !== 'individual' || !selectedSchoolId || !selectedStudentId) return;
        const fetchStudentReport = async () => {
            setLoadingStudent(true);
            try {
                const res = await axios.get(`/api/reports/school/${selectedSchoolId}/student/${selectedStudentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStudentReport(res.data);
            } catch (err: unknown) {
                console.error("Failed to load student report:", err);
            } finally {
                setLoadingStudent(false);
            }
        };
        fetchStudentReport();
    }, [activeTab, selectedSchoolId, selectedStudentId, token]);

    // Export Handlers
    const handleExportMasterCSV = () => {
        if (!selectedSchoolId) return;
        window.open(`/api/reports/school/${selectedSchoolId}/master/export/csv?token=${token}`, '_blank');
    };

    const handleExportMasterPDF = () => {
        if (!selectedSchoolId) return;
        window.open(`/api/reports/school/${selectedSchoolId}/master/export/pdf?token=${token}`, '_blank');
    };

    const handleExportStudentPDF = () => {
        if (!selectedSchoolId || !selectedStudentId) return;
        window.open(`/api/reports/school/${selectedSchoolId}/student/${selectedStudentId}/export/pdf?token=${token}`, '_blank');
    };

    const handleViewStudentReport = (studentId: string) => {
        setSelectedStudentId(studentId);
        setActiveTab('individual');
    };

    // Filter students for master table
    const filteredStudents = (masterReport?.students || []).filter(st => {
        const matchesSearch = st.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              st.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (st.roll_number && st.roll_number.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesGrade = gradeFilter === 'ALL' || st.grade === gradeFilter;
        return matchesSearch && matchesGrade;
    });

    const activeSchoolName = masterReport?.school.name || user?.school_name || 'Academic Institution';
    const activeSchoolCode = masterReport?.school.code || user?.school_code || 'SCH';

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans pb-16">
            {/* Top Navigation Bar */}
            <header className="bg-slate-950/90 backdrop-blur-md border-b border-indigo-900/50 sticky top-0 z-40 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(user?.role === 'student' ? '/student-dashboard' : '/teacher-dashboard')}
                            className="p-2 text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/80 rounded-lg border border-indigo-800/40 transition-colors flex items-center space-x-1"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="text-xs font-semibold">Dashboard</span>
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-300">
                                    Multi-Tenant School Reporting Center
                                </h1>
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Strict Tenancy
                                </span>
                            </div>
                            <p className="text-xs text-indigo-300">
                                Segregated Master & Individual Student Performance Analytics
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <NotificationCenter />
                        <div className="text-right">
                            <p className="text-xs font-bold text-white">{user?.fullName || user?.email}</p>
                            <p className="text-[10px] text-indigo-300 uppercase tracking-wider">{user?.role} Access</p>
                        </div>
                        <button onClick={logout} className="text-xs px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white font-bold rounded-lg transition">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* School Tenant Identification Banner */}
                <div className="bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 p-6 rounded-2xl border border-indigo-800/50 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-3.5 bg-indigo-600/30 text-indigo-300 rounded-xl border border-indigo-500/30">
                            <School className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-white">{activeSchoolName}</h2>
                                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-black px-2.5 py-0.5 rounded">
                                    {activeSchoolCode}
                                </span>
                            </div>
                            <p className="text-xs text-indigo-300/80 mt-1 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                School Isolation Active: Students, assignments, and reports are strictly segregated from other institutions.
                            </p>
                        </div>
                    </div>

                    {/* School Switcher: Available for Master Admin */}
                    {user?.role === 'master' && schools.length > 1 && (
                        <div className="flex items-center space-x-3 w-full md:w-auto bg-slate-900/80 p-2.5 rounded-xl border border-indigo-800/40">
                            <label className="text-xs font-bold text-indigo-300 whitespace-nowrap">Switch School:</label>
                            <select
                                value={selectedSchoolId}
                                onChange={(e) => setSelectedSchoolId(e.target.value)}
                                className="bg-slate-950 border border-indigo-700/60 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                {schools.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({s.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Primary Mode Switcher Tabs */}
                <div className="flex border-b border-indigo-900/50 space-x-2">
                    <button
                        onClick={() => setActiveTab('master')}
                        className={`pb-3 px-5 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
                            activeTab === 'master'
                                ? 'border-indigo-500 text-indigo-300 bg-indigo-950/20'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        <Trophy className="w-4 h-4" />
                        <span>Whole-School Master Report</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('individual')}
                        className={`pb-3 px-5 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
                            activeTab === 'individual'
                                ? 'border-indigo-500 text-indigo-300 bg-indigo-950/20'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        <UserCheck className="w-4 h-4" />
                        <span>Individual Student Report Card</span>
                    </button>
                </div>

                {/* TAB 1: WHOLE-SCHOOL MASTER REPORT */}
                {activeTab === 'master' && (
                    <div className="space-y-8">
                        {/* Control & Export Bar */}
                        <div className="bg-slate-950 p-6 rounded-2xl border border-indigo-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                                <div className="flex items-center space-x-2">
                                    <label className="text-xs font-semibold text-indigo-300">Filter Subject:</label>
                                    <select
                                        value={subjectFilter}
                                        onChange={(e) => setSubjectFilter(e.target.value)}
                                        className="bg-slate-900 border border-indigo-800/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="All">All Subjects (Whole School)</option>
                                        <option value="Physics">Engineering Physics</option>
                                        <option value="Basic Electronics">Basic Electronics & Electrical</option>
                                        <option value="Basic Programming">MATLAB / Programming</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 w-full md:w-auto">
                                <button
                                    onClick={handleExportMasterCSV}
                                    className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Export School CSV</span>
                                </button>
                                <button
                                    onClick={handleExportMasterPDF}
                                    className="flex-1 md:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span>Export Master PDF</span>
                                </button>
                            </div>
                        </div>

                        {/* High-Level Metric Tiles */}
                        {masterReport && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-950 p-5 rounded-xl border border-indigo-900/40 flex items-center space-x-4">
                                    <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-lg">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-300">Total Enrolled</p>
                                        <p className="text-2xl font-bold text-white">{masterReport.summary.total_enrolled_students} Students</p>
                                        <p className="text-[10px] text-emerald-400">{masterReport.summary.total_evaluated_students} Evaluated</p>
                                    </div>
                                </div>

                                <div className="bg-slate-950 p-5 rounded-xl border border-purple-900/40 flex items-center space-x-4">
                                    <div className="p-3 bg-purple-600/20 text-purple-400 rounded-lg">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-purple-300">School Average</p>
                                        <p className="text-2xl font-bold text-purple-300">{masterReport.summary.school_average_score} pts</p>
                                        <p className="text-[10px] text-indigo-300">{masterReport.summary.school_average_percentage}% Overall</p>
                                    </div>
                                </div>

                                <div className="bg-slate-950 p-5 rounded-xl border border-emerald-900/40 flex items-center space-x-4">
                                    <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-lg">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-emerald-300">Cohort Pass Rate</p>
                                        <p className="text-2xl font-bold text-emerald-400">{masterReport.summary.pass_rate}%</p>
                                        <p className="text-[10px] text-emerald-300">Passing Threshold: 50%</p>
                                    </div>
                                </div>

                                <div className="bg-slate-950 p-5 rounded-xl border border-amber-900/40 flex items-center space-x-4">
                                    <div className="p-3 bg-amber-600/20 text-amber-400 rounded-lg">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-amber-300">Score Range</p>
                                        <p className="text-2xl font-bold text-amber-400">{masterReport.summary.highest_percentage}%</p>
                                        <p className="text-[10px] text-amber-300">Low: {masterReport.summary.lowest_percentage}%</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Grade Distribution & Topic Weaknesses Row */}
                        {masterReport && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Grade Distribution */}
                                <div className="bg-slate-950 p-6 rounded-2xl border border-indigo-900/40">
                                    <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <BarChart2 className="w-4 h-4 text-indigo-400" /> Grade Distribution Across School
                                    </h3>
                                    <div className="grid grid-cols-6 gap-2 text-center">
                                        {Object.entries(masterReport.summary.grade_distribution).map(([grade, count]) => (
                                            <div key={grade} className="bg-slate-900/90 p-3 rounded-xl border border-indigo-800/40">
                                                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                                                    grade.startsWith('A') ? 'bg-emerald-500/20 text-emerald-400' :
                                                    grade === 'B' ? 'bg-indigo-500/20 text-indigo-300' :
                                                    grade === 'C' ? 'bg-amber-500/20 text-amber-300' :
                                                    'bg-rose-500/20 text-rose-400'
                                                }`}>
                                                    {grade}
                                                </span>
                                                <p className="text-xl font-bold text-white mt-2">{count}</p>
                                                <p className="text-[10px] text-indigo-400/80">Students</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Curriculum Weakness Intervention */}
                                <div className="bg-slate-950 p-6 rounded-2xl border border-indigo-900/40">
                                    <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-400" /> Focus Areas & Weakness Analytics
                                    </h3>
                                    {masterReport.topic_weaknesses.length === 0 ? (
                                        <p className="text-xs text-indigo-300/60 py-4">No critical weaknesses detected across current submissions.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {masterReport.topic_weaknesses.map(tw => (
                                                <div key={tw.question_id} className="bg-slate-900/80 p-3 rounded-xl border border-indigo-900/60 flex justify-between items-center text-xs">
                                                    <div className="pr-4">
                                                        <p className="font-semibold text-white line-clamp-1">{tw.question_text}</p>
                                                        <p className="text-[10px] text-indigo-400">{tw.subject} • {tw.attempts} student attempts</p>
                                                    </div>
                                                    <div className="text-right whitespace-nowrap">
                                                        <span className="text-amber-400 font-bold">{tw.average_percentage}% Avg</span>
                                                        <p className="text-[9px] text-rose-400 uppercase font-semibold">Needs Review</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Search and Grade Filter Bar */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-80">
                                <Search className="w-4 h-4 text-indigo-400 absolute left-3 top-3.5" />
                                <input
                                    type="text"
                                    placeholder="Search by student name, roll number, email..."
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

                        {/* School Master Ranking Table */}
                        <div className="bg-slate-950 border border-indigo-900/50 rounded-2xl overflow-hidden shadow-2xl">
                            {loadingMaster ? (
                                <div className="py-20 text-center text-indigo-400">
                                    <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-indigo-500" />
                                    <span>Generating School Master Consolidated Report...</span>
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
                                                <th className="py-4 px-6">School Rank</th>
                                                <th className="py-4 px-6">Roll No</th>
                                                <th className="py-4 px-6">Student Name</th>
                                                <th className="py-4 px-6">Cohort / Class</th>
                                                <th className="py-4 px-6 text-center">Total Marks</th>
                                                <th className="py-4 px-6 text-center">Percentage</th>
                                                <th className="py-4 px-6 text-center">Grade</th>
                                                <th className="py-4 px-6 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-indigo-900/30">
                                            {filteredStudents.map((st) => (
                                                <tr key={st.student_id} className="hover:bg-indigo-950/40 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                            st.rank === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                                                            st.rank === 2 ? 'bg-slate-400/20 text-slate-200 border border-slate-400/40' :
                                                            st.rank === 3 ? 'bg-amber-700/20 text-amber-400 border border-amber-700/40' :
                                                            'text-indigo-400'
                                                        }`}>
                                                            #{st.rank}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 font-mono font-bold text-indigo-300">{st.roll_number || 'N/A'}</td>
                                                    <td className="py-4 px-6 font-medium text-white">
                                                        <div>{st.student_name}</div>
                                                        <div className="text-[10px] text-indigo-400/70">{st.student_email}</div>
                                                    </td>
                                                    <td className="py-4 px-6 text-indigo-300">{st.class_name}</td>
                                                    <td className="py-4 px-6 text-center font-bold text-emerald-400">
                                                        {st.total_marks} pts
                                                    </td>
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
                                                    <td className="py-4 px-6 text-right">
                                                        <button
                                                            onClick={() => handleViewStudentReport(st.student_id)}
                                                            className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-lg border border-indigo-500/30 text-xs font-semibold transition flex items-center space-x-1 ml-auto"
                                                        >
                                                            <span>Report Card</span>
                                                            <ChevronRight className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: INDIVIDUAL STUDENT REPORT CARD */}
                {activeTab === 'individual' && (
                    <div className="space-y-8">
                        {/* Student Picker Bar */}
                        <div className="bg-slate-950 p-6 rounded-2xl border border-indigo-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center space-x-4 w-full md:w-auto">
                                <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider whitespace-nowrap">
                                    Select Student:
                                </label>
                                <select
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                    className="bg-slate-900 border border-indigo-800/60 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-80"
                                >
                                    {(masterReport?.students || []).map(st => (
                                        <option key={st.student_id} value={st.student_id}>
                                            Roll: {st.roll_number} - {st.student_name} ({st.grade})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleExportStudentPDF}
                                className="w-full md:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                            >
                                <Download className="w-4 h-4" />
                                <span>Export Student Report PDF</span>
                            </button>
                        </div>

                        {loadingStudent ? (
                            <div className="py-20 text-center text-indigo-400">
                                <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-indigo-500" />
                                <span>Loading Student Report Card...</span>
                            </div>
                        ) : studentReport && (
                            <>
                                {/* Student Profile & Performance Header */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Student Card */}
                                    <div className="bg-slate-950 p-6 rounded-2xl border border-indigo-900/50 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="bg-indigo-600/20 text-indigo-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                                                    Student Profile
                                                </span>
                                                <span className="text-xs font-mono font-bold text-indigo-400">
                                                    Roll: {studentReport.student.roll_number}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-white">{studentReport.student.name}</h3>
                                            <p className="text-xs text-indigo-300/80">{studentReport.student.email}</p>
                                            <p className="text-xs text-indigo-400 mt-2">Class: {studentReport.student.class_name}</p>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-indigo-900/40 text-xs text-indigo-300 flex items-center justify-between">
                                            <span>School:</span>
                                            <span className="font-bold text-white">{studentReport.student.school_name}</span>
                                        </div>
                                    </div>

                                    {/* Score Card */}
                                    <div className="bg-slate-950 p-6 rounded-2xl border border-indigo-900/50 flex flex-col justify-between">
                                        <div>
                                            <span className="bg-emerald-600/20 text-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                                                Performance Summary
                                            </span>
                                            <div className="flex items-baseline gap-3 mt-3">
                                                <span className="text-4xl font-extrabold text-emerald-400">
                                                    {studentReport.performance.overall_percentage}%
                                                </span>
                                                <span className="text-xl font-bold px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl">
                                                    Grade {studentReport.performance.overall_grade}
                                                </span>
                                            </div>
                                            <p className="text-xs text-indigo-300 mt-2">
                                                Total Score: {studentReport.performance.total_marks} / {studentReport.performance.max_total_marks} pts
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-indigo-900/40 text-xs text-indigo-300 flex items-center justify-between">
                                            <span>School Cohort Rank:</span>
                                            <span className="font-extrabold text-indigo-300">
                                                #{studentReport.performance.school_rank} of {studentReport.performance.total_peers_in_school} students
                                            </span>
                                        </div>
                                    </div>

                                    {/* Benchmark Comparison */}
                                    <div className="bg-slate-950 p-6 rounded-2xl border border-indigo-900/50 flex flex-col justify-between">
                                        <div>
                                            <span className="bg-purple-600/20 text-purple-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-purple-500/30">
                                                School Benchmark
                                            </span>
                                            <p className="text-xs text-indigo-300 mt-3">School Average Score:</p>
                                            <p className="text-2xl font-bold text-purple-300">{studentReport.performance.school_average_benchmark} pts</p>
                                            
                                            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-900/40 text-indigo-200 border border-indigo-700/40">
                                                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                                <span>Status: {studentReport.performance.performance_vs_school}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-indigo-900/40 text-xs text-indigo-400 flex items-center justify-between">
                                            <span>Multi-tenant Isolation:</span>
                                            <span className="font-bold text-emerald-400">Strictly Enforced</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Question-by-Question Evaluation Breakdown */}
                                <div className="bg-slate-950 rounded-2xl border border-indigo-900/50 p-6 shadow-xl">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-indigo-400" />
                                        Submissions & Itemized Question Evaluations
                                    </h3>

                                    {studentReport.detailed_submissions.length === 0 ? (
                                        <p className="text-xs text-indigo-400/60 text-center py-8">
                                            No graded submissions recorded yet for this student.
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {studentReport.detailed_submissions.map((sub, idx) => (
                                                <div key={sub.id} className="bg-slate-900/80 border border-indigo-900/60 rounded-xl p-5 space-y-3">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-900/40 pb-3">
                                                        <div>
                                                            <span className="text-[10px] font-bold uppercase bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded">
                                                                Question #{idx + 1} • {sub.assignment_title}
                                                            </span>
                                                            <h4 className="text-sm font-bold text-white mt-1.5">{sub.question_text}</h4>
                                                        </div>
                                                        <div className="text-right whitespace-nowrap">
                                                            <span className="text-lg font-black text-emerald-400">
                                                                {sub.marks_awarded !== null ? sub.marks_awarded : 0}
                                                            </span>
                                                            <span className="text-xs text-indigo-400"> / {sub.max_marks} pts</span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-950/90 p-3.5 rounded-lg border border-indigo-900/40 text-xs text-indigo-200">
                                                        <span className="font-bold text-indigo-400 uppercase text-[10px] block mb-1">
                                                            Evaluator & Mathematical Feedback:
                                                        </span>
                                                        <p className="whitespace-pre-line">{sub.feedback || 'Evaluated successfully.'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ConsolidatedReports;
