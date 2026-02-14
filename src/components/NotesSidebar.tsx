import { useState } from 'react';
import { Hash, Plus, ChevronDown, ChevronRight, Trash2, Pencil, FolderPlus } from 'lucide-react';
import { useNotesStore } from '@/store/useNotesStore';
import { cn } from '@/lib/utils';

export function NotesSidebar() {
  const { groups, notes, activeNoteId, addGroup, renameGroup, deleteGroup, toggleGroup, addNote, renameNote, deleteNote, setActiveNote } = useNotesStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newNoteGroupId, setNewNoteGroupId] = useState<string | null>(null);
  const [newNoteName, setNewNoteName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ id: string; type: 'group' | 'note'; x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, id: string, type: 'group' | 'note') => {
    e.preventDefault();
    setContextMenu({ id, type, x: e.clientX, y: e.clientY });
  };

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
    setContextMenu(null);
  };

  const commitRename = (type: 'group' | 'note') => {
    if (!editingId || !editValue.trim()) return;
    if (type === 'group') renameGroup(editingId, editValue.trim());
    else renameNote(editingId, editValue.trim());
    setEditingId(null);
  };

  const handleDelete = () => {
    if (!contextMenu) return;
    if (contextMenu.type === 'group') deleteGroup(contextMenu.id);
    else deleteNote(contextMenu.id);
    setContextMenu(null);
  };

  const submitNewNote = (groupId: string) => {
    if (newNoteName.trim()) addNote(groupId, newNoteName.trim());
    setNewNoteGroupId(null);
    setNewNoteName('');
  };

  const submitNewGroup = () => {
    if (newGroupName.trim()) addGroup(newGroupName.trim().toUpperCase());
    setShowNewGroup(false);
    setNewGroupName('');
  };

  return (
    <aside
      className="w-[280px] min-w-[280px] h-screen flex flex-col bg-[hsl(var(--sidebar-bg))] select-none overflow-hidden rounded-r-lg"
      onClick={() => setContextMenu(null)}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-lg font-extrabold tracking-tight">Mes Notes</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4">
        {groups.map((group) => {
          const groupNotes = notes.filter((n) => n.groupId === group.id);
          return (
            <div key={group.id}>
              <div
                className="group flex items-center gap-1 px-3 py-1.5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors text-[11px] font-bold tracking-widest uppercase"
                onClick={() => toggleGroup(group.id)}
                onContextMenu={(e) => handleContextMenu(e, group.id, 'group')}
              >
                {group.isOpen ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
                {editingId === group.id ? (
                  <input
                    className="bg-card text-foreground text-[11px] px-1.5 py-0.5 rounded flex-1 outline-none border border-primary"
                    value={editValue}
                    autoFocus
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => commitRename('group')}
                    onKeyDown={(e) => e.key === 'Enter' && commitRename('group')}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="flex-1 truncate">{group.name}</span>
                )}
                <button
                  className="opacity-0 group-hover:opacity-100 hover:text-primary ml-auto transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewNoteGroupId(group.id);
                    if (!group.isOpen) toggleGroup(group.id);
                  }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {group.isOpen && (
                <div className="space-y-0.5 mt-0.5">
                  {groupNotes.map((note) => (
                    <div
                      key={note.id}
                      className={cn(
                        'group flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-all duration-150',
                        activeNoteId === note.id
                          ? 'bg-card text-foreground'
                          : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'
                      )}
                      onClick={() => setActiveNote(note.id)}
                      onContextMenu={(e) => handleContextMenu(e, note.id, 'note')}
                    >
                      <Hash className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        activeNoteId === note.id ? "text-primary" : "text-hash"
                      )} />
                      {editingId === note.id ? (
                        <input
                          className="bg-card text-foreground text-sm px-1.5 py-0.5 rounded flex-1 outline-none border border-primary"
                          value={editValue}
                          autoFocus
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => commitRename('note')}
                          onKeyDown={(e) => e.key === 'Enter' && commitRename('note')}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="truncate flex-1">{note.title}</span>
                      )}
                    </div>
                  ))}

                  {newNoteGroupId === group.id && (
                    <div className="flex items-center gap-2.5 px-3 py-2">
                      <Hash className="w-4 h-4 shrink-0 text-primary" />
                      <input
                        className="bg-card text-foreground text-sm px-2 py-1 rounded-md flex-1 outline-none border border-primary"
                        placeholder="nom-de-la-note"
                        value={newNoteName}
                        autoFocus
                        onChange={(e) => setNewNoteName(e.target.value)}
                        onBlur={() => submitNewNote(group.id)}
                        onKeyDown={(e) => e.key === 'Enter' && submitNewNote(group.id)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {showNewGroup && (
          <div className="px-3 py-1">
            <input
              className="bg-card text-foreground text-[11px] px-2 py-1.5 rounded-md w-full outline-none uppercase tracking-widest font-bold border border-primary"
              placeholder="NOM DU GROUPE"
              value={newGroupName}
              autoFocus
              onChange={(e) => setNewGroupName(e.target.value)}
              onBlur={submitNewGroup}
              onKeyDown={(e) => e.key === 'Enter' && submitNewGroup()}
            />
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">{notes.length} notes</span>
        <button
          onClick={() => setShowNewGroup(true)}
          className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-full hover:bg-card"
          title="Nouveau groupe"
        >
          <FolderPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-popover border border-border rounded-md shadow-2xl py-1 min-w-[150px] animate-fade-in"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-3 py-2 text-sm text-left hover:bg-card flex items-center gap-2 transition-colors"
            onClick={() => {
              const item = contextMenu.type === 'group'
                ? groups.find((g) => g.id === contextMenu.id)
                : notes.find((n) => n.id === contextMenu.id);
              if (item) startRename(contextMenu.id, 'name' in item ? item.name : item.title);
            }}
          >
            <Pencil className="w-3.5 h-3.5" /> Renommer
          </button>
          <button
            className="w-full px-3 py-2 text-sm text-left hover:bg-card flex items-center gap-2 text-destructive transition-colors"
            onClick={handleDelete}
          >
            <Trash2 className="w-3.5 h-3.5" /> Supprimer
          </button>
        </div>
      )}
    </aside>
  );
}
