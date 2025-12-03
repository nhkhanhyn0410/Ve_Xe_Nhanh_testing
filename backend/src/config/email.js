const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Email transporter configuration
let transporter;

const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    // SendGrid configuration
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  } else if (process.env.EMAIL_SERVICE === 'gmail') {
    // Gmail configuration (for development)
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // For development - accept self-signed certificates
      },
    });
  } else {
    // Default SMTP configuration
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  return transporter;
};

/**
 * Send email
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content
 * @param {Array} options.attachments - Email attachments
 * @param {string} options.qrCodeDataUrl - QR code as data URL (will be converted to inline attachment)
 * @returns {Promise<object>} - Email send result
 */
const sendEmail = async ({ to, subject, html, text, attachments = [], qrCodeDataUrl = null }) => {
  try {
    if (!transporter) {
      transporter = createTransporter();
    }

    // Convert QR code data URL to inline attachment for better email client compatibility
    const finalAttachments = [...attachments];
    let finalHtml = html;

    if (qrCodeDataUrl && qrCodeDataUrl.startsWith('data:image')) {
      // Extract base64 data from data URL
      const matches = qrCodeDataUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
      if (matches) {
        const imageType = matches[1];
        const base64Data = matches[2];

        // Add as inline attachment with CID
        finalAttachments.push({
          filename: 'qrcode.png',
          content: base64Data,
          encoding: 'base64',
          cid: 'qrcode@vexenhanh', // CID for referencing in HTML
        });

        // Replace data URL with CID reference in HTML
        finalHtml = html.replace(
          new RegExp(qrCodeDataUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          'cid:qrcode@vexenhanh'
        );

        logger.info('Mã QR đã được chuyển đổi sang tệp đính kèm');
      }
    }

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html: finalHtml,
      text,
      attachments: finalAttachments,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email đã gửi:', info.messageId);
    return info;
  } catch (error) {
    logger.error(' Lỗi gửi email:', error);
    throw new Error(`Không thể gửi email: ${error.message}`);
  }
};

/**
 * Email templates
 */
const emailTemplates = {
  // Welcome email template
  welcome: (name) => ({
    subject: 'Chào mừng đến với Vé xe nhanh!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0ea5e9;">Chào mừng đến với Vé xe nhanh!</h1>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại Vé xe nhanh. Chúng tôi rất vui được phục vụ bạn!</p>
        <p>Bạn có thể bắt đầu tìm kiếm và đặt vé xe ngay bây giờ.</p>
        <a href="${process.env.FRONTEND_URL}" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
          Khám phá ngay
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Trân trọng,<br>
          Đội ngũ Vé xe nhanh
        </p>
      </div>
    `,
  }),

  // Email verification template
  emailVerification: (name, token) => ({
    subject: 'Xác thực email - Vé xe nhanh',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0ea5e9;">Xác thực email của bạn</h1>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Vui lòng nhấn vào nút bên dưới để xác thực địa chỉ email của bạn:</p>
        <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
          Xác thực email
        </a>
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          Link xác thực có hiệu lực trong 24 giờ.
        </p>
        <p style="margin-top: 10px; color: #666; font-size: 14px;">
          Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
        </p>
      </div>
    `,
  }),

  // Password reset template
  passwordReset: (name, resetUrl) => ({
    subject: 'Đặt lại mật khẩu - Vé xe nhanh',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0ea5e9;">Đặt lại mật khẩu</h1>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
        <a href="${resetUrl}" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
          Đặt lại mật khẩu
        </a>
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          Link đặt lại mật khẩu có hiệu lực trong 1 giờ.
        </p>
        <p style="margin-top: 10px; color: #666; font-size: 14px;">
          Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
        </p>
      </div>
    `,
  }),

  // Ticket confirmation email template
  ticketConfirmation: (ticketData) => ({
    subject: `Vé xe của bạn - ${ticketData.bookingCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
        <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #0ea5e9; margin: 0; font-size: 28px;">Vé xe nhanh</h1>
            <p style="color: #64748b; margin: 5px 0; font-size: 14px;">Đặt vé xe khách trực tuyến</p>
          </div>

          <!-- Success Message -->
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: #d1fae5; color: #065f46; padding: 10px 20px; border-radius: 20px; font-size: 14px;">
              Đặt vé thành công
            </div>
          </div>

          <h2 style="color: #1e293b; margin-top: 30px;">Xin chào ${ticketData.passengerName}!</h2>
          <p style="color: #475569; line-height: 1.6;">
            Cảm ơn bạn đã đặt vé tại Vé xe nhanh. Vé điện tử của bạn đã sẵn sàng!
          </p>

          <!-- Booking Info -->
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0ea5e9; margin-top: 0;">Thông tin đặt vé</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 40%;">Mã đặt chỗ:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${ticketData.bookingCode}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Mã vé:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${ticketData.ticketCode}</td>
              </tr>
            </table>
          </div>

          <!-- Trip Info -->
          <div style="background: #fff7ed; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <h3 style="color: #f59e0b; margin-top: 0;">Thông tin chuyến đi</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #78350f; width: 40%;">🚌 Tuyến:</td>
                <td style="padding: 8px 0; color: #78350f; font-weight: bold;">${ticketData.routeName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #78350f;">🕐 Giờ đi:</td>
                <td style="padding: 8px 0; color: #78350f; font-weight: bold;">${ticketData.departureTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #78350f;">📍 Điểm đón:</td>
                <td style="padding: 8px 0; color: #78350f;">${ticketData.pickupPoint}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #78350f;">💺 Ghế:</td>
                <td style="padding: 8px 0; color: #78350f; font-weight: bold;">${ticketData.seatNumbers}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #78350f;">💰 Tổng tiền:</td>
                <td style="padding: 8px 0; color: #f59e0b; font-weight: bold; font-size: 18px;">${ticketData.totalPrice}</td>
              </tr>
            </table>
          </div>

          <!-- QR Code -->
          <div style="text-align: center; margin: 30px 0;">
            <h3 style="color: #1e293b;">Mã QR vé của bạn</h3>
            <p style="color: #64748b; font-size: 14px;">Vui lòng xuất trình mã QR này khi lên xe</p>
            <div style="background: white; display: inline-block; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin: 10px 0;">
              <img src="${ticketData.qrCodeImage}" alt="QR Code" style="width: 200px; height: 200px;" />
            </div>
            <p style="color: #64748b; font-size: 13px; margin-top: 15px;">
              💡 <em>Bạn cũng có thể xem vé trực tuyến tại</em>
              <a href="${ticketData.ticketUrl}" style="color: #0ea5e9; text-decoration: none; font-weight: bold;">vexenhanh.com</a>
            </p>
          </div>

          <!-- Important Notes -->
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #fbbf24; margin: 20px 0;">
            <h4 style="color: #92400e; margin-top: 0; font-size: 14px;">LƯU Ý QUAN TRỌNG:</h4>
            <ul style="color: #78350f; font-size: 13px; margin: 10px 0; padding-left: 20px;">
              <li style="margin: 5px 0;">Vui lòng có mặt trước 15 phút so với giờ khởi hành</li>
              <li style="margin: 5px 0;">Xuất trình mã QR này khi lên xe</li>
              <li style="margin: 5px 0;">Mang theo CMND/CCCD để đối chiếu</li>
              <li style="margin: 5px 0;">Liên hệ nhà xe nếu cần hỗ trợ</li>
            </ul>
          </div>

          <!-- Operator Contact -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
            <h4 style="color: #1e293b; margin-bottom: 10px;">Thông tin nhà xe:</h4>
            <p style="color: #475569; margin: 5px 0; font-size: 14px;">
              <strong>${ticketData.operatorName}</strong><br>
              📞 Hotline: ${ticketData.operatorPhone}<br>
              📧 Email: ${ticketData.operatorEmail}
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 5px 0;">
              Vé xe nhanh - Nền tảng đặt vé xe khách trực tuyến<br>
              Hotline: 1900-0000 | Email: support@vexenhanh.com
            </p>
            <p style="color: #cbd5e1; font-size: 11px; margin: 10px 0;">
              Email này được gửi tự động, vui lòng không reply.
            </p>
          </div>
        </div>
      </div>
    `,
  }),

  // Booking reminder email
  tripReminder: (reminderData) => ({
    subject: `Nhắc nhở: Chuyến xe ${reminderData.routeName} - ${reminderData.departureTime}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0ea5e9;">Nhắc nhở chuyến đi</h1>
        <p>Xin chào <strong>${reminderData.passengerName}</strong>,</p>
        <p>Chuyến xe của bạn sắp khởi hành!</p>

        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #92400e;">Thông tin chuyến đi:</h3>
          <p style="color: #78350f; margin: 5px 0;">
            🚌 <strong>Tuyến:</strong> ${reminderData.routeName}<br>
            🕐 <strong>Giờ đi:</strong> ${reminderData.departureTime}<br>
            📍 <strong>Điểm đón:</strong> ${reminderData.pickupPoint}<br>
            💺 <strong>Ghế:</strong> ${reminderData.seatNumbers}
          </p>
        </div>

        <p style="color: #dc2626; font-weight: bold;">Vui lòng có mặt trước 15 phút!</p>

        <a href="${reminderData.ticketUrl}" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
          Xem vé của tôi
        </a>

        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Trân trọng,<br>
          Đội ngũ Vé xe nhanh
        </p>
      </div>
    `,
  }),

  // Ticket cancellation email template (UC-9)
  ticketCancellation: (cancellationData) => ({
    subject: `Xác nhận hủy vé - ${cancellationData.ticketCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
        <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #0ea5e9; margin: 0; font-size: 28px;">Vé xe nhanh</h1>
            <p style="color: #64748b; margin: 5px 0; font-size: 14px;">Đặt vé xe khách trực tuyến</p>
          </div>

          <!-- Cancellation Message -->
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: #fee2e2; color: #991b1b; padding: 10px 20px; border-radius: 20px; font-size: 14px;">
               Vé đã được hủy
            </div>
          </div>

          <h2 style="color: #1e293b; margin-top: 30px;">Xác nhận hủy vé</h2>
          <p style="color: #475569; line-height: 1.6;">
            Vé của bạn đã được hủy thành công vào lúc <strong>${cancellationData.cancelledAt}</strong>.
          </p>

          <!-- Cancellation Info -->
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">Thông tin hủy vé</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #7f1d1d; width: 40%;">Mã đặt chỗ:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${cancellationData.bookingCode}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7f1d1d;">Mã vé:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${cancellationData.ticketCode}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7f1d1d;">Lý do hủy:</td>
                <td style="padding: 8px 0; color: #1e293b;">${cancellationData.cancelReason}</td>
              </tr>
            </table>
          </div>

          <!-- Trip Info -->
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #475569; margin-top: 0;">Thông tin chuyến đi đã hủy</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 40%;">🚌 Tuyến:</td>
                <td style="padding: 8px 0; color: #1e293b;">${cancellationData.routeName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">🕐 Giờ đi:</td>
                <td style="padding: 8px 0; color: #1e293b;">${cancellationData.departureTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">💺 Ghế:</td>
                <td style="padding: 8px 0; color: #1e293b;">${cancellationData.seatNumbers}</td>
              </tr>
            </table>
          </div>

          <!-- Refund Info -->
          <div style="background: ${cancellationData.refundAmount > 0 ? '#d1fae5' : '#fef3c7'}; padding: 20px; border-radius: 8px; border-left: 4px solid ${cancellationData.refundAmount > 0 ? '#10b981' : '#f59e0b'}; margin: 20px 0;">
            <h3 style="color: ${cancellationData.refundAmount > 0 ? '#065f46' : '#92400e'}; margin-top: 0;">💰 Thông tin hoàn tiền</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: ${cancellationData.refundAmount > 0 ? '#047857' : '#78350f'}; width: 50%;">Số tiền gốc:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: bold; text-align: right;">${cancellationData.originalAmount} VNĐ</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: ${cancellationData.refundAmount > 0 ? '#047857' : '#78350f'};">Tỷ lệ hoàn tiền:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: bold; text-align: right;">${cancellationData.refundPercentage}%</td>
              </tr>
              <tr style="border-top: 2px solid ${cancellationData.refundAmount > 0 ? '#10b981' : '#f59e0b'};">
                <td style="padding: 12px 0; color: ${cancellationData.refundAmount > 0 ? '#047857' : '#78350f'}; font-weight: bold;">Số tiền hoàn:</td>
                <td style="padding: 12px 0; color: ${cancellationData.refundAmount > 0 ? '#10b981' : '#f59e0b'}; font-weight: bold; font-size: 20px; text-align: right;">${cancellationData.refundAmount} VNĐ</td>
              </tr>
            </table>
            <p style="color: ${cancellationData.refundAmount > 0 ? '#047857' : '#78350f'}; font-size: 13px; margin: 15px 0 0 0;">
              📝 <strong>Chính sách áp dụng:</strong> ${cancellationData.appliedRule}
            </p>
          </div>

          ${cancellationData.refundAmount > 0 ? `
          <!-- Refund Timeline -->
          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin-top: 0; font-size: 14px;">⏱️ THỜI GIAN HOÀN TIỀN:</h4>
            <p style="color: #1e3a8a; font-size: 13px; margin: 10px 0;">
              Số tiền sẽ được hoàn về tài khoản của bạn trong vòng <strong>3-7 ngày làm việc</strong> tùy theo phương thức thanh toán ban đầu.
            </p>
          </div>
          ` : `
          <!-- No Refund Notice -->
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #92400e; margin-top: 0; font-size: 14px;">LƯU Ý:</h4>
            <p style="color: #78350f; font-size: 13px; margin: 10px 0;">
              Theo chính sách hủy vé, bạn không được hoàn tiền do hủy vé quá gần giờ khởi hành.
            </p>
          </div>
          `}

          <!-- Support Info -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
            <h4 style="color: #1e293b; margin-bottom: 10px;">Cần hỗ trợ?</h4>
            <p style="color: #475569; margin: 5px 0; font-size: 14px;">
              Nếu bạn có bất kỳ thắc mắc nào về việc hủy vé hoặc hoàn tiền, vui lòng liên hệ:
            </p>
            <p style="color: #0ea5e9; margin: 10px 0; font-size: 14px;">
              📞 Hotline: 1900-0000<br>
              📧 Email: support@vexenhanh.com
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 5px 0;">
              Vé xe nhanh - Nền tảng đặt vé xe khách trực tuyến<br>
              Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi
            </p>
            <p style="color: #cbd5e1; font-size: 11px; margin: 10px 0;">
              Email này được gửi tự động, vui lòng không reply.
            </p>
          </div>
        </div>
      </div>
    `,
  }),

  // Ticket change/exchange email template (UC-10)
  ticketChange: (changeData) => ({
    subject: `Đổi vé thành công - ${changeData.oldTicketCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
        <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #0ea5e9; margin: 0; font-size: 28px;">Vé xe nhanh</h1>
            <p style="color: #64748b; margin: 5px 0; font-size: 14px;">Đặt vé xe khách trực tuyến</p>
          </div>

          <!-- Success Message -->
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: #dbeafe; color: #1e40af; padding: 10px 20px; border-radius: 20px; font-size: 14px;">
              🔄 Đổi vé thành công
            </div>
          </div>

          <h2 style="color: #1e293b; margin-top: 30px;">Xác nhận đổi vé</h2>
          <p style="color: #475569; line-height: 1.6;">
            Vé của bạn đã được đổi sang chuyến mới thành công vào lúc <strong>${changeData.changedAt}</strong>.
          </p>

          <!-- Change Reason -->
          ${changeData.changeReason ? `
          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #475569; margin: 0; font-size: 14px;">
              <strong>Lý do đổi vé:</strong> ${changeData.changeReason}
            </p>
          </div>
          ` : ''}

          <!-- Old Ticket Info -->
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;"> Vé cũ (Đã hủy)</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #7f1d1d; width: 40%;">Mã đặt chỗ:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${changeData.oldBookingCode}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7f1d1d;">Mã vé:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${changeData.oldTicketCode}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7f1d1d;">Tuyến:</td>
                <td style="padding: 8px 0; color: #1e293b;">${changeData.oldRouteName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7f1d1d;">Giờ đi:</td>
                <td style="padding: 8px 0; color: #1e293b;">${changeData.oldDepartureTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7f1d1d;">Giá vé:</td>
                <td style="padding: 8px 0; color: #1e293b;">${changeData.oldPrice} VNĐ</td>
              </tr>
            </table>
          </div>

          <!-- New Ticket Info -->
          <div style="background: #d1fae5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h3 style="color: #065f46; margin-top: 0;">Vé mới</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #047857; width: 40%;">Mã đặt chỗ:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${changeData.newBookingCode}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #047857;">Mã vé:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: bold; font-size: 16px;">${changeData.newTicketCode}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #047857;">🚌 Tuyến:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${changeData.newRouteName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #047857;">🕐 Giờ đi:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${changeData.newDepartureTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #047857;">💺 Ghế:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${changeData.seatNumbers}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #047857;">Giá vé:</td>
                <td style="padding: 8px 0; color: #1e293b;">${changeData.newPrice} VNĐ</td>
              </tr>
            </table>
          </div>

          <!-- Price Difference Info -->
          <div style="background: ${changeData.priceDifference === 0 ? '#f1f5f9' : changeData.priceDifference > 0 ? '#fff7ed' : '#dbeafe'}; padding: 20px; border-radius: 8px; border-left: 4px solid ${changeData.priceDifference === 0 ? '#64748b' : changeData.priceDifference > 0 ? '#f59e0b' : '#0ea5e9'}; margin: 20px 0;">
            <h3 style="color: ${changeData.priceDifference === 0 ? '#475569' : changeData.priceDifference > 0 ? '#92400e' : '#1e40af'}; margin-top: 0;">💰 Chênh lệch giá</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: ${changeData.priceDifference === 0 ? '#64748b' : changeData.priceDifference > 0 ? '#78350f' : '#1e3a8a'}; width: 50%;">Giá vé cũ:</td>
                <td style="padding: 8px 0; color: #1e293b; text-align: right;">${changeData.oldPrice} VNĐ</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: ${changeData.priceDifference === 0 ? '#64748b' : changeData.priceDifference > 0 ? '#78350f' : '#1e3a8a'};">Giá vé mới:</td>
                <td style="padding: 8px 0; color: #1e293b; text-align: right;">${changeData.newPrice} VNĐ</td>
              </tr>
              <tr style="border-top: 2px solid ${changeData.priceDifference === 0 ? '#64748b' : changeData.priceDifference > 0 ? '#f59e0b' : '#0ea5e9'};">
                <td style="padding: 12px 0; color: ${changeData.priceDifference === 0 ? '#64748b' : changeData.priceDifference > 0 ? '#78350f' : '#1e3a8a'}; font-weight: bold;">Chênh lệch:</td>
                <td style="padding: 12px 0; color: ${changeData.priceDifference === 0 ? '#64748b' : changeData.priceDifference > 0 ? '#f59e0b' : '#0ea5e9'}; font-weight: bold; font-size: 20px; text-align: right;">${changeData.priceDifferenceText} VNĐ</td>
              </tr>
            </table>
            ${changeData.priceDifference > 0 ? `
            <p style="color: #92400e; font-size: 13px; margin: 15px 0 0 0;">
              📝 Số tiền chênh lệch đã được thanh toán thành công.
            </p>
            ` : changeData.priceDifference < 0 ? `
            <p style="color: #1e40af; font-size: 13px; margin: 15px 0 0 0;">
              📝 Số tiền chênh lệch sẽ được hoàn về tài khoản của bạn trong 3-7 ngày làm việc.
            </p>
            ` : `
            <p style="color: #475569; font-size: 13px; margin: 15px 0 0 0;">
              📝 Không có chênh lệch giá giữa vé cũ và vé mới.
            </p>
            `}
          </div>

          <!-- Important Notes -->
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #fbbf24; margin: 20px 0;">
            <h4 style="color: #92400e; margin-top: 0; font-size: 14px;">LƯU Ý QUAN TRỌNG:</h4>
            <ul style="color: #78350f; font-size: 13px; margin: 10px 0; padding-left: 20px;">
              <li style="margin: 5px 0;">Vui lòng sử dụng <strong>mã vé mới</strong> khi lên xe</li>
              <li style="margin: 5px 0;">Có mặt trước 15 phút so với giờ khởi hành</li>
              <li style="margin: 5px 0;">Xuất trình mã QR hoặc vé PDF khi lên xe</li>
              <li style="margin: 5px 0;">Vé cũ đã không còn hiệu lực</li>
            </ul>
          </div>

          <!-- Support Info -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
            <h4 style="color: #1e293b; margin-bottom: 10px;">Cần hỗ trợ?</h4>
            <p style="color: #475569; margin: 5px 0; font-size: 14px;">
              Nếu bạn có bất kỳ thắc mắc nào về việc đổi vé, vui lòng liên hệ:
            </p>
            <p style="color: #0ea5e9; margin: 10px 0; font-size: 14px;">
              📞 Hotline: 1900-0000<br>
              📧 Email: support@vexenhanh.com
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 5px 0;">
              Vé xe nhanh - Nền tảng đặt vé xe khách trực tuyến<br>
              Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi
            </p>
            <p style="color: #cbd5e1; font-size: 11px; margin: 10px 0;">
              Email này được gửi tự động, vui lòng không reply.
            </p>
          </div>
        </div>
      </div>
    `,
  }),
};

module.exports = {
  sendEmail,
  emailTemplates,
};
