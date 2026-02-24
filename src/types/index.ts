export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: ProductCategory;
  occasion: ProductOccasion[];
  badge?: ProductBadge;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount?: number;
  features: string[];
  safetyRating: 'family' | 'standard' | 'professional';
  noiseLevel: 'low' | 'medium' | 'high';
  effects: string[];
  duration?: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

export type ProductCategory =
  | 'aerial'
  | 'ground'
  | 'rockets'
  | 'sparklers'
  | 'fountains'
  | 'roman-candles'
  | 'novelty'
  | 'combo-packs';

export type ProductOccasion =
  | 'diwali'
  | 'new-year'
  | 'wedding'
  | 'birthday'
  | 'festival'
  | 'professional';

export type ProductBadge =
  | 'new'
  | 'bestseller'
  | 'limited'
  | 'premium'
  | 'low-noise';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CategoryFilter {
  id: ProductCategory;
  label: string;
  icon: string;
  count: number;
}

export interface OccasionFilter {
  id: ProductOccasion;
  label: string;
  image: string;
}

export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  gradient: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: string;
}
