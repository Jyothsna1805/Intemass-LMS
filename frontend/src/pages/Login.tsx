import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { User, Users, GraduationCap, ShieldCheck } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const doLogin = async (loginEmail: string, loginPass: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/login', { email: loginEmail, password: loginPass });
            login(response.data.token, response.data.user);
            navigate(`/${response.data.user.role}-dashboard`);
        } catch (err) {
            const error = err as { response?: { data?: { error?: string } } };
            setError(error.response?.data?.error || 'Login failed. Server may be waking up — please try again in 30 seconds.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await doLogin(email, password);
    };

    const handleQuickLogin = (demoEmail: string, demoPass: string) => {
        setEmail(demoEmail);
        setPassword(demoPass);
        doLogin(demoEmail, demoPass);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

            {/* Background elements */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                    alt="Background"
                    className="h-full w-full object-cover opacity-20 mix-blend-multiply"
                />
            </div>

            <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 shadow-2xl border-t-8 border-green-500 relative z-10 rounded-lg">
                <div className="flex flex-col items-center">
                    <img src="/logo.png" alt="MegaForte" className="h-24 w-24 object-contain mb-3 shadow-md bg-white rounded-full" />
                    <h2 className="text-center text-2xl font-extrabold text-gray-900 uppercase tracking-widest">
                        Sign In
                    </h2>
                    <p className="mt-1 text-center text-xs text-gray-500 font-bold uppercase tracking-wider">
                        INTEMASS LMS PORTAL
                    </p>
                </div>

                {/* Quick Student Logins Picker */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-primary-600" />
                        Quick Student & Teacher Logins:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleQuickLogin('1@intemass.com', 'password123')}
                            className="text-left bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 p-2 rounded transition group text-xs"
                        >
                            <div className="font-bold text-slate-800 group-hover:text-emerald-800">👨‍🎓 Student 1</div>
                            <div className="text-[10px] text-slate-500">1@intemass.com (Roll 001)</div>
                        </button>

                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleQuickLogin('2@intemass.com', 'password123')}
                            className="text-left bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 p-2 rounded transition group text-xs"
                        >
                            <div className="font-bold text-slate-800 group-hover:text-emerald-800">👩‍🎓 Student 2</div>
                            <div className="text-[10px] text-slate-500">2@intemass.com (Roll 002)</div>
                        </button>

                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleQuickLogin('3@intemass.com', 'password123')}
                            className="text-left bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 p-2 rounded transition group text-xs"
                        >
                            <div className="font-bold text-slate-800 group-hover:text-emerald-800">👨‍🎓 Student 3</div>
                            <div className="text-[10px] text-slate-500">3@intemass.com (Roll 003)</div>
                        </button>

                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleQuickLogin('teacher@intemass.com', 'password123')}
                            className="text-left bg-white border border-slate-200 hover:border-primary-500 hover:bg-primary-50/50 p-2 rounded transition group text-xs"
                        >
                            <div className="font-bold text-primary-900">👨‍🏫 Teacher</div>
                            <div className="text-[10px] text-slate-500">teacher@intemass.com</div>
                        </button>
                    </div>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {error && <div className="text-red-600 text-xs font-bold text-center bg-red-50 p-3 border border-red-200 rounded">{error}</div>}
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="email-address" className="block text-xs font-bold text-gray-700 uppercase mb-1">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 rounded placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50 font-medium"
                                placeholder="e.g. 1@intemass.com or 2@intemass.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 rounded placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50 font-medium"
                                placeholder="Password (default: password123)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold uppercase tracking-widest text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed rounded"
                        >
                            {loading ? '⏳ Signing in...' : 'Sign In to Portal'}
                        </button>
                    </div>

                    <div className="flex justify-between items-center text-xs font-bold pt-2">
                        <Link to="/register" className="text-primary-600 hover:text-primary-800 uppercase tracking-wider">
                            Register New Account
                        </Link>
                        <Link to="/" className="text-gray-500 hover:text-gray-800 uppercase tracking-wider">
                            &larr; Back to Home
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
