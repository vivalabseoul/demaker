-- Supabase 데이터베이스 초기화 및 재설정 스크립트
-- ⚠️ 주의: 이 스크립트는 모든 데이터를 삭제합니다!
-- Supabase SQL Editor에서 실행하세요.

-- 1. 기존 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. 기존 함수 삭제
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. 기존 테이블 삭제 (외래 키 제약 조건 때문에 순서 중요)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS labor_rates CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS company_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 4. 이제 SUPABASE_MIGRATION.sql 파일의 내용을 실행하세요.

