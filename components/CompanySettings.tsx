import { useState, useEffect } from "react";
import { Save, Banknote } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { CompanyInfo } from "../types/quote";
import { getOurCompany, saveOurCompany, getPaymentInfo, savePaymentInfo, BankAccountInfo } from "../utils/supabaseStore";
import { supabase } from "../utils/supabase";
import { toast } from "sonner";

export function CompanySettings() {
  const [company, setCompany] = useState<CompanyInfo>({
    name: "",
    representative: "",
    address: "",
    phone: "",
    email: "",
    registrationNumber: "",
    expenseRate: 10,
    technicalFeeRate: undefined,
    fpCalculationRate: undefined,
  });
  const [paymentInfo, setPaymentInfo] = useState<BankAccountInfo>({
    domestic: {
      bankName: "",
      accountNumber: "",
      accountHolder: "",
      notes: "",
    },
    international: {
      bankName: "",
      accountNumber: "",
      accountHolder: "",
      swiftCode: "",
      notes: "",
    },
  });
  const [selectedPaymentType, setSelectedPaymentType] = useState<"domestic" | "international" | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    loadCompany();
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

  const loadCompany = async () => {
    try {
      setLoading(true);
      console.log("회사정보 로드 시작");
      const [saved, loadedPayment] = await Promise.all([
        getOurCompany(),
        getPaymentInfo(),
      ]);
      console.log("회사정보 로드 완료:", saved);
      if (saved) {
        setCompany(saved);
      }
      if (loadedPayment) {
        setPaymentInfo({
          domestic: loadedPayment.domestic || {
            bankName: "",
            accountNumber: "",
            accountHolder: "",
            notes: "",
          },
          international: loadedPayment.international || {
            bankName: "",
            accountNumber: "",
            accountHolder: "",
            swiftCode: "",
            notes: "",
          },
        });
        if (loadedPayment.selectedType) {
          setSelectedPaymentType(loadedPayment.selectedType);
        }
      }
    } catch (error: any) {
      console.error("회사정보 로드 오류:", error);
      toast.error("회사정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CompanyInfo, value: string) => {
    // 전화번호: 숫자와 하이픈만 허용
    if (field === "phone") {
      const phoneRegex = /^[0-9-]*$/;
      if (value && !phoneRegex.test(value)) {
        return; // 유효하지 않은 문자는 입력 불가
      }
    }

    // 사업자등록번호: 숫자와 하이픈만 허용
    if (field === "registrationNumber") {
      const regNumRegex = /^[0-9-]*$/;
      if (value && !regNumRegex.test(value)) {
        return; // 유효하지 않은 문자는 입력 불가
      }
    }

    setCompany({ ...company, [field]: value });
  };

  // 유효성 검사 함수
  const validateForm = (): boolean => {
    // 필수 입력값 체크
    if (!company.name.trim()) {
      toast.error("회사명을 입력해주세요.");
      return false;
    }

    if (!company.representative.trim()) {
      toast.error("대표자명을 입력해주세요.");
      return false;
    }

    // 전화번호 형식 검증 (선택사항이지만 입력된 경우 형식 확인)
    if (company.phone.trim()) {
      const phoneRegex = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;
      if (!phoneRegex.test(company.phone.trim())) {
        toast.error(
          "전화번호 형식이 올바르지 않습니다. (예: 02-1234-5678 또는 010-1234-5678)"
        );
        return false;
      }
    }

    // 이메일 형식 검증 (선택사항이지만 입력된 경우 형식 확인)
    if (company.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(company.email.trim())) {
        toast.error("이메일 형식이 올바르지 않습니다. (예: info@example.com)");
        return false;
      }
    }

    // 사업자등록번호 형식 검증 (선택사항이지만 입력된 경우 형식 확인)
    if (company.registrationNumber.trim()) {
      const regNumRegex = /^[0-9]{3}-[0-9]{2}-[0-9]{5}$/;
      if (!regNumRegex.test(company.registrationNumber.trim())) {
        toast.error(
          "사업자등록번호 형식이 올바르지 않습니다. (예: 123-45-67890)"
        );
        return false;
      }
    }

    return true;
  };

  const handleSaveCompany = async () => {
    // 유효성 검사
    if (!validateForm()) {
      return;
    }

    // 이미 저장 중이면 중복 실행 방지
    if (saving) {
      toast.warning("이미 저장 중입니다. 잠시만 기다려주세요.");
      return;
    }

    // 사용자 인증 확인
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.error(
        "로그인이 필요합니다. 페이지를 새로고침하고 다시 로그인해주세요."
      );
      console.error("❌ 사용자 인증 실패");
      return;
    }

    console.log("🔵 사용자 확인:", {
      uid: session.user.id,
      email: session.user.email,
    });

    setSaving(true);
    try {
      console.log("🔵 회사정보 저장 시작:", {
        name: company.name,
        representative: company.representative,
        phone: company.phone,
        email: company.email,
        registrationNumber: company.registrationNumber,
        address: company.address,
      });

      // 저장 실행
      await saveOurCompany(company);
      console.log("✅ 회사정보 저장 성공");

      // 잠시 대기 후 데이터 다시 로드
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 저장 후 데이터 다시 로드하여 확인
      const saved = await getOurCompany();
      if (saved) {
        setCompany(saved);
        console.log("✅ 저장된 데이터 확인:", saved);

        // 저장된 데이터와 입력한 데이터 비교
        const isMatch =
          saved.name === company.name &&
          saved.representative === company.representative &&
          saved.phone === company.phone &&
          saved.email === company.email &&
          saved.registrationNumber === company.registrationNumber &&
          saved.address === company.address;

        if (isMatch) {
          toast.success("✅ 회사 정보가 저장되었습니다!");
        } else {
          console.warn("⚠️ 저장된 데이터가 일치하지 않습니다:", {
            saved,
            expected: company,
          });
          toast.warning(
            "저장되었지만 일부 데이터가 다를 수 있습니다. 페이지를 새로고침해주세요."
          );
        }
      } else {
        console.warn("⚠️ 저장 후 데이터를 불러올 수 없습니다.");
        toast.warning(
          "저장되었지만 데이터 확인 중 문제가 발생했습니다. 페이지를 새로고침해주세요."
        );
      }
    } catch (error: any) {
      console.error("❌ 회사 정보 저장 오류:", error);
      console.error("에러 상세:", {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
        name: error?.name,
      });

      let errorMessage = "알 수 없는 오류가 발생했습니다.";

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.code) {
        errorMessage = `Firebase 오류 (${error.code})`;
      }

      toast.error(`저장 실패: ${errorMessage}`, {
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayment = async () => {
    // 이미 저장 중이면 중복 실행 방지
    if (savingPayment) {
      toast.warning("이미 저장 중입니다. 잠시만 기다려주세요.");
      return;
    }

    // 사용자 인증 확인
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.error(
        "로그인이 필요합니다. 페이지를 새로고침하고 다시 로그인해주세요."
      );
      return;
    }

    setSavingPayment(true);
    try {
      const paymentInfoToSave = {
        ...paymentInfo,
        selectedType: selectedPaymentType,
      };
      
      await savePaymentInfo(paymentInfoToSave);
      console.log("✅ 입금정보 저장 성공");
      toast.success("✅ 입금 정보가 저장되었습니다!");
    } catch (error: any) {
      console.error("❌ 입금 정보 저장 오류:", error);
      toast.error(`저장 실패: ${error?.message || "알 수 없는 오류가 발생했습니다."}`);
    } finally {
      setSavingPayment(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1>회사 정보</h1>
        <p className="mt-2">견적서에 표시될 당사 정보를 등록하세요.</p>
      </div>

      {loading ? (
        <Card style={{ backgroundColor: "var(--white)", maxWidth: "48rem" }}>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <p style={{ color: "#71717B" }}>
                회사정보를 불러오는 중... {loadingProgress}%
              </p>
              <Progress value={loadingProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
        <Card style={{ backgroundColor: "var(--white)", maxWidth: "48rem" }}>
          <CardHeader>
            <h3>기본 정보</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label>회사명</Label>
                <Input
                  value={company.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="주식회사 예제"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>대표자명</Label>
                <Input
                  value={company.representative}
                  onChange={(e) =>
                    handleChange("representative", e.target.value)
                  }
                  placeholder="홍길동"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>사업자등록번호</Label>
                <Input
                  value={company.registrationNumber}
                  onChange={(e) =>
                    handleChange("registrationNumber", e.target.value)
                  }
                  placeholder="123-45-67890"
                  className="mt-2"
                  maxLength={12}
                />
                <p className="text-sm mt-1" style={{ color: "#D6D3D1" }}>
                  형식: 123-45-67890 (숫자와 하이픈만 입력 가능)
                </p>
              </div>

              <div>
                <Label>주소</Label>
                <Input
                  value={company.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="서울특별시 강남구 테헤란로 123"
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-2 max-[767px]:grid-cols-1">
                <div>
                  <Label>전화번호</Label>
                  <Input
                    value={company.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="02-1234-5678"
                    className="mt-2"
                    maxLength={13}
                  />
                  <p className="text-sm mt-1" style={{ color: "#D6D3D1" }}>
                    형식: 02-1234-5678 또는 010-1234-5678
                  </p>
                </div>

                <div>
                  <Label>이메일</Label>
                  <Input
                    type="email"
                    value={company.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="info@example.com"
                    className="mt-2"
                  />
                  <p className="text-sm mt-1" style={{ color: "#D6D3D1" }}>
                    형식: info@example.com
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 md:grid-cols-3 max-[767px]:grid-cols-1 pt-4 border-t border-[#e1e1e1]">
                <div>
                  <Label>재경비 비율 (%)</Label>
                  <Input
                    type="number"
                    value={company.expenseRate || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : Number(e.target.value);
                      setCompany({ ...company, expenseRate: value });
                    }}
                    placeholder="10"
                    className="mt-2"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <p className="text-sm mt-1" style={{ color: "#D6D3D1" }}>
                    견적서 작성 시 기본값으로 사용됩니다
                  </p>
                </div>

                <div>
                  <Label>기술료 비율 (%)</Label>
                  <Input
                    type="number"
                    value={company.technicalFeeRate || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : Number(e.target.value);
                      setCompany({ ...company, technicalFeeRate: value });
                    }}
                    placeholder="미설정"
                    className="mt-2"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <p className="text-sm mt-1" style={{ color: "#D6D3D1" }}>
                    견적서 작성 시 기본값으로 사용됩니다
                  </p>
                </div>

                <div>
                  <Label>FP산정료 비율 (%)</Label>
                  <Input
                    type="number"
                    value={company.fpCalculationRate || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : Number(e.target.value);
                      setCompany({ ...company, fpCalculationRate: value });
                    }}
                    placeholder="미설정"
                    className="mt-2"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <p className="text-sm mt-1" style={{ color: "#D6D3D1" }}>
                    견적서 작성 시 기본값으로 사용됩니다
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-center max-[767px]:w-full">
                <Button
                  onClick={handleSaveCompany}
                  disabled={saving || loading}
                  style={{
                    backgroundColor: saving ? "#D6D3D1" : "var(--main-color)",
                    color: "var(--white)",
                  }}
                  className="max-[767px]:w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "저장 중..." : "회사 정보 저장"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 입금 정보 섹션 */}
        <Card style={{ backgroundColor: "var(--white)", maxWidth: "48rem", marginTop: "2rem" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5" />
              입금 정보
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">PDF에 표시할 계좌를 선택하세요.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 한국 계좌 */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">한국 계좌</h3>
                  <Button
                    type="button"
                    variant={selectedPaymentType === "domestic" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPaymentType("domestic")}
                  >
                    {selectedPaymentType === "domestic" ? "✓ 선택됨" : "선택"}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="domesticBankName">은행명 *</Label>
                    <Input
                      id="domesticBankName"
                      value={paymentInfo.domestic?.bankName || ""}
                      onChange={(e) => {
                        setPaymentInfo({
                          ...paymentInfo,
                          domestic: {
                            ...paymentInfo.domestic!,
                            bankName: e.target.value,
                          },
                        });
                      }}
                      placeholder="예: 국민은행"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="domesticAccountNumber">계좌번호 *</Label>
                    <Input
                      id="domesticAccountNumber"
                      value={paymentInfo.domestic?.accountNumber || ""}
                      onChange={(e) => {
                        setPaymentInfo({
                          ...paymentInfo,
                          domestic: {
                            ...paymentInfo.domestic!,
                            accountNumber: e.target.value,
                          },
                        });
                      }}
                      placeholder="예: 123-456-789012"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="domesticAccountHolder">예금주 *</Label>
                    <Input
                      id="domesticAccountHolder"
                      value={paymentInfo.domestic?.accountHolder || ""}
                      onChange={(e) => {
                        setPaymentInfo({
                          ...paymentInfo,
                          domestic: {
                            ...paymentInfo.domestic!,
                            accountHolder: e.target.value,
                          },
                        });
                      }}
                      placeholder="예: 홍길동"
                      className="mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="domesticNotes">입금 안내사항 (선택)</Label>
                  <Textarea
                    id="domesticNotes"
                    value={paymentInfo.domestic?.notes || ""}
                    onChange={(e) => {
                      setPaymentInfo({
                        ...paymentInfo,
                        domestic: {
                          ...paymentInfo.domestic!,
                          notes: e.target.value,
                        },
                      });
                    }}
                    rows={3}
                    className="mt-2"
                    placeholder="예: 입금 시 견적번호를 메모란에 기재해주세요."
                  />
                </div>
              </div>

              {/* 해외 계좌 */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">해외 계좌</h3>
                  <Button
                    type="button"
                    variant={selectedPaymentType === "international" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPaymentType("international")}
                  >
                    {selectedPaymentType === "international" ? "✓ 선택됨" : "선택"}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="internationalBankName">은행명 *</Label>
                    <Input
                      id="internationalBankName"
                      value={paymentInfo.international?.bankName || ""}
                      onChange={(e) => {
                        setPaymentInfo({
                          ...paymentInfo,
                          international: {
                            ...paymentInfo.international!,
                            bankName: e.target.value,
                          },
                        });
                      }}
                      placeholder="예: Bank of America"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="internationalAccountNumber">계좌번호 *</Label>
                    <Input
                      id="internationalAccountNumber"
                      value={paymentInfo.international?.accountNumber || ""}
                      onChange={(e) => {
                        setPaymentInfo({
                          ...paymentInfo,
                          international: {
                            ...paymentInfo.international!,
                            accountNumber: e.target.value,
                          },
                        });
                      }}
                      placeholder="예: 1234567890"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="internationalAccountHolder">예금주 *</Label>
                    <Input
                      id="internationalAccountHolder"
                      value={paymentInfo.international?.accountHolder || ""}
                      onChange={(e) => {
                        setPaymentInfo({
                          ...paymentInfo,
                          international: {
                            ...paymentInfo.international!,
                            accountHolder: e.target.value,
                          },
                        });
                      }}
                      placeholder="예: John Doe"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="internationalSwiftCode">SWIFT 코드 *</Label>
                    <Input
                      id="internationalSwiftCode"
                      value={paymentInfo.international?.swiftCode || ""}
                      onChange={(e) => {
                        setPaymentInfo({
                          ...paymentInfo,
                          international: {
                            ...paymentInfo.international!,
                            swiftCode: e.target.value,
                          },
                        });
                      }}
                      placeholder="예: BOFAUS3N"
                      className="mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="internationalNotes">입금 안내사항 (선택)</Label>
                  <Textarea
                    id="internationalNotes"
                    value={paymentInfo.international?.notes || ""}
                    onChange={(e) => {
                      setPaymentInfo({
                        ...paymentInfo,
                        international: {
                          ...paymentInfo.international!,
                          notes: e.target.value,
                        },
                      });
                    }}
                    rows={3}
                    className="mt-2"
                    placeholder="예: Please include quote number in transfer memo."
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-center max-[767px]:w-full">
                <Button
                  onClick={handleSavePayment}
                  disabled={savingPayment || loading}
                  style={{
                    backgroundColor: savingPayment ? "#D6D3D1" : "var(--main-color)",
                    color: "var(--white)",
                  }}
                  className="max-[767px]:w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savingPayment ? "저장 중..." : "입금 정보 저장"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}
