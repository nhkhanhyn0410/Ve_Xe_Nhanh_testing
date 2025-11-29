const BusService = require('../services/bus.service');
const logger = require('../utils/logger');
const {
  listAllTemplates,
  getTemplatesByBusType,
  getTemplate,
  buildCustomTemplate,
} = require('../utils/seatLayoutTemplates');
const { validateSeatLayoutForBusType } = require('../utils/seatLayout');

/**
 * Bus Controller
 * Xử lý các HTTP requests liên quan đến buses
 */

/**
 * @route   POST /api/v1/operators/buses
 * @desc    Tạo xe mới
 * @access  Private (Operator)
 */
exports.create = async (req, res, next) => {
  try {
    const operatorId = req.userId; // Từ authenticate middleware
    const busData = req.body;

    // Validate required fields
    const requiredFields = ['busNumber', 'busType', 'seatLayout'];

    const missingFields = requiredFields.filter((field) => !busData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Thiếu các trường bắt buộc: ${missingFields.join(', ')}`,
      });
    }

    // Validate seat layout required fields
    if (!busData.seatLayout.floors || !busData.seatLayout.rows || !busData.seatLayout.columns || !busData.seatLayout.layout) {
      return res.status(400).json({
        status: 'error',
        message: 'Cấu hình ghế phải bao gồm: floors, rows, columns, layout',
      });
    }

    const bus = await BusService.create(operatorId, busData);

    res.status(201).json({
      status: 'success',
      message: 'Tạo xe thành công',
      data: {
        bus,
      },
    });
  } catch (error) {
    logger.error('Lỗi tạo xe xe bus:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Tạo xe thất bại',
    });
  }
};

/**
 * @route   GET /api/v1/operators/buses
 * @desc    Lấy danh sách buses của operator
 * @access  Private (Operator)
 */
exports.getMyBuses = async (req, res, next) => {
  try {
    const operatorId = req.userId;
    const { status, busType, search, page, limit, sortBy, sortOrder } = req.query;

    const filters = {
      status,
      busType,
      search,
    };

    const options = {
      page,
      limit,
      sortBy,
      sortOrder,
    };

    const result = await BusService.getByOperator(operatorId, filters, options);

    res.status(200).json({
      status: 'success',
      data: {
        buses: result.buses,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    logger.error('Lỗi lấy xe xe bus:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Lấy danh sách xe thất bại',
    });
  }
};

/**
 * @route   GET /api/v1/operators/buses/:id
 * @desc    Lấy thông tin bus theo ID
 * @access  Private (Operator)
 */
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const operatorId = req.userId;

    const bus = await BusService.getById(id, operatorId);

    res.status(200).json({
      status: 'success',
      data: {
        bus,
      },
    });
  } catch (error) {
    logger.error('Lỗi lấy xe xe bus:', error);
    res.status(404).json({
      status: 'error',
      message: error.message || 'Không tìm thấy xe',
    });
  }
};

/**
 * @route   PUT /api/v1/operators/buses/:id
 * @desc    Cập nhật bus
 * @access  Private (Operator)
 */
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const operatorId = req.userId;
    const updateData = req.body;

    const bus = await BusService.update(id, operatorId, updateData);

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật xe thành công',
      data: {
        bus,
      },
    });
  } catch (error) {
    logger.error('Lỗi cập nhật xe xe bus:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Cập nhật xe thất bại',
    });
  }
};

/**
 * @route   DELETE /api/v1/operators/buses/:id
 * @desc    Xóa bus (soft delete - retire)
 * @access  Private (Operator)
 */
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const operatorId = req.userId;

    await BusService.delete(id, operatorId);

    res.status(200).json({
      status: 'success',
      message: 'Xóa xe thành công',
    });
  } catch (error) {
    logger.error('Lỗi xóa xe xe bus:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Xóa xe thất bại',
    });
  }
};

/**
 * @route   PUT /api/v1/operators/buses/:id/status
 * @desc    Thay đổi trạng thái bus
 * @access  Private (Operator)
 */
exports.changeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const operatorId = req.userId;

    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Trạng thái là bắt buộc',
      });
    }

    const bus = await BusService.changeStatus(id, operatorId, status);

    res.status(200).json({
      status: 'success',
      message: 'Thay đổi trạng thái xe thành công',
      data: {
        bus,
      },
    });
  } catch (error) {
    logger.error('Lỗi thay đổi trạng thái xe xe bus:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Thay đổi trạng thái xe thất bại',
    });
  }
};

/**
 * @route   GET /api/v1/operators/buses/statistics
 * @desc    Lấy thống kê buses
 * @access  Private (Operator)
 */
exports.getStatistics = async (req, res, next) => {
  try {
    const operatorId = req.userId;

    const statistics = await BusService.getStatistics(operatorId);

    res.status(200).json({
      status: 'success',
      data: {
        statistics,
      },
    });
  } catch (error) {
    logger.error('Lỗi lấy thống kê xe xe bus:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Lấy thống kê xe thất bại',
    });
  }
};

/**
 * @route   GET /api/v1/buses/search
 * @desc    Tìm kiếm buses (public)
 * @access  Public
 */
exports.search = async (req, res, next) => {
  try {
    const { busType, operatorId, minSeats, maxSeats, amenities, page, limit, sortBy, sortOrder } = req.query;

    const filters = {
      busType,
      operatorId,
      minSeats,
      maxSeats,
      amenities: amenities ? amenities.split(',') : undefined,
    };

    const options = {
      page,
      limit,
      sortBy,
      sortOrder,
    };

    const result = await BusService.search(filters, options);

    res.status(200).json({
      status: 'success',
      data: {
        buses: result.buses,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    logger.error('Lỗi tìm kiếm xe xe bus:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Tìm kiếm xe thất bại',
    });
  }
};

/**
 * @route   GET /api/v1/buses/seat-layout/templates
 * @desc    Lấy danh sách tất cả templates sơ đồ ghế
 * @access  Public
 */
exports.getAllSeatLayoutTemplates = async (req, res, next) => {
  try {
    const templates = listAllTemplates();

    res.status(200).json({
      status: 'success',
      data: {
        templates,
        total: templates.length,
      },
    });
  } catch (error) {
    logger.error('Lỗi lấy mẫu bố cục ghế:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Lấy danh sách templates thất bại',
    });
  }
};

/**
 * @route   GET /api/v1/buses/seat-layout/templates/:busType
 * @desc    Lấy templates cho loại xe cụ thể
 * @access  Public
 */
exports.getTemplatesByType = async (req, res, next) => {
  try {
    const { busType } = req.params;

    const validBusTypes = ['seater', 'sleeper', 'limousine', 'double_decker'];
    if (!validBusTypes.includes(busType)) {
      return res.status(400).json({
        status: 'error',
        message: `Loại xe không hợp lệ. Chỉ chấp nhận: ${validBusTypes.join(', ')}`,
      });
    }

    const templates = getTemplatesByBusType(busType);

    res.status(200).json({
      status: 'success',
      data: {
        busType,
        templates,
      },
    });
  } catch (error) {
    logger.error('Lỗi lấy mẫu theo loại:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Lấy templates thất bại',
    });
  }
};

/**
 * @route   GET /api/v1/buses/seat-layout/templates/:busType/:templateKey
 * @desc    Lấy template cụ thể
 * @access  Public
 */
exports.getSpecificTemplate = async (req, res, next) => {
  try {
    const { busType, templateKey } = req.params;

    const template = getTemplate(busType, templateKey);

    if (!template) {
      return res.status(404).json({
        status: 'error',
        message: 'Template không tồn tại',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        template,
      },
    });
  } catch (error) {
    logger.error('Lỗi lấy mẫu cụ thể:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Lấy template thất bại',
    });
  }
};

/**
 * @route   POST /api/v1/buses/seat-layout/build
 * @desc    Tạo sơ đồ ghế tùy chỉnh
 * @access  Public
 */
exports.buildSeatLayout = async (req, res, next) => {
  try {
    const { busType, rows, columns, floors, pattern, emptyPositions } = req.body;

    // Validate required fields
    if (!busType || !rows || !columns) {
      return res.status(400).json({
        status: 'error',
        message: 'busType, rows và columns là bắt buộc',
      });
    }

    const template = buildCustomTemplate({
      busType,
      rows: Number(rows),
      columns: Number(columns),
      floors: floors ? Number(floors) : 1,
      pattern,
      emptyPositions: emptyPositions || [],
    });

    res.status(200).json({
      status: 'success',
      message: 'Tạo sơ đồ ghế thành công',
      data: {
        seatLayout: template,
      },
    });
  } catch (error) {
    logger.error('Lỗi xây dựng bố cục ghế:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Tạo sơ đồ ghế thất bại',
    });
  }
};

/**
 * @route   POST /api/v1/buses/seat-layout/validate
 * @desc    Validate sơ đồ ghế
 * @access  Public
 */
exports.validateSeatLayout = async (req, res, next) => {
  try {
    const { seatLayout, busType } = req.body;

    if (!seatLayout || !busType) {
      return res.status(400).json({
        status: 'error',
        message: 'seatLayout và busType là bắt buộc',
      });
    }

    const validation = validateSeatLayoutForBusType(seatLayout, busType);

    res.status(200).json({
      status: 'success',
      data: {
        valid: validation.valid,
        errors: validation.errors,
      },
    });
  } catch (error) {
    logger.error('Lỗi xác thực bố cục ghế:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Validate sơ đồ ghế thất bại',
    });
  }
};
