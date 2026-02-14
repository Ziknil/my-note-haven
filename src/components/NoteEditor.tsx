import { useRef } from 'react';
import { useNotesStore } from '@/store/useNotesStore';
import { NoteBlock } from '@/types/notes';
import { Hash, Plus, FileText, Trash2, Type } from 'lucide-react';

function BlockRenderer({ noteId, block }: { noteId: string; block: NoteBlock }) {
  const { updateBlock, deleteBlock } = useNotesStore();

  if (block.type === 'text') {
    return (
      <div className="group relative">
        <textarea
          className="w-full bg-card/50 text-foreground resize-none outline-none min-h-[80px] p-4 rounded-lg border border-transparent focus:border-primary/30 transition-all text-sm leading-relaxed placeholder:text-muted-foreground"
          value={block.content}
          onChange={(e) => updateBlock(noteId, block.id, e.target.value)}
          placeholder="Écrivez ici..."
          rows={Math.max(3, block.content.split('\n').length)}
        />
        <button
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded-full hover:bg-card"
          onClick={() => deleteBlock(noteId, block.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (block.type === 'image') {
    return (
      <div className="group relative rounded-lg overflow-hidden bg-card">
        <img src={block.content} alt={block.fileName || 'image'} className="max-w-full max-h-[500px] object-contain mx-auto" />
        {block.fileName && <p className="text-xs text-muted-foreground px-4 py-2 font-medium">{block.fileName}</p>}
        <button
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-background/80 backdrop-blur rounded-full p-1.5 text-muted-foreground hover:text-destructive transition-all"
          onClick={() => deleteBlock(noteId, block.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (block.type === 'video') {
    return (
      <div className="group relative rounded-lg overflow-hidden bg-card">
        <video src={block.content} controls className="max-w-full max-h-[400px] mx-auto" />
        {block.fileName && <p className="text-xs text-muted-foreground px-4 py-2 font-medium">{block.fileName}</p>}
        <button
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-background/80 backdrop-blur rounded-full p-1.5 text-muted-foreground hover:text-destructive transition-all"
          onClick={() => deleteBlock(noteId, block.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="group relative flex items-center gap-3 p-4 rounded-lg bg-card hover:bg-card/80 transition-colors">
      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{block.fileName || 'fichier'}</p>
        <p className="text-xs text-muted-foreground">{block.mimeType || 'unknown'}</p>
      </div>
      <a href={block.content} download={block.fileName} className="text-primary text-xs font-semibold hover:underline shrink-0">
        Télécharger
      </a>
      <button
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded-full"
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
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mx-auto">
            <Hash className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-muted-foreground">Sélectionnez une note</p>
          <p className="text-sm text-muted-foreground/70">ou créez-en une nouvelle depuis le menu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      {/* Header */}
      <div className="px-8 py-4 flex items-center gap-2.5 border-b border-border/50">
        <Hash className="w-5 h-5 text-primary" />
        <h1 className="text-lg font-bold">{note.title}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {note.blocks.map((block) => (
          <div key={block.id} className="animate-fade-in">
            <BlockRenderer noteId={note.id} block={block} />
          </div>
        ))}
        {note.blocks.length === 0 && (
          <p className="text-muted-foreground text-sm">Cette note est vide. Ajoutez du contenu ci-dessous.</p>
        )}
      </div>

      {/* Toolbar */}
      <div className="px-8 py-3 border-t border-border/50 flex items-center gap-2">
        <button
          onClick={() => addBlock(note.id, { type: 'text', content: '' })}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full text-muted-foreground hover:text-foreground hover:bg-card transition-all"
        >
          <Type className="w-4 h-4" /> Texte
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full text-muted-foreground hover:text-foreground hover:bg-card transition-all"
        >
          <Plus className="w-4 h-4" /> Fichier
        </button>
        <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFileUpload} accept="image/*,video/*,.pdf,.doc,.docx,.txt,.md" />
      </div>
    </div>
  );
}
