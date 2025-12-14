import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps = {}) {
  const [openDialog, setOpenDialog] = useState<'terms' | 'privacy' | 'cookies' | null>(null);

  const handleLinkClick = (page: 'terms' | 'privacy' | 'cookies') => {
    setOpenDialog(page);
  };

  return (
    <>
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

      {/* 이용약관 Dialog */}
      <Dialog open={openDialog === 'terms'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">이용약관</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="prose prose-sm max-w-none">
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">제1조 (목적)</h3>
                <p className="text-sm text-gray-700">
                  본 약관은 개발견적메이커(이하 "서비스")가 제공하는 견적서 생성 및 관리 서비스의 이용과 관련하여 
                  회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">제2조 (정의)</h3>
                <p className="text-sm text-gray-700 mb-2">
                  본 약관에서 사용하는 용어의 정의는 다음과 같습니다:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>"서비스"란 개발견적메이커가 제공하는 견적서 생성, 관리, PDF 다운로드 등의 모든 서비스를 의미합니다.</li>
                  <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                  <li>"회원"이란 서비스에 접속하여 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 자를 의미합니다.</li>
                  <li>"견적서"란 회원이 서비스를 통해 생성한 개발 프로젝트 견적 문서를 의미합니다.</li>
                </ul>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">제3조 (약관의 효력 및 변경)</h3>
                <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
                  <li>본 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이 발생합니다.</li>
                  <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위 내에서 본 약관을 변경할 수 있습니다.</li>
                  <li>약관이 변경되는 경우 회사는 변경사항을 시행일자 7일 전부터 서비스 내 공지사항을 통해 공지합니다.</li>
                  <li>이용자가 변경된 약관에 동의하지 않는 경우, 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
                </ol>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">제4조 (회원가입)</h3>
                <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
                  <li>이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</li>
                  <li>회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                      <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                      <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
                    </ul>
                  </li>
                </ol>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">제5조 (서비스의 제공 및 변경)</h3>
                <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
                  <li>회사는 다음과 같은 서비스를 제공합니다:
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>견적서 생성 및 관리</li>
                      <li>고객 정보 관리</li>
                      <li>매출 통계 및 분석</li>
                      <li>PDF 다운로드</li>
                      <li>기타 회사가 추가 개발하거나 다른 회사와의 제휴 계약 등을 통해 회원에게 제공하는 일체의 서비스</li>
                    </ul>
                  </li>
                  <li>회사는 상당한 이유가 있는 경우에 운영상, 기술상의 필요에 따라 제공하고 있는 서비스를 변경할 수 있습니다.</li>
                </ol>
              </section>

              <section className="mb-6 pt-4 border-t">
                <p className="text-xs text-gray-600">
                  <strong>시행일:</strong> 본 약관은 2025년 1월 1일부터 시행됩니다.
                </p>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* 개인정보보호정책 Dialog */}
      <Dialog open={openDialog === 'privacy'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">개인정보보호정책</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="prose prose-sm max-w-none">
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">1. 개인정보의 수집 및 이용 목적</h3>
                <p className="text-sm text-gray-700 mb-2">
                  개발견적메이커는 다음의 목적을 위하여 개인정보를 처리합니다:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>회원 가입 및 관리</li>
                  <li>서비스 제공 및 개선</li>
                  <li>견적서 생성 및 관리</li>
                  <li>고객 문의 응대</li>
                </ul>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">2. 수집하는 개인정보 항목</h3>
                <p className="text-sm text-gray-700 mb-2">필수 항목:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>이메일 주소</li>
                  <li>비밀번호 (암호화 저장)</li>
                  <li>회사명 (선택)</li>
                </ul>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">3. 개인정보의 보유 및 이용 기간</h3>
                <p className="text-sm text-gray-700">
                  회원 탈퇴 시까지 보유하며, 탈퇴 후 즉시 파기합니다.
                  단, 관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관합니다.
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">4. 개인정보의 제3자 제공</h3>
                <p className="text-sm text-gray-700">
                  회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
                </p>
              </section>

              <section className="mb-6 pt-4 border-t">
                <p className="text-xs text-gray-600">
                  <strong>시행일:</strong> 본 정책은 2025년 1월 1일부터 시행됩니다.
                </p>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* 쿠키설정 Dialog */}
      <Dialog open={openDialog === 'cookies'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">쿠키설정</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="prose prose-sm max-w-none">
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">쿠키란?</h3>
                <p className="text-sm text-gray-700">
                  쿠키는 웹사이트가 귀하의 컴퓨터나 모바일 기기에 저장하는 작은 텍스트 파일입니다.
                  쿠키를 통해 웹사이트는 귀하의 방문 정보를 기억할 수 있습니다.
                </p>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">사용하는 쿠키</h3>
                <p className="text-sm text-gray-700 mb-2">
                  개발견적메이커는 다음과 같은 쿠키를 사용합니다:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li><strong>필수 쿠키:</strong> 로그인 상태 유지 및 보안을 위해 필요합니다.</li>
                  <li><strong>기능 쿠키:</strong> 사용자 설정 및 선호도를 기억합니다.</li>
                  <li><strong>분석 쿠키:</strong> 서비스 개선을 위한 사용 통계를 수집합니다.</li>
                </ul>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">쿠키 관리</h3>
                <p className="text-sm text-gray-700">
                  대부분의 웹 브라우저는 쿠키를 자동으로 수락하지만, 브라우저 설정을 통해 쿠키를 거부하거나 삭제할 수 있습니다.
                  단, 쿠키를 거부할 경우 일부 서비스 이용에 제한이 있을 수 있습니다.
                </p>
              </section>

              <section className="mb-6 pt-4 border-t">
                <p className="text-xs text-gray-600">
                  <strong>최종 업데이트:</strong> 2025년 1월 1일
                </p>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
