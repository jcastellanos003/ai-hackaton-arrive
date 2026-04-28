"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu, X, Package } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onMenuToggle: () => void;
  sidebarOpen: boolean;
}

export function Header({
  search,
  onSearchChange,
  onMenuToggle,
  sidebarOpen,
}: HeaderProps) {
  const { data: cart } = useCart();
  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border/50 bg-white/90 px-4 backdrop-blur-sm lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 lg:hidden"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Logo */}
      <Link href="/" className="flex shrink-0 items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-green)]">
          <Package size={16} className="text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-gray-900">
          BuyMore
        </span>
      </Link>

      {/* Search */}
      <div className="relative mx-auto hidden max-w-sm flex-1 lg:flex">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products…"
          className="h-9 rounded-xl border-gray-200 bg-gray-50 pl-9 text-sm focus:bg-white"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Cart */}
        <Link
          href="/cart"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100"
          aria-label={`Cart (${itemCount} items)`}
        >
          <ShoppingCart size={20} />
          {itemCount > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-green)] p-0 text-xs font-bold text-white">
              {itemCount > 99 ? "99+" : itemCount}
            </Badge>
          )}
        </Link>
      </div>
    </header>
  );
}
