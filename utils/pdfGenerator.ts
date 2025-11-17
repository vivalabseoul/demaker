import { Quote } from "../types/quote";
import {
  formatCurrency,
  getCustomerNotice,
  getPaymentInfo,
  BankAccountInfo,
  CustomerNotice,
  getOurCompany,
} from "./supabaseStore";
import { formatDollar, convertToDollar } from "./exchangeRate";

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

// PDF HTML 생성 함수 (미리보기용)
export const generateQuoteHTML = async (quote: Quote): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Generating PDF for quote:", quote.quoteNumber);
      console.log("📋 PDF 생성: quote 객체 확인", {
        finalQuoteAmount: quote.finalQuoteAmount,
        finalQuoteCurrencyType: quote.finalQuoteCurrencyType,
        hasFinalQuoteAmount:
          quote.finalQuoteAmount !== undefined &&
          quote.finalQuoteAmount !== null,
      });

      if (!quote.items || quote.items.length === 0) {
        reject(new Error("견적 항목이 없습니다."));
        return;
      }

      // 할인 금액 계산
      let totalDiscount = 0;
      if (quote.discounts && quote.discounts.length > 0) {
        totalDiscount = quote.discounts.reduce((sum, discount) => {
          if (discount.type === "amount") {
            return sum + (discount.value || 0);
          } else {
            return sum + quote.subtotal * ((discount.value || 0) / 100);
          }
        }, 0);
      }

      // 고객 안내문구와 입금 정보 불러오기
      console.log("📋 PDF 생성: 고객 안내문구와 입금 정보 불러오기 시작...");
      const [customerNotice, paymentInfo] = await Promise.all([
        getCustomerNotice(),
        getPaymentInfo(),
      ]);

      console.log(
        "📋 PDF 생성: 고객 안내문구 데이터:",
        JSON.stringify(customerNotice, null, 2)
      );
      console.log("📋 PDF 생성: 고객 안내문구 타입:", typeof customerNotice);
      console.log(
        "📋 PDF 생성: 고객 안내문구 null 여부:",
        customerNotice === null
      );

      // 고객 안내문구가 있는지 확인 (하나라도 내용이 있으면 표시)
      const hasCustomerNotice =
        customerNotice &&
        ((customerNotice.refundPolicy && customerNotice.refundPolicy.trim()) ||
          (customerNotice.terms && customerNotice.terms.trim()) ||
          (customerNotice.serviceScope && customerNotice.serviceScope.trim()) ||
          (customerNotice.deliveryPolicy &&
            customerNotice.deliveryPolicy.trim()) ||
          (customerNotice.paymentSchedule &&
            customerNotice.paymentSchedule.trim()) ||
          (customerNotice.otherTerms && customerNotice.otherTerms.trim()));

      console.log("📋 PDF 생성: 고객 안내문구 표시 여부:", hasCustomerNotice);
      if (customerNotice) {
        console.log("📋 PDF 생성: 각 필드별 내용 확인:", {
          refundPolicy: customerNotice.refundPolicy?.trim() || "(비어있음)",
          terms: customerNotice.terms?.trim() || "(비어있음)",
          serviceScope: customerNotice.serviceScope?.trim() || "(비어있음)",
          deliveryPolicy: customerNotice.deliveryPolicy?.trim() || "(비어있음)",
          paymentSchedule:
            customerNotice.paymentSchedule?.trim() || "(비어있음)",
          otherTerms: customerNotice.otherTerms?.trim() || "(비어있음)",
        });
      }

      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>견적서_${quote.quoteNumber}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body { 
            font-family: "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
            padding: 2rem;
            line-height: 1.6;
            color: #000;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }
          
          .container {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }
          
          @media screen {
            body {
              min-width: auto;
            }
            .container {
              min-width: auto;
            }
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 3px solid #000;
          }
          
          .header h1 { 
            font-size: 2.5rem; 
            font-weight: 700; 
            margin-bottom: 1rem;
            color: #000;
          }
          
          .header-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 1rem;
            color: #666;
            margin-top: 1rem;
          }
          
          .info-section { 
            display: flex; 
            justify-content: space-between; 
            gap: 1rem;
            margin-bottom: 2rem; 
          }
          
          .info-box { 
            flex: 1; 
            border: 2px solid #000; 
            padding: 1.25rem;
            border-radius: 8px;
            background: white;
          }
          
          .info-box h3 { 
            font-size: 1.25rem; 
            font-weight: 600; 
            margin-bottom: 1rem; 
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #000;
            color: #000;
          }
          
          .info-box.client h3 {
            color: #000;
            border-bottom-color: #000;
          }
          
          .info-box.client {
            border-color: #000;
          }
          
          .info-row { 
            display: flex; 
            padding: 0.4rem 0; 
            font-size: 0.875rem; 
          }
          
          .info-label { 
            width: 8rem; 
            font-weight: 600;
            color: #333;
          }
          
          .info-value { 
            flex: 1;
            color: #666;
          }
          
          .basic-info {
            display: flex;
            justify-content: space-between;
            padding: 1rem;
            margin-bottom: 2rem;
            border: 1px solid #000;
            border-radius: 8px;
            background: white;
          }
          
          .basic-info-item {
            flex: 1;
            text-align: center;
          }
          
          .basic-info-label {
            font-size: 0.75rem;
            color: #666;
            margin-bottom: 0.25rem;
          }
          
          .basic-info-value {
            font-size: 1rem;
            font-weight: 600;
            color: #000;
          }
          
          .type-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border: 1px solid #000;
            border-radius: 12px;
            font-size: 0.875rem;
            font-weight: 500;
            background: white;
            color: #000;
          }
          
          .type-company {
            background: white;
            color: #000;
          }
          
          .type-freelancer {
            background: white;
            color: #000;
          }
          
          .items-section {
            margin-bottom: 2rem;
            border: 1px solid #000;
            border-radius: 8px;
            padding: 1rem;
          }
          
          .items-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #000;
            color: #000;
          }
          
          table { 
            width: 100%; 
            border-collapse: collapse;
          }
          
          th, td { 
            border: 1px solid #333; 
            padding: 0.75rem; 
            text-align: center; 
            font-size: 0.875rem; 
          }
          
          th { 
            background-color: #f9fafb; 
            font-weight: 600;
            color: #000;
            border-color: #000;
            border-width: 2px;
          }
          
          td {
            color: #000;
            border-color: #333;
          }
          
          .text-right { 
            text-align: right; 
          }
          
          .summary { 
            margin-top: 2rem; 
            width: 100%;
            border: 2px solid #00cc8e;
            border-radius: 8px;
            padding: 1.5rem;
            background: white;
          }
          
          .summary-row { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            padding: 0.75rem 0; 
            border-bottom: 1px solid #ddd;
            font-size: 1rem;
            color: #000;
          }
          
          .summary-row:last-child {
            border-bottom: none;
          }
          
          .summary-row.discount {
            color: #ef4444;
            font-weight: 500;
          }
          
          .summary-row.total { 
            font-weight: 700; 
            font-size: 1.5rem; 
            border-top: 2px solid #000; 
            border-bottom: none;
            margin-top: 0.5rem; 
            padding-top: 1rem;
            padding-bottom: 0;
            color: #000;
          }
          
          .notes { 
            clear: both; 
            margin-top: 2rem; 
            padding: 1.25rem; 
            border: 1px solid #000;
            border-radius: 8px;
            background: white;
          }
          
          .notes h4 { 
            font-size: 1.125rem; 
            font-weight: 600; 
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #000;
            color: #000;
          }
          
          .notes p { 
            font-size: 0.875rem; 
            color: #666; 
            line-height: 1.8; 
            white-space: pre-wrap; 
          }
          
          .notes-content {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            align-items: center;
          }
          
          .notes-item {
            display: inline-block;
          }
          
          .notes-item:not(:last-child)::after {
            content: "|";
            margin: 0 0.5rem;
            color: #999;
          }
          
          .terms { 
            clear: both; 
            margin-top: 2rem; 
            padding: 1.5rem; 
            border: 2px solid #000;
            border-radius: 8px;
            background: white;
            page-break-inside: avoid;
          }
          
          .terms h4 { 
            font-size: 1.125rem; 
            font-weight: 700; 
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #000;
            color: #000;
            text-align: center;
          }
          
          .terms h5 {
            font-size: 1rem;
            font-weight: 600;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            color: #000;
          }
          
          .terms p { 
            font-size: 0.75rem; 
            color: #333; 
            line-height: 1.6; 
            margin-bottom: 0.5rem;
          }
          
          .terms ul {
            font-size: 0.75rem;
            color: #333;
            line-height: 1.6;
            margin-left: 1.5rem;
            margin-bottom: 0.5rem;
          }
          
          .terms li {
            margin-bottom: 0.3rem;
          }
          
          .terms .section {
            margin-bottom: 1rem;
          }
          
          .payment-info-section {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            align-items: flex-start;
            font-size: 1rem;
          }
          
          .payment-info-item {
            display: inline-block;
          }
          
          .payment-info-item:not(:last-child)::after {
            content: "|";
            margin: 0 0.5rem;
            color: #999;
          }
          
          .footer {
            text-align: center;
            margin-top: 3rem;
            padding-top: 1.5rem;
            border-top: 2px solid #333;
            font-size: 0.875rem;
            color: #666;
          }
          
          .no-print { 
            text-align: center; 
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 2px solid #333;
          }
          
          .no-print button {
            padding: 0.75rem 2rem; 
            font-size: 1rem; 
            border: none; 
            border-radius: 0.5rem; 
            cursor: pointer;
            font-weight: 600;
            transition: opacity 0.2s;
          }
          
          .no-print button:hover {
            opacity: 0.8;
          }
          
          .btn-print {
            background-color: #3b82f6; 
            color: white;
          }
          
          .btn-close {
            background-color: #6b7280; 
            color: white;
            margin-left: 1rem;
          }
          
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }
            
            body { 
              padding: 0 !important;
              margin: 0 !important;
              min-width: auto !important;
              width: 100% !important;
              max-width: 100% !important;
              font-size: 12px !important;
            }
            
            .container {
              min-width: auto !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            
            .no-print { 
              display: none !important;
            }
            
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .header {
              margin-bottom: 0.75rem !important;
              padding-bottom: 0.5rem !important;
            }
            
            .header h1 {
              font-size: 1.75rem !important;
              margin-bottom: 0.5rem !important;
            }
            
            .header-info {
              font-size: 0.75rem !important;
              margin-top: 0.5rem !important;
            }
            
            .info-section {
              margin-bottom: 0.5rem !important;
              gap: 0.4rem !important;
            }
            
            .info-box {
              padding: 0.5rem !important;
            }
            
            .info-box h3 {
              font-size: 0.8rem !important;
              margin-bottom: 0.3rem !important;
              padding-bottom: 0.2rem !important;
            }
            
            .info-box p {
              font-size: 0.7rem !important;
              margin: 0.15rem 0 !important;
            }
            
            .info-row {
              padding: 0.2rem 0 !important;
              font-size: 0.7rem !important;
            }
            
            .info-label {
              font-size: 0.7rem !important;
            }
            
            .info-value {
              font-size: 0.7rem !important;
            }
            
            .items-title {
              font-size: 1rem !important;
              margin-bottom: 0.5rem !important;
              padding-bottom: 0.25rem !important;
            }
            
            table {
              font-size: 0.7rem !important;
            }
            
            th, td {
              padding: 0.4rem 0.3rem !important;
              font-size: 0.7rem !important;
            }
            
            .items-section {
              margin-bottom: 0.75rem !important;
            }
            
            .summary {
              margin-top: 0.75rem !important;
              padding: 0.75rem !important;
            }
            
            .summary-row {
              padding: 0.4rem 0 !important;
              font-size: 0.8rem !important;
            }
            
            .summary-row.total {
              font-size: 1.1rem !important;
              margin-top: 0.25rem !important;
              padding-top: 0.5rem !important;
            }
            
            .summary-row.total span[style*="font-size: 1.5rem"] {
              font-size: 1.1rem !important;
            }
            
            .summary-row.total span[style*="font-size: 2.25rem"] {
              font-size: 1.3rem !important;
            }
            
            .summary-row.total div[style*="font-size: 2rem"],
            .summary-row.total div[style*="font-size: 2.5rem"] {
              font-size: 1.5rem !important;
            }
            
            .summary-row.total div[style*="font-size: 1.5rem"] {
              font-size: 1.2rem !important;
            }
            
            .notes {
              margin-top: 0.75rem !important;
              padding: 0.75rem !important;
            }
            
            .notes h4 {
              font-size: 0.875rem !important;
              margin-bottom: 0.5rem !important;
              padding-bottom: 0.25rem !important;
            }
            
            .notes p {
              font-size: 0.7rem !important;
            }
            
            .notes-content {
              gap: 0.5rem !important;
              font-size: 0.75rem !important;
            }
            
            .notes-item:not(:last-child)::after {
              margin: 0 0.3rem !important;
            }
            
            .terms {
              margin-top: 0.75rem !important;
              padding: 0.75rem !important;
              page-break-inside: avoid !important;
            }
            
            .terms h4 {
              font-size: 0.875rem !important;
              margin-bottom: 0.5rem !important;
              padding-bottom: 0.25rem !important;
            }
            
            .terms h5 {
              font-size: 0.75rem !important;
              margin-top: 0.5rem !important;
              margin-bottom: 0.25rem !important;
            }
            
            .terms .section {
              margin-bottom: 0.5rem !important;
              font-size: 0.65rem !important;
              line-height: 1.4 !important;
            }
            
            .payment-info-section {
              gap: 0.5rem !important;
              font-size: 0.9rem !important;
            }
            
            .payment-info-item:not(:last-child)::after {
              margin: 0 0.3rem !important;
            }
            
            .terms p {
              font-size: 0.65rem !important;
              margin-bottom: 0.25rem !important;
            }
            
            .terms ul {
              font-size: 0.65rem !important;
              margin-left: 1rem !important;
              margin-bottom: 0.25rem !important;
            }
            
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
        <div class="header">
          <h1>견 적 서</h1>
          ${
            quote.projectName
              ? `<div class="project-name" style="font-size: 1.25rem; font-weight: 600; margin-top: 0.5rem; color: #000;">${quote.projectName}</div>`
              : ""
          }
          <div class="header-info">
            <span><strong>견적번호:</strong> ${quote.quoteNumber}</span>
            <span><strong>작성일자:</strong> ${quote.createdDate}</span>
          </div>
        </div>

        <div class="info-section">
          <div class="info-box">
            <h3>우리 회사 : 공급자</h3>
            <div class="info-row"><span class="info-label">회사명</span><span class="info-value">${
              quote.ourCompany.name
            }</span></div>
            <div class="info-row"><span class="info-label">대표자</span><span class="info-value">${
              quote.ourCompany.representative
            }</span></div>
            <div class="info-row"><span class="info-label">사업자등록번호</span><span class="info-value">${
              quote.ourCompany.registrationNumber || "-"
            }</span></div>
            <div class="info-row"><span class="info-label">주소</span><span class="info-value">${
              quote.ourCompany.address || "-"
            }</span></div>
            <div class="info-row"><span class="info-label">전화번호</span><span class="info-value">${
              quote.ourCompany.phone
            }</span></div>
            <div class="info-row"><span class="info-label">이메일</span><span class="info-value">${
              quote.ourCompany.email
            }</span></div>
          </div>

          <div class="info-box client">
            <h3>거래처 : 공급받는자</h3>
            <div class="info-row"><span class="info-label">회사명</span><span class="info-value">${
              quote.clientCompany.name
            }</span></div>
            <div class="info-row"><span class="info-label">대표자</span><span class="info-value">${
              quote.clientCompany.representative
            }</span></div>
            <div class="info-row"><span class="info-label">사업자등록번호</span><span class="info-value">${
              quote.clientCompany.registrationNumber || "-"
            }</span></div>
            <div class="info-row"><span class="info-label">주소</span><span class="info-value">${
              quote.clientCompany.address || "-"
            }</span></div>
            <div class="info-row"><span class="info-label">전화번호</span><span class="info-value">${
              quote.clientCompany.phone
            }</span></div>
            <div class="info-row"><span class="info-label">이메일</span><span class="info-value">${
              quote.clientCompany.email
            }</span></div>
          </div>
        </div>

        <div class="items-section">
          <div class="items-title">견적 항목</div>
          <table>
            <thead>
              <tr>
                <th style="width: 5%">No</th>
                <th style="width: 25%">제작내용</th>
                <th style="width: 12%">카테고리</th>
                <th style="width: 15%">직무</th>
                <th style="width: 14%">단가 (원)</th>
                <th style="width: 10%">제작소요기간</th>
                <th style="width: 15%">금액 (원)</th>
              </tr>
            </thead>
            <tbody>
              ${quote.items
                .map((item, index) => {
                  const isHourly = item.calculationType === "hourly";
                  const unitPrice = isHourly ? item.hourlyRate : item.dailyRate;
                  const quantity = isHourly ? item.hours || 0 : item.days || 0;
                  const quantityLabel = isHourly ? "시간" : "일";

                  return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.work || "-"}</td>
                  <td>${item.category}</td>
                  <td>${item.role}</td>
                  <td class="text-right">${formatCurrency(unitPrice)}</td>
                  <td>${quantity} ${quantityLabel}</td>
                  <td class="text-right">${formatCurrency(item.amount)}</td>
                </tr>
              `;
                })
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="summary">
          <div class="summary-row">
            <span>소계</span>
            <span>${formatCurrency(quote.subtotal)}원</span>
          </div>
          <div class="summary-row">
            <span>재경비 (${quote.expenseRate}%)</span>
            <span>${formatCurrency(quote.expenseAmount)}원</span>
          </div>
          ${
            quote.technicalFeeRate &&
            quote.technicalFeeAmount &&
            quote.technicalFeeAmount > 0
              ? `
          <div class="summary-row">
            <span>기술료 (${quote.technicalFeeRate}%)</span>
            <span>${formatCurrency(quote.technicalFeeAmount)}원</span>
          </div>
          `
              : ""
          }
          ${
            quote.discounts && quote.discounts.length > 0
              ? quote.discounts
                  .map((discount) => {
                    const discountAmount = discount.amount || 0;
                    const discountLabel =
                      discount.type === "amount"
                        ? `할인${discount.name ? ` (${discount.name})` : ""}`
                        : `할인${discount.name ? ` (${discount.name})` : ""} ${
                            discount.value || discount.rate || 0
                          }%`;
                    return `
                <div class="summary-row discount">
                  <span>${discountLabel}</span>
                  <span>-${formatCurrency(discountAmount)}원</span>
                </div>
              `;
                  })
                  .join("")
              : ""
          }
          <div class="summary-row">
            <span>공급가</span>
            <span>${formatCurrency(
              quote.supplyAmount ||
                quote.subtotal + quote.expenseAmount + (quote.technicalFeeAmount || 0) - totalDiscount
            )}원</span>
          </div>
          ${
            quote.includeVat
              ? `
            <div class="summary-row">
              <span>부가세 (10%)</span>
              <span>${formatCurrency(quote.vatAmount || 0)}원</span>
            </div>
          `
              : ""
          }
          <div class="summary-row total">
            <span>총 금액</span>
            <div style="text-align: right;">
              <div style="font-size: 2rem; font-weight: 700;">${formatCurrency(
                quote.totalAmount
              )}원</div>
              ${
                quote.currencyType &&
                quote.exchangeRate &&
                quote.exchangeRate > 0
                  ? (() => {
                      // 저장된 exchangeRate로 다시 계산 (올바른 계산 보장)
                      const recalculatedDollar = convertToDollar(
                        quote.totalAmount,
                        quote.currencyType,
                        quote.exchangeRate
                      );
                      return `<div style="font-size: 1.5rem; font-weight: 600; color: #666; margin-top: 0.5rem;">
                        (${formatDollar(
                          recalculatedDollar,
                          quote.currencyType
                        )})
                      </div>`;
                    })()
                  : ""
              }
            </div>
          </div>
          ${
            quote.finalQuoteAmount !== undefined &&
            quote.finalQuoteAmount !== null &&
            !isNaN(Number(quote.finalQuoteAmount)) &&
            Number(quote.finalQuoteAmount) > 0
              ? (() => {
                  const finalAmount = Number(quote.finalQuoteAmount);
                  const finalCurrency = quote.finalQuoteCurrencyType || "KRW";
                  const currencyLabel =
                    finalCurrency === "KRW" ? "원" : finalCurrency;
                  const finalAmountDisplay =
                    finalCurrency === "KRW"
                      ? `${formatCurrency(finalAmount)}원`
                      : finalCurrency === "USD"
                      ? formatDollar(finalAmount, "USD")
                      : formatDollar(finalAmount, "CAD");

                  console.log("📋 PDF 생성: 최종제안금액 표시", {
                    finalQuoteAmount: quote.finalQuoteAmount,
                    finalAmount,
                    finalQuoteCurrencyType: quote.finalQuoteCurrencyType,
                    finalAmountDisplay,
                    type: typeof quote.finalQuoteAmount,
                  });

                  const koreanText =
                    finalCurrency === "KRW"
                      ? `일금 ${convertToKoreanNumber(
                          finalAmount
                        )}원 정 (${finalAmountDisplay})`
                      : finalCurrency === "USD"
                      ? `일금 ${convertToKoreanNumber(
                          finalAmount
                        )}미국 달러 정 (${finalAmountDisplay})`
                      : `일금 ${convertToKoreanNumber(
                          finalAmount
                        )}캐나다 달러 정 (${finalAmountDisplay})`;

                  return `
          <div class="summary-row total" style="border-top: 2px solid #ff7043; margin-top: 1rem; padding-top: 1rem; display: flex; justify-content: flex-end; align-items: center; gap: 1rem;">
            <span style="display: flex; align-items: center; gap: 0.5rem; font-size: 2.25rem; font-weight: 700; color: #000;">
              최종제안금액
              <span style="font-size: 2.25rem; color: #666; font-weight: 700;">(${currencyLabel})</span>
            </span>
            <div style="font-size: 2.5rem; font-weight: 700; color: #ff7043;">${finalAmountDisplay}</div>
          </div>
          <div class="summary-row" style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #ddd; text-align: right;">
            <div style="font-size: 1.25rem; font-weight: 600; color: #333;">
              ${koreanText}
            </div>
          </div>
          `;
                })()
              : (() => {
                  console.log("📋 PDF 생성: 최종제안금액 없음", {
                    finalQuoteAmount: quote.finalQuoteAmount,
                    finalQuoteCurrencyType: quote.finalQuoteCurrencyType,
                  });
                  return "";
                })()
          }
          ${
            quote.currencyType && quote.exchangeRate
              ? `
          <div class="summary-row" style="font-size: 0.875rem; color: #666; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #ddd;">
            <span>환율 정보</span>
            <span>1원 = ${quote.exchangeRate.toFixed(6).replace(/\.0+$/, "")} ${
                  quote.currencyType
                } (${quote.createdDate} 기준)</span>
          </div>
          `
              : ""
          }
        </div>

        ${
          hasCustomerNotice && customerNotice
            ? `
        <div class="terms">
          <h4>고객 안내문구</h4>
          
          ${
            customerNotice.refundPolicy && customerNotice.refundPolicy.trim()
              ? `
          <div class="section">
            <h5>환불 불가 조항</h5>
            <div style="white-space: pre-wrap; font-size: 0.75rem; line-height: 1.6;">${customerNotice.refundPolicy}</div>
          </div>
          `
              : ""
          }
          
          ${
            customerNotice.terms && customerNotice.terms.trim()
              ? `
          <div class="section">
            <h5>약관</h5>
            <div style="white-space: pre-wrap; font-size: 0.75rem; line-height: 1.6;">${customerNotice.terms}</div>
          </div>
          `
              : ""
          }
          
          ${
            customerNotice.serviceScope && customerNotice.serviceScope.trim()
              ? `
          <div class="section">
            <h5>서비스 범위</h5>
            <div style="white-space: pre-wrap; font-size: 0.75rem; line-height: 1.6;">${customerNotice.serviceScope}</div>
          </div>
          `
              : ""
          }
          
          ${
            customerNotice.deliveryPolicy &&
            customerNotice.deliveryPolicy.trim()
              ? `
          <div class="section">
            <h5>납기일 관련 안내</h5>
            <div style="white-space: pre-wrap; font-size: 0.75rem; line-height: 1.6;">${customerNotice.deliveryPolicy}</div>
          </div>
          `
              : ""
          }
          
          ${
            customerNotice.paymentSchedule &&
            customerNotice.paymentSchedule.trim()
              ? `
          <div class="section">
            <h5>결제 일정</h5>
            <div style="white-space: pre-wrap; font-size: 0.75rem; line-height: 1.6;">${customerNotice.paymentSchedule}</div>
          </div>
          `
              : ""
          }
          
          ${
            customerNotice.otherTerms && customerNotice.otherTerms.trim()
              ? `
          <div class="section">
            <h5>기타 약관</h5>
            <div style="white-space: pre-wrap; font-size: 0.75rem; line-height: 1.6;">${customerNotice.otherTerms}</div>
          </div>
          `
              : ""
          }
        </div>
        `
            : ""
        }

        ${
          paymentInfo && (paymentInfo as BankAccountInfo).selectedType
            ? `
        <div class="terms" style="margin-top: 2rem;">
          <h4>입금 정보</h4>
          <div class="payment-info-section">
          ${
            (paymentInfo as BankAccountInfo).selectedType === "domestic" &&
            (paymentInfo as BankAccountInfo).domestic
              ? `
            <div class="payment-info-item"><strong>은행명:</strong> ${
              (paymentInfo as BankAccountInfo).domestic!.bankName
            }</div>
            <div class="payment-info-item"><strong>계좌번호:</strong> ${
              (paymentInfo as BankAccountInfo).domestic!.accountNumber
            }</div>
            <div class="payment-info-item"><strong>예금주:</strong> ${
              (paymentInfo as BankAccountInfo).domestic!.accountHolder
            }</div>
            ${
              (paymentInfo as BankAccountInfo).domestic!.notes
                ? `<div class="payment-info-item"><strong>비고:</strong> ${
                    (paymentInfo as BankAccountInfo).domestic!.notes
                  }</div>`
                : ""
            }
          `
              : ""
          }
          ${
            (paymentInfo as BankAccountInfo).selectedType === "international" &&
            (paymentInfo as BankAccountInfo).international
              ? `
            <div class="payment-info-item"><strong>은행명:</strong> ${
              (paymentInfo as BankAccountInfo).international!.bankName
            }</div>
            <div class="payment-info-item"><strong>계좌번호:</strong> ${
              (paymentInfo as BankAccountInfo).international!.accountNumber
            }</div>
            <div class="payment-info-item"><strong>예금주:</strong> ${
              (paymentInfo as BankAccountInfo).international!.accountHolder
            }</div>
            <div class="payment-info-item"><strong>SWIFT 코드:</strong> ${
              (paymentInfo as BankAccountInfo).international!.swiftCode
            }</div>
            ${
              (paymentInfo as BankAccountInfo).international!.notes
                ? `<div class="payment-info-item"><strong>비고:</strong> ${
                    (paymentInfo as BankAccountInfo).international!.notes
                  }</div>`
                : ""
            }
          `
              : ""
          }
          </div>
        </div>
        `
            : ""
        }

        ${
          quote.notes
            ? `
          <div class="notes" style="margin-top: 2rem;">
            <h4>비고</h4>
            <p>${quote.notes}</p>
          </div>
        `
            : ""
        }

        <div class="footer">
          <p>© 2025 개발견적메이커</p>
        </div>
        </div>

        <div class="no-print">
          <button class="btn-print" onclick="window.print()">인쇄 / PDF 저장</button>
          <button class="btn-close" onclick="window.close()">닫기</button>
        </div>
      </body>
      </html>
    `;

      resolve(html);
    } catch (error: any) {
      console.error("Error generating HTML:", error);
      reject(error);
    }
  });
};

export const generateQuotePDF = (quote: Quote): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const html = await generateQuoteHTML(quote);

      // 웹뷰 환경에서 window.open이 차단될 수 있으므로 대체 방법 제공
      let printWindow: Window | null = null;

      try {
        printWindow = window.open("", "_blank");
      } catch (error) {
        console.warn("window.open failed, trying alternative method:", error);
      }

      // 웹뷰에서 팝업이 차단된 경우 대체 방법 시도
      if (
        !printWindow ||
        printWindow.closed ||
        typeof printWindow.closed === "undefined"
      ) {
        // 대체 방법: 현재 창에서 인쇄 다이얼로그 열기
        console.warn("Popup blocked, using print dialog fallback");
        const printContent = document.createElement("div");
        printContent.innerHTML = html;
        document.body.appendChild(printContent);
        window.print();
        document.body.removeChild(printContent);
        resolve();
        return;
      }

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      // 문서가 로드될 때까지 대기
      const checkReady = () => {
        if (printWindow && printWindow.document.readyState === "complete") {
          console.log("PDF window loaded successfully");
          resolve();
        } else if (printWindow) {
          setTimeout(checkReady, 100);
        }
      };

      // 최대 5초 대기
      setTimeout(() => {
        if (printWindow && printWindow.document.readyState === "complete") {
          resolve();
        } else {
          console.warn("PDF window loading timeout, but resolving anyway");
          resolve();
        }
      }, 5000);

      checkReady();
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      reject(error);
    }
  });
};

// 고객 안내문구만을 위한 HTML 생성 함수
export const generateCustomerNoticeHTML = async (
  customerNotice: CustomerNotice
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // 회사 정보 가져오기
      const ourCompany = await getOurCompany();
      if (!ourCompany) {
        reject(new Error("회사 정보를 먼저 등록해주세요."));
        return;
      }

      // 고객 안내문구가 있는지 확인
      const hasCustomerNotice =
        customerNotice &&
        ((customerNotice.refundPolicy && customerNotice.refundPolicy.trim()) ||
          (customerNotice.terms && customerNotice.terms.trim()) ||
          (customerNotice.serviceScope && customerNotice.serviceScope.trim()) ||
          (customerNotice.deliveryPolicy &&
            customerNotice.deliveryPolicy.trim()) ||
          (customerNotice.paymentSchedule &&
            customerNotice.paymentSchedule.trim()) ||
          (customerNotice.otherTerms && customerNotice.otherTerms.trim()));

      if (!hasCustomerNotice) {
        reject(new Error("고객 안내문구가 없습니다."));
        return;
      }

      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>고객 안내문구</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body { 
            font-family: "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
            padding: 2rem;
            line-height: 1.6;
            color: #000;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .container {
            max-width: 100%;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 3px solid #000;
          }
          
          .header h1 { 
            font-size: 2.5rem; 
            font-weight: 700; 
            margin-bottom: 1rem;
            color: #000;
          }
          
          .company-info {
            margin-top: 1rem;
            font-size: 0.875rem;
            color: #666;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.75rem;
            align-items: center;
          }
          
          .company-info-item {
            display: inline-block;
          }
          
          .company-info-item:not(:last-child)::after {
            content: "|";
            margin: 0 0.5rem;
            color: #999;
          }
          
          .terms { 
            margin-top: 2rem; 
            padding: 1.5rem; 
            border: 2px solid #000;
            border-radius: 8px;
            background: white;
            page-break-inside: avoid;
          }
          
          .terms h4 { 
            font-size: 1.5rem; 
            font-weight: 700; 
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #000;
            color: #000;
            text-align: center;
          }
          
          .terms h5 {
            font-size: 1.125rem;
            font-weight: 600;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            color: #000;
          }
          
          .terms p { 
            font-size: 0.875rem; 
            color: #333; 
            line-height: 1.8; 
            margin-bottom: 0.75rem;
            white-space: pre-wrap;
          }
          
          .terms .section {
            margin-bottom: 1.5rem;
          }
          
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }
            
            body { 
              padding: 0 !important;
              margin: 0 !important;
              font-size: 12px !important;
            }
            
            .header {
              margin-bottom: 1rem !important;
              padding-bottom: 0.5rem !important;
            }
            
            .header h1 {
              font-size: 1.75rem !important;
              margin-bottom: 0.5rem !important;
            }
            
            .company-info {
              font-size: 0.7rem !important;
              gap: 0.5rem !important;
            }
            
            .company-info-item:not(:last-child)::after {
              margin: 0 0.3rem !important;
            }
            
            .terms {
              margin-top: 1rem !important;
              padding: 1rem !important;
              page-break-inside: avoid !important;
            }
            
            .terms h4 {
              font-size: 1.125rem !important;
              margin-bottom: 1rem !important;
              padding-bottom: 0.25rem !important;
            }
            
            .terms h5 {
              font-size: 0.875rem !important;
              margin-top: 0.75rem !important;
              margin-bottom: 0.5rem !important;
            }
            
            .terms p {
              font-size: 0.75rem !important;
              margin-bottom: 0.5rem !important;
              line-height: 1.6 !important;
            }
            
            .terms .section {
              margin-bottom: 1rem !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>고객 안내문구</h1>
            <div class="company-info">
              <div class="company-info-item"><strong>${
                ourCompany.name
              }</strong></div>
              ${
                ourCompany.representative
                  ? `<div class="company-info-item">대표자: ${ourCompany.representative}</div>`
                  : ""
              }
              ${
                ourCompany.registrationNumber
                  ? `<div class="company-info-item">사업자등록번호: ${ourCompany.registrationNumber}</div>`
                  : ""
              }
              ${
                ourCompany.address
                  ? `<div class="company-info-item">주소: ${ourCompany.address}</div>`
                  : ""
              }
              ${
                ourCompany.phone
                  ? `<div class="company-info-item">전화번호: ${ourCompany.phone}</div>`
                  : ""
              }
              ${
                ourCompany.email
                  ? `<div class="company-info-item">이메일: ${ourCompany.email}</div>`
                  : ""
              }
            </div>
          </div>

          <div class="terms">
            ${
              customerNotice.refundPolicy && customerNotice.refundPolicy.trim()
                ? `
            <div class="section">
              <h5>환불 불가 조항</h5>
              <p>${customerNotice.refundPolicy}</p>
            </div>
            `
                : ""
            }
            
            ${
              customerNotice.terms && customerNotice.terms.trim()
                ? `
            <div class="section">
              <h5>약관</h5>
              <p>${customerNotice.terms}</p>
            </div>
            `
                : ""
            }
            
            ${
              customerNotice.serviceScope && customerNotice.serviceScope.trim()
                ? `
            <div class="section">
              <h5>서비스 범위</h5>
              <p>${customerNotice.serviceScope}</p>
            </div>
            `
                : ""
            }
            
            ${
              customerNotice.deliveryPolicy &&
              customerNotice.deliveryPolicy.trim()
                ? `
            <div class="section">
              <h5>납기일 관련 안내</h5>
              <p>${customerNotice.deliveryPolicy}</p>
            </div>
            `
                : ""
            }
            
            ${
              customerNotice.paymentSchedule &&
              customerNotice.paymentSchedule.trim()
                ? `
            <div class="section">
              <h5>결제 일정</h5>
              <p>${customerNotice.paymentSchedule}</p>
            </div>
            `
                : ""
            }
            
            ${
              customerNotice.otherTerms && customerNotice.otherTerms.trim()
                ? `
            <div class="section">
              <h5>기타 약관</h5>
              <p>${customerNotice.otherTerms}</p>
            </div>
            `
                : ""
            }
          </div>
        </div>
      </body>
      </html>
      `;

      resolve(html);
    } catch (error: any) {
      console.error("Error generating customer notice HTML:", error);
      reject(error);
    }
  });
};

// 고객 안내문구 PDF 생성 함수
export const generateCustomerNoticePDF = (
  customerNotice: CustomerNotice
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const html = await generateCustomerNoticeHTML(customerNotice);

      // 웹뷰 환경에서 window.open이 차단될 수 있으므로 대체 방법 제공
      let printWindow: Window | null = null;

      try {
        printWindow = window.open("", "_blank");
      } catch (error) {
        console.warn("window.open failed, trying alternative method:", error);
      }

      // 웹뷰에서 팝업이 차단된 경우 대체 방법 시도
      if (
        !printWindow ||
        printWindow.closed ||
        typeof printWindow.closed === "undefined"
      ) {
        // 대체 방법: 현재 창에서 인쇄 다이얼로그 열기
        console.warn("Popup blocked, using print dialog fallback");
        const printContent = document.createElement("div");
        printContent.innerHTML = html;
        document.body.appendChild(printContent);
        window.print();
        document.body.removeChild(printContent);
        resolve();
        return;
      }

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      // 문서가 로드될 때까지 대기
      const checkReady = () => {
        if (printWindow && printWindow.document.readyState === "complete") {
          console.log("Customer notice PDF window loaded successfully");
          resolve();
        } else if (printWindow) {
          setTimeout(checkReady, 100);
        }
      };

      // 최대 5초 대기
      setTimeout(() => {
        if (printWindow && printWindow.document.readyState === "complete") {
          resolve();
        } else {
          console.warn(
            "Customer notice PDF window loading timeout, but resolving anyway"
          );
          resolve();
        }
      }, 5000);

      checkReady();
    } catch (error: any) {
      console.error("Error generating customer notice PDF:", error);
      reject(error);
    }
  });
};
