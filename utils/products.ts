// 상품 정의

import { Product } from '../types/payment';

export const PRODUCTS: Product[] = [
  {
    id: 'starter',
    name: '스타터',
    price: 5000,
    period: 'monthly',
    quota: 8,
    description: '월 8회 사용 가능',
    originalPrice: 8000, // 1000원 × 8
    paidQuota: 5,
    freeQuota: 3,
  },
  {
    id: 'basic',
    name: '베이직',
    price: 15000,
    period: 'monthly',
    quota: 25,
    description: '월 25회 사용 가능',
    originalPrice: 25000, // 1000원 × 25
    paidQuota: 20,
    freeQuota: 5,
  },
  {
    id: 'premium',
    name: '프리미엄',
    price: 150000,
    period: 'yearly',
    quota: 300,
    description: '연간 300회 사용 가능',
    originalPrice: 300000, // 1000원 × 300
    paidQuota: 250,
    freeQuota: 50,
  },
];

// 상품 ID로 상품 조회
export const getProductById = (productId: string): Product | undefined => {
  return PRODUCTS.find((p) => p.id === productId);
};

// 상품 가격 포맷팅
export const formatProductPrice = (price: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price);
};

