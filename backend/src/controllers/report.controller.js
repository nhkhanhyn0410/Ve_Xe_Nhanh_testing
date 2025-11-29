const ReportService = require('../services/report.service');
const logger = require('../utils/logger');

/**
 * Report Controller
 * Handles revenue reports and analytics
 */

/**
 * @route   GET /api/v1/operators/reports/revenue
 * @desc    Get comprehensive revenue report
 * @access  Private (Operator)
 * @query   startDate, endDate, routeId, format (json/excel/pdf)
 */
exports.getRevenueReport = async (req, res, next) => {
  try {
    const operatorId = req.userId; // From authenticate middleware
    const { startDate, endDate, routeId, format } = req.query;

    // Validate date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        return res.status(400).json({
          success: false,
          message: 'Ngày bắt đầu phải trước ngày kết thúc',
        });
      }
    }

    // Get report data
    const reportData = await ReportService.getRevenueReport(operatorId, {
      startDate,
      endDate,
      routeId,
    });

    // Handle different export formats
    if (format === 'excel') {
      const excelBuffer = await ReportService.exportToExcel(reportData);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=revenue-report-${Date.now()}.xlsx`
      );
      return res.send(excelBuffer);
    }

    if (format === 'pdf') {
      const pdfBuffer = await ReportService.exportToPDF(reportData);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=revenue-report-${Date.now()}.pdf`);
      return res.send(pdfBuffer);
    }

    // Default: JSON response
    res.status(200).json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    logger.error('Lỗi lấy báo cáo doanh thu:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể tạo báo cáo doanh thu',
    });
  }
};

/**
 * @route   GET /api/v1/operators/reports/revenue/summary
 * @desc    Get quick revenue summary (lightweight version)
 * @access  Private (Operator)
 * @query   startDate, endDate
 */
exports.getRevenueSummary = async (req, res, next) => {
  try {
    const operatorId = req.userId;
    const { startDate, endDate } = req.query;

    const reportData = await ReportService.getRevenueReport(operatorId, {
      startDate,
      endDate,
    });

    // Return only summary and top routes
    res.status(200).json({
      success: true,
      data: {
        summary: reportData.summary,
        topRoutes: reportData.topRoutes.slice(0, 5),
        cancellationRate: reportData.cancellationReport.cancellationRate,
        growth: reportData.growthMetrics.growth,
      },
    });
  } catch (error) {
    logger.error('Lỗi lấy tóm tắt doanh thu:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể tải tóm tắt doanh thu',
    });
  }
};

/**
 * @route   GET /api/v1/operators/reports/revenue/by-route
 * @desc    Get revenue breakdown by route
 * @access  Private (Operator)
 * @query   startDate, endDate
 */
exports.getRevenueByRoute = async (req, res, next) => {
  try {
    const operatorId = req.userId;
    const { startDate, endDate } = req.query;

    const reportData = await ReportService.getRevenueReport(operatorId, {
      startDate,
      endDate,
    });

    res.status(200).json({
      success: true,
      data: {
        revenueByRoute: reportData.revenueByRoute,
        topRoutes: reportData.topRoutes,
      },
    });
  } catch (error) {
    logger.error('Lỗi lấy doanh thu theo tuyến:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể tải doanh thu theo tuyến',
    });
  }
};

/**
 * @route   GET /api/v1/operators/reports/revenue/trend
 * @desc    Get revenue trend (daily breakdown)
 * @access  Private (Operator)
 * @query   startDate, endDate
 */
exports.getRevenueTrend = async (req, res, next) => {
  try {
    const operatorId = req.userId;
    const { startDate, endDate } = req.query;

    const reportData = await ReportService.getRevenueReport(operatorId, {
      startDate,
      endDate,
    });

    res.status(200).json({
      success: true,
      data: {
        revenueTrend: reportData.revenueTrend,
        summary: {
          totalRevenue: reportData.summary.totalRevenue,
          averageDaily:
            reportData.revenueTrend.length > 0
              ? reportData.summary.totalRevenue / reportData.revenueTrend.length
              : 0,
        },
      },
    });
  } catch (error) {
    logger.error('Lỗi lấy xu hướng doanh thu:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể tải xu hướng doanh thu',
    });
  }
};

/**
 * @route   GET /api/v1/operators/reports/cancellation
 * @desc    Get cancellation report
 * @access  Private (Operator)
 * @query   startDate, endDate
 */
exports.getCancellationReport = async (req, res, next) => {
  try {
    const operatorId = req.userId;
    const { startDate, endDate } = req.query;

    const reportData = await ReportService.getRevenueReport(operatorId, {
      startDate,
      endDate,
    });

    res.status(200).json({
      success: true,
      data: {
        cancellationReport: reportData.cancellationReport,
      },
    });
  } catch (error) {
    logger.error('Lỗi lấy báo cáo hủy:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể tải báo cáo hủy vé',
    });
  }
};

/**
 * @route   GET /api/v1/operators/reports/growth
 * @desc    Get growth metrics
 * @access  Private (Operator)
 * @query   startDate, endDate
 */
exports.getGrowthMetrics = async (req, res, next) => {
  try {
    const operatorId = req.userId;
    const { startDate, endDate } = req.query;

    const reportData = await ReportService.getRevenueReport(operatorId, {
      startDate,
      endDate,
    });

    res.status(200).json({
      success: true,
      data: {
        growthMetrics: reportData.growthMetrics,
      },
    });
  } catch (error) {
    logger.error('Lỗi lấy số liệu tăng trưởng:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể tải chỉ số tăng trưởng',
    });
  }
};
