import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import { StickyNote, Plus, ChevronLeft, ChevronRight, Filter, Hash, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { notes, loading, totalPages, currentPage, total, fetchNotes, updateNote, deleteNote } = useNotes();

    const [search, setSearch] = useState('');
    const [tagFilter, setTagFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pinnedOnly, setPinnedOnly] = useState(false);

    const searchTimer = useRef(null);

    const load = useCallback((params = {}) => {
        fetchNotes({
            search: params.search ?? search,
            tag: params.tag ?? tagFilter,
            page: params.page ?? page,
            pinned: params.pinned ?? (pinnedOnly ? 'true' : undefined),
            limit: 12,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, tagFilter, page, pinnedOnly]);

    useEffect(() => { load(); }, [load]);

    const handleSearchChange = (val) => {
        setSearch(val);
        setPage(1);
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            fetchNotes({ search: val, tag: tagFilter, page: 1, pinned: pinnedOnly ? 'true' : undefined, limit: 12 });
        }, 400);
    };

    const handleNoteClick = (note) => navigate(`/notes/${note._id}`);

    const handleNewNote = () => navigate('/notes/new');

    const handlePin = async (note) => {
        try {
            await updateNote(note._id, { isPinned: !note.isPinned });
            toast.success(note.isPinned ? 'Note unpinned' : 'Note pinned');
        } catch { toast.error('Failed to update'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this note?')) return;
        try {
            await deleteNote(id);
            toast.success('Note deleted');
        } catch { toast.error('Failed to delete'); }
    };

    const handleTagFilter = (tag) => {
        const newTag = tagFilter === tag ? '' : tag;
        setTagFilter(newTag);
        setPage(1);
        fetchNotes({ search, tag: newTag, page: 1, pinned: pinnedOnly ? 'true' : undefined, limit: 12 });
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        fetchNotes({ search, tag: tagFilter, page: newPage, pinned: pinnedOnly ? 'true' : undefined, limit: 12 });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const togglePinned = () => {
        const newPinned = !pinnedOnly;
        setPinnedOnly(newPinned);
        setPage(1);
        fetchNotes({ search, tag: tagFilter, page: 1, pinned: newPinned ? 'true' : undefined, limit: 12 });
    };

    const allTags = [...new Set(notes.flatMap((n) => n.tags || []))].slice(0, 12);

    const firstName = user?.name?.split(' ')[0] || 'there';

    return (
        <div className="flex h-screen" style={{ background: 'var(--color-bg)' }}>
            <Sidebar
                searchValue={search}
                onSearchChange={handleSearchChange}
                onNewNote={handleNewNote}
            />

            {/* Main content */}
            <main className="flex-1 overflow-y-auto md:pl-0">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 pt-20 md:pt-10">
                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                            Hey, {firstName} 👋
                        </h1>
                        <p style={{ color: 'var(--color-muted)' }}>
                            {total > 0 ? `You have ${total} note${total !== 1 ? 's' : ''}` : 'Start writing your first note'}
                        </p>
                    </div>

                    {/* Filter bar */}
                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                        <button
                            onClick={togglePinned}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${pinnedOnly ? 'border-purple-500/60' : 'hover:border-purple-500/30'
                                }`}
                            style={{
                                borderColor: pinnedOnly ? 'var(--color-accent)' : 'var(--color-border)',
                                background: pinnedOnly ? 'rgba(124,106,247,0.15)' : 'var(--color-surface)',
                                color: pinnedOnly ? 'var(--color-accent)' : 'var(--color-muted)',
                            }}
                        >
                            <Filter size={14} />
                            Pinned
                        </button>

                        {allTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => handleTagFilter(tag)}
                                className="flex items-center gap-1 px-3 py-2 rounded-xl border text-sm font-medium transition-all"
                                style={{
                                    borderColor: tagFilter === tag ? 'var(--color-accent)' : 'var(--color-border)',
                                    background: tagFilter === tag ? 'rgba(124,106,247,0.15)' : 'var(--color-surface)',
                                    color: tagFilter === tag ? 'var(--color-accent)' : 'var(--color-muted)',
                                }}
                            >
                                <Hash size={12} />
                                {tag}
                            </button>
                        ))}

                        {(tagFilter || pinnedOnly) && (
                            <button
                                onClick={() => { setTagFilter(''); setPinnedOnly(false); setPage(1); fetchNotes({ search, page: 1, limit: 12 }); }}
                                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm transition-all hover:bg-white/5"
                                style={{ color: 'var(--color-muted)' }}
                            >
                                <X size={13} /> Clear filters
                            </button>
                        )}
                    </div>

                    {/* Notes grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: 'var(--color-surface)' }} />
                            ))}
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
                            <div className="p-5 rounded-2xl" style={{ background: 'var(--color-surface)' }}>
                                <StickyNote size={36} style={{ color: 'var(--color-accent)' }} />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                                    {search ? 'No notes found' : 'No notes yet'}
                                </p>
                                <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
                                    {search ? 'Try a different search term' : 'Click "New Note" to create your first note'}
                                </p>
                                {!search && (
                                    <button
                                        onClick={handleNewNote}
                                        className="flex items-center gap-1 px-5 py-2.5 border-2 rounded-xl text-sm font-medium translate-x-21 transition-all hover:opacity-90"
                                        style={{ background: 'var(--color-accent)', color: '#fff' }}
                                    >
                                        <Plus size={16} /> Create Note
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {notes.map((note) => (
                                <NoteCard
                                    key={note._id}
                                    note={note}
                                    onClick={handleNoteClick}
                                    onPin={handlePin}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-10">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl border transition-all hover:bg-white/5 disabled:opacity-30"
                                style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
                            >
                                <ChevronLeft size={18} />
                            </button>

                            {[...Array(totalPages)].map((_, i) => {
                                const p = i + 1;
                                const isActive = p === currentPage;
                                if (Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
                                    return p === currentPage - 3 || p === currentPage + 3
                                        ? <span key={p} style={{ color: 'var(--color-muted)' }}>…</span>
                                        : null;
                                }
                                return (
                                    <button
                                        key={p}
                                        onClick={() => handlePageChange(p)}
                                        className="w-9 h-9 rounded-xl text-sm font-medium transition-all"
                                        style={{
                                            background: isActive ? 'var(--color-accent)' : 'var(--color-surface)',
                                            color: isActive ? '#fff' : 'var(--color-muted)',
                                            border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                                        }}
                                    >
                                        {p}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl border transition-all hover:bg-white/5 disabled:opacity-30"
                                style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
