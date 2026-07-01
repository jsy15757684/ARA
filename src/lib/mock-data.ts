export type CategoryType = '패션의류' | '가전·디지털' | '식품·건강' | '뷰티·향수' | '홈·리빙' | '스포츠·레저';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: CategoryType;
  subcategory?: string;
  price: number;
  originalPrice: number;
  discountRate: number;
  image: string;
  images: string[];
  description: string;
  specs: Record<string, string>;
  options: { name: string; values: string[] }[];
  tags: string[];
  rating: number;
  reviewCount: number;
}

export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
  selectedOptions: Record<string, string>;
}

export const categories: { name: CategoryType; label: string }[] = [
  { name: '패션의류', label: '패션의류' },
  { name: '가전·디지털', label: '가전·디지털' },
  { name: '식품·건강', label: '식품·건강' },
  { name: '뷰티·향수', label: '뷰티·향수' },
  { name: '홈·리빙', label: '홈·리빙' },
  { name: '스포츠·레저', label: '스포츠·레저' },
];

export const categoryTree = [
  {
    name: '패션의류',
    subcategories: ['여성의류', '남성의류', '신발', '가방/잡화']
  },
  {
    name: '가전·디지털',
    subcategories: ['TV/영상가전', '생활가전', '컴퓨터/디지털', '주방가전']
  },
  {
    name: '식품·건강',
    subcategories: ['건강식품', '신선식품', '가공식품', '음료/생수']
  },
  {
    name: '뷰티·향수',
    subcategories: ['스킨케어', '메이크업', '향수', '바디/헤어']
  },
  {
    name: '홈·리빙',
    subcategories: ['가구', '침구', '주방용품', '인테리어']
  },
  {
    name: '스포츠·레저',
    subcategories: ['캠핑/아웃도어', '피트니스', '골프', '자전거']
  }
];

import productsData from '../data/products.json';
export const products: Product[] = productsData as Product[];

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category);
}

export function getProductsByTag(tag: string): Product[] {
  return products.filter(p => p.tags.includes(tag));
}

export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원';
}
