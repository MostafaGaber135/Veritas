import { useEffect, useState } from "react";

type TabsProps = {
  onCategoryChange?: (category: string) => void;
  initialCategory?: string;
};

const CATEGORIES = [
  "General",
  "Business",
  "Entertainment",
  "Health",
  "Science",
  "Sports",
  "Technology",
];

export default function Tabs({ onCategoryChange, initialCategory = "General" }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    const index = CATEGORIES.findIndex(
      (name) => name.toLowerCase() === initialCategory.toLowerCase()
    );
    setActiveIndex(index === -1 ? 0 : index);
  }, [initialCategory]);

  useEffect(() => {
    const selectedCategory = CATEGORIES[activeIndex];
    if (onCategoryChange) {
      onCategoryChange(selectedCategory.toLowerCase());
    }
  }, [activeIndex, onCategoryChange]);

  const handleTabClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar [-webkit-overflow-scrolling:touch]">
      <div className="flex items-center gap-3 p-2 flex-nowrap min-w-max snap-x snap-mandatory scroll-smooth touch-pan-x overscroll-x-contain">
        {CATEGORIES.map((label, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={label}
              onClick={() => handleTabClick(index)}
              className={`whitespace-nowrap snap-center px-5 py-2 rounded-full border-2 text-sm md:text-base cursor-pointer ${
                isActive
                  ? "bg-[#0c363c] border-[#0c363c] text-white"
                  : "bg-transparent border-[#0c363c] text-[#01a09d] hover:bg-[#0c363c]/10"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
