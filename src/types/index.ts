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

// =====================
// AUTH & USER TYPES
// =====================

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: string;
  paymentId?: string;
  trackingId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface NotificationPreferences {
  emailPromotions: boolean;
  emailOrderUpdates: boolean;
  smsOrderUpdates: boolean;
  smsPromotions: boolean;
  pushNotifications: boolean;
}

// =====================
// RAZORPAY TYPES
// =====================

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    confirm_close?: boolean;
  };
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (event: string, callback: () => void) => void;
}
