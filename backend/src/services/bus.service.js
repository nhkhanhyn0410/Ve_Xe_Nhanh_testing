import Bus from '../models/Bus.js';
import BusOperator from '../models/BusOperator.js';
/**
 * Bus Service
 * Xử lý logic liên quan đến buses
 */
class BusService {
  /**
   * Calculate total seats from layout (excluding driver, aisle, floor markers)
   * @param {Array} layout - 2D array of seat layout
   * @returns {Number} Total number of actual seats
   */
  static calculateTotalSeats(layout) {
    if (!layout || !Array.isArray(layout)) return 0;

    let count = 0;
    layout.forEach(row => {
      if (Array.isArray(row)) {
        row.forEach(seat => {
          // Count only actual seats (not empty, not aisle, not driver, not floor marker)
          if (seat &&
            seat !== '' &&
            seat !== 'DRIVER' &&
            seat !== 'FLOOR_2' &&
            seat !== '🚗' &&
            seat.toUpperCase() !== 'AISLE' &&
            !seat.toLowerCase().includes('aisle')) {
            count++;
          }
        });
      }
    });
    return count;
  }

  /**
   * Tạo xe mới
   * @param {String} operatorId - Operator ID
   * @param {Object} busData - Bus data
   * @returns {Object} Bus
   */
  static async create(operatorId, busData) {
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

    // Check if bus number already exists
    const existingBus = await Bus.findByBusNumber(busData.busNumber);
    if (existingBus) {
      throw new Error('Biển số xe đã tồn tại');
    }

    // Validate seat layout
    if (busData.seatLayout) {
      const { floors, rows, columns, layout } = busData.seatLayout;

      // Recalculate totalSeats from layout to ensure accuracy
      if (layout) {
        const originalSeats = busData.seatLayout.totalSeats;
        const recalculatedSeats = this.calculateTotalSeats(layout);
        console.log('🔍 CREATE BUS - Original totalSeats:', originalSeats);
        console.log('🔍 CREATE BUS - Recalculated totalSeats:', recalculatedSeats);
        console.log('🔍 CREATE BUS - Layout dimensions:', layout.length, 'x', layout[0]?.length);
        busData.seatLayout.totalSeats = recalculatedSeats;
      }

      // Validate layout dimensions match rows and columns
      if (layout.length !== rows) {
        throw new Error(`Số hàng trong sơ đồ (${layout.length}) không khớp với số hàng đã khai báo (${rows})`);
      }

      for (let i = 0; i < layout.length; i++) {
        if (layout[i].length !== columns) {
          throw new Error(
            `Số cột ở hàng ${i + 1} (${layout[i].length}) không khớp với số cột đã khai báo (${columns})`
          );
        }
      }

      // Validate floors based on bus type
      // sleeper and double_decker can have 1 or 2 floors
      // seater and limousine can only have 1 floor
      const canHaveMultipleFloors = ['sleeper', 'double_decker'].includes(busData.busType);

      if (canHaveMultipleFloors) {
        // sleeper and double_decker: 1 or 2 floors
        if (floors < 1 || floors > 2) {
          throw new Error('Xe giường nằm và 2 tầng chỉ có thể có 1 hoặc 2 tầng');
        }
      } else {
        // seater and limousine: only 1 floor
        if (floors !== 1) {
          throw new Error('Xe ghế ngồi và limousine chỉ có thể có 1 tầng');
        }
      }
    }

    // Create bus
    const bus = await Bus.create({
      ...busData,
      operatorId,
    });

    return bus;
  }

  /**
   * Lấy danh sách buses của operator
   * @param {String} operatorId - Operator ID
   * @param {Object} filters - Filters
   * @param {Object} options - Pagination options
   * @returns {Object} Buses và pagination info
   */
  static async getByOperator(operatorId, filters = {}, options = {}) {
    const { status, busType, search } = filters;

    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    // Build query
    const query = { operatorId };

    if (status) {
      query.status = status;
    }

    if (busType) {
      query.busType = busType;
    }

    if (search) {
      query.$or = [
        { busNumber: { $regex: search, $options: 'i' } },
        { busType: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute query
    const buses = await Bus.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Bus.countDocuments(query);

    return {
      buses,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy thông tin bus theo ID
   * @param {String} busId - Bus ID
   * @param {String} operatorId - Operator ID (for authorization)
   * @returns {Object} Bus
   */
  static async getById(busId, operatorId = null) {
    const bus = await Bus.findById(busId).populate('operatorId', 'companyName email phone');

    if (!bus) {
      throw new Error('Xe không tồn tại');
    }

    // If operatorId is provided, check ownership
    if (operatorId && bus.operatorId._id.toString() !== operatorId.toString()) {
      throw new Error('Bạn không có quyền truy cập xe này');
    }

    return bus;
  }

  /**
   * Cập nhật bus
   * @param {String} busId - Bus ID
   * @param {String} operatorId - Operator ID (for authorization)
   * @param {Object} updateData - Update data
   * @returns {Object} Updated bus
   */
  static async update(busId, operatorId, updateData) {
    const bus = await Bus.findById(busId);

    if (!bus) {
      throw new Error('Xe không tồn tại');
    }

    // Check ownership
    if (bus.operatorId.toString() !== operatorId.toString()) {
      throw new Error('Bạn không có quyền cập nhật xe này');
    }

    // If bus number is being changed, check for duplicates
    if (updateData.busNumber && updateData.busNumber !== bus.busNumber) {
      const existingBus = await Bus.findByBusNumber(updateData.busNumber);
      if (existingBus) {
        throw new Error('Biển số xe đã tồn tại');
      }
    }

    // Validate seat layout if being updated
    if (updateData.seatLayout) {
      const { floors, rows, columns, layout } = updateData.seatLayout;

      if (layout) {
        // Recalculate totalSeats from layout to ensure accuracy
        const originalSeats = updateData.seatLayout.totalSeats;
        const recalculatedSeats = this.calculateTotalSeats(layout);
        console.log('🔍 UPDATE BUS - Bus ID:', busId);
        console.log('🔍 UPDATE BUS - Original totalSeats:', originalSeats);
        console.log('🔍 UPDATE BUS - Recalculated totalSeats:', recalculatedSeats);
        console.log('🔍 UPDATE BUS - Layout dimensions:', layout.length, 'x', layout[0]?.length);

        // Sample first few rows to see what's in the layout
        console.log('🔍 UPDATE BUS - First 3 rows of layout:', JSON.stringify(layout.slice(0, 3)));

        updateData.seatLayout.totalSeats = recalculatedSeats;

        // Validate layout dimensions match rows and columns
        const rowCount = rows || bus.seatLayout.rows;
        const colCount = columns || bus.seatLayout.columns;

        if (layout.length !== rowCount) {
          throw new Error(
            `Số hàng trong sơ đồ (${layout.length}) không khớp với số hàng đã khai báo (${rowCount})`
          );
        }

        for (let i = 0; i < layout.length; i++) {
          if (layout[i].length !== colCount) {
            throw new Error(
              `Số cột ở hàng ${i + 1} (${layout[i].length}) không khớp với số cột đã khai báo (${colCount})`
            );
          }
        }
      }

      // Validate floors based on bus type
      const busType = updateData.busType || bus.busType;
      const floorCount = floors || bus.seatLayout.floors;
      const canHaveMultipleFloors = ['sleeper', 'double_decker'].includes(busType);

      if (canHaveMultipleFloors) {
        // sleeper and double_decker: 1 or 2 floors
        if (floorCount < 1 || floorCount > 2) {
          throw new Error('Xe giường nằm và 2 tầng chỉ có thể có 1 hoặc 2 tầng');
        }
      } else {
        // seater and limousine: only 1 floor
        if (floorCount !== 1) {
          throw new Error('Xe ghế ngồi và limousine chỉ có thể có 1 tầng');
        }
      }
    }

    // Don't allow changing operatorId
    delete updateData.operatorId;

    // Update bus
    Object.assign(bus, updateData);
    await bus.save();

    console.log('✅ UPDATE BUS - Saved totalSeats:', bus.seatLayout.totalSeats);
    console.log('✅ UPDATE BUS - Bus object saved successfully');

    return bus;
  }

  /**
   * Xóa bus
   * @param {String} busId - Bus ID
   * @param {String} operatorId - Operator ID (for authorization)
   * @returns {Boolean} Success
   */
  static async delete(busId, operatorId) {
    const bus = await Bus.findById(busId);

    if (!bus) {
      throw new Error('Xe không tồn tại');
    }

    // Check ownership
    if (bus.operatorId.toString() !== operatorId.toString()) {
      throw new Error('Bạn không có quyền xóa xe này');
    }

    // TODO: Check if bus has active trips before deleting
    // For now, we'll just retire instead of hard delete
    await bus.retire();

    // If you want hard delete, use:
    // await Bus.findByIdAndDelete(busId);

    return true;
  }

  /**
   * Thay đổi trạng thái bus
   * @param {String} busId - Bus ID
   * @param {String} operatorId - Operator ID (for authorization)
   * @param {String} status - Status (active, maintenance, retired)
   * @returns {Object} Updated bus
   */
  static async changeStatus(busId, operatorId, status) {
    const bus = await Bus.findById(busId);

    if (!bus) {
      throw new Error('Xe không tồn tại');
    }

    // Check ownership
    if (bus.operatorId.toString() !== operatorId.toString()) {
      throw new Error('Bạn không có quyền thay đổi trạng thái xe này');
    }

    // Validate status
    const validStatuses = ['active', 'maintenance', 'retired'];
    if (!validStatuses.includes(status)) {
      throw new Error('Trạng thái không hợp lệ. Chỉ chấp nhận: active, maintenance, retired');
    }

    bus.status = status;
    await bus.save();

    return bus;
  }

  /**
   * Lấy thống kê buses của operator
   * @param {String} operatorId - Operator ID
   * @returns {Object} Statistics
   */
  static async getStatistics(operatorId) {
    const totalBuses = await Bus.countDocuments({ operatorId });
    const activeBuses = await Bus.countDocuments({ operatorId, status: 'active' });
    const maintenanceBuses = await Bus.countDocuments({ operatorId, status: 'maintenance' });
    const retiredBuses = await Bus.countDocuments({ operatorId, status: 'retired' });

    // Count by bus type
    const mongoose = require('mongoose');
    let operatorObjectId;
    try {
      operatorObjectId = new mongoose.Types.ObjectId(operatorId);
    } catch (error) {
      // If operatorId is not a valid ObjectId (e.g., in tests), use it as string
      operatorObjectId = operatorId;
    }

    const busesByType = await Bus.aggregate([
      { $match: { operatorId: operatorObjectId } },
      { $group: { _id: '$busType', count: { $sum: 1 } } },
    ]);

    // Total seat capacity
    const seatCapacity = await Bus.aggregate([
      { $match: { operatorId: operatorObjectId, status: 'active' } },
      { $group: { _id: null, totalSeats: { $sum: '$seatLayout.totalSeats' } } },
    ]);

    return {
      totalBuses,
      activeBuses,
      maintenanceBuses,
      retiredBuses,
      busesByType: busesByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      totalSeatCapacity: seatCapacity.length > 0 ? seatCapacity[0].totalSeats : 0,
    };
  }

  /**
   * Tìm kiếm buses (public)
   * @param {Object} filters - Search filters
   * @param {Object} options - Pagination options
   * @returns {Object} Buses và pagination info
   */
  static async search(filters = {}, options = {}) {
    const { busType, operatorId, minSeats, maxSeats, amenities } = filters;

    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    // Build query
    const query = { status: 'active' };

    if (busType) {
      query.busType = busType;
    }

    if (operatorId) {
      query.operatorId = operatorId;
    }

    if (minSeats) {
      query['seatLayout.totalSeats'] = { $gte: Number(minSeats) };
    }

    if (maxSeats) {
      query['seatLayout.totalSeats'] = {
        ...query['seatLayout.totalSeats'],
        $lte: Number(maxSeats),
      };
    }

    if (amenities && amenities.length > 0) {
      query.amenities = { $all: amenities };
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute query
    const buses = await Bus.find(query)
      .populate('operatorId', 'companyName averageRating logo')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Bus.countDocuments(query);

    return {
      buses,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export default BusService;
