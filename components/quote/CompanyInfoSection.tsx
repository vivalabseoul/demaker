import { Card, CardHeader, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { CompanyInfo } from "../../types/quote";

interface CompanyInfoSectionProps {
  ourCompany: CompanyInfo | null;
  clientCompany: CompanyInfo;
  clients: any[];
  onClientCompanyChange: (company: CompanyInfo) => void;
  onLoadClient: (clientId: string) => void;
}

export function CompanyInfoSection({
  ourCompany,
  clientCompany,
  clients,
  onClientCompanyChange,
  onLoadClient,
}: CompanyInfoSectionProps) {
  return (
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
              <h4 className="flex-shrink-0">
                <strong>공급받는 거래처</strong>
              </h4>
              <div className="w-full sm:w-auto sm:flex-1 sm:max-w-md">
                <Select onValueChange={onLoadClient}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="거래처 불러오기" />
                  </SelectTrigger>
                  <SelectContent className="max-w-[var(--radix-select-trigger-width)]">
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id} className="truncate">
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                placeholder="회사명"
                value={clientCompany.name}
                onChange={(e) =>
                  onClientCompanyChange({
                    ...clientCompany,
                    name: e.target.value,
                  })
                }
              />
              <Input
                placeholder="대표자"
                value={clientCompany.representative}
                onChange={(e) =>
                  onClientCompanyChange({
                    ...clientCompany,
                    representative: e.target.value,
                  })
                }
              />
              <Input
                placeholder="사업자등록번호"
                value={clientCompany.registrationNumber}
                onChange={(e) =>
                  onClientCompanyChange({
                    ...clientCompany,
                    registrationNumber: e.target.value,
                  })
                }
              />
              <Input
                placeholder="주소"
                value={clientCompany.address}
                onChange={(e) =>
                  onClientCompanyChange({
                    ...clientCompany,
                    address: e.target.value,
                  })
                }
              />
              <Input
                placeholder="전화번호"
                value={clientCompany.phone}
                onChange={(e) =>
                  onClientCompanyChange({
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
                  onClientCompanyChange({
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
  );
}
