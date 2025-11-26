import { Button } from "@/components/ui/button";

interface Note {
  id: string;
  category: string;
}

interface CategorySidebarProps {
  notes: Note[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts: { [key: string]: number };
}

const CATEGORY_COLORS = {
  "random": "bg-[#EF9C66]",
  "school": "bg-[#FCDC94]",
  "personal": "bg-[#78ABA8]",
};

export const CategorySidebar = ({ notes, selectedCategory, onSelectCategory, categoryCounts }: CategorySidebarProps) => {
  const categories = [
    {
      key: "random",
      label: "Random Thoughts"
    },
    {
      key: "school",
      label: "School"
    },
    {
      key: "personal",
      label: "Personal"
    }
  ];

  return (
    <aside className="w-64 bg-background px-6 py-8 flex-shrink-0 flex flex-col justify-center">
      <h2 className="text-lg font-serif font-bold text-foreground mb-6">All Categories</h2>
      <div className="space-y-2">
        {categories.map((category) => {
          const colorClass = CATEGORY_COLORS[category.key as keyof typeof CATEGORY_COLORS] || "bg-card";

          return (
            <Button
              key={category.key}
              variant="ghost"
              className={`w-full justify-start text-left font-sans`}
              onClick={() => onSelectCategory(category.key)}
            >
              <div className={`w-3 h-3 rounded-full ${colorClass} mr-3 flex-shrink-0`} />
              <span className="flex-1">{category.label}</span>
              {categoryCounts[category.key] > 0 && <span className="text-muted-foreground ml-2">{categoryCounts[category.key]}</span>}
            </Button>
          );
        })}
      </div>
    </aside>
  );
};
