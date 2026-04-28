"use client";

import {
  ShoppingBag,
  Shirt,
  Gift,
  Lightbulb,
  Star,
  Plus,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useCategories } from "@/lib/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Footwear: ShoppingBag,
  Clothing: Shirt,
  Accessories: Star,
  Bags: Gift,
};

const DEFAULT_NAV = [
  { label: "Popular Products", icon: Star, category: "All" },
];

export function Sidebar({
  activeCategory,
  onCategoryChange,
  isOpen,
  onClose,
}: SidebarProps) {
  const { data: categoriesData, isLoading } = useCategories();
  const categories = categoriesData?.data ?? [];

  function handleSelect(category: string) {
    onCategoryChange(category);
    onClose();
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-border/50 bg-white transition-transform duration-300 lg:sticky lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          {/* Explore Now CTA */}
          <button
            onClick={() => handleSelect("All")}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-green)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[var(--brand-green-dark)] hover:shadow-md"
          >
            Explore Now
          </button>

          <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Categories
          </p>

          {/* All */}
          <NavItem
            label="All Products"
            icon={ShoppingBag}
            active={activeCategory === "All"}
            onClick={() => handleSelect("All")}
          />

          {/* Dynamic categories */}
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="mx-2 h-9 rounded-xl" />
              ))
            : categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.name] ?? ShoppingBag;
                return (
                  <NavItem
                    key={cat.name}
                    label={cat.name}
                    icon={Icon}
                    count={cat.count}
                    active={activeCategory === cat.name}
                    onClick={() => handleSelect(cat.name)}
                  />
                );
              })}

          <div className="my-3 border-t border-gray-100" />

          <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Quick Actions
          </p>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50">
            <Plus size={16} className="text-gray-400" />
            Request for product
          </button>

          <div className="mt-auto pt-4">
            <div className="border-t border-gray-100 pt-4">
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500">
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItem({
  label,
  icon: Icon,
  count,
  active,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
        active
          ? "bg-[var(--brand-green)]/10 text-[var(--brand-green-dark)]"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <Icon
        size={16}
        className={active ? "text-[var(--brand-green-dark)]" : "text-gray-400"}
      />
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-xs font-medium",
            active
              ? "bg-[var(--brand-green)]/20 text-[var(--brand-green-dark)]"
              : "bg-gray-100 text-gray-500"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
