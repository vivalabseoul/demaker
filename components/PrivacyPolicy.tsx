import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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

        <h1 className="text-4xl font-bold mb-8 text-gray-900">개인정보 처리방침</h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <p className="text-gray-700 leading-relaxed mb-4">
              개발견적메이커(이하 "회사")는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 
              관련 법령을 준수하고 있습니다. 회사는 개인정보처리방침을 통하여 이용자가 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 
              개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. 개인정보의 수집 및 이용 목적</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 
              이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>회원 가입 및 관리:</strong> 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지</li>
              <li><strong>서비스 제공:</strong> 견적서 생성 및 관리, 고객 정보 관리, 매출 통계 제공, PDF 생성 및 다운로드</li>
              <li><strong>마케팅 및 광고:</strong> 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공</li>
              <li><strong>고충처리:</strong> 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. 수집하는 개인정보의 항목</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              회사는 회원가입, 서비스 이용 등을 위해 아래와 같은 개인정보를 수집하고 있습니다:
            </p>
            
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">필수항목</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>이메일 주소</li>
                <li>이름</li>
                <li>비밀번호 (암호화하여 저장)</li>
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">선택항목</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>회사명, 대표자명, 사업자등록번호</li>
                <li>주소, 전화번호</li>
                <li>고객사 정보 (견적서 생성 시)</li>
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">자동 수집 정보</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보</li>
                <li>기기 정보 (OS, 브라우저 종류)</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. 개인정보의 처리 및 보유 기간</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>회사는 법령에 따른 개인정보 보유·이용기간 또는 이용자로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</li>
              <li>각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>회원 정보:</strong> 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행중인 경우에는 해당 수사·조사 종료 시까지)</li>
                  <li><strong>견적서 데이터:</strong> 회원 탈퇴 후 30일까지 (복구 요청 대비)</li>
                  <li><strong>결제 정보:</strong> 전자상거래법에 따라 5년간 보관</li>
                  <li><strong>접속 로그:</strong> 통신비밀보호법에 따라 3개월간 보관</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. 개인정보의 제3자 제공</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. 개인정보 처리의 위탁</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              회사는 서비스 향상을 위해서 아래와 같이 개인정보를 위탁하고 있으며, 관계 법령에 따라 위탁계약 시 개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정하고 있습니다.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 mt-4">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">수탁업체</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">위탁업무 내용</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Supabase</td>
                    <td className="border border-gray-300 px-4 py-2">데이터베이스 호스팅 및 관리</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Vercel</td>
                    <td className="border border-gray-300 px-4 py-2">웹 호스팅 서비스</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. 이용자의 권리·의무 및 행사방법</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>이용자는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>개인정보 열람 요구</li>
                  <li>오류 등이 있을 경우 정정 요구</li>
                  <li>삭제 요구</li>
                  <li>처리정지 요구</li>
                </ul>
              </li>
              <li>제1항에 따른 권리 행사는 회사에 대해 서면, 전화, 전자우편 등을 통하여 하실 수 있으며 회사는 이에 대해 지체없이 조치하겠습니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. 개인정보의 파기</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</li>
              <li>개인정보 파기의 절차 및 방법은 다음과 같습니다:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>파기절차:</strong> 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져(종이의 경우 별도의 서류) 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.</li>
                  <li><strong>파기방법:</strong> 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다. 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. 개인정보 보호책임자</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="text-gray-700"><strong>개인정보 보호책임자</strong></p>
              <ul className="list-none space-y-1 text-gray-700 mt-2">
                <li>이메일: vivalabseoul@gmail.com</li>
                <li>회사명: Moonga Corp.</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">9. 개인정보 처리방침 변경</h2>
            <p className="text-gray-700 leading-relaxed">
              이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 
              변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>

          <section className="mb-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>시행일:</strong> 본 방침은 2025년 1월 1일부터 시행됩니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
