import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Client } from '../types/quote';
import { getClients, saveClient, deleteClient, formatCurrency } from '../utils/supabaseStore';
import { toast } from 'sonner';

export function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const loadedClients = await getClients();
    setClients(loadedClients);
    setLoading(false);
  };

  const handleSaveClient = async (client: Client) => {
    try {
      await saveClient(client);
      await loadClients();
      setIsDialogOpen(false);
      setEditingClient(null);
      toast.success('✅ 거래처 정보가 저장되었습니다!');
    } catch (error) {
      console.error('거래처 저장 오류:', error);
      toast.error('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteClient(id);
        await loadClients();
        toast.success('거래처가 삭제되었습니다.');
      } catch (error) {
        toast.error('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsDialogOpen(true);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.representative.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div>
          <h1>거래처 관리</h1>
          <p className="mt-2">거래처 정보를 등록하고 매출을 관리하세요.</p>
        </div>
      </div>

      {/* 모바일: 추가버튼 상단 배치 / 데스크톱: 헤더 우측 */}
      <div className="mb-6 flex flex-col gap-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              style={{ backgroundColor: 'var(--sub-color)', color: 'var(--white)' }}
              className="max-[767px]:w-full min-[768px]:hidden"
            >
              <Plus className="w-4 h-4 mr-2" />
              거래처 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <ClientForm
              client={editingClient}
              onSave={handleSaveClient}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingClient(null);
              }}
            />
          </DialogContent>
        </Dialog>

        <div className="relative w-full">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--gray)' }} />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="거래처명 또는 대표자명 검색"
            className="pr-10"
          />
        </div>
      </div>

      {/* 데스크톱 전용 추가버튼 */}
      <div className="mb-6 hidden min-[768px]:flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              style={{ backgroundColor: 'var(--sub-color)', color: 'var(--white)' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              거래처 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <ClientForm
              client={editingClient}
              onSave={handleSaveClient}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingClient(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} style={{ backgroundColor: 'var(--white)' }}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h3>{client.name}</h3>
                  <p className="mt-1">{client.representative}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleEditClient(client)}
                  >
                    <Edit className="w-5 h-5" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDeleteClient(client.id)}
                    className="transition-colors hover:!bg-[var(--sub-color)]"
                    style={{ 
                      backgroundColor: '#9ca3af',
                      color: 'var(--white)',
                      minWidth: '2.5rem',
                      padding: '0.5rem'
                    }}
                  >
                    <Trash2 className="w-7 h-7" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p>사업자등록번호</p>
                  <p>{client.registrationNumber}</p>
                </div>
                <div>
                  <p>전화번호</p>
                  <p>{client.phone}</p>
                </div>
                <div className="pt-4 border-t border-[#e1e1e1]">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p>총 매출</p>
                      <p style={{ color: 'var(--main-color)' }}>
                        {formatCurrency(client.totalSales)}원
                      </p>
                    </div>
                    <div>
                      <p>견적 건수</p>
                      <p>{client.quoteCount}건</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredClients.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p>등록된 거래처가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface ClientFormProps {
  client: Client | null;
  onSave: (client: Client) => void;
  onCancel: () => void;
}

function ClientForm({ client, onSave, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState<Client>(
    client || {
      id: Date.now().toString(),
      name: '',
      representative: '',
      address: '',
      phone: '',
      email: '',
      registrationNumber: '',
      totalSales: 0,
      quoteCount: 0,
    }
  );

  const handleChange = (field: keyof Client, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{client ? '거래처 수정' : '거래처 추가'}</DialogTitle>
        <DialogDescription>거래처 정보를 입력하세요.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 mt-4">
        <div>
          <Label>회사명</Label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="주식회사 예제"
            required
            className="mt-2"
          />
        </div>

        <div>
          <Label>대표자명</Label>
          <Input
            value={formData.representative}
            onChange={(e) => handleChange('representative', e.target.value)}
            placeholder="홍길동"
            required
            className="mt-2"
          />
        </div>

        <div>
          <Label>사업자등록번호</Label>
          <Input
            value={formData.registrationNumber}
            onChange={(e) => handleChange('registrationNumber', e.target.value)}
            placeholder="123-45-67890"
            required
            className="mt-2"
          />
        </div>

        <div>
          <Label>주소</Label>
          <Input
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="서울특별시 강남구 테헤란로 123"
            className="mt-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>전화번호</Label>
            <Input
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="02-1234-5678"
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label>이메일</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="info@example.com"
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            style={{ backgroundColor: 'var(--main-color)', color: 'var(--white)' }}
          >
            저장
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
        </div>
      </div>
    </form>
  );
}