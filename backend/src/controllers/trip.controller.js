import TripService from '../services/trip.service.js';
import { logger } from '../utils/logger.js';

/**
 * Trip Controller
 * Xử lý các HTTP requests liên quan đến trips
 */

/**
 * @route   POST /api/v1/operators/trips
 * @desc    Tạo chuyến xe mới
 * @access  Private (Operator)
 */
export const create = async (req, res) => {
  try {
    const operatorId = req.userId;
    const tripData = req.body;

    // Validate required fields
    const requiredFields = [
      'routeId',
      'busId',
      'driverId',
      'tripManagerId',
      'departureTime',
      'arrivalTime',
      'basePrice',
    ];

    const missingFields = requiredFields.filter((field) => !tripData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Thiếu các trường bắt buộc: ${missingFields.join(', ')}`,
      });
    }

    const trip = await TripService.create(operatorId, tripData);

    res.status(201).json({
      status: 'success',
      message: 'Tạo chuyến xe thành công',
      data: {
        trip,
      },
    });
  } catch (error) {
    logger.error('Create trip error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Tạo chuyến xe thất bại',
    });
  }
};

/**
 * @route   POST /api/v1/operators/trips/recurring
 * @desc    Tạo chuyến xe định kỳ
 * @access  Private (Operator)
 */
export const createRecurring = async (req, res) => {
  try {
    const operatorId = req.userId;
    const { tripData, recurringConfig } = req.body;

    if (!tripData || !recurringConfig) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu tripData hoặc recurringConfig',
      });
    }

    // Validate recurring config
    const { startDate, endDate, daysOfWeek, timeOfDay } = recurringConfig;
    if (!startDate || !endDate || !daysOfWeek || !timeOfDay) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu thông tin cấu hình định kỳ',
      });
    }

    const trips = await TripService.createRecurring(
      operatorId,
      tripData,
      recurringConfig
    );

    res.status(201).json({
      status: 'success',
      message: `Tạo ${trips.length} chuyến xe định kỳ thành công`,
      data: {
        trips,
        total: trips.length,
      },
    });
  } catch (error) {
    logger.error('Create recurring trips error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Tạo chuyến xe định kỳ thất bại',
    });
  }
};

/**
 * @route   GET /api/v1/operators/trips
 * @desc    Lấy danh sách chuyến của operator
 * @access  Private (Operator)
 */
export const getMyTrips = async (req, res) => {
  try {
    const operatorId = req.userId;
    const {
      status,
      routeId,
      busId,
      fromDate,
      toDate,
      recurringGroupId,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query;

    const filters = {
      status,
      routeId,
      busId,
      fromDate,
      toDate,
      recurringGroupId,
    };

    const options = {
      page,
      limit,
      sortBy,
      sortOrder,
    };

    const result = await TripService.getByOperator(operatorId, filters, options);

    res.status(200).json({
      status: 'success',
      data: {
        trips: result.trips,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    logger.error('Get trips error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Lấy danh sách chuyến thất bại',
    });
  }
};

/**
 * @route   GET /api/v1/operators/trips/:id
 * @desc    Lấy chi tiết chuyến
 * @access  Private (Operator)
 */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = req.userId;

    const trip = await TripService.getById(id, operatorId);

    res.status(200).json({
      status: 'success',
      data: {
        trip,
      },
    });
  } catch (error) {
    logger.error('Get trip error:', error);
    res.status(404).json({
      status: 'error',
      message: error.message || 'Không tìm thấy chuyến xe',
    });
  }
};

/**
 * @route   PUT /api/v1/operators/trips/:id
 * @desc    Cập nhật chuyến
 * @access  Private (Operator)
 */
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = req.userId;
    const updateData = req.body;

    const trip = await TripService.update(id, operatorId, updateData);

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật chuyến xe thành công',
      data: {
        trip,
      },
    });
  } catch (error) {
    logger.error('Update trip error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Cập nhật chuyến xe thất bại',
    });
  }
};

/**
 * @route   DELETE /api/v1/operators/trips/:id
 * @desc    Xóa chuyến
 * @access  Private (Operator)
 */
// Đổi tên từ 'delete' sang 'deleteTrip' vì 'delete' là keyword
export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = req.userId;

    await TripService.delete(id, operatorId);

    res.status(200).json({
      status: 'success',
      message: 'Xóa chuyến xe thành công',
    });
  } catch (error) {
    logger.error('Delete trip error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Xóa chuyến xe thất bại',
    });
  }
};

/**
 * @route   PUT /api/v1/operators/trips/:id/cancel
 * @desc    Hủy chuyến
 * @access  Private (Operator)
 */
export const cancel = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = req.userId;
    const { cancelReason } = req.body;

    if (!cancelReason) {
      return res.status(400).json({
        status: 'error',
        message: 'Lý do hủy là bắt buộc',
      });
    }

    const trip = await TripService.cancel(id, operatorId, cancelReason);

    res.status(200).json({
      status: 'success',
      message: 'Hủy chuyến xe thành công',
      data: {
        trip,
      },
    });
  } catch (error) {
    logger.error('Cancel trip error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Hủy chuyến xe thất bại',
    });
  }
};

/**
 * @route   GET /api/v1/operators/trips/statistics
 * @desc    Lấy thống kê chuyến
 * @access  Private (Operator)
 */
export const getStatistics = async (req, res) => {
  try {
    const operatorId = req.userId;
    const { fromDate, toDate } = req.query;

    const statistics = await TripService.getStatistics(operatorId, {
      fromDate,
      toDate,
    });

    res.status(200).json({
      status: 'success',
      data: {
        statistics,
      },
    });
  } catch (error) {
    logger.error('Get trip statistics error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Lấy thống kê chuyến thất bại',
    });
  }
};

/**
 * @route   GET /api/v1/trips/search
 * @desc    Tìm kiếm chuyến với các bộ lọc nâng cao (public - for customers)
 * @access  Public
 * @query   {string} fromCity - Thành phố đi
 * @query   {string} toCity - Thành phố đến
 * @query   {string} date - Ngày đi (YYYY-MM-DD)
 * @query   {number} passengers - Số hành khách
 * @query   {number} minPrice - Giá tối thiểu
 * @query   {number} maxPrice - Giá tối đa
 * @query   {string} departureTimeStart - Giờ khởi hành sớm nhất (HH:mm)
 * @query   {string} departureTimeEnd - Giờ khởi hành muộn nhất (HH:mm)
 * @query   {string} operatorId - ID nhà xe
 * @query   {string} busType - Loại xe (limousine, sleeper, seater, double_decker)
 * @query   {string} sortBy - Sắp xếp theo (price, time, rating)
 * @query   {string} sortOrder - Thứ tự (asc, desc)
 */
export const search = async (req, res) => {
  try {
    const {
      fromCity,
      toCity,
      date,
      passengers,
      minPrice,
      maxPrice,
      departureTimeStart,
      departureTimeEnd,
      operatorId,
      busType,
      sortBy,
      sortOrder,
    } = req.query;

    const trips = await TripService.searchAvailableTrips({
      fromCity,
      toCity,
      date,
      passengers: passengers ? parseInt(passengers) : 1,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      departureTimeStart,
      departureTimeEnd,
      operatorId,
      busType,
      sortBy: sortBy || 'time',
      sortOrder: sortOrder || 'asc',
    });

    res.status(200).json({
      status: 'success',
      data: {
        trips,
        total: trips.length,
        filters: {
          fromCity,
          toCity,
          date,
          passengers: passengers ? parseInt(passengers) : 1,
          minPrice,
          maxPrice,
          departureTimeStart,
          departureTimeEnd,
          operatorId,
          busType,
          sortBy: sortBy || 'time',
          sortOrder: sortOrder || 'asc',
        },
      },
    });
  } catch (error) {
    logger.error('Search trips error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Tìm kiếm chuyến thất bại',
    });
  }
};

/**
 * @route   GET /api/v1/trips/:id
 * @desc    Lấy chi tiết chuyến (public)
 * @access  Public
 */
export const getPublicTripDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await TripService.getPublicTripDetail(id);

    res.status(200).json({
      status: 'success',
      data: {
        trip,
      },
    });
  } catch (error) {
    logger.error('Get public trip detail error:', error);
    res.status(404).json({
      status: 'error',
      message: error.message || 'Không tìm thấy chuyến xe',
    });
  }
};

/**
 * @route   PUT /api/v1/operators/trips/:id/dynamic-pricing
 * @desc    Configure dynamic pricing for a trip
 * @access  Private (Operator)
 */
export const configureDynamicPricing = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = req.user._id;
    const pricingConfig = req.body;

    const trip = await TripService.configureDynamicPricing(id, operatorId, pricingConfig);

    res.status(200).json({
      status: 'success',
      data: { trip },
      message: 'Cấu hình giá động thành công',
    });
  } catch (error) {
    logger.error('Configure dynamic pricing error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Không thể cấu hình giá động',
    });
  }
};

/**
 * @route   GET /api/v1/trips/:id/dynamic-price
 * @desc    Get dynamic price for a trip
 * @access  Public
 */
export const getDynamicPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingDate } = req.query;

    const priceInfo = await TripService.getDynamicPrice(id, bookingDate);

    res.status(200).json({
      status: 'success',
      data: priceInfo,
    });
  } catch (error) {
    logger.error('Get dynamic price error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Không thể tính giá động',
    });
  }
};