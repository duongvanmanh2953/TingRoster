'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Trophy,
  Home,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building,
  CreditCard,
  Sparkles,
  Users,
  Check
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { POPULAR_VIETNAMESE_BANKS } from '@/lib/providers/vietqr';

const STEPS = [
  { id: 1, name: 'Mô hình' },
  { id: 2, name: 'Tạo lớp/CLB' },
  { id: 3, name: 'Thành viên' },
  { id: 4, name: 'Khoản thu' },
  { id: 5, name: 'Thanh toán' },
  { id: 6, name: 'Hoàn tất' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [businessType, setBusinessType] = useState<'CLASS' | 'SPORTS_CLUB' | 'RENTAL'>('CLASS');
  const [className, setClassName] = useState('Lớp Toán 6A - Thầy Minh');
  const [classSlug, setClassSlug] = useState('lop-toan-6a');
  const [defaultFee, setDefaultFee] = useState(500000);
  const [studentNames, setStudentNames] = useState('Nguyễn Văn A\nTrần Thị B\nLê Minh C\nPhạm Thị D\nHoàng Văn E');
  const [bankId, setBankId] = useState('MB');
  const [bankAccountNo, setBankAccountNo] = useState('0987654321');
  const [bankAccountName, setBankAccountName] = useState('NGUYEN VAN MINH');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinishSetup();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinishSetup = async () => {
    setIsSubmitting(true);
    try {
      // 1. Update bank details
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankId, bankAccountNo, bankAccountName }),
      });

      // 2. Create group
      const groupRes = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: className,
          slug: classSlug + '-' + Math.floor(Math.random() * 1000),
          defaultFee: Number(defaultFee),
          groupType: businessType,
        }),
      });
      const groupData = await groupRes.json();

      // 3. Add sample students if group created
      if (groupData.success && groupData.data?.id) {
        const names = studentNames.split('\n').filter((n) => n.trim().length > 0);
        for (const name of names) {
          await fetch('/api/members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              groupId: groupData.data.id,
              name: name.trim(),
            }),
          });
        }
      }

      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#101828] flex flex-col justify-between py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#2538D9] selection:text-white">
      
      {/* Top Brand Header */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between pb-6 border-b border-[#E4E7EC]">
        <Logo href="/" size="sm" showTagline={false} />
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-[#475467] hover:text-[#101828]"
        >
          Lưu & Thoát
        </Link>
      </div>

      <div className="max-w-3xl w-full mx-auto my-auto space-y-8 py-8">
        
        {/* 6-Step Stepper Progress Header per Panel 3 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step) => {
              const isPassed = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              return (
                <div key={step.id} className="flex flex-col items-center gap-1.5 flex-1 relative">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPassed
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-[#2538D9] text-white shadow-md shadow-[#2538D9]/30 ring-4 ring-[#2538D9]/15'
                        : 'bg-white border border-[#E4E7EC] text-slate-400'
                    }`}
                  >
                    {isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-medium text-center truncate max-w-[70px] ${
                      isCurrent ? 'text-[#2538D9] font-bold' : isPassed ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="w-full bg-[#E4E7EC] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#2538D9] h-full transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Chọn mô hình quản lý per Panel 3 */}
        {currentStep === 1 && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E4E7EC] shadow-sm space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[#101828] tracking-tight">
                Bạn đang quản lý mô hình nào?
              </h1>
              <p className="text-xs sm:text-sm text-[#475467]">
                Chọn loại hình phù hợp với nhu cầu của bạn. Bạn có thể thay đổi sau trong cài đặt.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              {/* Option 1: Lớp học / Gia sư */}
              <div
                onClick={() => {
                  setBusinessType('CLASS');
                  setClassName('Lớp Toán 6A - Thầy Minh');
                  setClassSlug('lop-toan-6a');
                }}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-4 hover:shadow-md ${
                  businessType === 'CLASS'
                    ? 'border-[#2538D9] bg-blue-50/40 ring-2 ring-[#2538D9]/20 shadow-sm'
                    : 'border-[#E4E7EC] bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-[#2538D9] flex items-center justify-center">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#101828]">Lớp học / Gia sư</h3>
                  <p className="text-xs text-[#475467] mt-1.5 leading-relaxed">
                    Quản lý lớp học, điểm danh, học phí, điểm danh theo buổi...
                  </p>
                </div>
              </div>

              {/* Option 2: CLB thể thao */}
              <div
                onClick={() => {
                  setBusinessType('SPORTS_CLUB');
                  setClassName('CLB Pickleball Sân 2');
                  setClassSlug('clb-pickleball-san-2');
                }}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-4 hover:shadow-md ${
                  businessType === 'SPORTS_CLUB'
                    ? 'border-[#2538D9] bg-emerald-50/40 ring-2 ring-[#2538D9]/20 shadow-sm'
                    : 'border-[#E4E7EC] bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Trophy className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#101828]">CLB thể thao</h3>
                  <p className="text-xs text-[#475467] mt-1.5 leading-relaxed">
                    Quản lý thành viên, lịch đánh, thu phí theo tháng / quý...
                  </p>
                </div>
              </div>

              {/* Option 3: Nhà trọ */}
              <div
                onClick={() => {
                  setBusinessType('RENTAL');
                  setClassName('Nhà trọ Blue House');
                  setClassSlug('nha-tro-blue-house');
                }}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-4 hover:shadow-md ${
                  businessType === 'RENTAL'
                    ? 'border-[#2538D9] bg-amber-50/40 ring-2 ring-[#2538D9]/20 shadow-sm'
                    : 'border-[#E4E7EC] bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Home className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#101828]">Nhà trọ</h3>
                  <p className="text-xs text-[#475467] mt-1.5 leading-relaxed">
                    Quản lý phòng, điện, nước, hóa đơn thu tiền nhà...
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Step 2: Tạo lớp/CLB */}
        {currentStep === 2 && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E4E7EC] shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#101828]">Đặt tên Workspace của bạn</h2>
              <p className="text-xs text-[#475467]">Tên này sẽ hiển thị trên phiếu điểm danh và nội dung hóa đơn VietQR.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#101828] block mb-1.5">Tên lớp / Câu lạc bộ</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E4E7EC] text-xs font-semibold focus:outline-none focus:border-[#2538D9]"
                  placeholder="VD: Lớp Toán 6A - Thầy Minh"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#101828] block mb-1.5">Đường dẫn định danh (Slug)</label>
                <input
                  type="text"
                  value={classSlug}
                  onChange={(e) => setClassSlug(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E4E7EC] text-xs font-mono focus:outline-none focus:border-[#2538D9]"
                  placeholder="lop-toan-6a"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Thêm thành viên */}
        {currentStep === 3 && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E4E7EC] shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#101828]">Thêm thành viên ban đầu</h2>
              <p className="text-xs text-[#475467]">Nhập danh sách học viên hoặc hội viên (mỗi tên một dòng). Bạn có thể import file Excel sau.</p>
            </div>

            <div>
              <textarea
                rows={5}
                value={studentNames}
                onChange={(e) => setStudentNames(e.target.value)}
                className="w-full p-4 rounded-xl border border-[#E4E7EC] text-xs font-medium focus:outline-none focus:border-[#2538D9] font-sans leading-relaxed"
                placeholder="Nguyễn Văn A&#10;Trần Thị B&#10;Lê Minh C"
              />
              <p className="text-[11px] text-[#475467] mt-1">
                Đã nhận diện: <strong>{studentNames.split('\n').filter(Boolean).length}</strong> thành viên
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Cấu hình khoản thu */}
        {currentStep === 4 && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E4E7EC] shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#101828]">Mức học phí / Phí sinh hoạt mặc định</h2>
              <p className="text-xs text-[#475467]">Số tiền này sẽ được dùng khi bạn tạo nhanh hóa đơn hàng loạt theo kỳ.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#101828] block mb-1.5">Số tiền mỗi tháng (VNĐ)</label>
              <input
                type="number"
                value={defaultFee}
                onChange={(e) => setDefaultFee(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E4E7EC] text-base font-bold font-mono focus:outline-none focus:border-[#2538D9]"
              />
            </div>
          </div>
        )}

        {/* Step 5: Kết nối tài khoản nhận tiền VietQR */}
        {currentStep === 5 && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E4E7EC] shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#101828]">Tài khoản ngân hàng nhận tiền</h2>
              <p className="text-xs text-[#475467]">Mã VietQR sẽ được tạo theo thông tin này. Tiền vào thẳng 100% tài khoản chính chủ của bạn.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#101828] block mb-1.5">Ngân hàng</label>
                <select
                  value={bankId}
                  onChange={(e) => setBankId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E4E7EC] text-xs font-bold focus:outline-none focus:border-[#2538D9] bg-white"
                >
                  {POPULAR_VIETNAMESE_BANKS.map((b) => (
                    <option key={b.id} value={b.code}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#101828] block mb-1.5">Số tài khoản</label>
                <input
                  type="text"
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E4E7EC] text-xs font-bold font-mono focus:outline-none focus:border-[#2538D9]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-[#101828] block mb-1.5">Tên chủ tài khoản (Viết hoa không dấu)</label>
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E4E7EC] text-xs font-bold font-mono focus:outline-none focus:border-[#2538D9]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review và Hoàn tất */}
        {currentStep === 6 && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E4E7EC] shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-[#101828]">Sẵn sàng vận hành!</h2>
              <p className="text-xs text-[#475467]">
                TingRoster đã chuẩn bị sẵn sàng dữ liệu và cấu hình VietQR cho bạn.
              </p>
            </div>

            <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E4E7EC] space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-[#475467]">Mô hình:</span>
                <span className="font-bold text-[#101828]">
                  {businessType === 'CLASS' ? 'Lớp học / Gia sư' : businessType === 'SPORTS_CLUB' ? 'CLB thể thao' : 'Nhà trọ'}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-[#475467]">Tên Workspace:</span>
                <span className="font-bold text-[#101828]">{className}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-[#475467]">Số thành viên:</span>
                <span className="font-bold text-[#101828]">{studentNames.split('\n').filter(Boolean).length} người</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-[#475467]">Học phí mặc định:</span>
                <span className="font-bold text-[#2538D9] font-mono">{defaultFee.toLocaleString('vi-VN')} đ/tháng</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475467]">Tài khoản nhận:</span>
                <span className="font-bold text-[#101828] font-mono">{bankId} • {bankAccountNo} ({bankAccountName})</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation: "Bỏ qua" on left, "Tiếp tục ->" on right per Panel 3 */}
        <div className="flex items-center justify-between pt-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 rounded-xl border border-[#E4E7EC] bg-white hover:bg-slate-50 text-xs font-semibold text-[#475467] flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          ) : (
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-[#475467] hover:text-[#101828] px-2 py-1"
            >
              Bỏ qua
            </Link>
          )}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleNext}
            className="px-7 py-3 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-md shadow-[#2538D9]/25 flex items-center gap-2 transition-all"
          >
            {isSubmitting ? (
              <span>Đang thiết lập...</span>
            ) : currentStep === totalSteps ? (
              <>
                <span>Vào Dashboard</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            ) : (
              <>
                <span>Tiếp tục</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>

      </div>

      {/* Footer copyright */}
      <div className="max-w-3xl w-full mx-auto text-center text-[11px] text-slate-400 pt-4">
        TingRoster — Nền tảng quản lý chuyên cần và thu phí tự động
      </div>

    </div>
  );
}
