import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.token, response.data.user);
            navigate(`/${response.data.user.role}-dashboard`);
        } catch (err) {
            const error = err as { response?: { data?: { error?: string } } };
            setError(error.response?.data?.error || 'Login failed. Server may be starting up — please try again.');
        } finally {
            setLoading(false);
        }
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

            <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 shadow-2xl border-t-8 border-green-500 relative z-10 rounded-sm">
                <div className="flex flex-col items-center">
                    <img src="/logo.png" alt="MegaForte" className="h-28 w-28 object-contain mb-4 shadow-md bg-white rounded-full" />
                    <h2 className="text-center text-2xl font-extrabold text-gray-900 uppercase tracking-widest">
                        Sign In
                    </h2>
                    <p className="mt-2 text-center text-xs text-gray-500 font-bold uppercase tracking-wider">
                        INTEMASS LMS PORTAL
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="text-red-600 text-xs font-bold text-center bg-red-50 p-3 border border-red-200 rounded">
                            {error}
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Email address / Student Login
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50 font-medium rounded-sm"
                                placeholder="e.g. 1@intemass.com or teacher@intemass.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50 font-medium rounded-sm"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold uppercase tracking-widest text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed rounded-sm"
                        >
                            {loading ? '⏳ Signing in...' : 'Sign In to Portal'}
                        </button>
                    </div>

                    <div className="flex justify-between items-center text-xs font-bold pt-2">
                        <Link to="/register" className="text-primary-600 hover:text-primary-800 uppercase tracking-wider">
                            Create an Account
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
