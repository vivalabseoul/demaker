-- 사용자 베타 무료 사용량 추적 컬럼 추가
-- Supabase SQL Editor에서 실행하세요.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'beta_free_used'
  ) THEN
    ALTER TABLE users
      ADD COLUMN beta_free_used INTEGER DEFAULT 0;
    RAISE NOTICE 'beta_free_used 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'beta_free_used 컬럼이 이미 존재합니다.';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'beta_period_started_at'
  ) THEN
    ALTER TABLE users
      ADD COLUMN beta_period_started_at TIMESTAMPTZ;
    RAISE NOTICE 'beta_period_started_at 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'beta_period_started_at 컬럼이 이미 존재합니다.';
  END IF;
END $$;

