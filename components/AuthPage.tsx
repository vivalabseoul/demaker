import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { signIn, signUp, signInWithGoogle } from '../utils/supabaseAuth';
import { toast } from 'sonner';
import { Chrome, Loader2 } from 'lucide-react';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: () => void;
}

export function AuthDialog({ open, onOpenChange, onAuthSuccess }: AuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Sign in state
  // TODO: 출시 전 테스트 계정 - 출시 시 제거 필요
  const [signInEmail, setSignInEmail] = useState('test@example.com');
  const [signInPassword, setSignInPassword] = useState('123456');
  const [rememberEmail, setRememberEmail] = useState(false);
  
  // Sign up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  // Load saved email on mount
  // TODO: 출시 시 테스트 계정 기본값 제거하고 localStorage 로직 복원
  useEffect(() => {
    // 테스트 계정이 이미 기본값으로 설정되어 있으므로 localStorage 체크는 주석 처리
    // const savedEmail = localStorage.getItem('savedEmail');
    // if (savedEmail) {
    //   setSignInEmail(savedEmail);
    //   setRememberEmail(true);
    // }
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
      onOpenChange(false);
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
      onOpenChange(false);
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setLoadingMessage('구글 로그인 페이지로 이동 중...');
    try {
      await signInWithGoogle();
      // User will be redirected to Google, so this toast may not show
      toast.success('구글 로그인 페이지로 이동 중...');
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error?.error || error?.message || '구글 로그인에 실패했습니다.';
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-50 rounded-lg">
            <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: '#10b981' }} />
            <p className="text-lg mb-4" style={{ color: '#10b981' }}>
              {loadingMessage}
            </p>
            <div className="w-3/4">
              <Progress value={100} className="h-2" />
              <p className="text-sm text-center mt-2" style={{ color: '#71717B' }}>
                100%
              </p>
            </div>
          </div>
        )}
        
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">개발 견적 메이커</DialogTitle>
          <DialogDescription className="text-center">
            로그인하여 견적서를 저장하고 관리하세요
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">로그인</TabsTrigger>
            <TabsTrigger value="signup">회원가입</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* 테스트 계정 안내 - TODO: 출시 시 제거 */}
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-sm" style={{ color: '#10b981' }}>
                  💡 <strong>테스트 계정이 자동 입력되었습니다.</strong>
                </p>
                <p className="text-xs mt-1" style={{ color: '#71717B' }}>
                  바로 로그인 버튼을 클릭하세요.
                </p>
              </div>
              
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
                <Label
                  htmlFor="remember-email"
                  className="ml-2 text-sm cursor-pointer"
                  style={{ color: '#71717B' }}
                >
                  이메일 기억하기
                </Label>
              </div>
              
              <Button type="submit" className="w-full border border-[#e1e1e1]" disabled={isLoading}>
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2" style={{ color: '#71717B' }}>
                    또는
                  </span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <Chrome className="mr-2 h-4 w-4" />
                구글로 로그인
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
              
              <Button type="submit" className="w-full border border-[#e1e1e1]" disabled={isLoading}>
                {isLoading ? '가입 중...' : '회원가입'}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2" style={{ color: '#71717B' }}>
                    또는
                  </span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <Chrome className="mr-2 h-4 w-4" />
                구글로 계속하기
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-center">
          <p className="text-sm text-center" style={{ color: '#71717B' }}>
            Firebase 기반 안전한 인증
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}