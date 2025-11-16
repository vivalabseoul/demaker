import { useState, useEffect } from "react";
import { Save, FileText, Eye, Printer } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { getCustomerNotice, saveCustomerNotice, CustomerNotice, getOurCompany } from "../utils/supabaseStore";
import { generateCustomerNoticePDF, generateCustomerNoticeHTML } from "../utils/pdfGenerator";
import { toast } from "sonner";

export function CustomerNoticePage() {
  const [notice, setNotice] = useState<CustomerNotice>({
    refundPolicy: "",
    terms: "",
    serviceScope: "",
    deliveryPolicy: "",
    paymentSchedule: "",
    otherTerms: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHTML, setPreviewHTML] = useState<string>("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // 로딩바 애니메이션
  useEffect(() => {
    if (loading) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      setLoadingProgress(100);
      setTimeout(() => setLoadingProgress(0), 300);
    }
  }, [loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const loadedNotice = await getCustomerNotice();
      
      if (loadedNotice) {
        setNotice(loadedNotice);
      } else {
        // 기본값 설정
        setNotice({
          refundPolicy: `1. 선금 정책
계약금액 500만원 이하의 경우
- 계약금액의 50% 이상을 선금으로 입금하셔야 제작을 시작합니다.
- 선금 입금 확인 후 프로젝트가 정식으로 시작됩니다.

2. 환불불가 규정
2.1 기본 원칙
제작 시작 후 발생하는 비용은 다음과 같이 환불되지 않습니다.

2.2 환불불가 범위
- 제작에 소요되는 기간만큼의 비용은 환불 불가합니다.
- 입금일로부터 실제 제작 기간(착수일~완료일)에 해당하는 비용은 취소·변경·환불 대상이 아닙니다.
- 프로젝트 진행 중 발주자의 요청에 의한 수정·보완으로 소요된 시간과 비용은 환불되지 않습니다.

2.3 구체적 사항
- 웹사이트 제작 시작 후 계약 취소 시 제작 기간에 해당하는 비용은 반환되지 않습니다.
- 부분 취소 또는 작업 중단 요청 시에도 진행된 작업량에 대한 비용은 환불되지 않습니다.
- 기술 문제, 요구사항 변경 등으로 인한 일정 연장 시 추가 비용이 발생할 수 있으며, 이는 발주자가 부담합니다.

3. 환불 가능 경우
다음의 경우에만 환불 대상이 될 수 있습니다:
- 당사의 귀책사유로 계약이 해지되는 경우
- 천재지변 등 불가항력적 사유로 계약 이행이 불가능한 경우
- 법령에 따라 환불이 필수인 경우
위의 경우에도 진행된 작업에 대한 비용은 차감됩니다.`,
          terms: `4. 계약 취소 및 변경
- 계약 체결 전: 계약금 전액 환불 가능
- 계약 체결 후 제작 시작 전: 선금액의 10% 수수료 차감 후 환불 가능
- 제작 시작 후: 진행 상황에 따른 작업비 차감 후 환불(제작 기간 비용은 환불 불가)

8. 기타 사항
- 본 조항은 을지로 웹 제작 서비스 표준 계약조건입니다.
- 개별 프로젝트 특성에 따라 조정될 수 있으며, 이는 계약서에 명시됩니다.
- 분쟁 발생 시 상호 협의로 해결하며, 합의 불가 시 법적 절차를 따릅니다.
- 고객은 계약 전 본 조항을 충분히 이해하고 동의한 것으로 간주됩니다.`,
          serviceScope: `5. 서비스 범위
포함 사항
- 웹사이트 기본 디자인 및 개발
- 제1회 수정·보완(계약 내용 범위)
- 기본 기능 구현 및 테스트
- 프로젝트 미팅 3회 포함(사업 관련 업무 미팅)

미팅 관련 비용 정책
- 미팅 진행 방식: 기본적으로 온라인으로 진행됩니다
- 오프라인 미팅: 상호 합의 시 오프라인 미팅 가능(추가 비용 발생 가능)
- 사업 관련 업무 미팅: 소요 시간만큼 제작 기간에서 차감됩니다(추가비용 없음)
- 포함된 미팅: 프로젝트 기간 중 3회까지 무료 제공
- 초과 미팅: 4회차부터는 회당 추가비용이 발생합니다
- 업무외 미팅: 사업과 무관한 내용의 미팅은 추가비용이 발생합니다

불포함 사항
- 계약 범위 외 추가 작업
- 고객의 요청에 따른 수정·변경 작업
- 3회 초과 미팅 비용
- 업무외 미팅 비용
- 유지보수 및 사후 관리 서비스(별도 계약)
- 호스팅, 도메인 등 외부 서비스`,
          deliveryPolicy: `6. 납기일 관련
- 합의된 납기일은 예정일이며, 고객의 자료 제공 지연, 수정 요청 등으로 인해 변동될 수 있습니다.
- 최대 14일 범위 내에서 일정 조정이 가능합니다.
- 이를 초과하는 경우 추가 비용이 발생할 수 있습니다.`,
          paymentSchedule: `7. 결제 방법 및 일정
구분 | 비율 | 시기
계약금(선금) | 50% 이상 | 계약 체결 후 3일 이내
기성금(선택) | - | 진행 과정 중 협의
잔금 | 나머지 | 완료 및 검수 후`,
          otherTerms: `문의 및 상담: 계약 전 불명확한 사항은 반드시 사전에 상담하시기 바랍니다.`,
        });
      }
    } catch (error: any) {
      console.error("데이터 로드 오류:", error);
      toast.error("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleNoticeChange = (field: keyof CustomerNotice, value: string) => {
    setNotice({ ...notice, [field]: value });
  };

  const handleSaveNotice = async () => {
    try {
      setSaving(true);
      await saveCustomerNotice(notice);
      toast.success("고객 안내문구가 저장되었습니다.");
    } catch (error: any) {
      console.error("저장 오류:", error);
      toast.error("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewPDF = async () => {
    setPreviewLoading(true);
    try {
      // 고객 안내문구가 있는지 확인
      const hasContent =
        (notice.refundPolicy && notice.refundPolicy.trim()) ||
        (notice.terms && notice.terms.trim()) ||
        (notice.serviceScope && notice.serviceScope.trim()) ||
        (notice.deliveryPolicy && notice.deliveryPolicy.trim()) ||
        (notice.paymentSchedule && notice.paymentSchedule.trim()) ||
        (notice.otherTerms && notice.otherTerms.trim());

      if (!hasContent) {
        toast.error("고객 안내문구를 먼저 입력해주세요.");
        return;
      }

      // 고객 안내문구만을 위한 HTML 생성
      const html = await generateCustomerNoticeHTML(notice);
      
      setPreviewHTML(html);
      setPreviewOpen(true);
    } catch (error: any) {
      console.error("미리보기 오류:", error);
      toast.error(`미리보기를 생성하는 중 오류가 발생했습니다: ${error?.message || "알 수 없는 오류"}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePrintPreview = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(previewHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      toast.error("팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.");
    }
  };

  const handlePrintPDF = async () => {
    setPdfLoading(true);
    try {
      // 고객 안내문구가 있는지 확인
      const hasContent =
        (notice.refundPolicy && notice.refundPolicy.trim()) ||
        (notice.terms && notice.terms.trim()) ||
        (notice.serviceScope && notice.serviceScope.trim()) ||
        (notice.deliveryPolicy && notice.deliveryPolicy.trim()) ||
        (notice.paymentSchedule && notice.paymentSchedule.trim()) ||
        (notice.otherTerms && notice.otherTerms.trim());

      if (!hasContent) {
        toast.error("고객 안내문구를 먼저 입력해주세요.");
        return;
      }

      // 고객 안내문구만을 위한 HTML 생성
      const html = await generateCustomerNoticeHTML(notice);
      
      // 새 창에서 인쇄
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      } else {
        toast.error("팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.");
      }
    } catch (error: any) {
      console.error("인쇄 중 오류 발생:", error);
      const errorMessage =
        error?.message || error?.toString() || "알 수 없는 오류";
      toast.error(`인쇄 중 오류가 발생했습니다: ${errorMessage}`);
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Progress value={loadingProgress} className="h-2" />
        </div>
        <p className="text-center text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">고객 안내문구</h1>
        <p className="text-gray-600">견적서에 포함될 고객 안내문구를 관리합니다.</p>
      </div>

      <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>환불 정책</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="refundPolicy">환불 불가 조항</Label>
              <Textarea
                id="refundPolicy"
                value={notice.refundPolicy}
                onChange={(e) => handleNoticeChange("refundPolicy", e.target.value)}
                rows={15}
                className="mt-2 font-mono text-sm"
                placeholder="환불 정책을 입력하세요..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>계약 조항</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="terms">계약 취소 및 변경, 기타 사항</Label>
              <Textarea
                id="terms"
                value={notice.terms}
                onChange={(e) => handleNoticeChange("terms", e.target.value)}
                rows={10}
                className="mt-2 font-mono text-sm"
                placeholder="계약 조항을 입력하세요..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>서비스 범위</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="serviceScope">포함/불포함 사항</Label>
              <Textarea
                id="serviceScope"
                value={notice.serviceScope}
                onChange={(e) => handleNoticeChange("serviceScope", e.target.value)}
                rows={10}
                className="mt-2 font-mono text-sm"
                placeholder="서비스 범위를 입력하세요..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>납기일 정책</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="deliveryPolicy">납기일 관련 안내</Label>
              <Textarea
                id="deliveryPolicy"
                value={notice.deliveryPolicy}
                onChange={(e) => handleNoticeChange("deliveryPolicy", e.target.value)}
                rows={5}
                className="mt-2 font-mono text-sm"
                placeholder="납기일 정책을 입력하세요..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>결제 일정</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="paymentSchedule">결제 방법 및 일정</Label>
              <Textarea
                id="paymentSchedule"
                value={notice.paymentSchedule}
                onChange={(e) => handleNoticeChange("paymentSchedule", e.target.value)}
                rows={5}
                className="mt-2 font-mono text-sm"
                placeholder="결제 일정을 입력하세요..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>기타 안내</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="otherTerms">기타 사항</Label>
              <Textarea
                id="otherTerms"
                value={notice.otherTerms}
                onChange={(e) => handleNoticeChange("otherTerms", e.target.value)}
                rows={3}
                className="mt-2 font-mono text-sm"
                placeholder="기타 안내사항을 입력하세요..."
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button 
              onClick={handlePreviewPDF} 
              disabled={saving || previewLoading} 
              size="lg"
              variant="outline"
              className="gap-2 font-bold text-lg"
            >
              <Eye className="w-5 h-5" />
              {previewLoading ? "생성 중..." : "인쇄 미리보기"}
            </Button>
            <Button 
              onClick={handlePrintPDF} 
              disabled={saving || pdfLoading} 
              size="lg"
              variant="outline"
              className="gap-2 font-bold text-lg"
            >
              <Printer className="w-5 h-5" />
              {pdfLoading ? "생성 중..." : "일반 인쇄"}
            </Button>
            <Button 
              onClick={handleSaveNotice} 
              disabled={saving} 
              size="lg"
              className="gap-2 font-bold text-lg"
              style={{ backgroundColor: 'var(--main-color)', color: '#ffffff' }}
            >
              <Save className="w-5 h-5" />
              {saving ? "저장 중..." : "안내문구 저장"}
            </Button>
          </div>
      </div>

      {/* 미리보기 Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent 
          className="max-w-[90vw] md:max-w-[210mm] max-h-[90vh] overflow-hidden p-0"
          style={{
            width: "210mm",
            maxWidth: "90vw",
            backgroundColor: "white",
          }}
        >
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span>고객 안내문구 미리보기</span>
              <div className="flex gap-2">
                <Button
                  onClick={handlePrintPreview}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <Printer className="w-4 h-4" />
                  인쇄
                </Button>
                <Button
                  onClick={() => setPreviewOpen(false)}
                  size="sm"
                  variant="outline"
                >
                  닫기
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[calc(90vh-80px)]">
            {previewHTML && (
              <iframe
                srcDoc={previewHTML}
                className="w-full border-0"
                style={{ minHeight: "800px" }}
                title="견적서 미리보기"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

