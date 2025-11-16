import { supabase } from './supabase';

// 회원가입
export const signUp = async (email: string, password: string, name: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          firstQuoteUsed: false
        }
      }
    });

    if (error) throw error;

    // 사용자 프로필 생성
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          name: name,
          first_quote_used: false,
          created_at: new Date().toISOString()
        });

      if (profileError && profileError.code !== '23505') { // 중복 키 에러는 무시
        console.warn('프로필 생성 실패:', profileError);
      }
    }

    return { success: true, user: data.user };
  } catch (error: any) {
    console.error('Sign up error:', error);
    let errorMessage = error.message || '회원가입에 실패했습니다.';

    // Supabase 에러 코드에 따라 한글 메시지로 변환
    if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
      errorMessage = '이미 사용 중인 이메일입니다.';
    } else if (error.message?.includes('invalid email')) {
      errorMessage = '유효하지 않은 이메일 주소입니다.';
    } else if (error.message?.includes('password')) {
      errorMessage = '비밀번호가 너무 약합니다.';
    }

    return { success: false, error: errorMessage };
  }
};

// 로그인
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    return { success: true, user: data.user };
  } catch (error: any) {
    console.error('Sign in error:', error);
    let errorMessage = error.message || '로그인에 실패했습니다.';

    // Supabase 에러 코드에 따라 한글 메시지로 변환
    if (error.message?.includes('Invalid login credentials') || error.message?.includes('invalid')) {
      errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
    } else if (error.message?.includes('Email not confirmed')) {
      errorMessage = '이메일 인증이 필요합니다.';
    }

    return { success: false, error: errorMessage };
  }
};

// Google 로그인
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    let errorMessage = error.message || '구글 로그인에 실패했습니다.';

    if (error.message?.includes('popup')) {
      errorMessage = '팝업이 차단되었습니다. 브라우저 설정을 확인해주세요.';
    }

    throw { success: false, error: errorMessage };
  }
};

// Google 로그인 결과 확인
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

