import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Download,
  Trash2,
  Building2,
  User,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { LoadingOverlay } from "./LoadingOverlay";
import { Quote } from "../types/quote";
import { getQuotes, deleteQuote, formatCurrency, getCustomerNotice, getPaymentInfo, CustomerNotice, BankAccountInfo } from "../utils/supabaseStore";
import { generateQuotePDF, generateQuoteHTML } from "../utils/pdfGenerator";
import { formatDollar, convertToDollar } from "../utils/exchangeRate";
import { toast } from "sonner";

// 숫자를 한글로 변환하는 함수
const convertToKoreanNumber = (num: number): string => {
  const koreanNumbers = [
    "",
    "일",
    "이",
    "삼",
    "사",
    "오",
    "육",
    "칠",
    "팔",
    "구",
  ];
  const units = ["", "십", "백", "천"];
  const bigUnits = ["", "만", "억", "조"];

  if (num === 0) return "영";

  let result = "";
  const numStr = num.toString();
  const numLength = numStr.length;

  // 4자리씩 나누어 처리
  for (let i = 0; i < Math.ceil(numLength / 4); i++) {
    const start = Math.max(0, numLength - (i + 1) * 4);
    const end = numLength - i * 4;
    const fourDigit = parseInt(numStr.slice(start, end));

    if (fourDigit === 0) continue;

    let fourDigitStr = "";
    const fourDigitStrNum = fourDigit.toString().padStart(4, "0");

    // 천의 자리
    if (fourDigitStrNum[0] !== "0") {
      if (fourDigitStrNum[0] !== "1") {
        fourDigitStr += koreanNumbers[parseInt(fourDigitStrNum[0])];
      }
      fourDigitStr += "천";
    }

    // 백의 자리
    if (fourDigitStrNum[1] !== "0") {
      if (fourDigitStrNum[1] !== "1") {
        fourDigitStr += koreanNumbers[parseInt(fourDigitStrNum[1])];
      }
      fourDigitStr += "백";
    }

    // 십의 자리
    if (fourDigitStrNum[2] !== "0") {
      if (fourDigitStrNum[2] !== "1") {
        fourDigitStr += koreanNumbers[parseInt(fourDigitStrNum[2])];
      }
      fourDigitStr += "십";
    }

    // 일의 자리
    if (fourDigitStrNum[3] !== "0") {
      fourDigitStr += koreanNumbers[parseInt(fourDigitStrNum[3])];
    }

    // 큰 단위 추가
    if (i > 0 && bigUnits[i]) {
      fourDigitStr += bigUnits[i];
    }

    result = fourDigitStr + result;
  }

  return result;
};

interface QuoteListProps {
  onEditQuote?: (id: string) => void;
}

export function QuoteList({ onEditQuote }: QuoteListProps = {}) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "company" | "freelancer"
  >("all");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customerNotice, setCustomerNotice] = useState<CustomerNotice | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<BankAccountInfo | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printHTML, setPrintHTML] = useState<string>("");
  const [printQuote, setPrintQuote] = useState<Quote | null>(null);

  useEffect(() => {
    loadQuotes();
  }, []);

  useEffect(() => {
    filterQuotes();
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
  }, [quotes, searchTerm, typeFilter]);

  useEffect(() => {
    if (isDialogOpen) {
      loadCustomerNotice();
    }
  }, [isDialogOpen]);

  const loadCustomerNotice = async () => {
    try {
      const [notice, payment] = await Promise.all([
        getCustomerNotice(),
        getPaymentInfo(),
      ]);
      setCustomerNotice(notice);
      setPaymentInfo(payment);
    } catch (error) {
      console.error("고객 안내문구 로드 오류:", error);
    }
  };

  const loadQuotes = async () => {
    setLoading(true);
    const allQuotes = await getQuotes();
    const sortedQuotes = allQuotes.sort(
      (a, b) =>
        new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );
    setQuotes(sortedQuotes);
    setLoading(false);
  };

  const filterQuotes = () => {
    let filtered = quotes;

    if (typeFilter !== "all") {
      filtered = filtered.filter((q) => q.type === typeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.clientCompany.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuotes(filtered);
  };

  const handleDelete = async (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteQuote(id);
        await loadQuotes();
        toast.success("견적서가 삭제되었습니다.");
      } catch (error) {
        toast.error("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleView = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsDialogOpen(true);
  };

  const handleDownloadPDF = async (quote: Quote) => {
    setPdfLoading(true);
    try {
      // HTML 생성 및 Dialog 표시
      const html = await generateQuoteHTML(quote);
      setPrintHTML(html);
      setPrintQuote(quote);
      setShowPrintPreview(true);
    } catch (error: any) {
      console.error("PDF 생성 중 오류 발생:", error);
      const errorMessage =
        error?.message || error?.toString() || "알 수 없는 오류";
      toast.error(`PDF 생성 중 오류가 발생했습니다: ${errorMessage}`);
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printHTML);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  // 페이징 계산
  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedQuotes = filteredQuotes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1>견적서 목록</h1>
        <p className="mt-2">작성된 견적서를 조회하고 관리하세요.</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="relative w-full">
          <Search
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--gray)" }}
          />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="견적번호 또는 거래처명 검색"
            className="pr-10"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full">
          <Button
            onClick={() => setTypeFilter("all")}
            variant={typeFilter === "all" ? "default" : "outline"}
            className="flex-1"
            style={
              typeFilter === "all"
                ? {
                    backgroundColor: "var(--main-color)",
                    color: "var(--white)",
                  }
                : {}
            }
          >
            전체
          </Button>
          <Button
            onClick={() => setTypeFilter("company")}
            variant={typeFilter === "company" ? "default" : "outline"}
            className="flex-1"
            style={
              typeFilter === "company"
                ? {
                    backgroundColor: "var(--main-color)",
                    color: "var(--white)",
                  }
                : {}
            }
          >
            회사
          </Button>
          <Button
            onClick={() => setTypeFilter("freelancer")}
            variant={typeFilter === "freelancer" ? "default" : "outline"}
            className="flex-1"
            style={
              typeFilter === "freelancer"
                ? {
                    backgroundColor: "var(--main-color)",
                    color: "var(--white)",
                  }
                : {}
            }
          >
            프리랜서
          </Button>
        </div>
      </div>

      {/* 모바일 안내 메시지 */}
      <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200 min-[768px]:hidden">
        <p
          style={{
            color: "var(--main-color)",
            fontSize: "0.875rem",
          }}
        >
          💡 전체 견적서 정보는 태블릿 이상의 화면에서 확인하실 수 있습니다.
        </p>
      </div>

      {/* 모바일 카드 뷰 (767px 이하) */}
      <div className="min-[768px]:hidden space-y-4">
        {paginatedQuotes.map((quote) => (
          <Card key={quote.id} style={{ backgroundColor: "var(--white)" }}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold">{quote.clientCompany.name}</h4>
                  <span
                    className="px-3 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor:
                        quote.type === "company" ? "#dbeafe" : "#d1fae5",
                      color: quote.type === "company" ? "#1e40af" : "#065f46",
                    }}
                  >
                    {quote.type === "company" ? "회사" : "프리랜서"}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm" style={{ color: '#71717B' }}>작성일자</p>
                    <p className="text-sm" style={{ color: '#71717B' }}>{quote.createdDate}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm" style={{ color: '#71717B' }}>견적번호</p>
                    <p className="text-sm" style={{ color: '#71717B' }}>{quote.quoteNumber}</p>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <p className="text-base font-semibold" style={{ color: '#71717B' }}>금액</p>
                    <p className="text-base font-bold" style={{ color: "var(--main-color)" }}>
                      {formatCurrency(quote.totalAmount)}원
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleView(quote)}
                    style={{
                      backgroundColor: 'var(--main-color)',
                      color: '#FFFFFF',
                      borderColor: 'var(--main-color)'
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    보기
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onEditQuote && onEditQuote(quote.id)}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDownloadPDF(quote)}
                    style={{
                      backgroundColor: '#000000',
                      color: '#FFFFFF',
                      borderColor: '#000000'
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    onClick={() => handleDelete(quote.id)}
                    className="transition-colors hover:!bg-[var(--sub-color)]"
                    style={{
                      backgroundColor: "#9ca3af",
                      color: "var(--white)",
                      minWidth: "2.5rem",
                      padding: "0.5rem",
                    }}
                  >
                    <Trash2 className="w-7 h-7" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredQuotes.length === 0 && (
          <div className="text-center py-12">
            <p>견적서가 없습니다.</p>
          </div>
        )}
        
        {/* 모바일 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm" style={{ color: "var(--gray)" }}>
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* 데스크톱/태블릿 테이블 뷰 (768px 이상) */}
      <Card
        style={{ backgroundColor: "var(--white)" }}
        className="max-[767px]:hidden"
      >
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e1e1e1]">
                  <th className="pb-3 text-center">견적번호</th>
                  <th className="pb-3 text-center">거래처</th>
                  <th className="pb-3 text-center">작성일자</th>
                  <th className="pb-3 text-center">유형</th>
                  <th className="pb-3 text-center">금액</th>
                  <th className="pb-3 text-center">작업</th>
                </tr>
              </thead>
              <tbody>
                {paginatedQuotes.map((quote) => (
                  <tr key={quote.id} className="border-b border-[#e1e1e1]">
                    <td className="py-4 text-center text-sm" style={{ color: '#71717B' }}>{quote.quoteNumber}</td>
                    <td className="py-4 text-center">
                      <span className="text-lg font-bold">{quote.clientCompany.name}</span>
                    </td>
                    <td className="py-4 text-center text-sm" style={{ color: '#71717B' }}>{quote.createdDate}</td>
                    <td className="py-4 text-center">
                      <span
                        className="px-3 py-1 rounded-full"
                        style={{
                          backgroundColor:
                            quote.type === "company" ? "#dbeafe" : "#d1fae5",
                          color:
                            quote.type === "company" ? "#1e40af" : "#065f46",
                          fontSize: "0.875rem",
                        }}
                      >
                        {quote.type === "company" ? "회사" : "프리랜서"}
                      </span>
                    </td>
                    <td
                      className="py-4 text-right text-base font-bold"
                      style={{ color: "var(--main-color)" }}
                    >
                      {formatCurrency(quote.totalAmount)}원
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(quote)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditQuote && onEditQuote(quote.id)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPDF(quote)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDelete(quote.id)}
                          className="transition-colors hover:!bg-[var(--sub-color)]"
                          style={{
                            backgroundColor: "#9ca3af",
                            color: "var(--white)",
                            minWidth: "2.5rem",
                            padding: "0.5rem",
                          }}
                        >
                          <Trash2 className="w-7 h-7" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredQuotes.length === 0 && (
              <div className="text-center py-12">
                <p>견적서가 없습니다.</p>
              </div>
            )}
          </div>
          
          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // 페이지 번호 표시 로직 (현재 페이지 주변만 표시)
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      style={{
                        backgroundColor: currentPage === page ? "var(--main-color)" : undefined,
                        color: currentPage === page ? "var(--white)" : undefined,
                      }}
                    >
                      {page}
                    </Button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="px-2">...</span>;
                }
                return null;
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="max-w-[90vw] md:max-w-[210mm] max-h-[90vh] overflow-y-auto"
          style={{
            // A4 size optimized
            width: "210mm",
            maxWidth: "90vw",
            backgroundColor: "white",
            borderColor: "#e1e1e1",
          }}
        >
          {selectedQuote && (
            <>
              <DialogHeader className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pr-0 sm:pr-12">
                  <div>
                    <DialogTitle className="text-xl sm:text-2xl">
                      견적서 상세
                    </DialogTitle>
                    {selectedQuote.projectName && (
                      <p
                        className="mt-2"
                        style={{ fontSize: "1.125rem", fontWeight: 600 }}
                      >
                        {selectedQuote.projectName}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleDownloadPDF(selectedQuote)}
                    style={{
                      backgroundColor: "var(--main-color)",
                      color: "var(--white)",
                    }}
                    className="shrink-0 w-full sm:w-auto"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF 다운로드
                  </Button>
                </div>
              </DialogHeader>

              {/* A4 인쇄용 컨텐츠 */}
              <div className="space-y-6 mt-6 print-content">
                {/* 회사 정보 */}
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 rounded-lg border-2"
                  style={{
                    backgroundColor: "var(--white)",
                    borderColor: "#e1e1e1",
                  }}
                >
                  <div>
                    <div
                      className="mb-4 pb-2 border-b-2"
                      style={{ borderColor: "#e1e1e1" }}
                    >
                      <h4 style={{ color: "var(--black)" }}>공급자</h4>
                    </div>
                    <div className="space-y-2" style={{ fontSize: "0.875rem" }}>
                      <p>
                        <strong>회사명:</strong> {selectedQuote.ourCompany.name}
                      </p>
                      <p>
                        <strong>대표자:</strong>{" "}
                        {selectedQuote.ourCompany.representative}
                      </p>
                      <p>
                        <strong>사업자등록번호:</strong>{" "}
                        {selectedQuote.ourCompany.registrationNumber || '-'}
                      </p>
                      <p>
                        <strong>주소:</strong>{" "}
                        {selectedQuote.ourCompany.address || '-'}
                      </p>
                      <p>
                        <strong>전화번호:</strong>{" "}
                        {selectedQuote.ourCompany.phone}
                      </p>
                      <p>
                        <strong>이메일:</strong>{" "}
                        {selectedQuote.ourCompany.email}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div
                      className="mb-4 pb-2 border-b-2"
                      style={{ borderColor: "#e1e1e1" }}
                    >
                      <h4 style={{ color: "var(--black)" }}>공급받는자</h4>
                    </div>
                    <div className="space-y-2" style={{ fontSize: "0.875rem" }}>
                      <p>
                        <strong>회사명:</strong>{" "}
                        {selectedQuote.clientCompany.name}
                      </p>
                      <p>
                        <strong>대표자:</strong>{" "}
                        {selectedQuote.clientCompany.representative}
                      </p>
                      <p>
                        <strong>사업자등록번호:</strong>{" "}
                        {selectedQuote.clientCompany.registrationNumber || '-'}
                      </p>
                      <p>
                        <strong>주소:</strong>{" "}
                        {selectedQuote.clientCompany.address || '-'}
                      </p>
                      <p>
                        <strong>전화번호:</strong>{" "}
                        {selectedQuote.clientCompany.phone}
                      </p>
                      <p>
                        <strong>이메일:</strong>{" "}
                        {selectedQuote.clientCompany.email || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 기본 정보 */}
                <div
                  className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-lg border"
                  style={{
                    borderColor: "#e1e1e1",
                    backgroundColor: "var(--white)",
                  }}
                >
                  <div>
                    <p style={{ color: "#71717B" }}>견적번호</p>
                    <p className="mt-1">{selectedQuote.quoteNumber}</p>
                  </div>
                  <div>
                    <p style={{ color: "#71717B" }}>작성일자</p>
                    <p className="mt-1">{selectedQuote.createdDate}</p>
                  </div>
                  <div>
                    <p style={{ color: "#71717B" }}>유형</p>
                    <p className="mt-1">
                      <span
                        className="px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: "var(--white)",
                          color: "var(--black)",
                          border: "1px solid var(--black)",
                          fontSize: "0.875rem",
                        }}
                      >
                        {selectedQuote.type === "company" ? "회사" : "프리랜서"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* 견적 항목 */}
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    borderColor: "#e1e1e1",
                    backgroundColor: "var(--white)",
                  }}
                >
                  <h4
                    className="mb-4 pb-2 border-b-2"
                    style={{
                      borderColor: "#e1e1e1",
                      color: "var(--black)",
                    }}
                  >
                    견적 항목
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr
                          className="border-b-2"
                          style={{
                            borderColor: "#e1e1e1",
                            backgroundColor: "var(--white)",
                          }}
                        >
                          <th
                            className="py-3 px-2 text-left"
                            style={{ fontSize: "0.875rem" }}
                          >
                            제작내용
                          </th>
                          <th
                            className="py-3 px-2 text-left"
                            style={{ fontSize: "0.875rem" }}
                          >
                            카테고리
                          </th>
                          <th
                            className="py-3 px-2 text-left"
                            style={{ fontSize: "0.875rem" }}
                          >
                            직무
                          </th>
                          <th
                            className="py-3 px-2 text-right"
                            style={{ fontSize: "0.875rem" }}
                          >
                            시급
                          </th>
                          <th
                            className="py-3 px-2 text-right"
                            style={{ fontSize: "0.875rem" }}
                          >
                            시간
                          </th>
                          <th
                            className="py-3 px-2 text-right"
                            style={{ fontSize: "0.875rem" }}
                          >
                            일수
                          </th>
                          <th
                            className="py-3 px-2 text-right"
                            style={{ fontSize: "0.875rem" }}
                          >
                            금액
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedQuote.items.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b"
                            style={{ borderColor: "#e1e1e1" }}
                          >
                            <td
                              className="py-3 px-2"
                              style={{ fontSize: "0.875rem" }}
                            >
                              {item.work || "-"}
                            </td>
                            <td
                              className="py-3 px-2"
                              style={{ fontSize: "0.875rem" }}
                            >
                              {item.category}
                            </td>
                            <td
                              className="py-3 px-2"
                              style={{ fontSize: "0.875rem" }}
                            >
                              {item.role}
                            </td>
                            <td
                              className="py-3 px-2 text-right"
                              style={{ fontSize: "0.875rem" }}
                            >
                              {formatCurrency(item.hourlyRate)}원
                            </td>
                            <td
                              className="py-3 px-2 text-right"
                              style={{ fontSize: "0.875rem" }}
                            >
                              {item.hours || 0}
                            </td>
                            <td
                              className="py-3 px-2 text-right"
                              style={{ fontSize: "0.875rem" }}
                            >
                              {item.days || 0}
                            </td>
                            <td
                              className="py-3 px-2 text-right"
                              style={{ fontSize: "0.875rem" }}
                            >
                              {formatCurrency(item.amount)}원
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 금액 계산 */}
                <div
                  className="p-6 rounded-lg border-2"
                  style={{
                    borderColor: "var(--main-color)",
                    backgroundColor: "#f9fafb",
                  }}
                >
                  <div className="space-y-3">
                    <div
                      className="flex justify-between pb-2 border-b"
                      style={{
                        fontSize: "1.125rem",
                        borderColor: "#e1e1e1",
                      }}
                    >
                      <span>소계</span>
                      <span>{formatCurrency(selectedQuote.subtotal)}원</span>
                    </div>

                    {/* 할인 정보 */}
                    {selectedQuote.discounts &&
                      selectedQuote.discounts.length > 0 && (
                        <div
                          className="space-y-2 pb-2 border-b"
                          style={{ borderColor: "#e5e7eb" }}
                        >
                          {selectedQuote.discounts.map((discount, index) => {
                            const discountAmount =
                              discount.type === "amount"
                                ? discount.value || 0
                                : selectedQuote.subtotal *
                                  ((discount.value || discount.rate || 0) / 100);
                            const discountLabel = discount.type === "amount"
                              ? `할인 (${discount.name})`
                              : `할인 (${discount.name} ${discount.value || discount.rate || 0}%)`;
                            return (
                              <div
                                key={index}
                                className="flex justify-between"
                                style={{
                                  fontSize: "1rem",
                                  color: "#ef4444",
                                }}
                              >
                                <span>{discountLabel}</span>
                                <span>-{formatCurrency(discountAmount)}원</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                    <div
                      className="flex justify-between pb-2 border-b"
                      style={{
                        fontSize: "1.125rem",
                        borderColor: "#e1e1e1",
                      }}
                    >
                      <span>재경비 ({selectedQuote.expenseRate}%)</span>
                      <span>
                        {formatCurrency(selectedQuote.expenseAmount)}원
                      </span>
                    </div>

                    <div
                      className="flex justify-between pb-2 border-b"
                      style={{
                        fontSize: "1.125rem",
                        borderColor: "#e1e1e1",
                      }}
                    >
                      <span>공급가</span>
                      <span>
                        {formatCurrency(selectedQuote.supplyAmount || selectedQuote.totalAmount)}원
                      </span>
                    </div>

                    {selectedQuote.includeVat && (
                      <div
                        className="flex justify-between pb-2 border-b"
                        style={{
                          fontSize: "1.125rem",
                          borderColor: "#e1e1e1",
                        }}
                      >
                        <span>부가세 (10%)</span>
                        <span>
                          {formatCurrency(selectedQuote.vatAmount || 0)}원
                        </span>
                      </div>
                    )}

                    <div
                      className="flex justify-between pt-4 border-t-2"
                      style={{
                        borderColor: "var(--main-color)",
                      }}
                    >
                      <h3>총 금액</h3>
                      <div className="text-right">
                        <h3 style={{ color: "var(--main-color)" }}>
                          {formatCurrency(selectedQuote.totalAmount)}원
                        </h3>
                        {selectedQuote.currencyType && selectedQuote.exchangeRate && selectedQuote.exchangeRate > 0 && (
                          <p className="text-sm text-gray-500 mt-1">
                            ({formatDollar(
                              convertToDollar(
                                selectedQuote.totalAmount,
                                selectedQuote.currencyType,
                                selectedQuote.exchangeRate
                              ),
                              selectedQuote.currencyType
                            )})
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 최종견적금액 */}
                    {selectedQuote.finalQuoteAmount !== undefined &&
                      selectedQuote.finalQuoteAmount !== null &&
                      !isNaN(Number(selectedQuote.finalQuoteAmount)) &&
                      Number(selectedQuote.finalQuoteAmount) > 0 && (
                        <>
                          <div
                            className="flex justify-between pt-4 border-t-2 mt-4"
                            style={{
                              borderColor: "#ff7043",
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <h3>최종견적금액</h3>
                              <span className="text-sm text-gray-600">
                                ({selectedQuote.finalQuoteCurrencyType === "KRW" ? "원" : selectedQuote.finalQuoteCurrencyType})
                              </span>
                            </div>
                            <div className="text-right">
                              <h3 style={{ color: "#ff7043", fontSize: "1.5rem" }}>
                                {selectedQuote.finalQuoteCurrencyType === "KRW"
                                  ? `${formatCurrency(selectedQuote.finalQuoteAmount)}원`
                                  : selectedQuote.finalQuoteCurrencyType === "USD"
                                  ? formatDollar(selectedQuote.finalQuoteAmount, "USD")
                                  : formatDollar(selectedQuote.finalQuoteAmount, "CAD")}
                              </h3>
                            </div>
                          </div>
                          <div className="text-right mt-2">
                            <p style={{ fontSize: "1rem", fontWeight: 600, color: "#333" }}>
                              {selectedQuote.finalQuoteCurrencyType === "KRW"
                                ? `일금 ${convertToKoreanNumber(selectedQuote.finalQuoteAmount)}원 정 (${formatCurrency(selectedQuote.finalQuoteAmount)}원)`
                                : selectedQuote.finalQuoteCurrencyType === "USD"
                                ? `일금 ${convertToKoreanNumber(selectedQuote.finalQuoteAmount)}미국 달러 정 (${formatDollar(selectedQuote.finalQuoteAmount, "USD")})`
                                : `일금 ${convertToKoreanNumber(selectedQuote.finalQuoteAmount)}캐나다 달러 정 (${formatDollar(selectedQuote.finalQuoteAmount, "CAD")})`}
                            </p>
                          </div>
                        </>
                      )}
                  </div>
                </div>

                {/* 비고 */}
                {selectedQuote.notes && (
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: "var(--white)",
                      borderColor: "#e1e1e1",
                    }}
                  >
                    <h4
                      className="mb-3 pb-2 border-b"
                      style={{
                        borderColor: "#e1e1e1",
                        color: "var(--black)",
                      }}
                    >
                      비고
                    </h4>
                    <p
                      style={{
                        whiteSpace: "pre-wrap",
                        fontSize: "0.875rem",
                        color: "#71717B",
                      }}
                    >
                      {selectedQuote.notes}
                    </p>
                  </div>
                )}

                {/* 고객 안내문구 */}
                {customerNotice && (
                  <div className="mt-8 space-y-6">
                    <div
                      className="p-6 rounded-lg border-2"
                      style={{
                        backgroundColor: "var(--white)",
                        borderColor: "#000",
                      }}
                    >
                      <h4
                        className="mb-4 pb-2 border-b-2 text-center"
                        style={{
                          borderColor: "#000",
                          color: "var(--black)",
                          fontSize: "1.125rem",
                          fontWeight: 700,
                        }}
                      >
                        웹사이트 제작 환불불가 조항 안내
                      </h4>

                      {customerNotice.refundPolicy && (
                        <div className="mb-4">
                          <div
                            style={{
                              whiteSpace: "pre-wrap",
                              fontSize: "0.75rem",
                              lineHeight: 1.6,
                              color: "#333",
                            }}
                          >
                            {customerNotice.refundPolicy}
                          </div>
                        </div>
                      )}

                      {customerNotice.terms && (
                        <div className="mb-4">
                          <div
                            style={{
                              whiteSpace: "pre-wrap",
                              fontSize: "0.75rem",
                              lineHeight: 1.6,
                              color: "#333",
                            }}
                          >
                            {customerNotice.terms}
                          </div>
                        </div>
                      )}

                      {customerNotice.serviceScope && (
                        <div className="mb-4">
                          <div
                            style={{
                              whiteSpace: "pre-wrap",
                              fontSize: "0.75rem",
                              lineHeight: 1.6,
                              color: "#333",
                            }}
                          >
                            {customerNotice.serviceScope}
                          </div>
                        </div>
                      )}

                      {customerNotice.deliveryPolicy && (
                        <div className="mb-4">
                          <div
                            style={{
                              whiteSpace: "pre-wrap",
                              fontSize: "0.75rem",
                              lineHeight: 1.6,
                              color: "#333",
                            }}
                          >
                            {customerNotice.deliveryPolicy}
                          </div>
                        </div>
                      )}

                      {customerNotice.paymentSchedule && (
                        <div className="mb-4">
                          <div
                            style={{
                              whiteSpace: "pre-wrap",
                              fontSize: "0.75rem",
                              lineHeight: 1.6,
                              color: "#333",
                            }}
                          >
                            {customerNotice.paymentSchedule}
                          </div>
                        </div>
                      )}

                      {customerNotice.otherTerms && (
                        <div className="mb-4">
                          <div
                            style={{
                              whiteSpace: "pre-wrap",
                              fontSize: "0.75rem",
                              lineHeight: 1.6,
                              color: "#333",
                            }}
                          >
                            {customerNotice.otherTerms}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 입금 정보 */}
                    {paymentInfo && paymentInfo.selectedType && (
                      <div
                        className="p-6 rounded-lg border-2"
                        style={{
                          backgroundColor: "var(--white)",
                          borderColor: "#000",
                        }}
                      >
                        <h4
                          className="mb-4 pb-2 border-b-2"
                          style={{
                            borderColor: "#000",
                            color: "var(--black)",
                            fontSize: "1.125rem",
                            fontWeight: 700,
                          }}
                        >
                          입금 정보
                        </h4>
                        {paymentInfo.selectedType === "domestic" && paymentInfo.domestic && (
                          <div className="space-y-2" style={{ fontSize: "0.875rem" }}>
                            <p><strong>은행명:</strong> {paymentInfo.domestic.bankName}</p>
                            <p><strong>계좌번호:</strong> {paymentInfo.domestic.accountNumber}</p>
                            <p><strong>예금주:</strong> {paymentInfo.domestic.accountHolder}</p>
                            {paymentInfo.domestic.notes && (
                              <p style={{ whiteSpace: "pre-wrap", marginTop: "0.5rem" }}>
                                {paymentInfo.domestic.notes}
                              </p>
                            )}
                          </div>
                        )}
                        {paymentInfo.selectedType === "international" && paymentInfo.international && (
                          <div className="space-y-2" style={{ fontSize: "0.875rem" }}>
                            <p><strong>은행명:</strong> {paymentInfo.international.bankName}</p>
                            <p><strong>계좌번호:</strong> {paymentInfo.international.accountNumber}</p>
                            <p><strong>예금주:</strong> {paymentInfo.international.accountHolder}</p>
                            <p><strong>SWIFT 코드:</strong> {paymentInfo.international.swiftCode}</p>
                            {paymentInfo.international.notes && (
                              <p style={{ whiteSpace: "pre-wrap", marginTop: "0.5rem" }}>
                                {paymentInfo.international.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div
                  className="text-center pt-6 mt-6 border-t-2"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  <p
                    style={{
                      color: "#71717B",
                      fontSize: "0.875rem",
                    }}
                  >
                    © 2025 개발견적메이커
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 인쇄 미리보기 Dialog */}
      <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
        <DialogContent
          className="max-w-[90vw] md:max-w-[210mm] max-h-[90vh] overflow-hidden p-0"
          style={{
            width: "210mm",
            maxWidth: "90vw",
            backgroundColor: "white",
          }}
        >
          <DialogHeader className="p-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl sm:text-2xl">
                인쇄 미리보기
              </DialogTitle>
              <div className="flex gap-2">
                <Button
                  onClick={handlePrint}
                  style={{
                    backgroundColor: "var(--main-color)",
                    color: "var(--white)",
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  인쇄
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPrintPreview(false)}
                >
                  닫기
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4">
            {printHTML && (
              <iframe
                srcDoc={printHTML}
                className="w-full border-0"
                style={{ minHeight: "800px" }}
                title="견적서 인쇄 미리보기"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 로딩 오버레이 */}
      {loading && (
        <LoadingOverlay
          visible={loading}
          message="견적서 목록 불러오는 중..."
        />
      )}
      {pdfLoading && (
        <LoadingOverlay visible={pdfLoading} message="PDF 생성 중..." />
      )}
    </div>
  );
}
