import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import QRService from './qr.service.js';
import { logger } from '../utils/logger.js';

/**
 * PDF Service
 * Generates PDF tickets with professional design and QR codes
 */
class PDFService {
  /**
   * Generate PDF ticket
   * @param {Object} ticketData - Ticket information
   * @param {string} outputPath - Output file path
   * @returns {Promise<string>} Path to generated PDF
   */
  async generateTicket(ticketData, outputPath) {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          ticketCode,
          bookingCode,
          qrCodeBuffer,
          passengers,
          tripInfo,
          operator,
          pricing,
          contactInfo,
        } = ticketData;

        // Create PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `QuikRide Ticket - ${ticketCode}`,
            Author: 'QuikRide',
            Subject: 'Bus Ticket',
          },
        });

        // Pipe to file
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Page dimensions
        const pageWidth = doc.page.width;
        const margin = 50;
        const contentWidth = pageWidth - margin * 2;

        // Colors
        const primaryColor = '#0ea5e9';
        const darkColor = '#1e293b';
        const lightGray = '#f1f5f9';
        const borderColor = '#cbd5e1';

        // Header with logo and company name
        this.drawHeader(doc, margin, primaryColor);

        // Ticket title
        let yPos = 120;
        doc
          .fontSize(24)
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .text('VÉ XE ĐIỆN TỬ', margin, yPos, { align: 'center' });

        // Ticket code
        yPos += 35;
        doc
          .fontSize(14)
          .fillColor(darkColor)
          .font('Helvetica')
          .text(`Mã vé: ${ticketCode}`, margin, yPos, { align: 'center' });

        doc
          .fontSize(12)
          .fillColor('#64748b')
          .text(`Mã đặt chỗ: ${bookingCode}`, margin, yPos + 20, { align: 'center' });

        // Draw trip information box
        yPos += 60;
        this.drawBox(doc, margin, yPos, contentWidth, 180, lightGray, borderColor);

        // Trip details
        yPos += 20;
        const leftCol = margin + 20;
        const rightCol = margin + contentWidth / 2 + 20;

        // Route
        doc
          .fontSize(16)
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .text(tripInfo.routeName || `${tripInfo.origin.city} → ${tripInfo.destination.city}`, leftCol, yPos);

        yPos += 30;

        // Departure
        this.drawInfoRow(
          doc,
          leftCol,
          yPos,
          '🚌 Điểm đi:',
          `${tripInfo.origin.station}\n${tripInfo.origin.address || ''}`,
          darkColor
        );

        yPos += 45;

        // Departure time
        const departureTime = moment(tripInfo.departureTime).tz('Asia/Ho_Chi_Minh');
        this.drawInfoRow(
          doc,
          leftCol,
          yPos,
          '🕐 Giờ đi:',
          departureTime.format('HH:mm, DD/MM/YYYY'),
          darkColor
        );

        yPos += 45;

        // Pickup point
        if (tripInfo.pickupPoint) {
          this.drawInfoRow(
            doc,
            leftCol,
            yPos,
            '📍 Điểm đón:',
            `${tripInfo.pickupPoint.name}\n${tripInfo.pickupPoint.address || ''}`,
            darkColor
          );
        }

        // Right column
        yPos = 360;

        // Destination
        this.drawInfoRow(
          doc,
          rightCol,
          yPos,
          '🏁 Điểm đến:',
          `${tripInfo.destination.station}\n${tripInfo.destination.address || ''}`,
          darkColor
        );

        yPos += 45;

        // Arrival time
        if (tripInfo.arrivalTime) {
          const arrivalTime = moment(tripInfo.arrivalTime).tz('Asia/Ho_Chi_Minh');
          this.drawInfoRow(
            doc,
            rightCol,
            yPos,
            '🕐 Giờ đến (dự kiến):',
            arrivalTime.format('HH:mm, DD/MM/YYYY'),
            darkColor
          );
        }

        yPos += 45;

        // Dropoff point
        if (tripInfo.dropoffPoint) {
          this.drawInfoRow(
            doc,
            rightCol,
            yPos,
            '📍 Điểm trả:',
            `${tripInfo.dropoffPoint.name}\n${tripInfo.dropoffPoint.address || ''}`,
            darkColor
          );
        }

        // Passenger and seat information
        yPos = 530;
        this.drawBox(doc, margin, yPos, contentWidth, 100 + passengers.length * 25, lightGray, borderColor);

        yPos += 20;
        doc
          .fontSize(14)
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .text('THÔNG TIN HÀNH KHÁCH', leftCol, yPos);

        yPos += 30;

        // Passenger list
        passengers.forEach((passenger, index) => {
          doc
            .fontSize(11)
            .fillColor(darkColor)
            .font('Helvetica-Bold')
            .text(`Ghế ${passenger.seatNumber}:`, leftCol, yPos)
            .font('Helvetica')
            .text(passenger.fullName, leftCol + 60, yPos);

          if (passenger.phone) {
            doc.text(`| SĐT: ${passenger.phone}`, leftCol + 200, yPos);
          }

          yPos += 25;
        });

        // Bus information
        yPos += 10;
        doc
          .fontSize(11)
          .fillColor('#64748b')
          .font('Helvetica')
          .text(`Loại xe: ${this.getBusTypeName(tripInfo.busType)} | Biển số: ${tripInfo.busNumber}`, leftCol, yPos);

        // QR Code section
        yPos += 50;

        // Center QR code
        const qrSize = 180;
        const qrX = (pageWidth - qrSize) / 2;

        doc
          .fontSize(14)
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .text('MÃ QR XÁC THỰC', margin, yPos, { align: 'center' });

        yPos += 30;

        // Add QR code image
        if (qrCodeBuffer) {
          doc.image(qrCodeBuffer, qrX, yPos, {
            width: qrSize,
            height: qrSize,
          });
        }

        yPos += qrSize + 20;

        doc
          .fontSize(10)
          .fillColor('#64748b')
          .font('Helvetica')
          .text('Vui lòng xuất trình mã QR này khi lên xe', margin, yPos, { align: 'center' });

        // Footer section
        yPos = doc.page.height - 150;

        // Operator info
        doc
          .fontSize(11)
          .fillColor(darkColor)
          .font('Helvetica-Bold')
          .text('Nhà xe:', leftCol, yPos);

        doc
          .font('Helvetica')
          .text(operator.companyName, leftCol + 60, yPos);

        yPos += 20;

        doc.text('Hotline:', leftCol, yPos);
        doc.text(operator.phone, leftCol + 60, yPos);

        // Pricing info
        yPos -= 20;
        doc
          .font('Helvetica-Bold')
          .text('Tổng tiền:', rightCol, yPos);

        doc
          .fontSize(14)
          .fillColor(primaryColor)
          .text(`${pricing.total.toLocaleString('vi-VN')} VNĐ`, rightCol + 80, yPos);

        // Important notes
        yPos += 50;
        this.drawBox(doc, margin, yPos, contentWidth, 60, '#fef3c7', '#fbbf24');

        doc
          .fontSize(9)
          .fillColor('#92400e')
          .font('Helvetica-Bold')
          .text('LƯU Ý QUAN TRỌNG:', margin + 15, yPos + 10);

        doc
          .font('Helvetica')
          .fontSize(8)
          .text('• Vui lòng có mặt trước 15 phút so với giờ khởi hành', margin + 15, yPos + 25)
          .text('• Xuất trình mã QR này khi lên xe', margin + 15, yPos + 35)
          .text('• Liên hệ nhà xe nếu cần thay đổi hoặc hủy vé', margin + 15, yPos + 45);

        // Footer
        doc
          .fontSize(8)
          .fillColor('#94a3b8')
          .text(
            'QuikRide - Nền tảng đặt vé xe khách trực tuyến',
            margin,
            doc.page.height - 40,
            { align: 'center' }
          );

        doc.text(
          `In lúc: ${moment().tz('Asia/Ho_Chi_Minh').format('HH:mm DD/MM/YYYY')}`,
          margin,
          doc.page.height - 25,
          { align: 'center' }
        );

        // Finalize PDF
        doc.end();

        stream.on('finish', () => {
          logger.success(`PDF ticket generated successfully: ${ticketCode} - ${outputPath}`);
          resolve(outputPath);
        });

        stream.on('error', (error) => {
          logger.error(`PDF generation error for ticket ${ticketCode}: ${error.message}`);
          reject(error);
        });
      } catch (error) {
        logger.error(`PDF generation error: ${error.message}`);
        reject(error);
      }
    });
  }

  /**
   * Draw header with logo
   */
  drawHeader(doc, margin, primaryColor) {
    // Logo and brand (you can add actual logo image later)
    doc
      .fontSize(28)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('QuikRide', margin, 50);

    doc
      .fontSize(10)
      .fillColor('#64748b')
      .font('Helvetica')
      .text('Đặt vé xe khách trực tuyến', margin, 82);

    // Draw line
    doc
      .strokeColor(primaryColor)
      .lineWidth(2)
      .moveTo(margin, 100)
      .lineTo(doc.page.width - margin, 100)
      .stroke();
  }

  /**
   * Draw a box
   */
  drawBox(doc, x, y, width, height, fillColor, strokeColor) {
    doc
      .rect(x, y, width, height)
      .fillAndStroke(fillColor, strokeColor);
  }

  /**
   * Draw information row
   */
  drawInfoRow(doc, x, y, label, value, color) {
    doc
      .fontSize(10)
      .fillColor('#64748b')
      .font('Helvetica-Bold')
      .text(label, x, y);

    doc
      .fontSize(11)
      .fillColor(color)
      .font('Helvetica')
      .text(value, x, y + 15, { width: 200 });
  }

  /**
   * Get bus type display name
   */
  getBusTypeName(type) {
    const types = {
      limousine: 'Limousine',
      sleeper: 'Giường nằm',
      seater: 'Ghế ngồi',
      double_decker: 'Giường nằm 2 tầng',
    };
    return types[type] || type;
  }

  /**
   * Delete PDF file
   */
  async deletePDF(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`PDF deleted: ${filePath}`);
      }
    } catch (error) {
      logger.error(`PDF deletion error: ${error.message}`);
    }
  }
}

export default new PDFService();
