import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, ShoppingCart, BookOpen, Users, Phone, HelpCircle, Info, Mail, MapPin, ChevronDown, X, Trash2, User as UserIcon, LogOut } from 'lucide-react';

interface CartItem {
    id: string;
    title: string;
    level: string;
    price: number;
}

interface NotificationItem {
    id: string;
    title: string;
    time: string;
    read: boolean;
}

export default function Landing() {
    const navigate = useNavigate();
    const { token, user, logout } = useAuth();

    // Modals and Interactive State
    const [showCart, setShowCart] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const [cart, setCart] = useState<CartItem[]>([
        { id: '1', title: 'Economics Preparation Course', level: 'IGCSE / IBDP', price: 99 }
    ]);

    const [notifications, setNotifications] = useState<NotificationItem[]>([
        { id: '1', title: 'Welcome to INTEMASS LMS! Explore your dashboard.', time: '10 mins ago', read: false },
        { id: '2', title: 'New IGCSE & IBDP Economics Mock Papers added.', time: '2 hours ago', read: false }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleAddToCart = (course: { title: string; level: string }) => {
        const newItem: CartItem = {
            id: Date.now().toString(),
            title: `${course.title} Course`,
            level: course.level,
            price: 99
        };
        setCart(prev => [...prev, newItem]);
        setShowCart(true);
    };

    const handleRemoveFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const handleAccountClick = () => {
        if (token && user) {
            navigate(`/${user.role}-dashboard`);
        } else {
            navigate('/login');
        }
    };

    const markNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800 relative">

            {/* HERO SECTION */}
            <div className="relative overflow-hidden bg-primary-900 pb-32 pt-6 sm:pb-40">
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
                            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                                <img src="/logo.png" alt="MegaForte" className="h-16 w-16 object-contain bg-white rounded-full shadow-lg p-1" />
                            </div>

                            <div className="hidden md:block">
                                <ul className="flex items-center space-x-6 text-sm font-semibold text-white/90">
                                    <li><button onClick={() => scrollTo('about')} className="hover:text-white transition">ABOUT US</button></li>
                                    <li><button onClick={() => scrollTo('courses')} className="hover:text-white transition">COURSES</button></li>
                                    <li><button onClick={() => scrollTo('educators')} className="hover:text-white transition">e-EDUCATORS</button></li>
                                    <li><button onClick={() => scrollTo('contact')} className="hover:text-white transition">CONTACT US</button></li>
                                    <li><button onClick={() => scrollTo('support')} className="hover:text-white transition">SUPPORT</button></li>
                                </ul>
                            </div>

                            <div className="hidden lg:flex items-center gap-6">
                                <div className="flex items-center gap-5 text-white/90 relative">
                                    {/* Bell Notifications Button */}
                                    <div className="relative">
                                        <button 
                                            onClick={() => { setShowNotifications(!showNotifications); setShowCart(false); markNotificationsAsRead(); }} 
                                            className="p-1.5 hover:text-white transition rounded-full hover:bg-white/10 relative"
                                            title="Notifications"
                                        >
                                            <Bell size={20} />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </button>

                                        {/* Notifications Dropdown */}
                                        {showNotifications && (
                                            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 text-gray-800 overflow-hidden">
                                                <div className="bg-primary-900 text-white p-3.5 flex items-center justify-between">
                                                    <span className="font-bold text-sm flex items-center gap-2">
                                                        <Bell size={16} /> Notifications
                                                    </span>
                                                    <button onClick={() => setShowNotifications(false)} className="text-white/80 hover:text-white">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                                <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                                                    {notifications.length === 0 ? (
                                                        <div className="p-4 text-center text-xs text-gray-400">No notifications</div>
                                                    ) : (
                                                        notifications.map(n => (
                                                            <div key={n.id} className="p-3 hover:bg-gray-50 transition text-xs">
                                                                <div className="font-semibold text-gray-800 mb-1">{n.title}</div>
                                                                <div className="text-[10px] text-gray-400">{n.time}</div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Shopping Cart Button */}
                                    <div className="relative">
                                        <button 
                                            onClick={() => { setShowCart(!showCart); setShowNotifications(false); }} 
                                            className="flex items-center text-sm font-bold cursor-pointer hover:text-white transition py-1 px-2.5 rounded-full hover:bg-white/10"
                                        >
                                            <ShoppingCart size={18} className="mr-1.5" />
                                            Cart ({cart.length})
                                        </button>

                                        {/* Cart Dropdown */}
                                        {showCart && (
                                            <div className="absolute right-0 mt-3 w-84 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 text-gray-800 overflow-hidden">
                                                <div className="bg-primary-900 text-white p-3.5 flex items-center justify-between">
                                                    <span className="font-bold text-sm flex items-center gap-2">
                                                        <ShoppingCart size={16} /> Shopping Cart
                                                    </span>
                                                    <button onClick={() => setShowCart(false)} className="text-white/80 hover:text-white">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                                <div className="p-4 max-h-72 overflow-y-auto">
                                                    {cart.length === 0 ? (
                                                        <div className="text-center py-6 text-gray-400 text-sm">
                                                            Your cart is empty.
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {cart.map(item => (
                                                                <div key={item.id} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs">
                                                                    <div>
                                                                        <div className="font-bold text-gray-800">{item.title}</div>
                                                                        <div className="text-[10px] text-gray-400">{item.level}</div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="font-bold text-primary-700">${item.price}</span>
                                                                        <button onClick={() => handleRemoveFromCart(item.id)} className="text-red-400 hover:text-red-600">
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {cart.length > 0 && (
                                                    <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                                        <div>
                                                            <div className="text-[10px] text-gray-400 uppercase font-bold">Total</div>
                                                            <div className="text-base font-extrabold text-primary-900">
                                                                ${cart.reduce((sum, item) => sum + item.price, 0)}
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => navigate('/login')} 
                                                            className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition"
                                                        >
                                                            Checkout
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 relative">
                                    {/* Account Button */}
                                    <button 
                                        onClick={handleAccountClick} 
                                        className="border border-white/50 bg-white/10 backdrop-blur-sm text-white px-4 py-1.5 text-sm font-semibold rounded hover:bg-white/20 transition flex items-center gap-1.5"
                                    >
                                        <UserIcon size={15} />
                                        {user ? user.email.split('@')[0] : 'Account'}
                                    </button>

                                    {/* Login / Signout Button */}
                                    {token ? (
                                        <button 
                                            onClick={logout} 
                                            className="bg-green-500 text-white px-4 py-1.5 text-sm font-bold uppercase rounded hover:bg-green-600 transition flex items-center gap-1.5"
                                        >
                                            <LogOut size={15} /> Signout
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => navigate('/login')} 
                                            className="bg-green-500 text-white px-4 py-1.5 text-sm font-bold uppercase rounded hover:bg-green-600 transition"
                                        >
                                            Login
                                        </button>
                                    )}

                                    {/* Start Here Button */}
                                    <button 
                                        onClick={() => navigate('/register')} 
                                        className="bg-blue-500 text-white px-6 py-1.5 text-sm font-bold rounded hover:bg-blue-600 transition ml-1 shadow-lg hover:shadow-xl uppercase tracking-wider"
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
                            <div className="mt-10 flex gap-4">
                                <button onClick={() => scrollTo('about')} className="rounded-full border border-white/80 bg-transparent px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-white/10 transition backdrop-blur-sm">
                                    LEARN MORE
                                </button>
                                <button onClick={() => navigate('/login')} className="rounded-full bg-green-500 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-600 transition">
                                    GET STARTED
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SPACER */}
            <div className="h-16 bg-white"></div>

            {/* ABOUT US SECTION */}
            <section id="about" className="py-20 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Info size={28} className="text-primary-700" />
                        <h2 className="text-3xl font-extrabold text-primary-900 uppercase tracking-widest">About Us</h2>
                    </div>
                    <div className="w-16 h-1 bg-green-500 mb-10"></div>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Empowering Students with AI-Powered Learning</h3>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                INTEMASS LMS by MegaForte is a cutting-edge Learning Management System designed to help students prepare for Singapore PSLE, IGCSE, IBDP, and other major international examinations.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Our platform combines the expertise of experienced educators with advanced AI grading technology to provide students with instant, detailed feedback on their essay and short-answer responses.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                We believe every student deserves personalised feedback to understand their strengths and areas for improvement — making high exam scores achievable for all.
                            </p>
                            <div className="mt-8 grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-primary-50 rounded-lg">
                                    <div className="text-3xl font-black text-primary-700">500+</div>
                                    <div className="text-xs font-semibold text-gray-500 mt-1 uppercase">Students</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-3xl font-black text-green-700">50+</div>
                                    <div className="text-xs font-semibold text-gray-500 mt-1 uppercase">Educators</div>
                                </div>
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-3xl font-black text-blue-700">10+</div>
                                    <div className="text-xs font-semibold text-gray-500 mt-1 uppercase">Subjects</div>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-xl">
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Students studying together"
                                className="w-full h-80 object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* COURSES SECTION */}
            <section id="courses" className="py-20 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 mb-4">
                        <BookOpen size={28} className="text-primary-700" />
                        <h2 className="text-3xl font-extrabold text-primary-900 uppercase tracking-widest">Courses</h2>
                    </div>
                    <div className="w-16 h-1 bg-green-500 mb-10"></div>
                    <p className="text-gray-600 max-w-2xl mb-12">We offer comprehensive exam preparation across multiple international curricula and subjects.</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: 'Economics', level: 'IGCSE / IBDP', desc: 'Master microeconomics, macroeconomics, and international trade concepts with AI-powered essay grading.', color: 'border-primary-500' },
                            { title: 'Biology', level: 'PSLE / IGCSE', desc: 'Comprehensive biology preparation covering cell biology, genetics, ecology and more.', color: 'border-green-500' },
                            { title: 'Geography', level: 'IGCSE / IBDP', desc: 'Physical and human geography with structured essay practice and detailed feedback.', color: 'border-blue-500' },
                            { title: 'History', level: 'IGCSE / IBDP', desc: 'Source-based questions, essay writing and historical analysis with teacher guidance.', color: 'border-yellow-500' },
                            { title: 'English', level: 'PSLE / IGCSE', desc: 'Essay writing, comprehension, and language skills to achieve top grades.', color: 'border-red-500' },
                            { title: 'Mathematics', level: 'PSLE / IGCSE', desc: 'Problem solving, algebra, statistics and calculus preparation for all levels.', color: 'border-purple-500' },
                        ].map((course, i) => (
                            <div key={i} className={`bg-white rounded-xl shadow-sm border-t-4 ${course.color} p-6 hover:shadow-md transition`}>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{course.level}</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">{course.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{course.desc}</p>
                                <div className="mt-4 flex items-center justify-between">
                                    <button onClick={() => handleAddToCart(course)} className="bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-bold px-3 py-1.5 rounded transition flex items-center gap-1">
                                        <ShoppingCart size={13} /> Add to Cart
                                    </button>
                                    <button onClick={() => navigate('/login')} className="text-primary-600 text-xs font-bold hover:text-primary-800 transition">
                                        Start Learning →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* e-EDUCATORS SECTION */}
            <section id="educators" className="py-20 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Users size={28} className="text-primary-700" />
                        <h2 className="text-3xl font-extrabold text-primary-900 uppercase tracking-widest">e-Educators</h2>
                    </div>
                    <div className="w-16 h-1 bg-green-500 mb-10"></div>
                    <p className="text-gray-600 max-w-2xl mb-12">Our expert educators bring years of experience in international exam preparation. They review student submissions, provide personalised feedback, and guide every student to success.</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: 'Dr. Sunita Sharma', subject: 'Economics & Business', exp: '12 years', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80' },
                            { name: 'Prof. Rajesh Iyer', subject: 'Biology & Science', exp: '15 years', avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=256&h=256&q=80' },
                            { name: 'Dr. Emily Chen', subject: 'Geography & History', exp: '10 years', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=256&h=256&q=80' },
                            { name: 'Prof. David Kumar', subject: 'Mathematics & Physics', exp: '18 years', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80' },
                        ].map((edu, i) => (
                            <div key={i} className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition">
                                <img src={edu.avatar} alt={edu.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-primary-100" />
                                <h3 className="font-bold text-gray-800 text-sm">{edu.name}</h3>
                                <p className="text-primary-600 text-xs font-semibold mt-1">{edu.subject}</p>
                                <p className="text-gray-400 text-xs mt-1">{edu.exp} experience</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 bg-primary-900 rounded-2xl p-8 text-center text-white">
                        <h3 className="text-xl font-bold mb-2">Are you an educator?</h3>
                        <p className="text-white/70 mb-6">Join our growing network of expert educators and help students achieve their exam goals.</p>
                        <button onClick={() => navigate('/register')} className="bg-green-500 text-white px-8 py-3 rounded font-bold hover:bg-green-600 transition">
                            Join as an Educator
                        </button>
                    </div>
                </div>
            </section>

            {/* CONTACT US SECTION */}
            <section id="contact" className="py-20 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Phone size={28} className="text-primary-700" />
                        <h2 className="text-3xl font-extrabold text-primary-900 uppercase tracking-widest">Contact Us</h2>
                    </div>
                    <div className="w-16 h-1 bg-green-500 mb-10"></div>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Get in Touch</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <Mail size={20} className="text-primary-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <div className="font-semibold text-gray-700">Email</div>
                                        <div className="text-gray-500 text-sm">support@intemass.com</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Phone size={20} className="text-primary-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <div className="font-semibold text-gray-700">Phone</div>
                                        <div className="text-gray-500 text-sm">+65 6123 4567</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <MapPin size={20} className="text-primary-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <div className="font-semibold text-gray-700">Address</div>
                                        <div className="text-gray-500 text-sm">MegaForte Global LMS<br />1 Raffles Place, Singapore 048616</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Send us a Message</h3>
                            <div className="space-y-4">
                                <input type="text" placeholder="Your Name" className="w-full border border-gray-200 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                                <input type="email" placeholder="Your Email" className="w-full border border-gray-200 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                                <textarea rows={4} placeholder="Your Message" className="w-full border border-gray-200 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"></textarea>
                                <button className="w-full bg-primary-700 text-white py-3 rounded font-bold hover:bg-primary-800 transition text-sm uppercase tracking-widest">
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SUPPORT SECTION */}
            <section id="support" className="py-20 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 mb-4">
                        <HelpCircle size={28} className="text-primary-700" />
                        <h2 className="text-3xl font-extrabold text-primary-900 uppercase tracking-widest">Support</h2>
                    </div>
                    <div className="w-16 h-1 bg-green-500 mb-10"></div>
                    <p className="text-gray-600 max-w-2xl mb-12">Frequently asked questions to help you get started and make the most of INTEMASS LMS.</p>
                    <div className="space-y-4 max-w-3xl">
                        {[
                            { q: 'How do I create a student account?', a: 'Click "Start Here" or "Login" on the homepage, then select "Create an Account". Choose the Student role and fill in your details.' },
                            { q: 'How does AI grading work?', a: 'Our AI uses advanced NLP (Natural Language Processing) to compare your answer against the model answer. It checks semantic similarity, keyword coverage, and concept overlap to award accurate marks.' },
                            { q: 'Can I request a reassessment?', a: 'Yes! After viewing your marked submission, you can select specific points you disagree with, provide your reasoning, and submit a reassessment request. Your teacher will review it and may update your marks.' },
                            { q: 'How do I submit an assignment?', a: 'Log in as a student, go to your dashboard, select an assignment, type or upload your answer, and click Submit. Your work will be automatically graded.' },
                            { q: 'Can teachers create their own questions?', a: 'Yes. Teachers can log in and go to the Answer Databank to create essay or short-answer questions with model answers and assign them to modules.' },
                            { q: 'Is my data secure?', a: 'Yes. All data is stored in a secure PostgreSQL database hosted on Supabase with encrypted connections. Your personal information is never shared with third parties.' },
                        ].map((faq, i) => (
                            <details key={i} className="group border border-gray-200 rounded-xl">
                                <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-gray-800 hover:bg-gray-50 rounded-xl transition list-none">
                                    {faq.q}
                                    <ChevronDown size={18} className="text-gray-400 group-open:rotate-180 transition-transform" />
                                </summary>
                                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{faq.a}</div>
                            </details>
                        ))}
                    </div>
                    <div className="mt-12 text-center">
                        <p className="text-gray-600 mb-4">Still have questions?</p>
                        <button onClick={() => scrollTo('contact')} className="bg-primary-700 text-white px-8 py-3 rounded font-bold hover:bg-primary-800 transition text-sm uppercase tracking-widest">
                            Contact Support
                        </button>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-primary-900 text-white/70 py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <img src="/logo.png" alt="MegaForte" className="h-12 w-12 object-contain bg-white rounded-full mx-auto mb-4 p-1" />
                    <p className="text-sm">© 2026 MegaForte Global LMS — INTEMASS. All rights reserved.</p>
                    <div className="flex justify-center gap-6 mt-4 text-xs font-semibold uppercase tracking-widest">
                        <button onClick={() => scrollTo('about')} className="hover:text-white transition">About</button>
                        <button onClick={() => scrollTo('courses')} className="hover:text-white transition">Courses</button>
                        <button onClick={() => scrollTo('educators')} className="hover:text-white transition">Educators</button>
                        <button onClick={() => scrollTo('contact')} className="hover:text-white transition">Contact</button>
                        <button onClick={() => scrollTo('support')} className="hover:text-white transition">Support</button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
