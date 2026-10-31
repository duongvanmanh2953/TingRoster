import nodemailer from 'nodemailer';
import { prisma } from '@/lib/db/prisma';

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const APP_NAME = 'TingRoster';
const FROM_EMAIL = process.env.SMTP_FROM || 'no-reply@tingroster.vn';

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Fallback to local test Mailpit or console logger
  return nodemailer.createTransport({
    host: process.env.MAILPIT_HOST || 'localhost',
    port: parseInt(process.env.MAILPIT_PORT || '1025', 10),
    secure: false,
    ignoreTLS: true,
  });
}

const baseEmailStyle = `
  font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #F5F7FB;
  padding: 40px 16px;
  color: #101828;
`;

const containerStyle = `
  max-width: 580px;
  margin: 0 auto;
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E4E7EC;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
`;

const headerStyle = `
  background: #0B0F19;
  padding: 32px;
  text-align: center;
`;

const bodyStyle = `
  padding: 36px 32px;
  line-height: 1.6;
`;

const buttonStyle = `
  display: inline-block;
  background: #2538D9;
  color: #FFFFFF !important;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  padding: 14px 32px;
  border-radius: 8px;
  margin: 24px 0;
`;

const footerStyle = `
  padding: 24px 32px;
  background: #F8FAFC;
  border-top: 1px solid #EAECF0;
  text-align: center;
  font-size: 12px;
  color: #475467;
`;

export async function sendEmail({
  to,
  subject,
  html,
  text,
  emailType,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  emailType: string;
}): Promise<EmailDeliveryResult> {
  const provider = process.env.SMTP_HOST ? 'SMTP' : 'MAILPIT_LOCAL';

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });

    await prisma.emailDeliveryLog.create({
      data: {
        recipient: to,
        subject,
        emailType,
        status: 'SENT',
        provider,
        metadata: JSON.stringify({ messageId: info.messageId, response: info.response }),
      },
    });

    return { success: true, messageId: info.messageId };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown mail delivery error';
    console.error(`[EmailService] Failed to send ${emailType} to ${to}:`, errorMsg);

    // Record failure in DB for Admin auditing
    try {
      await prisma.emailDeliveryLog.create({
        data: {
          recipient: to,
          subject,
          emailType,
          status: 'FAILED',
          provider,
          errorMessage: errorMsg,
        },
      });
    } catch (dbErr) {
      console.error('[EmailService] Failed to log email delivery error to database:', dbErr);
    }

    return { success: false, error: errorMsg };
  }
}

/**
 * 1. Email Xác Thực Tài Khoản Mới
 */
export async function sendVerificationEmail({
  email,
  name,
  token,
  appUrl,
}: {
  email: string;
  name: string;
  token: string;
  appUrl: string;
}): Promise<EmailDeliveryResult> {
  const verifyUrl = `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;
  const subject = `[TingRoster] Xác thực địa chỉ email tài khoản của bạn`;

  const html = `
    <div style="${baseEmailStyle}">
      <div style="${containerStyle}">
        <div style="${headerStyle}">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;">
            Ting<span style="color: #4F62FF;">Roster</span>
          </h1>
          <p style="color: #94A3B8; margin: 6px 0 0 0; font-size: 13px;">Nền tảng điểm danh & đối soát tự động</p>
        </div>
        <div style="${bodyStyle}">
          <p style="font-size: 16px; margin-top: 0;">Xin chào <strong>${name}</strong>,</p>
          <p style="color: #475467; font-size: 14px;">
            Cảm ơn bạn đã đăng ký tài khoản trên nền tảng <strong>TingRoster</strong>. Để kích hoạt tài khoản và bảo vệ dữ liệu không gian quản lý của bạn, vui lòng bấm vào nút bên dưới để xác thực email.
          </p>
          <div style="text-align: center;">
            <a href="${verifyUrl}" style="${buttonStyle}" target="_blank">
              Xác thực email ngay
            </a>
          </div>
          <p style="color: #667085; font-size: 13px; margin-bottom: 4px;">
            Hoặc sao chép đường liên kết sau vào trình duyệt của bạn:
          </p>
          <p style="word-break: break-all; background: #F8FAFC; padding: 12px; border-radius: 6px; font-size: 12px; color: #2538D9;">
            ${verifyUrl}
          </p>
          <p style="color: #98A2B3; font-size: 12px; margin-top: 24px;">
            Đường dẫn xác thực này sẽ hết hạn trong vòng <strong>24 giờ</strong>. Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email.
          </p>
        </div>
        <div style="${footerStyle}">
          &copy; ${new Date().getFullYear()} TingRoster Platform. Đã đăng ký bản quyền.<br/>
          Điểm danh một chạm. Thu phí tự động. Đối soát khỏi lo.
        </div>
      </div>
    </div>
  `;

  const text = `Xin chào ${name},\n\nVui lòng xác thực email tài khoản TingRoster của bạn bằng cách truy cập: ${verifyUrl}\n\nLiên kết hết hạn sau 24 giờ.`;

  return sendEmail({ to: email, subject, html, text, emailType: 'VERIFICATION' });
}

/**
 * 2. Email Đặt Lại Mật Khẩu
 */
export async function sendPasswordResetEmail({
  email,
  name,
  token,
  appUrl,
}: {
  email: string;
  name: string;
  token: string;
  appUrl: string;
}): Promise<EmailDeliveryResult> {
  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const subject = `[TingRoster] Hướng dẫn đặt lại mật khẩu tài khoản`;

  const html = `
    <div style="${baseEmailStyle}">
      <div style="${containerStyle}">
        <div style="${headerStyle}">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;">
            Ting<span style="color: #4F62FF;">Roster</span>
          </h1>
          <p style="color: #94A3B8; margin: 6px 0 0 0; font-size: 13px;">Bảo mật & Quản lý tài khoản</p>
        </div>
        <div style="${bodyStyle}">
          <p style="font-size: 16px; margin-top: 0;">Xin chào <strong>${name}</strong>,</p>
          <p style="color: #475467; font-size: 14px;">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email <strong>${email}</strong>. Vui lòng bấm vào nút bên dưới để tạo mật khẩu mới.
          </p>
          <div style="text-align: center;">
            <a href="${resetUrl}" style="${buttonStyle}" target="_blank">
              Đặt lại mật khẩu mới
            </a>
          </div>
          <p style="color: #667085; font-size: 13px; margin-bottom: 4px;">
            Đường liên kết trực tiếp:
          </p>
          <p style="word-break: break-all; background: #F8FAFC; padding: 12px; border-radius: 6px; font-size: 12px; color: #2538D9;">
            ${resetUrl}
          </p>
          <p style="color: #B42318; font-size: 12px; background: #FEF3F2; padding: 10px; border-radius: 6px; margin-top: 20px;">
            <strong>Lưu ý bảo mật:</strong> Liên kết đặt lại này chỉ có hiệu lực trong vòng <strong>60 phút</strong> và chỉ sử dụng được 01 lần duy nhất. Nếu bạn không gửi yêu cầu này, hãy đổi mật khẩu ngay để bảo vệ tài khoản.
          </p>
        </div>
        <div style="${footerStyle}">
          &copy; ${new Date().getFullYear()} TingRoster Platform. Đã đăng ký bản quyền.
        </div>
      </div>
    </div>
  `;

  const text = `Xin chào ${name},\n\nBạn đã yêu cầu đặt lại mật khẩu trên TingRoster. Truy cập liên kết sau trong vòng 60 phút: ${resetUrl}`;

  return sendEmail({ to: email, subject, html, text, emailType: 'RESET_PASSWORD' });
}

/**
 * 3. Email Cảnh Báo Bảo Mật (Mật khẩu đã được thay đổi)
 */
export async function sendPasswordChangedAlert({
  email,
  name,
  appUrl,
}: {
  email: string;
  name: string;
  appUrl: string;
}): Promise<EmailDeliveryResult> {
  const subject = `[TingRoster] Cảnh báo bảo mật: Mật khẩu của bạn vừa được thay đổi`;

  const html = `
    <div style="${baseEmailStyle}">
      <div style="${containerStyle}">
        <div style="${headerStyle}">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; font-weight: 700;">
            Ting<span style="color: #4F62FF;">Roster</span>
          </h1>
          <p style="color: #94A3B8; margin: 6px 0 0 0; font-size: 13px;">Thông báo bảo mật hệ thống</p>
        </div>
        <div style="${bodyStyle}">
          <p style="font-size: 16px; margin-top: 0;">Xin chào <strong>${name}</strong>,</p>
          <p style="color: #475467; font-size: 14px;">
            Mật khẩu đăng nhập cho tài khoản <strong>${email}</strong> trên TingRoster vừa được thay đổi thành công vào lúc <strong>${new Date().toLocaleString('vi-VN')}</strong>.
          </p>
          <p style="color: #475467; font-size: 14px;">
            Nếu chính bạn thực hiện thay đổi này, bạn có thể hoàn toàn yên tâm tiếp tục sử dụng hệ thống.
          </p>
          <div style="background: #FFF9F5; border: 1px solid #FEDF89; padding: 14px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #B54708; margin: 0; font-size: 13px;">
              <strong>Không phải bạn thực hiện?</strong> Hãy liên hệ ngay với đội ngũ hỗ trợ tại <a href="mailto:support@tingroster.vn" style="color: #2538D9;">support@tingroster.vn</a> hoặc thực hiện chức năng quên mật khẩu tại trang đăng nhập: <a href="${appUrl}/forgot-password" style="color: #2538D9;">${appUrl}/forgot-password</a>.
            </p>
          </div>
        </div>
        <div style="${footerStyle}">
          &copy; ${new Date().getFullYear()} TingRoster Platform.
        </div>
      </div>
    </div>
  `;

  const text = `Xin chào ${name},\n\nMật khẩu tài khoản TingRoster của bạn vừa được thay đổi vào lúc ${new Date().toLocaleString('vi-VN')}. Nếu không phải bạn thực hiện, vui lòng liên hệ ngay với chúng tôi.`;

  return sendEmail({ to: email, subject, html, text, emailType: 'SECURITY_ALERT' });
}
