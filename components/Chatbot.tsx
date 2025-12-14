// 문의하기 컴포넌트

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { MessageCircle, X, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { toast } from "sonner";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("이름을 입력해주세요.");
      return;
    }

    if (!email.trim()) {
      toast.error("이메일을 입력해주세요.");
      return;
    }

    if (!message.trim()) {
      toast.error("문의 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: 실제 문의 전송 로직 구현 (이메일 전송 또는 DB 저장)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success("문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.");
      
      // 폼 초기화
      setName("");
      setEmail("");
      setMessage("");
      setIsOpen(false);
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("문의 전송에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 문의하기 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        style={{
          backgroundColor: "var(--main-color)",
          color: "var(--white)",
        }}
        aria-label="문의하기"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* 문의 폼 */}
      {isOpen && (
        <Card
          className="fixed bottom-24 right-6 z-50 w-96 flex flex-col shadow-2xl"
          style={{
            backgroundColor: "var(--white)",
            border: "1px solid #e1e1e1",
          }}
        >
          <CardHeader className="pb-3 border-b border-[#e1e1e1]">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle
                  className="w-5 h-5"
                  style={{ color: "var(--main-color)" }}
                />
                문의하기
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

          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">이름</Label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">이메일</Label>
              <Input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message">문의 내용</Label>
              <Textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="문의 내용을 입력하세요"
                rows={6}
                disabled={isSubmitting}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
              style={{
                backgroundColor: "var(--main-color)",
                color: "var(--white)",
              }}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "전송 중..." : "문의하기"}
            </Button>

            <p
              className="text-xs text-center"
              style={{ color: "var(--gray)" }}
            >
              문의 주신 내용은 빠른 시일 내에 답변드리겠습니다.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
