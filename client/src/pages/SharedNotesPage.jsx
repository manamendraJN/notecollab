import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import { Users } from 'lucide-react';

const SharedNotesPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { notes, loading, fetchNotes } = useNotes();

    useEffect(() => {
        // Fetch all notes and filter for ones shared with me (not owned by me)
        fetchNotes({ limit: 100 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const sharedNotes = notes.filter((note) => {
        const ownerId = note.owner?._id || note.owner;
        return ownerId?.toString() !== user._id?.toString();
    });

    return (
        <div className="flex h-screen" style={{ background: 'var(--color-bg)' }}>
            <Sidebar
                searchValue=""
                onSearchChange={() => { }}
                onNewNote={() => navigate('/notes/new')}
            />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 pt-20 md:pt-10">
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold mb-1 flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
                            <Users size={28} style={{ color: 'var(--color-accent)' }} />
                            Shared with me
                        </h1>
                        <p style={{ color: 'var(--color-muted)' }}>
                            Notes that collaborators have shared with you
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: 'var(--color-surface)' }} />
                            ))}
                        </div>
                    ) : sharedNotes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
                            <div className="p-5 rounded-2xl" style={{ background: 'var(--color-surface)' }}>
                                <Users size={36} style={{ color: 'var(--color-accent)' }} />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                                    Nothing shared yet
                                </p>
                                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                                    Ask a colleague to add you as a collaborator on their notes
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sharedNotes.map((note) => (
                                <NoteCard
                                    key={note._id}
                                    note={note}
                                    onClick={(n) => navigate(`/notes/${n._id}`)}
                                    onPin={() => { }}
                                    onDelete={() => { }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SharedNotesPage;
