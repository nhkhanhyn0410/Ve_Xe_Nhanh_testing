const Banner = require('../models/Banner');
const Blog = require('../models/Blog');
const FAQ = require('../models/FAQ');
const logger = require('../utils/logger');

// ============= BANNER ADMIN FUNCTIONS =============

/**
 * @route   GET /api/admin/banners
 * @desc    Get all banners (admin)
 * @access  Private (Admin only)
 */
exports.getAllBanners = async (req, res) => {
  try {
    const { position, isActive, page = 1, limit = 20, sort = 'order' } = req.query;

    const query = {};

    if (position) {
      query.position = position;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;
    const banners = await Banner.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Banner.countDocuments(query);

    res.json({
      status: 'success',
      data: banners,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Lỗi lấy tất cả banner:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy danh sách banner',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/admin/banners
 * @desc    Create banner
 * @access  Private (Admin only)
 */
exports.createBanner = async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      mobileImageUrl,
      linkUrl,
      linkText,
      position,
      order,
      isActive,
      startDate,
      endDate,
    } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Tiêu đề và hình ảnh là bắt buộc',
      });
    }

    const banner = new Banner({
      title,
      description,
      imageUrl,
      mobileImageUrl,
      linkUrl,
      linkText,
      position,
      order,
      isActive,
      startDate,
      endDate,
    });

    await banner.save();

    res.status(201).json({
      status: 'success',
      message: 'Tạo banner thành công',
      data: banner,
    });
  } catch (error) {
    logger.error('Lỗi tạo banner:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi tạo banner',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/admin/banners/:id
 * @desc    Update banner
 * @access  Private (Admin only)
 */
exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy banner',
      });
    }

    const allowedFields = [
      'title',
      'description',
      'imageUrl',
      'mobileImageUrl',
      'linkUrl',
      'linkText',
      'position',
      'order',
      'isActive',
      'startDate',
      'endDate',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        banner[field] = req.body[field];
      }
    });

    await banner.save();

    res.json({
      status: 'success',
      message: 'Cập nhật banner thành công',
      data: banner,
    });
  } catch (error) {
    logger.error('Lỗi cập nhật banner:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi cập nhật banner',
      error: error.message,
    });
  }
};

/**
 * @route   DELETE /api/admin/banners/:id
 * @desc    Delete banner
 * @access  Private (Admin only)
 */
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy banner',
      });
    }

    await banner.deleteOne();

    res.json({
      status: 'success',
      message: 'Xóa banner thành công',
    });
  } catch (error) {
    logger.error('Lỗi xóa banner:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi xóa banner',
      error: error.message,
    });
  }
};

// ============= BLOG ADMIN FUNCTIONS =============

/**
 * @route   GET /api/admin/blogs
 * @desc    Get all blogs (admin)
 * @access  Private (Admin only)
 */
exports.getAllBlogs = async (req, res) => {
  try {
    const {
      status,
      category,
      author,
      search,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (author) {
      query.author = author;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const blogs = await Blog.find(query)
      .populate('author', 'fullName email avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      status: 'success',
      data: blogs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Lỗi lấy tất cả blog:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy danh sách bài viết',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/admin/blogs/:id
 * @desc    Get blog by ID (admin)
 * @access  Private (Admin only)
 */
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      'author',
      'fullName email avatar'
    );

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy bài viết',
      });
    }

    res.json({
      status: 'success',
      data: blog,
    });
  } catch (error) {
    logger.error('Lỗi lấy blog:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy bài viết',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/admin/blogs
 * @desc    Create blog
 * @access  Private (Admin only)
 */
exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      tags,
      status,
      metaTitle,
      metaDescription,
      metaKeywords,
    } = req.body;

    if (!title || !excerpt || !content || !featuredImage) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu thông tin bắt buộc',
      });
    }

    const blog = new Blog({
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      tags,
      status,
      author: req.user._id,
      metaTitle,
      metaDescription,
      metaKeywords,
    });

    await blog.save();

    const populatedBlog = await Blog.findById(blog._id).populate(
      'author',
      'fullName email avatar'
    );

    res.status(201).json({
      status: 'success',
      message: 'Tạo bài viết thành công',
      data: populatedBlog,
    });
  } catch (error) {
    logger.error('Lỗi tạo blog:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Slug đã tồn tại',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi tạo bài viết',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/admin/blogs/:id
 * @desc    Update blog
 * @access  Private (Admin only)
 */
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy bài viết',
      });
    }

    const allowedFields = [
      'title',
      'slug',
      'excerpt',
      'content',
      'featuredImage',
      'category',
      'tags',
      'status',
      'metaTitle',
      'metaDescription',
      'metaKeywords',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        blog[field] = req.body[field];
      }
    });

    await blog.save();

    const updatedBlog = await Blog.findById(blog._id).populate(
      'author',
      'fullName email avatar'
    );

    res.json({
      status: 'success',
      message: 'Cập nhật bài viết thành công',
      data: updatedBlog,
    });
  } catch (error) {
    logger.error('Lỗi cập nhật blog:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Slug đã tồn tại',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi cập nhật bài viết',
      error: error.message,
    });
  }
};

/**
 * @route   DELETE /api/admin/blogs/:id
 * @desc    Delete blog
 * @access  Private (Admin only)
 */
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy bài viết',
      });
    }

    await blog.deleteOne();

    res.json({
      status: 'success',
      message: 'Xóa bài viết thành công',
    });
  } catch (error) {
    logger.error('Lỗi xóa blog:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi xóa bài viết',
      error: error.message,
    });
  }
};

// ============= FAQ ADMIN FUNCTIONS =============

/**
 * @route   GET /api/admin/faqs
 * @desc    Get all FAQs (admin)
 * @access  Private (Admin only)
 */
exports.getAllFAQs = async (req, res) => {
  try {
    const {
      category,
      isActive,
      search,
      page = 1,
      limit = 50,
      sort = 'category order',
    } = req.query;

    const query = {};

    if (category) {
      query.category = category;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const faqs = await FAQ.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FAQ.countDocuments(query);

    res.json({
      status: 'success',
      data: faqs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Lỗi lấy tất cả FAQ:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy danh sách FAQ',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/admin/faqs
 * @desc    Create FAQ
 * @access  Private (Admin only)
 */
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer, category, order, isActive, tags } = req.body;

    if (!question || !answer || !category) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu thông tin bắt buộc',
      });
    }

    const faq = new FAQ({
      question,
      answer,
      category,
      order,
      isActive,
      tags,
    });

    await faq.save();

    res.status(201).json({
      status: 'success',
      message: 'Tạo FAQ thành công',
      data: faq,
    });
  } catch (error) {
    logger.error('Lỗi tạo FAQ:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi tạo FAQ',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/admin/faqs/:id
 * @desc    Update FAQ
 * @access  Private (Admin only)
 */
exports.updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy FAQ',
      });
    }

    const allowedFields = ['question', 'answer', 'category', 'order', 'isActive', 'tags'];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        faq[field] = req.body[field];
      }
    });

    await faq.save();

    res.json({
      status: 'success',
      message: 'Cập nhật FAQ thành công',
      data: faq,
    });
  } catch (error) {
    logger.error('Lỗi cập nhật FAQ:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi cập nhật FAQ',
      error: error.message,
    });
  }
};

/**
 * @route   DELETE /api/admin/faqs/:id
 * @desc    Delete FAQ
 * @access  Private (Admin only)
 */
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy FAQ',
      });
    }

    await faq.deleteOne();

    res.json({
      status: 'success',
      message: 'Xóa FAQ thành công',
    });
  } catch (error) {
    logger.error('Lỗi xóa FAQ:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi xóa FAQ',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/admin/content/statistics
 * @desc    Get content statistics
 * @access  Private (Admin only)
 */
exports.getContentStatistics = async (req, res) => {
  try {
    // Banner statistics
    const totalBanners = await Banner.countDocuments();
    const activeBanners = await Banner.countDocuments({ isActive: true });

    // Blog statistics
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ status: 'published' });
    const draftBlogs = await Blog.countDocuments({ status: 'draft' });

    const blogsByCategory = await Blog.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    // FAQ statistics
    const totalFAQs = await FAQ.countDocuments();
    const activeFAQs = await FAQ.countDocuments({ isActive: true });

    const faqsByCategory = await FAQ.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    // Popular content
    const topBlogs = await Blog.find({ status: 'published' })
      .sort({ viewCount: -1 })
      .limit(5)
      .select('title slug viewCount likeCount');

    const topFAQs = await FAQ.find({ isActive: true })
      .sort({ viewCount: -1 })
      .limit(5)
      .select('question viewCount helpfulCount');

    res.json({
      status: 'success',
      data: {
        banners: {
          total: totalBanners,
          active: activeBanners,
        },
        blogs: {
          total: totalBlogs,
          published: publishedBlogs,
          draft: draftBlogs,
          byCategory: blogsByCategory,
        },
        faqs: {
          total: totalFAQs,
          active: activeFAQs,
          byCategory: faqsByCategory,
        },
        popular: {
          blogs: topBlogs,
          faqs: topFAQs,
        },
      },
    });
  } catch (error) {
    logger.error('Lỗi lấy thống kê nội dung:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy thống kê nội dung',
      error: error.message,
    });
  }
};

module.exports = exports;
