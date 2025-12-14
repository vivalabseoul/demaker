import {
  FileText,
  Settings,
  Building2,
  Users,
  BarChart3,
  TrendingUp,
  LogOut,
  LogIn,
  Menu,
  X,
  CreditCard,
  User,
  Home,
} from "lucide-react";
import { logOut } from "../utils/supabase";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  getActiveSubscription,
  getBetaQuotaStatus,
  BetaQuotaStatus,
} from "../utils/supabaseSubscription";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  user: any;
  onLoginClick: () => void;
}

export function Sidebar({
  currentPage,
  onPageChange,
  user,
  onLoginClick,
}: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [betaStatus, setBetaStatus] = useState<BetaQuotaStatus | null>(null);

  useEffect(() => {
    if (user) {
      loadSubscription();
    } else {
      setSubscription(null);
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      setLoadingSubscription(true);
      const [activeSub, beta] = await Promise.all([
        getActiveSubscription(),
        getBetaQuotaStatus(),
      ]);
      setSubscription(activeSub);
      setBetaStatus(beta);
    } catch (error) {
      console.error("Failed to load subscription:", error);
      setSubscription(null);
      setBetaStatus(null);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const menuItems = [
    { id: "landing", label: "메인으로", icon: Home },
    { id: "sales", label: "매출 관리", icon: TrendingUp },
    { id: "admin", label: "노임 설정", icon: Settings },
    { id: "create", label: "견적서 작성", icon: FileText },
    { id: "list", label: "견적서 목록", icon: BarChart3 },
    { id: "clients", label: "거래처 관리", icon: Users },
    { id: "company", label: "회사 정보", icon: Building2 },
    { id: "notice", label: "고객 안내문구", icon: FileText },
    { id: "payment", label: "구독 관리", icon: CreditCard },
    { id: "mypage", label: "마이페이지", icon: User },
  ];

  const handleLogout = async () => {
    const result = await logOut();
    if (result.success) {
      toast.success("로그아웃되었습니다.");
      setIsMobileMenuOpen(false);
      window.location.reload();
    } else {
      toast.error("로그아웃 실패");
    }
  };

  const handleMenuItemClick = (pageId: string) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header - 모바일(767px 이하)에서만 표시 */}
      <div
        className="mobile-only fixed top-0 left-0 right-0 z-50 border-b flex items-center justify-between px-4 py-6"
        style={{ backgroundColor: "var(--white)" }}
      >
        <h2 style={{ color: "var(--main-color)" }}>개발견적메이커</h2>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="no-full-width p-2 rounded-lg hover:bg-[#e1e1e1]"
          aria-label="메뉴 열기"
        >
          <Menu className="w-6 h-6" style={{ color: "var(--black)" }} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black z-50"
          style={{ opacity: 0.5 }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className="sidebar-container flex flex-col">
        {/* Header */}
        <div className="sidebar-header p-6 border-b border-[#e1e1e1]">
          <div className="flex items-center justify-between">
            <h2
              className="sidebar-title cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: "var(--main-color)" }}
              onClick={() => onPageChange('landing')}
            >
              개발견적메이커
            </h2>
            {/* 모바일 닫기 버튼 - 우측 상단 */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="mobile-only no-full-width p-1.5 rounded-lg hover:bg-[#e1e1e1] transition-colors"
              aria-label="메뉴 닫기"
            >
              <X className="w-5 h-5" style={{ color: "var(--black)" }} />
            </button>
          </div>
          {user && (
            <>
              <p
                className="sidebar-email mt-2 text-base"
                style={{ wordBreak: "break-all", overflowWrap: "break-word" }}
              >
                {user.email}
              </p>
              {betaStatus && betaStatus.remaining > 0 && (
                <div
                  className="mt-3 p-3 rounded-lg"
                  style={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid var(--main-color)",
                  }}
                >
                  <div
                    className="text-xs mb-2"
                    style={{ color: "var(--main-color)", fontWeight: 600 }}
                  >
                    🚀 베타 서비스
                  </div>
                  <div className="text-xs" style={{ color: "#D6D3D1" }}>
                    {betaStatus.remaining} / {betaStatus.total}회 남았습니다
                  </div>
                  {betaStatus.resetAt && (
                    <div className="text-[11px] mt-1" style={{ color: "#71717B" }}>
                      리셋 예정: {new Date(betaStatus.resetAt).toLocaleDateString("ko-KR")}
                    </div>
                  )}
                </div>
              )}
              {subscription && (
                <div
                  className="mt-3 p-3 rounded-lg"
                  style={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #71717B",
                  }}
                >
                  <div className="text-xs mb-2" style={{ color: "#D6D3D1" }}>
                    사용 가능 횟수
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--main-color)" }}
                    >
                      {subscription.quota - subscription.usedQuota} /{" "}
                      {subscription.quota}
                    </span>
                    <span className="text-xs" style={{ color: "#71717B" }}>
                      {Math.round(
                        ((subscription.quota - subscription.usedQuota) /
                          subscription.quota) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div
                    className="w-full h-2 rounded-full"
                    style={{ backgroundColor: "#71717B" }}
                  >
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          ((subscription.quota - subscription.usedQuota) /
                            subscription.quota) *
                          100
                        }%`,
                        backgroundColor:
                          subscription.quota - subscription.usedQuota > 0
                            ? "var(--main-color)"
                            : "#ef4444",
                      }}
                    />
                  </div>
                  {subscription.reissueQuota > 0 && (
                    <div className="mt-2 text-xs" style={{ color: "#71717B" }}>
                      재발급:{" "}
                      {subscription.reissueQuota -
                        (subscription.usedReissueQuota || 0)}{" "}
                      / {subscription.reissueQuota}
                    </div>
                  )}
                </div>
              )}
              {!subscription &&
                !(betaStatus && betaStatus.remaining > 0) &&
                !loadingSubscription &&
                user && (
                  <div
                    className="mt-3 p-2 rounded-lg text-xs text-center mobile-subscription-none"
                    style={{ backgroundColor: "#1a1a1a", color: "#71717B" }}
                  >
                    구독이 없습니다
                  </div>
                )}
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="px-3 flex-1 py-4 overflow-y-auto sidebar-nav-scroll">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                className="sidebar-menu-item w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors"
                style={{
                  backgroundColor: isActive
                    ? "var(--main-color)"
                    : "transparent",
                  color: isActive ? "var(--white)" : "#D6D3D1",
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-lg">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Login/Logout Button */}
        <div className="sidebar-footer p-3 border-t border-[#e1e1e1] flex-shrink-0">
          {user ? (
            <button
              onClick={handleLogout}
              className="sidebar-logout w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-lg">로그아웃</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onLoginClick();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:opacity-90"
              style={{
                backgroundColor: "var(--main-color)",
                color: "var(--white)",
              }}
            >
              <LogIn className="w-5 h-5" />
              <span className="text-lg">로그인</span>
            </button>
          )}
        </div>
      </aside>

      <style>{`
        /* 네비게이션 스크롤바 스타일 */
        .sidebar-nav-scroll::-webkit-scrollbar {
          width: 8px;
        }
        
        .sidebar-nav-scroll::-webkit-scrollbar-track {
          background: var(--main-color);
          border-radius: 4px;
        }
        
        .sidebar-nav-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        
        .sidebar-nav-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        
        /* Firefox */
        .sidebar-nav-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) var(--main-color);
        }
        
        /* 모바일 초소형: 450px 이하 - 화이트 배경, 90% 화면 */
        @media (max-width: 450px) {
          .sidebar-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 90%;
            height: 100vh;
            z-index: 60;
            transform: ${
              isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)"
            };
            transition: transform 0.3s ease-in-out;
            background-color: var(--white);
            border-right: 1px solid #e1e1e1;
          }
          
          .sidebar-header {
            border-color: #e1e1e1;
          }
          
          .sidebar-title {
            color: var(--main-color) !important;
          }
          
          .sidebar-email {
            color: #D6D3D1;
          }
          
          .sidebar-menu-item:not([style*="background-color: var(--main-color)"]) {
            color: #D6D3D1 !important;
          }
          
          .sidebar-menu-item:hover:not([style*="background-color: var(--main-color)"]) {
            background-color: #f9fafb;
          }
          
          .sidebar-footer {
            border-color: #e1e1e1;
          }
          
          .sidebar-logout {
            color: #D6D3D1;
          }
          
          .sidebar-logout:hover {
            background-color: #e1e1e1;
          }
          
          .sidebar-email {
            color: var(--black) !important;
          }
          
          .sidebar-menu-item:not([style*="background-color: var(--main-color)"]) {
            color: var(--black) !important;
          }
          
          .sidebar-logout {
            color: var(--black) !important;
          }
          
          .mobile-subscription-none {
            background-color: #f9fafb !important;
            color: var(--black) !important;
          }
        }
        
        /* 모바일 중형: 451px ~ 767px - 화이트 배경, 75% 화면 */
        @media (min-width: 451px) and (max-width: 767px) {
          .sidebar-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 75%;
            max-width: 20rem;
            height: 100vh;
            z-index: 60;
            transform: ${
              isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)"
            };
            transition: transform 0.3s ease-in-out;
            background-color: var(--white);
            border-right: 1px solid #e1e1e1;
          }
          
          .sidebar-header {
            border-color: #e1e1e1;
          }
          
          .sidebar-title {
            color: var(--main-color) !important;
          }
          
          .sidebar-email {
            color: #D6D3D1;
          }
          
          .sidebar-menu-item:not([style*="background-color: var(--main-color)"]) {
            color: #D6D3D1 !important;
          }
          
          .sidebar-menu-item:hover:not([style*="background-color: var(--main-color)"]) {
            background-color: #f9fafb;
          }
          
          .sidebar-footer {
            border-color: #e1e1e1;
          }
          
          .sidebar-logout {
            color: #D6D3D1;
          }
          
          .sidebar-logout:hover {
            background-color: #e1e1e1;
          }
          
          .sidebar-email {
            color: var(--black) !important;
          }
          
          .sidebar-menu-item:not([style*="background-color: var(--main-color)"]) {
            color: var(--black) !important;
          }
          
          .sidebar-logout {
            color: var(--black) !important;
          }
          
          .mobile-subscription-none {
            background-color: #f9fafb !important;
            color: var(--black) !important;
          }
        }
        
        /* 태블릿: 768px ~ 1023px - 블랙 배경, 18rem 고정 */
        @media (min-width: 768px) and (max-width: 1023px) {
          .sidebar-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 18rem;
            height: 100vh;
            z-index: 10;
            background-color: var(--black);
            border-right: 1px solid #71717B;
          }
          
          .sidebar-header {
            border-color: #71717B;
          }
          
          .sidebar-title {
            color: var(--main-color) !important;
          }
          
          .sidebar-email {
            color: #D6D3D1;
          }
          
          .sidebar-menu-item:not([style*="background-color: var(--main-color)"]) {
            color: #D6D3D1 !important;
          }
          
          .sidebar-menu-item:hover:not([style*="background-color: var(--main-color)"]) {
            background-color: #1a1a1a;
          }
          
          .sidebar-footer {
            border-color: #71717B;
          }
          
          .sidebar-logout {
            color: #D6D3D1;
          }
          
          .sidebar-logout:hover {
            background-color: #1a1a1a;
          }
        }
        
        /* 데스크톱: 1024px 이상 - 고정 사이드바, 16rem */
        @media (min-width: 1024px) {
          .sidebar-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 16rem;
            height: 100vh;
            z-index: 50;
            transform: translateX(0);
            background-color: var(--black);
            border-right: 1px solid #71717B;
          }
          
          .sidebar-header {
            border-color: #71717B;
          }
          
          .sidebar-title {
            color: var(--main-color) !important;
          }
          
          .sidebar-email {
            color: #D6D3D1;
          }
          
          .sidebar-menu-item:not([style*="background-color: var(--main-color)"]) {
            color: #D6D3D1 !important;
          }
          
          .sidebar-menu-item:hover:not([style*="background-color: var(--main-color)"]) {
            background-color: #1a1a1a;
          }
          
          .sidebar-footer {
            border-color: #71717B;
          }
          
          .sidebar-logout {
            color: #D6D3D1;
          }
          
          .sidebar-logout:hover {
            background-color: #1a1a1a;
          }
        }
      `}</style>
    </>
  );
}
