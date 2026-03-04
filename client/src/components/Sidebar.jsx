import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    NotebookPen, Search, LogOut, Settings, Plus, Moon, Users,
    ChevronLeft, Menu, X,
} from 'lucide-react';

const Sidebar = ({ onSearchChange, searchValue, onNewNote }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { to: '/dashboard', label: 'My Notes', icon: NotebookPen },
        { to: '/shared', label: 'Shared with me', icon: Users },
    ];

    const initials = user?.name
        ?.split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '??';

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between px-5 py-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg" style={{ background: 'var(--color-accent)' }}>
                            <NotebookPen size={18} className="text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--color-text)' }}>
                            NoteCollab
                        </span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-white/5 hidden md:flex"
                    style={{ color: 'var(--color-muted)' }}
                >
                    <ChevronLeft size={16} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                </button>
                <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-white/5 md:hidden"
                    style={{ color: 'var(--color-muted)' }}
                >
                    <X size={16} />
                </button>
            </div>

            {/* Search */}
            {!collapsed && (
                <div className="px-4 py-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                        style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
                        <Search size={14} style={{ color: 'var(--color-muted)' }} />
                        <input
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search notes..."
                            className="bg-transparent text-sm outline-none flex-1"
                            style={{ color: 'var(--color-text)' }}
                        />
                    </div>
                </div>
            )}

            {/* New Note Button */}
            <div className="px-4 pb-3">
                <button
                    onClick={onNewNote}
                    className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 
                      hover:opacity-90 active:scale-95 ${collapsed ? 'justify-center' : ''}`}
                    style={{ background: 'var(--color-accent)', color: '#fff' }}
                    title="New Note"
                >
                    <Plus size={16} />
                    {!collapsed && <span>New Note</span>}
                </button>
            </div>

            {/* Nav links */}
            <nav className="px-3 flex-1 flex flex-col gap-1">
                {navLinks.map(({ to, label, icon: Icon }) => {
                    const active = location.pathname === to;
                    return (
                        <Link
                            key={to}
                            to={to}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                         ${active ? 'text-white' : 'hover:bg-white/5'}`}
                            style={{
                                background: active ? 'var(--color-accent)' : 'transparent',
                                color: active ? '#fff' : 'var(--color-muted)',
                            }}
                            title={label}
                        >
                            <Icon size={16} />
                            {!collapsed && <span>{label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* User / Settings */}
            <div className="border-t px-3 py-4 mt-auto" style={{ borderColor: 'var(--color-border)' }}>
                <Link to="/settings" onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-1 transition-all hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}
                    style={{ color: 'var(--color-muted)' }} title="Settings"
                >
                    <Settings size={16} />
                    {!collapsed && <span>Settings</span>}
                </Link>

                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full transition-all hover:bg-red-500/10 ${collapsed ? 'justify-center' : ''}`}
                    style={{ color: 'var(--color-danger)' }} title="Sign out"
                >
                    <LogOut size={16} />
                    {!collapsed && <span>Sign out</span>}
                </button>

                {!collapsed && (
                    <div className="flex items-center gap-3 mt-3 px-3 py-2.5 rounded-xl border"
                        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface2)' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white "
                            style={{ background: 'var(--color-accent)' }}>
                            {initials}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{user?.name}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>{user?.email}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className="hidden md:flex flex-col h-screen sticky top-0 border-r transition-all duration-300 "
                style={{
                    width: collapsed ? '64px' : '260px',
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                }}
            >
                <SidebarContent />
            </aside>

            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-xl border"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
                <Menu size={20} />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
                    <aside className="relative w-72 h-full border-r flex flex-col"
                        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <SidebarContent />
                    </aside>
                </div>
            )}
        </>
    );
};

export default Sidebar;
