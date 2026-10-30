import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle } from 'docx';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export interface CreateContractInput {
  groupId: string;
  title: string;
  templateType: 'RENTAL' | 'EDUCATION' | 'SPORTS' | 'GENERAL';
  memberId?: string | null;
  partyBUserId?: string | null;
  partyBName: string;
  partyBPhone?: string | null;
  partyBIdCard?: string | null;
  partyBAddress?: string | null;
  effectiveDate?: string | null;
  expirationDate?: string | null;
  fields: Record<string, any>;
  partyBRequiredFields?: string[];
  signatureLevel?: 'LEVEL_1_CONFIRMATION' | 'LEVEL_2_ESIGN' | 'LEVEL_3_DIGITAL_CERT';
}

export class ContractService {
  /**
   * Calculate SHA-256 hash of contract content for tamper-evident verification
   */
  static calculateContentHash(content: string): string {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  }

  /**
   * Generate default template content based on space type
   */
  static getTemplateContent(templateType: string, fields: Record<string, any>): string {
    const ownerName = fields.OWNER_NAME || '...................................................';
    const ownerPhone = fields.OWNER_PHONE || '...................................................';
    const ownerAddress = fields.OWNER_ADDRESS || '...................................................';
    const ownerIdCard = fields.OWNER_ID_CARD || '...................................................';

    const memberName = fields.MEMBER_NAME || '{{MEMBER_NAME}}';
    const memberPhone = fields.MEMBER_PHONE || '{{MEMBER_PHONE}}';
    const memberAddress = fields.MEMBER_ADDRESS || '{{MEMBER_ADDRESS}}';
    const memberIdCard = fields.MEMBER_ID_CARD || '{{MEMBER_ID_CARD}}';

    if (templateType === 'RENTAL') {
      const roomNumber = fields.ROOM_NUMBER || 'Phòng ........';
      const propertyName = fields.PROPERTY_NAME || 'Nhà trọ / Căn hộ mini';
      const rentAmount = fields.RENT_AMOUNT ? Number(fields.RENT_AMOUNT).toLocaleString('vi-VN') + ' đ/tháng' : '................... đ/tháng';
      const depositAmount = fields.DEPOSIT_AMOUNT ? Number(fields.DEPOSIT_AMOUNT).toLocaleString('vi-VN') + ' đ' : '................... đ';
      const paymentDueDate = fields.PAYMENT_DUE_DATE || 'Ngày 05 hàng tháng';

      return `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h3 style="margin: 0; text-transform: uppercase; font-size: 14px; font-weight: bold;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
    <p style="margin: 4px 0; font-size: 13px; font-weight: bold; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</p>
    <h2 style="margin: 20px 0 8px 0; font-size: 18px; font-weight: 900; color: #0f172a; text-transform: uppercase;">
      HỢP ĐỒNG THUÊ PHÒNG TRỌ / CĂN HỘ
    </h2>
    <p style="margin: 0; font-size: 12px; color: #64748b;">(Căn cứ theo quy định của Bộ luật Dân sự 2015 & Luật Nhà ở 2023)</p>
  </div>

  <p style="font-size: 13px; margin-bottom: 12px;">Hôm nay, các bên tham gia giao kết hợp đồng gồm có:</p>

  <div style="background-color: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
    <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #1e40af; text-transform: uppercase;">BÊN CHO THUÊ (BÊN A):</h4>
    <p style="margin: 4px 0; font-size: 13px;">- Họ và tên: <strong>${ownerName}</strong></p>
    <p style="margin: 4px 0; font-size: 13px;">- Số CCCD/Định danh: <strong>${ownerIdCard}</strong></p>
    <p style="margin: 4px 0; font-size: 13px;">- Điện thoại liên hệ: <strong>${ownerPhone}</strong></p>
    <p style="margin: 4px 0; font-size: 13px;">- Địa chỉ cơ sở: <strong>${ownerAddress}</strong></p>
  </div>

  <div style="background-color: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
    <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #1e40af; text-transform: uppercase;">BÊN THUÊ (BÊN B):</h4>
    <p style="margin: 4px 0; font-size: 13px;">- Họ và tên: <strong>${memberName}</strong></p>
    <p style="margin: 4px 0; font-size: 13px;">- Số CCCD/Định danh: <strong>${memberIdCard}</strong></p>
    <p style="margin: 4px 0; font-size: 13px;">- Điện thoại: <strong>${memberPhone}</strong></p>
    <p style="margin: 4px 0; font-size: 13px;">- Nơi thường trú: <strong>${memberAddress}</strong></p>
  </div>

  <h4 style="font-size: 13px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">ĐIỀU 1: ĐỐI TƯỢNG VÀ THỜI HẠN THUÊ</h4>
  <p style="font-size: 13px;">1.1. Bên A đồng ý cho Bên B thuê phòng số: <strong>${roomNumber}</strong> thuộc cơ sở <strong>${propertyName}</strong>.</p>
  <p style="font-size: 13px;">1.2. Mục đích thuê: Dùng để ở và sinh hoạt hợp pháp, chấp hành quy định an ninh trật tự và phòng cháy chữa cháy.</p>

  <h4 style="font-size: 13px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 16px;">ĐIỀU 2: GIÁ THUÊ, ĐẶT CỌC VÀ PHƯƠNG THỨC THANH TOÁN</h4>
  <p style="font-size: 13px;">2.1. Giá thuê phòng: <strong>${rentAmount}</strong>.</p>
  <p style="font-size: 13px;">2.2. Tiền đặt cọc bảo đảm: <strong>${depositAmount}</strong> (được hoàn trả khi thanh lý hợp đồng đúng cam kết).</p>
  <p style="font-size: 13px;">2.3. Thời hạn đóng tiền phòng: <strong>${paymentDueDate}</strong> thông qua chuyển khoản VietQR tự động định danh trên nền tảng TingRoster.</p>

  <h4 style="font-size: 13px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 16px;">ĐIỀU 3: QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN</h4>
  <p style="font-size: 13px;">3.1. Bên A cam kết bàn giao hiện trạng phòng hoạt động bình thường, bảo đảm an ninh và hỗ trợ đăng ký tạm trú cho Bên B.</p>
  <p style="font-size: 13px;">3.2. Bên B có trách nhiệm thanh toán đúng kỳ hạn, giữ gìn vệ sinh chung, không tự ý cải tạo kết cấu phòng khi chưa có sự đồng ý của Bên A.</p>
  <p style="font-size: 13px;">3.3. Hợp đồng này được xác lập bằng phương thức điện tử theo Luật Giao dịch điện tử 2023 và có giá trị ràng buộc giữa hai bên kể từ khi hoàn tất chữ ký.</p>
</div>`;
    }

    if (templateType === 'EDUCATION') {
      const courseName = fields.COURSE_NAME || fields.PROPERTY_NAME || 'Khóa học bổ trợ kiến thức';
      const tuitionFee = fields.TUITION_FEE || fields.RENT_AMOUNT ? Number(fields.TUITION_FEE || fields.RENT_AMOUNT).toLocaleString('vi-VN') + ' đ' : '................... đ';
      const schedule = fields.SCHEDULE || 'Theo thời khóa biểu lớp quy định';

      return `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h3 style="margin: 0; text-transform: uppercase; font-size: 14px; font-weight: bold;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
    <p style="margin: 4px 0; font-size: 13px; font-weight: bold; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</p>
    <h2 style="margin: 20px 0 8px 0; font-size: 18px; font-weight: 900; color: #0f172a; text-transform: uppercase;">
      THỎA THUẬN THAM GIA KHÓA HỌC & ĐÀO TẠO
    </h2>
    <p style="margin: 0; font-size: 12px; color: #64748b;">(Cam kết trách nhiệm đào tạo, học phí và lịch học)</p>
  </div>

  <div style="background-color: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
    <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #1e40af; text-transform: uppercase;">BÊN ĐÀO TẠO / GIÁO VIÊN (BÊN A):</h4>
    <p style="margin: 4px 0; font-size: 13px;">- Đơn vị / Giáo viên: <strong>${ownerName}</strong></p>
    <p style="margin: 4px 0; font-size: 13px;">- Điện thoại: <strong>${ownerPhone}</strong></p>
    <p style="margin: 4px 0; font-size: 13px;">- Địa chỉ lớp: <strong>${ownerAddress}</strong></p>
  </div>

  <div style="background-color: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
    <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #1e40af; text-transform: uppercase;">BÊN HỌC VIÊN / PHỤ HUYNH (BÊN B):</h4>
    <p style="margin: 4px 0; font-size: 13px;">- Họ và tên học viên: <strong>${memberName}</strong></p>
    <p style="margin: 4px 0; font-size: 13px;">- Điện thoại liên hệ: <strong>${memberPhone}</strong></p>
    <p style="margin: 4px 0; font-size: 13px;">- Địa chỉ: <strong>${memberAddress}</strong></p>
  </div>

  <h4 style="font-size: 13px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">ĐIỀU 1: NỘI DUNG KHÓA HỌC & LỊCH HỌC</h4>
  <p style="font-size: 13px;">1.1. Học viên đăng ký tham gia lớp học: <strong>${courseName}</strong>.</p>
  <p style="font-size: 13px;">1.2. Thời gian và lịch học: <strong>${schedule}</strong>.</p>

  <h4 style="font-size: 13px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 16px;">ĐIỀU 2: HỌC PHÍ VÀ CHÍNH SÁCH BẢO LƯU</h4>
  <p style="font-size: 13px;">2.1. Học phí: <strong>${tuitionFee}</strong>.</p>
  <p style="font-size: 13px;">2.2. Điểm danh: Thực hiện quét mã QR 1 chạm tại lớp hoặc kiosk điểm danh qua ứng dụng TingRoster.</p>
  <p style="font-size: 13px;">2.3. Trường hợp học viên nghỉ có báo trước tối thiểu 24 giờ, học viên được hỗ trợ sắp xếp ca học bù phù hợp.</p>
</div>`;
    }

    // Default / Sports / General
    return `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="margin: 0; font-size: 18px; font-weight: 900; color: #0f172a; text-transform: uppercase;">
      THỎA THUẬN HỘI VIÊN & ĐIỀU KHOẢN DỊCH VỤ
    </h2>
    <p style="margin: 4px 0; font-size: 12px; color: #64748b;">(Xác lập quyền lợi hội viên và quy chế sinh hoạt chung)</p>
  </div>

  <p style="font-size: 13px;">Thỏa thuận được giao kết giữa Đơn vị quản trị <strong>${ownerName}</strong> và Hội viên <strong>${memberName}</strong>.</p>
  <p style="font-size: 13px;">Hội viên cam kết tuân thủ nội quy sinh hoạt, bảo quản trang thiết bị và hoàn tất phí hội viên đúng thời hạn thỏa thuận.</p>
</div>`;
  }

  /**
   * Create a new digital contract draft
   */
  static async createContract(groupId: string, ownerId: string, input: CreateContractInput) {
    // Verify space ownership
    const group = await prisma.group.findFirst({
      where: { id: groupId, userId: ownerId },
      include: { user: true },
    });

    if (!group) {
      throw new Error('Bạn không có quyền quản trị không gian này');
    }

    // Generate contract code e.g. HD-2026-9481
    const rand = Math.floor(1000 + Math.random() * 9000);
    const contractCode = `HD-${new Date().getFullYear()}-${rand}`;

    const mergedFields = {
      OWNER_NAME: group.user.name,
      OWNER_PHONE: group.user.bankAccountNo ? '09' + group.user.bankAccountNo.slice(-8) : '0912345678',
      OWNER_ADDRESS: group.name,
      ...input.fields,
      MEMBER_NAME: input.partyBName,
      MEMBER_PHONE: input.partyBPhone || '',
      MEMBER_ID_CARD: input.partyBIdCard || '',
      MEMBER_ADDRESS: input.partyBAddress || '',
    };

    const contentHtml = this.getTemplateContent(input.templateType, mergedFields);
    const contentHash = this.calculateContentHash(contentHtml);

    const contract = await prisma.digitalContract.create({
      data: {
        contractCode,
        groupId,
        title: input.title,
        templateType: input.templateType,
        status: input.partyBRequiredFields && input.partyBRequiredFields.length > 0 ? 'PENDING_PARTY_B' : 'READY_TO_SIGN',
        version: 1,
        ownerId,
        memberId: input.memberId || null,
        partyBUserId: input.partyBUserId || null,
        partyBName: input.partyBName,
        partyBPhone: input.partyBPhone || null,
        partyBIdCard: input.partyBIdCard || null,
        partyBAddress: input.partyBAddress || null,
        effectiveDate: input.effectiveDate ? new Date(input.effectiveDate) : null,
        expirationDate: input.expirationDate ? new Date(input.expirationDate) : null,
        contentHtml,
        contentHash,
        fieldsJson: JSON.stringify(mergedFields),
        partyARequiredFields: JSON.stringify(['OWNER_NAME', 'OWNER_PHONE']),
        partyBRequiredFields: JSON.stringify(input.partyBRequiredFields || ['MEMBER_NAME', 'MEMBER_PHONE']),
        signatureLevel: input.signatureLevel || 'LEVEL_2_ESIGN',
      },
    });

    return contract;
  }

  /**
   * Party B (Student/Tenant) fills their required personal details
   */
  static async updatePartyBFields(
    contractId: string,
    userId: string,
    fields: {
      partyBName?: string;
      partyBPhone?: string;
      partyBIdCard?: string;
      partyBAddress?: string;
      additionalData?: Record<string, any>;
    }
  ) {
    const contract = await prisma.digitalContract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new Error('Hợp đồng không tồn tại');
    }

    if (contract.isCompleted) {
      throw new Error('Hợp đồng đã hoàn tất ký kết, không thể chỉnh sửa');
    }

    let existingFields = {};
    try {
      if (contract.fieldsJson) existingFields = JSON.parse(contract.fieldsJson);
    } catch {}

    const updatedFields: Record<string, any> = {
      ...existingFields,
      MEMBER_NAME: fields.partyBName || contract.partyBName,
      MEMBER_PHONE: fields.partyBPhone || contract.partyBPhone,
      MEMBER_ID_CARD: fields.partyBIdCard || contract.partyBIdCard,
      MEMBER_ADDRESS: fields.partyBAddress || contract.partyBAddress,
      ...(fields.additionalData || {}),
    };

    const newContentHtml = this.getTemplateContent(contract.templateType, updatedFields);
    const newContentHash = this.calculateContentHash(newContentHtml);

    const updated = await prisma.digitalContract.update({
      where: { id: contractId },
      data: {
        partyBName: fields.partyBName || contract.partyBName,
        partyBPhone: fields.partyBPhone || contract.partyBPhone,
        partyBIdCard: fields.partyBIdCard || contract.partyBIdCard,
        partyBAddress: fields.partyBAddress || contract.partyBAddress,
        partyBCompletedFields: true,
        partyBUserId: userId,
        fieldsJson: JSON.stringify(updatedFields),
        contentHtml: newContentHtml,
        contentHash: newContentHash,
        status: 'READY_TO_SIGN',
      },
    });

    return updated;
  }

  /**
   * Execute electronic signature
   */
  static async signContract(
    contractId: string,
    userId: string,
    input: {
      signerType: 'PARTY_A' | 'PARTY_B' | 'GUARDIAN';
      signatureType: 'DRAWING' | 'TYPING' | 'OTP_CONFIRMED' | 'CA_CERTIFICATE';
      signatureData?: string | null;
      ipAddress?: string | null;
      userAgent?: string | null;
    }
  ) {
    const contract = await prisma.digitalContract.findUnique({
      where: { id: contractId },
      include: { signatures: true, group: true },
    });

    if (!contract) {
      throw new Error('Hợp đồng không tồn tại');
    }

    if (contract.isCompleted) {
      throw new Error('Hợp đồng này đã được hoàn tất ký kết đầy đủ các bên');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new Error('Người ký không tồn tại');

    // Check if signer already signed
    const alreadySigned = contract.signatures.some((s) => s.signerType === input.signerType);
    if (alreadySigned) {
      throw new Error(`Bên ${input.signerType} đã hoàn tất thao tác ký trước đó`);
    }

    // Create signature record
    const signature = await prisma.contractSignature.create({
      data: {
        contractId,
        signerType: input.signerType,
        signerId: userId,
        signerName: user.name,
        signerRole: input.signerType === 'PARTY_A' ? 'Đại diện Bên A' : 'Học viên / Đại diện Bên B',
        signatureType: input.signatureType,
        signatureData: input.signatureData || null,
        ipAddress: input.ipAddress || '127.0.0.1',
        userAgent: input.userAgent || 'TingRoster Web Client',
        signedContentHash: contract.contentHash || this.calculateContentHash(contract.contentHtml),
      },
    });

    // Check if all parties have signed
    const allSignatures = [...contract.signatures, signature];
    const hasPartyA = allSignatures.some((s) => s.signerType === 'PARTY_A');
    const hasPartyB = allSignatures.some((s) => s.signerType === 'PARTY_B');

    let newStatus = 'PARTIALLY_SIGNED';
    let isCompleted = false;
    let completedAt: Date | null = null;

    if (hasPartyA && hasPartyB) {
      newStatus = 'COMPLETED';
      isCompleted = true;
      completedAt = new Date();
    }

    const updated = await prisma.digitalContract.update({
      where: { id: contractId },
      data: {
        status: newStatus,
        isCompleted,
        completedAt,
      },
      include: { signatures: true },
    });

    // If completed, generate native DOCX document asynchronously
    if (isCompleted) {
      this.generateDocxFile(updated).catch((err) => console.error('DOCX generation error:', err));
    }

    return updated;
  }

  /**
   * Generate an authentic, editable .docx Word document using docx library
   */
  static async generateDocxFile(contract: any): Promise<string> {
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
                alignment: AlignmentType.CENTER,
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                text: 'Độc lập - Tự do - Hạnh phúc',
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                text: '------------------------',
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({ text: '' }),
              new Paragraph({
                text: contract.title.toUpperCase(),
                alignment: AlignmentType.CENTER,
                heading: HeadingLevel.TITLE,
              }),
              new Paragraph({
                text: `Mã số hợp đồng: ${contract.contractCode}`,
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({ text: '' }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'BÊN A (ĐẠI DIỆN CƠ SỞ): ', bold: true }),
                  new TextRun({ text: contract.group?.name || 'Chủ cơ sở' }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'BÊN B (HỌC VIÊN / KHÁCH HÀNG): ', bold: true }),
                  new TextRun({ text: contract.partyBName }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Số CCCD/Định danh: ', bold: true }),
                  new TextRun({ text: contract.partyBIdCard || 'Chưa cung cấp' }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Số điện thoại: ', bold: true }),
                  new TextRun({ text: contract.partyBPhone || 'Chưa cung cấp' }),
                ],
              }),
              new Paragraph({ text: '' }),
              new Paragraph({
                text: 'ĐIỀU KHOẢN VÀ THỎA THUẬN:',
                heading: HeadingLevel.HEADING_3,
              }),
              new Paragraph({
                text: 'Hai bên cam kết tuân thủ đầy đủ các nội dung thỏa thuận đã xác lập trên nền tảng TingRoster.',
              }),
              new Paragraph({ text: '' }),
              new Paragraph({
                text: 'CHỮ KÝ XÁC NHẬN ĐIỆN TỬ CÁC BÊN',
                alignment: AlignmentType.CENTER,
                heading: HeadingLevel.HEADING_4,
              }),
              new Paragraph({ text: '' }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({ text: 'ĐẠI DIỆN BÊN A', alignment: AlignmentType.CENTER }),
                          new Paragraph({ text: '(Đã ký điện tử)', alignment: AlignmentType.CENTER }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ text: 'ĐẠI DIỆN BÊN B', alignment: AlignmentType.CENTER }),
                          new Paragraph({ text: '(Đã ký điện tử)', alignment: AlignmentType.CENTER }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);
      const filename = `contract_${contract.contractCode}_${Date.now()}.docx`;
      const exportDir = path.join(process.cwd(), 'public', 'uploads', 'contracts');
      await mkdir(exportDir, { recursive: true });
      const fullPath = path.join(exportDir, filename);
      await writeFile(fullPath, buffer);

      const docxUrl = `/uploads/contracts/${filename}`;
      await prisma.digitalContract.update({
        where: { id: contract.id },
        data: { docxUrl },
      });

      return docxUrl;
    } catch (err) {
      console.error('Docx generation error:', err);
      return '';
    }
  }

  /**
   * Get student's contracts across all spaces or for a specific space
   */
  static async getStudentContracts(userId: string, groupId?: string) {
    const where: any = {
      OR: [
        { partyBUserId: userId },
        {
          group: {
            members: {
              some: { userId, status: 'ACTIVE' },
            },
          },
        },
      ],
    };

    if (groupId) {
      where.groupId = groupId;
    }

    const contracts = await prisma.digitalContract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        group: { select: { id: true, name: true, slug: true, logoUrl: true } },
        signatures: true,
      },
    });

    return contracts;
  }

  /**
   * Get space contracts for Owner/Manager dashboard
   */
  static async getSpaceContracts(groupId: string, ownerId: string, status?: string) {
    // Check permission
    const group = await prisma.group.findFirst({
      where: { id: groupId, userId: ownerId },
    });
    if (!group) throw new Error('Không có quyền quản lý không gian này');

    const where: any = { groupId };
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const contracts = await prisma.digitalContract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        signatures: true,
      },
    });

    const stats = {
      total: contracts.length,
      completed: contracts.filter((c) => c.status === 'COMPLETED').length,
      pending: contracts.filter((c) => c.status === 'READY_TO_SIGN' || c.status === 'PARTIALLY_SIGNED').length,
      draft: contracts.filter((c) => c.status === 'DRAFT' || c.status === 'PENDING_PARTY_B').length,
    };

    return { contracts, stats };
  }

  /**
   * Generate raw .docx Buffer for streaming or saving
   */
  static async generateDocxBuffer(contract: any): Promise<Buffer> {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
              alignment: AlignmentType.CENTER,
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: 'Độc lập - Tự do - Hạnh phúc',
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: '------------------------',
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              text: (contract.title || 'HỢP ĐỒNG THỎA THUẬN').toUpperCase(),
              alignment: AlignmentType.CENTER,
              heading: HeadingLevel.TITLE,
            }),
            new Paragraph({
              text: `Mã số hợp đồng: ${contract.contractCode || contract.code || 'HD-TR'}`,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              children: [
                new TextRun({ text: 'BÊN A: ', bold: true }),
                new TextRun({ text: contract.partyAName || contract.group?.name || 'Đại diện cơ sở' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'BÊN B: ', bold: true }),
                new TextRun({ text: contract.partyBName || 'Thành viên / Khách hàng' }),
              ],
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'ĐIỀU KHOẢN VÀ THỎA THUẬN:',
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({
              text: 'Hai bên cam kết tuân thủ đầy đủ các nội dung thỏa thuận đã xác lập trên nền tảng TingRoster.',
            }),
          ],
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }
}

export function calculateContentHash(content: string): string {
  return ContractService.calculateContentHash(content);
}

export function verifyContentIntegrity(content: string, expectedHash: string): boolean {
  return ContractService.calculateContentHash(content) === expectedHash;
}

export async function generateContractDocxBuffer(contract: any): Promise<Buffer> {
  return await ContractService.generateDocxBuffer(contract);
}

