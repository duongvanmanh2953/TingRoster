import { prisma } from '@/lib/db/prisma';

export interface OcrExtractionResult {
  rawText: string;
  confidenceScore: number;
  templateMapped: string;
  extractedFields: {
    contractTitle?: string;
    ownerName?: string;
    ownerIdCard?: string;
    memberName?: string;
    memberPhone?: string;
    memberIdCard?: string;
    memberAddress?: string;
    roomNumber?: string;
    rentAmount?: number;
    depositAmount?: number;
    startDate?: string;
    endDate?: string;
  };
}

export class OcrDocumentService {
  /**
   * Process and extract key legal entities from scanned document text
   */
  static extractEntitiesFromText(rawText: string): OcrExtractionResult {
    const text = rawText || '';

    // Regex extractors for standard Vietnamese contracts
    const nameMatch = text.match(/(?:Ông\/Bà|Họ và tên|Họ tên|Người thuê|Học viên)[:\s]*([^\r\n,]+)/i);
    const phoneMatch = text.match(/(?:Điện thoại|SĐT|Phone)[:\s]*([0-9\s.]{10,12})/i);
    const idCardMatch = text.match(/(?:Số CCCD|CMND|Số định danh|Định danh cá nhân)[:\s]*([0-9]{9,12})/i);
    const roomMatch = text.match(/(?:phòng trọ số|phòng số|phòng|room)[:\s]*([0-9]+[A-Za-z]?|[A-Za-z][0-9]+)/i);
    const rentMatch = text.match(/(?:Giá thuê phòng|Giá thuê|Tiền phòng|Học phí|Chi phí)[:\s]*([0-9.,]+)\s*(?:đ|VND|đồng)?/i);
    const depositMatch = text.match(/(?:Tiền đặt cọc bảo đảm|Tiền đặt cọc|Đặt cọc|Tiền cọc)[:\s]*([0-9.,]+)\s*(?:đ|VND|đồng)?/i);

    let rentAmount: number | undefined;
    if (rentMatch && rentMatch[1]) {
      const cleanNum = parseInt(rentMatch[1].replace(/[.,]/g, ''), 10);
      if (!isNaN(cleanNum)) rentAmount = cleanNum;
    }

    let depositAmount: number | undefined;
    if (depositMatch && depositMatch[1]) {
      const cleanDeposit = parseInt(depositMatch[1].replace(/[.,]/g, ''), 10);
      if (!isNaN(cleanDeposit)) depositAmount = cleanDeposit;
    }

    // Determine template mapping
    let templateMapped = 'GENERAL';
    if (/thuê phòng|nhà trọ|tiền cọc|tiền điện|tiền nước/i.test(text)) {
      templateMapped = 'RENTAL';
    } else if (/học phí|khóa học|lớp học|buổi học|giáo trình/i.test(text)) {
      templateMapped = 'EDUCATION';
    } else if (/sân|pickleball|cầu lông|hội viên|giờ chơi/i.test(text)) {
      templateMapped = 'SPORTS';
    }

    return {
      rawText: text,
      confidenceScore: 0.92,
      templateMapped,
      extractedFields: {
        memberName: nameMatch ? nameMatch[1].trim() : undefined,
        memberPhone: phoneMatch ? phoneMatch[1].replace(/\s/g, '').trim() : undefined,
        memberIdCard: idCardMatch ? idCardMatch[1].trim() : undefined,
        roomNumber: roomMatch ? roomMatch[1].trim() : undefined,
        rentAmount,
        depositAmount,
      },
    };
  }

  /**
   * Create an OCR Job record
   */
  static async createOcrJob(
    groupId: string,
    userId: string,
    fileData: { fileName: string; fileUrl: string; fileType: string; simulatedRawText?: string }
  ) {
    // Simulate smart OCR parsing
    const defaultSampleText = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\nHỢP ĐỒNG THUÊ PHÒNG TRỌ\nBên B: Nguyễn Thị Mai Anh\nSố CCCD: 079198004128\nĐiện thoại: 0987654321\nPhòng số: P.302\nGiá thuê: 3.500.000 đ/tháng\nTiền cọc: 3.500.000 đ`;

    const rawText = fileData.simulatedRawText || defaultSampleText;
    const extraction = this.extractEntitiesFromText(rawText);

    const job = await prisma.documentOcrJob.create({
      data: {
        groupId,
        userId,
        fileName: fileData.fileName,
        fileUrl: fileData.fileUrl,
        fileType: fileData.fileType,
        status: 'COMPLETED',
        rawText,
        extractedFields: JSON.stringify(extraction.extractedFields),
        confidenceScore: extraction.confidenceScore,
        templateMapped: extraction.templateMapped,
      },
    });

    return { job, extraction };
  }

  /**
   * Get OCR jobs in a space
   */
  static async getOcrJobs(groupId: string) {
    return prisma.documentOcrJob.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}

export function extractVietnameseContractEntities(rawText: string) {
  const result = OcrDocumentService.extractEntitiesFromText(rawText);
  return {
    partyBName: result.extractedFields.memberName,
    citizenId: result.extractedFields.memberIdCard,
    partyBPhone: result.extractedFields.memberPhone,
    roomNumber: result.extractedFields.roomNumber,
    rentAmount: result.extractedFields.rentAmount,
    depositAmount: result.extractedFields.depositAmount,
    rawText: result.rawText,
    templateMapped: result.templateMapped,
  };
}

export function classifyContractDocument(text: string): 'RENTAL' | 'EDUCATION' | 'SPORTS' | 'GENERAL' {
  if (/thuê phòng|phòng trọ|căn hộ|nhà trọ|tiền cọc|tiền điện|tiền nước/i.test(text)) {
    return 'RENTAL';
  }
  if (/học phí|khóa học|lớp học|buổi học|giáo trình|đào tạo/i.test(text)) {
    return 'EDUCATION';
  }
  if (/sân|pickleball|cầu lông|hội viên|giờ chơi|thể thao/i.test(text)) {
    return 'SPORTS';
  }
  return 'GENERAL';
}
