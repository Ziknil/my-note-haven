import { NotesSidebar } from '@/components/NotesSidebar';
import { NoteEditor } from '@/components/NoteEditor';

const Index = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <NotesSidebar />
      <NoteEditor />
    </div>
  );
};

export default Index;
