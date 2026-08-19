import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, RefreshCw, ArrowLeft, Archive, Play, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '../components/NotificationCenter';

interface Assignment {
    id: string;
    title: string;
    instructions: string;
}

interface JobStatus {
    jobId: string;
    assignmentId: string;
    totalFiles: number;
    processedFiles: number;
    failedFilesCount: number;
    failedFiles: { filename: string; reason: string }[];
    status: 'queued' | 'processing' | 'completed' | 'failed';
    percentage: number;
}

export const MassUploadDashboard: React.FC = () => {
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<string>('');
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Fetch assignments list
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

    // Poll job status if activeJobId is set
    useEffect(() => {
        if (!activeJobId) return;

        const pollStatus = async () => {
            try {
                const res = await axios.get(`/api/mass-upload/job/${activeJobId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setJobStatus(res.data);
                if (res.data.status === 'completed' || res.data.status === 'failed') {
                    setIsUploading(false);
                }
            } catch (err) {
                console.error("Error polling job status:", err);
            }
        };

        pollStatus();
        const interval = setInterval(pollStatus, 2000);
        return () => clearInterval(interval);
    }, [activeJobId, token]);

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!selectedAssignment) {
            setErrorMsg('Please select a target assignment first.');
            return;
        }
        if (!selectedFiles || selectedFiles.length === 0) {
            setErrorMsg('Please select scanned answer scripts (PDFs/Images or ZIP) to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('assignmentId', selectedAssignment);
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('scripts', selectedFiles[i]);
        }

        try {
            setIsUploading(true);
            const res = await axios.post('/api/mass-upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setActiveJobId(res.data.jobId);
            setSuccessMsg(`Batch upload initiated! Job ID: ${res.data.jobId}`);
        } catch (err: any) {
            console.error("Upload error:", err);
            setErrorMsg(err.response?.data?.error || 'Failed to start mass upload job.');
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white font-sans">
            {/* Top Navigation */}
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
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                                Mass Exam Script Uploader & Marker
                            </h1>
                            <p className="text-xs text-indigo-300">Phase 1 Flagship Evaluation Engine</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <NotificationCenter />
                        <span className="text-sm font-medium text-indigo-200">
                            {user?.full_name || user?.email} (Teacher)
                        </span>
                        <button
                            onClick={logout}
                            className="text-xs px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {errorMsg && (
                    <div className="mb-6 p-4 bg-rose-950/80 border border-rose-700/60 text-rose-200 rounded-xl flex items-center space-x-3">
                        <AlertCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}
                {successMsg && (
                    <div className="mb-6 p-4 bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 rounded-xl flex items-center space-x-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Upload Form Card */}
                    <div className="lg:col-span-6 bg-slate-900/90 border border-indigo-800/40 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                                <Archive className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Upload Batch Answer Scripts</h2>
                                <p className="text-xs text-indigo-300">Supports PDF, PNG, JPEG scanned scripts and ZIP archives</p>
                            </div>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">
                                    Target Assignment
                                </label>
                                <select
                                    value={selectedAssignment}
                                    onChange={(e) => setSelectedAssignment(e.target.value)}
                                    className="w-full bg-slate-950 border border-indigo-800/60 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                >
                                    {assignments.map(a => (
                                        <option key={a.id} value={a.id}>{a.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">
                                    Scanned Script Files / ZIP Batch
                                </label>
                                <div className="border-2 border-dashed border-indigo-700/50 hover:border-indigo-400 bg-slate-950/60 rounded-2xl p-8 text-center transition-all cursor-pointer relative">
                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf,.png,.jpg,.jpeg,.zip"
                                        onChange={(e) => setSelectedFiles(e.target.files)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <Upload className="w-12 h-12 text-indigo-400 mx-auto mb-3 animate-bounce" />
                                    <p className="text-sm font-medium text-white mb-1">
                                        {selectedFiles && selectedFiles.length > 0
                                            ? `${selectedFiles.length} file(s) selected`
                                            : 'Drag & drop scanned script batch or ZIP file'}
                                    </p>
                                    <p className="text-xs text-indigo-400">
                                        Max batch size: 50MB | Supported formats: PDF, PNG, JPEG, ZIP
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isUploading}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                                {isUploading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        <span>Processing Batch Upload...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5 fill-current" />
                                        <span>Start Mass Evaluation & Auto-Marking</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Real-time Status Card */}
                    <div className="lg:col-span-6 bg-slate-900/90 border border-indigo-800/40 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Batch Queue Monitor</h2>
                                    <p className="text-xs text-indigo-300">Asynchronous Job Processing Status</p>
                                </div>
                            </div>
                            {jobStatus && (
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                    jobStatus.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                                    jobStatus.status === 'failed' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                                    'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                }`}>
                                    {jobStatus.status.toUpperCase()}
                                </span>
                            )}
                        </div>

                        {jobStatus ? (
                            <div className="space-y-6">
                                {/* Progress Bar */}
                                <div>
                                    <div className="flex justify-between text-xs font-semibold text-indigo-200 mb-2">
                                        <span>Overall Progress ({jobStatus.processedFiles} / {jobStatus.totalFiles} Scripts)</span>
                                        <span>{jobStatus.percentage}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-indigo-900/50">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                                            style={{ width: `${jobStatus.percentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-slate-950 p-4 rounded-xl border border-indigo-900/40 text-center">
                                        <span className="text-2xl font-bold text-white">{jobStatus.totalFiles}</span>
                                        <p className="text-xs text-indigo-400">Total Scripts</p>
                                    </div>
                                    <div className="bg-slate-950 p-4 rounded-xl border border-emerald-900/40 text-center">
                                        <span className="text-2xl font-bold text-emerald-400">{jobStatus.processedFiles}</span>
                                        <p className="text-xs text-emerald-400/80">Evaluated</p>
                                    </div>
                                    <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/40 text-center">
                                        <span className="text-2xl font-bold text-rose-400">{jobStatus.failedFilesCount}</span>
                                        <p className="text-xs text-rose-400/80">Failed</p>
                                    </div>
                                </div>

                                {/* Actions when complete */}
                                {jobStatus.status === 'completed' && (
                                    <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 rounded-xl space-y-3">
                                        <div className="flex items-center space-x-2 text-emerald-300 text-sm font-semibold">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                            <span>Batch processing and auto-marking completed!</span>
                                        </div>
                                        <div className="flex space-x-3 pt-2">
                                            <button
                                                onClick={() => navigate(`/teacher/assignments/${jobStatus.assignmentId}/submissions`)}
                                                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors"
                                            >
                                                View All Submissions
                                            </button>
                                            <button
                                                onClick={() => navigate('/consolidated-reports')}
                                                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors"
                                            >
                                                Consolidated Master Report
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-16 text-center text-indigo-400/60">
                                <Archive className="w-12 h-12 mx-auto mb-3 text-indigo-600/40" />
                                <p className="text-sm">No batch upload active. Select an assignment and start upload.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MassUploadDashboard;
