// 결제 관련 타입 정의

export interface PaymentRequest {
  orderId: string; // 주문번호
  amount: number; // 결제금액
  goodsName: string; // 상품명
  buyerName?: string; // 구매자명
  buyerEmail?: string; // 구매자 이메일
  buyerTel?: string; // 구매자 전화번호
}

export interface PaymentResponse {
  resultCode: string; // 결과코드
  resultMsg: string; // 결과메시지
  tid?: string; // 거래번호
  orderId: string; // 주문번호
  amount: number; // 결제금액
  payMethod?: string; // 결제수단
  goodsName?: string; // 상품명
  buyerName?: string; // 구매자명
  buyerEmail?: string; // 구매자 이메일
  buyerTel?: string; // 구매자 전화번호
  paidAt?: string; // 결제일시
}

export interface PaymentInfo {
  id: string;
  userId: string;
  orderId: string;
  amount: number;
  goodsName: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payMethod?: string;
  tid?: string;
  createdAt: string;
  completedAt?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerTel?: string;
}

export type PaymentMethod = 'CARD' | 'BANK' | 'VBANK' | 'CELLPHONE' | 'SSG_BANK';

// 상품 타입
export type ProductId = 'starter' | 'basic' | 'premium';
export type SubscriptionPeriod = 'monthly' | 'yearly';

export interface Product {
  id: ProductId;
  name: string;
  price: number;
  period: SubscriptionPeriod;
  quota: number; // 사용 가능 횟수
  description?: string;
  originalPrice?: number; // 원래 가격 (1000원 × 횟수)
  paidQuota?: number; // 유료 횟수 (예: 5)
  freeQuota?: number; // 무료 횟수 (예: 3)
}

// 구독 정보
export interface Subscription {
  id: string;
  userId: string;
  productId: ProductId;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  quota: number; // 총 사용 가능 횟수
  usedQuota: number; // 사용한 횟수
  reissueQuota: number; // 수정해서 재발급 가능 횟수 (기본 1회)
  usedReissueQuota: number; // 사용한 재발급 횟수
  createdAt: string;
  updatedAt?: string;
}

