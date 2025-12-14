import { useState } from "react";
import { ArrowLeft, Cookie, Shield, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

interface CookieSettingsProps {
  onBack?: () => void;
}

export function CookieSettings({ onBack }: CookieSettingsProps) {
  const [essentialCookies, setEssentialCookies] = useState(true);
  const [analyticsCookies, setAnalyticsCookies] = useState(true);
  const [marketingCookies, setMarketingCookies] = useState(false);

  const handleSaveSettings = () => {
    // 쿠키 설정을 로컬 스토리지에 저장
    localStorage.setItem('cookieSettings', JSON.stringify({
      essential: essentialCookies,
      analytics: analyticsCookies,
      marketing: marketingCookies,
      timestamp: new Date().toISOString()
    }));
    
    alert('쿠키 설정이 저장되었습니다.');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로 가기
          </Button>
        )}

        <div className="flex items-center gap-3 mb-8">
          <Cookie className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">쿠키 설정</h1>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <p className="text-gray-700 leading-relaxed">
              개발견적메이커는 웹사이트의 기능을 향상시키고 사용자 경험을 개선하기 위해 쿠키를 사용합니다. 
              아래에서 각 쿠키 유형에 대한 설정을 관리할 수 있습니다.
            </p>
          </section>

          {/* 필수 쿠키 */}
          <section className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-green-600" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">필수 쿠키</h2>
                  <p className="text-sm text-gray-600">이 쿠키는 웹사이트의 기본 기능을 위해 필요합니다.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="essential"
                  checked={essentialCookies}
                  disabled
                  className="opacity-50"
                />
                <Label htmlFor="essential" className="text-sm text-gray-500">항상 활성화</Label>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-gray-700">
              <p><strong>용도:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>사용자 인증 및 세션 유지</li>
                <li>보안 기능 제공</li>
                <li>사이트 탐색 및 기본 기능 지원</li>
              </ul>
              <p className="mt-3"><strong>보관 기간:</strong> 세션 종료 시 또는 최대 30일</p>
            </div>
          </section>

          {/* 분석 쿠키 */}
          <section className="mb-8 p-6 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">분석 쿠키</h2>
                  <p className="text-sm text-gray-600">사이트 사용 방식을 이해하고 개선하는 데 도움이 됩니다.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="analytics"
                  checked={analyticsCookies}
                  onCheckedChange={setAnalyticsCookies}
                />
                <Label htmlFor="analytics" className="text-sm">
                  {analyticsCookies ? '활성화' : '비활성화'}
                </Label>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-gray-700">
              <p><strong>용도:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>방문자 수 및 트래픽 소스 분석</li>
                <li>페이지 성능 모니터링</li>
                <li>사용자 행동 패턴 이해</li>
                <li>서비스 개선을 위한 통계 수집</li>
              </ul>
              <p className="mt-3"><strong>사용 서비스:</strong> Google Analytics (익명화 처리)</p>
              <p><strong>보관 기간:</strong> 최대 2년</p>
            </div>
          </section>

          {/* 마케팅 쿠키 */}
          <section className="mb-8 p-6 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Cookie className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">마케팅 쿠키</h2>
                  <p className="text-sm text-gray-600">맞춤형 광고 및 콘텐츠를 제공하는 데 사용됩니다.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="marketing"
                  checked={marketingCookies}
                  onCheckedChange={setMarketingCookies}
                />
                <Label htmlFor="marketing" className="text-sm">
                  {marketingCookies ? '활성화' : '비활성화'}
                </Label>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-gray-700">
              <p><strong>용도:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>관심사 기반 맞춤 광고 표시</li>
                <li>광고 효과 측정</li>
                <li>소셜 미디어 기능 제공</li>
                <li>리타게팅 캠페인</li>
              </ul>
              <p className="mt-3"><strong>사용 서비스:</strong> Google Ads, Facebook Pixel</p>
              <p><strong>보관 기간:</strong> 최대 1년</p>
            </div>
          </section>

          {/* 쿠키 정보 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">쿠키란 무엇인가요?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              쿠키는 웹사이트를 방문할 때 브라우저에 저장되는 작은 텍스트 파일입니다. 
              쿠키는 웹사이트가 사용자의 방문을 기억하고, 사용자 경험을 개선하며, 
              사이트 성능을 분석하는 데 도움을 줍니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">쿠키 관리 방법</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              대부분의 웹 브라우저는 쿠키를 자동으로 수락하도록 설정되어 있습니다. 
              브라우저 설정을 통해 쿠키를 거부하거나 쿠키가 설정될 때 알림을 받도록 선택할 수 있습니다.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-900 font-semibold mb-2">브라우저별 쿠키 설정:</p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-blue-800">
                <li><strong>Chrome:</strong> 설정 → 개인정보 및 보안 → 쿠키 및 기타 사이트 데이터</li>
                <li><strong>Firefox:</strong> 설정 → 개인정보 및 보안 → 쿠키 및 사이트 데이터</li>
                <li><strong>Safari:</strong> 환경설정 → 개인정보 → 쿠키 및 웹사이트 데이터</li>
                <li><strong>Edge:</strong> 설정 → 쿠키 및 사이트 권한 → 쿠키 및 사이트 데이터 관리</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">쿠키 사용 목록</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">쿠키 이름</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">유형</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">목적</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">보관 기간</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">session_id</td>
                    <td className="border border-gray-300 px-4 py-2">필수</td>
                    <td className="border border-gray-300 px-4 py-2">사용자 세션 유지</td>
                    <td className="border border-gray-300 px-4 py-2">세션</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">auth_token</td>
                    <td className="border border-gray-300 px-4 py-2">필수</td>
                    <td className="border border-gray-300 px-4 py-2">인증 정보 저장</td>
                    <td className="border border-gray-300 px-4 py-2">30일</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">_ga</td>
                    <td className="border border-gray-300 px-4 py-2">분석</td>
                    <td className="border border-gray-300 px-4 py-2">Google Analytics 사용자 구분</td>
                    <td className="border border-gray-300 px-4 py-2">2년</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">_gid</td>
                    <td className="border border-gray-300 px-4 py-2">분석</td>
                    <td className="border border-gray-300 px-4 py-2">Google Analytics 사용자 구분</td>
                    <td className="border border-gray-300 px-4 py-2">24시간</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">_fbp</td>
                    <td className="border border-gray-300 px-4 py-2">마케팅</td>
                    <td className="border border-gray-300 px-4 py-2">Facebook 광고 추적</td>
                    <td className="border border-gray-300 px-4 py-2">3개월</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 저장 버튼 */}
          <div className="flex justify-center pt-6">
            <Button
              onClick={handleSaveSettings}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              설정 저장
            </Button>
          </div>

          <section className="mb-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>문의:</strong> 쿠키 정책에 대한 질문이 있으시면 vivalabseoul@gmail.com으로 연락주시기 바랍니다.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <strong>최종 업데이트:</strong> 2025년 1월 1일
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
