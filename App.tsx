import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { QuoteCreator } from './components/QuoteCreator';
import { QuoteList } from './components/QuoteList';
import { ClientManagement } from './components/ClientManagement';
import { SalesManagement } from './components/SalesManagement';
import { CompanySettings } from './components/CompanySettings';
import { AdminSettings } from './components/AdminSettings';
import { PaymentPage } from './components/PaymentPage';
import { MyPage } from './components/MyPage';
import { CustomerNoticePage } from './components/CustomerNoticePage';
import { LandingPage } from './components/LandingPage';
import { AuthDialog } from './components/AuthPage';
import { AuthPageMobile } from './components/AuthPageMobile';
import { ScrollToTop } from './components/ScrollToTop';
import { Footer } from './components/Footer';
import { Chatbot } from './components/Chatbot';
import { onAuthChange } from './utils/supabase';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

export default function App() {
  const [currentPage, setCurrentPage] = useState('create');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showAuthMobilePage, setShowAuthMobilePage] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Listen to authentication state changes
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isMounted = true;
    
    try {
    const unsubscribe = onAuthChange(async (currentUser) => {
        if (isMounted) {
      setUser(currentUser);
      setLoading(false);
      
      // 로그인 성공 시 팝업 닫기
      if (currentUser) {
        setShowAuthDialog(false);
        setShowAuthMobilePage(false);
      }
        }
      });

      // 타임아웃 설정: 5초 후에도 로딩이 끝나지 않으면 강제로 로딩 해제
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('⚠️ 로딩 타임아웃: 강제로 로딩 상태 해제');
          setLoading(false);
        }
      }, 5000);

      return () => {
        isMounted = false;
        unsubscribe();
        if (timeoutId) clearTimeout(timeoutId);
      };
    } catch (error) {
      console.error('❌ 인증 상태 확인 중 오류:', error);
      if (isMounted) {
        setLoading(false);
      }
      if (timeoutId) clearTimeout(timeoutId);
    }
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#f9fafb' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4" style={{ color: '#666666' }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러 바운더리 추가
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (e) => {
      console.error('전역 에러:', e.error);
    });
    window.addEventListener('unhandledrejection', (e) => {
      console.error('처리되지 않은 Promise 거부:', e.reason);
    });
  }

  const renderPage = () => {
    // 로그인하지 않은 경우 랜딩페이지 표시
    if (!user && currentPage === 'landing') {
      return (
        <LandingPage 
          onLoginClick={handleLoginClick}
          onGetStarted={handleLoginClick}
        />
      );
    }

    // 로그인하지 않은 경우 기본적으로 랜딩페이지로
    if (!user) {
      return (
        <LandingPage 
          onLoginClick={handleLoginClick}
          onGetStarted={handleLoginClick}
        />
      );
    }

    switch (currentPage) {
      case 'create':
        return <QuoteCreator editingQuoteId={editingQuoteId} onEditComplete={() => setEditingQuoteId(null)} />;
      case 'list':
        return <QuoteList onEditQuote={(id) => {
          setEditingQuoteId(id);
          setCurrentPage('create');
        }} />;
      case 'clients':
        return <ClientManagement />;
      case 'sales':
        return <SalesManagement />;
      case 'company':
        return <CompanySettings />;
      case 'admin':
        return <AdminSettings />;
      case 'payment':
        return <PaymentPage />;
      case 'notice':
        return <CustomerNoticePage />;
      case 'mypage':
        return <MyPage onNavigate={(page: string) => setCurrentPage(page)} />;
      default:
        return <QuoteCreator editingQuoteId={editingQuoteId} onEditComplete={() => setEditingQuoteId(null)} />;
    }
  };

  const handleLoginClick = () => {
    if (isMobile) {
      setShowAuthMobilePage(true);
    } else {
      setShowAuthDialog(true);
    }
  };

  // Show mobile auth page
  if (showAuthMobilePage && isMobile) {
    return (
      <>
        <AuthPageMobile 
          onAuthSuccess={() => {
            setShowAuthMobilePage(false);
            // 토스트는 AuthPageMobile에서 표시하므로 여기서는 호출하지 않음
          }}
          onBack={() => setShowAuthMobilePage(false)}
        />
        <Toaster />
      </>
    );
  }

  // 로그인하지 않은 경우 랜딩페이지만 표시 (사이드바 없음)
  if (!user) {
    return (
      <>
        <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
          {renderPage()}
        </div>
        <Footer />
        
        {/* Desktop auth dialog */}
        {!isMobile && (
          <AuthDialog 
            open={showAuthDialog} 
            onOpenChange={setShowAuthDialog}
            onAuthSuccess={() => {
              setShowAuthDialog(false);
              // 토스트는 AuthDialog에서 표시하므로 여기서는 호출하지 않음
            }}
          />
        )}
        
        <Toaster />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
        <div className="flex flex-1">
          <Sidebar 
            currentPage={currentPage} 
            onPageChange={setCurrentPage}
            user={user}
            onLoginClick={handleLoginClick}
          />
          <main className={`main-content flex-1 ${currentPage === 'admin' ? 'overflow-hidden' : 'overflow-auto'}`}>
            <div className="mobile-only mobile-header-spacer"></div>
            {renderPage()}
          </main>
        </div>
        <Footer />
      </div>
      
      {/* Desktop auth dialog */}
      {!isMobile && (
        <AuthDialog 
          open={showAuthDialog} 
          onOpenChange={setShowAuthDialog}
          onAuthSuccess={() => {
            setShowAuthDialog(false);
            // 토스트는 AuthDialog에서 표시하므로 여기서는 호출하지 않음
          }}
        />
      )}
      
      {/* Scroll to top button */}
      <ScrollToTop />
      
      {/* AI Chatbot - 로그인한 사용자에게만 표시 */}
      {user && <Chatbot />}
      
      <Toaster />
      
      <style>{`
        /* 모바일 헤더 스페이서 - 헤더 높이만큼 여백 확보 */
        .mobile-header-spacer {
          height: 5rem; /* py-6 (3rem) + h2 height (약 2rem) */
        }
        
        /* 모바일: 767px 이하 - 전체 너비 + 패딩 */
        @media (max-width: 767px) {
          .main-content {
            width: 100%;
            margin-left: 0;
            padding-top: 5rem; /* 모바일 헤더 높이만큼 패딩 */
          }
          
          /* 스페이서 숨김 (패딩으로 대체) */
          .mobile-header-spacer {
            display: none;
          }
        }
        
        /* 태블릿: 768px ~ 1023px - 사이드바 제외한 너비 (18rem) */
        @media (min-width: 768px) and (max-width: 1023px) {
          .main-content {
            margin-left: 18rem;
            width: calc(100% - 18rem);
          }
        }
        
        /* 데스크톱: 1024px 이상 - flex로 자동 조정 (16rem 사이드바) */
        @media (min-width: 1024px) {
          .main-content {
            margin-left: 16rem;
            width: calc(100% - 16rem);
          }
        }
      `}</style>
    </>
  );
}