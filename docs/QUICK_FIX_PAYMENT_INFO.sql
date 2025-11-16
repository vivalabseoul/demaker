-- ============================================
-- 빠른 수정: company_settings 테이블에 컬럼 추가
-- ============================================
-- 이 SQL을 Supabase SQL Editor에서 실행하세요.
-- Supabase 대시보드 → SQL Editor → New Query → 아래 코드 붙여넣기 → Run

-- customer_notice 컬럼 추가 (고객 안내문구용)
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS customer_notice JSONB;

-- payment_info 컬럼 추가 (입금 정보용)
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS payment_info JSONB;

-- 확인 메시지
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'company_settings' 
  AND column_name IN ('customer_notice', 'payment_info');

