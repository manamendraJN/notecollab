import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotes } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';
import RichEditor from '../components/RichEditor';

import {
    ArrowLeft, Users, Save, Tag, X, Pin, PinOff, Palette,
    Clock, User, CheckCircle2, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const NOTE_COLORS = [
    { label: 'Default', value: '#ffffff' },
    { label: 'Purple', value: '#7c6af7' },
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Teal', value: '#14b8a6' },
    { label: 'Green', value: '#22c55e' },
    { label: 'Yellow', value: '#eab308' },
    { label: 'Orange', value: '#f97316' },
    { label: 'Pink', value: '#ec4899' },
    { label: 'Red', value: '#ef4444' },
];

const NoteEditorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchNote, createNote, updateNote, currentNote, setCurrentNote } = useNotes();
    const { user } = useAuth();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [color, setColor] = useState('#ffffff');
    const [isPinned, setIsPinned] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showCollabModal, setShowCollabModal] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);

    const saveTimer = useRef(null);
    const noteIdRef = useRef(null);

    // Load note or prepare new
    useEffect(() => {
        const init = async () => {
            if (id === 'new') {
                setIsNew(true);
                setCurrentNote(null);
                setTitle('');
                setContent('');
                setTags([]);
                setColor('#ffffff');
                setIsPinned(false);
                return;
            }
            setLoading(true);
            try {
                const note = await fetchNote(id);
                noteIdRef.current = note._id;
                setTitle(note.title);
                setContent(note.content || '');
                setTags(note.tags || []);
                setColor(note.color || '#ffffff');
                setIsPinned(note.isPinned || false);

                // Check permission
                const ownerId = note.owner._id || note.owner;
                if (ownerId.toString() !== user._id.toString()) {
                    const collab = note.collaborators?.find(
                        (c) => (c.user._id || c.user).toString() === user._id.toString()
                    );
                    if (collab?.permission === 'view') setIsReadOnly(true);
                }
            } catch {
                toast.error('Note not found');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Auto-save on change (debounced 1.5s)
    const triggerAutoSave = useCallback((newTitle, newContent, newTags, newColor, newPinned) => {
        if (isReadOnly) return;
        clearTimeout(saveTimer.current);
        setSaved(false);
        saveTimer.current = setTimeout(() => {
            handleSave(newTitle, newContent, newTags, newColor, newPinned);
        }, 1500);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReadOnly, isNew]);

    const handleSave = async (t = title, c = content, tg = tags, cl = color, pin = isPinned) => {
        if (!t.trim()) return;
        setSaving(true);
        try {
            if (isNew && !noteIdRef.current) {
                const note = await createNote({ title: t, content: c, tags: tg, color: cl, isPinned: pin });
                noteIdRef.current = note._id;
                setIsNew(false);
                navigate(`/notes/${note._id}`, { replace: true });
            } else {
                await updateNote(noteIdRef.current || id, { title: t, content: c, tags: tg, color: cl, isPinned: pin });
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        triggerAutoSave(e.target.value, content, tags, color, isPinned);
    };

    const handleContentChange = (html) => {
        setContent(html);
        triggerAutoSave(title, html, tags, color, isPinned);
    };

    const handleAddTag = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().toLowerCase().replace(/,/g, '');
            if (!tags.includes(newTag)) {
                const newTags = [...tags, newTag];
                setTags(newTags);
                triggerAutoSave(title, content, newTags, color, isPinned);
            }
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        const newTags = tags.filter((t) => t !== tag);
        setTags(newTags);
        triggerAutoSave(title, content, newTags, color, isPinned);
    };

    const togglePin = () => {
        const newPinned = !isPinned;
        setIsPinned(newPinned);
        triggerAutoSave(title, content, tags, color, newPinned);
    };

    const selectColor = (val) => {
        setColor(val);
        setShowColorPicker(false);
        triggerAutoSave(title, content, tags, val, isPinned);
    };

    const isOwner = currentNote
        ? (currentNote.owner._id || currentNote.owner).toString() === user._id.toString()
        : isNew;

    const dotColor = NOTE_COLORS.find((c) => c.value === color)?.value || '#7c6af7';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen" style={{ background: 'var(--color-bg)' }}>
                <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen" style={{ background: 'var(--color-bg)' }}>
            {/* Top bar */}
            <header
                className="flex items-center justify-between px-6 py-4 border-b gap-4"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                        style={{ color: 'var(--color-muted)' }}
                    >
                        <ArrowLeft size={18} />
                    </button>

                    {/* Color dot */}
                    <div
                        className="w-3.5 h-3.5 rounded-full cursor-pointer border-2 hover:scale-110 transition-transform"
                        style={{ background: dotColor === '#ffffff' ? 'var(--color-accent)' : dotColor, borderColor: 'var(--color-border)' }}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                    />

                    {/* Color picker popup */}
                    {showColorPicker && (
                        <div
                            className="absolute top-14 left-16 z-20 p-3 rounded-2xl border shadow-xl animate-scale-in"
                            style={{ background: 'var(--color-surface2)', borderColor: 'var(--color-border)' }}
                        >
                            <p className="text-xs mb-2 font-medium" style={{ color: 'var(--color-muted)' }}>Note color</p>
                            <div className="grid grid-cols-5 gap-2">
                                {NOTE_COLORS.map((c) => (
                                    <button
                                        key={c.value}
                                        onClick={() => selectColor(c.value)}
                                        title={c.label}
                                        className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                                        style={{
                                            background: c.value === '#ffffff' ? 'var(--color-accent)' : c.value,
                                            borderColor: color === c.value ? '#fff' : 'transparent',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Save status */}
                    <div className="flex items-center gap-1.5 ">
                        {saving && <Loader2 size={14} className="animate-spin" style={{ color: 'var(--color-muted)' }} />}
                        {saved && !saving && <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />}
                        {saving && <span className="text-xs hidden sm:block" style={{ color: 'var(--color-muted)' }}>Saving…</span>}
                        {saved && !saving && <span className="text-xs hidden sm:block" style={{ color: 'var(--color-success)' }}>Saved</span>}
                    </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                    {isOwner && !isNew && (
                        <button
                            onClick={() => setShowCollabModal(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all hover:bg-white/5"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
                        >
                            <Users size={15} />
                            <span className="hidden sm:block">Share</span>
                            {currentNote?.collaborators?.length > 0 && (
                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                                    style={{ background: 'var(--color-accent)', color: '#fff' }}>
                                    {currentNote.collaborators.length}
                                </span>
                            )}
                        </button>
                    )}

                    {isOwner && (
                        <button
                            onClick={togglePin}
                            className="p-2 rounded-xl border transition-all hover:bg-white/5"
                            style={{ borderColor: 'var(--color-border)', color: isPinned ? 'var(--color-accent)' : 'var(--color-muted)' }}
                            title={isPinned ? 'Unpin' : 'Pin'}
                        >
                            {isPinned ? <Pin size={16} /> : <PinOff size={16} />}
                        </button>
                    )}

                    {!isReadOnly && (
                        <button
                            onClick={() => handleSave()}
                            disabled={saving || !title.trim()}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90 disabled:opacity-40"
                            style={{ background: 'var(--color-accent)', color: '#fff' }}
                        >
                            <Save size={15} />
                            <span>Save</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Meta bar */}
            {currentNote && (
                <div
                    className="flex items-center gap-4 px-8 py-3 text-xs border-b flex-wrap"
                    style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
                >
                    <span className="flex items-center gap-1">
                        <User size={11} />
                        {currentNote.owner?.name || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={11} />
                        Updated {formatDistanceToNow(new Date(currentNote.updatedAt), { addSuffix: true })}
                    </span>
                    {currentNote.lastEditedBy && (
                        <span className="flex items-center gap-1">
                            Last edited by {currentNote.lastEditedBy.name}
                        </span>
                    )}
                    {isReadOnly && (
                        <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--color-surface2)', color: 'var(--color-accent)' }}>
                            View only
                        </span>
                    )}
                </div>
            )}

            {/* Title */}
            <div className="px-8 pt-8 pb-3" style={{ background: 'var(--color-bg)' }}>
                <input
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Note title..."
                    disabled={isReadOnly}
                    className="w-full bg-transparent text-3xl font-bold outline-none placeholder-transparent border-none"
                    style={{ color: 'var(--color-text)', caretColor: 'var(--color-accent)' }}
                />
                <style>{`input::placeholder { color: var(--color-border); }`}</style>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{ background: 'var(--color-surface2)', color: 'var(--color-accent2)' }}
                        >
                            #{tag}
                            {!isReadOnly && (
                                <button onClick={() => removeTag(tag)} className="ml-0.5 hover:text-red-400 transition-colors">
                                    <X size={11} />
                                </button>
                            )}
                        </span>
                    ))}
                    {!isReadOnly && (
                        <div className="flex items-center gap-1">
                            <Tag size={12} style={{ color: 'var(--color-muted)' }} />
                            <input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder="Add tag..."
                                className="bg-transparent text-xs outline-none w-24"
                                style={{ color: 'var(--color-muted)' }}
                            />
                        </div>
                    )}
                </div>

                <div className="mt-4 border-t" style={{ borderColor: 'var(--color-border)' }} />
            </div>

            {/* Editor */}
            <div className="flex-1 min-h-0" style={{ background: 'var(--color-bg)' }}>
                <RichEditor
                    content={content}
                    onChange={handleContentChange}
                    readOnly={isReadOnly}
                    placeholder="Start writing your note…"
                />
            </div>

            {/* Collaborator Modal */}
            {showCollabModal && currentNote && (
                <CollaboratorModal note={currentNote} onClose={() => setShowCollabModal(false)} />
            )}
        </div>
    );
};

export default NoteEditorPage;
