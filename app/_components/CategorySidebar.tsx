import { Button } from "@/components/ui/button";

interface Note {
  id: string;
  category: string;
}

interface CategorySidebarProps {
  notes: Note[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORY_COLORS = {
  "Random Thoughts": "bg-[#EF9C66]",
  "School": "bg-[#FCDC94]",
  "Personal": "bg-[#78ABA8]",
};

export const CategorySidebar = ({ notes, selectedCategory, onSelectCategory }: CategorySidebarProps) => {
  const categories = ["Random Thoughts", "School", "Personal"];

  const getCategoryCount = (category: string) => {
    return notes.filter(note => note.category === category).length;
  };

  return (
    <aside className="w-64 bg-background px-6 py-8 flex-shrink-0 flex flex-col justify-center">
      <h2 className="text-lg font-serif font-bold text-foreground mb-6">All Categories</h2>
      <div className="space-y-2">
        {categories.map((category) => {
          const count = getCategoryCount(category);
          const colorClass = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS];

          return (
            <Button
              key={category}
              variant="ghost"
              className={`w-full justify-start text-left font-sans ${
                selectedCategory === category ? "bg-muted" : ""
              }`}
              onClick={() => onSelectCategory(category)}
            >
              <span className={`w-3 h-3 rounded-full ${colorClass} mr-3 flex-shrink-0`} />
              <span className="flex-1">{category}</span>
              {count > 0 && <span className="text-muted-foreground ml-2">{count}</span>}
            </Button>
          );
        })}
      </div>
    </aside>
  );
};
