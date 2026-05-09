import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [fullName, setFullName] = useState('');
    const [institution, setInstitution] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/register', { email, password, role, fullName, institution });
            login(response.data.token, response.data.user);
            navigate(`/${role}-dashboard`);
        } catch (err) {
            const error = err as { response?: { data?: { error?: string } } };
            setError(error.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                    alt="Background"
                    className="h-full w-full object-cover opacity-20 mix-blend-multiply"
                />
            </div>

            <div className="max-w-md w-full space-y-8 bg-white p-10 shadow-2xl border-t-8 border-green-500 relative z-10">
                <div className="flex flex-col items-center">
                    <img src="/logo.png" alt="MegaForte" className="h-28 w-28 object-contain mb-4 shadow-md bg-white rounded-full" />
                    <h2 className="text-center text-2xl font-extrabold text-gray-900 uppercase tracking-widest">
                        Register Account
                    </h2>
                    <p className="mt-2 text-center text-xs text-gray-500 font-bold uppercase tracking-wider">
                        INTEMASS LMS PORTAL
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    {error && <div className="text-red-600 text-xs font-bold text-center bg-red-50 p-3 border border-red-200">{error}</div>}

                    <div className="flex justify-between items-center mb-4">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600">I am a:</label>
                        <select
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm font-bold uppercase tracking-wide rounded-none focus:ring-primary-500 focus:border-primary-500 block p-2"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="master">Master</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        <input type="email" required className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 sm:text-sm bg-gray-50 font-medium" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input type="password" required className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 sm:text-sm bg-gray-50 font-medium" placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <input type="text" className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 sm:text-sm bg-gray-50 font-medium" placeholder="Full Name (Optional)" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        <input type="text" className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 sm:text-sm bg-gray-50 font-medium" placeholder="Institution (Optional)" value={institution} onChange={(e) => setInstitution(e.target.value)} />
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold uppercase tracking-widest text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-sm">
                            Create Account
                        </button>
                    </div>

                    <div className="text-xs text-center font-bold">
                        <Link to="/login" className="text-primary-600 hover:text-primary-800 uppercase tracking-wider">
                            Already have an account? Sign in
                        </Link>
                    </div>
                    <div className="text-xs text-center font-bold mt-2">
                        <Link to="/" className="text-gray-500 hover:text-gray-800 uppercase tracking-wider">
                            &larr; Back to Home
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
