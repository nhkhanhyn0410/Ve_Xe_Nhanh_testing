import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Tag,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { adminContent } from '../../../services/adminApi';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const BlogManagement = () => {
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await adminContent.blogs.getAll();
      if (response.status === 'success') {
        setBlogs(response.data);
      }
    } catch (error) {
      message.error(error || 'Không thể tải danh sách blog');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBlog(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = async (blog) => {
    try {
      const response = await adminContent.blogs.getById(blog._id);
      if (response.status === 'success') {
        setEditingBlog(response.data);
        form.setFieldsValue(response.data);
        setModalVisible(true);
      }
    } catch (error) {
      message.error('Không thể tải chi tiết blog');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await adminContent.blogs.delete(id);
      if (response.status === 'success') {
        message.success('Đã xóa blog');
        fetchBlogs();
      }
    } catch (error) {
      message.error(error || 'Không thể xóa blog');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingBlog) {
        await adminContent.blogs.update(editingBlog._id, values);
        message.success('Đã cập nhật blog');
      } else {
        await adminContent.blogs.create(values);
        message.success('Đã tạo blog mới');
      }

      setModalVisible(false);
      fetchBlogs();
    } catch (error) {
      message.error(error || 'Có lỗi xảy ra');
    }
  };

  const columns = [
    {
      title: 'Tiêu Đề',
      dataIndex: 'title',
      key: 'title',
      width: 300,
    },
    {
      title: 'Danh Mục',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category) => <Tag>{category}</Tag>,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const colors = {
          draft: 'orange',
          published: 'green',
          archived: 'gray',
        };
        const labels = {
          draft: 'Nháp',
          published: 'Đã xuất bản',
          archived: 'Lưu trữ',
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: 'Lượt Xem',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 100,
      align: 'center',
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Hành Động',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xác nhận xóa blog?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Quản Lý Blogs</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Tạo Blog Mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={blogs}
        rowKey="_id"
        loading={loading}
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editingBlog ? 'Chỉnh Sửa Blog' : 'Tạo Blog Mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
        okText={editingBlog ? 'Cập Nhật' : 'Tạo'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Tiêu Đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề blog..." />
          </Form.Item>

          <Form.Item name="slug" label="Slug (URL)">
            <Input placeholder="tieu-de-blog" />
          </Form.Item>

          <Form.Item
            name="excerpt"
            label="Tóm Tắt"
            rules={[{ required: true, message: 'Vui lòng nhập tóm tắt' }]}
          >
            <TextArea rows={2} placeholder="Tóm tắt ngắn gọn..." />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội Dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <TextArea rows={8} placeholder="Nội dung chi tiết..." />
          </Form.Item>

          <Form.Item
            name="featuredImage"
            label="Hình Ảnh Nổi Bật"
            rules={[{ required: true, message: 'Vui lòng nhập URL hình ảnh' }]}
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          <Form.Item name="category" label="Danh Mục">
            <Select placeholder="Chọn danh mục">
              <Option value="news">Tin tức</Option>
              <Option value="guides">Hướng dẫn</Option>
              <Option value="tips">Mẹo hay</Option>
              <Option value="promotions">Khuyến mãi</Option>
            </Select>
          </Form.Item>

          <Form.Item name="tags" label="Tags">
            <Select mode="tags" placeholder="Nhập tags...">
              <Option value="travel">Du lịch</Option>
              <Option value="bus">Xe khách</Option>
              <Option value="booking">Đặt vé</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng Thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Option value="draft">Nháp</Option>
              <Option value="published">Xuất bản</Option>
              <Option value="archived">Lưu trữ</Option>
            </Select>
          </Form.Item>

          <Form.Item name="metaTitle" label="Meta Title (SEO)">
            <Input placeholder="Tiêu đề SEO..." />
          </Form.Item>

          <Form.Item name="metaDescription" label="Meta Description (SEO)">
            <TextArea rows={2} placeholder="Mô tả SEO..." />
          </Form.Item>

          <Form.Item name="metaKeywords" label="Meta Keywords (SEO)">
            <Input placeholder="keywords, separated, by, commas" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlogManagement;
