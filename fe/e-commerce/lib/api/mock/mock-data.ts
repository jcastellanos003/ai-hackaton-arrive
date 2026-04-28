import type { Product } from "@/lib/types/product";

export const MOCK_PRODUCTS: Product[] = [
  // ── Footwear ──────────────────────────────────────────────────────────────
  {
    id: "p-001",
    name: "WMX Rubber Zebra Sandal",
    description:
      "Lightweight open-toe sandal with a bold zebra-print rubber sole. Perfect for summer streets and beachside strolls.",
    price: 36,
    category: "Footwear",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&auto=format&fit=crop",
    ],
    inventory: 3,
    rating: 4.3,
    tags: ["new", "sale"],
    isFeatured: true,
  },
  {
    id: "p-002",
    name: "Super Skinny Jogger in Brown",
    description:
      "Streamlined jogger silhouette in warm cocoa brown. Tailored fit with a brushed interior for all-day comfort.",
    price: 89,
    category: "Footwear",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop",
    ],
    inventory: 18,
    rating: 4.7,
    tags: ["bestseller"],
    isFeatured: true,
  },
  {
    id: "p-003",
    name: "Urban Canvas High-Top",
    description:
      "Classic high-top silhouette in durable canvas. Vulcanised rubber sole, padded ankle collar, and a clean white finish.",
    price: 65,
    category: "Footwear",
    images: [
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop",
    ],
    inventory: 0,
    rating: 4.1,
    tags: [],
    isFeatured: false,
  },
  {
    id: "p-004",
    name: "Terra Trail Runner",
    description:
      "Aggressive lug sole with a waterproof upper. Built for muddy trails and wet conditions without sacrificing street style.",
    price: 128,
    category: "Footwear",
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop",
    ],
    inventory: 12,
    rating: 4.9,
    tags: ["new"],
    isFeatured: false,
  },
  // ── Clothing ──────────────────────────────────────────────────────────────
  {
    id: "p-005",
    name: "Oversized Linen Shirt",
    description:
      "Relaxed linen-blend shirt with a drop shoulder and boxy cut. Arrives in a natural off-white — pairs with everything.",
    price: 54,
    category: "Clothing",
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop",
    ],
    inventory: 25,
    rating: 4.5,
    tags: ["new"],
    isFeatured: true,
  },
  {
    id: "p-006",
    name: "Slim Cargo Trousers",
    description:
      "Technical slim-fit cargos with zip pockets and a tapered ankle. Available in khaki and forest green.",
    price: 79,
    category: "Clothing",
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop",
    ],
    inventory: 4,
    rating: 4.2,
    tags: ["sale"],
    isFeatured: false,
  },
  {
    id: "p-007",
    name: "Cropped Blazer",
    description:
      "Structured blazer with cropped length and notch lapels. Unlined for breathability — sharp enough for the office.",
    price: 145,
    category: "Clothing",
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop",
    ],
    inventory: 8,
    rating: 4.6,
    tags: ["new"],
    isFeatured: true,
  },
  {
    id: "p-008",
    name: "Knit Polo Shirt",
    description:
      "Fine-rib knit polo in breathable cotton. Ribbed collar and cuffs with a two-button placket. Comes in 6 colours.",
    price: 42,
    category: "Clothing",
    images: [
      "https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=800&auto=format&fit=crop",
    ],
    inventory: 30,
    rating: 4.0,
    tags: [],
    isFeatured: false,
  },
  // ── Accessories ───────────────────────────────────────────────────────────
  {
    id: "p-009",
    name: "Woven Leather Bracelet",
    description:
      "Hand-braided genuine leather bracelet with a sterling silver clasp. Available in cognac and midnight black.",
    price: 28,
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1573408301185-9519f94f4264?w=800&auto=format&fit=crop",
    ],
    inventory: 2,
    rating: 4.8,
    tags: ["sale"],
    isFeatured: false,
  },
  {
    id: "p-010",
    name: "Polarised Aviator Sunglasses",
    description:
      "Gold-frame aviators with polarised lenses that cut glare without dulling colours. UV400 certified.",
    price: 72,
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&auto=format&fit=crop",
    ],
    inventory: 15,
    rating: 4.4,
    tags: ["bestseller"],
    isFeatured: true,
  },
  // ── Bags ──────────────────────────────────────────────────────────────────
  {
    id: "p-011",
    name: "Mini Crossbody Bag",
    description:
      "Compact crossbody in pebbled vegan leather. Adjustable strap, internal card pockets, and a magnetic closure.",
    price: 95,
    category: "Bags",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop",
    ],
    inventory: 0,
    rating: 4.7,
    tags: [],
    isFeatured: false,
  },
  {
    id: "p-012",
    name: "Canvas Tote Bag",
    description:
      "Heavy-duty canvas tote with interior zip pocket and reinforced handles. Holds a 15-inch laptop with room to spare.",
    price: 48,
    category: "Bags",
    images: [
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop",
    ],
    inventory: 22,
    rating: 4.3,
    tags: ["new"],
    isFeatured: false,
  },
  {
    id: "p-013",
    name: "Nylon Duffle Bag",
    description:
      "Weekend-ready duffle in ripstop nylon. U-shaped opening, shoe compartment, and detachable shoulder strap.",
    price: 115,
    category: "Bags",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop",
    ],
    inventory: 7,
    rating: 4.6,
    tags: ["bestseller"],
    isFeatured: true,
  },
];
