# 결제 시스템 설정 가이드

## 개요
개발견적메이커는 나이스페이먼트(NicePay)를 통한 결제 시스템을 지원합니다.

## 현재 상태
- 결제 UI 및 로직은 구현되어 있습니다.
- 테스트 모드로 설정되어 있습니다.

## 배포 전 필수 작업

### 1. 나이스페이먼트 계정 설정
1. 나이스페이먼트 사이트(https://www.nicepay.co.kr)에서 계정 생성
2. 테스트 MID 발급 (테스트 환경)
3. 실서버 MID 발급 (프로덕션 환경)

### 2. 환경 변수 설정
`.env` 파일에 다음 변수를 추가하세요:
```
VITE_NICEPAY_MID=실제_MID_값
VITE_NICEPAY_TEST_MODE=false  # 프로덕션에서는 false
```

### 3. 코드 수정
`utils/nicepay.ts` 파일에서:
```typescript
export const NICEPAY_CONFIG = {
  testMode: process.env.VITE_NICEPAY_TEST_MODE === 'true',
  mid: process.env.VITE_NICEPAY_MID || 'TEST_MID',
  // ...
};
```

### 4. 결제 콜백 URL 설정
나이스페이먼트 대시보드에서 결제 완료 후 리다이렉트될 URL을 설정해야 합니다:
- 개발 환경: `http://localhost:3000/payment/callback`
- 프로덕션: `https://yourdomain.com/payment/callback`

### 5. 결제 검증 (서버 사이드)
현재는 클라이언트 사이드 검증만 구현되어 있습니다. 보안을 위해 서버 사이드에서 결제 검증을 구현하는 것을 권장합니다.

## 결제 플로우
1. 사용자가 구독 관리 페이지에서 요금제 선택
2. 결제 정보 입력 (이름, 이메일, 전화번호)
3. 나이스페이먼트 결제창 열림
4. 결제 완료 후 콜백 URL로 리다이렉트
5. 결제 정보 저장 및 구독 정보 업데이트

## 주의사항
- 테스트 모드에서는 실제 결제가 발생하지 않습니다.
- 프로덕션 배포 전 반드시 테스트 결제를 완료하세요.
- 결제 검증은 서버 사이드에서 수행해야 합니다.

