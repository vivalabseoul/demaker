// 상품 정의

import { Product } from '../types/payment';

export const PRODUCTS: Product[] = [
  {
    id: 'starter',
    name: '스타터',
    price: 5000,
    period: 'monthly',
    quota: 5,
    description: '월 5회 사용 가능',
    originalPrice: 5000, // 1000원 × 5
    // 할인 없음
  },
  {
    id: 'basic',
    name: '베이직',
    price: 18000,
    period: 'monthly',
    quota: 20,
    description: '월 20회 사용 가능',
    originalPrice: 20000, // 1000원 × 20
    discountRate: 10, // 할인율 10%
  },
  {
    id: 'premium',
    name: '프리미엄',
    price: 255000,
    period: 'yearly',
    quota: 300,
    description: '연간 300회 사용 가능',
    originalPrice: 300000, // 1000원 × 300
    discountRate: 15, // 할인율 15%
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

