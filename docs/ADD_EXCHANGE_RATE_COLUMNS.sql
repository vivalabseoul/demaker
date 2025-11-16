-- quotes 테이블에 환율 관련 컬럼 추가
-- Supabase SQL Editor에서 실행하세요.

-- currency_type 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='quotes' AND column_name='currency_type') THEN
    ALTER TABLE quotes ADD COLUMN currency_type TEXT;
    RAISE NOTICE 'currency_type 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'currency_type 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- exchange_rate 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='quotes' AND column_name='exchange_rate') THEN
    ALTER TABLE quotes ADD COLUMN exchange_rate NUMERIC;
    RAISE NOTICE 'exchange_rate 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'exchange_rate 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- total_amount_dollar 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='quotes' AND column_name='total_amount_dollar') THEN
    ALTER TABLE quotes ADD COLUMN total_amount_dollar NUMERIC;
    RAISE NOTICE 'total_amount_dollar 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'total_amount_dollar 컬럼이 이미 존재합니다.';
  END IF;
END $$;

