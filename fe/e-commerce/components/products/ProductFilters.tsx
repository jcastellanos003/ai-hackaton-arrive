"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/lib/hooks/use-products";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  activeCategory: string;
  search: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (value: string) => void;
}

export function ProductFilters({
  activeCategory,
  search,
  onCategoryChange,
  onSearchChange,
}: ProductFiltersProps) {
  const { data: categoriesData, isLoading } = useCategories();
  const categories = categoriesData?.data ?? [];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Category pills */}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <FilterPill
          label="All"
          active={activeCategory === "All"}
          onClick={() => onCategoryChange("All")}
        />
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))
          : categories.map((cat) => (
              <FilterPill
                key={cat.name}
                label={cat.name}
                active={activeCategory === cat.name}
                onClick={() => onCategoryChange(cat.name)}
              />
            ))}
      </div>

      {/* Mobile search */}
      <div className="relative w-full sm:w-48 lg:hidden">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search…"
          className="h-8 rounded-full border-gray-200 bg-white pl-8 text-xs"
        />
      </div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150",
        active
          ? "text-gray-900 font-semibold"
          : "text-gray-500 hover:text-gray-800"
      )}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-1/2 h-0.5 w-4/5 -translate-x-1/2 rounded-full bg-gray-900" />
      )}
    </button>
  );
}
