"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { HeroBanner } from "@/components/products/HeroBanner";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductGrid } from "@/components/products/ProductGrid";
import { useProducts } from "@/lib/hooks/use-products";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useProducts({
    category: activeCategory === "All" ? undefined : activeCategory,
    search: search || undefined,
  });

  const products = data?.data ?? [];

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header
        search={search}
        onSearchChange={setSearch}
        onMenuToggle={() => setSidebarOpen((o) => !o)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl space-y-6 p-5 lg:p-8">
            {/* Page title */}
            <div className="flex items-baseline justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Explore</h1>
              <p className="text-sm text-gray-500">
                {isLoading
                  ? "Loading…"
                  : `${data?.meta.total ?? 0} products`}
              </p>
            </div>

            {/* Hero */}
            <HeroBanner />

            {/* Filters */}
            <ProductFilters
              activeCategory={activeCategory}
              search={search}
              onCategoryChange={setActiveCategory}
              onSearchChange={setSearch}
            />

            {/* Product grid */}
            <ProductGrid
              products={products}
              isLoading={isLoading}
              isError={isError}
              onRetry={() => refetch()}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
