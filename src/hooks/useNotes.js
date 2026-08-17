import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addNote as createNote,
  deleteNote as removeNote,
  getNotes,
  updateNote as editNote,
} from '../supabase/notes';
import useAuthStore from '../store/useAuthStore';

/**
 * Subject markdown notes management hook with 30s auto-save.
 * @param {string} [subjectId] - Active subject UUID.
 */
export const useNotes = (subjectId) => {
  const user = useAuthStore((state) => state.user);

  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const noteRef = useRef(null);
  noteRef.current = currentNote;
  const isDirtyRef = useRef(false);
  isDirtyRef.current = isDirty;

  const fetchNotes = useCallback(async (sId = subjectId) => {
    if (!sId) return;
    try {
      setIsLoading(true);
      const data = await getNotes(sId);
      setNotes(data || []);
    } catch {
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [subjectId]);

  const openNote = useCallback((note) => {
    setCurrentNote(note);
    setIsDirty(false);
  }, []);

  const updateContent = useCallback((content, title) => {
    setCurrentNote((prev) => (prev ? { ...prev, content, title: title || prev.title } : null));
    setIsDirty(true);
  }, []);

  const saveNote = useCallback(async (noteToSave) => {
    const target = noteToSave || noteRef.current;
    if (!target?.id) return;
    try {
      setIsSaving(true);
      const updated = await editNote(target.id, target.content, target.title);
      setCurrentNote(updated);
      setLastSaved(new Date().toISOString());
      setIsDirty(false);
      await fetchNotes(target.subject_id);
    } catch {
      // Background save error
    } finally {
      setIsSaving(false);
    }
  }, [fetchNotes]);

  const addNote = useCallback(async (sId, data) => {
    if (!user?.id) return null;
    try {
      setIsLoading(true);
      const row = await createNote(sId || subjectId, user.id, data);
      await fetchNotes(sId || subjectId);
      setCurrentNote(row);
      return row;
    } catch (err) {
      throw new Error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchNotes, subjectId, user?.id]);

  const deleteNote = useCallback(async (noteId, sId) => {
    try {
      setIsLoading(true);
      await removeNote(noteId);
      if (currentNote?.id === noteId) setCurrentNote(null);
      await fetchNotes(sId || subjectId);
    } catch (err) {
      throw new Error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentNote?.id, fetchNotes, subjectId]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isDirtyRef.current && noteRef.current?.id) {
        saveNote(noteRef.current);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [saveNote]);

  return {
    notes,
    currentNote,
    isLoading,
    isSaving,
    lastSaved,
    fetchNotes,
    openNote,
    updateContent,
    saveNote,
    addNote,
    deleteNote,
  };
};

export default useNotes;
