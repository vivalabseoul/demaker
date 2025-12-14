interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps = {}) {
  const handleLinkClick = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
    // 페이지 최상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-[#71717B] py-8 mt-auto" style={{ backgroundColor: '#000000' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* 법적 페이지 링크 */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <button
            onClick={() => handleLinkClick('terms')}
            className="text-sm hover:underline transition-colors"
            style={{ color: '#D6D3D1' }}
          >
            이용약관
          </button>
          <span className="text-sm" style={{ color: '#71717B' }}>|</span>
          <button
            onClick={() => handleLinkClick('privacy')}
            className="text-sm hover:underline transition-colors"
            style={{ color: '#D6D3D1' }}
          >
            개인정보보호정책
          </button>
          <span className="text-sm" style={{ color: '#71717B' }}>|</span>
          <button
            onClick={() => handleLinkClick('cookies')}
            className="text-sm hover:underline transition-colors"
            style={{ color: '#D6D3D1' }}
          >
            쿠키설정
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:justify-center md:items-center md:gap-6 text-center space-y-1 md:space-y-0 mb-6" style={{ color: '#D6D3D1' }}>
          <p className="text-sm">
            Business NB : 274-19-02203
          </p>
          <p className="text-sm hidden md:block">|</p>
          <p className="text-sm">
            Company name : Moonga Corp.
          </p>
          <p className="text-sm hidden md:block">|</p>
          <p className="text-sm">
            Contact : vivalabseoul@gmail.com
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:justify-center md:items-center md:gap-3 text-center space-y-1 md:space-y-0">
          <p className="text-sm" style={{ color: '#D6D3D1' }}>
            © 2025 개발견적메이커 VIVALAB SEOUL
          </p>
          <p className="text-xs hidden md:block" style={{ color: '#71717B' }}>|</p>
          <p className="text-xs" style={{ color: '#71717B' }}>
            * vivalabseoul 은 Moonga corp. 의 브랜드입니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
