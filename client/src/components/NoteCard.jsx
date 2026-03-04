import { formatDistanceToNow } from 'date-fns';
import { Pin, PinOff, Trash2, Users, Eye, Edit3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

const NoteCard = ({ note, onClick, onPin, onDelete }) => {
    const { user } = useAuth();
    const isOwner = note.owner._id === user._id || note.owner === user._id;
    const collabCount = note.collaborators?.length || 0;

    const dotColor = NOTE_COLORS.find((c) => c.value === note.color)?.value || '#ffffff';

    const rawText = note.content
        ? note.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        : '';

    const preview = rawText.length > 120 ? rawText.slice(0, 120) + '…' : rawText;

    const timeAgo = formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true });

    return (
        <div
            onClick={() => onClick(note)}
            className="group relative flex flex-col gap-3 p-5 rounded-2xl border cursor-pointer 
                 transition-all duration-200 animate-fade-in
                 hover:border-purple-500/40 hover:-translate-y-0.5 hover:shadow-lg"
            style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
            }}
        >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="note-dot flex-shrink-0" style={{ background: dotColor === '#ffffff' ? 'var(--color-accent)' : dotColor }} />
                    <h3 className="font-semibold text-sm line-clamp-2 leading-snug" style={{ color: 'var(--color-text)' }}>
                        {note.title}
                    </h3>
                </div>

                {/* Action buttons (appear on hover) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {isOwner && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onPin(note); }}
                            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                            style={{ color: note.isPinned ? 'var(--color-accent)' : 'var(--color-muted)' }}
                            title={note.isPinned ? 'Unpin' : 'Pin'}
                        >
                            {note.isPinned ? <Pin size={14} /> : <PinOff size={14} />}
                        </button>
                    )}
                    {isOwner && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(note._id); }}
                            className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                            style={{ color: 'var(--color-danger)' }}
                            title="Delete"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Preview */}
            {preview && (
                <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--color-muted)' }}>
                    {preview}
                </p>
            )}

            {/* Tags */}
            {note.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {note.tags.slice(0, 4).map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{ background: 'var(--color-surface2)', color: 'var(--color-accent2)' }}
                        >
                            #{tag}
                        </span>
                    ))}
                    {note.tags.length > 4 && (
                        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>+{note.tags.length - 4}</span>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t"
                style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2">
                    {note.isPinned && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-accent)' }}>
                            <Pin size={11} /> Pinned
                        </span>
                    )}
                    {collabCount > 0 && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                            <Users size={11} /> {collabCount}
                        </span>
                    )}
                    {!isOwner && (
                        <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full"
                            style={{ background: 'var(--color-surface2)', color: 'var(--color-muted)' }}>
                            <Eye size={11} /> Shared
                        </span>
                    )}
                </div>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{timeAgo}</span>
            </div>
        </div>
    );
};

export default NoteCard;
