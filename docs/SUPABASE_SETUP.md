# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 로그인
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호, 리전 선택
4. 프로젝트 생성 완료 대기 (약 2분)

## 2. API 키 확인

1. Supabase 대시보드에서 프로젝트 선택
2. Settings > API 메뉴로 이동
3. 다음 정보 확인:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가:

```env
# 방법 1: 프로젝트 ID 사용
VITE_SUPABASE_PROJECT_ID=your-project-id-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# 또는 방법 2: 직접 URL 지정
# VITE_SUPABASE_URL=https://your-project-id.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**중요**: `.env` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.

## 4. 데이터베이스 테이블 생성

`docs/SUPABASE_MIGRATION.md` 파일의 SQL 스크립트를 Supabase SQL Editor에서 실행하세요.

1. Supabase 대시보드 > SQL Editor
2. `SUPABASE_MIGRATION.md`의 SQL 스크립트 복사
3. 실행하여 테이블 생성

## 5. Row Level Security (RLS) 설정

`SUPABASE_MIGRATION.md`의 RLS 정책을 SQL Editor에서 실행하여 보안 정책을 설정하세요.

## 6. 인증 설정

### 이메일/비밀번호 인증
1. Authentication > Providers 메뉴
2. Email provider 활성화
3. 필요시 이메일 템플릿 커스터마이징

### Google OAuth (선택사항)
1. Authentication > Providers 메뉴
2. Google provider 활성화
3. Google Cloud Console에서 OAuth 클라이언트 ID/Secret 설정
4. Supabase에 클라이언트 정보 입력

## 7. 확인

설정이 완료되면:
1. 개발 서버 재시작: `npm run dev`
2. 브라우저 콘솔에서 Supabase 연결 확인
3. 회원가입/로그인 테스트

