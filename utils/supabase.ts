import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, publicAnonKey } from './supabase/info';

// 설정 확인
if (!publicAnonKey || !supabaseUrl) {
  console.error('❌ Supabase 설정이 누락되었습니다. 환경 변수 또는 설정 파일을 확인해주세요.');
  console.error('필요한 변수:', {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '설정됨' : '누락됨',
    supabaseUrl,
    publicAnonKey: publicAnonKey ? '설정됨' : '누락됨'
  });
} else {
  console.log('✅ Supabase 설정 확인:', {
    url: supabaseUrl,
    hasKey: !!publicAnonKey
  });
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// 연결 테스트 함수
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Supabase 연결 테스트 시작...');
    console.log('📍 Supabase URL:', supabaseUrl);
    console.log('🔑 Anon Key:', publicAnonKey ? '설정됨' : '누락됨');
    
    // 간단한 쿼리로 연결 테스트
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        // 테이블이 없어도 연결은 성공 (테이블만 생성하면 됨)
        console.log('✅ Supabase 연결 성공 (테이블이 아직 생성되지 않았습니다)');
        console.log('💡 SQL 스키마를 실행하여 테이블을 생성하세요: docs/SUPABASE_MIGRATION.sql');
        return true;
      } else {
        console.error('❌ Supabase 연결 테스트 실패:', error);
        console.error('에러 코드:', error.code);
        console.error('에러 메시지:', error.message);
        return false;
      }
    }
    
    console.log('✅ Supabase 연결 성공!');
    console.log('📊 데이터:', data);
    return true;
  } catch (error: any) {
    console.error('❌ Supabase 연결 오류:', error);
    console.error('에러 타입:', error?.constructor?.name);
    console.error('에러 메시지:', error?.message);
    return false;
  }
};

// 현재 사용자 ID 가져오기 (비동기)
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
};

// 현재 사용자 ID 가져오기 (동기 - 기존 코드 호환)
export const getCurrentUserIdSync = (): string | null => {
  // 동기적으로는 사용할 수 없으므로 null 반환
  // 비동기 버전인 getCurrentUserId를 사용하세요
  return null;
};

// 인증 상태 확인
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// 인증 상태 변경 리스너
export const onAuthChange = (callback: (user: any | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
  return () => subscription.unsubscribe();
};

// 로그아웃
export const logOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Google 로그인 결과 확인 (App.tsx에서 사용)
export const getGoogleSignInResult = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) throw error;

    if (!session) {
      return { success: false, error: 'No session found' };
    }

    // 사용자 프로필 확인 및 생성
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!profile) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || '사용자',
          first_quote_used: false,
          created_at: new Date().toISOString()
        });

      if (insertError && insertError.code !== '23505') {
        console.warn('프로필 생성 실패:', insertError);
      }
    }

    return { success: true, user: session.user };
  } catch (error: any) {
    console.error('Google sign in result error:', error);
    return { success: false, error: error.message || '인증 확인 실패' };
  }
};

export default supabase;

