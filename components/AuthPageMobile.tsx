import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Footer } from './Footer';
import { signIn, signUp } from '../utils/supabaseAuth';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface AuthPageMobileProps {
  onAuthSuccess: () => void;
  onBack: () => void;
}

export function AuthPageMobile({ onAuthSuccess, onBack }: AuthPageMobileProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Sign in state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  
  // Sign up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  // Load saved email on mount
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('savedEmail');
      if (savedEmail) {
        setSignInEmail(savedEmail);
        setRememberEmail(true);
      }
    } catch (error) {
      // 웹뷰에서 localStorage가 차단된 경우 무시
      console.warn('localStorage access blocked:', error);
    }
  }, []);

  // Progress animation when loading - 항상 채워진 상태로 표시
  useEffect(() => {
    if (isLoading) {
      setLoadingProgress(100); // 로딩 중일 때 항상 100%로 표시
    } else {
      setLoadingProgress(0);
    }
  }, [isLoading]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signInEmail || !signInPassword) {
      toast.error('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('로그인 중...');
    setLoadingProgress(100); // 로딩 시작 시 즉시 100%로 설정
    const result = await signIn(signInEmail, signInPassword);
    setIsLoading(false);

    if (result.success) {
      // Save or remove email based on checkbox (웹뷰 환경 대응)
      try {
        if (rememberEmail) {
          localStorage.setItem('savedEmail', signInEmail);
        } else {
          localStorage.removeItem('savedEmail');
        }
      } catch (error) {
        // 웹뷰에서 localStorage가 차단된 경우 무시
        console.warn('localStorage access blocked:', error);
      }
      
      // 팝업 즉시 닫기
      onAuthSuccess();
      // Reset only password
      setSignInPassword('');
      
      toast.success('로그인 성공!');
    } else {
      toast.error(`로그인 실패: ${result.error}`);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUpName || !signUpEmail || !signUpPassword || !signUpConfirmPassword) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 유효성 검사: 8자 이상, 영어/숫자/특수문자 포함
    if (signUpPassword.length < 8) {
      toast.error('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    const hasEnglish = /[a-zA-Z]/.test(signUpPassword);
    const hasNumber = /[0-9]/.test(signUpPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signUpPassword);

    if (!hasEnglish || !hasNumber || !hasSpecialChar) {
      toast.error('비밀번호는 영어, 숫자, 특수문자를 모두 포함해야 합니다.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('회원가입 중...');
    setLoadingProgress(100); // 로딩 시작 시 즉시 100%로 설정
    const result = await signUp(signUpEmail, signUpPassword, signUpName);
    setIsLoading(false);

    if (result.success) {
      // 팝업 즉시 닫기
      onAuthSuccess();
      
      // Reset form
      setSignUpName('');
      setSignUpEmail('');
      setSignUpPassword('');
      setSignUpConfirmPassword('');
      
      // 기본 데이터는 Supabase 트리거에서 자동 생성됨
      
      toast.success('회원가입 성공! 자동으로 로그인됩니다.');
    } else {
      toast.error(`회원가입 실패: ${result.error}`);
    }
  };


  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: '#f9fafb' }}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/95 flex flex-col items-center justify-center z-50">
          <Loader2 className="w-16 h-16 animate-spin mb-4" style={{ color: '#10b981' }} />
          <p className="text-xl mb-6" style={{ color: '#10b981' }}>
            {loadingMessage}
          </p>
          <div className="w-3/4 max-w-sm">
            <Progress value={100} className="h-3" />
            <p className="text-base text-center mt-3" style={{ color: '#71717B' }}>
              100%
            </p>
          </div>
        </div>
      )}
      
      {/* Header with back button */}
      <div 
        className="sticky top-0 z-10 border-b border-[#e1e1e1]"
        style={{ backgroundColor: 'var(--white)' }}
      >
        {/* 닫기 버튼 - 우측 상단 */}
        <div className="flex justify-end px-4 pt-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-[#e1e1e1] transition-colors"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="w-6 h-6" style={{ color: 'var(--black)' }} />
          </button>
        </div>
        
        {/* 로고 - 닫기 버튼 아래 중앙 */}
        <div className="px-4 pb-4 text-center">
          <h1 style={{ color: 'var(--main-color)' }}>개발 견적 메이커</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="mb-6 text-center">
            <p style={{ color: '#71717B' }}>
              로그인하여 견적서를 저장하고 관리하세요
            </p>
            <p
              className="text-sm mt-3 px-4 py-2 rounded-lg"
              style={{
                backgroundColor: "#fff8e1",
                border: "1px solid #ffe0b2",
                color: "#92400e",
              }}
            >
              회원가입 후 이메일 인증을 완료하면 로그인할 수 있습니다.
            </p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">이메일</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">비밀번호</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex items-center">
                  <Checkbox
                    id="remember-email"
                    checked={rememberEmail}
                    onCheckedChange={(checked) => setRememberEmail(checked === true)}
                  />
                  <Label htmlFor="remember-email" className="ml-2 cursor-pointer" style={{ color: '#71717B' }}>
                    이메일 기억하기
                  </Label>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? '로그인 중...' : '로그인'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">이름</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="홍길동"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">이메일</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">비밀번호</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-sm mt-1" style={{ color: '#D6D3D1' }}>
                    영어, 숫자, 특수문자를 섞어서 8자 이상 입력해주세요
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">비밀번호 확인</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? '가입 중...' : '회원가입'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: '#71717B' }}>
              안전한 이메일 인증
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}