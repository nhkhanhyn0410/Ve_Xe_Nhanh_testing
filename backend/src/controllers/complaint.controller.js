import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { logger } from '../utils/logger.js';

/**
 * @route   POST /api/complaints
 * @desc    Create a new complaint
 * @access  Private (Authenticated users)
 */
export const createComplaint = async (req, res) => {
  try {
    const {
      subject,
      description,
      category,
      priority,
      bookingId,
      operatorId,
      tripId,
      attachments,
    } = req.body;

    // Validate required fields
    if (!subject || !description || !category) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu thông tin bắt buộc',
      });
    }

    // Verify booking exists if provided
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          status: 'error',
          message: 'Không tìm thấy đặt vé',
        });
      }

      // Verify user owns the booking
      if (booking.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'Bạn không có quyền tạo khiếu nại cho đặt vé này',
        });
      }
    }

    // Create complaint
    const complaint = new Complaint({
      subject,
      description,
      category,
      priority: priority || 'medium',
      userId: req.user._id,
      userEmail: req.user.email,
      userPhone: req.user.phone,
      bookingId,
      operatorId,
      tripId,
      attachments: attachments || [],
    });

    await complaint.save();

    res.status(201).json({
      status: 'success',
      message: 'Tạo khiếu nại thành công',
      data: complaint,
    });
  } catch (error) {
    logger.error('Create complaint error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi tạo khiếu nại',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/complaints
 * @desc    Get user's complaints
 * @access  Private (Authenticated users)
 */
export const getMyComplaints = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    // Build query
    const query = { userId: req.user._id };

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const complaints = await Complaint.find(query)
      .populate('assignedTo', 'fullName email')
      .populate('bookingId', 'bookingCode totalPrice')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(query);

    res.json({
      status: 'success',
      data: complaints,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Get my complaints error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy danh sách khiếu nại',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/complaints/:id
 * @desc    Get complaint details
 * @access  Private (Owner or Admin)
 */
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'fullName email phone')
      .populate('assignedTo', 'fullName email')
      .populate('resolvedBy', 'fullName email')
      .populate('bookingId')
      .populate('operatorId', 'businessName email phone')
      .populate({
        path: 'notes.addedBy',
        select: 'fullName email role',
      });

    if (!complaint) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khiếu nại',
      });
    }

    // Check permission - only owner or admin can view
    if (
      complaint.userId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền xem khiếu nại này',
      });
    }

    // Filter internal notes for non-admin users
    if (req.user.role !== 'admin') {
      complaint.notes = complaint.notes.filter((note) => !note.isInternal);
    }

    res.json({
      status: 'success',
      data: complaint,
    });
  } catch (error) {
    logger.error('Get complaint error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy thông tin khiếu nại',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/complaints/:id/notes
 * @desc    Add note to complaint
 * @access  Private (Owner or Admin)
 */
export const addNote = async (req, res) => {
  try {
    const { content, isInternal } = req.body;

    if (!content) {
      return res.status(400).json({
        status: 'error',
        message: 'Nội dung ghi chú là bắt buộc',
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khiếu nại',
      });
    }

    // Check permission
    const isOwner = complaint.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền thêm ghi chú',
      });
    }

    // Only admins can add internal notes
    const noteIsInternal = isAdmin && isInternal === true;

    await complaint.addNote(content, req.user._id, req.user.role, noteIsInternal);

    // Populate the complaint with note details
    const updatedComplaint = await Complaint.findById(complaint._id).populate({
      path: 'notes.addedBy',
      select: 'fullName email role',
    });

    res.json({
      status: 'success',
      message: 'Thêm ghi chú thành công',
      data: updatedComplaint,
    });
  } catch (error) {
    logger.error('Add note error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi thêm ghi chú',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/complaints/:id/satisfaction
 * @desc    Add satisfaction rating
 * @access  Private (Owner only)
 */
export const addSatisfactionRating = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Đánh giá phải từ 1 đến 5 sao',
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khiếu nại',
      });
    }

    // Check permission - only owner can rate
    if (complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền đánh giá khiếu nại này',
      });
    }

    await complaint.addSatisfactionRating(rating, feedback || '');

    res.json({
      status: 'success',
      message: 'Cảm ơn bạn đã đánh giá',
      data: complaint,
    });
  } catch (error) {
    logger.error('Add satisfaction rating error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Lỗi khi thêm đánh giá',
    });
  }
};

// ============= ADMIN FUNCTIONS =============

/**
 * @route   GET /api/admin/complaints
 * @desc    Get all complaints (admin)
 * @access  Private (Admin only)
 */
export const getAllComplaints = async (req, res) => {
  try {
    const {
      status,
      category,
      priority,
      assignedTo,
      search,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = req.query;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (priority) {
      query.priority = priority;
    }

    if (assignedTo) {
      if (assignedTo === 'unassigned') {
        query.assignedTo = { $exists: false };
      } else if (assignedTo === 'me') {
        query.assignedTo = req.user._id;
      } else {
        query.assignedTo = assignedTo;
      }
    }

    if (search) {
      query.$or = [
        { ticketNumber: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const complaints = await Complaint.find(query)
      .populate('userId', 'fullName email phone')
      .populate('assignedTo', 'fullName email')
      .populate('bookingId', 'bookingCode totalPrice')
      .populate('operatorId', 'businessName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(query);

    res.json({
      status: 'success',
      data: complaints,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Get all complaints error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy danh sách khiếu nại',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/admin/complaints/:id/assign
 * @desc    Assign complaint to admin
 * @access  Private (Admin only)
 */
export const assignComplaint = async (req, res) => {
  try {
    const { adminId } = req.body;

    if (!adminId) {
      return res.status(400).json({
        status: 'error',
        message: 'ID quản trị viên là bắt buộc',
      });
    }

    // Verify admin exists
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(400).json({
        status: 'error',
        message: 'Quản trị viên không tồn tại',
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khiếu nại',
      });
    }

    await complaint.assignTo(adminId);

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('userId', 'fullName email phone')
      .populate('assignedTo', 'fullName email');

    res.json({
      status: 'success',
      message: 'Phân công khiếu nại thành công',
      data: updatedComplaint,
    });
  } catch (error) {
    logger.error('Assign complaint error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi phân công khiếu nại',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/admin/complaints/:id/status
 * @desc    Update complaint status
 * @access  Private (Admin only)
 */
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Trạng thái không hợp lệ',
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khiếu nại',
      });
    }

    complaint.status = status;
    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('userId', 'fullName email phone')
      .populate('assignedTo', 'fullName email');

    res.json({
      status: 'success',
      message: 'Cập nhật trạng thái thành công',
      data: updatedComplaint,
    });
  } catch (error) {
    logger.error('Update status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi cập nhật trạng thái',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/admin/complaints/:id/priority
 * @desc    Update complaint priority
 * @access  Private (Admin only)
 */
export const updateComplaintPriority = async (req, res) => {
  try {
    const { priority } = req.body;

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!priority || !validPriorities.includes(priority)) {
      return res.status(400).json({
        status: 'error',
        message: 'Độ ưu tiên không hợp lệ',
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khiếu nại',
      });
    }

    complaint.priority = priority;
    await complaint.save();

    res.json({
      status: 'success',
      message: 'Cập nhật độ ưu tiên thành công',
      data: complaint,
    });
  } catch (error) {
    logger.error('Update priority error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi cập nhật độ ưu tiên',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/admin/complaints/:id/resolve
 * @desc    Resolve complaint
 * @access  Private (Admin only)
 */
export const resolveComplaint = async (req, res) => {
  try {
    const { resolution } = req.body;

    if (!resolution) {
      return res.status(400).json({
        status: 'error',
        message: 'Nội dung giải quyết là bắt buộc',
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khiếu nại',
      });
    }

    await complaint.resolve(resolution, req.user._id);

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('userId', 'fullName email phone')
      .populate('assignedTo', 'fullName email')
      .populate('resolvedBy', 'fullName email');

    res.json({
      status: 'success',
      message: 'Giải quyết khiếu nại thành công',
      data: updatedComplaint,
    });
  } catch (error) {
    logger.error('Resolve complaint error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi giải quyết khiếu nại',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/admin/complaints/statistics
 * @desc    Get complaint statistics
 * @access  Private (Admin only)
 */
export const getComplaintStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await Complaint.getStatistics(startDate, endDate);

    // Get total counts
    const totalComplaints = await Complaint.countDocuments();
    const openComplaints = await Complaint.countDocuments({ status: 'open' });
    const inProgressComplaints = await Complaint.countDocuments({
      status: 'in_progress',
    });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
    const unassignedComplaints = await Complaint.countDocuments({
      assignedTo: { $exists: false },
    });

    res.json({
      status: 'success',
      data: {
        total: totalComplaints,
        open: openComplaints,
        inProgress: inProgressComplaints,
        resolved: resolvedComplaints,
        unassigned: unassignedComplaints,
        byStatus: stats.byStatus,
        byCategory: stats.byCategory,
        byPriority: stats.byPriority,
        avgResolutionTime: stats.avgResolutionTime[0]?.avgTime || 0,
        satisfaction: stats.satisfaction[0] || { avgRating: 0, totalRatings: 0 },
      },
    });
  } catch (error) {
    logger.error('Get complaint statistics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy thống kê khiếu nại',
      error: error.message,
    });
  }
};