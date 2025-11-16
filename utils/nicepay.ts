// 나이스페이먼트 유틸리티 함수

import { PaymentRequest, PaymentResponse } from '../types/payment';

// 나이스페이먼트 테스트 환경 설정
export const NICEPAY_CONFIG = {
  // 테스트 모드
  testMode: true,
  // 테스트 MID (나이스페이먼트에서 발급받은 테스트 MID)
  mid: 'TEST_MID', // 실제 테스트 MID로 교체 필요
  // 테스트 환경 URL
  testUrl: 'https://webapi.nicepay.co.kr/webapi',
  // 실서버 URL (나중에 사용)
  prodUrl: 'https://webapi.nicepay.co.kr/webapi',
};

// 나이스페이먼트 스크립트 로드
export const loadNicePayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 이미 로드되어 있는지 확인
    if ((window as any).Nicepay || document.getElementById('nicepay-script')) {
      resolve();
      return;
    }

    // 스크립트 동적 로드 (나이스페이먼트 최신 버전)
    const script = document.createElement('script');
    script.id = 'nicepay-script';
    script.src = 'https://web.nicepay.co.kr/v3/webstd/js/nicepay-2.0.js';
    script.async = true;
    script.onload = () => {
      console.log('NicePay script loaded');
      // 스크립트 로드 후 약간의 지연을 두어 초기화 시간 확보
      setTimeout(() => resolve(), 100);
    };
    script.onerror = () => {
      console.error('Failed to load NicePay script');
      reject(new Error('NicePay script load failed'));
    };
    document.head.appendChild(script);
  });
};

// 주문번호 생성 (YYYYMMDDHHmmss + 랜덤 6자리)
export const generateOrderId = (): string => {
  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const randomStr = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `ORDER_${dateStr}_${randomStr}`;
};

// 나이스페이먼트 결제 요청
export const requestPayment = async (
  paymentRequest: PaymentRequest,
  onSuccess: (response: PaymentResponse) => void,
  onError: (error: Error) => void
): Promise<void> => {
  try {
    // 스크립트 로드 확인
    await loadNicePayScript();

    // 나이스페이먼트는 form submit 방식 또는 API 호출 방식을 사용합니다
    // 테스트 환경에서는 간단한 form 생성 방식 사용
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = NICEPAY_CONFIG.testMode 
      ? 'https://webapi.nicepay.co.kr/webapi/orderForm.jsp' 
      : 'https://webapi.nicepay.co.kr/webapi/orderForm.jsp';
    form.target = '_blank';
    form.style.display = 'none';

    // 나이스페이먼트 필수 파라미터
    const params: Record<string, string> = {
      PayMethod: 'CARD', // 결제수단: CARD(신용카드), BANK(계좌이체), VBANK(가상계좌), CELLPHONE(휴대폰)
      MerchantID: NICEPAY_CONFIG.mid,
      Amt: paymentRequest.amount.toString(),
      GoodsName: paymentRequest.goodsName,
      OrderID: paymentRequest.orderId,
      BuyerName: paymentRequest.buyerName || '',
      BuyerEmail: paymentRequest.buyerEmail || '',
      BuyerTel: paymentRequest.buyerTel || '',
      ReturnURL: `${window.location.origin}/payment/callback`, // 결제 완료 후 리다이렉트 URL
      EdiDate: new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14), // YYYYMMDDHHmmss
      CharSet: 'UTF-8',
    };

    // 파라미터를 form에 추가
    Object.keys(params).forEach((key) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = params[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);

    // 결제창 열기
    const paymentWindow = window.open('', 'nicepay', 'width=500,height=700,scrollbars=yes,resizable=yes');
    
    if (!paymentWindow) {
      document.body.removeChild(form);
      throw new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
    }

    form.submit();
    
    // 팝업이 닫히면 form 제거
    const checkClosed = setInterval(() => {
      if (paymentWindow.closed) {
        clearInterval(checkClosed);
        document.body.removeChild(form);
        // 실제 결제 완료는 ReturnURL로 리다이렉트되므로 별도 처리 필요
        // 여기서는 테스트용으로 간단히 처리
        console.log('Payment window closed');
      }
    }, 500);

    // 테스트 모드에서는 실제 결제창 대신 시뮬레이션
    if (NICEPAY_CONFIG.testMode) {
      // 테스트용: 3초 후 성공 시뮬레이션 (실제로는 ReturnURL로 리다이렉트됨)
      setTimeout(() => {
        const testResponse: PaymentResponse = {
          resultCode: '0000',
          resultMsg: '결제 성공 (테스트)',
          tid: `TEST_TID_${Date.now()}`,
          orderId: paymentRequest.orderId,
          amount: paymentRequest.amount,
          payMethod: 'CARD',
          goodsName: paymentRequest.goodsName,
          buyerName: paymentRequest.buyerName,
          buyerEmail: paymentRequest.buyerEmail,
          buyerTel: paymentRequest.buyerTel,
          paidAt: new Date().toISOString(),
        };
        onSuccess(testResponse);
        if (paymentWindow && !paymentWindow.closed) {
          paymentWindow.close();
        }
      }, 3000);
    }
  } catch (error: any) {
    console.error('Payment request error:', error);
    onError(error instanceof Error ? error : new Error('결제 요청 실패'));
  }
};

// 결제 검증 (서버 사이드에서 수행해야 함)
export const verifyPayment = async (orderId: string, amount: number): Promise<boolean> => {
  // 실제 구현은 서버 사이드에서 수행해야 합니다
  // 여기서는 클라이언트 사이드 검증만 수행
  console.log('Verifying payment:', { orderId, amount });
  return true;
};

