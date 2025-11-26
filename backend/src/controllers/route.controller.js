import RouteService from '../services/route.service.js';
import { logger } from '../utils/logger.js';

/**
 * Route Controller
 * Xử lý các HTTP requests liên quan đến routes
 */

/**
 * @route   POST /api/v1/operators/routes
 * @desc    Tạo tuyến đường mới
 * @access  Private (Operator)
 */
export const create = async (req, res, next) => {
  try {
    const operatorId = req.userId; // Từ authenticate middleware
    const routeData = req.body;

    // Validate required fields
    const requiredFields = [
      'routeCode',
      'origin',
      'destination',
      'distance',
      'estimatedDuration',
    ];

    const missingFields = requiredFields.filter((field) => !routeData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Thiếu các trường bắt buộc: ${missingFields.join(', ')}`,
      });
    }

    // Validate origin and destination
    if (!routeData.origin.city || !routeData.origin.province) {
      return res.status(400).json({
        status: 'error',
        message: 'Điểm đi phải có thành phố và tỉnh',
      });
    }

    if (!routeData.destination.city || !routeData.destination.province) {
      return res.status(400).json({
        status: 'error',
        message: 'Điểm đến phải có thành phố và tỉnh',
      });
    }

    const route = await RouteService.create(operatorId, routeData);

    res.status(201).json({
      status: 'success',
      message: 'Tạo tuyến đường thành công',
      data: {
        route,
      },
    });
  } catch (error) {
    logger.error('Create route error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Tạo tuyến đường thất bại',
    });
  }
};

/**
 * @route   GET /api/v1/operators/routes
 * @desc    Lấy danh sách routes của operator
 * @access  Private (Operator)
 */
export const getMyRoutes = async (req, res, next) => {
  try {
    const operatorId = req.userId;
    const { isActive, search, page, limit, sortBy, sortOrder } = req.query;

    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      search,
    };

    const options = {
      page,
      limit,
      sortBy,
      sortOrder,
    };

    const result = await RouteService.getByOperator(operatorId, filters, options);

    res.status(200).json({
      status: 'success',
      data: {
        routes: result.routes,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    logger.error('Get routes error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Lấy danh sách tuyến đường thất bại',
    });
  }
};

/**
 * @route   GET /api/v1/operators/routes/:id
 * @desc    Lấy thông tin route theo ID
 * @access  Private (Operator)
 */
export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const operatorId = req.userId;

    const route = await RouteService.getById(id, operatorId);

    res.status(200).json({
      status: 'success',
      data: {
        route,
      },
    });
  } catch (error) {
    logger.error('Get route error:', error);
    res.status(404).json({
      status: 'error',
      message: error.message || 'Không tìm thấy tuyến đường',
    });
  }
};

/**
 * @route   PUT /api/v1/operators/routes/:id
 * @desc    Cập nhật route
 * @access  Private (Operator)
 */
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const operatorId = req.userId;
    const updateData = req.body;

    const route = await RouteService.update(id, operatorId, updateData);

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật tuyến đường thành công',
      data: {
        route,
      },
    });
  } catch (error) {
    logger.error('Update route error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Cập nhật tuyến đường thất bại',
    });
  }
};

/**
 * @route   DELETE /api/v1/operators/routes/:id
 * @desc    Xóa route (soft delete - deactivate)
 * @access  Private (Operator)
 */
// Đổi tên hàm thành 'deleteRoute' vì 'delete' là từ khóa trong JS
export const deleteRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const operatorId = req.userId;

    await RouteService.delete(id, operatorId);

    res.status(200).json({
      status: 'success',
      message: 'Xóa tuyến đường thành công',
    });
  } catch (error) {
    logger.error('Delete route error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Xóa tuyến đường thất bại',
    });
  }
};

/**
 * @route   PUT /api/v1/operators/routes/:id/toggle-active
 * @desc    Kích hoạt/vô hiệu hóa route
 * @access  Private (Operator)
 */
export const toggleActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const operatorId = req.userId;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        status: 'error',
        message: 'isActive phải là boolean',
      });
    }

    const route = await RouteService.toggleActive(id, operatorId, isActive);

    res.status(200).json({
      status: 'success',
      message: `${isActive ? 'Kích hoạt' : 'Vô hiệu hóa'} tuyến đường thành công`,
      data: {
        route,
      },
    });
  } catch (error) {
    logger.error('Toggle route active error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Thay đổi trạng thái tuyến đường thất bại',
    });
  }
};

/**
 * @route   POST /api/v1/operators/routes/:id/pickup-points
 * @desc    Thêm điểm đón
 * @access  Private (Operator)
 */
export const addPickupPoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const operatorId = req.userId;
    const point = req.body;

    if (!point.name) {
      return res.status(400).json({
        status: 'error',
        message: 'Tên điểm đón là bắt buộc',
      });
    }

    const route = await RouteService.addPickupPoint(id, operatorId, point);

    res.status(200).json({
      status: 'success',
      message: 'Thêm điểm đón thành công',
      data: {
        route,
      },
    });
  } catch (error) {
    logger.error('Add pickup point error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Thêm điểm đón thất bại',
    });
  }
};

/**
 * @route   DELETE /api/v1/operators/routes/:id/pickup-points/:pointId
 * @desc    Xóa điểm đón
 * @access  Private (Operator)
 */
export const removePickupPoint = async (req, res, next) => {
  try {
    const { id, pointId } = req.params;
    const operatorId = req.userId;

    const route = await RouteService.removePickupPoint(id, operatorId, pointId);

    res.status(200).json({
      status: 'success',
      message: 'Xóa điểm đón thành công',
      data: {
        route,
      },
    });
  } catch (error) {
    logger.error('Remove pickup point error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Xóa điểm đón thất bại',
    });
  }
};

/**
 * @route   POST /api/v1/operators/routes/:id/dropoff-points
 * @desc    Thêm điểm trả
 * @access  Private (Operator)
 */
export const addDropoffPoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const operatorId = req.userId;
    const point = req.body;

    if (!point.name) {
      return res.status(400).json({
        status: 'error',
        message: 'Tên điểm trả là bắt buộc',
      });
    }

    const route = await RouteService.addDropoffPoint(id, operatorId, point);

    res.status(200).json({
      status: 'success',
      message: 'Thêm điểm trả thành công',
      data: {
        route,
      },
    });
  } catch (error) {
    logger.error('Add dropoff point error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Thêm điểm trả thất bại',
    });
  }
};

/**
 * @route   DELETE /api/v1/operators/routes/:id/dropoff-points/:pointId
 * @desc    Xóa điểm trả
 * @access  Private (Operator)
 */
export const removeDropoffPoint = async (req, res, next) => {
  try {
    const { id, pointId } = req.params;
    const operatorId = req.userId;

    const route = await RouteService.removeDropoffPoint(id, operatorId, pointId);

    res.status(200).json({
      status: 'success',
      message: 'Xóa điểm trả thành công',
      data: {
        route,
      },
    });
  } catch (error) {
    logger.error('Remove dropoff point error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Xóa điểm trả thất bại',
    });
  }
};

/**
 * @route   GET /api/v1/routes/search
 * @desc    Tìm kiếm routes (public)
 * @access  Public
 */
export const search = async (req, res, next) => {
  try {
    const { originCity, destinationCity, operatorId, page, limit, sortBy, sortOrder } = req.query;

    const filters = {
      originCity,
      destinationCity,
      operatorId,
    };

    const options = {
      page,
      limit,
      sortBy,
      sortOrder,
    };

    const result = await RouteService.search(filters, options);

    res.status(200).json({
      status: 'success',
      data: {
        routes: result.routes,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    logger.error('Search routes error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Tìm kiếm tuyến đường thất bại',
    });
  }
};