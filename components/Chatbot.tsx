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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 메시지 추가 시 스크롤을 맨 아래로
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

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
    // 간단한 키워드 기반 응답 (나중에 AI API로 교체 가능)
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes("견적") || lowerInput.includes("견적서")) {
      return "견적서 작성은 '견적서 작성' 메뉴에서 할 수 있습니다. 견적 항목을 추가하고 재경비와 기술료를 설정한 후 저장하거나 발급할 수 있습니다.";
    }

    if (lowerInput.includes("결제") || lowerInput.includes("구독")) {
      return "구독 관리는 '구독 관리' 메뉴에서 할 수 있습니다. 다양한 요금제를 선택하여 결제할 수 있으며, 결제 내역도 확인할 수 있습니다.";
    }

    if (lowerInput.includes("거래처") || lowerInput.includes("고객")) {
      return "거래처 관리는 '거래처 관리' 메뉴에서 할 수 있습니다. 거래처 정보를 저장하고 견적서 작성 시 불러올 수 있습니다.";
    }

    if (lowerInput.includes("회사") || lowerInput.includes("정보")) {
      return "회사 정보는 '회사 정보' 메뉴에서 설정할 수 있습니다. 회사명, 대표자, 주소, 연락처 등을 입력하고 재경비와 기술료 비율도 설정할 수 있습니다.";
    }

    if (lowerInput.includes("노임") || lowerInput.includes("단가")) {
      return "노임 설정은 '노임 설정' 메뉴에서 할 수 있습니다. 카테고리별, 역할별로 시급과 일급을 설정할 수 있습니다.";
    }

    if (lowerInput.includes("pdf") || lowerInput.includes("인쇄")) {
      return "견적서는 '인쇄' 버튼을 클릭하여 PDF로 다운로드하거나 인쇄할 수 있습니다. 최종견적금액도 포함되어 출력됩니다.";
    }

    if (
      lowerInput.includes("도움") ||
      lowerInput.includes("도와") ||
      lowerInput.includes("어떻게")
    ) {
      return "개발견적메이커는 소프트웨어 개발 프로젝트 견적서를 쉽게 작성할 수 있는 도구입니다. 주요 기능:\n\n1. 견적서 작성 및 관리\n2. 거래처 정보 관리\n3. 구독 및 결제 관리\n4. PDF 다운로드\n\n자세한 도움이 필요하시면 특정 기능에 대해 질문해주세요!";
    }

    // 기본 응답
    return "죄송합니다. 더 구체적으로 질문해주시면 도와드리겠습니다. 예를 들어 '견적서 작성 방법', '결제 방법', '거래처 관리' 등에 대해 물어보실 수 있습니다.";
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
