// 랜딩페이지 컴포넌트

import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  FileText,
  Zap,
  BarChart3,
  Users,
  TrendingUp,
  Check,
  ArrowRight,
  CreditCard,
  Shield,
  Clock,
  Download,
} from "lucide-react";
import { PRODUCTS, formatProductPrice } from "../utils/products";
import { Quote } from "../types/quote";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
// 이미지 import (public 폴더의 이미지 사용)
// import.meta.env.BASE_URL을 사용하여 base path를 자동으로 포함
const baseUrl = import.meta.env.BASE_URL || '/';
const mocupImage = `${baseUrl}images/mocup.png`;
const mocup2Image = `${baseUrl}images/mocup2.png`;
const gmainImage = `${baseUrl}images/gmain.jpg`;
const gmain2Image = `${baseUrl}images/gmain2.jpg`;

interface LandingPageProps {
  onLoginClick: () => void;
  onGetStarted: () => void;
}

export function LandingPage({ onLoginClick, onGetStarted }: LandingPageProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>("basic");
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set()
  );
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute("data-section-id");
          if (sectionId) {
            setVisibleSections((prev) => new Set(prev).add(sectionId));
          }
        }
      });
    }, observerOptions);

    // 약간의 지연 후 모든 섹션 ref를 관찰 (ref가 설정된 후)
    const timeoutId = setTimeout(() => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) {
          observer.observe(ref);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  const features = [
    {
      icon: FileText,
      title: "견적서 작성",
      description: "간편한 인터페이스로 전문적인 견적서를 빠르게 작성하세요.",
    },
    {
      icon: BarChart3,
      title: "견적서 관리",
      description:
        "작성한 견적서를 체계적으로 관리하고 언제든지 수정할 수 있습니다.",
    },
    {
      icon: Users,
      title: "거래처 관리",
      description: "거래처 정보를 저장하고 빠르게 불러와 사용할 수 있습니다.",
    },
    {
      icon: TrendingUp,
      title: "매출 관리",
      description: "견적서 기반으로 매출 통계를 한눈에 확인하세요.",
    },
    {
      icon: Zap,
      title: "빠른 작업",
      description: "템플릿과 자동 계산으로 작업 시간을 단축하세요.",
    },
    {
      icon: Download,
      title: "PDF 다운로드",
      description: "작성한 견적서를 PDF로 다운로드하여 고객에게 전달하세요.",
    },
  ];

  const benefits = [
    "첫 견적서 무료 발급",
    "간편한 템플릿 기반 작성",
    "자동 금액 계산",
    "거래처 정보 자동 저장",
    "PDF 다운로드 지원",
    "모바일 최적화",
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f9fafb" }}>
      {/* Hero Section */}
      <section
        className="relative w-full px-6 py-20 overflow-hidden"
        style={{
          backgroundColor: "#000000",
          backgroundImage: `url(${mocup2Image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "600px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* 블랙 오버레이 */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          }}
        />

        {/* 불빛 효과 배경 */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(0, 255, 136, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(0, 255, 136, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 20%, rgba(0, 255, 136, 0.2) 0%, transparent 50%)
            `,
            animation: "glowMove 8s ease-in-out infinite alternate",
          }}
        />

        {/* 움직이는 불빛 효과 */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(45deg, transparent 30%, rgba(0, 255, 136, 0.1) 50%, transparent 70%),
              linear-gradient(-45deg, transparent 30%, rgba(0, 255, 136, 0.1) 50%, transparent 70%)
            `,
            backgroundSize: "200% 200%",
            animation: "lightSweep 6s linear infinite",
          }}
        />

        <div className="max-w-[95%] mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* 목업 이미지 - 데스크탑에서는 좌측, 모바일에서는 상단 */}
            <div className="flex justify-center lg:justify-start order-1 lg:order-1 flex-shrink-0">
              <img
                src={mocupImage}
                alt="개발 견적 메이커 목업"
                className="max-w-full h-auto"
                style={{ maxHeight: "500px" }}
              />
            </div>
            {/* 텍스트 및 버튼 - 데스크탑에서는 우측, 모바일에서는 하단 */}
            <div className="text-center lg:text-left order-2 lg:order-2 flex-1">
              <p className="text-lg md:text-xl mb-2" style={{ color: "#fff" }}>
                개발 견적 메이커
              </p>
              <h1
                className="text-6xl md:text-7xl font-bold mb-6"
                style={{
                  color: "#00ff88",
                }}
              >
                Quote Maker
              </h1>
              <p className="text-xl md:text-2xl mb-8" style={{ color: "#fff" }}>
                전문적인 소프트웨어 개발 견적서를 빠르고 쉽게 작성하세요
              </p>
              <p className="text-lg mb-8" style={{ color: "#fff" }}>
                템플릿 기반 작성, 자동 계산, PDF 다운로드까지
                <br />
                소프트웨어, 웹,앱 개발 프로젝트 견적서 작성을 한 곳에서
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={onGetStarted}
                  size="lg"
                  className="text-lg px-8 py-6 relative overflow-hidden"
                  style={{
                    backgroundColor: "#00ff88",
                    color: "#000000",
                  }}
                >
                  <span className="relative z-10 flex items-center">
                    무료로 시작하기
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </span>
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                      transform: "translateX(-100%)",
                      animation: "shimmer 3s infinite",
                    }}
                  />
                </Button>
                <Button
                  onClick={onLoginClick}
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6"
                  style={{
                    borderColor: "#00ff88",
                    color: "#00ff88",
                    backgroundColor: "transparent",
                  }}
                >
                  로그인
                </Button>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes glowMove {
            0% {
              background: radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.4) 0%, transparent 50%),
                          radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
                          radial-gradient(circle at 40% 20%, rgba(16, 185, 129, 0.2) 0%, transparent 50%);
            }
            50% {
              background: radial-gradient(circle at 60% 30%, rgba(16, 185, 129, 0.4) 0%, transparent 50%),
                          radial-gradient(circle at 30% 70%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
                          radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.2) 0%, transparent 50%);
            }
            100% {
              background: radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.4) 0%, transparent 50%),
                          radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
                          radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.2) 0%, transparent 50%);
            }
          }

          @keyframes lightSweep {
            0% {
              background-position: 0% 0%;
            }
            100% {
              background-position: 200% 200%;
            }
          }

          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </section>

      {/* Features Section */}
      <section
        className="w-full px-6 py-20"
        style={{ backgroundColor: "white" }}
      >
        <div className="max-w-6xl mx-auto">
          <h2
            ref={(el) => (sectionRefs.current["features"] = el)}
            data-section-id="features"
            className={`text-4xl font-bold text-center mb-4 transition-all duration-700 ${
              visibleSections.has("features")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ color: "var(--black)" }}
          >
            주요 기능
          </h2>
          <p className="text-center mb-12" style={{ color: "#71717B" }}>
            개발 견적서 작성에 필요한 모든 기능을 제공합니다
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="space-y-3">
                <h3
                  className="text-2xl font-bold"
                  style={{ color: "var(--black)" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-lg leading-relaxed"
                  style={{ color: "#71717B" }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Quote & Analytics Section */}
      <section
        className="w-full px-6 py-20"
        style={{ backgroundColor: "#000000" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* 데이터 분석 대시보드 - 상단 */}
          <div className="mb-16">
            <h2
              ref={(el) => (sectionRefs.current["dashboard"] = el)}
              data-section-id="dashboard"
              className={`text-4xl font-bold text-center mb-4 transition-all duration-700 ${
                visibleSections.has("dashboard")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ color: "#FFFFFF" }}
            >
              데이터 분석 대시보드
            </h2>
            <p className="text-center mb-12" style={{ color: "#D6D3D1" }}>
              견적서 데이터를 기반으로 한 실시간 분석을 제공합니다
            </p>

            {/* 그래프 3개 그리드 - 나란히 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. 카테고리별 매출 분석 - Pie Chart */}
              <Card
                className="border border-[#71717B]"
                style={{ backgroundColor: "#1a1a1a" }}
              >
                <CardHeader>
                  <CardTitle className="text-xl" style={{ color: "#FFFFFF" }}>
                    카테고리별 매출 분석
                  </CardTitle>
                  <CardDescription style={{ color: "#D6D3D1" }}>
                    업무 카테고리별 매출 비중
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "개발", value: 45000000 },
                          { name: "디자인", value: 28000000 },
                          { name: "기획", value: 15000000 },
                          { name: "기타", value: 12000000 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => (
                          <text
                            x={0}
                            y={0}
                            fill="#FFFFFF"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="12"
                          >
                            {`${name} (${(percent * 100).toFixed(0)}%)`}
                          </text>
                        )}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        animationDuration={1500}
                        animationBegin={0}
                      >
                        {[
                          { name: "개발", value: 45000000 },
                          { name: "디자인", value: 28000000 },
                          { name: "기획", value: 15000000 },
                          { name: "기타", value: 12000000 },
                        ].map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"][
                                index
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) =>
                          `${(value / 1000000).toFixed(1)}M원`
                        }
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e1e1e1",
                          borderRadius: "0.5rem",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 2. 월별 매출 추이 - Bar Chart */}
              <Card
                className="border border-[#71717B]"
                style={{ backgroundColor: "#1a1a1a" }}
              >
                <CardHeader>
                  <CardTitle className="text-xl" style={{ color: "#FFFFFF" }}>
                    월별 매출 추이
                  </CardTitle>
                  <CardDescription style={{ color: "#D6D3D1" }}>
                    최근 6개월 매출 현황
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={[
                        { month: "1월", 매출: 12000000 },
                        { month: "2월", 매출: 15000000 },
                        { month: "3월", 매출: 18000000 },
                        { month: "4월", 매출: 22000000 },
                        { month: "5월", 매출: 25000000 },
                        { month: "6월", 매출: 30000000 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#71717B" />
                      <XAxis
                        dataKey="month"
                        style={{ fontSize: "0.875rem", fill: "#D6D3D1" }}
                      />
                      <YAxis
                        style={{ fontSize: "0.75rem", fill: "#D6D3D1" }}
                        tickFormatter={(value) =>
                          `${(value / 1000000).toFixed(0)}M`
                        }
                      />
                      <Tooltip
                        formatter={(value: number) =>
                          `${(value / 1000000).toFixed(1)}M원`
                        }
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e1e1e1",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Bar
                        dataKey="매출"
                        fill="var(--main-color)"
                        radius={[8, 8, 0, 0]}
                        animationDuration={1500}
                        animationBegin={0}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 3. 매출 추세 - Line Chart */}
              <Card
                className="border border-[#71717B]"
                style={{ backgroundColor: "#1a1a1a" }}
              >
                <CardHeader>
                  <CardTitle className="text-xl" style={{ color: "#FFFFFF" }}>
                    매출 추세
                  </CardTitle>
                  <CardDescription style={{ color: "#D6D3D1" }}>
                    시간에 따른 매출 변화
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart
                      data={[
                        { period: "1월", 매출: 12000000 },
                        { period: "2월", 매출: 15000000 },
                        { period: "3월", 매출: 18000000 },
                        { period: "4월", 매출: 22000000 },
                        { period: "5월", 매출: 25000000 },
                        { period: "6월", 매출: 30000000 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#71717B" />
                      <XAxis
                        dataKey="period"
                        style={{ fontSize: "0.875rem", fill: "#D6D3D1" }}
                      />
                      <YAxis
                        style={{ fontSize: "0.75rem", fill: "#D6D3D1" }}
                        tickFormatter={(value) =>
                          `${(value / 1000000).toFixed(0)}M`
                        }
                      />
                      <Tooltip
                        formatter={(value: number) =>
                          `${(value / 1000000).toFixed(1)}M원`
                        }
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e1e1e1",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="매출"
                        stroke="var(--main-color)"
                        strokeWidth={3}
                        dot={{ fill: "var(--main-color)", r: 5 }}
                        animationDuration={1500}
                        animationBegin={0}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 견적서 샘플 - 하단 */}
          <div>
            <h2
              ref={(el) => (sectionRefs.current["sample"] = el)}
              data-section-id="sample"
              className={`text-4xl font-bold text-center mb-4 transition-all duration-700 ${
                visibleSections.has("sample")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ color: "#FFFFFF" }}
            >
              견적서 샘플
            </h2>
            <p className="text-center mb-12" style={{ color: "#D6D3D1" }}>
              실제로 생성되는 견적서의 모습을 확인해보세요
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
              <div className="flex justify-center">
                <img
                  src={gmainImage}
                  alt="견적서 샘플 1"
                  className="max-w-full h-auto rounded-[1.5rem] shadow-lg"
                  style={{
                    maxHeight: "600px",
                    border: "2px solid var(--main-color)",
                  }}
                />
              </div>
              <div className="flex justify-center">
                <img
                  src={gmain2Image}
                  alt="견적서 샘플 2"
                  className="max-w-full h-auto rounded-[1.5rem] shadow-lg"
                  style={{
                    maxHeight: "600px",
                    border: "2px solid var(--main-color)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        className="w-full px-6 py-20"
        style={{ backgroundColor: "white" }}
      >
        <div className="max-w-6xl mx-auto">
          <h2
            ref={(el) => (sectionRefs.current["pricing"] = el)}
            data-section-id="pricing"
            className={`text-4xl font-bold text-center mb-4 transition-all duration-700 ${
              visibleSections.has("pricing")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ color: "var(--black)" }}
          >
            구독 요금제
          </h2>
          <p className="text-center mb-12" style={{ color: "#71717B" }}>
            프로젝트 규모에 맞는 요금제를 선택하세요 * 1개월 이월 가능
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRODUCTS.map((product) => (
              <Card
                key={product.id}
                className={`cursor-pointer transition-all relative ${
                  selectedProductId === product.id || product.id === "basic"
                    ? product.id === "basic"
                      ? "border-[3px]"
                      : "border-2"
                    : "border border-[#D4D4D4]"
                }`}
                style={{
                  borderColor:
                    selectedProductId === product.id || product.id === "basic"
                      ? "var(--main-color)"
                      : undefined,
                  backgroundColor:
                    product.id === "basic"
                      ? "white"
                      : selectedProductId === product.id
                      ? "#f0f9ff"
                      : "white",
                }}
                onClick={() => setSelectedProductId(product.id)}
              >
                <CardHeader className="relative">
                  {product.id === "basic" && (
                    <div className="absolute top-2 right-2 bg-[var(--main-color)] text-white px-6 py-2 rounded-full text-base font-bold z-10">
                      베스트
                    </div>
                  )}
                  <CardTitle className="text-2xl font-bold">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="font-bold mb-2"
                    style={{ color: "var(--main-color)", fontSize: "3.75rem" }}
                  >
                    {formatProductPrice(product.price)}
                  </div>
                  <div className="text-base mb-6" style={{ color: "#71717B" }}>
                    {product.period === "monthly" ? "/월" : "/연간"}
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2">
                      <Check
                        className="w-5 h-5"
                        style={{ color: "var(--main-color)" }}
                      />
                      <span style={{ color: "#71717B" }}>
                        견적서 발급 {product.quota}회
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        className="w-full px-6 py-20"
        style={{ backgroundColor: "var(--main-color)" }}
      >
        <div className="max-w-6xl mx-auto">
          <h2
            ref={(el) => (sectionRefs.current["benefits"] = el)}
            data-section-id="benefits"
            className={`text-3xl md:text-4xl font-bold text-center mb-4 transition-all duration-700 ${
              visibleSections.has("benefits")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ color: "#FFFFFF" }}
          >
            왜 <span style={{ color: "#000000" }}>개발견적메이커</span>를
            선택해야 할까요?
          </h2>
          <p
            className="text-lg md:text-xl text-center mb-12"
            style={{ color: "#FFFFFF" }}
          >
            전문적인 견적서 작성부터 매출 관리까지, 모든 것을 한 곳에서
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#000000" }}
                  >
                    <Check className="w-5 h-5" style={{ color: "#FFFFFF" }} />
                  </div>
                  <h3
                    className="text-xl md:text-2xl font-bold"
                    style={{ color: "#FFFFFF" }}
                  >
                    {benefit}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="w-full px-6 py-20"
        style={{ backgroundColor: "#000000" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2
            ref={(el) => (sectionRefs.current["cta"] = el)}
            data-section-id="cta"
            className={`text-4xl font-bold mb-6 transition-all duration-700 ${
              visibleSections.has("cta")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ color: "#FFFFFF" }}
          >
            지금 바로 시작하세요
          </h2>
          <p className="text-xl mb-8" style={{ color: "#D6D3D1" }}>
            첫 견적서는 무료로 발급할 수 있습니다
          </p>
          <Button
            onClick={onGetStarted}
            variant="outline"
            size="lg"
            className="text-lg px-8 py-6"
            style={{
              backgroundColor: "transparent",
              borderColor: "var(--main-color)",
              color: "var(--main-color)",
            }}
          >
            무료로 시작하기
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
