// 결제 페이지 컴포넌트

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
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
import { requestPayment, generateOrderId } from "../utils/nicepay";
import {
  savePaymentInfo,
  updatePaymentInfo,
  getPaymentHistory,
} from "../utils/supabasePayment";
import {
  saveSubscription,
  getActiveSubscription,
  getSubscriptionHistory,
} from "../utils/supabaseSubscription";
import {
  PRODUCTS,
  getProductById,
  formatProductPrice,
} from "../utils/products";
import {
  PaymentRequest,
  PaymentResponse,
  PaymentInfo,
  ProductId,
} from "../types/payment";
import { Subscription } from "../types/payment";
import { toast } from "sonner";
import { getCurrentUserId, supabase } from "../utils/supabase";
import { CreditCard, History, Loader2, Check, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export function PaymentPage() {
  const [selectedProductId, setSelectedProductId] = useState<ProductId | "">(
    ""
  );
  const [buyerName, setBuyerName] = useState<string>("");
  const [buyerEmail, setBuyerEmail] = useState<string>("");
  const [buyerTel, setBuyerTel] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentInfo[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeSubscription, setActiveSubscription] =
    useState<Subscription | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<
    Subscription[]
  >([]);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  useEffect(() => {
    // 사용자 정보 로드
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setBuyerEmail(session.user.email || "");
        setBuyerName(session.user.user_metadata?.name || session.user.user_metadata?.full_name || "");
      }
    };
    loadUser();

    // 결제 내역 로드
    loadPaymentHistory();
    // 구독 정보 로드
    loadSubscriptionInfo();
  }, []);

  const loadSubscriptionInfo = async () => {
    try {
      setLoadingSubscription(true);
      const active = await getActiveSubscription();
      setActiveSubscription(active);
      const history = await getSubscriptionHistory();
      setSubscriptionHistory(history);
    } catch (error: any) {
      console.error("Failed to load subscription info:", error);
      toast.error("구독 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoadingSubscription(false);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await getPaymentHistory();
      setPaymentHistory(history);
    } catch (error: any) {
      console.error("Failed to load payment history:", error);
      toast.error("결제 내역을 불러오는데 실패했습니다.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedProductId) {
      toast.error("상품을 선택해주세요.");
      return;
    }

    const product = getProductById(selectedProductId);
    if (!product) {
      toast.error("선택한 상품을 찾을 수 없습니다.");
      return;
    }

    if (!buyerName.trim()) {
      toast.error("구매자명을 입력해주세요.");
      return;
    }

    if (!buyerEmail.trim()) {
      toast.error("이메일을 입력해주세요.");
      return;
    }

    setIsProcessing(true);

    try {
      const orderId = generateOrderId();
      const paymentRequest: PaymentRequest = {
        orderId,
        amount: product.price,
        goodsName: `${product.name} 구독 (${product.description})`,
        buyerName,
        buyerEmail,
        buyerTel: buyerTel || undefined,
      };

      // 결제 정보 미리 저장 (pending 상태)
      const paymentId = await savePaymentInfo({
        orderId,
        amount: product.price,
        goodsName: paymentRequest.goodsName,
        status: "pending",
        buyerName,
        buyerEmail,
        buyerTel: buyerTel || undefined,
      });

      // 나이스페이먼트 결제 요청
      await requestPayment(
        paymentRequest,
        async (response: PaymentResponse) => {
          // 결제 성공
          try {
            await updatePaymentInfo(paymentId, {
              status: "completed",
              tid: response.tid,
              payMethod: response.payMethod,
              completedAt: response.paidAt || new Date().toISOString(),
            });

            // 구독 정보 저장
            await saveSubscription(
              selectedProductId as ProductId,
              product.quota
            );

            toast.success("결제가 완료되었습니다.");
            setIsProcessing(false);
            loadPaymentHistory();
            loadSubscriptionInfo();
            setSelectedProductId(""); // 선택 초기화
          } catch (error: any) {
            console.error("Failed to update payment info:", error);
            toast.error("결제 정보 업데이트에 실패했습니다.");
            setIsProcessing(false);
          }
        },
        async (error: Error) => {
          // 결제 실패
          try {
            await updatePaymentInfo(paymentId, {
              status: "failed",
            });
            toast.error(error.message || "결제에 실패했습니다.");
            setIsProcessing(false);
          } catch (updateError: any) {
            console.error("Failed to update payment info:", updateError);
            setIsProcessing(false);
          }
        }
      );
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "결제 처리 중 오류가 발생했습니다.");
      setIsProcessing(false);
    }
  };

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

  const getStatusLabel = (status: PaymentInfo["status"]): string => {
    switch (status) {
      case "pending":
        return "대기중";
      case "completed":
        return "완료";
      case "failed":
        return "실패";
      case "cancelled":
        return "취소";
      default:
        return status;
    }
  };

  const getStatusColor = (status: PaymentInfo["status"]): string => {
    switch (status) {
      case "pending":
        return "#71717B";
      case "completed":
        return "#10b981";
      case "failed":
        return "#ef4444";
      case "cancelled":
        return "#f59e0b";
      default:
        return "#71717B";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-4xl font-bold mb-6">구독 관리</h1>

      <Tabs defaultValue="payment" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="payment">
            <CreditCard className="w-4 h-4 mr-2" />
            결제하기
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            결제 내역
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment">
          {/* 현재 구독 정보 표시 */}
          {activeSubscription && (
            <Card
              className="mb-6"
              style={{ borderColor: "#10b981", backgroundColor: "#f0fdf4" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Check className="w-5 h-5" style={{ color: "#10b981" }} />
                  활성 구독 중
                </CardTitle>
                <CardDescription>
                  {getProductById(activeSubscription.productId)?.name} - 사용
                  가능:{" "}
                  {activeSubscription.quota - activeSubscription.usedQuota} /{" "}
                  {activeSubscription.quota}회 (만료일:{" "}
                  {new Date(activeSubscription.endDate).toLocaleDateString(
                    "ko-KR"
                  )}
                  )
                </CardDescription>
                <CardDescription className="mt-2">
                  수정해서 재발급:{" "}
                  {activeSubscription.reissueQuota -
                    (activeSubscription.usedReissueQuota || 0)}{" "}
                  / {activeSubscription.reissueQuota || 1}회 사용 가능
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* 가격 안내 섹션 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">구독 상품 안내</CardTitle>
              <CardDescription>
                원하시는 상품을 선택하여 구독하실 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {PRODUCTS.map((product) => (
                  <Card
                    key={product.id}
                    className={`cursor-pointer transition-all relative ${
                      selectedProductId === product.id || product.id === "basic"
                        ? "border-2"
                        : "border border-[#D4D4D4] hover:border-[#71717B]"
                    }`}
                    style={{
                      borderColor:
                        selectedProductId === product.id ||
                        product.id === "basic"
                          ? "var(--main-color)"
                          : undefined,
                      backgroundColor:
                        selectedProductId === product.id ? "#f0f9ff" : "white",
                    }}
                    onClick={() => setSelectedProductId(product.id)}
                  >
                    <CardHeader className="relative">
                      {product.id === "basic" && (
                        <div className="absolute top-2 right-2 bg-[var(--main-color)] text-white px-3 py-1 rounded-lg text-xs font-bold z-10">
                          베스트
                        </div>
                      )}
                      <CardTitle className="text-2xl">{product.name}</CardTitle>
                      <CardDescription>{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {product.originalPrice && (
                        <div className="mb-2">
                          <span
                            className="text-sm line-through"
                            style={{ color: "#71717B" }}
                          >
                            {formatProductPrice(product.originalPrice)}
                          </span>
                        </div>
                      )}
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "var(--main-color)" }}
                      >
                        {formatProductPrice(product.price)}
                      </div>
                      <div
                        className="text-sm mt-2"
                        style={{ color: "#71717B" }}
                      >
                        {product.period === "monthly" ? "/월" : "/연간"}
                      </div>
                      {product.paidQuota && product.freeQuota && (
                        <div
                          className="text-sm mt-2 font-semibold"
                          style={{ color: "var(--main-color)" }}
                        >
                          {product.quota}회 ({product.paidQuota}+{product.freeQuota})
                        </div>
                      )}
                      {selectedProductId === product.id && (
                        <div
                          className="mt-4 flex items-center gap-2 text-sm"
                          style={{ color: "var(--main-color)" }}
                        >
                          <Check className="w-4 h-4" />
                          선택됨
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 결제 정보 입력 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">결제 정보 입력</CardTitle>
              <CardDescription>
                나이스페이먼트 결제 (테스트 모드) - 실제 결제가 발생하지
                않습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProductId && (
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e1e1e1",
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        {getProductById(selectedProductId)?.name}
                      </p>
                      <p className="text-sm" style={{ color: "#71717B" }}>
                        {getProductById(selectedProductId)?.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-xl font-bold"
                        style={{ color: "var(--main-color)" }}
                      >
                        {selectedProductId &&
                          formatProductPrice(
                            getProductById(selectedProductId)?.price || 0
                          )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buyerName">구매자명</Label>
                  <Input
                    id="buyerName"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="구매자명을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyerEmail">이메일</Label>
                  <Input
                    id="buyerEmail"
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="이메일을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyerTel">전화번호 (선택)</Label>
                  <Input
                    id="buyerTel"
                    value={buyerTel}
                    onChange={(e) => setBuyerTel(e.target.value)}
                    placeholder="전화번호를 입력하세요"
                  />
                </div>

                <div className="space-y-2 flex flex-col">
                  <Label className="opacity-0">버튼</Label>
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full"
                    style={{ 
                      backgroundColor: "#FF6B35",
                      color: "#FFFFFF",
                      padding: "2rem",
                      minWidth: "150px"
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        결제 처리 중...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        결제하기
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-6">
            {/* 구독 내역 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Zap className="w-5 h-5" />
                  구독 내역
                </CardTitle>
                <CardDescription>
                  구독 내역을 확인할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSubscription ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2
                      className="w-6 h-6 animate-spin"
                      style={{ color: "#71717B" }}
                    />
                  </div>
                ) : subscriptionHistory.length === 0 ? (
                  <div
                    className="text-center py-8"
                    style={{ color: "#71717B" }}
                  >
                    구독 내역이 없습니다.
                  </div>
                ) : (
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
                        {subscriptionHistory.map((subscription) => {
                          const product = getProductById(
                            subscription.productId
                          );
                          return (
                            <TableRow key={subscription.id}>
                              <TableCell>
                                <div>
                                  <div className="font-semibold">
                                    {product?.name || subscription.productId}
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
                                      subscription.status === "active"
                                        ? "#10b981"
                                        : subscription.status === "expired"
                                        ? "#71717B"
                                        : "#f59e0b",
                                    fontWeight: 600,
                                  }}
                                >
                                  {subscription.status === "active"
                                    ? "활성"
                                    : subscription.status === "expired"
                                    ? "만료"
                                    : "취소"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div>
                                    {subscription.usedQuota} /{" "}
                                    {subscription.quota}회
                                  </div>
                                  <div
                                    className="text-xs mt-1"
                                    style={{ color: "#71717B" }}
                                  >
                                    재발급: {subscription.usedReissueQuota || 0}{" "}
                                    / {subscription.reissueQuota || 1}회
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {formatDate(subscription.startDate)}
                              </TableCell>
                              <TableCell>
                                {formatDate(subscription.endDate)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 결제 내역 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard className="w-5 h-5" />
                  결제 내역
                </CardTitle>
                <CardDescription>
                  지난 결제 내역을 확인할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2
                      className="w-6 h-6 animate-spin"
                      style={{ color: "#71717B" }}
                    />
                  </div>
                ) : paymentHistory.length === 0 ? (
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
                                  color: getStatusColor(payment.status),
                                  fontWeight: 600,
                                }}
                              >
                                {getStatusLabel(payment.status)}
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
