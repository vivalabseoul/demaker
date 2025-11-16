-- company_settings 테이블에 payment_info와 customer_notice 컬럼 추가
-- Supabase SQL Editor에서 실행하세요.

-- customer_notice 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='company_settings' AND column_name='customer_notice') THEN
    ALTER TABLE company_settings ADD COLUMN customer_notice JSONB;
    RAISE NOTICE 'customer_notice 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'customer_notice 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- payment_info 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='company_settings' AND column_name='payment_info') THEN
    ALTER TABLE company_settings ADD COLUMN payment_info JSONB;
    RAISE NOTICE 'payment_info 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'payment_info 컬럼이 이미 존재합니다.';
  END IF;
END $$;

