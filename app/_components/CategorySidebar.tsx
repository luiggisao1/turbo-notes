import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface Note {
  id: string;
  category: string;
}

interface CategorySidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts: { [key: string]: number };
  onLogout: () => void;
}

const CATEGORY_COLORS = {
  "random": "bg-[#EF9C66]",
  "school": "bg-[#FCDC94]",
  "personal": "bg-[#78ABA8]",
};

export const CategorySidebar = ({ selectedCategory, onSelectCategory, categoryCounts, onLogout }: CategorySidebarProps) => {
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
    <aside className="bg-background px-6 py-8 flex-shrink-0 flex flex-col mt-[90px] justify-between">
      <div>
        <h2 onClick={() => onSelectCategory('all')} className="text-lg inter-bold mb-6 cursor-pointer">All Categories</h2>
        <div className="space-y-2 w-64">
          {categories.map((category) => {
            const colorClass = CATEGORY_COLORS[category.key as keyof typeof CATEGORY_COLORS] || "bg-card";

            return (
              <span
                key={category.key}
                className={`text-lg w-full justify-start text-left inter-regular pr-4 py-2 rounded-lg cursor-pointer flex items-center hover:bg-foreground/10
                  ${selectedCategory === category.key ? "inter-bold" : "inter-regular"}
                `}
                onClick={() => onSelectCategory(category.key)}
              >
                <div className={`w-3 h-3 rounded-full ${colorClass} mr-3 flex-shrink-0`} />
                <span className="flex-1">{category.label}</span>
                {categoryCounts[category.key] > 0 && <span className="text-muted-foreground ml-2">{categoryCounts[category.key]}</span>}
              </span>
            );
          })}
        </div>
      </div>
      <Button
        onClick={onLogout}
      >
        <LogOut className="mr-2" size={20} />
        Logout
      </Button>
    </aside>
  );
};
