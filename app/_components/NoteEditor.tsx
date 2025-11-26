import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { format } from "date-fns";

interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string | null;
  category: string;
}

interface NoteEditorProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, content: string, category: string) => void;
}

const CATEGORY_COLORS = {
  "random": "bg-[#EF9C6680] border-[#EF9C66]",
  "school": "bg-[#FCDC9480] border-[#FCDC94]",
  "personal": "bg-[#78ABA880] border-[#78ABA8]",
};

export const NoteEditor = ({ note, isOpen, onClose, onSave }: NoteEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("random");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || "");
      setCategory(note.category || "random");
    } else {
      setTitle("");
      setContent("");
      setCategory("random");
    }
  }, [note, isOpen]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title, content, category);
    onClose();
  };

  const colorClass = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || "bg-card";
  const lastEdited = note?.updated_at || note?.created_at;

  if (!isOpen) return null;

  return (
    <div className="bg-primary fixed inset-0 z-50 flex flex-col">
      <div className="flex items-center justify-between pr-6 pt-6 px-6">
        <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-80 bg-background border-2 border-foreground/20 h-14 text-lg hover:border-foreground/30">
              <div className="flex items-center gap-3">
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-[#F5EFE7] border-2 border-foreground/20">
              <SelectItem value="random" className="text-lg py-3 hover:bg-[#95713933]">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-[#E8B298]" />
                  Random Thoughts
                </div>
              </SelectItem>
              <SelectItem value="personal" className="text-lg py-3 hover:bg-[#95713933]">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-[#A8CFC8]" />
                  Personal
                </div>
              </SelectItem>
              <SelectItem value="school" className="text-lg py-3 hover:bg-[#95713933]">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-[#F4E4B7]" />
                  School
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        <Button onClick={onClose} variant="ghost" className="text-foreground hover:bg-background/50">
          <X className="w-[24px]! h-[24px]!" />
        </Button>
      </div>
      <div className={`m-6 mt-3 p-[64px] rounded-xl ${colorClass} border-3 flex flex-col h-full`}>
        <div className={`flex items-center justify-end pb-4`}>
          <div className="flex items-center gap-4">
            {lastEdited && (
              <span className="text-sm text-muted-foreground font-sans">
                Last Edited: {format(new Date(lastEdited), "MMMM d, yyyy 'at' h:mmaaa")}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 px-6 pb-6 overflow-y-auto">
          <Input
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold border-0 bg-transparent px-0 mb-4 placeholder:text-foreground/40"
          />

          <Textarea
            placeholder="Pour your heart out..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] border-0 bg-transparent px-0 text-lg resize-none placeholder:text-foreground/40"
          />
        </div>
        <div className="w-fit">
          <Button
            onClick={handleSave}
            className="rounded-full px-8 w-full py-4 font-sans font-medium text-lg"
          >
            Save Note
          </Button>
        </div>
      </div>
    </div>
  );
};
