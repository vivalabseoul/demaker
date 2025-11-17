import { supabase, getCurrentUserId } from './supabase';
import { CompanyInfo, LaborRate, Quote, Client } from '../types/quote';
import { Subscription, ProductId } from '../types/payment';
import { standardRateTemplates } from './standardRates';

// ======================
// Company Info (이미 구현됨)
// ======================

// 회사정보 저장 (Supabase)
export const saveOurCompany = async (company: CompanyInfo): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.error('❌ User not authenticated - userId:', userId);
    throw new Error('로그인이 필요합니다. 페이지를 새로고침하고 다시 로그인해주세요.');
  }

  console.log('💾 Saving company info to Supabase:', {
    userId,
    company: {
      name: company.name,
      representative: company.representative,
      phone: company.phone,
      email: company.email,
      registrationNumber: company.registrationNumber,
      address: company.address
    }
  });

  try {
    // 사용자 프로필 확인 및 생성 (반드시 완료되어야 함)
    await ensureUserExists(userId);

    // UPSERT: 존재하면 업데이트, 없으면 삽입
    const { data, error } = await supabase
      .from('company_settings')
      .upsert({
        user_id: userId,
        name: company.name,
        representative: company.representative,
        address: company.address,
        phone: company.phone,
        email: company.email,
        registration_number: company.registrationNumber,
        expense_rate: company.expenseRate || null,
        technical_fee_rate: company.technicalFeeRate || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase save error:', error);
      throw error;
    }

    console.log('✅ Company info saved successfully:', data);

    // 저장 확인
    const { data: verifyData, error: verifyError } = await supabase
      .from('company_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (verifyError) {
      console.error('❌ Verification error:', verifyError);
      throw new Error('저장 후 확인 실패');
    }

    console.log('✅ 저장 확인 완료:', verifyData);
  } catch (error: any) {
    console.error('❌ Company info save error:', error);
    console.error('에러 상세:', {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint
    });

    // Supabase 에러 코드에 따른 메시지 변환
    if (error?.code === 'PGRST116') {
      throw new Error('저장 권한이 없습니다. Supabase RLS 정책을 확인해주세요.');
    } else if (error?.code === '23505') {
      throw new Error('이미 저장된 데이터가 있습니다.');
    } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      throw new Error('네트워크 연결을 확인해주세요.');
    }

    throw error;
  }
};

// 사용자 프로필 확인 및 생성 헬퍼 함수
const ensureUserExists = async (userId: string): Promise<void> => {
  // 먼저 사용자가 존재하는지 확인
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  // 사용자가 존재하면 성공
  if (userData && !userError) {
    console.log('✅ 사용자 프로필 존재 확인');
    return;
  }

  // 사용자가 없으면 생성 시도
  if (userError && (userError.code === 'PGRST116' || userError.code === '42P01')) {
    console.log('⚠️ 사용자 프로필이 없습니다. 생성 시도 중...');
    
    // 세션 확인 (여러 번 시도)
    let session = null;
    let attempts = 0;
    while (attempts < 3 && !session) {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionData?.session) {
        session = sessionData.session;
        break;
      }
      attempts++;
      if (attempts < 3) {
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms 대기
      }
    }

    if (!session?.user) {
      console.error('❌ 인증 세션을 찾을 수 없습니다. userId:', userId);
      // 세션이 없어도 userId로 사용자 프로필 생성 시도
      const { data: insertedUser, error: insertUserError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: null, // 세션이 없으면 null
          name: '사용자',
          first_quote_used: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertUserError) {
        // 중복 키 에러는 무시 (다른 요청에서 이미 생성됨)
        if (insertUserError.code === '23505') {
          console.log('✅ 사용자 프로필이 이미 존재합니다.');
          return;
        }
        
        console.error('❌ 사용자 프로필 생성 실패:', insertUserError);
        throw new Error(`사용자 프로필 생성 실패: ${insertUserError.message || '알 수 없는 오류'}`);
      }

      if (insertedUser) {
        console.log('✅ 사용자 프로필 생성 완료 (세션 없이):', insertedUser.id);
        return;
      }
    } else {
      // 세션이 있으면 이메일과 이름 포함하여 생성
      const { data: insertedUser, error: insertUserError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: session.user.email || null,
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || '사용자',
          first_quote_used: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertUserError) {
        // 중복 키 에러는 무시 (다른 요청에서 이미 생성됨)
        if (insertUserError.code === '23505') {
          console.log('✅ 사용자 프로필이 이미 존재합니다.');
          return;
        }
        
        console.error('❌ 사용자 프로필 생성 실패:', insertUserError);
        throw new Error(`사용자 프로필 생성 실패: ${insertUserError.message || '알 수 없는 오류'}`);
      }

      if (insertedUser) {
        console.log('✅ 사용자 프로필 생성 완료:', insertedUser.id);
        return;
      }
    }
  }

  // 기타 에러
  if (userError) {
    console.error('❌ 사용자 프로필 확인 실패:', userError);
    // PGRST116은 데이터가 없다는 의미이므로 계속 진행
    if (userError.code === 'PGRST116') {
      console.log('⚠️ 사용자 프로필이 없지만 계속 진행합니다.');
      return;
    }
    throw new Error(`사용자 프로필 확인 실패: ${userError.message || '알 수 없는 오류'}`);
  }
};

// 회사정보 가져오기 (Supabase)
export const getOurCompany = async (): Promise<CompanyInfo | null> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.log('⚠️ User not authenticated, returning default');
      return getDefaultCompanyInfo();
    }

    // 사용자 프로필 확인 및 생성
    await ensureUserExists(userId);

    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 데이터가 없음
        console.log('⚠️ No company settings found, returning default');
        return getDefaultCompanyInfo();
      }
      console.error('❌ Error fetching company info:', error);
      return getDefaultCompanyInfo();
    }

    if (data) {
      return {
        name: data.name || '',
        representative: data.representative || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        registrationNumber: data.registration_number || '',
        expenseRate: data.expense_rate || undefined,
        technicalFeeRate: data.technical_fee_rate || undefined
      };
    }

    return getDefaultCompanyInfo();
  } catch (error: any) {
    console.error('❌ Error in getOurCompany:', error);
    return getDefaultCompanyInfo();
  }
};

// 기본 회사정보
const getDefaultCompanyInfo = (): CompanyInfo => ({
  name: '',
  representative: '',
  address: '',
  phone: '',
  email: '',
  registrationNumber: '',
  expenseRate: 10,
  technicalFeeRate: undefined,
});

// ======================
// Labor Rates
// ======================

const getDefaultLaborRates = (): LaborRate[] => {
  // standardRates에서 템플릿 가져오기
  const templates = standardRateTemplates;
  const rates: LaborRate[] = [];
  
  templates.forEach((template, index) => {
    template.rates.forEach((rate, rateIndex) => {
      rates.push({
        id: `${template.year || 'default'}-${index}-${rateIndex}`,
        category: rate.category,
        role: rate.role,
        hourlyRate: rate.hourlyRate,
        dailyRate: rate.dailyRate,
        type: rate.type as 'company' | 'freelancer'
      });
    });
  });
  
  return rates;
};

export const getLaborRates = async (): Promise<LaborRate[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return getDefaultLaborRates();
    }

    const { data, error } = await supabase
      .from('labor_rates')
      .select('*')
      .eq('user_id', userId)
      .order('category', { ascending: true })
      .order('role', { ascending: true });

    if (error) {
      console.error('❌ Error fetching labor rates:', error);
      return [];
    }

    if (data && data.length > 0) {
      return data.map(rate => ({
        id: rate.id,
        category: rate.category,
        role: rate.role,
        hourlyRate: rate.hourly_rate,
        dailyRate: rate.daily_rate,
        type: rate.type as 'company' | 'freelancer'
      }));
    }

    return [];
  } catch (error: any) {
    console.error('❌ Error in getLaborRates:', error);
    return [];
  }
};

export const saveLaborRates = async (rates: LaborRate[]): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // 사용자 프로필 확인 및 생성
  await ensureUserExists(userId);

  try {
    // 기존 데이터 삭제
    const { error: deleteError } = await supabase
      .from('labor_rates')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('❌ Error deleting old labor rates:', deleteError);
    }

    // 새 데이터 삽입
    const ratesToInsert = rates.map(rate => ({
      user_id: userId,
      category: rate.category,
      role: rate.role,
      hourly_rate: rate.hourlyRate,
      daily_rate: rate.dailyRate,
      type: rate.type
    }));

    const { error: insertError } = await supabase
      .from('labor_rates')
      .insert(ratesToInsert);

    if (insertError) {
      console.error('❌ Error saving labor rates:', insertError);
      throw insertError;
    }

    console.log('✅ Labor rates saved successfully');
  } catch (error: any) {
    console.error('❌ Error in saveLaborRates:', error);
    throw error;
  }
};

// ======================
// Quotes
// ======================

const getDefaultQuotes = (): Quote[] => {
  // 기본 견적서는 빈 배열로 반환 (실제 데이터는 DB에서 가져옴)
  return [];
};

export const getQuotes = async (limitCount?: number): Promise<Quote[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return getDefaultQuotes();
    }

    // 사용자 프로필 확인 및 생성
    await ensureUserExists(userId);

    let query = supabase
      .from('quotes')
      .select('*')
      .eq('user_id', userId)
      .order('created_date', { ascending: false });

    if (limitCount) {
      query = query.limit(limitCount);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching quotes:', error);
      return getDefaultQuotes();
    }

    if (data && data.length > 0) {
      return data.map(quote => ({
        id: quote.id,
        quoteNumber: quote.quote_number,
        createdDate: quote.created_date,
        projectName: quote.project_name,
        ourCompany: quote.our_company as CompanyInfo,
        clientCompany: quote.client_company as CompanyInfo,
        items: quote.items as Quote['items'],
        subtotal: quote.subtotal,
        expenseRate: quote.expense_rate || 10,
        expenseAmount: quote.expense_amount || 0,
        technicalFeeRate: quote.technical_fee_rate || undefined,
        technicalFeeAmount: quote.technical_fee_amount || undefined,
        discounts: (quote.discount as any) || [],
        totalDiscount: quote.total_discount || 0,
        totalAmount: quote.total_amount,
        supplyAmount: quote.supply_amount,
        vatAmount: quote.vat_amount,
        includeVat: quote.include_vat,
        type: (quote.quote_type || quote.type) as 'company' | 'freelancer',
        notes: quote.notes,
        finalQuoteAmount: quote.final_quote_amount || undefined,
        finalQuoteCurrencyType: (quote.final_quote_currency_type || 'KRW') as 'KRW' | 'USD' | 'CAD' | null,
        issued: quote.issued || false,
        issuedDate: quote.issued_date,
        currencyType: quote.currency_type as 'USD' | 'CAD' | null,
        exchangeRate: quote.exchange_rate || undefined,
        totalAmountDollar: quote.total_amount_dollar || undefined
      }));
    }

    return getDefaultQuotes();
  } catch (error: any) {
    console.error('❌ Error in getQuotes:', error);
    return getDefaultQuotes();
  }
};

// UUID 형식 검증 함수
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const saveQuote = async (quote: Quote): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // 사용자 프로필 확인 및 생성
  await ensureUserExists(userId);

  try {
    // ID가 유효한 UUID가 아니면 undefined로 설정하여 Supabase가 자동 생성하도록 함
    const quoteId = quote.id && isValidUUID(quote.id) ? quote.id : undefined;
    
    const quoteData = {
      id: quoteId,
      user_id: userId,
      quote_number: quote.quoteNumber,
      created_date: quote.createdDate,
      project_name: quote.projectName,
      our_company: quote.ourCompany,
      client_company: quote.clientCompany,
      items: quote.items,
      subtotal: quote.subtotal,
      expense_rate: quote.expenseRate,
      expense_amount: quote.expenseAmount,
      technical_fee_rate: quote.technicalFeeRate || null,
      technical_fee_amount: quote.technicalFeeAmount || null,
      discount: quote.discounts || [],
      total_discount: quote.totalDiscount || 0,
      total_amount: quote.totalAmount,
      supply_amount: quote.supplyAmount,
      vat_amount: quote.vatAmount,
      include_vat: quote.includeVat,
      quote_type: quote.type,
      notes: quote.notes,
      final_quote_amount: quote.finalQuoteAmount || null,
      final_quote_currency_type: quote.finalQuoteCurrencyType || null,
      issued: quote.issued || false,
      issued_date: quote.issuedDate,
      currency_type: quote.currencyType || null,
      exchange_rate: quote.exchangeRate || null,
      total_amount_dollar: quote.totalAmountDollar || null
    };

    const { error } = await supabase
      .from('quotes')
      .upsert(quoteData, {
        onConflict: 'id'
      });

    if (error) {
      console.error('❌ Error saving quote:', error);
      throw error;
    }

    console.log('✅ Quote saved successfully');
  } catch (error: any) {
    console.error('❌ Error in saveQuote:', error);
    throw error;
  }
};

export const saveQuotesBatch = async (quotes: Quote[]): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // 사용자 프로필 확인 및 생성
  await ensureUserExists(userId);

  if (!quotes || quotes.length === 0) {
    console.warn('No quotes to save');
    return;
  }

  try {
    const quotesToInsert = quotes.map(quote => {
      // ID가 유효한 UUID가 아니면 undefined로 설정하여 Supabase가 자동 생성하도록 함
      const quoteId = quote.id && isValidUUID(quote.id) ? quote.id : undefined;
      return {
        id: quoteId,
        user_id: userId,
        quote_number: quote.quoteNumber,
        created_date: quote.createdDate,
        project_name: quote.projectName,
        our_company: quote.ourCompany,
        client_company: quote.clientCompany,
        items: quote.items,
        subtotal: quote.subtotal,
        expense_rate: quote.expenseRate,
        expense_amount: quote.expenseAmount,
        technical_fee_rate: quote.technicalFeeRate || null,
        technical_fee_amount: quote.technicalFeeAmount || null,
        discount: quote.discounts || [],
        total_discount: quote.totalDiscount || 0,
        total_amount: quote.totalAmount,
        supply_amount: quote.supplyAmount,
        vat_amount: quote.vatAmount,
        include_vat: quote.includeVat,
        quote_type: quote.type,
        notes: quote.notes,
        final_quote_amount: quote.finalQuoteAmount || null,
        final_quote_currency_type: quote.finalQuoteCurrencyType || null,
        issued: quote.issued || false,
        issued_date: quote.issuedDate,
        currency_type: quote.currencyType || null,
        exchange_rate: quote.exchangeRate || null,
        total_amount_dollar: quote.totalAmountDollar || null
      };
    });

    const { error } = await supabase
      .from('quotes')
      .upsert(quotesToInsert, {
        onConflict: 'id'
      });

    if (error) {
      console.error('❌ Error saving quotes batch:', error);
      throw error;
    }

    console.log(`✅ ${quotes.length} quotes saved successfully`);
  } catch (error: any) {
    console.error('❌ Error in saveQuotesBatch:', error);
    throw error;
  }
};

export const deleteQuote = async (id: string): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error deleting quote:', error);
      throw error;
    }

    console.log('✅ Quote deleted successfully');
  } catch (error: any) {
    console.error('❌ Error in deleteQuote:', error);
    throw error;
  }
};

export const getQuoteById = async (id: string): Promise<Quote | undefined> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return undefined;
    }

    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      console.error('❌ Error fetching quote by ID:', error);
      return undefined;
    }

    if (data) {
      return {
        id: data.id,
        quoteNumber: data.quote_number,
        createdDate: data.created_date,
        projectName: data.project_name,
      ourCompany: data.our_company as CompanyInfo,
      clientCompany: data.client_company as CompanyInfo,
      items: data.items as Quote['items'],
        subtotal: data.subtotal,
        expenseRate: data.expense_rate || 10,
        expenseAmount: data.expense_amount || 0,
        technicalFeeRate: data.technical_fee_rate || undefined,
        technicalFeeAmount: data.technical_fee_amount || undefined,
        discounts: (data.discount as any) || [],
        totalDiscount: data.total_discount || 0,
        totalAmount: data.total_amount,
        supplyAmount: data.supply_amount,
        vatAmount: data.vat_amount,
        includeVat: data.include_vat,
        type: (data.quote_type || data.type) as 'company' | 'freelancer',
        notes: data.notes,
        finalQuoteAmount: data.final_quote_amount || undefined,
        finalQuoteCurrencyType: (data.final_quote_currency_type || 'KRW') as 'KRW' | 'USD' | 'CAD' | null,
        issued: data.issued || false,
        issuedDate: data.issued_date,
        currencyType: data.currency_type as 'USD' | 'CAD' | null,
        exchangeRate: data.exchange_rate || undefined,
        totalAmountDollar: data.total_amount_dollar || undefined
      };
    }

    return undefined;
  } catch (error: any) {
    console.error('❌ Error in getQuoteById:', error);
    return undefined;
  }
};

export const generateQuoteNumber = async (): Promise<string> => {
  try {
    const userId = await getCurrentUserId();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const today = formatDate(date);

    if (!userId) {
      return `Q${year}${month}001`;
    }

    // 오늘 날짜의 견적서만 조회
    const { data, error } = await supabase
      .from('quotes')
      .select('quote_number')
      .eq('user_id', userId)
      .like('quote_number', `Q${year}${month}%`)
      .limit(10);

    if (error) {
      console.error('❌ Error generating quote number:', error);
      return `Q${year}${month}001`;
    }

    let sequence = 1;
    if (data && data.length > 0) {
      let maxSequence = 0;
      data.forEach(quote => {
        const quoteNumber = quote.quote_number;
        const currentSequence = parseInt(quoteNumber.slice(-3));
        if (!isNaN(currentSequence) && currentSequence > maxSequence) {
          maxSequence = currentSequence;
        }
      });
      sequence = maxSequence + 1;
    }

    const sequenceStr = String(sequence).padStart(3, '0');
    return `Q${year}${month}${sequenceStr}`;
  } catch (error: any) {
    console.error('❌ Error in generateQuoteNumber:', error);
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `Q${year}${month}001`;
  }
};

// ======================
// Clients
// ======================

const getDefaultClients = (): Client[] => {
  return [];
};

export const getClients = async (): Promise<Client[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return getDefaultClients();
    }

    // 사용자 프로필 확인 및 생성
    await ensureUserExists(userId);

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching clients:', error);
      return getDefaultClients();
    }

    if (data && data.length > 0) {
      // totalSales와 quoteCount는 quotes 테이블에서 계산
      const quotes = await getQuotes();
      const clientSalesMap = new Map<string, { totalSales: number; quoteCount: number }>();

      quotes.forEach(quote => {
        const clientName = quote.clientCompany.name;
        const current = clientSalesMap.get(clientName) || { totalSales: 0, quoteCount: 0 };
        clientSalesMap.set(clientName, {
          totalSales: current.totalSales + quote.totalAmount,
          quoteCount: current.quoteCount + 1
        });
      });

      return data.map(client => {
        const sales = clientSalesMap.get(client.name) || { totalSales: 0, quoteCount: 0 };
        return {
          id: client.id,
          name: client.name,
          representative: client.representative,
          address: client.address,
          phone: client.phone,
          email: client.email,
          registrationNumber: client.registration_number,
          totalSales: sales.totalSales,
          quoteCount: sales.quoteCount
        };
      });
    }

    return getDefaultClients();
  } catch (error: any) {
    console.error('❌ Error in getClients:', error);
    return getDefaultClients();
  }
};

export const saveClient = async (client: Client): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // 사용자 프로필 확인 및 생성
  await ensureUserExists(userId);

  try {
    const clientData = {
      id: client.id || undefined,
      user_id: userId,
      name: client.name,
      representative: client.representative,
      registration_number: client.registrationNumber,
      address: client.address,
      phone: client.phone,
      email: client.email
    };

    const { error } = await supabase
      .from('clients')
      .upsert(clientData, {
        onConflict: 'id'
      });

    if (error) {
      console.error('❌ Error saving client:', error);
      throw error;
    }

    console.log('✅ Client saved successfully');
  } catch (error: any) {
    console.error('❌ Error in saveClient:', error);
    throw error;
  }
};

export const deleteClient = async (id: string): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error deleting client:', error);
      throw error;
    }

    console.log('✅ Client deleted successfully');
  } catch (error: any) {
    console.error('❌ Error in deleteClient:', error);
    throw error;
  }
};

export const getClientById = async (id: string): Promise<Client | undefined> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return undefined;
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      console.error('❌ Error fetching client by ID:', error);
      return undefined;
    }

    if (data) {
      // totalSales와 quoteCount 계산
      const quotes = await getQuotes();
      const clientQuotes = quotes.filter(q => q.clientCompany.name === data.name);
      const totalSales = clientQuotes.reduce((sum, q) => sum + q.totalAmount, 0);

      return {
        id: data.id,
        name: data.name,
        representative: data.representative,
        address: data.address,
        phone: data.phone,
        email: data.email,
        registrationNumber: data.registration_number,
        totalSales,
        quoteCount: clientQuotes.length
      };
    }

    return undefined;
  } catch (error: any) {
    console.error('❌ Error in getClientById:', error);
    return undefined;
  }
};

// ======================
// Utility Functions
// ======================

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatCurrency = (amount: number): string => {
  // .0 단위 절삭
  const formatted = new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return formatted;
};

// ======================
// Customer Notice & Payment Info
// ======================

export interface CustomerNotice {
  refundPolicy: string;
  terms: string;
  serviceScope: string;
  deliveryPolicy: string;
  paymentSchedule: string;
  otherTerms: string;
}

export interface BankAccountInfo {
  selectedType?: "domestic" | "international" | null;
  domestic?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    notes?: string;
  };
  international?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    swiftCode: string;
    notes?: string;
  };
}

// 고객 안내문구 저장
export const saveCustomerNotice = async (notice: CustomerNotice): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    await ensureUserExists(userId);

    const { error } = await supabase
      .from('company_settings')
      .upsert({
        user_id: userId,
        customer_notice: notice,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;
  } catch (error: any) {
    console.error('❌ Error saving customer notice:', error);
    throw error;
  }
};

// 고객 안내문구 불러오기
export const getCustomerNotice = async (): Promise<CustomerNotice | null> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.log('⚠️ getCustomerNotice: userId가 없습니다.');
      return null;
    }

    console.log('🔍 getCustomerNotice: 데이터베이스에서 고객 안내문구 조회 중...', { userId });

    const { data, error } = await supabase
      .from('company_settings')
      .select('customer_notice')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️ getCustomerNotice: company_settings 레코드가 없습니다.');
      } else {
        console.error('❌ Error getting customer notice:', error);
      }
      return null;
    }

    console.log('✅ getCustomerNotice: 데이터 조회 성공', { 
      hasData: !!data, 
      hasCustomerNotice: !!data?.customer_notice,
      customerNotice: data?.customer_notice 
    });

    return data?.customer_notice || null;
  } catch (error: any) {
    console.error('❌ Error in getCustomerNotice:', error);
    return null;
  }
};

// 입금 정보 저장
export const savePaymentInfo = async (paymentInfo: BankAccountInfo): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    await ensureUserExists(userId);

    const { error } = await supabase
      .from('company_settings')
      .upsert({
        user_id: userId,
        payment_info: paymentInfo,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;
  } catch (error: any) {
    console.error('❌ Error saving payment info:', error);
    throw error;
  }
};

// 입금 정보 불러오기
export const getPaymentInfo = async (): Promise<BankAccountInfo | null> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return null;
    }

    const { data, error } = await supabase
      .from('company_settings')
      .select('payment_info')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error getting payment info:', error);
      return null;
    }

    return data?.payment_info || null;
  } catch (error: any) {
    console.error('❌ Error in getPaymentInfo:', error);
    return null;
  }
};
