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
    const [showDetailedReport, setShowDetailedReport] = useState(false);
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
    const standardText = submission.standard_answer ? submission.standard_answer.replace(/<[^>]+>/g, '') : '';
    
    // Split by newlines or numbered points (e.g. "1. ", "2. ")
    const splitRegex = /(?:\n+)|(?=\b\d+\.\s)/g;
    const stdParagraphs = standardText.split(splitRegex).map(p => p.trim()).filter(p => p.length > 0);
    
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'as', 'into', 'through', 'and', 'or', 'but', 'if', 'then', 'that', 'this', 'it', 'its', 'from']);
    const tokenise = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
    
    const studentTokensSet = new Set(tokenise(rawStudentText));

    let dynamicMatchCount = 0;
    const parsedActualAnswer = stdParagraphs.map((para, idx) => {
        if (!para) return null;
        const paraTokens = tokenise(para);
        const matchedTokens = paraTokens.filter(t => studentTokensSet.has(t)).length;
        const isMatchedBool = paraTokens.length > 0 && matchedTokens >= Math.min(2, paraTokens.length / 3);

        if (isMatchedBool) dynamicMatchCount++;

        let colorClass = 'text-gray-800'; // Default
        if (studentTokensSet.size > 0) {
            if (isMatched) {
                colorClass = 'text-green-600 font-bold';
            } else {
                colorClass = 'text-red-500 font-bold italic';
            }
        }

        return (
            <div key={idx} className={`mb-4 font-semibold text-sm leading-relaxed ${colorClass}`}>
                {para}
            </div>
        );
    });

    const maxM = submission.max_marks || 6;
    
    // Dynamically calculate the score on the frontend so old submissions show the correct partial marks!
    let dynamicallyCalculatedScore = stdParagraphs.length > 0 
        ? Math.round((dynamicMatchCount / stdParagraphs.length) * maxM) 
        : 0;
        
    // Penalty logic for short factual answers with "shotgun guessing"
    const stdTokensSet = new Set(tokenise(standardText));
    const questionText = submission.question_text ? submission.question_text.replace(/<[^>]+>/g, '') : '';
    const questionTokensSet = new Set(tokenise(questionText));
    
    const isShortAnswer = stdTokensSet.size <= 3;
    if (isShortAnswer && dynamicallyCalculatedScore > 0) {
        let guessingTokensCount = 0;
        for (const t of studentTokensSet) {
            if (!stdTokensSet.has(t) && !questionTokensSet.has(t)) {
                guessingTokensCount++;
            }
        }
        if (guessingTokensCount > 0) {
            const penaltyFactor = stdTokensSet.size / (stdTokensSet.size + guessingTokensCount);
            dynamicallyCalculatedScore = Math.round(dynamicallyCalculatedScore * penaltyFactor);
        }
    }
    // Parse Advanced Feedback from the new AI pipeline
    let advancedFeedbackObj: any = null;
    if (submission.feedback) {
        try {
            advancedFeedbackObj = JSON.parse(submission.feedback);
            if (typeof advancedFeedbackObj === 'string') {
                advancedFeedbackObj = JSON.parse(advancedFeedbackObj);
            }
        } catch(e) {
            console.error("Failed to parse advanced feedback", e);
        }
    }
        
    // Use the actual score from the database (graded by AI), fallback to math logic only if null
    const scoredM = (submission.marks_awarded !== null && submission.marks_awarded !== undefined) 
        ? submission.marks_awarded 
        : dynamicallyCalculatedScore;
        
    const cfPercent = ((scoredM / maxM) * 100).toFixed(2);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center">
            {/* MegaForte Navbar */}
            <nav className="bg-primary-900 px-4 sm:px-6 lg:px-8 shadow-sm w-full">
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

            <div className="w-full max-w-5xl py-8 px-4">
                <button onClick={() => {
                    if (showDetailedReport) setShowDetailedReport(false);
                    else navigate('/student-dashboard');
                }} className="mb-6 inline-flex items-center text-xs font-bold uppercase tracking-widest text-primary-600 hover:text-primary-800 transition">
                    <ArrowLeft size={16} className="mr-1" /> {showDetailedReport ? 'Back to Summary' : 'Back to Dashboard'}
                </button>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs font-bold border border-red-200">{error}</div>}

                {!showDetailedReport ? (
                    // TASK ACHIEVEMENT SUMMARY (Main View)
                    <div className="bg-white w-full shadow-2xl overflow-hidden border border-gray-400">
                        <div className="bg-[#483259] text-white px-6 py-4 flex justify-center items-center">
                            <h2 className="text-xl font-semibold tracking-wide">Student Report: {submission.assignment_title}</h2>
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
                                            <button onClick={() => setShowDetailedReport(true)} className="bg-[#2D1B42] text-white text-[10px] uppercase font-bold px-4 py-1.5 rounded-sm shadow hover:bg-purple-900 transition">Feedback</button>
                                        </td>
                                        <td className="p-4"></td>
                                        <td className="p-4"></td>
                                        <td className="p-4">
                                            <button onClick={() => setShowDetailedReport(true)} className="bg-[#2D1B42] text-white text-[10px] uppercase font-bold px-4 py-1.5 rounded-sm shadow hover:bg-purple-900 transition">Feedback</button>
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
                    </div>
                ) : (
                    // 6-COLUMN DETAILED FEEDBACK REPORT
                    <div className="bg-white border-2 border-black overflow-hidden shadow-sm">
                        {/* Header Table */}
                        <div className="grid grid-cols-[1fr_2fr_1fr_1fr] border-b-2 border-black text-sm font-bold divide-x-2 divide-black">
                            <div className="grid grid-rows-3 divide-y-2 divide-black text-center">
                                <div className="p-2 flex items-center justify-center">Student name</div>
                                <div className="p-2 flex items-center justify-center">Date</div>
                                <div className="p-2 flex items-center justify-center">Time</div>
                            </div>
                            <div className="grid grid-rows-3 divide-y-2 divide-black text-center font-normal">
                                <div className="p-2 flex items-center justify-center font-bold">{submission.student_name}</div>
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
                        <div className="grid grid-cols-[1fr_2fr_1fr] border-b-2 border-black text-sm font-bold divide-x-2 divide-black">
                            <div className="p-2 text-center bg-[#e5e1e8]">Student Answer</div>
                            <div className="p-2 text-center bg-[#e5e1e8]">Actual Answer</div>
                            <div className="grid grid-cols-3 divide-x-2 divide-black col-span-1 text-[10px]">
                                <div className="p-2 flex items-center justify-center">Max. Marks</div>
                                <div className="p-2 flex items-center justify-center">Scored</div>
                                <div className="p-2 flex items-center justify-center">C.F %</div>
                            </div>
                        </div>

                        {/* Question Row */}
                        <div className="flex items-center gap-2 p-4 font-bold text-sm bg-white border-b-2 border-black">
                            <span>Question: 1</span>
                            <div dangerouslySetInnerHTML={{ __html: submission.question_text }} />
                        </div>

                        {/* Content Row */}
                        <div className="flex divide-x-2 divide-black min-h-[400px]">
                            <div className="p-4 w-[33.333%] text-xs leading-relaxed whitespace-pre-wrap font-serif italic text-gray-800">
                                {rawStudentText ? (
                                    <span className="text-gray-800">{rawStudentText}</span>
                                ) : (
                                    <span className="text-gray-400">No answer provided</span>
                                )}
                            </div>
                            <div className="p-4 w-[66.666%] space-y-4 relative">
                                <div className="pr-[150px]">
                                    {/* Always show the exact actual answer text with color coding */}
                                    <div className="mb-6">
                                        <h4 className="font-bold text-gray-700 text-xs uppercase tracking-widest mb-3 border-b border-gray-300 pb-1">Expected Standard Answer</h4>
                                        {parsedActualAnswer}
                                    </div>
                                </div>
                                <div className="absolute right-0 top-0 h-full w-[150px] flex">
                                    <div className="w-[50px] flex items-start justify-center p-4 font-bold text-sm border-l-2 border-black">{maxM}</div>
                                    <div className="w-[50px] flex items-start justify-center p-4 font-bold text-sm border-l-2 border-black">{scoredM}</div>
                                    <div className="w-[50px] flex items-start justify-center p-4 font-bold text-sm border-l-2 border-black">{cfPercent}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
