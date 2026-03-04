import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { NotebookPen, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim() || !form.password) {
            toast.error('Please fill in all fields');
            return;
        }
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', form);
            login(data.user, data.token);
            toast.success(`Welcome, ${data.user.name.split(' ')[0]}!`);
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'var(--color-bg)' }}
        >
            {/* Background glow */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ background: 'var(--color-accent)' }}
            />

            <div
                className="w-full max-w-md rounded-2xl border p-8 shadow-lg animate-fade-in relative"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-xl" style={{ background: 'var(--color-accent)' }}>
                        <NotebookPen size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>NoteCollab</h1>
                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Collaborative Note-Taking</p>
                    </div>
                </div>

                <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Create an account</h2>
                <p className="text-sm mb-7" style={{ color: 'var(--color-muted)' }}>
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium hover:underline" style={{ color: 'var(--color-accent)' }}>
                        Sign in
                    </Link>
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Full name</label>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border focus-within:border-purple-500/60 transition-colors"
                            style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
                            <User size={16} style={{ color: 'var(--color-muted)' }} />
                            <input
                                id="register-name"
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="bg-transparent text-sm outline-none flex-1"
                                style={{ color: 'var(--color-text)' }}
                                autoComplete="name"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Email address</label>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border focus-within:border-purple-500/60 transition-colors"
                            style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
                            <Mail size={16} style={{ color: 'var(--color-muted)' }} />
                            <input
                                id="register-email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="bg-transparent text-sm outline-none flex-1"
                                style={{ color: 'var(--color-text)' }}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Password</label>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border focus-within:border-purple-500/60 transition-colors"
                            style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
                            <Lock size={16} style={{ color: 'var(--color-muted)' }} />
                            <input
                                id="register-password"
                                name="password"
                                type={showPass ? 'text' : 'password'}
                                value={form.password}
                                onChange={handleChange}
                                placeholder="At least 6 characters"
                                className="bg-transparent text-sm outline-none flex-1"
                                style={{ color: 'var(--color-text)' }}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                style={{ color: 'var(--color-muted)' }}
                                className="hover:text-white transition-colors"
                            >
                                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        id="register-submit"
                        className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold text-sm mt-2 transition-all shadow-sm hover:opacity-90 disabled:opacity-50"
                        style={{ background: 'var(--color-accent)', color: '#fff' }}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                        {loading ? 'Creating account…' : 'Sign up'}
                    </button>
                </form>

                {/* Demo hint */}
                <div className="mt-5 p-3 rounded-xl border text-center"
                    style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        💡 Your data is secure with JWT authentication
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
