'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatVND } from '@/lib/utils';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Eye,
  PenTool,
  Sparkles,
  UserPlus,
  Users,
  Shield,
  Layers,
  ArrowRight,
  TrendingUp,
  History,
  Copy,
  Check,
  Calendar,
  X,
  FileCheck
} from 'lucide-react';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { ElectronicSignatureModal } from '@/components/contracts/ElectronicSignatureModal';

type TabKey = 'contracts' | 'templates' | 'ocr' | 'temporary-accounts' | 'clauses' | 'pricing-history';

interface ContractItem {
  id: string;
  code: string;
  title: string;
  contractType: string;
  status: string;
  partyAName: string;
  partyBName: string;
  partyBPhone?: string;
  effectiveDate: string;
  expirationDate?: string;
  totalValue: number;
  contentHtml: string;
  contentHash: string;
  docxUrl?: string;
  partyBRequiredFields?: string[];
  partyBSubmittedData?: Record<string, string>;
  signatures: Array<{
    id: string;
    partyRole: string;
    signerName: string;
    signedAt: string;
    signatureType: string;
  }>;
  createdAt: string;
}

interface TemporaryAccountItem {
  id: string;
  identifier: string;
  displayName: string;
  phone?: string;
  spaceRole: string;
  status: string;
  activationCode?: string;
  expiresAt?: string;
  claimedAt?: string;
  claimedUserId?: string;
  createdAt: string;
}

interface ClauseItem {
  id: string;
  title: string;
  category: string;
  version: number;
  content: string;
  effectiveFrom: string;
  changeReason?: string;
  isRequired: boolean;
  acceptances: Array<{
    id: string;
    memberId: string;
    acceptedAt: string;
    version: number;
  }>;
}

interface PricingHistoryItem {
  id: string;
  serviceName: string;
  category: string;
  previousPrice: number;
  newPrice: number;
  unit: string;
  effectiveDate: string;
  changeReason: string;
  createdAt: string;
}

export default function SpaceContractsPage() {
  const params = useParams();
  const groupId = params?.id as string;

  const [activeTab, setActiveTab] = useState<TabKey>('contracts');
  const [loading, setLoading] = useState(true);
  const [spaceInfo, setSpaceInfo] = useState<{ id: string; name: string; slug: string; themeColor?: string; groupType?: string } | null>(null);

  // Contracts state
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedContract, setSelectedContract] = useState<ContractItem | null>(null);
  const [signingModalOpen, setSigningModalOpen] = useState(false);
  const [createContractModalOpen, setCreateContractModalOpen] = useState(false);

  // New contract form
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('RENTAL');
  const [newPartyAName, setNewPartyAName] = useState('');
  const [newPartyBName, setNewPartyBName] = useState('');
  const [newPartyBPhone, setNewPartyBPhone] = useState('');
  const [newTotalValue, setNewTotalValue] = useState(3500000);
  const [newContentHtml, setNewContentHtml] = useState('');
  const [creatingContract, setCreatingContract] = useState(false);

  // Temporary accounts state
  const [temporaryAccounts, setTemporaryAccounts] = useState<TemporaryAccountItem[]>([]);
  const [createTempModalOpen, setCreateTempModalOpen] = useState(false);
  const [tempDisplayName, setTempDisplayName] = useState('');
  const [tempPhone, setTempPhone] = useState('');
  const [tempRole, setTempRole] = useState('MEMBER');
  const [creatingTemp, setCreatingTemp] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Clauses state
  const [clauses, setClauses] = useState<ClauseItem[]>([]);
  const [createClauseModalOpen, setCreateClauseModalOpen] = useState(false);
  const [clauseTitle, setClauseTitle] = useState('');
  const [clauseContent, setClauseContent] = useState('');
  const [clauseCategory, setClauseCategory] = useState('GENERAL');
  const [creatingClause, setCreatingClause] = useState(false);

  // Pricing history state
  const [pricingHistory, setPricingHistory] = useState<PricingHistoryItem[]>([]);

  // OCR state
  const [ocrText, setOcrText] = useState('');
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrEntities, setOcrEntities] = useState<Record<string, string | number>>({});
  const [ocrSuccess, setOcrSuccess] = useState(false);

  // Fetch all initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Group info
      const gRes = await fetch(`/api/groups/${groupId}`);
      const gData = await gRes.json();
      if (gData.success && gData.data) {
        setSpaceInfo(gData.data);
        setNewPartyAName(gData.data.name || 'Chủ không gian TingRoster');
      }

      // Contracts
      const cRes = await fetch(`/api/groups/${groupId}/contracts`);
      const cData = await cRes.json();
      if (cData.success && cData.data) {
        setContracts(cData.data);
      }

      // Temporary accounts
      const tRes = await fetch(`/api/groups/${groupId}/temporary-accounts`);
      const tData = await tRes.json();
      if (tData.success && tData.data) {
        setTemporaryAccounts(tData.data);
      }

      // Clauses
      const clRes = await fetch(`/api/groups/${groupId}/clauses`);
      const clData = await clRes.json();
      if (clData.success && clData.data) {
        setClauses(clData.data);
      }

      // Pricing history
      const pRes = await fetch(`/api/groups/${groupId}/pricing-history`);
      const pData = await pRes.json();
      if (pData.success && pData.data) {
        setPricingHistory(pData.data);
      }
    } catch (err) {
      console.error('Error loading contracts data:', err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      loadData();
    }
  }, [groupId, loadData]);

  // Handle contract creation
  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPartyBName.trim()) return;

    try {
      setCreatingContract(true);
      const res = await fetch(`/api/groups/${groupId}/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          contractType: newType,
          partyAName: newPartyAName,
          partyBName: newPartyBName,
          partyBPhone: newPartyBPhone || undefined,
          totalValue: Number(newTotalValue) || 0,
          contentHtml: newContentHtml || `<p>Hợp đồng giao kết thỏa thuận giữa ${newPartyAName} và ${newPartyBName}. Hai bên cam kết thực hiện đúng trách nhiệm và nghĩa vụ theo quy định pháp luật hiện hành.</p>`,
          partyBRequiredFields: ['citizenId', 'permanentAddress', 'partyBPhone']
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setContracts([data.data, ...contracts]);
        setCreateContractModalOpen(false);
        setNewTitle('');
        setNewPartyBName('');
        setNewPartyBPhone('');
      } else {
        alert(data.error || 'Lỗi tạo hợp đồng');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể tạo hợp đồng');
    } finally {
      setCreatingContract(false);
    }
  };

  // Handle temporary account creation
  const handleCreateTempAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempDisplayName.trim()) return;

    try {
      setCreatingTemp(true);
      const res = await fetch(`/api/groups/${groupId}/temporary-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: tempDisplayName,
          phone: tempPhone || undefined,
          spaceRole: tempRole,
          expiresInDays: 30
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTemporaryAccounts([data.data, ...temporaryAccounts]);
        setCreateTempModalOpen(false);
        setTempDisplayName('');
        setTempPhone('');
      } else {
        alert(data.error || 'Lỗi tạo tài khoản tạm');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi tạo tài khoản tạm');
    } finally {
      setCreatingTemp(false);
    }
  };

  // Handle clause creation
  const handleCreateClause = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clauseTitle.trim() || !clauseContent.trim()) return;

    try {
      setCreatingClause(true);
      const res = await fetch(`/api/groups/${groupId}/clauses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: clauseTitle,
          content: clauseContent,
          category: clauseCategory,
          isRequired: true
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setClauses([data.data, ...clauses]);
        setCreateClauseModalOpen(false);
        setClauseTitle('');
        setClauseContent('');
      } else {
        alert(data.error || 'Lỗi tạo điều khoản');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi tạo điều khoản');
    } finally {
      setCreatingClause(false);
    }
  };

  // Handle OCR simulation / extraction
  const handleSimulateOcr = async () => {
    setOcrScanning(true);
    setOcrSuccess(false);
    try {
      const res = await fetch(`/api/groups/${groupId}/ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: ocrText || `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc

HỢP ĐỒNG THUÊ NHÀ Ở VÀ DỊCH VỤ PHÒNG TRỌ
Số: HĐ-2026/TR-P302
Hôm nay, ngày 15 tháng 10 năm 2026, chúng tôi gồm có:
BÊN CHO THUÊ (BÊN A):
Ông/Bà: Quản lý Không Gian TingRoster
Số điện thoại: 0912345678
BÊN THUÊ (BÊN B):
Ông/Bà: Nguyễn Văn Toàn
Sinh ngày: 12/08/1998
Số CCCD: 001098012345 cấp ngày 10/05/2021 tại Cục CS QLHC về TTXH
Hộ khẩu thường trú: Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
Số điện thoại: 0987654321
Hai bên thống nhất ký kết hợp đồng thuê phòng trọ số 302 với các điều khoản sau:
1. Giá thuê phòng: 3.800.000 đ/tháng (Ba triệu tám trăm nghìn đồng chẵn).
2. Tiền đặt cọc bảo đảm: 3.800.000 đ (tương đương 01 tháng tiền phòng).
3. Thời hạn thuê: Từ ngày 01/11/2026 đến ngày 31/10/2027.
Bên B cam kết giữ gìn an ninh trật tự, phòng cháy chữa cháy và thanh toán đúng hạn.`
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setOcrEntities(data.data.extractedEntities);
        setOcrSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOcrScanning(false);
    }
  };

  // Convert OCR result to contract
  const handleConvertOcrToContract = () => {
    setNewTitle(`Hợp đồng thuê phòng ${ocrEntities.roomNumber || '302'} - ${ocrEntities.partyBName || 'Nguyễn Văn Toàn'}`);
    setNewType('RENTAL');
    setNewPartyBName(String(ocrEntities.partyBName || ''));
    setNewPartyBPhone(String(ocrEntities.partyBPhone || ''));
    setNewTotalValue(Number(ocrEntities.rentAmount) || 3800000);
    setNewContentHtml(`<p>Hợp đồng thuê phòng số ${ocrEntities.roomNumber || '302'} được trích xuất từ tài liệu giấy tờ điện tử.</p><p>Giá thuê: ${formatVND(Number(ocrEntities.rentAmount) || 3800000)}/tháng. Đặt cọc: ${formatVND(Number(ocrEntities.depositAmount) || 3800000)}.</p>`);
    setActiveTab('contracts');
    setCreateContractModalOpen(true);
  };

  // Copy helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.partyBName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [contracts, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="text-center py-24 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-xs">Đang tải hồ sơ & hợp đồng không gian...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Space Nav Header */}
      {spaceInfo && (
        <SpaceNavHeader
          space={{
            ...spaceInfo,
            memberCount: temporaryAccounts.length + contracts.length
          }}
          activeSection="contracts"
        />
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-xs border border-indigo-500/30">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Pháp Lý & Hợp Đồng Điện Tử TingRoster</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Quản Lý Hợp Đồng, Hồ Sơ & Chữ Ký Điện Tử
          </h1>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Hệ thống soạn thảo hợp đồng đa bên, tạo file Word DOCX có thể chỉnh sửa, số hóa OCR tài liệu giấy tờ, và ký điện tử an toàn với mã băm toàn vẹn SHA-256.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setCreateContractModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Soạn Hợp Đồng Mới</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('ocr');
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 backdrop-blur-xs cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Quét OCR & Tạo Word</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('temporary-accounts');
                setCreateTempModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 backdrop-blur-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>Cấp Tài Khoản Tạm</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'contracts'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Danh Sách Hợp Đồng ({contracts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'templates'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Mẫu Hợp Đồng</span>
        </button>

        <button
          onClick={() => setActiveTab('ocr')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'ocr'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Quét OCR & Tạo Word</span>
        </button>

        <button
          onClick={() => setActiveTab('temporary-accounts')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'temporary-accounts'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-amber-500" />
          <span>Tài Khoản Tạm Thời ({temporaryAccounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('clauses')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'clauses'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4 text-indigo-500" />
          <span>Điều Khoản & Chính Sách ({clauses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing-history')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'pricing-history'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <History className="w-4 h-4 text-violet-500" />
          <span>Lịch Sử Đổi Giá ({pricingHistory.length})</span>
        </button>
      </div>

      {/* TAB 1: CONTRACTS LIST */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          {/* Filters & Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã, tiêu đề, họ tên..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
              >
                <option value="ALL">Mọi trạng thái</option>
                <option value="DRAFT">Dự thảo</option>
                <option value="PENDING_SIGNATURE">Chờ ký</option>
                <option value="ACTIVE">Có hiệu lực</option>
                <option value="EXPIRED">Hết hạn</option>
              </select>

              <button
                onClick={() => setCreateContractModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs ml-auto sm:ml-0"
              >
                <Plus className="w-4 h-4" />
                <span>Soạn hợp đồng</span>
              </button>
            </div>
          </div>

          {/* Table / Cards */}
          {filteredContracts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Chưa có hợp đồng nào phù hợp
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Bắt đầu bằng việc soạn thảo hợp đồng từ mẫu pháp lý hoặc quét OCR hồ sơ giấy tờ.
              </p>
              <button
                onClick={() => setCreateContractModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold transition"
              >
                Tạo hợp đồng ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContracts.map((c) => {
                const hasPartyASigned = c.signatures.some((s) => s.partyRole === 'PARTY_A');
                const hasPartyBSigned = c.signatures.some((s) => s.partyRole === 'PARTY_B');

                return (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition shadow-2xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {c.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : c.status === 'PENDING_SIGNATURE'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.status === 'ACTIVE'
                            ? 'Có hiệu lực'
                            : c.status === 'PENDING_SIGNATURE'
                            ? 'Chờ ký'
                            : 'Dự thảo'}
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2">
                        {c.title}
                      </h3>

                      <div className="text-xs text-slate-500 space-y-1 pt-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Bên B:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {c.partyBName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Giá trị:</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {formatVND(c.totalValue)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Chữ ký Bên A:</span>
                          <span className={`font-bold ${hasPartyASigned ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {hasPartyASigned ? '✓ Đã ký' : 'Chưa ký'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Chữ ký Bên B:</span>
                          <span className={`font-bold ${hasPartyBSigned ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {hasPartyBSigned ? '✓ Đã ký' : 'Chưa ký'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <a
                        href={`/api/groups/${groupId}/contracts?downloadDocx=${c.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold inline-flex items-center gap-1 transition"
                        title="Tải văn bản Word .docx gốc"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600" />
                        <span>Word</span>
                      </a>

                      <button
                        onClick={() => {
                          setSelectedContract(c);
                          setSigningModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ml-auto"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>{hasPartyASigned ? 'Xem hợp đồng' : 'Ký Bên A'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
              🏠
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Hợp Đồng Thuê Nhà Ở & Phòng Trọ
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Chuẩn Luật Nhà ở 27/2023/QH15. Bao gồm điều khoản thanh toán tiền cọc, bảo toàn tài sản, chỉ số điện nước và nội quy an toàn PCCC.
            </p>
            <div className="space-y-1 text-[11px] text-slate-400 font-mono">
              <p>Tag: &#123;&#123;ROOM_NUMBER&#125;&#125;, &#123;&#123;RENT_AMOUNT&#125;&#125;</p>
              <p>Ký: 2 Bên (Chủ nhà & Người thuê)</p>
            </div>
            <button
              onClick={() => {
                setNewTitle('Hợp đồng thuê phòng trọ chuẩn pháp lý');
                setNewType('RENTAL');
                setNewTotalValue(3500000);
                setNewContentHtml(`<p>Hợp đồng thuê nhà ở theo Luật Nhà ở 2023. Bên Cho Thuê cam kết cung cấp đúng phòng ốc và tiện ích.</p>`);
                setCreateContractModalOpen(true);
              }}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold transition cursor-pointer"
            >
              Dùng Mẫu Này
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
              🎓
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Thỏa Thuận Khóa Học & Đào Tạo
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Thỏa thuận cung cấp dịch vụ giáo dục, lịch học theo ca, quy chế bảo lưu và chính sách hoàn phí minh bạch theo Luật Bảo vệ NTD 2023.
            </p>
            <div className="space-y-1 text-[11px] text-slate-400 font-mono">
              <p>Tag: &#123;&#123;COURSE_NAME&#125;&#125;, &#123;&#123;TUITION_FEE&#125;&#125;</p>
              <p>Ký: Giáo viên & Học viên/Phụ huynh</p>
            </div>
            <button
              onClick={() => {
                setNewTitle('Thỏa thuận đào tạo khóa học');
                setNewType('EDUCATION');
                setNewTotalValue(2400000);
                setNewContentHtml(`<p>Thỏa thuận cam kết chất lượng đào tạo và lịch học bù khi nghỉ có phép trước 24h.</p>`);
                setCreateContractModalOpen(true);
              }}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold transition cursor-pointer"
            >
              Dùng Mẫu Này
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
              🏸
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Gói Hội Viên CLB Thể Thao
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Thỏa thuận gói hội viên Pickleball, Cầu lông, Gym. Quy định giờ chơi cao điểm, phụ thu nước giải khát và quy tắc hủy sân trước giờ hẹn.
            </p>
            <div className="space-y-1 text-[11px] text-slate-400 font-mono">
              <p>Tag: &#123;&#123;PLAN_NAME&#125;&#125;, &#123;&#123;COURT_SLOTS&#125;&#125;</p>
              <p>Ký: Ban chủ nhiệm CLB & Hội viên</p>
            </div>
            <button
              onClick={() => {
                setNewTitle('Thỏa thuận thẻ hội viên CLB Thể Thao');
                setNewType('SPORTS');
                setNewTotalValue(1800000);
                setNewContentHtml(`<p>Thỏa thuận hội viên sử dụng sân đấu và tiện ích đèn chiếu sáng, locker bảo quản đồ đạc.</p>`);
                setCreateContractModalOpen(true);
              }}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-bold transition cursor-pointer"
            >
              Dùng Mẫu Này
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: OCR EXTRACTION */}
      {activeTab === 'ocr' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Trích Xuất Văn Bản Giấy Tờ & Tự Động Điền Hợp Đồng (OCR Pipeline)
              </h2>
              <p className="text-xs text-slate-400">
                Nhận dạng hợp đồng giấy, CCCD và biên bản cam kết tiếng Việt để số hóa thành văn bản Word .docx
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Nội dung hoặc ảnh chụp tài liệu:
              </label>
              <textarea
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                placeholder="Dán nội dung quét được hoặc nhấn nút Trích xuất mẫu bên dưới..."
                rows={12}
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSimulateOcr}
                disabled={ocrScanning}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {ocrScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang phân tích thực thể tiếng Việt...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Thực Hiện Quét OCR & Phân Tích Thực Thể</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Dữ liệu thực thể nhận diện (Entity Extraction):</span>
                {ocrSuccess && (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    ✓ Thành công
                  </span>
                )}
              </h3>

              {Object.keys(ocrEntities).length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  Chưa có dữ liệu. Nhấn &quot;Thực Hiện Quét OCR&quot; ở cột bên trái để phân tích.
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">Họ và tên Bên B:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{String(ocrEntities.partyBName || 'Chưa rõ')}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">Số CCCD / Định danh:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{String(ocrEntities.citizenId || 'Chưa rõ')}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">Số điện thoại:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{String(ocrEntities.partyBPhone || 'Chưa rõ')}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">Phòng / Đối tượng:</span>
                    <span className="font-bold text-slate-900 dark:text-white">Phòng {String(ocrEntities.roomNumber || '302')}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">Giá thuê thỏa thuận:</span>
                    <span className="font-bold text-blue-600">{formatVND(Number(ocrEntities.rentAmount) || 0)}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
                    <span className="text-slate-400">Tiền đặt cọc:</span>
                    <span className="font-bold text-emerald-600">{formatVND(Number(ocrEntities.depositAmount) || 0)}</span>
                  </div>

                  <button
                    onClick={handleConvertOcrToContract}
                    className="w-full mt-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Ánh Xạ Vào Mẫu & Soạn Hợp Đồng Điện Tử</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TEMPORARY ACCOUNTS */}
      {activeTab === 'temporary-accounts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Tài Khoản Tạm Thời (Temporary Member Accounts)
              </h2>
              <p className="text-xs text-slate-400">
                Cấp mã kích hoạt trước cho học viên hoặc người thuê chưa có tài khoản TingRoster chính thức.
              </p>
            </div>
            <button
              onClick={() => setCreateTempModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cấp tài khoản mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {temporaryAccounts.map((acc) => (
              <div
                key={acc.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold">
                    {acc.identifier}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      acc.status === 'CLAIMED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : acc.status === 'PENDING_ACTIVATION'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {acc.status === 'CLAIMED' ? 'Đã kích hoạt' : 'Chờ kích hoạt'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {acc.displayName}
                  </h4>
                  {acc.phone && (
                    <p className="text-xs text-slate-400">SĐT: {acc.phone}</p>
                  )}
                </div>

                {acc.activationCode && acc.status !== 'CLAIMED' && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Mã kích hoạt:</span>
                      <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                        {acc.activationCode}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(acc.activationCode || '', acc.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
                      title="Sao chép mã"
                    >
                      {copiedCode === acc.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CLAUSES & POLICIES */}
      {activeTab === 'clauses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Điều Khoản & Chính Sách Không Gian (Versioning)
              </h2>
              <p className="text-xs text-slate-400">
                Quản lý phiên bản điều khoản quy định nội quy, thanh toán và theo dõi thành viên đã chấp thuận.
              </p>
            </div>
            <button
              onClick={() => setCreateClauseModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm điều khoản mới</span>
            </button>
          </div>

          <div className="space-y-3">
            {clauses.map((clause) => (
              <div
                key={clause.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {clause.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      Phiên bản v{clause.version}.0
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {clause.acceptances?.length || 0} thành viên đã đồng ý
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {clause.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PRICING HISTORY */}
      {activeTab === 'pricing-history' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              Lịch Sử Thay Đổi Giá & Phụ Thu Bất Biến (Audit Trail)
            </h2>
            <p className="text-xs text-slate-400">
              Ghi lại snapshot mức giá dịch vụ, không làm sai lệch các hóa đơn đã phát hành trước đó.
            </p>
          </div>

          {pricingHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              Chưa có ghi nhận điều chỉnh giá nào trong không gian này.
            </div>
          ) : (
            <div className="space-y-3">
              {pricingHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {item.serviceName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Lý do: {item.changeReason}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 line-through mr-2">
                      {formatVND(item.previousPrice)}
                    </span>
                    <span className="text-xs font-black text-emerald-600">
                      {formatVND(item.newPrice)} / {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE CONTRACT */}
      {createContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Soạn Thảo Hợp Đồng Mới
              </h3>
              <button
                onClick={() => setCreateContractModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tiêu đề hợp đồng:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Hợp đồng thuê phòng 201 - Nguyễn Văn A"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Loại hợp đồng:
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
                  >
                    <option value="RENTAL">Thuê nhà / Phòng trọ</option>
                    <option value="EDUCATION">Giáo dục / Khóa học</option>
                    <option value="SPORTS">Thể thao / Hội viên</option>
                    <option value="GENERAL">Thỏa thuận chung</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Giá trị hợp đồng (VNĐ):
                  </label>
                  <input
                    type="number"
                    value={newTotalValue}
                    onChange={(e) => setNewTotalValue(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Họ tên Bên A (Chủ sở hữu):
                  </label>
                  <input
                    type="text"
                    required
                    value={newPartyAName}
                    onChange={(e) => setNewPartyAName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Họ tên Bên B (Học viên / Khách):
                  </label>
                  <input
                    type="text"
                    required
                    value={newPartyBName}
                    onChange={(e) => setNewPartyBName(e.target.value)}
                    placeholder="Nguyễn Văn B"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nội dung điều khoản thỏa thuận:
                </label>
                <textarea
                  value={newContentHtml}
                  onChange={(e) => setNewContentHtml(e.target.value)}
                  rows={5}
                  placeholder="Nội dung điều khoản thỏa thuận giữa hai bên..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateContractModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingContract}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {creatingContract ? 'Đang tạo...' : 'Tạo hợp đồng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE TEMPORARY ACCOUNT */}
      {createTempModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Cấp Tài Khoản Tạm Cho Thành Viên
              </h3>
              <button
                onClick={() => setCreateTempModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTempAccount} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Họ và tên thành viên:
                </label>
                <input
                  type="text"
                  required
                  value={tempDisplayName}
                  onChange={(e) => setTempDisplayName(e.target.value)}
                  placeholder="Ví dụ: Trần Văn Cương"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Số điện thoại (tùy chọn):
                </label>
                <input
                  type="text"
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value)}
                  placeholder="0912..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Vai trò trong không gian:
                </label>
                <select
                  value={tempRole}
                  onChange={(e) => setTempRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
                >
                  <option value="MEMBER">Học viên / Khách thuê (Member)</option>
                  <option value="TEACHER">Giáo viên phụ giảng (Teacher)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateTempModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingTemp}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {creatingTemp ? 'Đang tạo...' : 'Cấp mã kích hoạt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE CLAUSE */}
      {createClauseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Thêm Điều Khoản / Chính Sách Không Gian
              </h3>
              <button
                onClick={() => setCreateClauseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClause} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tiêu đề điều khoản:
                </label>
                <input
                  type="text"
                  required
                  value={clauseTitle}
                  onChange={(e) => setClauseTitle(e.target.value)}
                  placeholder="Ví dụ: Quy định giờ giấc & an ninh PCCC"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nội dung chi tiết:
                </label>
                <textarea
                  required
                  value={clauseContent}
                  onChange={(e) => setClauseContent(e.target.value)}
                  rows={4}
                  placeholder="Nội dung điều khoản bắt buộc thành viên chấp thuận..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateClauseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingClause}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {creatingClause ? 'Đang lưu...' : 'Lưu điều khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIGNING MODAL FOR PARTY A */}
      {selectedContract && signingModalOpen && (
        <ElectronicSignatureModal
          contractId={selectedContract.id}
          contractTitle={selectedContract.title}
          contractContent={selectedContract.contentHtml}
          partyRole="PARTY_A"
          partyName={selectedContract.partyAName}
          isOpen={signingModalOpen}
          onClose={() => {
            setSigningModalOpen(false);
            setSelectedContract(null);
          }}
          onSuccess={() => {
            setSigningModalOpen(false);
            setSelectedContract(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
