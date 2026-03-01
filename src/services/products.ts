import api from '@/lib/api.ts';
import type { Product, ProductCategory } from '@/types/index.ts';

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
}

// Map backend product to frontend Product type
function mapProduct(p: Record<string, unknown>): Product {
  return {
    ...p,
    id: (p._id || p.id) as string,
    // Backend isNewArrival → Frontend isNew
    isNew: (p.isNewArrival ?? p.isNew ?? false) as boolean,
    // Backend categorySlug → Frontend category (ProductCategory string)
    category: (p.categorySlug || (typeof p.category === 'string' ? p.category : '')) as ProductCategory,
  } as Product;
}

export async function getProducts(
  params?: Record<string, string | number | boolean>,
): Promise<ProductListResponse> {
  const result: Record<string, unknown> = await api.get('/products', { params });
  const data = (result.data || result) as Record<string, unknown>[];
  return {
    data: (Array.isArray(data) ? data : []).map(mapProduct),
    total: (result.total as number) || 0,
    page: (result.page as number) || 1,
    totalPages: (result.totalPages as number) || 1,
    hasMore: (result.hasMore as boolean) || false,
  };
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const data: Record<string, unknown>[] = await api.get('/products/featured');
  return (Array.isArray(data) ? data : []).map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const data: Record<string, unknown> = await api.get(`/products/${slug}`);
    return data ? mapProduct(data) : null;
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<CategoryItem[]> {
  const data: Record<string, unknown>[] = await api.get('/categories');
  return (Array.isArray(data) ? data : []).map((c) => ({
    ...c,
    id: (c._id || c.id || c.slug) as string,
  })) as CategoryItem[];
}
