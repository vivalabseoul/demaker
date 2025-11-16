import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, FileText, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { getQuotes, getClients, formatCurrency } from "../utils/supabaseStore";
import { Quote, Client } from "../types/quote";
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

export function SalesManagement() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [loadedQuotes, loadedClients] = await Promise.all([
      getQuotes(),
      getClients(),
    ]);
    setQuotes(loadedQuotes);
    setClients(loadedClients);
    setLoading(false);
  };

  // 월별 매출 데이터 생성 (최근 12개월)
  const getMonthlyData = () => {
    const now = new Date();
    const monthlyData: { month: string; sales: number }[] = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthLabel = `${month}월`;

      // 해당 월의 견적서 찾기
      const monthSales = quotes
        .filter((quote) => {
          // createdDate 형식: "2024.11.15" 또는 "2024-11-15"
          const parts = quote.createdDate.split(/[-.]/).map((p) => p.trim());
          if (parts.length >= 2) {
            const quoteYear = parseInt(parts[0]);
            const quoteMonth = parseInt(parts[1]);
            return quoteYear === year && quoteMonth === month;
          }
          return false;
        })
        .reduce((sum, quote) => sum + quote.totalAmount, 0);

      monthlyData.push({
        month: monthLabel,
        sales: monthSales,
      });
    }

    console.log("월별 매출 데이터:", monthlyData); // 디버깅용
    return monthlyData;
  };

  // 카테고리별 매출 분석
  const getCategoryData = () => {
    const categoryMap = new Map<string, number>();

    quotes.forEach((quote) => {
      quote.items.forEach((item) => {
        const current = categoryMap.get(item.category) || 0;
        categoryMap.set(item.category, current + item.amount);
      });
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  };

  // 회사/프리랜서 비율 데이터
  const getTypeData = () => {
    const companyTotal = quotes
      .filter((q) => q.type === "company")
      .reduce((sum, q) => sum + q.totalAmount, 0);

    const freelancerTotal = quotes
      .filter((q) => q.type === "freelancer")
      .reduce((sum, q) => sum + q.totalAmount, 0);

    return [
      { name: "회사", value: companyTotal },
      { name: "프리랜서", value: freelancerTotal },
    ];
  };

  // 통계 계산
  const totalSales = quotes.reduce((sum, quote) => sum + quote.totalAmount, 0);
  const totalQuotes = quotes.length;
  const totalClients = clients.length;
  const averageSale = totalQuotes > 0 ? totalSales / totalQuotes : 0;

  // 주요 거래처 (매출 기준 정렬)
  const topClients = [...clients]
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 20); // 최대 20개까지 (페이징용)

  // 페이징 처리
  const totalPages = Math.ceil(topClients.length / itemsPerPage);
  const paginatedClients = topClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();
  const typeData = getTypeData();

  const COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1>매출 관리</h1>
        <p className="mt-2">매출 현황과 분석 정보를 확인하세요.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card style={{ backgroundColor: "var(--white)" }}>
          <CardContent className="p-6">
            <p className="mb-2" style={{ color: "var(--gray)" }}>
              총 매출
            </p>
            <h3 style={{ color: "var(--main-color)" }}>
              {formatCurrency(totalSales)}원
            </h3>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: "var(--white)" }}>
          <CardContent className="p-6">
            <p className="mb-2" style={{ color: "var(--gray)" }}>
              총 견적 건수
            </p>
            <h3 style={{ color: "var(--sub-color)" }}>{totalQuotes}건</h3>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: "var(--white)" }}>
          <CardContent className="p-6">
            <p className="mb-2" style={{ color: "var(--gray)" }}>
              총 거래처
            </p>
            <h3>{totalClients}개</h3>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: "var(--white)" }}>
          <CardContent className="p-6">
            <p className="mb-2" style={{ color: "var(--gray)" }}>
              평균 견적액
            </p>
            <h3>{formatCurrency(averageSale)}원</h3>
          </CardContent>
        </Card>
      </div>

      {/* 그래프 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 카테고리별 매출 분석 */}
        <Card style={{ backgroundColor: "var(--white)" }}>
          <CardHeader>
            <h3 style={{ color: "var(--sub-color)" }}>카테고리별 매출 분석</h3>
            <p className="mt-1">업무 카테고리별 매출 비중</p>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${formatCurrency(value)}원`}
                    contentStyle={{
                      backgroundColor: "var(--white)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p style={{ color: "var(--gray)" }}>데이터가 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 회사/프리랜서 비율 */}
        <Card style={{ backgroundColor: "var(--white)" }}>
          <CardHeader>
            <h3>유형별 매출 비교</h3>
            <p className="mt-1">회사 vs 프리랜서 매출 비교</p>
          </CardHeader>
          <CardContent>
            {typeData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" style={{ fontSize: "0.875rem" }} />
                  <YAxis
                    style={{ fontSize: "0.75rem" }}
                    tickFormatter={(value) =>
                      `${(value / 1000000).toFixed(0)}M`
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => `${formatCurrency(value)}원`}
                    contentStyle={{
                      backgroundColor: "var(--white)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="value"
                    fill="#3b82f6"
                    name="매출액"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p style={{ color: "var(--gray)" }}>데이터가 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 월별 매출 추이 - 전체 너비 */}
      <Card style={{ backgroundColor: "var(--white)" }} className="mb-8">
        <CardHeader>
          <h3 style={{ color: "var(--main-color)" }}>
            월별 매출 추이 (최근 12개월)
          </h3>
          <p className="mt-1">매출 변화를 한눈에 확인하세요</p>
        </CardHeader>
        <CardContent>
          {monthlyData.some((d) => d.sales > 0) ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" style={{ fontSize: "0.75rem" }} />
                <YAxis
                  style={{ fontSize: "0.75rem" }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) {
                      return `${(value / 1000000).toFixed(0)}M`;
                    } else if (value >= 1000) {
                      return `${(value / 1000).toFixed(0)}K`;
                    }
                    return value.toString();
                  }}
                />
                <Tooltip
                  formatter={(value: number) => `${formatCurrency(value)}원`}
                  contentStyle={{
                    backgroundColor: "var(--white)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="매출액"
                  dot={{ fill: "#10b981", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px]">
              <p style={{ color: "var(--gray)" }}>
                아직 매출 데이터가 없습니다. 샘플 데이터를 생성해보세요!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 주요 거래처 */}
      <Card style={{ backgroundColor: "var(--white)" }}>
        <CardHeader>
          <h3>주요 거래처</h3>
          <p className="mt-1">매출 기준 상위 거래처</p>
        </CardHeader>
        <CardContent>
          {paginatedClients.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedClients.map((client, index) => (
                  <div
                    key={client.id}
                    className="p-4 rounded-lg border"
                    style={{ borderColor: "#e5e7eb" }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: index < 3 ? "#d1fae5" : "#f3f4f6",
                            color:
                              index < 3 ? "var(--main-color)" : "var(--gray)",
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </span>
                        </div>
                        <div>
                          <h4>{client.name}</h4>
                          <p style={{ color: "var(--gray)" }}>
                            {client.representative}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p style={{ color: "var(--gray)" }}>
                          <strong>총 매출</strong>
                        </p>
                        <p
                          style={{
                            color: "var(--main-color)",
                            fontWeight: 600,
                          }}
                        >
                          {formatCurrency(client.totalSales)}원
                        </p>
                      </div>
                      <div>
                        <p style={{ color: "var(--gray)" }}>견적 건수</p>
                        <p>{client.quoteCount}건</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이징 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border transition-colors"
                    style={{
                      borderColor: "#e5e7eb",
                      backgroundColor:
                        currentPage === 1 ? "#f3f4f6" : "var(--white)",
                      color: currentPage === 1 ? "var(--gray)" : "var(--black)",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    이전
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className="w-10 h-10 rounded-lg transition-colors"
                        style={{
                          backgroundColor:
                            currentPage === page
                              ? "var(--main-color)"
                              : "var(--white)",
                          color:
                            currentPage === page
                              ? "var(--white)"
                              : "var(--black)",
                          border:
                            currentPage === page ? "none" : "1px solid #e5e7eb",
                        }}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border transition-colors"
                    style={{
                      borderColor: "#e5e7eb",
                      backgroundColor:
                        currentPage === totalPages ? "#f3f4f6" : "var(--white)",
                      color:
                        currentPage === totalPages
                          ? "var(--gray)"
                          : "var(--black)",
                      cursor:
                        currentPage === totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p style={{ color: "var(--gray)" }}>등록된 거래처가 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
