export interface LaborRate {
  id: string;
  category: string;
  role: string;
  hourlyRate: number;
  dailyRate: number;
  type: 'company' | 'freelancer';
}

export interface QuoteItem {
  id: string;
  laborRateId: string;
  work?: string;
  category: string;
  role: string;
  hourlyRate: number;
  dailyRate: number;
  calculationType: 'hourly' | 'daily';
  hours?: number;
  days?: number;
  amount: number;
  type: 'company' | 'freelancer';
}

export interface CompanyInfo {
  name: string;
  representative: string;
  address: string;
  phone: string;
  email: string;
  registrationNumber: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  createdDate: string;
  projectName?: string;
  ourCompany: CompanyInfo;
  clientCompany: CompanyInfo;
  items: QuoteItem[];
  subtotal: number;
  expenseRate: number;
  expenseAmount: number;
  discounts?: Discount[];
  totalDiscount?: number;
  totalAmount: number;
  supplyAmount?: number;
  vatAmount?: number;
  includeVat?: boolean;
  type: 'company' | 'freelancer';
  notes?: string;
  finalQuoteAmount?: number; // 최종견적금액 (사장이 정하는 최종 가격)
  finalQuoteCurrencyType?: 'KRW' | 'USD' | 'CAD' | null; // 최종견적금액 통화 타입
  issued?: boolean; // 발급 여부
  issuedDate?: string; // 발급일시
  currencyType?: 'USD' | 'CAD' | null; // 환율 타입
  exchangeRate?: number; // 환율
  totalAmountDollar?: number; // 달러 환산 금액
}

export interface Discount {
  id: string;
  name: string;
  type?: 'amount' | 'rate';
  rate?: number;
  amount?: number;
  value?: number; // type이 'amount'일 때는 금액, 'rate'일 때는 비율
}

export interface Client {
  id: string;
  name: string;
  representative: string;
  address: string;
  phone: string;
  email: string;
  registrationNumber: string;
  totalSales: number;
  quoteCount: number;
}