# 개발견적메이커

개발 프로젝트 견적서를 쉽게 생성하고 관리할 수 있는 웹 애플리케이션입니다.

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치

1. 의존성 설치
```bash
npm install
```

2. 개발 서버 실행
```bash
npm run dev
```

애플리케이션이 `http://localhost:3000`에서 실행됩니다.

### 빌드

프로덕션 빌드를 생성하려면:
```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 미리보기

빌드된 앱을 미리보려면:
```bash
npm run preview
```

## 📦 주요 기능

- 견적서 생성 및 관리
- 고객 정보 관리
- 매출 관리 및 통계
- 회사 정보 설정
- 노임 설정 관리
- PDF 다운로드

## 🛠 기술 스택

- **React** - UI 프레임워크
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **Firebase** - 인증 및 데이터베이스
- **Tailwind CSS** - 스타일링
- **Radix UI** - UI 컴포넌트
- **Recharts** - 차트 라이브러리
- **Sonner** - 토스트 알림

## 📝 환경 설정

Firebase 설정이 필요합니다. `utils/firebase.ts` 파일에서 Firebase 프로젝트 설정을 확인하세요.

## 🔧 문제 해결

### 의존성 설치 오류
만약 패키지 설치 중 오류가 발생하면:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 포트 충돌
기본 포트(3000)가 사용 중이면 `vite.config.ts`에서 포트를 변경할 수 있습니다.

