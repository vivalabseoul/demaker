import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Download,
  Clock,
  Calendar,
  Sparkles,
  FileCheck,
  Send,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  QuoteItem,
  Quote,
  LaborRate,
  CompanyInfo,
  Discount,
} from "../types/quote";
import {
  getLaborRates,
  getOurCompany,
  getClients,
  saveClient,
  saveQuote,
  saveQuotesBatch,
  generateQuoteNumber,
  getQuoteById,
  formatDate,
  formatCurrency,
} from "../utils/supabaseStore";
import { getCurrentUserId } from "../utils/supabase";
import { generateQuotePDF, generateQuoteHTML } from "../utils/pdfGenerator";
import {
  checkQuota,
  incrementUsage,
  checkReissueQuota,
  useReissue,
} from "../utils/supabaseSubscription";
import {
  getExchangeRate,
  convertToDollar,
  formatDollar,
  CurrencyType,
} from "../utils/exchangeRate";
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

interface QuoteCreatorProps {
  editingQuoteId?: string | null;
  onEditComplete?: () => void;
}

export function QuoteCreator({
  editingQuoteId = null,
  onEditComplete,
}: QuoteCreatorProps = {}) {
  const [quoteType, setQuoteType] = useState<"company" | "freelancer">(
    "company"
  );
  const [projectName, setProjectName] = useState("프로젝트명");
  const [laborRates, setLaborRates] = useState<LaborRate[]>([]);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [expenseRate, setExpenseRate] = useState(10);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [includeVat, setIncludeVat] = useState(false);
  const [ourCompany, setOurCompany] = useState<CompanyInfo | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [clientCompany, setClientCompany] = useState<CompanyInfo>({
    name: "성명",
    representative: "대표자명",
    address: "주소",
    phone: "전화번호",
    email: "이메일",
    registrationNumber: "사업자등록번호",
  });
  const [notes, setNotes] = useState("비고");
  const [finalQuoteAmount, setFinalQuoteAmount] = useState<number | undefined>(
    undefined
  );
  const [finalQuoteCurrencyType, setFinalQuoteCurrencyType] = useState<
    "KRW" | "USD" | "CAD" | null
  >("KRW");
  const [loading, setLoading] = useState(true);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  // 환율 관련 state
  const [currencyType, setCurrencyType] = useState<CurrencyType>(null);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [loadingExchangeRate, setLoadingExchangeRate] = useState(false);

  // AI 관련 state
  const [showAIComparison, setShowAIComparison] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [showAIReview, setShowAIReview] = useState(false);
  const [aiReview, setAiReview] = useState<string>("AI 검토 결과");
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // 인쇄 미리보기 state
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printHTML, setPrintHTML] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (editingQuoteId && laborRates.length > 0 && ourCompany) {
      loadQuoteForEdit();
    }
  }, [editingQuoteId, laborRates.length, ourCompany]);

  const loadQuoteForEdit = async () => {
    if (!editingQuoteId) {
      console.log("No editingQuoteId provided");
      return;
    }

    console.log("Loading quote with ID:", editingQuoteId);

    try {
      const quote = await getQuoteById(editingQuoteId);
      console.log("Quote loaded:", quote);

      if (quote) {
        console.log("Setting quote data:", {
          type: quote.type,
          projectName: quote.projectName,
          itemsCount: quote.items?.length,
          clientCompany: quote.clientCompany?.name,
        });

        setEditingQuote(quote);
        setQuoteType(quote.type);
        setProjectName(quote.projectName || "프로젝트명");
        setItems(quote.items || []);
        setExpenseRate(quote.expenseRate || 10);
        setDiscounts(quote.discounts || []);
        setIncludeVat(quote.includeVat || false);
        setClientCompany(quote.clientCompany);
        setNotes(quote.notes || "비고");
        setFinalQuoteAmount(quote.finalQuoteAmount);
        setFinalQuoteCurrencyType(quote.finalQuoteCurrencyType || "KRW");
        setCurrencyType(quote.currencyType || null);
        setExchangeRate(quote.exchangeRate || 0);
        toast.success("견적서를 불러왔습니다.");
      } else {
        console.error("Quote not found for ID:", editingQuoteId);
        toast.error(`견적서를 찾을 수 없습니다. (ID: ${editingQuoteId})`);
      }
    } catch (error) {
      console.error("Error loading quote for edit:", error);
      toast.error(`견적서를 불러오는 중 오류가 발생했습니다: ${error}`);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const rates = await getLaborRates();
      const company = await getOurCompany();
      const clientList = await getClients();
      setLaborRates(rates);
      setOurCompany(company);
      setClients(clientList);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const availableRates = laborRates.filter((rate) => rate.type === quoteType);

  const handleAddItem = () => {
    if (availableRates.length === 0) {
      alert(
        "노임이 설정되지 않았습니다. 관리자 페이지에서 노임을 먼저 설정해주세요."
      );
      return;
    }

    const firstRate = availableRates[0];
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      laborRateId: firstRate.id,
      work: "작업명",
      category: firstRate.category,
      role: firstRate.role,
      hourlyRate: firstRate.hourlyRate,
      dailyRate: firstRate.dailyRate,
      calculationType: "hourly",
      hours: 0,
      days: 0,
      amount: 0,
      type: quoteType,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: string, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };

          if (field === "laborRateId") {
            const rate = laborRates.find((r) => r.id === value);
            if (rate) {
              updated.category = rate.category;
              updated.role = rate.role;
              updated.hourlyRate = rate.hourlyRate;
              updated.dailyRate = rate.dailyRate;
            }
          }

          // Calculate amount based on calculation type
          if (updated.calculationType === "hourly") {
            const totalHours = (updated.hours || 0) + (updated.days || 0) * 8;
            updated.amount = totalHours * updated.hourlyRate;
          } else {
            // daily calculation
            updated.amount = (updated.days || 0) * updated.dailyRate;
          }

          return updated;
        }
        return item;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleLoadClient = async (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setClientCompany({
        name: client.name,
        representative: client.representative,
        address: client.address,
        phone: client.phone,
        email: client.email,
        registrationNumber: client.registrationNumber,
      });
    }
  };

  const handleAddDiscount = () => {
    const newDiscount: Discount = {
      id: Date.now().toString(),
      name: "할인명목",
      rate: 0,
      amount: 0,
    };
    setDiscounts([...discounts, newDiscount]);
  };

  const handleUpdateDiscount = (id: string, field: string, value: any) => {
    setDiscounts(
      discounts.map((discount) => {
        if (discount.id === id) {
          const updated = { ...discount, [field]: value };
          if (field === "rate") {
            updated.amount = Math.round(
              (subtotal + expenseAmount) * (value / 100)
            );
          }
          return updated;
        }
        return discount;
      })
    );
  };

  const handleDeleteDiscount = (id: string) => {
    setDiscounts(discounts.filter((d) => d.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const expenseAmount = Math.round(subtotal * (expenseRate / 100));
  const totalDiscount = discounts.reduce((sum, d) => sum + (d.amount || 0), 0);
  const supplyAmount = subtotal + expenseAmount - totalDiscount;
  const vatAmount = includeVat ? Math.round(supplyAmount * 0.1) : 0;
  const totalAmount = supplyAmount + vatAmount;
  const totalAmountDollar =
    currencyType && exchangeRate > 0
      ? convertToDollar(totalAmount, currencyType, exchangeRate)
      : undefined;

  // 환율 변경 시 환율 가져오기
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (currencyType) {
        setLoadingExchangeRate(true);
        try {
          const rate = await getExchangeRate(currencyType);
          setExchangeRate(rate);
        } catch (error) {
          console.error("환율 가져오기 오류:", error);
          toast.error("환율을 가져오는 중 오류가 발생했습니다.");
        } finally {
          setLoadingExchangeRate(false);
        }
      } else {
        setExchangeRate(0);
      }
    };

    fetchExchangeRate();
  }, [currencyType]);

  // AI 견적 도우미 호출
  const handleGenerateAIQuote = async () => {
    toast.info("서비스 준비중입니다.");
  };

  // AI 견적서 적용
  const handleApplyAIQuote = () => {
    if (!aiSuggestion) return;

    const updatedItems = items.map((item, index) => {
      const aiItem = aiSuggestion.items[index];
      return {
        ...item,
        hours: aiItem.aiHours,
        days: aiItem.aiDays,
        amount: aiItem.aiAmount,
      };
    });

    setItems(updatedItems);
    setShowAIComparison(false);
    alert("AI 견적이 적용되었습니다.");
  };

  // AI 견적서 검토
  const handleRequestAIReview = async () => {
    toast.info("서비스 준비중입니다.");
  };

  // 샘플 데이터 생성
  const handleGenerateSampleData = async () => {
    // 먼저 현재 사용자가 로그인되어 있는지 확인
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      toast.error("샘플 데이터를 생성하려면 먼저 로그인해주세요.");
      return;
    }

    if (!ourCompany) {
      toast.error("회사 정보를 먼저 등록해주세요.");
      return;
    }

    if (
      !confirm(
        "최근 12개월 간의 샘플 견적서 30개를 생성합니다. 계속하시겠습니까?"
      )
    ) {
      return;
    }

    setLoading(true);
    console.log("샘플 데이터 생성 시작");

    const sampleClients = [
      {
        name: "(주)테크노바",
        representative: "김철수",
        registrationNumber: "123-45-67890",
      },
      {
        name: "스타트업코리아",
        representative: "이영희",
        registrationNumber: "234-56-78901",
      },
      {
        name: "디지털솔루션",
        representative: "박민수",
        registrationNumber: "345-67-89012",
      },
      {
        name: "크리에이티브랩",
        representative: "최지은",
        registrationNumber: "456-78-90123",
      },
      {
        name: "이노베이션허브",
        representative: "정도현",
        registrationNumber: "567-89-01234",
      },
      {
        name: "퓨처테크",
        representative: "강서연",
        registrationNumber: "678-90-12345",
      },
      {
        name: "스마트웨이브",
        representative: "윤재혁",
        registrationNumber: "789-01-23456",
      },
      {
        name: "넥스트레벨",
        representative: "임수진",
        registrationNumber: "890-12-34567",
      },
    ];

    const categories = [
      "웹개발",
      "앱개발",
      "UI/UX 디자인",
      "그래픽 디자인",
      "백엔드 개발",
      "프론트엔드 개발",
    ];

    try {
      const now = new Date();
      let generatedCount = 0;
      const generatedQuotes: Quote[] = [];

      const baseTimestamp = Date.now();
      for (let i = 0; i < 30; i++) {
        // 랜덤 날짜 (최근 12개월)
        const monthsAgo = Math.floor(Math.random() * 12);
        const daysAgo = Math.floor(Math.random() * 28);
        const quoteDate = new Date(
          now.getFullYear(),
          now.getMonth() - monthsAgo,
          Math.max(1, now.getDate() - daysAgo)
        );

        console.log(`견적서 ${i + 1} 생성 날짜:`, formatDate(quoteDate));

        // 랜덤 거래처
        const randomClient =
          sampleClients[Math.floor(Math.random() * sampleClients.length)];

        // 랜덤 타입
        const randomType = Math.random() > 0.5 ? "company" : "freelancer";

        // 랜덤 항목 생성 (1~4개)
        const itemCount = Math.floor(Math.random() * 4) + 1;
        const sampleItems: QuoteItem[] = [];

        const typeRates = laborRates.filter((rate) => rate.type === randomType);
        if (typeRates.length === 0) {
          console.warn(`⚠️ ${randomType} 타입의 노임이 없어 건너뜁니다.`);
          // 노임이 없으면 기본 노임으로 생성
          const defaultRate: LaborRate = {
            id: "default",
            category: categories[Math.floor(Math.random() * categories.length)],
            role: "개발자",
            hourlyRate: 50000,
            dailyRate: 400000,
            type: randomType,
          };
          const randomHours = Math.floor(Math.random() * 160) + 40;
          const calcType = Math.random() > 0.5 ? "hourly" : "daily";
          const amount =
            calcType === "hourly"
              ? randomHours * defaultRate.hourlyRate
              : Math.floor(Math.random() * 20 + 5) * defaultRate.dailyRate;

          sampleItems.push({
            id: `${Date.now()}-${i}-0`,
            laborRateId: defaultRate.id,
            category: defaultRate.category,
            role: defaultRate.role,
            hourlyRate: defaultRate.hourlyRate,
            dailyRate: defaultRate.dailyRate,
            calculationType: calcType,
            hours: calcType === "hourly" ? randomHours : 0,
            days: calcType === "daily" ? Math.floor(Math.random() * 20 + 5) : 0,
            amount: amount,
            type: randomType,
          });
        } else {
          for (let j = 0; j < itemCount; j++) {
            const randomRate =
              typeRates[Math.floor(Math.random() * typeRates.length)];
            const randomHours = Math.floor(Math.random() * 160) + 40; // 40~200시간
            const randomDays = Math.floor(Math.random() * 20) + 5; // 5~25일

            const calcType = Math.random() > 0.5 ? "hourly" : "daily";
            const amount =
              calcType === "hourly"
                ? randomHours * randomRate.hourlyRate
                : randomDays * randomRate.dailyRate;

            sampleItems.push({
              id: `${Date.now()}-${i}-${j}`,
              laborRateId: randomRate.id,
              category: randomRate.category,
              role: randomRate.role,
              hourlyRate: randomRate.hourlyRate,
              dailyRate: randomRate.dailyRate,
              calculationType: calcType,
              hours: calcType === "hourly" ? randomHours : 0,
              days: calcType === "daily" ? randomDays : 0,
              amount: amount,
              type: randomType,
            });
          }
        }

        const subtotal = sampleItems.reduce(
          (sum, item) => sum + item.amount,
          0
        );
        const expenseAmount = Math.round(subtotal * (expenseRate / 100));
        const totalAmount = subtotal + expenseAmount;

        const quoteNumber = `Q${quoteDate.getFullYear()}${String(
          quoteDate.getMonth() + 1
        ).padStart(2, "0")}${String(quoteDate.getDate()).padStart(
          2,
          "0"
        )}-${String(i + 1).padStart(3, "0")}`;

        const supplyAmount = totalAmount;
        // UUID 생성 (Supabase가 자동 생성하도록 undefined로 설정 가능)
        const quote: Quote = {
          id: crypto.randomUUID(),
          quoteNumber,
          createdDate: formatDate(quoteDate),
          projectName: `샘플 프로젝트 ${i + 1}`,
          ourCompany,
          clientCompany: {
            name: randomClient.name,
            representative: randomClient.representative,
            address: "서울특별시 강남구",
            phone: "02-1234-5678",
            email: "contact@example.com",
            registrationNumber: randomClient.registrationNumber,
          },
          items: sampleItems,
          subtotal,
          expenseRate,
          expenseAmount,
          totalAmount,
          supplyAmount,
          vatAmount: 0,
          includeVat: false,
          type: randomType,
          notes: "샘플 견적서입니다.",
          discounts: [],
          issued: false, // 샘플데이터는 미발급 상태
        };

        generatedQuotes.push(quote);
        generatedCount++;
      }

      console.log(`💾 견적서 생성 완료 - 총 ${generatedQuotes.length}개`);

      if (generatedQuotes.length === 0) {
        toast.error("생성된 견적서가 없습니다. 노임 설정을 확인해주세요.");
        setLoading(false);
        return;
      }

      // 🚀 BATCH WRITE로 한 번에 저장 - 훨씬 빠름!
      console.log("⚡ Batch Write 시작...");
      const startTime = Date.now();
      try {
        await saveQuotesBatch(generatedQuotes);
        const endTime = Date.now();
        console.log(
          `✅ Batch Write 완료! (소요시간: ${endTime - startTime}ms)`
        );

        console.log(
          "생성된 견적서들:",
          generatedQuotes.map((q) => ({
            번호: q.quoteNumber,
            날짜: q.createdDate,
            금액: formatCurrency(q.totalAmount),
            ID: q.id,
          }))
        );

        toast.success(`${generatedCount}개의 샘플 견적서가 생성되었습니다!`);

        // 데이터 다시 로드
        console.log("🔄 데이터 새로고침 중...");
        await loadData();

        // 2초 후 페이지 새로고침으로 확실하게 반영
        setTimeout(() => {
          console.log("🔄 페이지 새로고침...");
          window.location.reload();
        }, 2000);
      } catch (saveError: any) {
        console.error("❌ 저장 중 에러:", saveError);
        toast.error(
          `저장 중 오류가 발생했습니다: ${saveError?.message || saveError}`
        );
        throw saveError;
      }
    } catch (error: any) {
      console.error("❌ 샘플 데이터 생성 에러:", error);
      const errorMessage =
        error?.message || error?.toString() || "알 수 없는 오류";
      toast.error(`샘플 데이터 생성 중 오류가 발생했습니다: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuote = async () => {
    if (!ourCompany) {
      toast.error("회사 정보를 먼저 등록해주세요.");
      return;
    }

    if (!clientCompany.name) {
      toast.error("상대방 회사 정보를 입력해주세요.");
      return;
    }

    if (items.length === 0) {
      toast.error("견적 항목을 추가해주세요.");
      return;
    }

    try {
      let quote: Quote;

      if (editingQuote && editingQuoteId) {
        // 수정 모드: 기존 견적서 업데이트 (발급 여부는 유지)
        quote = {
          ...editingQuote,
          projectName,
          ourCompany,
          clientCompany,
          items,
          subtotal,
          expenseRate,
          expenseAmount,
          totalAmount,
          supplyAmount,
          vatAmount,
          includeVat,
          type: quoteType,
          notes,
          finalQuoteAmount,
          finalQuoteCurrencyType,
          discounts,
          currencyType,
          exchangeRate,
          totalAmountDollar,
          // 발급 정보는 유지 (수정 시 발급 취소되지 않음)
          issued: editingQuote.issued,
          issuedDate: editingQuote.issuedDate,
        };
        await saveQuote(quote);
        toast.success("견적서가 수정되었습니다.", {
          description: `견적서 번호: ${quote.quoteNumber}`,
          duration: 3000,
        });
      } else {
        // 새로 생성
        const quoteNumber = await generateQuoteNumber();
        quote = {
          id: crypto.randomUUID(),
          quoteNumber,
          createdDate: formatDate(new Date()),
          projectName,
          ourCompany,
          clientCompany,
          items,
          subtotal,
          expenseRate,
          expenseAmount,
          totalAmount,
          supplyAmount,
          vatAmount,
          includeVat,
          type: quoteType,
          notes,
          finalQuoteAmount,
          finalQuoteCurrencyType,
          discounts,
          currencyType,
          exchangeRate,
          totalAmountDollar,
          issued: false, // 새로 생성된 견적서는 미발급 상태
        };
        await saveQuote(quote);
        toast.success("견적서가 저장되었습니다.", {
          description: `견적서 번호: ${quote.quoteNumber}`,
          duration: 3000,
        });
      }

      // 거래처 정보 자동 저장 (회사명이 있는 경우에만)
      if (clientCompany.name.trim()) {
        try {
          // 기존 거래처 목록 확인
          const existingClients = await getClients();
          const existingClient = existingClients.find(
            (c) => c.name === clientCompany.name.trim()
          );

          if (!existingClient) {
            // 새 거래처로 저장
            const newClient = {
              id: crypto.randomUUID(),
              name: clientCompany.name.trim(),
              representative: clientCompany.representative || "대표자명",
              address: clientCompany.address || "주소",
              phone: clientCompany.phone || "전화번호",
              email: clientCompany.email || "이메일",
              registrationNumber:
                clientCompany.registrationNumber || "사업자등록번호",
              totalSales: 0,
              quoteCount: 0,
            };
            await saveClient(newClient);
            // 거래처 목록 새로고침
            const updatedClients = await getClients();
            setClients(updatedClients);
          } else {
            // 기존 거래처 정보 업데이트 (변경된 정보가 있는 경우)
            const hasChanges =
              existingClient.representative !== clientCompany.representative ||
              existingClient.address !== clientCompany.address ||
              existingClient.phone !== clientCompany.phone ||
              existingClient.email !== clientCompany.email ||
              existingClient.registrationNumber !==
                clientCompany.registrationNumber;

            if (hasChanges) {
              const updatedClient = {
                ...existingClient,
                representative:
                  clientCompany.representative || existingClient.representative,
                address: clientCompany.address || existingClient.address,
                phone: clientCompany.phone || existingClient.phone,
                email: clientCompany.email || existingClient.email,
                registrationNumber:
                  clientCompany.registrationNumber ||
                  existingClient.registrationNumber,
              };
              await saveClient(updatedClient);
              // 거래처 목록 새로고침
              const updatedClients = await getClients();
              setClients(updatedClients);
            }
          }
        } catch (error: any) {
          // 거래처 저장 실패해도 견적서 저장은 성공했으므로 에러만 로그
          console.warn("거래처 자동 저장 실패:", error);
        }
      }

      // Reset form
      setItems([]);
      setClientCompany({
        name: "성명",
        representative: "대표자명",
        address: "주소",
        phone: "전화번호",
        email: "이메일",
        registrationNumber: "사업자등록번호",
      });
      setNotes("비고");
      setFinalQuoteAmount(undefined);
      setFinalQuoteCurrencyType("KRW");
      setDiscounts([]);
      setProjectName("프로젝트명");
      setEditingQuote(null);
    } catch (error: any) {
      console.error("저장 중 오류 발생:", error);
      const errorMessage =
        error?.message || error?.toString() || "알 수 없는 오류";
      toast.error(`저장 중 오류가 발생했습니다: ${errorMessage}`);
    }
  };

  // 견적서 발급 처리
  const handleIssueQuote = async () => {
    if (!ourCompany) {
      toast.error("회사 정보를 먼저 등록해주세요.");
      return;
    }

    if (!clientCompany.name) {
      toast.error("상대방 회사 정보를 입력해주세요.");
      return;
    }

    if (items.length === 0) {
      toast.error("견적 항목을 추가해주세요.");
      return;
    }

    try {
      // 구독 사용 횟수 확인 (첫 견적서 무료 포함)
      const quotaInfo = await checkQuota();
      if (!quotaInfo.available) {
        toast.error(
          `사용 가능한 횟수가 없습니다. (남은 횟수: ${quotaInfo.remaining}/${quotaInfo.total})`
        );
        return;
      }

      // 첫 견적서 무료 안내
      if (quotaInfo.isFirstQuote) {
        toast.info("🎉 회원가입 축하합니다! 첫 견적서는 무료로 발급됩니다.");
      }

      let quote: Quote;

      if (editingQuote && editingQuoteId) {
        // 수정 모드: 재발급 여부 확인
        if (editingQuote.issued) {
          // 이미 발급된 견적서는 재발급 확인
          const reissueInfo = await checkReissueQuota();
          if (!reissueInfo.available) {
            toast.error(
              `재발급 가능한 횟수가 없습니다. (남은 횟수: ${reissueInfo.remaining}/${reissueInfo.total})`
            );
            return;
          }

          // 재발급 사용
          await useReissue();
          quote = {
            ...editingQuote,
            projectName,
            ourCompany,
            clientCompany,
            items,
            subtotal,
            expenseRate,
            expenseAmount,
            totalAmount,
            supplyAmount,
            vatAmount,
            includeVat,
            type: quoteType,
            notes,
            finalQuoteAmount,
            finalQuoteCurrencyType,
            discounts,
            currencyType,
            exchangeRate,
            totalAmountDollar,
            issued: true,
            issuedDate: new Date().toISOString(),
          };
          await saveQuote(quote);
          toast.success("견적서가 재발급되었습니다.");
        } else {
          // 미발급 견적서는 일반 발급
          await incrementUsage();
          quote = {
            ...editingQuote,
            projectName,
            ourCompany,
            clientCompany,
            items,
            subtotal,
            expenseRate,
            expenseAmount,
            totalAmount,
            supplyAmount,
            vatAmount,
            includeVat,
            type: quoteType,
            notes,
            finalQuoteAmount,
            finalQuoteCurrencyType,
            discounts,
            currencyType,
            exchangeRate,
            totalAmountDollar,
            issued: true,
            issuedDate: new Date().toISOString(),
          };
          await saveQuote(quote);
          toast.success("견적서가 발급되었습니다.");
        }
      } else {
        // 새로 생성
        await incrementUsage();
        const quoteNumber = await generateQuoteNumber();
        quote = {
          id: crypto.randomUUID(),
          quoteNumber,
          createdDate: formatDate(new Date()),
          projectName,
          ourCompany,
          clientCompany,
          items,
          subtotal,
          expenseRate,
          expenseAmount,
          totalAmount,
          supplyAmount,
          vatAmount,
          includeVat,
          type: quoteType,
          notes,
          finalQuoteAmount,
          finalQuoteCurrencyType,
          discounts,
          currencyType,
          exchangeRate,
          totalAmountDollar,
          issued: true,
          issuedDate: new Date().toISOString(),
        };
        await saveQuote(quote);
        toast.success("견적서가 발급되었습니다.");
      }

      // PDF 생성
      await generateQuotePDF(quote);

      // 거래처 정보 자동 저장 (회사명이 있는 경우에만)
      if (clientCompany.name.trim()) {
        try {
          // 기존 거래처 목록 확인
          const existingClients = await getClients();
          const existingClient = existingClients.find(
            (c) => c.name === clientCompany.name.trim()
          );

          if (!existingClient) {
            // 새 거래처로 저장
            const newClient = {
              id: crypto.randomUUID(),
              name: clientCompany.name.trim(),
              representative: clientCompany.representative || "대표자명",
              address: clientCompany.address || "주소",
              phone: clientCompany.phone || "전화번호",
              email: clientCompany.email || "이메일",
              registrationNumber:
                clientCompany.registrationNumber || "사업자등록번호",
              totalSales: 0,
              quoteCount: 0,
            };
            await saveClient(newClient);
            // 거래처 목록 새로고침
            const updatedClients = await getClients();
            setClients(updatedClients);
          } else {
            // 기존 거래처 정보 업데이트 (변경된 정보가 있는 경우)
            const hasChanges =
              existingClient.representative !== clientCompany.representative ||
              existingClient.address !== clientCompany.address ||
              existingClient.phone !== clientCompany.phone ||
              existingClient.email !== clientCompany.email ||
              existingClient.registrationNumber !==
                clientCompany.registrationNumber;

            if (hasChanges) {
              const updatedClient = {
                ...existingClient,
                representative:
                  clientCompany.representative || existingClient.representative,
                address: clientCompany.address || existingClient.address,
                phone: clientCompany.phone || existingClient.phone,
                email: clientCompany.email || existingClient.email,
                registrationNumber:
                  clientCompany.registrationNumber ||
                  existingClient.registrationNumber,
              };
              await saveClient(updatedClient);
              // 거래처 목록 새로고침
              const updatedClients = await getClients();
              setClients(updatedClients);
            }
          }
        } catch (error: any) {
          // 거래처 저장 실패해도 견적서 발급은 성공했으므로 에러만 로그
          console.warn("거래처 자동 저장 실패:", error);
        }
      }

      // Reset form
      setItems([]);
      setClientCompany({
        name: "성명",
        representative: "대표자명",
        address: "주소",
        phone: "전화번호",
        email: "이메일",
        registrationNumber: "사업자등록번호",
      });
      setNotes("비고");
      setFinalQuoteAmount(undefined);
      setFinalQuoteCurrencyType("KRW");
      setDiscounts([]);
      setProjectName("프로젝트명");
      setEditingQuote(null);

      if (onEditComplete) {
        onEditComplete();
      }
    } catch (error: any) {
      console.error("발급 중 오류 발생:", error);
      const errorMessage =
        error?.message || error?.toString() || "알 수 없는 오류";
      toast.error(`발급 중 오류가 발생했습니다: ${errorMessage}`);
    }
  };

  const handleDownloadPDF = async () => {
    if (!ourCompany) {
      toast.error("회사 정보를 먼저 등록해주세요.");
      return;
    }

    if (!clientCompany.name) {
      toast.error("상대방 회사 정보를 입력해주세요.");
      return;
    }

    if (items.length === 0) {
      toast.error("견적 항목을 추가해주세요.");
      return;
    }

    try {
      // Save before generating PDF
      const quoteNumber = await generateQuoteNumber();
      const quote: Quote = {
        id: crypto.randomUUID(),
        quoteNumber,
        createdDate: formatDate(new Date()),
        projectName,
        ourCompany,
        clientCompany,
        items,
        subtotal,
        expenseRate,
        expenseAmount,
        totalAmount,
        supplyAmount,
        vatAmount,
        includeVat,
        type: quoteType,
        notes,
        finalQuoteAmount,
        finalQuoteCurrencyType,
        discounts,
        currencyType,
        exchangeRate,
        totalAmountDollar,
      };

      await saveQuote(quote);

      // HTML 생성 및 Dialog 표시
      const html = await generateQuoteHTML(quote);
      setPrintHTML(html);
      setShowPrintPreview(true);
    } catch (error: any) {
      console.error("PDF 생성 중 오류 발생:", error);
      const errorMessage =
        error?.message || error?.toString() || "알 수 없는 오류";
      toast.error(`PDF 생성 중 오류가 발생했습니다: ${errorMessage}`);
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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6 md:mb-8">
        <h1>{editingQuoteId ? "견적서 수정" : "견적서 작성"}</h1>
        <p className="mt-2">
          {editingQuoteId
            ? "견적서를 수정하고 저장하세요."
            : "프로젝트 견적서를 작성하고 PDF로 다운로드하세요."}
        </p>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Type Selection */}
        <Card style={{ backgroundColor: "var(--white)" }}>
          <CardHeader>
            <h3>견적 유형</h3>
          </CardHeader>
          <CardContent>
            <Tabs
              value={quoteType}
              onValueChange={(v) => {
                if (!editingQuoteId) {
                  setQuoteType(v as "company" | "freelancer");
                }
              }}
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="company" disabled={!!editingQuoteId}>
                  회사
                </TabsTrigger>
                <TabsTrigger value="freelancer" disabled={!!editingQuoteId}>
                  프리랜서
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card style={{ backgroundColor: "var(--white)" }}>
          <CardHeader>
            <h3>회사 정보</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <div
                  className="flex items-center mb-4"
                  style={{ minHeight: "2.5rem" }}
                >
                  <h4>
                    <strong>공급자</strong>
                  </h4>
                </div>
                {ourCompany ? (
                  <div className="p-[1.5rem] border border-[#D4D4D4] rounded-[1.5rem] bg-white">
                    <div className="space-y-4" style={{ lineHeight: "1.5" }}>
                      <p>
                        <strong>회사명:</strong> {ourCompany.name}
                      </p>
                      <p>
                        <strong>대표자:</strong> {ourCompany.representative}
                      </p>
                      <p>
                        <strong>사업자번호:</strong>{" "}
                        {ourCompany.registrationNumber}
                      </p>
                      <p>
                        <strong>주소:</strong> {ourCompany.address}
                      </p>
                      <p>
                        <strong>전화번호:</strong> {ourCompany.phone}
                      </p>
                      <p>
                        <strong>이메일:</strong> {ourCompany.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-[1.5rem] border border-[#D4D4D4] rounded-[1.5rem] bg-white">
                    <p style={{ color: "#ef4444" }}>
                      회사 정보가 등록되지 않았습니다. '회사 정보' 메뉴에서
                      등록해주세요.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                  <h4>
                    <strong>공급받는 거래처</strong>
                  </h4>
                  <Select onValueChange={handleLoadClient}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="거래처 불러오기" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Input
                    placeholder="회사명"
                    value={clientCompany.name}
                    onChange={(e) =>
                      setClientCompany({
                        ...clientCompany,
                        name: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="대표자"
                    value={clientCompany.representative}
                    onChange={(e) =>
                      setClientCompany({
                        ...clientCompany,
                        representative: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="사업자등록번호"
                    value={clientCompany.registrationNumber}
                    onChange={(e) =>
                      setClientCompany({
                        ...clientCompany,
                        registrationNumber: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="주소"
                    value={clientCompany.address}
                    onChange={(e) =>
                      setClientCompany({
                        ...clientCompany,
                        address: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="전화번호"
                    value={clientCompany.phone}
                    onChange={(e) =>
                      setClientCompany({
                        ...clientCompany,
                        phone: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="이메일"
                    type="email"
                    value={clientCompany.email}
                    onChange={(e) =>
                      setClientCompany({
                        ...clientCompany,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Name */}
        <Card style={{ backgroundColor: "var(--white)" }}>
          <CardHeader>
            <h3>프로젝트 이름</h3>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="프로젝트 이름을 입력하세요"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Final Quote Amount */}
        <Card style={{ backgroundColor: "var(--white)" }}>
          <CardContent className="pt-6">
            <Label>최종제안금액</Label>
            <div className="mt-2 flex flex-col lg:flex-row gap-2 items-stretch lg:items-center">
              <div className="flex gap-2 w-full lg:w-[65%]">
                <div className="flex-1">
                  <Input
                    type="number"
                    value={finalQuoteAmount || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value);
                      setFinalQuoteAmount(value);
                    }}
                    placeholder="사장님이 직접 정하는 최종제안금액을 입력하세요 (선택사항)"
                    style={{
                      fontSize: "1rem",
                      width: "100%",
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                    }}
                  />
                </div>
                <div className="flex w-[100px]">
                  <Select
                    value={finalQuoteCurrencyType || "KRW"}
                    onValueChange={(value) =>
                      setFinalQuoteCurrencyType(value as "KRW" | "USD" | "CAD")
                    }
                  >
                    <SelectTrigger
                      style={{
                        width: "100%",
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        borderLeftWidth: 0,
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KRW">원</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {finalQuoteAmount !== undefined && (
                <>
                  <div className="hidden lg:block text-gray-400">|</div>
                  <div className="w-full lg:w-[35%] text-right">
                    <div
                      className="text-5xl font-bold "
                      style={{
                        color: "var(--accent-color)",
                        gap: "10px",
                      }}
                    >
                      {finalQuoteCurrencyType === "KRW"
                        ? `${formatCurrency(finalQuoteAmount)}원`
                        : finalQuoteCurrencyType === "USD"
                        ? formatDollar(finalQuoteAmount, "USD")
                        : formatDollar(finalQuoteAmount, "CAD")}
                    </div>
                  </div>
                </>
              )}
            </div>
            {finalQuoteAmount !== undefined && finalQuoteAmount > 0 && (
              <div className="mt-4 pt-4 border-t border-[#e1e1e1]">
                <p className="text-lg font-semibold" style={{ color: "#333" }}>
                  {finalQuoteCurrencyType === "KRW" ? (
                    <>
                      일금 {convertToKoreanNumber(finalQuoteAmount)}원 정 (
                      {formatCurrency(finalQuoteAmount)}원)
                    </>
                  ) : finalQuoteCurrencyType === "USD" ? (
                    <>
                      일금 {convertToKoreanNumber(finalQuoteAmount)}미국 달러 정
                      ({formatDollar(finalQuoteAmount, "USD")})
                    </>
                  ) : (
                    <>
                      일금 {convertToKoreanNumber(finalQuoteAmount)}캐나다 달러
                      정 ({formatDollar(finalQuoteAmount, "CAD")})
                    </>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quote Items */}
        <Card style={{ backgroundColor: "var(--white)" }}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3>견적 항목</h3>
              <Button
                onClick={handleAddItem}
                size="sm"
                className="w-full sm:w-auto"
                style={{
                  backgroundColor: "var(--sub-color)",
                  color: "var(--white)",
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                항목 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 md:p-4 border border-[#e1e1e1] rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">#{index + 1}</span>
                    <Button
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
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

                  <div>
                    <Label>제작내용</Label>
                    <Input
                      value={item.work || "작업명"}
                      onChange={(e) =>
                        handleUpdateItem(item.id, "work", e.target.value)
                      }
                      placeholder="제작내용을 입력하세요"
                      className="mt-1"
                    />
                  </div>

                  <div className="mobile-stack grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label>직무</Label>
                      <Select
                        value={item.laborRateId}
                        onValueChange={(value) =>
                          handleUpdateItem(item.id, "laborRateId", value)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRates.map((rate) => (
                            <SelectItem key={rate.id} value={rate.id}>
                              [{rate.category}] {rate.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>계산방식</Label>
                      <Select
                        value={item.calculationType}
                        onValueChange={(value) =>
                          handleUpdateItem(item.id, "calculationType", value)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">시급</SelectItem>
                          <SelectItem value="daily">일평균</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {item.calculationType === "hourly" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <Label>시급 (원)</Label>
                        <Input
                          type="number"
                          value={item.hourlyRate}
                          onChange={(e) =>
                            handleUpdateItem(
                              item.id,
                              "hourlyRate",
                              Number(e.target.value)
                            )
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>시간</Label>
                        <Input
                          type="number"
                          value={item.hours || 0}
                          onChange={(e) =>
                            handleUpdateItem(
                              item.id,
                              "hours",
                              Number(e.target.value)
                            )
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>일수</Label>
                        <Input
                          type="number"
                          value={item.days || 0}
                          onChange={(e) =>
                            handleUpdateItem(
                              item.id,
                              "days",
                              Number(e.target.value)
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label>일평균 (원)</Label>
                        <Input
                          type="number"
                          value={item.dailyRate}
                          onChange={(e) =>
                            handleUpdateItem(
                              item.id,
                              "dailyRate",
                              Number(e.target.value)
                            )
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>일수</Label>
                        <Input
                          type="number"
                          value={item.days || 0}
                          onChange={(e) =>
                            handleUpdateItem(
                              item.id,
                              "days",
                              Number(e.target.value)
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#e1e1e1]">
                    <div className="flex justify-between items-center">
                      <Label>금액</Label>
                      <p
                        className="text-lg"
                        style={{ color: "var(--main-color)" }}
                      >
                        {formatCurrency(item.amount)}원
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-12">
                  <p>견적 항목을 추가해주세요.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card style={{ backgroundColor: "var(--white)" }}>
          <CardHeader>
            <h3>견적 요약</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label style={{ width: "8rem" }}>재경비 비율</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={expenseRate}
                    onChange={(e) => setExpenseRate(Number(e.target.value))}
                    style={{ width: "8rem" }}
                  />
                  <span>%</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e1e1e1]">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <p>소계</p>
                    <p>{formatCurrency(subtotal)}원</p>
                  </div>
                  <div className="flex justify-between">
                    <p>재경비 ({expenseRate}%)</p>
                    <p>{formatCurrency(expenseAmount)}원</p>
                  </div>

                  {/* Discounts */}
                  {discounts.length > 0 && (
                    <div className="pt-2 space-y-2">
                      {discounts.map((discount) => {
                        const discountAmount = discount.amount || 0;
                        return (
                          <div
                            key={discount.id}
                            className="flex justify-between"
                            style={{ fontSize: "1.125rem", color: "#FE9A37" }}
                          >
                            <p style={{ fontWeight: "bold", color: "#FE9A37" }}>
                              Discount - {discount.name || "미설정"} (
                              {discount.rate}
                              %)
                            </p>
                            <p style={{ fontWeight: "bold", color: "#FE9A37" }}>
                              -{formatCurrency(discountAmount)}원
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-between pt-3 border-t border-[#e1e1e1]">
                    <span>공급가</span>
                    <span>{formatCurrency(supplyAmount)}원</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="includeVat"
                      checked={includeVat}
                      onChange={(e) => setIncludeVat(e.target.checked)}
                      style={{ width: "1.2rem", height: "1.2rem" }}
                    />
                    <label htmlFor="includeVat" style={{ fontSize: "1rem" }}>
                      부가세 10% 적용
                    </label>
                  </div>

                  {includeVat && (
                    <div
                      className="flex justify-between"
                      style={{ fontSize: "1.125rem" }}
                    >
                      <span>부가세 (10%)</span>
                      <span>{formatCurrency(vatAmount)}원</span>
                    </div>
                  )}

                  {/* 환율 선택 */}
                  <div className="pt-3 border-t border-[#e1e1e1]">
                    <Label
                      htmlFor="currencyType"
                      className="text-sm mb-2 block"
                    >
                      달러 환산 (선택사항)
                    </Label>
                    <Select
                      value={currencyType || "원화선택"}
                      onValueChange={(value) =>
                        setCurrencyType(value as CurrencyType)
                      }
                    >
                      <SelectTrigger id="currencyType" className="w-full">
                        <SelectValue placeholder="통화 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="원화선택">원화만 표시</SelectItem>
                        <SelectItem value="USD">미국 달러 (USD)</SelectItem>
                        <SelectItem value="CAD">캐나다 달러 (CAD)</SelectItem>
                      </SelectContent>
                    </Select>
                    {currencyType && (
                      <div className="mt-2 text-sm text-gray-600">
                        {loadingExchangeRate ? (
                          <span>환율 로딩 중...</span>
                        ) : (
                          <>
                            <span>
                              환율: 1원 ={" "}
                              {exchangeRate.toFixed(6).replace(/\.0+$/, "")}{" "}
                              {currencyType}
                            </span>
                            {totalAmountDollar !== undefined && (
                              <div className="mt-1 font-semibold text-base">
                                총액:{" "}
                                {formatDollar(totalAmountDollar, currencyType)}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-3 border-t-2 border-[#e1e1e1]">
                    <h3>
                      <strong>총 금액</strong>
                    </h3>
                    <div className="text-right">
                      <h3 style={{ color: "var(--main-color)" }}>
                        <strong>{formatCurrency(totalAmount)}원</strong>
                      </h3>
                      {totalAmountDollar !== undefined && currencyType && (
                        <div
                          className="text-sm font-normal mt-1"
                          style={{ color: "#666" }}
                        >
                          ({formatDollar(totalAmountDollar, currencyType)})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Discount Management */}
              <div className="pt-4 border-t border-[#e1e1e1]">
                <Label className="mb-3 block">할인 항목</Label>

                {discounts.length > 0 && (
                  <div className="space-y-3 mb-3">
                    {discounts.map((discount) => (
                      <div
                        key={discount.id}
                        className="mobile-stack grid grid-cols-12 gap-3 p-3 rounded-lg"
                      >
                        <div className="col-span-12 sm:col-span-5">
                          <Input
                            placeholder="할인 명목 (예: 장기계약 할인)"
                            value={discount.name}
                            onChange={(e) =>
                              handleUpdateDiscount(
                                discount.id,
                                "name",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="할인율"
                              value={discount.rate}
                              onChange={(e) =>
                                handleUpdateDiscount(
                                  discount.id,
                                  "rate",
                                  Number(e.target.value)
                                )
                              }
                            />
                            <span>%</span>
                          </div>
                        </div>
                        <div className="col-span-12 sm:col-span-4 flex items-center justify-between gap-2">
                          <span style={{ color: "#FE9A37" }}>
                            -{formatCurrency(discount.amount || 0)}원
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleDeleteDiscount(discount.id)}
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
                    ))}
                  </div>
                )}

                <Button
                  onClick={handleAddDiscount}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  할인 추가
                </Button>
              </div>

              {/* Notes */}
              <div className="pt-4">
                <Label>비고</Label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="추가 사항을 입력하세요."
                  className="w-full mt-2 p-3 border border-[#e1e1e1] rounded-lg resize-none"
                  rows={4}
                  style={{ fontSize: "1rem", lineHeight: "1.5" }}
                />
              </div>

              {/* AI Actions */}
              <div className="pt-4 border-t border-[#e1e1e1]">
                <Label className="mb-3 block">AI 견적 도우미</Label>
                <div className="ai-button-container">
                  <Button
                    onClick={handleGenerateAIQuote}
                    variant="outline"
                    disabled={isLoadingAI || items.length === 0}
                    className="ai-helper-button"
                    style={{
                      borderColor: "var(--main-color)",
                      color: "var(--gray)",
                      backgroundColor: "transparent",
                    }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isLoadingAI ? "AI 분석 중..." : "AI 견적 산출"}
                  </Button>
                  <Button
                    onClick={handleRequestAIReview}
                    variant="outline"
                    disabled={isLoadingAI || items.length === 0}
                    className="ai-helper-button"
                    style={{
                      borderColor: "var(--sub-color)",
                      color: "var(--gray)",
                      backgroundColor: "transparent",
                    }}
                  >
                    <FileCheck className="w-4 h-4 mr-2" />
                    {isLoadingAI ? "AI 분석 중..." : "견적서 검토 요청"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSaveQuote} variant="outline">
            견적서 저장
          </Button>
          <Button
            onClick={handleIssueQuote}
            style={{
              backgroundColor: "var(--main-color)",
              color: "var(--white)",
            }}
          >
            <Send className="w-4 h-4 mr-2" />
            {editingQuote?.issued ? "재발급" : "발급"}
          </Button>
          <Button onClick={handleDownloadPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            인쇄
          </Button>
          <Button
            onClick={handleGenerateSampleData}
            variant="outline"
            style={{
              backgroundColor: "var(--sub-color)",
              color: "var(--white)",
            }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            샘플 데이터 생성
          </Button>
        </div>
      </div>

      {/* AI Comparison Dialog */}
      <Dialog open={showAIComparison} onOpenChange={setShowAIComparison}>
        <DialogContent style={{ maxWidth: "64rem" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles
                className="w-5 h-5"
                style={{ color: "var(--sub-color)" }}
              />
              AI 견적 비교
            </DialogTitle>
          </DialogHeader>

          {aiSuggestion && (
            <div className="space-y-6">
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: "#e1e1e1" }}
              >
                <h4 className="mb-2">AI 분석 근거</h4>
                <ul className="space-y-1">
                  {aiSuggestion.reasoning.map((reason: string, i: number) => (
                    <li key={i} style={{ fontSize: "0.875rem" }}>
                      • {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Current Quote */}
                <div className="p-4 border border-[#e1e1e1] rounded-lg">
                  <h4 className="mb-4">현재 견적서</h4>
                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <div
                        key={i}
                        className="text-sm space-y-1 pb-2 border-b border-[#e1e1e1]"
                      >
                        <div className="font-medium">
                          {item.category} - {item.role}
                        </div>
                        <div style={{ color: "var(--gray)" }}>
                          {item.calculationType === "hourly" ? (
                            <>
                              시간: {item.hours}h, 일수: {item.days}일
                            </>
                          ) : (
                            <>일수: {item.days}일</>
                          )}
                        </div>
                        <div>{formatCurrency(item.amount)}원</div>
                      </div>
                    ))}
                    <div className="pt-3 space-y-2">
                      <div className="flex justify-between">
                        <span>소계</span>
                        <span>{formatCurrency(subtotal)}원</span>
                      </div>
                      <div className="flex justify-between">
                        <span>재경비</span>
                        <span>{formatCurrency(expenseAmount)}원</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <strong>총액</strong>
                        <div className="text-right">
                          <strong>
                            {formatCurrency(subtotal + expenseAmount)}원
                          </strong>
                          {currencyType && exchangeRate > 0 && (
                            <p className="text-sm text-gray-500">
                              (
                              {formatDollar(
                                convertToDollar(
                                  subtotal + expenseAmount,
                                  currencyType,
                                  exchangeRate
                                ),
                                currencyType
                              )}
                              )
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Suggested Quote */}
                <div
                  className="p-4 border-2 rounded-lg"
                  style={{
                    borderColor: "var(--sub-color)",
                    backgroundColor: "#f0f9ff",
                  }}
                >
                  <h4 className="mb-4 flex items-center gap-2">
                    <Sparkles
                      className="w-4 h-4"
                      style={{ color: "var(--sub-color)" }}
                    />
                    AI 제안 견적서
                  </h4>
                  <div className="space-y-2">
                    {aiSuggestion.items.map((item: any, i: number) => (
                      <div
                        key={i}
                        className="text-sm space-y-1 pb-2 border-b border-[#e1e1e1]"
                      >
                        <div className="font-medium">
                          {item.category} - {item.role}
                        </div>
                        <div style={{ color: "var(--gray)" }}>
                          {item.calculationType === "hourly" ? (
                            <>
                              시간: {item.aiHours}h, 일수: {item.aiDays}일
                            </>
                          ) : (
                            <>일수: {item.aiDays}일</>
                          )}
                        </div>
                        <div>{formatCurrency(item.aiAmount)}원</div>
                      </div>
                    ))}
                    <div className="pt-3 space-y-2">
                      <div className="flex justify-between">
                        <span>소계</span>
                        <span>{formatCurrency(aiSuggestion.subtotal)}원</span>
                      </div>
                      <div className="flex justify-between">
                        <span>재경비</span>
                        <span>
                          {formatCurrency(aiSuggestion.expenseAmount)}원
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <strong>총액</strong>
                        <div className="text-right">
                          <strong style={{ color: "var(--sub-color)" }}>
                            {formatCurrency(aiSuggestion.totalAmount)}원
                          </strong>
                          {currencyType && exchangeRate > 0 && (
                            <p className="text-sm text-gray-500">
                              (
                              {formatDollar(
                                convertToDollar(
                                  aiSuggestion.totalAmount,
                                  currencyType,
                                  exchangeRate
                                ),
                                currencyType
                              )}
                              )
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowAIComparison(false)}
                >
                  현재 견적 유지
                </Button>
                <Button
                  onClick={handleApplyAIQuote}
                  style={{
                    backgroundColor: "var(--sub-color)",
                    color: "var(--white)",
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI 견적 적용
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Review Dialog */}
      <Dialog open={showAIReview} onOpenChange={setShowAIReview}>
        <DialogContent style={{ maxWidth: "48rem" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck
                className="w-5 h-5"
                style={{ color: "var(--main-color)" }}
              />
              AI 견적서 검토 결과
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "#f9fafb",
                maxHeight: "32rem",
                overflowY: "auto",
              }}
            >
              <div style={{ whiteSpace: "pre-line", lineHeight: "1.8" }}>
                {aiReview}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setShowAIReview(false)}>확인</Button>
            </div>
          </div>
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
    </div>
  );
}
