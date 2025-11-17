-- 재경비 및 기술료 컬럼 추가 마이그레이션
-- Supabase SQL Editor에서 실행하세요.

-- 1. company_settings 테이블에 재경비 비율 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='company_settings' AND column_name='expense_rate') THEN
    ALTER TABLE company_settings ADD COLUMN expense_rate NUMERIC(5, 2) DEFAULT NULL;
    RAISE NOTICE 'expense_rate 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'expense_rate 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 2. company_settings 테이블에 기술료 비율 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='company_settings' AND column_name='technical_fee_rate') THEN
    ALTER TABLE company_settings ADD COLUMN technical_fee_rate NUMERIC(5, 2) DEFAULT NULL;
    RAISE NOTICE 'technical_fee_rate 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'technical_fee_rate 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 3. quotes 테이블에 기술료 비율 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='quotes' AND column_name='technical_fee_rate') THEN
    ALTER TABLE quotes ADD COLUMN technical_fee_rate NUMERIC(5, 2) DEFAULT NULL;
    RAISE NOTICE 'quotes.technical_fee_rate 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'quotes.technical_fee_rate 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 4. quotes 테이블에 기술료 금액 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='quotes' AND column_name='technical_fee_amount') THEN
    ALTER TABLE quotes ADD COLUMN technical_fee_amount NUMERIC(12, 0) DEFAULT NULL;
    RAISE NOTICE 'quotes.technical_fee_amount 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'quotes.technical_fee_amount 컬럼이 이미 존재합니다.';
  END IF;
END $$;

