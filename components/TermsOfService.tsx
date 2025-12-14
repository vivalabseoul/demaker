import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface TermsOfServiceProps {
  onBack?: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
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

        <h1 className="text-4xl font-bold mb-8 text-gray-900">이용약관</h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제1조 (목적)</h2>
            <p className="text-gray-700 leading-relaxed">
              본 약관은 개발견적메이커(이하 "서비스")가 제공하는 견적서 생성 및 관리 서비스의 이용과 관련하여 
              회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제2조 (정의)</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              본 약관에서 사용하는 용어의 정의는 다음과 같습니다:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>"서비스"란 개발견적메이커가 제공하는 견적서 생성, 관리, PDF 다운로드 등의 모든 서비스를 의미합니다.</li>
              <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
              <li>"회원"이란 서비스에 접속하여 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 자를 의미합니다.</li>
              <li>"견적서"란 회원이 서비스를 통해 생성한 개발 프로젝트 견적 문서를 의미합니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제3조 (약관의 효력 및 변경)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>본 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이 발생합니다.</li>
              <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위 내에서 본 약관을 변경할 수 있습니다.</li>
              <li>약관이 변경되는 경우 회사는 변경사항을 시행일자 7일 전부터 서비스 내 공지사항을 통해 공지합니다.</li>
              <li>이용자가 변경된 약관에 동의하지 않는 경우, 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제4조 (회원가입)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</li>
              <li>회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                  <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                  <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제5조 (서비스의 제공 및 변경)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>회사는 다음과 같은 서비스를 제공합니다:
                <ul className="list-disc pl-6 mt-2 space-y-1">
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

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제6조 (서비스의 중단)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
              <li>회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 회사에 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제7조 (회원의 의무)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>회원은 다음 행위를 하여서는 안 됩니다:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>신청 또는 변경 시 허위내용의 등록</li>
                  <li>타인의 정보 도용</li>
                  <li>회사가 게시한 정보의 변경</li>
                  <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                  <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                  <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                  <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제8조 (저작권의 귀속 및 이용제한)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.</li>
              <li>이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.</li>
              <li>회원이 서비스 내에 게시한 게시물의 저작권은 해당 게시물의 저작자에게 귀속됩니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제9조 (분쟁해결)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.</li>
              <li>회사는 이용자로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다. 다만, 신속한 처리가 곤란한 경우에는 이용자에게 그 사유와 처리일정을 즉시 통보해 드립니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">제10조 (재판권 및 준거법)</h2>
            <p className="text-gray-700 leading-relaxed">
              본 약관에 명시되지 않은 사항은 전기통신사업법 등 관계법령과 상관습에 따릅니다. 
              서비스 이용으로 발생한 분쟁에 대해 소송이 제기되는 경우 대한민국 법원을 관할 법원으로 합니다.
            </p>
          </section>

          <section className="mb-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>시행일:</strong> 본 약관은 2025년 1월 1일부터 시행됩니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
