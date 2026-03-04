import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../lib/api';
import { User, Mail, Save, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [loading, setLoading] = useState(false);

    const initials = user?.name
        ?.split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '??';

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name.trim()) { toast.error('Name cannot be empty'); return; }
        setLoading(true);
        try {
            const { data } = await api.put('/users/me', { name: name.trim() });
            updateUser(data.user);
            toast.success('Profile updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen" style={{ background: 'var(--color-bg)' }}>
            <Sidebar searchValue="" onSearchChange={() => { }} onNewNote={() => navigate('/notes/new')} />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-6 sm:px-8 py-12 pt-24 md:pt-12 space-y-10">
                    {/* Back */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2.5 text-base hover:opacity-80 transition-opacity font-semibold"
                        style={{ color: 'var(--color-muted)' }}
                    >
                        <ArrowLeft size={20} /> Back
                    </button>

                    <h1 className="text-6xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>Settings</h1>

                    {/* Avatar */}
                    <div className="flex items-center gap-6 p-8 rounded-2xl border shadow-lg"
                        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0"
                            style={{ background: 'var(--color-accent)' }}
                        >
                            {initials}
                        </div>
                        <div>
                            <p className="font-bold text-2xl mb-1" style={{ color: 'var(--color-text)' }}>{user?.name}</p>
                            <p className="text-base font-medium" style={{ color: 'var(--color-muted)' }}>{user?.email}</p>
                        </div>
                    </div>

                    {/* Edit profile form */}
                    <div className="rounded-2xl border p-8 shadow-lg" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Profile information</h2>

                        <form onSubmit={handleSave} className="flex flex-col gap-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-muted)' }}>Full name</label>
                                <div className="flex items-center gap-3 px-5 py-4 rounded-xl border focus-within:border-purple-500/60 transition-colors shadow-sm"
                                    style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
                                    <User size={18} style={{ color: 'var(--color-muted)' }} />
                                    <input
                                        id="settings-name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-transparent text-base outline-none flex-1"
                                        style={{ color: 'var(--color-text)' }}
                                        placeholder="Your name"
                                    />
                                </div>
                            </div>

                            {/* Email - read only */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-muted)' }}>Email address</label>
                                <div className="flex items-center gap-3 px-5 py-4 rounded-xl border opacity-60 shadow-sm"
                                    style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
                                    <Mail size={16} style={{ color: 'var(--color-muted)' }} />
                                    <input
                                        value={user?.email || ''}
                                        readOnly
                                        className="bg-transparent text-sm outline-none flex-1 cursor-not-allowed"
                                        style={{ color: 'var(--color-text)' }}
                                    />
                                </div>
                                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Email cannot be changed</p>
                            </div>

                            <div className="flex justify-end mt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    id="settings-save"
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                                    style={{ background: 'var(--color-accent)', color: '#fff' }}
                                >
                                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                    {loading ? 'Saving…' : 'Save changes'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* App info */}
                    <div className="mt-5 p-4 rounded-2xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>About NoteCollab</h2>
                        <div className="flex flex-col gap-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>
                            <p>Version 1.0.0</p>
                            <p>Stack: MongoDB · Express · React · Node.js · TipTap · Tailwind CSS</p>
                            <p>Built for Agro Ventures Digital technical assessment</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
