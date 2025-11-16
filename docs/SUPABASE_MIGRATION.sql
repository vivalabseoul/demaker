-- Supabase 마이그레이션 SQL 스크립트
-- Supabase SQL Editor에서 이 파일의 내용을 복사하여 실행하세요.

-- 1. users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  name TEXT,
  first_quote_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. company_settings 테이블 생성
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  representative TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  registration_number TEXT,
  customer_notice JSONB,
  payment_info JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. clients 테이블 생성
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  representative TEXT,
  registration_number TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. labor_rates 테이블 생성
CREATE TABLE IF NOT EXISTS labor_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  role TEXT NOT NULL,
  hourly_rate INTEGER,
  daily_rate INTEGER,
  type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. quotes 테이블 생성
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quote_number TEXT NOT NULL,
  created_date TEXT NOT NULL,
  project_name TEXT,
  quote_type TEXT,
  our_company JSONB,
  client_company JSONB,
  items JSONB,
  discount JSONB,
  subtotal INTEGER,
  expense_rate INTEGER,
  expense_amount INTEGER,
  total_discount INTEGER DEFAULT 0,
  total_amount INTEGER,
  supply_amount INTEGER,
  vat_amount INTEGER,
  include_vat BOOLEAN DEFAULT false,
  notes TEXT,
  issued BOOLEAN DEFAULT false,
  issued_date TEXT,
  currency_type TEXT,
  exchange_rate NUMERIC,
  total_amount_dollar NUMERIC,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. subscriptions 테이블 생성
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  period TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  quota INTEGER NOT NULL,
  used_quota INTEGER DEFAULT 0,
  reissue_quota INTEGER DEFAULT 0,
  used_reissue_quota INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. payments 테이블 생성
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  goods_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  pay_method TEXT,
  tid TEXT,
  completed_at TIMESTAMP,
  buyer_name TEXT,
  buyer_email TEXT,
  buyer_tel TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security (RLS) 활성화 및 정책 설정

-- users 테이블 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- company_settings 테이블 RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own company settings" ON company_settings;
CREATE POLICY "Users can manage own company settings" ON company_settings FOR ALL USING (auth.uid() = user_id);

-- clients 테이블 RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own clients" ON clients;
CREATE POLICY "Users can manage own clients" ON clients FOR ALL USING (auth.uid() = user_id);

-- labor_rates 테이블 RLS
ALTER TABLE labor_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own labor rates" ON labor_rates;
CREATE POLICY "Users can manage own labor rates" ON labor_rates FOR ALL USING (auth.uid() = user_id);

-- quotes 테이블 RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own quotes" ON quotes;
CREATE POLICY "Users can manage own quotes" ON quotes FOR ALL USING (auth.uid() = user_id);

-- subscriptions 테이블 RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON subscriptions;
CREATE POLICY "Users can manage own subscriptions" ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- payments 테이블 RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own payments" ON payments;
CREATE POLICY "Users can manage own payments" ON payments FOR ALL USING (auth.uid() = user_id);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_created_date ON quotes(created_date);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_labor_rates_user_id ON labor_rates(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- 기존 테이블이 있는 경우 컬럼 추가 (마이그레이션용)
-- quotes 테이블에 누락된 컬럼 추가
DO $$ 
BEGIN
  -- expense_rate 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='quotes' AND column_name='expense_rate') THEN
    ALTER TABLE quotes ADD COLUMN expense_rate INTEGER;
  END IF;
  
  -- expense_amount 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='quotes' AND column_name='expense_amount') THEN
    ALTER TABLE quotes ADD COLUMN expense_amount INTEGER;
  END IF;
  
  -- total_discount 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='quotes' AND column_name='total_discount') THEN
    ALTER TABLE quotes ADD COLUMN total_discount INTEGER DEFAULT 0;
  END IF;
  
  -- notes 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='quotes' AND column_name='notes') THEN
    ALTER TABLE quotes ADD COLUMN notes TEXT;
  END IF;
  
  -- payments 테이블에 누락된 컬럼 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='payments' AND column_name='pay_method') THEN
    ALTER TABLE payments ADD COLUMN pay_method TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='payments' AND column_name='tid') THEN
    ALTER TABLE payments ADD COLUMN tid TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='payments' AND column_name='completed_at') THEN
    ALTER TABLE payments ADD COLUMN completed_at TIMESTAMP;
  END IF;
  
  -- 기존 expense 컬럼이 있으면 제거 (선택사항 - 주석 처리)
  -- ALTER TABLE quotes DROP COLUMN IF EXISTS expense;
  
  -- company_settings 테이블에 customer_notice 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='company_settings' AND column_name='customer_notice') THEN
    ALTER TABLE company_settings ADD COLUMN customer_notice JSONB;
  END IF;
  
  -- company_settings 테이블에 payment_info 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='company_settings' AND column_name='payment_info') THEN
    ALTER TABLE company_settings ADD COLUMN payment_info JSONB;
  END IF;
  
  -- quotes 테이블에 환율 관련 컬럼 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='quotes' AND column_name='currency_type') THEN
    ALTER TABLE quotes ADD COLUMN currency_type TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='quotes' AND column_name='exchange_rate') THEN
    ALTER TABLE quotes ADD COLUMN exchange_rate NUMERIC;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='quotes' AND column_name='total_amount_dollar') THEN
    ALTER TABLE quotes ADD COLUMN total_amount_dollar NUMERIC;
  END IF;
END $$;

-- 16. 사용자 프로필 자동 생성 함수 (auth.users에 사용자가 생성될 때 자동으로 users 테이블에 프로필 생성)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, first_quote_used, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', '사용자'),
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. 트리거 생성 (auth.users에 새 사용자가 생성될 때 자동으로 실행)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
