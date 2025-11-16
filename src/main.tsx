import React from "react";
import ReactDOM from "react-dom/client";
import App from "../App.tsx";
import "../styles/globals.css";
import { testSupabaseConnection } from "../utils/supabase";

// Supabase 연결 테스트
testSupabaseConnection().then((connected) => {
  if (connected) {
    console.log("✅ Supabase 연결 확인 완료");
    console.log(
      "📝 다음 단계: Supabase SQL Editor에서 docs/SUPABASE_MIGRATION.sql 실행"
    );
  } else {
    console.error("❌ Supabase 연결 확인 실패");
    console.error("💡 확인사항:");
    console.error("1. Supabase 프로젝트가 활성화되어 있는지 확인");
    console.error(
      "2. 환경 변수 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY가 설정되어 있는지 확인"
    );
    console.error("3. utils/supabase/info.tsx의 기본값이 올바른지 확인");
  }
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("❌ 앱 렌더링 실패:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>오류가 발생했습니다</h1>
      <p>브라우저 콘솔을 확인해주세요.</p>
      <pre>${error}</pre>
    </div>
  `;
}

