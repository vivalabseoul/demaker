# Supabase 마이그레이션 가이드

## 필요한 데이터베이스 테이블

Supabase로 전환하기 위해 다음 테이블들이 필요합니다:

### 1. users 테이블

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  name TEXT,
  first_quote_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. company_settings 테이블

```sql
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  representative TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  registration_number TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### 3. clients 테이블

```sql
CREATE TABLE clients (
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
```

### 4. labor_rates 테이블

```sql
CREATE TABLE labor_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  role TEXT NOT NULL,
  hourly_rate INTEGER,
  daily_rate INTEGER,
  type TEXT NOT NULL, -- 'company' or 'freelancer'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. quotes 테이블

```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quote_number TEXT NOT NULL,
  created_date TEXT NOT NULL,
  project_name TEXT,
  quote_type TEXT, -- 'company' or 'freelancer'
  our_company JSONB,
  client_company JSONB,
  items JSONB,
  discount JSONB,
  subtotal INTEGER,
  expense INTEGER,
  total_amount INTEGER,
  supply_amount INTEGER,
  vat_amount INTEGER,
  include_vat BOOLEAN DEFAULT false,
  issued BOOLEAN DEFAULT false,
  issued_date TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6. subscriptions 테이블

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  period TEXT NOT NULL, -- 'monthly' or 'yearly'
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  quota INTEGER NOT NULL,
  used_quota INTEGER DEFAULT 0,
  reissue_quota INTEGER DEFAULT 0,
  used_reissue_quota INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7. payments 테이블

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  goods_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  buyer_name TEXT,
  buyer_email TEXT,
  buyer_tel TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Row Level Security (RLS) 정책

모든 테이블에 대해 사용자는 자신의 데이터만 접근할 수 있도록 RLS를 설정해야 합니다:

```sql
-- users 테이블
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- company_settings 테이블
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own company settings" ON company_settings FOR ALL USING (auth.uid() = user_id);

-- clients 테이블
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own clients" ON clients FOR ALL USING (auth.uid() = user_id);

-- labor_rates 테이블
ALTER TABLE labor_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own labor rates" ON labor_rates FOR ALL USING (auth.uid() = user_id);

-- quotes 테이블
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own quotes" ON quotes FOR ALL USING (auth.uid() = user_id);

-- subscriptions 테이블
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own subscriptions" ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- payments 테이블
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own payments" ON payments FOR ALL USING (auth.uid() = user_id);
```

## 인덱스 생성

성능 향상을 위한 인덱스:

```sql
CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX idx_quotes_created_date ON quotes(created_date);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_labor_rates_user_id ON labor_rates(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
```
