import { LaborRate } from '../types/quote';

export interface StandardRateTemplate {
  year: string;
  name: string;
  description: string;
  rates: Omit<LaborRate, 'id'>[];
}

export const standardRateTemplates: StandardRateTemplate[] = [
  {
    year: '2025',
    name: '2025년 SW산업 표준 노임단가',
    description: '한국SW산업협회 기준 (2025년)',
    rates: [
      // 회사 - 개발
      { category: '개발', role: 'PM/PL', hourlyRate: 85000, dailyRate: 680000, type: 'company' },
      { category: '개발', role: '특급기술자', hourlyRate: 75000, dailyRate: 600000, type: 'company' },
      { category: '개발', role: '고급기술자', hourlyRate: 65000, dailyRate: 520000, type: 'company' },
      { category: '개발', role: '중급기술자', hourlyRate: 52000, dailyRate: 416000, type: 'company' },
      { category: '개발', role: '초급기술자', hourlyRate: 42000, dailyRate: 336000, type: 'company' },
      
      // 회사 - 디자인
      { category: '디자인', role: 'UI/UX 수석 디자이너', hourlyRate: 70000, dailyRate: 560000, type: 'company' },
      { category: '디자인', role: 'UI/UX 디자이너', hourlyRate: 60000, dailyRate: 480000, type: 'company' },
      { category: '디자인', role: '그래픽 디자이너', hourlyRate: 50000, dailyRate: 400000, type: 'company' },
      { category: '디자인', role: '주니어 디자이너', hourlyRate: 40000, dailyRate: 320000, type: 'company' },
      
      // 회사 - 기획
      { category: '기획', role: '수석 기획자', hourlyRate: 75000, dailyRate: 600000, type: 'company' },
      { category: '기획', role: '선임 기획자', hourlyRate: 60000, dailyRate: 480000, type: 'company' },
      { category: '기획', role: '주니어 기획자', hourlyRate: 45000, dailyRate: 360000, type: 'company' },
      
      // 회사 - QA
      { category: 'QA', role: 'QA 리드', hourlyRate: 65000, dailyRate: 520000, type: 'company' },
      { category: 'QA', role: 'QA 엔지니어', hourlyRate: 50000, dailyRate: 400000, type: 'company' },
      
      // 프리랜서 - 개발
      { category: '개발', role: 'PM/PL', hourlyRate: 65000, dailyRate: 520000, type: 'freelancer' },
      { category: '개발', role: '특급기술자', hourlyRate: 58000, dailyRate: 464000, type: 'freelancer' },
      { category: '개발', role: '고급기술자', hourlyRate: 50000, dailyRate: 400000, type: 'freelancer' },
      { category: '개발', role: '중급기술자', hourlyRate: 40000, dailyRate: 320000, type: 'freelancer' },
      { category: '개발', role: '초급기술자', hourlyRate: 32000, dailyRate: 256000, type: 'freelancer' },
      
      // 프리랜서 - 디자인
      { category: '디자인', role: 'UI/UX 수석 디자이너', hourlyRate: 55000, dailyRate: 440000, type: 'freelancer' },
      { category: '디자인', role: 'UI/UX 디자이너', hourlyRate: 48000, dailyRate: 384000, type: 'freelancer' },
      { category: '디자인', role: '그래픽 디자이너', hourlyRate: 40000, dailyRate: 320000, type: 'freelancer' },
      { category: '디자인', role: '주니어 디자이너', hourlyRate: 32000, dailyRate: 256000, type: 'freelancer' },
      
      // 프리랜서 - 기획
      { category: '기획', role: '수석 기획자', hourlyRate: 58000, dailyRate: 464000, type: 'freelancer' },
      { category: '기획', role: '선임 기획자', hourlyRate: 48000, dailyRate: 384000, type: 'freelancer' },
      { category: '기획', role: '주니어 기획자', hourlyRate: 36000, dailyRate: 288000, type: 'freelancer' },
      
      // 프리랜서 - QA
      { category: 'QA', role: 'QA 리드', hourlyRate: 50000, dailyRate: 400000, type: 'freelancer' },
      { category: 'QA', role: 'QA 엔지니어', hourlyRate: 38000, dailyRate: 304000, type: 'freelancer' },
    ],
  },
  {
    year: '2024',
    name: '2024년 SW산업 표준 노임단가',
    description: '한국SW산업협회 기준 (2024년)',
    rates: [
      // 회사 - 개발
      { category: '개발', role: 'PM/PL', hourlyRate: 80000, dailyRate: 640000, type: 'company' },
      { category: '개발', role: '특급기술자', hourlyRate: 70000, dailyRate: 560000, type: 'company' },
      { category: '개발', role: '고급기술자', hourlyRate: 60000, dailyRate: 480000, type: 'company' },
      { category: '개발', role: '중급기술자', hourlyRate: 48000, dailyRate: 384000, type: 'company' },
      { category: '개발', role: '초급기술자', hourlyRate: 38000, dailyRate: 304000, type: 'company' },
      
      // 회사 - 디자인
      { category: '디자인', role: 'UI/UX 수석 디자이너', hourlyRate: 65000, dailyRate: 520000, type: 'company' },
      { category: '디자인', role: 'UI/UX 디자이너', hourlyRate: 55000, dailyRate: 440000, type: 'company' },
      { category: '디자인', role: '그래픽 디자이너', hourlyRate: 45000, dailyRate: 360000, type: 'company' },
      { category: '디자인', role: '주니어 디자이너', hourlyRate: 35000, dailyRate: 280000, type: 'company' },
      
      // 회사 - 기획
      { category: '기획', role: '수석 기획자', hourlyRate: 70000, dailyRate: 560000, type: 'company' },
      { category: '기획', role: '선임 기획자', hourlyRate: 55000, dailyRate: 440000, type: 'company' },
      { category: '기획', role: '주니어 기획자', hourlyRate: 40000, dailyRate: 320000, type: 'company' },
      
      // 회사 - QA
      { category: 'QA', role: 'QA 리드', hourlyRate: 60000, dailyRate: 480000, type: 'company' },
      { category: 'QA', role: 'QA 엔지니어', hourlyRate: 45000, dailyRate: 360000, type: 'company' },
      
      // 프리랜서 - 개발
      { category: '개발', role: 'PM/PL', hourlyRate: 60000, dailyRate: 480000, type: 'freelancer' },
      { category: '개발', role: '특급기술자', hourlyRate: 53000, dailyRate: 424000, type: 'freelancer' },
      { category: '개발', role: '고급기술자', hourlyRate: 45000, dailyRate: 360000, type: 'freelancer' },
      { category: '개발', role: '중급기술자', hourlyRate: 36000, dailyRate: 288000, type: 'freelancer' },
      { category: '개발', role: '초급기술자', hourlyRate: 28000, dailyRate: 224000, type: 'freelancer' },
      
      // 프리랜서 - 디자인
      { category: '디자인', role: 'UI/UX 수석 디자이너', hourlyRate: 50000, dailyRate: 400000, type: 'freelancer' },
      { category: '디자인', role: 'UI/UX 디자이너', hourlyRate: 43000, dailyRate: 344000, type: 'freelancer' },
      { category: '디자인', role: '그래픽 디자이너', hourlyRate: 35000, dailyRate: 280000, type: 'freelancer' },
      { category: '디자인', role: '주니어 디자이너', hourlyRate: 28000, dailyRate: 224000, type: 'freelancer' },
      
      // 프리랜서 - 기획
      { category: '기획', role: '수석 기획자', hourlyRate: 53000, dailyRate: 424000, type: 'freelancer' },
      { category: '기획', role: '선임 기획자', hourlyRate: 43000, dailyRate: 344000, type: 'freelancer' },
      { category: '기획', role: '주니어 기획자', hourlyRate: 32000, dailyRate: 256000, type: 'freelancer' },
      
      // 프리랜서 - QA
      { category: 'QA', role: 'QA 리드', hourlyRate: 45000, dailyRate: 360000, type: 'freelancer' },
      { category: 'QA', role: 'QA 엔지니어', hourlyRate: 34000, dailyRate: 272000, type: 'freelancer' },
    ],
  },
];
