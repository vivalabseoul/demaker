// 마이페이지 컴포넌트

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  getActiveSubscription,
  getSubscriptionHistory,
} from "../utils/supabaseSubscription";
import { getPaymentHistory } from "../utils/supabasePayment";
import { getQuotes } from "../utils/supabaseStore";
import { getProductById, formatProductPrice } from "../utils/products";
import { Subscription } from "../types/payment";
import { PaymentInfo } from "../types/payment";
import { Quote } from "../types/quote";
import { toast } from "sonner";
import { supabase } from "../utils/supabase";
import {
  User,
  CreditCard,
  Zap,
  History,
  Loader2,
  FileText,
  BarChart3,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface MyPageProps {
  onNavigate?: (page: string) => void;
}

export function MyPage({ onNavigate }: MyPageProps = {}) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<
    Subscription[]
  >([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentInfo[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    loadUser();
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  // 로딩바 애니메이션: 0%에서 100%로 채워지는 효과
  useEffect(() => {
    if (loading) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90; // 실제 로딩이 끝날 때까지 90%에서 대기
          }
          return prev + 10;
        });
      }, 100); // 100ms마다 10%씩 증가

      return () => clearInterval(interval);
    } else {
      // 로딩 완료 시 100%로 설정
      setLoadingProgress(100);
      setTimeout(() => setLoadingProgress(0), 300); // 잠시 후 0으로 리셋
    }
  }, [loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      // 병렬 로딩으로 성능 개선
      const [activeSub, subHistory, payHistory, allQuotes] = await Promise.all([
        getActiveSubscription().catch((err) => {
          console.warn("구독 정보 로드 실패:", err);
          return null;
        }),
        getSubscriptionHistory().catch((err) => {
          console.warn("구독 내역 로드 실패:", err);
          return [];
        }),
        getPaymentHistory().catch((err) => {
          console.warn("결제 내역 로드 실패:", err);
          return [];
        }),
        getQuotes(100).catch((err) => {
          console.warn("견적서 로드 실패:", err);
          return [];
        }),
      ]);
      setSubscription(activeSub);
      setSubscriptionHistory(subHistory);
      setPaymentHistory(payHistory);
      setQuotes(allQuotes);
    } catch (error: any) {
      console.error("Failed to load data:", error);
      toast.error("정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 통계 계산
  const totalQuotes = quotes.length;
  const issuedQuotes = quotes.filter((q) => q.issued).length;
  const thisMonthQuotes = quotes.filter((q) => {
    const quoteDate = new Date(q.createdDate);
    const now = new Date();
    return (
      quoteDate.getMonth() === now.getMonth() &&
      quoteDate.getFullYear() === now.getFullYear()
    );
  }).length;
  const thisMonthIssued = quotes.filter((q) => {
    if (!q.issued || !q.issuedDate) return false;
    const issuedDate = new Date(q.issuedDate);
    const now = new Date();
    return (
      issuedDate.getMonth() === now.getMonth() &&
      issuedDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-full max-w-md space-y-2">
            <Progress value={loadingProgress} className="h-3" />
            <p className="text-sm text-center" style={{ color: "#71717B" }}>
              정보를 불러오는 중... {loadingProgress}%
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
        {user && (
          <p className="text-base" style={{ color: "#71717B" }}>
            {user.email}
          </p>
        )}
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: "#71717B" }}>
                  전체 견적서
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "var(--main-color)" }}
                >
                  {totalQuotes}
                </p>
              </div>
              <FileText className="w-8 h-8" style={{ color: "#D6D3D1" }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: "#71717B" }}>
                  발급된 견적서
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "var(--main-color)" }}
                >
                  {issuedQuotes}
                </p>
              </div>
              <BarChart3 className="w-8 h-8" style={{ color: "#D6D3D1" }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: "#71717B" }}>
                  이번 달 발급
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "var(--main-color)" }}
                >
                  {thisMonthIssued}
                </p>
              </div>
              <Zap className="w-8 h-8" style={{ color: "#D6D3D1" }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscription" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="subscription">
            <Zap className="w-4 h-4 mr-2" />
            구독 정보
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            사용 내역
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscription">
          <div className="space-y-6">
            {/* 현재 구독 정보 */}
            {subscription ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap
                      className="w-5 h-5"
                      style={{ color: "var(--main-color)" }}
                    />
                    활성 구독
                  </CardTitle>
                  <CardDescription>현재 구독 정보 및 사용 현황</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm mb-1" style={{ color: "#71717B" }}>
                        상품명
                      </p>
                      <p className="text-lg font-semibold">
                        {getProductById(subscription.productId)?.name ||
                          subscription.productId}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ color: "#71717B" }}>
                        구독 기간
                      </p>
                      <p className="text-lg">
                        {new Date(subscription.startDate).toLocaleDateString(
                          "ko-KR"
                        )}{" "}
                        ~{" "}
                        {new Date(subscription.endDate).toLocaleDateString(
                          "ko-KR"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#e1e1e1]">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm" style={{ color: "#71717B" }}>
                        사용 가능 횟수
                      </p>
                      <p
                        className="text-lg font-semibold"
                        style={{ color: "var(--main-color)" }}
                      >
                        {subscription.quota - subscription.usedQuota} /{" "}
                        {subscription.quota}회
                      </p>
                    </div>
                    <div
                      className="w-full h-3 rounded-full"
                      style={{ backgroundColor: "#e1e1e1" }}
                    >
                      <div
                        className="h-3 rounded-full transition-all"
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
                  </div>

                  {subscription.reissueQuota > 0 && (
                    <div className="pt-4 border-t border-[#e1e1e1]">
                      <div className="flex items-center justify-between">
                        <p className="text-sm" style={{ color: "#71717B" }}>
                          재발급 가능 횟수
                        </p>
                        <p
                          className="text-lg font-semibold"
                          style={{ color: "var(--main-color)" }}
                        >
                          {subscription.reissueQuota -
                            (subscription.usedReissueQuota || 0)}{" "}
                          / {subscription.reissueQuota}회
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex gap-2">
                    <Button
                      onClick={() => {
                        const event = new CustomEvent("navigate", {
                          detail: "payment",
                        });
                        window.dispatchEvent(event);
                      }}
                      className="flex-1"
                      style={{ backgroundColor: "var(--main-color)" }}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      구독 관리
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <User
                    className="w-12 h-12 mx-auto mb-4"
                    style={{ color: "#71717B" }}
                  />
                  <p className="text-lg mb-2" style={{ color: "#71717B" }}>
                    활성 구독이 없습니다
                  </p>
                  <p className="text-sm mb-4" style={{ color: "#71717B" }}>
                    구독을 시작하여 견적서를 발급하세요.
                  </p>
                  <Button
                    onClick={() => {
                      const event = new CustomEvent("navigate", {
                        detail: "payment",
                      });
                      window.dispatchEvent(event);
                    }}
                    style={{ backgroundColor: "var(--main-color)" }}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    구독하기
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 구독 내역 */}
            {subscriptionHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>구독 내역</CardTitle>
                  <CardDescription>
                    지난 구독 내역을 확인할 수 있습니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>상품</TableHead>
                          <TableHead>상태</TableHead>
                          <TableHead>사용량</TableHead>
                          <TableHead>시작일</TableHead>
                          <TableHead>만료일</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscriptionHistory.map((sub) => {
                          const product = getProductById(sub.productId);
                          return (
                            <TableRow key={sub.id}>
                              <TableCell>
                                <div>
                                  <div className="font-semibold">
                                    {product?.name || sub.productId}
                                  </div>
                                  <div
                                    className="text-sm"
                                    style={{ color: "#71717B" }}
                                  >
                                    {formatProductPrice(product?.price || 0)} /{" "}
                                    {product?.period === "monthly"
                                      ? "월"
                                      : "연간"}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span
                                  style={{
                                    color:
                                      sub.status === "active"
                                        ? "#10b981"
                                        : sub.status === "expired"
                                        ? "#71717B"
                                        : "#f59e0b",
                                    fontWeight: 600,
                                  }}
                                >
                                  {sub.status === "active"
                                    ? "활성"
                                    : sub.status === "expired"
                                    ? "만료"
                                    : "취소"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div>
                                    {sub.usedQuota} / {sub.quota}회
                                  </div>
                                  {sub.reissueQuota > 0 && (
                                    <div
                                      className="text-xs mt-1"
                                      style={{ color: "#71717B" }}
                                    >
                                      재발급: {sub.usedReissueQuota || 0} /{" "}
                                      {sub.reissueQuota}회
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{formatDate(sub.startDate)}</TableCell>
                              <TableCell>{formatDate(sub.endDate)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-6">
            {/* 결제 내역 */}
            <Card>
              <CardHeader>
                <CardTitle>결제 내역</CardTitle>
                <CardDescription>
                  지난 결제 내역을 확인할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentHistory.length === 0 ? (
                  <div
                    className="text-center py-8"
                    style={{ color: "#71717B" }}
                  >
                    결제 내역이 없습니다.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>주문번호</TableHead>
                          <TableHead>상품명</TableHead>
                          <TableHead>금액</TableHead>
                          <TableHead>상태</TableHead>
                          <TableHead>결제일시</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentHistory.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-mono text-sm">
                              {payment.orderId}
                            </TableCell>
                            <TableCell>{payment.goodsName}</TableCell>
                            <TableCell>
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell>
                              <span
                                style={{
                                  color:
                                    payment.status === "completed"
                                      ? "#10b981"
                                      : payment.status === "failed"
                                      ? "#ef4444"
                                      : payment.status === "cancelled"
                                      ? "#f59e0b"
                                      : "#71717B",
                                  fontWeight: 600,
                                }}
                              >
                                {payment.status === "completed"
                                  ? "완료"
                                  : payment.status === "failed"
                                  ? "실패"
                                  : payment.status === "cancelled"
                                  ? "취소"
                                  : "대기중"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {payment.completedAt
                                ? formatDate(payment.completedAt)
                                : formatDate(payment.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 발급한 견적서 목록 */}
            <Card>
              <CardHeader>
                <CardTitle>발급한 견적서</CardTitle>
                <CardDescription>
                  발급된 견적서 목록을 확인할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {issuedQuotes === 0 ? (
                  <div
                    className="text-center py-8"
                    style={{ color: "#71717B" }}
                  >
                    발급된 견적서가 없습니다.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>견적번호</TableHead>
                          <TableHead>거래처</TableHead>
                          <TableHead>금액</TableHead>
                          <TableHead>발급일시</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quotes
                          .filter((q) => q.issued)
                          .sort((a, b) => {
                            const dateA = a.issuedDate
                              ? new Date(a.issuedDate).getTime()
                              : 0;
                            const dateB = b.issuedDate
                              ? new Date(b.issuedDate).getTime()
                              : 0;
                            return dateB - dateA;
                          })
                          .map((quote) => (
                            <TableRow key={quote.id}>
                              <TableCell className="font-mono text-sm">
                                {quote.quoteNumber}
                              </TableCell>
                              <TableCell>{quote.clientCompany.name}</TableCell>
                              <TableCell>
                                {new Intl.NumberFormat("ko-KR", {
                                  style: "currency",
                                  currency: "KRW",
                                }).format(quote.totalAmount)}
                              </TableCell>
                              <TableCell>
                                {quote.issuedDate
                                  ? formatDate(quote.issuedDate)
                                  : "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
