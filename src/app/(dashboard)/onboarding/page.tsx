'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Trophy,
  Home,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building,
  CreditCard,
  Webhook,
  Sparkles,
  Users,
} from 'lucide-react';
import { POPULAR_VIETNAMESE_BANKS } from '@/lib/providers/vietqr';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [businessType, setBusinessType] = useState<'CLASS' | 'SPORTS_CLUB' | 'RENTAL'>('CLASS');
  const [className, setClassName] = useState('Lớp Toán Thầy Tuấn 12A');
  const [classSlug, setClassSlug] = useState('lop-toan-12a');
  const [defaultFee, setDefaultFee] = useState(600000);
  const [studentNames, setStudentNames] = useState('Nguyễn Văn An\nTrần Thị Mai\nLê Hoàng Nam');
  const [bankId, setBankId] = useState('MB');
  const [bankAccountNo, setBankAccountNo] = useState('0987654321');
  const [bankAccountName, setBankAccountName] = useState('NGUYEN VAN TUAN');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 7;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/dashboard');
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto space-y-8">
        {/* Progress Header */}
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Hướng dẫn thiết lập ban đầu (Bước {currentStep}/{totalSteps})</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Chào mừng bạn đến với TingRoster
          </h1>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden max-w-md mx-auto">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Card Content */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
          {/* STEP 1: Business Type */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">1. Bạn đang cần quản lý mô hình gì?</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Hệ thống sẽ tối ưu hóa giao diện và thuật ngữ phù hợp với công việc của bạn.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setBusinessType('CLASS')}
                  className={`p-4 rounded-2xl border text-left transition space-y-2 ${
                    businessType === 'CLASS'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="block font-bold text-sm">Lớp dạy thêm</span>
                  <span className="block text-xs text-slate-500">Giáo viên, trung tâm gia sư, ngoại ngữ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBusinessType('SPORTS_CLUB')}
                  className={`p-4 rounded-2xl border text-left transition space-y-2 ${
                    businessType === 'SPORTS_CLUB'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="block font-bold text-sm">CLB Thể thao / Sân</span>
                  <span className="block text-xs text-slate-500">Cầu lông, Pickleball, bóng đá, Gym</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBusinessType('RENTAL')}
                  className={`p-4 rounded-2xl border text-left transition space-y-2 ${
                    businessType === 'RENTAL'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Home className="w-5 h-5" />
                  </div>
                  <span className="block font-bold text-sm">Phòng trọ / Căn hộ</span>
                  <span className="block text-xs text-slate-500">Thu tiền phòng, điện nước định kỳ</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Create Group */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">2. Tạo lớp hoặc câu lạc bộ đầu tiên</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Điền tên và mức phí cơ bản. Bạn có thể thay đổi bất cứ lúc nào sau này.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên lớp / Nhóm sinh hoạt *
                  </label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mức thu dự kiến (VND / tháng hoặc lượt)
                  </label>
                  <input
                    type="number"
                    step="10000"
                    value={defaultFee}
                    onChange={(e) => setDefaultFee(Number(e.target.value))}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Add Members */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">3. Danh sách học viên / thành viên ban đầu</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Dán danh sách tên học viên (mỗi tên 1 dòng). Bạn cũng có thể tải file Excel lên sau.
                </p>
              </div>

              <div>
                <textarea
                  rows={4}
                  value={studentNames}
                  onChange={(e) => setStudentNames(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Bank Account */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">4. Tài khoản ngân hàng nhận tiền VietQR</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Mã QR sẽ gắn trực tiếp số tài khoản này để tiền chuyển thẳng vào tài khoản của bạn.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ngân hàng</label>
                  <select
                    value={bankId}
                    onChange={(e) => setBankId(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2.5 bg-white"
                  >
                    {POPULAR_VIETNAMESE_BANKS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số tài khoản</label>
                  <input
                    type="text"
                    value={bankAccountNo}
                    onChange={(e) => setBankAccountNo(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên chủ tài khoản (viết hoa không dấu)
                </label>
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2 uppercase font-medium"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Webhook Guide */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">5. Cơ chế đối soát tự động (Webhook)</h2>
                <p className="text-xs text-slate-500 mt-1">
                  TingRoster tích hợp sẵn cổng SePay & Casso để gạch nợ tức thời.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-slate-700">
                <div className="flex items-center gap-2 text-indigo-700 font-bold">
                  <Webhook className="w-4 h-4" />
                  <span>Cách thức hoạt động:</span>
                </div>
                <p>1. Khi phụ huynh quét mã VietQR, nội dung chuyển tiền chứa mã riêng (vd: <code>TR84920</code>).</p>
                <p>2. Ngân hàng báo biến động số dư qua Webhook trong 5 giây.</p>
                <p>3. Hệ thống tự động chuyển trạng thái phiếu thu sang <strong>Đã đóng đủ</strong>.</p>
              </div>
            </div>
          )}

          {/* STEP 6: Test Invoice */}
          {currentStep === 6 && (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">6. Mọi thứ đã sẵn sàng!</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hệ thống sẽ tạo lớp học, nạp danh sách học sinh ban đầu và cấu hình tài khoản ngân hàng của bạn.
              </p>
            </div>
          )}

          {/* STEP 7: Completed */}
          {currentStep === 7 && (
            <div className="space-y-4 text-center py-6">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/30">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Chào mừng bạn đến với TingRoster V2</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Từ nay, việc điểm danh và đối soát thu phí sẽ hoàn toàn tự động, minh bạch và chính xác 100%.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {currentStep > 1 && currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
            ) : <div />}

            {currentStep < totalSteps - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : currentStep === totalSteps - 1 ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinishSetup}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Đang khởi tạo...' : 'Hoàn tất & Khởi tạo'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition"
              >
                Vào Bảng Điều Khiển Ngay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
