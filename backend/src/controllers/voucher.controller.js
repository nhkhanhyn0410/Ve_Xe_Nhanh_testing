import VoucherService from '../services/voucher.service.js';
import { logger } from '../utils/logger.js';

/**
 * @route   POST /api/v1/vouchers/validate
 * @desc    Validate voucher for booking
 * @access  Public
 */
export const validateVoucher = async (req, res) => {
  try {
    const { code, tripId, totalAmount } = req.body;

    if (!code || !tripId || !totalAmount) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu thông tin bắt buộc',
      });
    }

    const customerId = req.user ? req.user._id : null;

    const validation = await VoucherService.validateForBooking(code, {
      tripId,
      customerId,
      totalAmount,
    });

    res.status(200).json({
      status: 'success',
      data: validation,
      message: 'Voucher hợp lệ',
    });
  } catch (error) {
    logger.error('Validate voucher error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Voucher không hợp lệ',
    });
  }
};

/**
 * @route   GET /api/v1/vouchers/public
 * @desc    Get public vouchers for customers
 * @access  Public
 */
export const getPublicVouchers = async (req, res) => {
  try {
    const { operatorId, routeId } = req.query;

    const vouchers = await VoucherService.getPublicVouchers({
      operatorId,
      routeId,
    });

    res.status(200).json({
      status: 'success',
      data: {
        vouchers,
        total: vouchers.length,
      },
    });
  } catch (error) {
    logger.error('Get public vouchers error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Không thể lấy danh sách voucher',
    });
  }
};

/**
 * @route   POST /api/v1/operators/vouchers
 * @desc    Create new voucher
 * @access  Private (Operator)
 */
export const createVoucher = async (req, res) => {
  try {
    const operatorId = req.user._id;
    const voucherData = { ...req.body, operatorId };

    const voucher = await VoucherService.create(voucherData, operatorId, 'BusOperator');

    res.status(201).json({
      status: 'success',
      data: { voucher },
      message: 'Tạo voucher thành công',
    });
  } catch (error) {
    logger.error('Create voucher error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Không thể tạo voucher',
    });
  }
};

/**
 * @route   GET /api/v1/operators/vouchers
 * @desc    Get operator's vouchers
 * @access  Private (Operator)
 */
export const getOperatorVouchers = async (req, res) => {
  try {
    const operatorId = req.user._id;

    const vouchers = await VoucherService.getByOperator(operatorId);

    res.status(200).json({
      status: 'success',
      data: {
        vouchers,
        total: vouchers.length,
      },
    });
  } catch (error) {
    logger.error('Get operator vouchers error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Không thể lấy danh sách voucher',
    });
  }
};

/**
 * @route   GET /api/v1/operators/vouchers/:id
 * @desc    Get voucher details
 * @access  Private (Operator)
 */
export const getVoucherById = async (req, res) => {
  try {
    const { id } = req.params;

    const voucher = await VoucherService.getById(id);

    // Verify ownership
    if (voucher.operatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Không có quyền truy cập voucher này',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { voucher },
    });
  } catch (error) {
    logger.error('Get voucher error:', error);
    res.status(404).json({
      status: 'error',
      message: error.message || 'Không tìm thấy voucher',
    });
  }
};

/**
 * @route   PUT /api/v1/operators/vouchers/:id
 * @desc    Update voucher
 * @access  Private (Operator)
 */
export const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership first
    const existingVoucher = await VoucherService.getById(id);
    if (existingVoucher.operatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Không có quyền cập nhật voucher này',
      });
    }

    const voucher = await VoucherService.update(id, req.body);

    res.status(200).json({
      status: 'success',
      data: { voucher },
      message: 'Cập nhật voucher thành công',
    });
  } catch (error) {
    logger.error('Update voucher error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Không thể cập nhật voucher',
    });
  }
};

/**
 * @route   DELETE /api/v1/operators/vouchers/:id
 * @desc    Delete voucher
 * @access  Private (Operator)
 */
export const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership first
    const existingVoucher = await VoucherService.getById(id);
    if (existingVoucher.operatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Không có quyền xóa voucher này',
      });
    }

    await VoucherService.delete(id);

    res.status(200).json({
      status: 'success',
      message: 'Xóa voucher thành công',
    });
  } catch (error) {
    logger.error('Delete voucher error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Không thể xóa voucher',
    });
  }
};

/**
 * @route   PUT /api/v1/operators/vouchers/:id/deactivate
 * @desc    Deactivate voucher
 * @access  Private (Operator)
 */
export const deactivateVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership first
    const existingVoucher = await VoucherService.getById(id);
    if (existingVoucher.operatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Không có quyền vô hiệu hóa voucher này',
      });
    }

    const voucher = await VoucherService.deactivate(id);

    res.status(200).json({
      status: 'success',
      data: { voucher },
      message: 'Vô hiệu hóa voucher thành công',
    });
  } catch (error) {
    logger.error('Deactivate voucher error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Không thể vô hiệu hóa voucher',
    });
  }
};

/**
 * @route   PUT /api/v1/operators/vouchers/:id/activate
 * @desc    Activate voucher
 * @access  Private (Operator)
 */
export const activateVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership first
    const existingVoucher = await VoucherService.getById(id);
    if (existingVoucher.operatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Không có quyền kích hoạt voucher này',
      });
    }

    const voucher = await VoucherService.activate(id);

    res.status(200).json({
      status: 'success',
      data: { voucher },
      message: 'Kích hoạt voucher thành công',
    });
  } catch (error) {
    logger.error('Activate voucher error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Không thể kích hoạt voucher',
    });
  }
};

/**
 * @route   GET /api/v1/operators/vouchers/statistics
 * @desc    Get voucher statistics
 * @access  Private (Operator)
 */
export const getVoucherStatistics = async (req, res) => {
  try {
    const operatorId = req.user._id;

    const stats = await VoucherService.getStatistics(operatorId);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    logger.error('Get voucher statistics error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Không thể lấy thống kê',
    });
  }
};

/**
 * @route   GET /api/v1/operators/vouchers/:id/usage-report
 * @desc    Get detailed voucher usage report
 * @access  Private (Operator)
 */
export const getVoucherUsageReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    // Verify ownership first
    const existingVoucher = await VoucherService.getById(id);
    if (existingVoucher.operatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Không có quyền xem báo cáo voucher này',
      });
    }

    const report = await VoucherService.getUsageReport(id, {
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      status: 'success',
      data: report,
    });
  } catch (error) {
    logger.error('Get voucher usage report error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Không thể lấy báo cáo sử dụng voucher',
    });
  }
};