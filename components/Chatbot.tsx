// AI 챗봇 컴포넌트

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "안녕하세요! 개발견적메이커 챗봇입니다. 무엇을 도와드릴까요?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const faqResponses = [
    {
      keywords: ["견적서 작성", "진행 순서", "프로젝트 기본"],
      response: `견적서 작성은 '견적서 작성' 메뉴에서 시작하세요!

진행 순서:
1. 프로젝트 기본 정보 입력
2. 견적 항목 추가 (개발 내용, 소요 일수 등)
3. 재경비와 기술료 설정
4. 검토 후 저장 또는 발급

궁금한 점이 있으신가요?`,
    },
    {
      keywords: ["구독 관리", "요금제", "결제"],
      response: `구독 관리 메뉴에서 요금제를 선택하고 결제할 수 있습니다.

• 여러 요금제 중 선택 가능
• 안전한 결제 시스템
• 결제 내역 조회 및 영수증 발급
• 언제든지 플랜 변경 가능
• 자동 갱신 설정 가능

결제 중 문제가 있으신가요?`,
    },
    {
      keywords: ["구독 취소", "환불"],
      response: `구독 취소 및 환불은 '구독 관리' 메뉴에서 진행할 수 있습니다.

• 언제든지 구독 취소 가능
• 환불 정책은 결제 방식에 따라 다릅니다
• 취소 즉시 서비스 이용 중단됨
• 환불 기간은 카드사/결제사 정책을 따릅니다

자세한 환불 정책은 고객센터에 문의해주세요.`,
    },
    {
      keywords: ["거래처", "거래처 관리"],
      response: `거래처 관리는 '거래처 관리' 메뉴에서 할 수 있습니다.

기능:
• 거래처 정보 저장 (회사명, 담당자, 연락처 등)
• 거래처별 견적서 자동 저장
• 빠른 검색 및 불러오기
• 거래처 삭제 및 수정
• 거래처별 견적 이력 조회

거래처를 추가하고 효율적으로 관리하세요!`,
    },
    {
      keywords: ["회사 정보"],
      response: `'회사 정보' 메뉴에서 회사 정보를 관리하세요.

설정 항목:
• 회사명, 대표자명
• 주소, 전화번호, 이메일
• 사업자등록번호
• 재경비 및 기술료 비율 설정
• 로고 이미지 업로드

입력된 정보는 견적서에 자동으로 반영됩니다.`,
    },
    {
      keywords: ["노임 설정", "노임"],
      response: `'노임 설정' 메뉴에서 급여 기준을 관리하세요.

설정 방식:
• 카테고리별 설정 (예: 분석가, 개발자, 테스터 등)
• 역할별 시급 및 일급 설정
• 경력 수준별 차등 설정 가능
• 프로젝트별 특별 단가 적용

정확한 노임 설정으로 합리적인 견적을 만드세요!`,
    },
    {
      keywords: ["재경비", "기술료"],
      response: `재경비와 기술료는 견적서에 자동으로 계산됩니다.

설정 방법:
• '회사 정보' 메뉴에서 비율(%) 설정
• 견적서 작성 시 자동 계산
• 프로젝트별로 임시 조정 가능

재경비: 프로젝트 진행에 필요한 운영비
기술료: 기술력과 노하우에 대한 서비스료`,
    },
    {
      keywords: ["pdf", "인쇄", "다운로드"],
      response: `견적서를 PDF로 저장하고 인쇄하세요!

방법:
1. 완성된 견적서 확인
2. '인쇄' 버튼 클릭
3. PDF 다운로드 (최종 견적금액 포함)
4. 원하는 방식으로 인쇄 또는 공유
5. 이메일로 고객에게 전송 가능

전문적인 형식으로 고객에게 제시하세요!`,
    },
    {
      keywords: ["견적서 관리", "발급", "저장"],
      response: `견적서는 다양한 방식으로 관리할 수 있습니다.

저장 방법:
• '저장' 버튼: 현재 작업 내용 임시 저장
• '발급' 버튼: 최종 견적서 발급

관리 기능:
• 저장된 견적서 목록 조회
• 이전 견적서 불러오기 및 수정
• 견적서 삭제 및 복제`,
    },
    {
      keywords: ["견적 항목", "항목 추가"],
      response: `견적 항목 추가 방법입니다.

항목 추가:
• '항목 추가' 버튼 클릭
• 작업 내용 입력
• 소요 일수 또는 예상 시간 입력
• 담당 역할 선택 (단가 자동 계산)

항목 관리:
• 항목 수정/삭제 가능
• 드래그로 순서 변경
• 같은 항목 복제 가능`,
    },
    {
      keywords: ["견적 금액", "계산 구조"],
      response: `견적 금액 계산 방식입니다.

1. 각 항목 금액 = 노임 단가 × 소요 일수
2. 소계 = 모든 항목 금액의 합
3. 재경비 = 소계 × 재경비 비율
4. 기술료 = 소계 × 기술료 비율
5. 최종 견적금액 = 소계 + 재경비 + 기술료

모든 계산은 자동으로 진행됩니다.`,
    },
    {
      keywords: ["공유", "보내기"],
      response: `견적서를 다양한 방식으로 공유할 수 있습니다.

공유 방법:
• PDF 다운로드 후 메일 첨부
• 링크로 공유
• 팩스 또는 우편 발송

주의사항:
• 회사/고객 정보를 반드시 확인해주세요.`,
    },
    {
      keywords: ["로그인", "계정"],
      response: `로그인 및 계정 관리 안내입니다.

로그인:
• 이메일 주소와 비밀번호로 로그인
• 자동 로그인 기능 사용 가능

계정 관리:
• 프로필 수정
• 비밀번호 변경
• 로그아웃`,
    },
    {
      keywords: ["비밀번호", "초기화"],
      response: `비밀번호 찾기 및 초기화 절차입니다.

1. 로그인 페이지에서 '비밀번호 찾기' 클릭
2. 가입한 이메일 입력
3. 이메일의 링크 클릭
4. 새 비밀번호 설정 후 로그인

이메일이 보이지 않으면 스팸함을 확인해주세요.`,
    },
    {
      keywords: ["기술 문제", "오류", "버그"],
      response: `기술 문제가 발생하면 다음을 확인해주세요.

• 최신 브라우저 사용 여부
• 인터넷 연결 상태
• 브라우저 캐시 삭제
• 다른 브라우저로 시도

그래도 해결되지 않으면 고객센터에 스크린샷과 함께 문의해주세요.`,
    },
    {
      keywords: ["환영", "주요 기능"],
      response: `개발견적메이커에 오신 것을 환영합니다!

주요 기능:
1. 견적서 작성
2. 거래처 관리
3. 노임 설정
4. 회사 정보 관리
5. 구독 관리
6. PDF 발급

궁금한 기능에 대해 물어보세요!`,
    },
    {
      keywords: ["무엇을", "도와드릴까요", "질문"],
      response: `잠깐, 무엇을 도와드릴까요?

다음과 같이 물어봐주세요:
• 견적서 작성 방법
• 거래처 추가
• 결제 방법
• 노임 설정
• 회사 정보 입력
• 금액 계산 방식
• 비밀번호 분실
• 기술 문제

구체적인 질문일수록 더 정확하게 답변해드릴 수 있어요!`,
    },
  ];


  // 메시지 추가 시 스크롤을 맨 아래로
  useEffect(() => {
    if (!scrollAreaRef.current) return;
    const scrollContainer = scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement | null;
    if (!scrollContainer) return;

    requestAnimationFrame(() => {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages, isOpen]);

  // 챗봇 열릴 때 입력창 포커스
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // 간단한 응답 로직 (나중에 AI API로 교체 가능)
      const response = await generateResponse(userMessage.content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      toast.error("메시지 전송에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateResponse = async (userInput: string): Promise<string> => {
    const lowerInput = userInput.toLowerCase();
    const matched = faqResponses.find((faq) =>
      faq.keywords.some((keyword) =>
        lowerInput.includes(keyword.toLowerCase())
      )
    );

    if (matched) {
      return matched.response;
    }

    if (
      lowerInput.includes("도움") ||
      lowerInput.includes("도와") ||
      lowerInput.includes("어떻게")
    ) {
      return "개발견적메이커는 소프트웨어 개발 프로젝트 견적서를 쉽게 작성할 수 있는 도구입니다. 메뉴나 기능을 구체적으로 질문해주시면 정확히 안내해드릴게요!";
    }

    return "죄송합니다. 질문을 조금 더 구체적으로 알려주시면 보다 정확하게 안내해드릴 수 있어요.";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 챗봇 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        style={{
          backgroundColor: "var(--main-color)",
          color: "var(--white)",
        }}
        aria-label="챗봇 열기"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* 챗봇 창 */}
      {isOpen && (
        <Card
          className="fixed bottom-24 right-6 z-50 w-96 h-[600px] flex flex-col shadow-2xl"
          style={{
            backgroundColor: "var(--white)",
            border: "1px solid #e1e1e1",
          }}
        >
          <CardHeader className="pb-3 border-b border-[#e1e1e1]">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot
                  className="w-5 h-5"
                  style={{ color: "var(--main-color)" }}
                />
                AI 챗봇 도우미
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* 메시지 영역 */}
            <ScrollArea
              className="flex-1 px-4 py-4 h-full overflow-hidden"
              ref={scrollAreaRef}
            >
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "var(--main-color)" }}
                      >
                        <Bot
                          className="w-5 h-5"
                          style={{ color: "var(--white)" }}
                        />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "rounded-tr-none"
                          : "rounded-tl-none"
                      }`}
                      style={{
                        backgroundColor:
                          message.role === "user"
                            ? "var(--main-color)"
                            : "#f3f4f6",
                        color:
                          message.role === "user"
                            ? "var(--white)"
                            : "var(--black)",
                      }}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p
                        className="text-xs mt-1 opacity-70"
                        style={{
                          color:
                            message.role === "user"
                              ? "var(--white)"
                              : "var(--gray)",
                        }}
                      >
                        {message.timestamp.toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#e1e1e1" }}
                      >
                        <User
                          className="w-5 h-5"
                          style={{ color: "var(--gray)" }}
                        />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "var(--main-color)" }}
                    >
                      <Bot
                        className="w-5 h-5"
                        style={{ color: "var(--white)" }}
                      />
                    </div>
                    <div
                      className="rounded-lg rounded-tl-none px-4 py-2"
                      style={{ backgroundColor: "#f3f4f6" }}
                    >
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            backgroundColor: "var(--main-color)",
                            animationDelay: "0ms",
                          }}
                        />
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            backgroundColor: "var(--main-color)",
                            animationDelay: "150ms",
                          }}
                        />
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            backgroundColor: "var(--main-color)",
                            animationDelay: "300ms",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* 입력 영역 */}
            <div className="border-t border-[#e1e1e1] p-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="메시지를 입력하세요..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  style={{
                    backgroundColor: "var(--main-color)",
                    color: "var(--white)",
                  }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p
                className="text-xs mt-2 text-center"
                style={{ color: "var(--gray)" }}
              >
                Enter 키로 전송할 수 있습니다
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
