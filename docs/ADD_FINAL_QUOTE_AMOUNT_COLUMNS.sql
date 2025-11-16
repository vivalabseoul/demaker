-- quotes 테이블에 최종견적금액 관련 컬럼 추가
-- Supabase SQL Editor에서 실행하세요.

-- final_quote_amount 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='quotes' AND column_name='final_quote_amount') THEN
    ALTER TABLE quotes ADD COLUMN final_quote_amount NUMERIC;
    RAISE NOTICE 'final_quote_amount 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'final_quote_amount 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- final_quote_currency_type 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='quotes' AND column_name='final_quote_currency_type') THEN
    ALTER TABLE quotes ADD COLUMN final_quote_currency_type TEXT;
    RAISE NOTICE 'final_quote_currency_type 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'final_quote_currency_type 컬럼이 이미 존재합니다.';
  END IF;
END $$;

