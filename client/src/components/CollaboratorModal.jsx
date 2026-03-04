import { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, ChevronDown, Mail, Shield, Eye } from 'lucide-react';
import { useNotes } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

const CollaboratorModal = ({ note, onClose }) => {
    const { addCollaborator, updateCollaborator, removeCollaborator } = useNotes();
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('view');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [searchTimeout, setSearchTimeout] = useState(null);

    const isOwner = note.owner._id === user._id || note.owner === user._id;

    // Search user suggestions
    useEffect(() => {
        if (email.length < 2) { setSuggestions([]); return; }
        clearTimeout(searchTimeout);
        const t = setTimeout(async () => {
            try {
                const { data } = await api.get('/users/search', { params: { email } });
                setSuggestions(data.users);
            } catch { setSuggestions([]); }
        }, 350);
        setSearchTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        try {
            await addCollaborator(note._id, email.trim(), permission);
            toast.success('Collaborator added!');
            setEmail('');
            setSuggestions([]);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add collaborator');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (userId, newPerm) => {
        try {
            await updateCollaborator(note._id, userId, newPerm);
            toast.success('Permission updated');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update permission');
        }
    };

    const handleRemove = async (userId, name) => {
        if (!confirm(`Remove ${name} from this note?`)) return;
        try {
            await removeCollaborator(note._id, userId);
            toast.success('Collaborator removed');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div
                className="w-full max-w-md rounded-2xl border flex flex-col animate-scale-in shadow-xl"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', maxHeight: '90vh' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
                    <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                        <UserPlus size={20} style={{ color: 'var(--color-accent)' }} />
                        Manage Collaborators
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--color-muted)' }}>
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto px-6 py-4 flex flex-col gap-5">
                    {/* Add collaborator form - owner only */}
                    {isOwner && (
                        <form onSubmit={handleAdd} className="flex flex-col gap-3">
                            <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
                                Add collaborator
                            </p>
                            <div className="relative">
                                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
                                    style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
                                    <Mail size={15} style={{ color: 'var(--color-muted)' }} />
                                    <input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter email address..."
                                        className="bg-transparent text-sm outline-none flex-1"
                                        style={{ color: 'var(--color-text)' }}
                                        autoComplete="off"
                                    />
                                </div>
                                {/* Search suggestions */}
                                {suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border overflow-hidden z-10"
                                        style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}>
                                        {suggestions.map((u) => (
                                            <button
                                                key={u._id}
                                                type="button"
                                                onClick={() => { setEmail(u.email); setSuggestions([]); }}
                                                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm hover:bg-white/5 transition-colors"
                                                style={{ color: 'var(--color-text)' }}
                                            >
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                                    style={{ background: 'var(--color-accent)' }}>
                                                    {u.name[0].toUpperCase()}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium text-xs">{u.name}</p>
                                                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{u.email}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <select
                                        value={permission}
                                        onChange={(e) => setPermission(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border text-sm appearance-none pr-8 outline-none"
                                        style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                    >
                                        <option value="view">Can view</option>
                                        <option value="edit">Can edit</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-muted)' }} />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !email.trim()}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:opacity-90 disabled:opacity-40"
                                    style={{ background: 'var(--color-accent)', color: '#fff' }}
                                >
                                    {loading ? '...' : 'Add'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Existing collaborators */}
                    <div>
                        <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>
                            Current collaborators ({note.collaborators?.length || 0})
                        </p>

                        {(!note.collaborators || note.collaborators.length === 0) ? (
                            <p className="text-sm text-center py-4" style={{ color: 'var(--color-muted)' }}>
                                No collaborators yet
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {note.collaborators.map((c) => {
                                    const collaboratorUser = c.user;
                                    const displayName = collaboratorUser?.name || 'Unknown';
                                    const displayEmail = collaboratorUser?.email || '';
                                    const initials = displayName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

                                    return (
                                        <div
                                            key={c._id || collaboratorUser?._id}
                                            className="flex items-center gap-3 p-3 rounded-xl border"
                                            style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}
                                        >
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                                style={{ background: 'var(--color-accent)' }}>
                                                {initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{displayName}</p>
                                                <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>{displayEmail}</p>
                                            </div>

                                            {isOwner ? (
                                                <div className="flex items-center gap-1.5">
                                                    <div className="relative">
                                                        <select
                                                            value={c.permission}
                                                            onChange={(e) => handleUpdate(collaboratorUser._id, e.target.value)}
                                                            className="text-xs px-2 py-1.5 rounded-lg border appearance-none pr-5 outline-none"
                                                            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                                                        >
                                                            <option value="view">View</option>
                                                            <option value="edit">Edit</option>
                                                        </select>
                                                        <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-muted)' }} />
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemove(collaboratorUser._id, displayName)}
                                                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                                                        style={{ color: 'var(--color-danger)' }}
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                                                    style={{ background: 'var(--color-surface)', color: 'var(--color-muted)' }}>
                                                    {c.permission === 'edit' ? <Shield size={11} /> : <Eye size={11} />}
                                                    {c.permission}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollaboratorModal;
