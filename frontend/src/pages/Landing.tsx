import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, ShoppingCart } from 'lucide-react';

export default function Landing() {
    const navigate = useNavigate();
    const { token, logout } = useAuth();

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800">
            {/* HERO SECTION WITH BACKGROUND AND GRADIENT OVERLAY */}
            <div className="relative overflow-hidden bg-primary-900 pb-32 pt-6 sm:pb-40">
                {/* Background image overlay */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                        alt="Student studying"
                        className="h-full w-full object-cover opacity-30 mix-blend-multiply"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-800/80 mix-blend-multiply" />
                </div>

                {/* BOTTOM WAVE DIVIDER */}
                <div className="absolute bottom-0 inset-x-0 w-full overflow-hidden leading-none z-10">
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[60px] md:h-[120px] block" style={{ transform: "rotateY(180deg)" }}>
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,121.32,198.71,114.63c68-6.71,136.21-27,203-45.71C401.53,68.91,401.76,68.91,321.39,56.44Z" fill="#ffffff"></path>
                    </svg>
                </div>

                <div className="relative z-20">
                    {/* NAVIGATION BAR */}
                    <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            {/* Logo */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <img src="/logo.png" alt="MegaForte" className="h-16 w-16 object-contain bg-white rounded-full shadow-lg p-1" />
                            </div>

                            {/* Desktop Navigation Links */}
                            <div className="hidden md:block">
                                <ul className="flex items-center space-x-6 text-sm font-semibold text-white/90">
                                    <li><a href="#" className="hover:text-white transition">ABOUT US</a></li>
                                    <li><a href="#" className="hover:text-white transition">COURSES</a></li>
                                    <li><a href="#" className="hover:text-white transition">e-EDUCATORS</a></li>
                                    <li><a href="#" className="hover:text-white transition">CONTACT US</a></li>
                                    <li><a href="#" className="hover:text-white transition">SUPPORT</a></li>
                                </ul>
                            </div>

                            {/* Right Actions */}
                            <div className="hidden lg:flex items-center gap-6">
                                <div className="flex items-center gap-4 text-white/90">
                                    <Bell size={18} className="cursor-pointer hover:text-white transition" />
                                    <div className="flex items-center text-sm font-bold cursor-pointer hover:text-white transition">
                                        <ShoppingCart size={18} className="mr-1" />
                                        Cart (0)
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="border border-white/50 bg-white/10 backdrop-blur-sm text-white px-4 py-1.5 text-sm font-semibold rounded hover:bg-white/20 transition">
                                        Account
                                    </button>
                                    {token ? (
                                        <button
                                            onClick={logout}
                                            className="bg-green-500 text-white px-4 py-1.5 text-sm font-bold uppercase rounded hover:bg-green-600 transition"
                                        >
                                            Signout
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="bg-green-500 text-white px-4 py-1.5 text-sm font-bold uppercase rounded hover:bg-green-600 transition"
                                        >
                                            Login
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="bg-blue-500 text-white px-6 py-1.5 text-sm font-bold rounded hover:bg-blue-600 transition ml-2 shadow-lg hover:shadow-xl"
                                    >
                                        Start Here
                                    </button>
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* HERO CONTENT */}
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24 mb-16">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-5xl leading-tight">
                                SINGAPORE PSLE, IGCSE, IBDP EXAM SYLLABUS AND MORE EXAMS PREPARATION
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg text-white/80 leading-relaxed font-medium mix-blend-screen drop-shadow-md">
                                We provide students with powerful diagnostics to direct students towards getting high grades for their examinations.
                            </p>
                            <div className="mt-10">
                                <button className="rounded-full border border-white/80 bg-transparent px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-white/10 transition backdrop-blur-sm">
                                    LEARN MORE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SPACER FOR WAVE COMPONENT TO OVERLAY EXACTLY LIKE THE MOCKUP */}
            <div className="h-32 bg-white"></div>
        </div>
    );
}
