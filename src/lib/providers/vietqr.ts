/**
 * VietQR Integration Helper
 * Generates QuickLink URLs following VietQR specification:
 * https://img.vietqr.io/image/{BANK_ID}-{ACCOUNT_NO}-compact2.png?amount={AMOUNT}&addInfo={PAYMENT_CODE}&accountName={ACCOUNT_NAME}
 */

export interface VietQRParams {
  bankId: string;
  accountNo: string;
  accountName: string;
  amount: number;
  paymentCode: string;
}

export function generateVietQRUrl(params: VietQRParams): string {
  const { bankId, accountNo, accountName, amount, paymentCode } = params;

  // Sanitize and validate inputs
  const cleanBankId = encodeURIComponent(bankId.trim().toUpperCase());
  const cleanAccountNo = encodeURIComponent(accountNo.trim().replace(/\s+/g, ''));
  const cleanAccountName = encodeURIComponent(accountName.trim().toUpperCase());
  const cleanPaymentCode = encodeURIComponent(paymentCode.trim().toUpperCase());
  const positiveAmount = Math.max(0, Math.floor(amount));

  return `https://img.vietqr.io/image/${cleanBankId}-${cleanAccountNo}-compact2.png?amount=${positiveAmount}&addInfo=${cleanPaymentCode}&accountName=${cleanAccountName}`;
}

export const POPULAR_VIETNAMESE_BANKS = [
  { id: "MB", name: "MB Bank (Ngân hàng Quân Đội)", code: "MB" },
  { id: "VCB", name: "Vietcombank (Ngân hàng Ngoại Thương)", code: "VCB" },
  { id: "TCB", name: "Techcombank (Ngân hàng Kỹ Thương)", code: "TCB" },
  { id: "ICB", name: "VietinBank (Ngân hàng Công Thương)", code: "ICB" },
  { id: "ACB", name: "ACB (Ngân hàng Á Châu)", code: "ACB" },
  { id: "BIDV", name: "BIDV (Ngân hàng Đầu tư và Phát triển)", code: "BIDV" },
  { id: "VPB", name: "VPBank (Ngân hàng Việt Nam Thịnh Vượng)", code: "VPB" },
  { id: "TPB", name: "TPBank (Ngân hàng Tiên Phong)", code: "TPB" },
  { id: "STB", name: "Sacombank (Ngân hàng Sài Gòn Thương Tín)", code: "STB" },
  { id: "VIB", name: "VIB (Ngân hàng Quốc Tế)", code: "VIB" },
];
