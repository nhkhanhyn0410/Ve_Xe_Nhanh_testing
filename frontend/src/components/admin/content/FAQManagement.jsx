import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
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
} from '@ant-design/icons';
import { adminContent } from '../../../services/adminApi';

const { TextArea } = Input;
const { Option } = Select;

const FAQManagement = () => {
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await adminContent.faqs.getAll();
      if (response.status === 'success') {
        setFaqs(response.data);
      }
    } catch (error) {
      message.error(error || 'Không thể tải danh sách FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingFaq(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    form.setFieldsValue(faq);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await adminContent.faqs.delete(id);
      if (response.status === 'success') {
        message.success('Đã xóa FAQ');
        fetchFAQs();
      }
    } catch (error) {
      message.error(error || 'Không thể xóa FAQ');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingFaq) {
        await adminContent.faqs.update(editingFaq._id, values);
        message.success('Đã cập nhật FAQ');
      } else {
        await adminContent.faqs.create(values);
        message.success('Đã tạo FAQ mới');
      }

      setModalVisible(false);
      fetchFAQs();
    } catch (error) {
      message.error(error || 'Có lỗi xảy ra');
    }
  };

  const columns = [
    {
      title: 'Câu Hỏi',
      dataIndex: 'question',
      key: 'question',
      width: 300,
      ellipsis: true,
    },
    {
      title: 'Danh Mục',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category) => {
        const categories = {
          booking: 'Đặt vé',
          payment: 'Thanh toán',
          policy: 'Chính sách',
          general: 'Chung',
          account: 'Tài khoản',
        };
        return <Tag>{categories[category] || category}</Tag>;
      },
    },
    {
      title: 'Thứ Tự',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      align: 'center',
    },
    {
      title: 'Lượt Xem',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 100,
      align: 'center',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive) =>
        isActive ? (
          <Tag color="green">Hiển thị</Tag>
        ) : (
          <Tag>Ẩn</Tag>
        ),
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
            title="Xác nhận xóa FAQ?"
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
        <h3 className="text-lg font-semibold">Quản Lý FAQs</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Tạo FAQ Mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={faqs}
        rowKey="_id"
        loading={loading}
        scroll={{ x: 900 }}
      />

      <Modal
        title={editingFaq ? 'Chỉnh Sửa FAQ' : 'Tạo FAQ Mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
        okText={editingFaq ? 'Cập Nhật' : 'Tạo'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="question"
            label="Câu Hỏi"
            rules={[{ required: true, message: 'Vui lòng nhập câu hỏi' }]}
          >
            <Input placeholder="Nhập câu hỏi..." />
          </Form.Item>

          <Form.Item
            name="answer"
            label="Câu Trả Lời"
            rules={[{ required: true, message: 'Vui lòng nhập câu trả lời' }]}
          >
            <TextArea rows={6} placeholder="Nhập câu trả lời chi tiết..." />
          </Form.Item>

          <Form.Item
            name="category"
            label="Danh Mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select placeholder="Chọn danh mục">
              <Option value="booking">Đặt vé</Option>
              <Option value="payment">Thanh toán</Option>
              <Option value="policy">Chính sách</Option>
              <Option value="general">Chung</Option>
              <Option value="account">Tài khoản</Option>
            </Select>
          </Form.Item>

          <Form.Item name="order" label="Thứ Tự">
            <Input type="number" placeholder="1" />
          </Form.Item>

          <Form.Item name="tags" label="Tags">
            <Select mode="tags" placeholder="Nhập tags...">
              <Option value="booking">Đặt vé</Option>
              <Option value="payment">Thanh toán</Option>
              <Option value="refund">Hoàn tiền</Option>
              <Option value="policy">Chính sách</Option>
            </Select>
          </Form.Item>

          <Form.Item name="isActive" label="Hiển Thị" valuePropName="checked">
            <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FAQManagement;
