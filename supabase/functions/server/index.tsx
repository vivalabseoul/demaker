import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-c3067cfb/health", (c) => {
  return c.json({ status: "ok" });
});

// AI 견적 도우미 - 견적 최적화 제안
app.post("/make-server-c3067cfb/ai/suggest-quote", async (c) => {
  try {
    const { items, expenseRate, quoteType } = await c.req.json();
    
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      console.log("AI 견적 도우미 에러: OPENAI_API_KEY가 설정되지 않았습니다.");
      return c.json({ error: "API 키가 설정되지 않았습니다." }, 500);
    }

    // OpenAI API 호출
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `당신은 소프트웨어 개발 및 디자인 프로젝트의 견적을 최적화하는 전문가입니다. 
            실제 프로젝트 경험과 업계 표준을 바탕으로 적정한 공수를 제안합니다.
            견적 유형(${quoteType === 'company' ? '회사' : '프리랜서'})을 고려하여 답변하세요.`
          },
          {
            role: "user",
            content: `다음 견적 항목들을 분석하고 각 항목에 대해 최적화된 시간/일수를 제안해주세요:

${items.map((item: any, i: number) => `
${i + 1}. ${item.category} - ${item.role}
   - 현재 시간: ${item.hours || 0}시간
   - 현재 일수: ${item.days || 0}일
   - 계산 방식: ${item.calculationType === 'hourly' ? '시급' : '일급'}
   - 시급: ${item.hourlyRate}원
   - 일급: ${item.dailyRate}원
`).join('')}

재경비율: ${expenseRate}%

JSON 형식으로 각 항목에 대해 다음 정보를 제공해주세요:
{
  "items": [
    {
      "index": 0,
      "aiHours": 추천시간,
      "aiDays": 추천일수,
      "reasoning": "추천 이유"
    }
  ],
  "reasoning": ["전체적인 분석 포인트1", "분석 포인트2", "분석 포인트3"]
}

**중요**: 반드시 유효한 JSON 형식으로만 응답하세요. 추가 설명 없이 JSON만 반환하세요.`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`OpenAI API 에러: ${response.status} - ${errorText}`);
      return c.json({ error: `OpenAI API 에러: ${response.status}` }, 500);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // JSON 파싱
    let parsedResponse;
    try {
      // JSON 블록 추출 (```json ... ``` 형식 처리)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.log(`AI 응답 파싱 에러: ${parseError}, 응답: ${aiResponse}`);
      return c.json({ error: "AI 응답을 처리할 수 없습니다." }, 500);
    }

    // 실제 금액 계산
    const aiItems = items.map((item: any, index: number) => {
      const aiData = parsedResponse.items[index];
      const aiHours = aiData.aiHours;
      const aiDays = aiData.aiDays;
      
      const aiAmount = item.calculationType === 'hourly'
        ? (aiHours + aiDays * 8) * item.hourlyRate
        : aiDays * item.dailyRate;

      return {
        ...item,
        aiHours,
        aiDays,
        aiAmount,
        reasoning: aiData.reasoning,
      };
    });

    const aiSubtotal = aiItems.reduce((sum: number, item: any) => sum + item.aiAmount, 0);
    const aiExpenseAmount = Math.round(aiSubtotal * (expenseRate / 100));
    const aiTotalAmount = aiSubtotal + aiExpenseAmount;

    return c.json({
      items: aiItems,
      subtotal: aiSubtotal,
      expenseAmount: aiExpenseAmount,
      totalAmount: aiTotalAmount,
      reasoning: parsedResponse.reasoning,
    });

  } catch (error) {
    console.log(`AI 견적 도우미 에러: ${error}`);
    return c.json({ error: `서버 에러: ${error.message}` }, 500);
  }
});

// AI 견적서 검토
app.post("/make-server-c3067cfb/ai/review-quote", async (c) => {
  try {
    const { items, expenseRate, totalAmount, subtotal, discounts } = await c.req.json();
    
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      console.log("AI 검토 요청 에러: OPENAI_API_KEY가 설정되지 않았습니다.");
      return c.json({ error: "API 키가 설정되지 않았습니다." }, 500);
    }

    const totalHours = items.reduce((sum: number, item: any) => {
      if (item.calculationType === 'hourly') {
        return sum + (item.hours || 0) + (item.days || 0) * 8;
      } else {
        return sum + (item.days || 0) * 8;
      }
    }, 0);

    const totalDiscount = discounts.reduce((sum: number, d: any) => {
      return sum + (d.type === 'amount' ? d.value : subtotal * (d.value / 100));
    }, 0);

    // OpenAI API 호출
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `당신은 소프트웨어 개발 및 디자인 프로젝트의 견적을 전문적으로 검토하는 컨설턴트입니다. 
            견적의 적정성, 시장 경쟁력, 리스크 요소를 분석하고 구체적인 개선안을 제시합니다.`
          },
          {
            role: "user",
            content: `다음 견적서를 종합적으로 검토하고 분석해주세요:

**견적 개요**
- 총 견적 금액: ${totalAmount.toLocaleString()}원
- 순수 작업비: ${subtotal.toLocaleString()}원
- 재경비 (${expenseRate}%): ${(totalAmount - subtotal).toLocaleString()}원
- 할인 금액: ${totalDiscount.toLocaleString()}원
- 총 작업 시간: ${totalHours}시간
- 평균 시급: ${Math.round(subtotal / totalHours).toLocaleString()}원

**견적 항목 상세**
${items.map((item: any, i: number) => `
${i + 1}. ${item.category} - ${item.role}
   - 시간: ${item.hours || 0}시간, 일수: ${item.days || 0}일
   - 금액: ${item.amount.toLocaleString()}원
   - 계산방식: ${item.calculationType === 'hourly' ? '시급' : '일급'}
`).join('')}

다음 형식으로 마크다운으로 작성해주세요:

**견적서 종합 분석**

**1. 견적 구성 평가**
(전체적인 견적의 적정성 평가)

**2. 항목별 분석**
(각 항목에 대한 구체적 검토)

**3. 개선 제안**
(구체적인 개선 방안)

**4. 리스크 요소**
(주의해야 할 점과 대응 방안)`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`OpenAI API 에러: ${response.status} - ${errorText}`);
      return c.json({ error: `OpenAI API 에러: ${response.status}` }, 500);
    }

    const data = await response.json();
    const review = data.choices[0].message.content;

    return c.json({ review });

  } catch (error) {
    console.log(`AI 검토 요청 에러: ${error}`);
    return c.json({ error: `서버 에러: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);