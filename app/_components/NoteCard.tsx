import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string | null;
  category: string;
}

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_COLORS = {
  "Random Thoughts": "bg-[#E8B298] border-[#D9A384]",
  "School": "bg-[#F4E4B7] border-[#E6D5A3]",
  "Personal": "bg-[#A8CFC8] border-[#94BBB4]",
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return "today";
  }
  
  if (isYesterday(date)) {
    return "yesterday";
  }
  
  return format(date, "MMMM d");
};

export const NoteCard = ({ note, onEdit, onDelete }: NoteCardProps) => {
  const colorClass = CATEGORY_COLORS[note.category as keyof typeof CATEGORY_COLORS] || "bg-card border-border";
  
  return (
    <div
      className={`${colorClass} border-2 rounded-3xl p-6 cursor-pointer hover:shadow-lg transition-all relative group`}
      onClick={() => onEdit(note)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-sans">
          <span className="font-medium">{formatDate(note.created_at)}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{note.category}</span>
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={16} />
        </Button>
      </div>
      
      <h3 className="text-2xl font-serif font-bold text-foreground mb-3">
        {note.title}
      </h3>
      
      {note.content && (
        <p className="text-foreground/80 font-sans line-clamp-4 whitespace-pre-wrap">
          {note.content}
        </p>
      )}
    </div>
  );
};
