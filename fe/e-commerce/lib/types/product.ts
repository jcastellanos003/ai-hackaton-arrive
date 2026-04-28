export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  inventory: number;
  rating?: number;
  tags?: string[];
  isFeatured?: boolean;
};

export type Category = {
  name: string;
  count: number;
};

export type ProductFilters = {
  category?: string;
  search?: string;
  sort?: "price_asc" | "price_desc" | "name_asc" | "rating_desc" | "created_at_desc";
  isFeatured?: boolean;
  page?: number;
  limit?: number;
};

export type ProductsResponse = {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
