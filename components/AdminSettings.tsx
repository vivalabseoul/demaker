import { useState, useEffect } from 'react';
import { Plus, Trash2, Download, Upload, Save, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import { LaborRate } from '../types/quote';
import { getLaborRates, saveLaborRates } from '../utils/supabaseStore';
import { standardRateTemplates } from '../utils/standardRates';
import { toast } from 'sonner';

export function AdminSettings() {
  const [rates, setRates] = useState<LaborRate[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'company' | 'freelancer'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('개발');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    setLoading(true);
    const loadedRates = await getLaborRates();
    setRates(loadedRates);
    setLoading(false);
  };

  const handleAddRate = () => {
    const newRate: LaborRate = {
      id: Date.now().toString(),
      category: '개발',
      role: '',
      hourlyRate: 0,
      dailyRate: 0,
      type: 'company',
    };
    setRates([...rates, newRate]);
  };

  const handleUpdateRate = (id: string, field: keyof LaborRate, value: any) => {
    setRates(rates.map(rate => 
      rate.id === id ? { ...rate, [field]: value } : rate
    ));
  };

  const handleDeleteRate = (id: string) => {
    setRates(rates.filter(rate => rate.id !== id));
  };

  const handleResetAllRates = () => {
    if (rates.length === 0) {
      toast.info('삭제할 노임이 없습니다.');
      return;
    }

    if (confirm(`정말로 모든 노임(${rates.length}개)을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      setRates([]);
      toast.success('모든 노임이 삭제되었습니다. 저장 버튼을 클릭하여 변경사항을 적용하세요.');
    }
  };

  const handleSave = async () => {
    try {
      await saveLaborRates(rates);
      toast.success('✅ 노임 단가가 저장되었습니다!');
    } catch (error) {
      console.error('노임 저장 오류:', error);
      toast.error('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 카테고리 목록 추출
  const categories = ['all', ...Array.from(new Set(rates.map(rate => rate.category)))];
  
  // 필터링된 노임
  const filteredRates = rates.filter(rate => {
    const typeMatch = filterType === 'all' || rate.type === filterType;
    const categoryMatch = selectedCategory === 'all' || rate.category === selectedCategory;
    return typeMatch && categoryMatch;
  });

  // 페이징 계산
  const totalPages = Math.ceil(filteredRates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRates = filteredRates.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 필터 변경 시 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, selectedCategory]);

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    setShowTemplateDialog(true);
  };

  const handleTemplateApply = () => {
    const template = standardRateTemplates.find(t => t.year === selectedTemplate);
    if (template) {
      const newRates = template.rates.map((rate, index) => ({
        ...rate,
        id: (Date.now() + index).toString(),
      }));
      setRates(newRates);
      alert(`${template.name}이(가) 적용되었습니다. 필요한 항목을 수정한 후 저장하세요.`);
    }
    setShowTemplateDialog(false);
    setSelectedTemplate('');
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl flex flex-col" style={{ height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
      <div className="mb-6 md:mb-8 flex-shrink-0">
        <h1>노임 설정</h1>
        <p className="mt-2">개발자와 디자이너의 시급 및 일평균 단가를 설정합니다.</p>
      </div>

      {/* 액션 버튼 */}
      <div className="mb-6 flex flex-col sm:flex-row flex-wrap gap-2 justify-end flex-shrink-0">
        <Button
          onClick={() => setShowTemplateDialog(true)}
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          표준단가 불러오기
        </Button>
        <Button
          onClick={handleSave}
          style={{ backgroundColor: 'var(--black)', color: 'var(--white)' }}
        >
          <Save className="w-4 h-4 mr-2" />
          저장
        </Button>
      </div>

      <Card style={{ backgroundColor: 'var(--white)' }} className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <CardHeader className="flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3>노임 목록</h3>
            <div className="flex gap-2">
              <Button
                onClick={handleAddRate}
                size="sm"
                style={{ backgroundColor: 'var(--main-color)', color: 'var(--white)' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                노임 추가
              </Button>
              <Button
                onClick={handleResetAllRates}
                size="sm"
                variant="outline"
                style={{ 
                  borderColor: '#ef4444',
                  color: '#ef4444',
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                노임 초기화
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* 필터 - 유형과 카테고리 나란히 */}
          <div className="mb-4 flex-shrink-0 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* 유형 필터 */}
            <div className="flex-shrink-0">
              <Tabs value={filterType} onValueChange={(v) => setFilterType(v as 'all' | 'company' | 'freelancer')}>
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="all">전체</TabsTrigger>
                  <TabsTrigger value="company">회사</TabsTrigger>
                  <TabsTrigger value="freelancer">프리랜서</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* 카테고리 탭 */}
            <div className="flex-1 min-w-0">
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="flex flex-wrap gap-2 w-full">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category === 'all' ? '전체' : category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden flex-1 flex flex-col min-h-0" style={{ height: '100%' }}>
            <div 
              className={`flex-1 ${filteredRates.length > 10 ? 'overflow-y-auto' : ''}`}
              style={{ minHeight: '400px' }}
            >
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                  <TableRow className="border-b border-[#D4D4D4]">
                    <TableHead className="bg-white border-b border-[#D4D4D4] p-3 font-semibold">카테고리</TableHead>
                    <TableHead className="bg-white border-b border-[#D4D4D4] p-3 font-semibold">직무</TableHead>
                    <TableHead className="bg-white border-b border-[#D4D4D4] p-3 font-semibold">시급 (원)</TableHead>
                    <TableHead className="bg-white border-b border-[#D4D4D4] p-3 font-semibold">일평균 (원)</TableHead>
                    <TableHead className="bg-white border-b border-[#D4D4D4] p-3 font-semibold">유형</TableHead>
                    <TableHead className="bg-white border-b border-[#D4D4D4] p-3 font-semibold w-[80px]">삭제</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRates.map((rate) => (
                    <TableRow key={rate.id} className="border-b border-[#D4D4D4]">
                      <TableCell className="p-3">
                        <Select
                          value={rate.category}
                          onValueChange={(value) => handleUpdateRate(rate.id, 'category', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="개발">개발</SelectItem>
                            <SelectItem value="디자인">디자인</SelectItem>
                            <SelectItem value="기획">기획</SelectItem>
                            <SelectItem value="QA">QA</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-3">
                        <Input
                          value={rate.role}
                          onChange={(e) => handleUpdateRate(rate.id, 'role', e.target.value)}
                          placeholder="예: 시니어 개발자"
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell className="p-3">
                        <Input
                          type="number"
                          value={rate.hourlyRate}
                          onChange={(e) => handleUpdateRate(rate.id, 'hourlyRate', Number(e.target.value))}
                          placeholder="50000"
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell className="p-3">
                        <Input
                          type="number"
                          value={rate.dailyRate}
                          onChange={(e) => handleUpdateRate(rate.id, 'dailyRate', Number(e.target.value))}
                          placeholder="400000"
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell className="p-3">
                        <Select
                          value={rate.type}
                          onValueChange={(value) => handleUpdateRate(rate.id, 'type', value as 'company' | 'freelancer')}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="company">회사</SelectItem>
                            <SelectItem value="freelancer">프리랜서</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-3">
                        <Button
                          size="sm"
                          onClick={() => handleDeleteRate(rate.id)}
                          className="transition-colors hover:!bg-[var(--sub-color)]"
                          style={{ 
                            backgroundColor: '#9ca3af',
                            color: 'var(--white)',
                            minWidth: '2.5rem',
                            padding: '0.5rem'
                          }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <p>등록된 노임이 없습니다. 노임을 추가해주세요.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // 페이지 번호 표시 로직 (현재 페이지 주변만 표시)
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        style={{
                          backgroundColor: currentPage === page ? "var(--main-color)" : undefined,
                          color: currentPage === page ? "var(--white)" : undefined,
                        }}
                      >
                        {page}
                      </Button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  return null;
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              표준 노임단가 불러오기
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>
              한국SW산업협회 기준 표준 노임단가를 불러옵니다. 불러온 후 필요에 따라 수정하실 수 있습니다.
            </p>
            <div>
              <Label>도별 표준 노임단가</Label>
              <div className="mt-2 space-y-2">
                {standardRateTemplates.map((template) => (
                  <button
                    key={template.year}
                    onClick={() => setSelectedTemplate(template.year)}
                    className={`w-full p-4 border rounded-lg text-left transition-all ${
                      selectedTemplate === template.year
                        ? 'border-2'
                        : 'border-[#e1e1e1] hover:border-[#D6D3D1]'
                    }`}
                    style={selectedTemplate === template.year ? { borderColor: 'var(--main-color)' } : {}}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="mb-1">{template.name}</h4>
                        <p style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>{template.description}</p>
                      </div>
                      {selectedTemplate === template.year && (
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: 'var(--main-color)' }}
                        >
                          <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div 
              className="p-3 rounded-lg" 
              style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107' }}
            >
              <p style={{ color: '#856404' }}>
                ⚠️ 기존 노임단가는 모두 삭제되고 선택한 표준 단가로 대체됩니다.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTemplateDialog(false);
                setSelectedTemplate('');
              }}
            >
              취소
            </Button>
            <Button
              onClick={handleTemplateApply}
              disabled={!selectedTemplate}
              style={{ backgroundColor: 'var(--main-color)', color: 'var(--white)' }}
            >
              적용하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}