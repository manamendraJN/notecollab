import { createContext, useContext, useState, useCallback } from 'react';
import api from '../lib/api';

const NotesContext = createContext(null);

export const NotesProvider = ({ children }) => {
    const [notes, setNotes] = useState([]);
    const [currentNote, setCurrentNote] = useState(null);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchNotes = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const { data } = await api.get('/notes', { params });
            setNotes(data.notes);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
            setTotal(data.total);
            return data;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchNote = useCallback(async (id) => {
        const { data } = await api.get(`/notes/${id}`);
        setCurrentNote(data.note);
        return data.note;
    }, []);

    const createNote = useCallback(async (noteData) => {
        const { data } = await api.post('/notes', noteData);
        setNotes((prev) => [data.note, ...prev]);
        return data.note;
    }, []);

    const updateNote = useCallback(async (id, noteData) => {
        const { data } = await api.put(`/notes/${id}`, noteData);
        setNotes((prev) => prev.map((n) => (n._id === id ? data.note : n)));
        setCurrentNote(data.note);
        return data.note;
    }, []);

    const deleteNote = useCallback(async (id) => {
        await api.delete(`/notes/${id}`);
        setNotes((prev) => prev.filter((n) => n._id !== id));
        if (currentNote?._id === id) setCurrentNote(null);
    }, [currentNote]);

    const addCollaborator = useCallback(async (noteId, email, permission) => {
        const { data } = await api.post(`/notes/${noteId}/collaborators`, { email, permission });
        setCurrentNote(data.note);
        setNotes((prev) => prev.map((n) => (n._id === noteId ? data.note : n)));
        return data.note;
    }, []);

    const updateCollaborator = useCallback(async (noteId, userId, permission) => {
        const { data } = await api.put(`/notes/${noteId}/collaborators/${userId}`, { permission });
        setCurrentNote(data.note);
        setNotes((prev) => prev.map((n) => (n._id === noteId ? data.note : n)));
        return data.note;
    }, []);

    const removeCollaborator = useCallback(async (noteId, userId) => {
        const { data } = await api.delete(`/notes/${noteId}/collaborators/${userId}`);
        setCurrentNote(data.note);
        setNotes((prev) => prev.map((n) => (n._id === noteId ? data.note : n)));
        return data.note;
    }, []);

    return (
        <NotesContext.Provider value={{
            notes, currentNote, loading, totalPages, currentPage, total,
            fetchNotes, fetchNote, createNote, updateNote, deleteNote,
            addCollaborator, updateCollaborator, removeCollaborator,
            setCurrentNote,
        }}>
            {children}
        </NotesContext.Provider>
    );
};

export const useNotes = () => useContext(NotesContext);
