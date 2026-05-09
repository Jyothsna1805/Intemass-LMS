import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Question { id: string; question_text: string; type: string; max_points: number; }
interface Assignment { id: string; title: string; instructions: string; questions: Question[]; teacher_id?: string; }

export default function StudentAssignment() {
    const { id } = useParams() as { id: string };
    const navigate = useNavigate();
    const { user } = useAuth();

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [files, setFiles] = useState<Record<string, File | null>>({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // Timer state
    const [timeElapsed, setTimeElapsed] = useState(0);
    const maxTime = 120; // Example static 120 minutes

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                const res = await api.get(`/assignments/${id}`);
                setAssignment(res.data);
                const initialAnswers: Record<string, string> = {};
                res.data.questions?.forEach((q: Question) => {
                    initialAnswers[q.id] = '';
                });
                setAnswers(initialAnswers);
            } catch (err) {
                console.error(err);
            }
        };
        fetchAssignment();
    }, [id]);

    useEffect(() => {
        const timer = setInterval(() => setTimeElapsed(p => p + 1), 60000); // 1 minute increment
        return () => clearInterval(timer);
    }, []);

    const handleSubmit = async () => {
        if (!assignment || submitting) return;
        setSubmitting(true);
        try {
            const promises = Object.entries(answers).map(([qId, text]) => {
                const file = files[qId];
                if (text.trim() === '' && !file) return Promise.resolve();

                const formData = new FormData();
                formData.append('assignmentId', id);
                formData.append('questionId', qId);
                formData.append('answerText', text);
                if (file) formData.append('file', file);

                return api.post('/submissions', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            });

            await Promise.all(promises);
            navigate('/student-dashboard');
        } catch (err) {
            console.error(err);
            alert("Failed to submit. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!assignment) return <div className="p-12 text-center text-gray-500"><Loader2 className="animate-spin mx-auto" size={32} /></div>;

    const questions = assignment.questions || [];
    const q = questions[currentIndex];

    if (!q) return <div className="p-8">No questions found.</div>;

    const handleAnswerChange = (html: string) => {
        setAnswers(prev => ({ ...prev, [q.id]: html }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setFiles(prev => ({ ...prev, [q.id]: file }));
    };

    return (
        <div className="min-h-screen bg-[#332A4A] flex justify-center py-10 px-4">
            {/* Main Assignment Container (White Paper Interface) */}
            <div className="w-full max-w-6xl bg-white shadow-2xl flex flex-col font-sans text-gray-900 border-t-[8px] border-blue-600">

                {/* 1. Header Metadata block (from Screenshot 3) */}
                <div className="p-6 border-b-2 border-gray-300">
                    <div className="grid grid-cols-3 gap-y-4 text-sm font-bold tracking-tight text-gray-800">
                        <div className="col-span-3 pb-2 border-b border-gray-100 flex justify-between">
                            <span>Assignment: <span className="font-normal">{assignment.title}</span></span>
                        </div>
                        <div className="flex gap-2">Teacher: <span className="font-normal text-gray-600">{assignment.teacher_id || 'System'}</span></div>
                        <div className="flex gap-2 text-center justify-center">Student: <span className="font-normal text-gray-600">{user?.email}</span></div>
                        <div className="flex gap-2 text-right justify-end pr-8"></div>

                        <div className="flex gap-2">Question: <span className="font-normal text-gray-600">4.1.00{currentIndex + 1}</span></div>
                        <div className="flex gap-2 text-center justify-center">Process: <span className="font-normal text-gray-600">{currentIndex + 1} / {questions.length}</span></div>
                        <div className="flex gap-2 text-right justify-end pr-8">Time: <span className="font-normal text-gray-600">{timeElapsed}/{maxTime}</span></div>
                    </div>
                </div>

                {/* 2. Main Body Grid */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Left Column: Question & Editor */}
                    <div className="w-3/4 flex flex-col border-r-2 border-gray-300 bg-[#f4f3ec]">
                        {/* Question Text Box */}
                        <div className="p-4 min-h-[120px] bg-[#fdfaf2] border-b border-gray-300 text-sm leading-relaxed text-gray-800">
                            {q.question_text} <span className="italic text-gray-500">({q.max_points} marks)</span>
                        </div>

                        {/* React Quill Rich Text Editor */}
                        <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
                            <ReactQuill
                                theme="snow"
                                value={answers[q.id]}
                                onChange={handleAnswerChange}
                                className="h-full flex flex-col"
                            />
                            {/* File Upload Overlay Bottom */}
                            <div className="absolute bottom-16 right-4 left-4 bg-gray-50 p-2 border border-gray-200 text-xs flex justify-between items-center rounded z-10 opacity-90 hover:opacity-100">
                                <span className="font-bold text-gray-600">ACCORDING TO THE QUESTION, YOU MAY WANT TO ADD AN ANSWER GRAPH HERE:</span>
                                <input type="file" onChange={handleFileChange} className="text-xs max-w-[200px]" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Possible Diagrams Sidebar */}
                    <div className="w-1/4 bg-[#e8e9eb] flex flex-col">
                        <div className="p-3 bg-gradient-to-b from-gray-200 to-gray-300 border-b border-gray-400 font-extrabold text-sm text-gray-800 shadow-sm">
                            Possible Diagrams
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-start items-center overflow-y-auto">
                            {files[q.id] ? (
                                <div className="text-center">
                                    <p className="text-xs font-bold text-green-600 mb-2">Selected Diagram Attached!</p>
                                    <div className="w-full bg-white p-2 border border-green-500 shadow-sm truncate text-xs">
                                        {files[q.id]?.name}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-400 text-xs text-center border-2 border-dashed border-gray-300 w-full h-32 flex items-center justify-center p-4">
                                    No diagram selected
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Bottom Navigation Controls (from Screenshot 5) */}
                <div className="p-4 bg-white border-t border-gray-200 flex justify-center gap-2 relative">
                    {/* Left align graph button */}
                    <div className="absolute left-4">
                        <button className="bg-[#28a745] text-white px-6 py-1.5 text-sm cursor-not-allowed opacity-80 border-b-2 border-green-800">
                            Graph
                        </button>
                    </div>

                    {/* Center Pagination Nav */}
                    <button
                        onClick={() => setCurrentIndex(0)}
                        disabled={currentIndex === 0}
                        className="bg-[#2c7bb6] text-white px-4 py-1.5 text-sm disabled:opacity-50 border-b-2 border-blue-800 border-t border-l border-r border-[#1a5585]"
                    >
                        &lt;&lt; First
                    </button>
                    <button
                        onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
                        disabled={currentIndex === 0}
                        className="bg-[#2c7bb6] text-white px-4 py-1.5 text-sm disabled:opacity-50 border-b-2 border-blue-800 border-t border-l border-r border-[#1a5585]"
                    >
                        &lt; Previous
                    </button>
                    <button
                        onClick={() => setCurrentIndex(p => Math.min(questions.length - 1, p + 1))}
                        disabled={currentIndex === questions.length - 1}
                        className="bg-[#2c7bb6] text-white px-4 py-1.5 text-sm disabled:opacity-50 border-b-2 border-blue-800 border-t border-l border-r border-[#1a5585]"
                    >
                        Next &gt;
                    </button>
                    <button
                        onClick={() => setCurrentIndex(questions.length - 1)}
                        disabled={currentIndex === questions.length - 1}
                        className="bg-[#2c7bb6] text-white px-4 py-1.5 text-sm disabled:opacity-50 border-b-2 border-blue-800 border-t border-l border-r border-[#1a5585]"
                    >
                        Last &gt;&gt;
                    </button>

                    {/* Right align submit button */}
                    <div className="absolute right-4">
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className={`px-8 py-1.5 text-sm border-b-2 ${currentIndex === questions.length - 1 || Object.keys(answers).length > 0
                                    ? 'bg-[#28a745] border-green-800 text-white cursor-pointer hover:bg-green-600'
                                    : 'bg-gray-400 border-gray-500 text-gray-200 cursor-not-allowed'
                                }`}
                        >
                            {submitting ? 'Sending...' : 'Submit'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
