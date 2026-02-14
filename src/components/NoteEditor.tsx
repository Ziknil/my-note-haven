import { useRef } from 'react';
import { useNotesStore } from '@/store/useNotesStore';
import { NoteBlock } from '@/types/notes';
import { Hash, Plus, Image, Film, FileText, Trash2, Type } from 'lucide-react';

function BlockRenderer({ noteId, block }: { noteId: string; block: NoteBlock }) {
  const { updateBlock, deleteBlock } = useNotesStore();

  if (block.type === 'text') {
    return (
      <div className="group relative">
        <textarea
          className="w-full bg-transparent text-foreground resize-none outline-none min-h-[80px] p-3 rounded-md border border-transparent focus:border-border transition-colors font-sans text-sm leading-relaxed"
          value={block.content}
          onChange={(e) => updateBlock(noteId, block.id, e.target.value)}
          placeholder="Écrivez ici..."
          rows={Math.max(3, block.content.split('\n').length)}
        />
        <button
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
          onClick={() => deleteBlock(noteId, block.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (block.type === 'image') {
    return (
      <div className="group relative rounded-md overflow-hidden border border-border">
        <img src={block.content} alt={block.fileName || 'image'} className="max-w-full max-h-[500px] object-contain mx-auto" />
        {block.fileName && <p className="text-xs text-muted-foreground px-3 py-1.5">{block.fileName}</p>}
        <button
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-background/80 rounded p-1 text-muted-foreground hover:text-destructive transition-all"
          onClick={() => deleteBlock(noteId, block.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (block.type === 'video') {
    return (
      <div className="group relative rounded-md overflow-hidden border border-border">
        <video src={block.content} controls className="max-w-full max-h-[400px] mx-auto" />
        {block.fileName && <p className="text-xs text-muted-foreground px-3 py-1.5">{block.fileName}</p>}
        <button
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-background/80 rounded p-1 text-muted-foreground hover:text-destructive transition-all"
          onClick={() => deleteBlock(noteId, block.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // file
  return (
    <div className="group relative flex items-center gap-3 p-3 rounded-md border border-border bg-secondary">
      <FileText className="w-8 h-8 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{block.fileName || 'fichier'}</p>
        <p className="text-xs text-muted-foreground">{block.mimeType || 'unknown'}</p>
      </div>
      <a href={block.content} download={block.fileName} className="text-primary text-xs hover:underline shrink-0">
        Télécharger
      </a>
      <button
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
        onClick={() => deleteBlock(noteId, block.id)}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function NoteEditor() {
  const { notes, activeNoteId, addBlock } = useNotesStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const note = notes.find((n) => n.id === activeNoteId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!note || !e.target.files) return;
    Array.from(e.target.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        let type: NoteBlock['type'] = 'file';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';
        addBlock(note.id, { type, content: dataUrl, fileName: file.name, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground space-y-2">
          <Hash className="w-12 h-12 mx-auto opacity-30" />
          <p className="text-lg">Sélectionnez une note</p>
          <p className="text-sm">ou créez-en une nouvelle depuis le menu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-6 py-3 border-b border-border flex items-center gap-2">
        <Hash className="w-5 h-5 text-hash" />
        <h1 className="text-base font-semibold">{note.title}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {note.blocks.map((block) => (
          <div key={block.id} className="animate-fade-in">
            <BlockRenderer noteId={note.id} block={block} />
          </div>
        ))}

        {note.blocks.length === 0 && (
          <p className="text-muted-foreground text-sm italic">Cette note est vide. Ajoutez du contenu ci-dessous.</p>
        )}
      </div>

      {/* Toolbar */}
      <div className="px-6 py-3 border-t border-border flex items-center gap-1">
        <button
          onClick={() => addBlock(note.id, { type: 'text', content: '' })}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Type className="w-4 h-4" /> Texte
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Plus className="w-4 h-4" /> Fichier
        </button>
        <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFileUpload} accept="image/*,video/*,.pdf,.doc,.docx,.txt,.md" />
      </div>
    </div>
  );
}
