export interface NoteBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'file';
  content: string; // text content or URL/data
  fileName?: string;
  mimeType?: string;
}

export interface Note {
  id: string;
  title: string;
  groupId: string;
  blocks: NoteBlock[];
  createdAt: number;
  updatedAt: number;
}

export interface NoteGroup {
  id: string;
  name: string;
  isOpen: boolean;
  createdAt: number;
}
