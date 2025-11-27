import { format, isToday, isYesterday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { mapCategoryToText } from "@/lib/category";

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
  random: "bg-[#EF9C6680] border-[#EF9C66]",
  school: "bg-[#FCDC9480] border-[#FCDC94]",
  personal: "bg-[#78ABA880] border-[#78ABA8]",
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
      className={`text-black border-3 rounded-xl p-4 cursor-pointer hover:shadow-lg min-h-75 transition-all relative group
      ${colorClass}`}
      onClick={() => onEdit(note)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-black">
          <span className="inter-bold">{formatDate(note.created_at)}</span>
          <span className="inter-regular">{mapCategoryToText(note.category)}</span>
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

      <h3 className="text-4xl inria-serif-bold mb-3">{note.title}</h3>

      {note.content && <p className="text-md inter-regular line-clamp-12 whitespace-pre-wrap">{note.content}</p>}
    </div>
  );
};
