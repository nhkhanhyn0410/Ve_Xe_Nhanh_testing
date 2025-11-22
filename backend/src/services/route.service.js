import Route from '../models/Route.js';
import BusOperator from '../models/BusOperator.js';

/**
 * Route Service
 * Xử lý logic liên quan đến routes
 */
class RouteService {
  /**
   * Tạo tuyến đường mới
   * @param {String} operatorId - Operator ID
   * @param {Object} routeData - Route data
   * @returns {Object} Route
   */
  static async create(operatorId, routeData) {
    // Verify operator exists and is approved
    const operator = await BusOperator.findById(operatorId);
    if (!operator) {
      throw new Error('Nhà xe không tồn tại');
    }

    if (operator.verificationStatus !== 'approved') {
      throw new Error('Nhà xe chưa được duyệt. Vui lòng chờ admin phê duyệt.');
    }

    if (operator.isSuspended) {
      throw new Error('Nhà xe đang bị tạm ngưng');
    }

    // Check if route code already exists
    const existingRoute = await Route.findByRouteCode(routeData.routeCode);
    if (existingRoute) {
      throw new Error('Mã tuyến đường đã tồn tại');
    }

    // Create route
    const route = await Route.create({
      ...routeData,
      operatorId,
    });

    return route;
  }

  /**
   * Lấy danh sách routes của operator
   * @param {String} operatorId - Operator ID
   * @param {Object} filters - Filters
   * @param {Object} options - Pagination options
   * @returns {Object} Routes và pagination info
   */
  static async getByOperator(operatorId, filters = {}, options = {}) {
    const { isActive, search } = filters;

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    // Build query
    const query = { operatorId };

    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }

    if (search) {
      query.$or = [
        { routeName: { $regex: search, $options: 'i' } },
        { routeCode: { $regex: search, $options: 'i' } },
        { 'origin.city': { $regex: search, $options: 'i' } },
        { 'destination.city': { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute query
    const routes = await Route.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Route.countDocuments(query);

    return {
      routes,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy thông tin route theo ID
   * @param {String} routeId - Route ID
   * @param {String} operatorId - Operator ID (for authorization)
   * @returns {Object} Route
   */
  static async getById(routeId, operatorId = null) {
    const route = await Route.findById(routeId).populate('operatorId', 'companyName email phone');

    if (!route) {
      throw new Error('Tuyến đường không tồn tại');
    }

    // If operatorId is provided, check ownership
    if (operatorId && route.operatorId._id.toString() !== operatorId.toString()) {
      throw new Error('Bạn không có quyền truy cập tuyến đường này');
    }

    return route;
  }

  /**
   * Cập nhật route
   * @param {String} routeId - Route ID
   * @param {String} operatorId - Operator ID (for authorization)
   * @param {Object} updateData - Update data
   * @returns {Object} Updated route
   */
  static async update(routeId, operatorId, updateData) {
    const route = await Route.findById(routeId);

    if (!route) {
      throw new Error('Tuyến đường không tồn tại');
    }

    // Check ownership
    if (route.operatorId.toString() !== operatorId.toString()) {
      throw new Error('Bạn không có quyền cập nhật tuyến đường này');
    }

    // If route code is being changed, check for duplicates
    if (updateData.routeCode && updateData.routeCode !== route.routeCode) {
      const existingRoute = await Route.findByRouteCode(updateData.routeCode);
      if (existingRoute) {
        throw new Error('Mã tuyến đường đã tồn tại');
      }
    }

    // Don't allow changing operatorId
    delete updateData.operatorId;

    // Update route
    Object.assign(route, updateData);
    await route.save();

    return route;
  }

  /**
   * Xóa route
   * @param {String} routeId - Route ID
   * @param {String} operatorId - Operator ID (for authorization)
   * @returns {Boolean} Success
   */
  static async delete(routeId, operatorId) {
    const route = await Route.findById(routeId);

    if (!route) {
      throw new Error('Tuyến đường không tồn tại');
    }

    // Check ownership
    if (route.operatorId.toString() !== operatorId.toString()) {
      throw new Error('Bạn không có quyền xóa tuyến đường này');
    }

    // TODO: Check if route has active trips before deleting
    // For now, we'll just deactivate instead of hard delete
    await route.deactivate();

    // If you want hard delete, use:
    // await Route.findByIdAndDelete(routeId);

    return true;
  }

  /**
   * Kích hoạt/vô hiệu hóa route
   * @param {String} routeId - Route ID
   * @param {String} operatorId - Operator ID (for authorization)
   * @param {Boolean} isActive - Active status
   * @returns {Object} Updated route
   */
  static async toggleActive(routeId, operatorId, isActive) {
    const route = await Route.findById(routeId);

    if (!route) {
      throw new Error('Tuyến đường không tồn tại');
    }

    // Check ownership
    if (route.operatorId.toString() !== operatorId.toString()) {
      throw new Error('Bạn không có quyền thay đổi trạng thái tuyến đường này');
    }

    if (isActive) {
      await route.activate();
    } else {
      await route.deactivate();
    }

    return route;
  }

  /**
   * Tìm kiếm routes (public)
   * @param {Object} filters - Search filters
   * @param {Object} options - Pagination options
   * @returns {Object} Routes và pagination info
   */
  static async search(filters = {}, options = {}) {
    const { originCity, destinationCity, operatorId } = filters;

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    // Build query
    const query = { isActive: true };

    if (originCity) {
      query['origin.city'] = { $regex: originCity, $options: 'i' };
    }

    if (destinationCity) {
      query['destination.city'] = { $regex: destinationCity, $options: 'i' };
    }

    if (operatorId) {
      query.operatorId = operatorId;
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute query
    const routes = await Route.find(query)
      .populate('operatorId', 'companyName averageRating logo')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Route.countDocuments(query);

    return {
      routes,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Thêm điểm đón
   * @param {String} routeId - Route ID
   * @param {String} operatorId - Operator ID (for authorization)
   * @param {Object} point - Pickup point data
   * @returns {Object} Updated route
   */
  static async addPickupPoint(routeId, operatorId, point) {
    const route = await Route.findById(routeId);

    if (!route) {
      throw new Error('Tuyến đường không tồn tại');
    }

    // Check ownership
    if (route.operatorId.toString() !== operatorId.toString()) {
      throw new Error('Bạn không có quyền thêm điểm đón cho tuyến đường này');
    }

    await route.addPickupPoint(point);

    return route;
  }

  /**
   * Xóa điểm đón
   * @param {String} routeId - Route ID
   * @param {String} operatorId - Operator ID (for authorization)
   * @param {String} pointId - Point ID
   * @returns {Object} Updated route
   */
  static async removePickupPoint(routeId, operatorId, pointId) {
    const route = await Route.findById(routeId);

    if (!route) {
      throw new Error('Tuyến đường không tồn tại');
    }

    // Check ownership
    if (route.operatorId.toString() !== operatorId.toString()) {
      throw new Error('Bạn không có quyền xóa điểm đón từ tuyến đường này');
    }

    await route.removePickupPoint(pointId);

    return route;
  }

  /**
   * Thêm điểm trả
   * @param {String} routeId - Route ID
   * @param {String} operatorId - Operator ID (for authorization)
   * @param {Object} point - Dropoff point data
   * @returns {Object} Updated route
   */
  static async addDropoffPoint(routeId, operatorId, point) {
    const route = await Route.findById(routeId);

    if (!route) {
      throw new Error('Tuyến đường không tồn tại');
    }

    // Check ownership
    if (route.operatorId.toString() !== operatorId.toString()) {
      throw new Error('Bạn không có quyền thêm điểm trả cho tuyến đường này');
    }

    await route.addDropoffPoint(point);

    return route;
  }

  /**
   * Xóa điểm trả
   * @param {String} routeId - Route ID
   * @param {String} operatorId - Operator ID (for authorization)
   * @param {String} pointId - Point ID
   * @returns {Object} Updated route
   */
  static async removeDropoffPoint(routeId, operatorId, pointId) {
    const route = await Route.findById(routeId);

    if (!route) {
      throw new Error('Tuyến đường không tồn tại');
    }

    // Check ownership
    if (route.operatorId.toString() !== operatorId.toString()) {
      throw new Error('Bạn không có quyền xóa điểm trả từ tuyến đường này');
    }

    await route.removeDropoffPoint(pointId);

    return route;
  }
}

export default RouteService;
