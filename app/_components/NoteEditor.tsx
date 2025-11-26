import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  "Random Thoughts": "bg-[#E8B298]",
  "School": "bg-[#F4E4B7]",
  "Personal": "bg-[#A8CFC8]",
};

export const NoteEditor = ({ note, isOpen, onClose, onSave }: NoteEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Random Thoughts");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || "");
      setCategory(note.category || "Random Thoughts");
    } else {
      setTitle("");
      setContent("");
      setCategory("Random Thoughts");
    }
  }, [note, isOpen]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title, content, category);
    onClose();
  };

  const colorClass = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || "bg-card";
  const lastEdited = note?.updated_at || note?.created_at;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${colorClass} max-w-4xl h-[90vh] p-0 border-2 border-border gap-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 pb-4">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-48 bg-background/50 border-border rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Random Thoughts">Random Thoughts</SelectItem>
                <SelectItem value="School">School</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-4">
              {lastEdited && (
                <span className="text-sm text-muted-foreground font-sans">
                  Last Edited: {format(new Date(lastEdited), "MMMM d, yyyy 'at' h:mmaaa")}
                </span>
              )}
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-background/50"
              >
                <X size={24} />
              </Button>
            </div>
          </div>

          <div className="flex-1 px-6 pb-6 overflow-y-auto">
            <Input
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-4xl font-serif font-bold border-0 bg-transparent px-0 mb-4 focus-visible:ring-0 placeholder:text-foreground/40"
            />
            
            <Textarea
              placeholder="Pour your heart out..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] border-0 bg-transparent px-0 text-lg font-sans resize-none focus-visible:ring-0 placeholder:text-foreground/40"
            />
          </div>

          <div className="p-6 pt-0">
            <Button
              onClick={handleSave}
              className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8"
            >
              Save Note
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
