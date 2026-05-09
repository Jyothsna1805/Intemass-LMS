import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, FolderOpen, Bell, ShoppingCart } from 'lucide-react';

interface Question { id: string; question_text: string; type: string; created_at: string; }
interface User { id: string; email: string; role: string; full_name: string | null; institution: string | null; created_at: string; }
interface Assignment { id: string; title: string; instructions: string; due_date: string; created_at: string; }

export default function MasterDashboard() {
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState<'questions' | 'users' | 'assignments'>('questions');

    const [questions, setQuestions] = useState<Question[]>([]);
    const [usersList, setUsersList] = useState<User[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);

    const [newQuestionText, setNewQuestionText] = useState('');
    const [newStandardAnswer, setNewStandardAnswer] = useState('');
    const [newType, setNewType] = useState('essay');

    useEffect(() => {
        fetchQuestions(); fetchUsers(); fetchAssignments();
    }, []);

    const fetchQuestions = async () => { try { const res = await api.get('/questions'); setQuestions(res.data); } catch (err) { console.error(err); } };
    const fetchUsers = async () => { try { const res = await api.get('/users'); setUsersList(res.data); } catch (err) { console.error(err); } };
    const fetchAssignments = async () => { try { const res = await api.get('/assignments'); setAssignments(res.data); } catch (err) { console.error(err); } };

    const handleCreateQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await api.post('/questions', { questionText: newQuestionText, standardAnswer: newStandardAnswer, type: newType });
            setNewQuestionText(''); setNewStandardAnswer(''); fetchQuestions();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* MegaForte Navbar */}
            <nav className="bg-primary-900 px-4 sm:px-6 lg:px-8 shadow-sm">
                <div className="flex h-16 items-center justify-between max-w-7xl mx-auto">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <img src="/logo.png" alt="MegaForte" className="h-10 w-10 object-contain bg-white rounded-full shadow-sm" />
                    </div>

                    <div className="hidden lg:flex items-center gap-6">
                        <div className="flex items-center space-x-6 text-xs font-semibold text-white/90">
                            <span className="text-primary-200">MASTER ADMIN: {user?.email}</span>
                        </div>
                        <div className="flex items-center gap-4 text-white/90">
                            <Bell size={18} className="cursor-pointer hover:text-white" />
                            <div className="flex items-center text-sm font-bold cursor-pointer hover:text-white">
                                <ShoppingCart size={18} className="mr-1" /> Cart (0)
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="border border-white/50 text-white px-4 py-1.5 text-sm font-semibold hover:bg-white/10">
                                Account
                            </button>
                            <button onClick={logout} className="bg-green-500 text-white px-4 py-1.5 text-sm font-bold uppercase hover:bg-green-600">
                                SIGNOUT
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <button onClick={() => setActiveTab('questions')} className={`py-4 px-1 inline-flex items-center gap-2 border-b-4 font-bold uppercase tracking-wide text-xs ${activeTab === 'questions' ? 'border-primary-600 text-primary-800' : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}>
                            <BookOpen size={16} /> Question Bank
                        </button>
                        <button onClick={() => setActiveTab('users')} className={`py-4 px-1 inline-flex items-center gap-2 border-b-4 font-bold uppercase tracking-wide text-xs ${activeTab === 'users' ? 'border-primary-600 text-primary-800' : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}>
                            <Users size={16} /> User Directory
                        </button>
                        <button onClick={() => setActiveTab('assignments')} className={`py-4 px-1 inline-flex items-center gap-2 border-b-4 font-bold uppercase tracking-wide text-xs ${activeTab === 'assignments' ? 'border-primary-600 text-primary-800' : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}>
                            <FolderOpen size={16} /> Global Assignments
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'questions' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 bg-white p-6 rounded-sm shadow-sm border border-gray-100 h-fit">
                            <h2 className="text-sm font-extrabold mb-4 uppercase tracking-widest text-primary-900 border-b-2 border-primary-100 pb-2">Create New Question</h2>
                            <form onSubmit={handleCreateQuestion} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Question Type</label>
                                    <select className="w-full border border-gray-300 p-2 focus:border-primary-500 text-sm outline-none bg-gray-50" value={newType} onChange={(e) => setNewType(e.target.value)}>
                                        <option value="essay">Essay</option>
                                        <option value="short_answer">Short Answer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Question Text</label>
                                    <textarea required className="w-full border border-gray-300 p-2 focus:border-primary-500 text-sm outline-none bg-gray-50" rows={4} value={newQuestionText} onChange={(e) => setNewQuestionText(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Standard/Model Answer</label>
                                    <textarea className="w-full border border-gray-300 p-2 focus:border-primary-500 text-sm outline-none bg-gray-50" rows={4} value={newStandardAnswer} onChange={(e) => setNewStandardAnswer(e.target.value)} />
                                </div>
                                <button type="submit" className="w-full bg-primary-800 text-white py-2 mt-2 hover:bg-primary-900 font-bold uppercase tracking-wider text-sm transition shadow-md">
                                    Create Question
                                </button>
                            </form>
                        </div>

                        <div className="lg:col-span-2 bg-white p-6 rounded-sm shadow-sm border border-gray-100">
                            <h2 className="text-sm font-extrabold mb-4 uppercase tracking-widest text-primary-900 border-b-2 border-primary-100 pb-2">Question Bank Data</h2>
                            <div className="space-y-4">
                                {questions.map((q) => (
                                    <div key={q.id} className="border border-gray-200 p-4 hover:border-primary-300 transition-colors bg-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-primary-100 text-primary-800 uppercase tracking-widest">
                                                {q.type.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs text-gray-400 font-bold">{new Date(q.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-gray-900 whitespace-pre-wrap text-sm font-medium">{q.question_text}</p>
                                    </div>
                                ))}
                                {questions.length === 0 && <p className="text-gray-400 text-center py-8 text-sm font-bold uppercase tracking-widest">No questions created yet.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b-2 border-primary-100">
                            <h3 className="text-sm font-extrabold uppercase tracking-widest text-primary-900">User Directory</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-[10px] font-black tracking-widest text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-black tracking-widest text-gray-500 uppercase">Role</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-black tracking-widest text-gray-500 uppercase">Institution</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-black tracking-widest text-gray-500 uppercase">Join Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {usersList.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{u.full_name || 'N/A'}</div>
                                                <div className="text-xs text-gray-500">{u.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${u.role === 'master' ? 'bg-purple-100 text-purple-800' : u.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">{u.institution || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'assignments' && (
                    <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b-2 border-primary-100">
                            <h3 className="text-sm font-extrabold uppercase tracking-widest text-primary-900">Global Assignments</h3>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {assignments.map((assignment) => (
                                <li key={assignment.id} className="p-6 hover:bg-gray-50 transition border-l-4 border-transparent hover:border-primary-500">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-sm font-extrabold tracking-wider uppercase text-gray-900">{assignment.title}</h4>
                                            <p className="text-sm text-gray-600 mt-2 font-medium">{assignment.instructions}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold uppercase tracking-widest text-primary-700 bg-primary-50 px-3 py-1">Due: {new Date(assignment.due_date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
}
