-- 기존 견적서의 잘못된 환율 값 수정 스크립트
-- Supabase SQL Editor에서 실행하세요.
-- 
-- 주의: 이 스크립트는 환율이 잘못 저장된 경우를 가정합니다.
-- 환율 값이 1보다 크면 잘못된 값으로 간주하고 NULL로 설정합니다.
-- (올바른 환율은 보통 0.0001 ~ 0.01 범위입니다)

-- 1. 잘못된 환율 값 확인
SELECT 
  id,
  quote_number,
  currency_type,
  exchange_rate,
  total_amount,
  total_amount_dollar,
  created_date
FROM quotes
WHERE currency_type IS NOT NULL 
  AND exchange_rate IS NOT NULL
  AND exchange_rate > 1  -- 잘못된 환율 (1보다 큰 값)
ORDER BY created_date DESC;

-- 2. 잘못된 환율 값을 NULL로 설정 (선택사항)
-- 주의: 이렇게 하면 기존 견적서의 환율 정보가 사라집니다.
-- 필요하다면 아래 주석을 해제하고 실행하세요.

/*
UPDATE quotes
SET exchange_rate = NULL,
    total_amount_dollar = NULL
WHERE currency_type IS NOT NULL 
  AND exchange_rate IS NOT NULL
  AND exchange_rate > 1;
*/

-- 3. 또는 환율을 다시 계산해서 업데이트하려면:
-- (하지만 과거 환율을 현재 환율로 바꾸는 것은 권장하지 않습니다)
-- 환율은 날짜별로 다르므로, 과거 견적서의 환율을 수정하는 것은 부정확할 수 있습니다.

-- 권장사항:
-- - 기존 견적서는 그대로 두고, 새로운 견적서부터 올바른 환율이 저장되도록 합니다.
-- - PDF 생성 시와 표시 시에는 저장된 exchange_rate로 다시 계산하므로,
--   exchange_rate 값만 올바르다면 자동으로 올바른 달러 금액이 표시됩니다.

