import Booking from '../models/Booking.js';
import Trip from '../models/Trip.js';
import Route from '../models/Route.js';
import Payment from '../models/Payment.js';

import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import moment from 'moment-timezone';
import mongoose from 'mongoose';

import { logger } from '../utils/logger.js';


/**
 * Revenue Report Service
 * Handles revenue analytics and report generation
 */

class ReportService {
  /**
   * Get comprehensive revenue report
   * @param {String} operatorId - Operator ID
   * @param {Object} filters - Date range and other filters
   * @returns {Object} Revenue report data
   */
  async getRevenueReport(operatorId, filters = {}) {
    try {
      const { startDate, endDate, routeId, format } = filters;

      // Default date range: current month
      const start = startDate
        ? moment(startDate).startOf('day').toDate()
        : moment().startOf('month').toDate();
      const end = endDate
        ? moment(endDate).endOf('day').toDate()
        : moment().endOf('month').toDate();

      // Build query
      const query = {
        operatorId,
        status: { $in: ['confirmed', 'completed'] },
        createdAt: { $gte: start, $lte: end },
      };

      if (routeId) {
        // Get all trips for this route
        const trips = await Trip.find({ routeId, operatorId }).select('_id');
        const tripIds = trips.map((trip) => trip._id);
        query.tripId = { $in: tripIds };
      }

      // Get all bookings
      const bookings = await Booking.find(query)
        .populate('tripId', 'departureTime routeId')
        .populate({
          path: 'tripId',
          populate: {
            path: 'routeId',
            select: 'routeName origin destination',
          },
        })
        .lean();

      // Calculate total revenue
      const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.finalPrice || 0), 0);

      // Calculate total bookings
      const totalBookings = bookings.length;

      // Calculate total tickets (seats)
      const totalTickets = bookings.reduce((sum, booking) => sum + booking.seats.length, 0);

      // Calculate average booking value
      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Revenue breakdown by route
      const revenueByRoute = await this.getRevenueByRoute(bookings);

      // Top performing routes
      const topRoutes = revenueByRoute
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Revenue by payment method
      const revenueByPaymentMethod = await this.getRevenueByPaymentMethod(
        bookings.map((b) => b._id),
        start,
        end
      );

      // Revenue trend (daily breakdown)
      const revenueTrend = await this.getRevenueTrend(bookings, start, end);

      // Cancellation report
      const cancellationReport = await this.getCancellationReport(operatorId, start, end);

      // Growth metrics
      const growthMetrics = await this.getGrowthMetrics(operatorId, start, end);

      const report = {
        summary: {
          totalRevenue,
          totalBookings,
          totalTickets,
          averageBookingValue,
          period: {
            start,
            end,
          },
        },
        revenueByRoute,
        topRoutes,
        revenueByPaymentMethod,
        revenueTrend,
        cancellationReport,
        growthMetrics,
        generatedAt: new Date(),
      };

      return report;
    } catch (error) {
      logger.error('Get revenue report error:', error);
      throw new Error('Không thể tạo báo cáo doanh thu');
    }
  }

  /**
   * Calculate revenue breakdown by route
   * @param {Array} bookings - Bookings array
   * @returns {Array} Revenue by route
   */
  async getRevenueByRoute(bookings) {
    const routeMap = new Map();

    bookings.forEach((booking) => {
      if (!booking.tripId || !booking.tripId.routeId) return;

      const route = booking.tripId.routeId;
      const routeId = route._id.toString();
      const routeName = route.routeName || `${route.origin?.city} - ${route.destination?.city}`;

      if (!routeMap.has(routeId)) {
        routeMap.set(routeId, {
          routeId,
          routeName,
          origin: route.origin?.city || 'N/A',
          destination: route.destination?.city || 'N/A',
          revenue: 0,
          bookings: 0,
          tickets: 0,
        });
      }

      const routeData = routeMap.get(routeId);
      routeData.revenue += booking.finalPrice || 0;
      routeData.bookings += 1;
      routeData.tickets += booking.seats.length;
    });

    return Array.from(routeMap.values());
  }

  /**
   * Get revenue breakdown by payment method
   * @param {Array} bookingIds - Booking IDs
   * @param {Date} start - Start date
   * @param {Date} end - End date
   * @returns {Array} Revenue by payment method
   */
  async getRevenueByPaymentMethod(bookingIds, start, end) {
    try {
      const payments = await Payment.aggregate([
        {
          $match: {
            bookingId: { $in: bookingIds },
            status: 'completed',
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: '$paymentMethod',
            totalRevenue: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            paymentMethod: '$_id',
            revenue: '$totalRevenue',
            count: '$count',
            _id: 0,
          },
        },
        {
          $sort: { revenue: -1 },
        },
      ]);

      return payments;
    } catch (error) {
      logger.error('Get revenue by payment method error:', error);
      return [];
    }
  }

  /**
   * Get revenue trend (daily breakdown)
   * @param {Array} bookings - Bookings array
   * @param {Date} start - Start date
   * @param {Date} end - End date
   * @returns {Array} Daily revenue data
   */
  async getRevenueTrend(bookings, start, end) {
    const trend = [];
    const dailyMap = new Map();

    bookings.forEach((booking) => {
      const date = moment(booking.createdAt).format('YYYY-MM-DD');

      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          revenue: 0,
          bookings: 0,
          tickets: 0,
        });
      }

      const dailyData = dailyMap.get(date);
      dailyData.revenue += booking.finalPrice || 0;
      dailyData.bookings += 1;
      dailyData.tickets += booking.seats.length;
    });

    // Fill in missing dates with zero values
    let currentDate = moment(start);
    const endDate = moment(end);

    while (currentDate.isSameOrBefore(endDate)) {
      const dateStr = currentDate.format('YYYY-MM-DD');

      if (dailyMap.has(dateStr)) {
        trend.push(dailyMap.get(dateStr));
      } else {
        trend.push({
          date: dateStr,
          revenue: 0,
          bookings: 0,
          tickets: 0,
        });
      }

      currentDate.add(1, 'day');
    }

    return trend;
  }

  /**
   * Get cancellation report
   * @param {String} operatorId - Operator ID
   * @param {Date} start - Start date
   * @param {Date} end - End date
   * @returns {Object} Cancellation statistics
   */
  async getCancellationReport(operatorId, start, end) {
    try {
      const totalBookings = await Booking.countDocuments({
        operatorId,
        createdAt: { $gte: start, $lte: end },
      });

      const cancelledBookings = await Booking.find({
        operatorId,
        status: { $in: ['cancelled', 'refunded'] },
        createdAt: { $gte: start, $lte: end },
      }).lean();

      const totalCancelled = cancelledBookings.length;
      const cancellationRate = totalBookings > 0 ? (totalCancelled / totalBookings) * 100 : 0;

      // Calculate refunded amount
      const totalRefunded = cancelledBookings.reduce(
        (sum, booking) => sum + (booking.refundAmount || 0),
        0
      );

      // Cancellations by route
      const cancellationsByRoute = await Booking.aggregate([
        {
          $match: {
            operatorId: new mongoose.Types.ObjectId(operatorId),
            status: { $in: ['cancelled', 'refunded'] },
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $lookup: {
            from: 'trips',
            localField: 'tripId',
            foreignField: '_id',
            as: 'trip',
          },
        },
        {
          $unwind: '$trip',
        },
        {
          $lookup: {
            from: 'routes',
            localField: 'trip.routeId',
            foreignField: '_id',
            as: 'route',
          },
        },
        {
          $unwind: '$route',
        },
        {
          $group: {
            _id: '$trip.routeId',
            routeName: { $first: '$route.routeName' },
            count: { $sum: 1 },
            refundedAmount: { $sum: '$refundAmount' },
          },
        },
        {
          $project: {
            routeId: '$_id',
            routeName: 1,
            count: 1,
            refundedAmount: 1,
            _id: 0,
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 10,
        },
      ]);

      return {
        totalBookings,
        totalCancelled,
        cancellationRate: parseFloat(cancellationRate.toFixed(2)),
        totalRefunded,
        cancellationsByRoute,
      };
    } catch (error) {
      logger.error('Get cancellation report error:', error);
      return {
        totalBookings: 0,
        totalCancelled: 0,
        cancellationRate: 0,
        totalRefunded: 0,
        cancellationsByRoute: [],
      };
    }
  }

  /**
   * Get growth metrics (compare with previous period)
   * @param {String} operatorId - Operator ID
   * @param {Date} start - Start date
   * @param {Date} end - End date
   * @returns {Object} Growth statistics
   */
  async getGrowthMetrics(operatorId, start, end) {
    try {
      const periodDuration = moment(end).diff(moment(start), 'days') + 1;

      // Previous period dates
      const prevStart = moment(start).subtract(periodDuration, 'days').toDate();
      const prevEnd = moment(start).subtract(1, 'day').toDate();

      // Current period revenue
      const currentPeriodBookings = await Booking.find({
        operatorId,
        status: { $in: ['confirmed', 'completed'] },
        createdAt: { $gte: start, $lte: end },
      }).lean();

      const currentRevenue = currentPeriodBookings.reduce(
        (sum, b) => sum + (b.finalPrice || 0),
        0
      );
      const currentBookings = currentPeriodBookings.length;

      // Previous period revenue
      const previousPeriodBookings = await Booking.find({
        operatorId,
        status: { $in: ['confirmed', 'completed'] },
        createdAt: { $gte: prevStart, $lte: prevEnd },
      }).lean();

      const previousRevenue = previousPeriodBookings.reduce(
        (sum, b) => sum + (b.finalPrice || 0),
        0
      );
      const previousBookings = previousPeriodBookings.length;

      // Calculate growth
      const revenueGrowth =
        previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      const bookingGrowth =
        previousBookings > 0
          ? ((currentBookings - previousBookings) / previousBookings) * 100
          : 0;

      return {
        current: {
          revenue: currentRevenue,
          bookings: currentBookings,
        },
        previous: {
          revenue: previousRevenue,
          bookings: previousBookings,
        },
        growth: {
          revenue: parseFloat(revenueGrowth.toFixed(2)),
          bookings: parseFloat(bookingGrowth.toFixed(2)),
        },
      };
    } catch (error) {
      logger.error('Get growth metrics error:', error);
      return {
        current: { revenue: 0, bookings: 0 },
        previous: { revenue: 0, bookings: 0 },
        growth: { revenue: 0, bookings: 0 },
      };
    }
  }

  /**
   * Export report to Excel
   * @param {Object} reportData - Report data
   * @returns {Buffer} Excel file buffer
   */
  async exportToExcel(reportData) {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'QuikRide';
      workbook.created = new Date();

      // Summary sheet
      const summarySheet = workbook.addWorksheet('Tổng Quan');
      summarySheet.columns = [
        { header: 'Chỉ số', key: 'metric', width: 30 },
        { header: 'Giá trị', key: 'value', width: 30 },
      ];

      summarySheet.addRows([
        { metric: 'Tổng Doanh Thu', value: this.formatCurrency(reportData.summary.totalRevenue) },
        { metric: 'Tổng Số Đặt Vé', value: reportData.summary.totalBookings },
        { metric: 'Tổng Số Vé', value: reportData.summary.totalTickets },
        {
          metric: 'Giá Trị Đặt Vé Trung Bình',
          value: this.formatCurrency(reportData.summary.averageBookingValue),
        },
        {
          metric: 'Thời Gian Báo Cáo',
          value: `${moment(reportData.summary.period.start).format('DD/MM/YYYY')} - ${moment(reportData.summary.period.end).format('DD/MM/YYYY')}`,
        },
      ]);

      // Style header
      summarySheet.getRow(1).font = { bold: true };
      summarySheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0EA5E9' },
      };

      // Revenue by route sheet
      const routeSheet = workbook.addWorksheet('Doanh Thu Theo Tuyến');
      routeSheet.columns = [
        { header: 'Tên Tuyến', key: 'routeName', width: 30 },
        { header: 'Điểm Đi', key: 'origin', width: 20 },
        { header: 'Điểm Đến', key: 'destination', width: 20 },
        { header: 'Doanh Thu', key: 'revenue', width: 20 },
        { header: 'Số Đặt Vé', key: 'bookings', width: 15 },
        { header: 'Số Vé', key: 'tickets', width: 15 },
      ];

      reportData.revenueByRoute.forEach((route) => {
        routeSheet.addRow({
          routeName: route.routeName,
          origin: route.origin,
          destination: route.destination,
          revenue: this.formatCurrency(route.revenue),
          bookings: route.bookings,
          tickets: route.tickets,
        });
      });

      routeSheet.getRow(1).font = { bold: true };
      routeSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0EA5E9' },
      };

      // Revenue trend sheet
      const trendSheet = workbook.addWorksheet('Xu Hướng Doanh Thu');
      trendSheet.columns = [
        { header: 'Ngày', key: 'date', width: 15 },
        { header: 'Doanh Thu', key: 'revenue', width: 20 },
        { header: 'Số Đặt Vé', key: 'bookings', width: 15 },
        { header: 'Số Vé', key: 'tickets', width: 15 },
      ];

      reportData.revenueTrend.forEach((day) => {
        trendSheet.addRow({
          date: moment(day.date).format('DD/MM/YYYY'),
          revenue: this.formatCurrency(day.revenue),
          bookings: day.bookings,
          tickets: day.tickets,
        });
      });

      trendSheet.getRow(1).font = { bold: true };
      trendSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0EA5E9' },
      };

      // Cancellation report sheet
      const cancellationSheet = workbook.addWorksheet('Báo Cáo Hủy Vé');
      cancellationSheet.columns = [
        { header: 'Chỉ số', key: 'metric', width: 30 },
        { header: 'Giá trị', key: 'value', width: 30 },
      ];

      cancellationSheet.addRows([
        { metric: 'Tổng Số Đặt Vé', value: reportData.cancellationReport.totalBookings },
        { metric: 'Tổng Số Vé Bị Hủy', value: reportData.cancellationReport.totalCancelled },
        { metric: 'Tỷ Lệ Hủy (%)', value: reportData.cancellationReport.cancellationRate },
        {
          metric: 'Tổng Số Tiền Hoàn',
          value: this.formatCurrency(reportData.cancellationReport.totalRefunded),
        },
      ]);

      cancellationSheet.getRow(1).font = { bold: true };
      cancellationSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0EA5E9' },
      };

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    } catch (error) {
      logger.error('Export to Excel error:', error);
      throw new Error('Không thể xuất báo cáo Excel');
    }
  }

  /**
   * Export report to PDF
   * @param {Object} reportData - Report data
   * @returns {Promise<Buffer>} PDF file buffer
   */
  async exportToPDF(reportData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Title
        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .text('BÁO CÁO DOANH THU', { align: 'center' });

        doc.moveDown();

        // Period
        doc
          .fontSize(12)
          .font('Helvetica')
          .text(
            `Thời gian: ${moment(reportData.summary.period.start).format('DD/MM/YYYY')} - ${moment(reportData.summary.period.end).format('DD/MM/YYYY')}`,
            { align: 'center' }
          );

        doc.moveDown(2);

        // Summary section
        doc.fontSize(16).font('Helvetica-Bold').text('TỔNG QUAN', { underline: true });
        doc.moveDown();

        doc.fontSize(12).font('Helvetica');
        doc.text(`Tổng Doanh Thu: ${this.formatCurrency(reportData.summary.totalRevenue)}`);
        doc.text(`Tổng Số Đặt Vé: ${reportData.summary.totalBookings}`);
        doc.text(`Tổng Số Vé: ${reportData.summary.totalTickets}`);
        doc.text(
          `Giá Trị Đặt Vé Trung Bình: ${this.formatCurrency(reportData.summary.averageBookingValue)}`
        );

        doc.moveDown(2);

        // Top routes section
        doc.fontSize(16).font('Helvetica-Bold').text('TOP TUYẾN ĐƯỜNG DOANH THU CAO', {
          underline: true,
        });
        doc.moveDown();

        doc.fontSize(10).font('Helvetica');
        reportData.topRoutes.slice(0, 5).forEach((route, index) => {
          doc.text(
            `${index + 1}. ${route.routeName}: ${this.formatCurrency(route.revenue)} (${route.bookings} đặt vé, ${route.tickets} vé)`
          );
        });

        doc.moveDown(2);

        // Cancellation report section
        doc.fontSize(16).font('Helvetica-Bold').text('BÁO CÁO HỦY VÉ', { underline: true });
        doc.moveDown();

        doc.fontSize(12).font('Helvetica');
        doc.text(`Tổng Số Đặt Vé: ${reportData.cancellationReport.totalBookings}`);
        doc.text(`Tổng Số Vé Bị Hủy: ${reportData.cancellationReport.totalCancelled}`);
        doc.text(`Tỷ Lệ Hủy: ${reportData.cancellationReport.cancellationRate}%`);
        doc.text(
          `Tổng Số Tiền Hoàn: ${this.formatCurrency(reportData.cancellationReport.totalRefunded)}`
        );

        doc.moveDown(2);

        // Growth metrics section
        if (reportData.growthMetrics) {
          doc.fontSize(16).font('Helvetica-Bold').text('CHỈ SỐ TĂNG TRƯỞNG', { underline: true });
          doc.moveDown();

          doc.fontSize(12).font('Helvetica');
          doc.text(
            `Tăng Trưởng Doanh Thu: ${reportData.growthMetrics.growth.revenue > 0 ? '+' : ''}${reportData.growthMetrics.growth.revenue}%`
          );
          doc.text(
            `Tăng Trưởng Đặt Vé: ${reportData.growthMetrics.growth.bookings > 0 ? '+' : ''}${reportData.growthMetrics.growth.bookings}%`
          );
        }

        doc.moveDown(3);

        // Footer
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`Báo cáo được tạo: ${moment().format('DD/MM/YYYY HH:mm:ss')}`, {
            align: 'center',
          });

        doc.end();
      } catch (error) {
        logger.error('Export to PDF error:', error);
        reject(new Error('Không thể xuất báo cáo PDF'));
      }
    });
  }

  /**
   * Format currency (VND)
   * @param {Number} amount - Amount to format
   * @returns {String} Formatted currency
   */
  formatCurrency(amount) {
    if (!amount) return '0 ₫';
    return `${Math.round(amount).toLocaleString('vi-VN')} ₫`;
  }
}

export default new ReportService();

