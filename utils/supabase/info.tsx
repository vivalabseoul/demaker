// Supabase 프로젝트 설정
// 환경 변수에서 가져오거나 기본값 사용
export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://kkarvjxutjxhklistdjr.supabase.co";

export const publicAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXJ2anh1dGp4aGtsaXN0ZGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMzI4NTcsImV4cCI6MjA3ODcwODg1N30.WV2YoBq_ueHVn-V_gIW85rHynb2hQmMNidMgV0Z13v4";

// 프로젝트 ID 추출 (URL에서)
export const projectId = supabaseUrl
  .replace("https://", "")
  .replace(".supabase.co", "");

// 또는 직접 설정 (환경 변수가 없을 경우)
// export const projectId = "YOUR_PROJECT_ID";
// export const publicAnonKey = "YOUR_ANON_KEY";
