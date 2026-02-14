import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note, NoteGroup, NoteBlock } from '@/types/notes';

interface NotesState {
  groups: NoteGroup[];
  notes: Note[];
  activeNoteId: string | null;

  // Groups
  addGroup: (name: string) => void;
  renameGroup: (id: string, name: string) => void;
  deleteGroup: (id: string) => void;
  toggleGroup: (id: string) => void;

  // Notes
  addNote: (groupId: string, title: string) => void;
  renameNote: (id: string, title: string) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string | null) => void;

  // Blocks
  addBlock: (noteId: string, block: Omit<NoteBlock, 'id'>) => void;
  updateBlock: (noteId: string, blockId: string, content: string) => void;
  deleteBlock: (noteId: string, blockId: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      groups: [
        { id: 'default', name: 'NOTES', isOpen: true, createdAt: Date.now() },
      ],
      notes: [
        {
          id: 'welcome',
          title: 'bienvenue',
          groupId: 'default',
          blocks: [
            { id: 'b1', type: 'text', content: '# Bienvenue dans vos notes !\n\nCommencez à écrire ici. Vous pouvez ajouter du texte, des images, des vidéos et des fichiers.' },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      activeNoteId: 'welcome',

      addGroup: (name) =>
        set((s) => ({
          groups: [...s.groups, { id: uid(), name, isOpen: true, createdAt: Date.now() }],
        })),

      renameGroup: (id, name) =>
        set((s) => ({
          groups: s.groups.map((g) => (g.id === id ? { ...g, name } : g)),
        })),

      deleteGroup: (id) =>
        set((s) => ({
          groups: s.groups.filter((g) => g.id !== id),
          notes: s.notes.filter((n) => n.groupId !== id),
          activeNoteId: s.notes.find((n) => n.id === s.activeNoteId)?.groupId === id ? null : s.activeNoteId,
        })),

      toggleGroup: (id) =>
        set((s) => ({
          groups: s.groups.map((g) => (g.id === id ? { ...g, isOpen: !g.isOpen } : g)),
        })),

      addNote: (groupId, title) => {
        const id = uid();
        set((s) => ({
          notes: [
            ...s.notes,
            { id, title, groupId, blocks: [], createdAt: Date.now(), updatedAt: Date.now() },
          ],
          activeNoteId: id,
        }));
      },

      renameNote: (id, title) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, title, updatedAt: Date.now() } : n)),
        })),

      deleteNote: (id) =>
        set((s) => ({
          notes: s.notes.filter((n) => n.id !== id),
          activeNoteId: s.activeNoteId === id ? null : s.activeNoteId,
        })),

      setActiveNote: (id) => set({ activeNoteId: id }),

      addBlock: (noteId, block) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === noteId
              ? { ...n, blocks: [...n.blocks, { ...block, id: uid() }], updatedAt: Date.now() }
              : n
          ),
        })),

      updateBlock: (noteId, blockId, content) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === noteId
              ? {
                  ...n,
                  blocks: n.blocks.map((b) => (b.id === blockId ? { ...b, content } : b)),
                  updatedAt: Date.now(),
                }
              : n
          ),
        })),

      deleteBlock: (noteId, blockId) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === noteId
              ? { ...n, blocks: n.blocks.filter((b) => b.id !== blockId), updatedAt: Date.now() }
              : n
          ),
        })),
    }),
    { name: 'notes-storage' }
  )
);
