// 환율 API 유틸리티
// 무료 환율 API 사용: exchangerate-api.com

export type CurrencyType = "USD" | "CAD" | null;

interface ExchangeRateResponse {
  rates: {
    USD?: number;
    CAD?: number;
  };
  base: string;
  date: string;
}

// 환율 캐시 (1시간 동안 유효)
let exchangeRateCache: {
  rates: { USD?: number; CAD?: number };
  timestamp: number;
} | null = null;

const CACHE_DURATION = 60 * 60 * 1000; // 1시간

// 당일 환율 가져오기
export const getExchangeRate = async (
  currency: "USD" | "CAD"
): Promise<number> => {
  try {
    // 캐시 확인
    if (
      exchangeRateCache &&
      Date.now() - exchangeRateCache.timestamp < CACHE_DURATION
    ) {
      const rate = exchangeRateCache.rates[currency];
      if (rate) {
        console.log(`📦 캐시에서 환율 사용 (${currency}):`, rate);
        return rate;
      }
    }
    
    // 캐시 초기화 (잘못된 환율이 저장되어 있을 수 있음)
    console.log(`🔄 새로운 환율 가져오기 (${currency})...`);

    // 한국은행 API 사용 (무료, 한국어)
    // KRW를 기준으로 USD, CAD 환율 가져오기
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    
    // 한국은행 API는 주말/공휴일 데이터가 없을 수 있으므로 fallback 사용
    let rate: number;

    try {
      // exchangerate-api.com 사용
      // 원화를 기준으로 환율을 가져옴
      // 각 통화를 기준으로 KRW 환율을 가져와서 "1 KRW = 1/X USD" 형식으로 변환
      const baseCurrency = currency === "USD" ? "USD" : "CAD";
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log(`🔍 환율 API 응답 (${baseCurrency} 기준):`, data);
        console.log(`🔍 base 통화:`, data.base);
        console.log(`🔍 rates 객체:`, data.rates);
        
        // exchangerate-api.com의 latest/USD 또는 latest/CAD 응답 형식:
        // base: "USD" 또는 "CAD"
        // rates: { KRW: 1300, ... }  (1 USD = 1300 KRW 또는 1 CAD = 1031 KRW)
        // 
        // 우리는 원화를 달러/캐나다달러로 변환해야 하므로:
        // 1 KRW = 1 / rates.KRW USD (또는 CAD)
        // 예 (USD): rates.KRW = 1300 → 1 KRW = 1/1300 = 0.000769 USD
        // 예 (CAD): rates.KRW = 1031 → 1 KRW = 1/1031 = 0.00097 CAD
        const krwRate = data.rates?.KRW;
        
        if (!krwRate || krwRate <= 0) {
          throw new Error(`KRW 환율을 찾을 수 없습니다. rates: ${JSON.stringify(data.rates)}`);
        }
        
        console.log(`🔍 ${baseCurrency} → KRW 환율:`, krwRate, `(1 ${baseCurrency} = ${krwRate} KRW)`);
        
        // 1 KRW = 1 / krwRate USD (또는 CAD)
        // 예 (USD): krwRate = 1300 → rate = 1/1300 = 0.000769 USD
        // 예 (CAD): krwRate = 1031 → rate = 1/1031 = 0.00097 CAD
        rate = 1 / krwRate;
        
        // 소수점 6자리까지 정확하게 계산
        rate = Math.round(rate * 1000000) / 1000000;
        
        console.log(`✅ 계산된 환율 (1 KRW = ${rate} ${currency}):`, rate);
        console.log(`✅ 검증: 1원 × ${rate} = ${rate} ${currency}`);
        console.log(`✅ 검증: 1,000,000원 × ${rate} = ${(1000000 * rate).toFixed(2)} ${currency}`);
        
        // CAD의 경우 환율이 약 0.00097 정도여야 함 (1 CAD = 약 1031 KRW)
        if (currency === "CAD" && (rate < 0.0008 || rate > 0.0012)) {
          console.warn(`⚠️ CAD 환율이 예상 범위를 벗어났습니다: ${rate} (예상: 0.00097)`);
        }
        
        // 환율이 비정상적으로 크면 오류 (올바른 환율은 보통 0.0001 ~ 0.01 범위)
        if (rate > 1) {
          console.error(`❌ 환율이 비정상적으로 큽니다: ${rate}. API 응답을 확인하세요.`);
          throw new Error(`잘못된 환율 값: ${rate}`);
        }
        
        // 환율이 너무 작으면 오류 (0.00001 미만)
        if (rate < 0.00001) {
          console.error(`❌ 환율이 비정상적으로 작습니다: ${rate}. API 응답을 확인하세요.`);
          throw new Error(`잘못된 환율 값: ${rate}`);
        }
      } else {
        throw new Error("API 호출 실패");
      }
    } catch (error) {
      console.warn("환율 API 호출 실패, 기본 환율 사용:", error);
      // Fallback: 기본 환율 (대략적인 값)
      // 1 USD = 1,300 KRW → 1 KRW = 0.000769 USD
      // 1 CAD = 1,000 KRW → 1 KRW = 0.001 CAD
      rate = currency === "USD" ? 0.000769 : 0.001;
    }

    // 캐시 저장
    exchangeRateCache = {
      rates: {
        USD: currency === "USD" ? rate : exchangeRateCache?.rates.USD,
        CAD: currency === "CAD" ? rate : exchangeRateCache?.rates.CAD,
      },
      timestamp: Date.now(),
    };

    return rate;
  } catch (error) {
    console.error("환율 가져오기 오류:", error);
    // 기본 환율 반환
    return currency === "USD" ? 0.00075 : 0.00055;
  }
};

// 원화를 달러로 변환
export const convertToDollar = (
  krwAmount: number,
  currency: "USD" | "CAD",
  exchangeRate: number
): number => {
  console.log(`💰 달러 변환: ${krwAmount.toLocaleString()}원 × ${exchangeRate} = ${krwAmount * exchangeRate} ${currency}`);
  const result = Math.round(krwAmount * exchangeRate * 100) / 100;
  console.log(`💰 최종 결과: ${result} ${currency}`);
  return result;
};

// 달러 포맷팅
export const formatDollar = (amount: number, currency: "USD" | "CAD"): string => {
  const symbol = currency === "USD" ? "$" : "C$";
  // .0 단위 절삭
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  // .0으로 끝나는 경우 제거
  const cleaned = formatted.replace(/\.0+$/, "");
  return `${symbol}${cleaned}`;
};

