import { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Button,
  message,
  Space,
  Alert,
} from 'antd';
import {
  ExclamationCircleOutlined,
  InboxOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { MdReportProblem } from 'react-icons/md';
import { FaTicketAlt } from 'react-icons/fa';
import { createComplaint } from '../services/complaintApi';

const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const CreateComplaintModal = ({ open, onCancel, onSuccess, booking = null }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const categories = [
    { value: 'booking', label: 'Đặt vé', icon: '🎫' },
    { value: 'payment', label: 'Thanh toán', icon: '💳' },
    { value: 'service', label: 'Dịch vụ', icon: '🤝' },
    { value: 'driver', label: 'Tài xế', icon: '👨‍✈️' },
    { value: 'vehicle', label: 'Xe', icon: '🚌' },
    { value: 'refund', label: 'Hoàn tiền', icon: '💰' },
    { value: 'technical', label: 'Kỹ thuật', icon: '⚙️' },
    { value: 'other', label: 'Khác', icon: '📝' },
  ];

  const priorities = [
    { value: 'low', label: 'Thấp', color: '#52c41a' },
    { value: 'medium', label: 'Trung bình', color: '#1890ff' },
    { value: 'high', label: 'Cao', color: '#fa8c16' },
    { value: 'urgent', label: 'Khẩn cấp', color: '#f5222d' },
  ];

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const complaintData = {
        subject: values.subject,
        description: values.description,
        category: values.category,
        priority: values.priority || 'medium',
        bookingId: booking?._id || values.bookingId,
        attachments: fileList.map((file) => ({
          fileName: file.name,
          fileUrl: file.url || file.response?.url,
          fileType: file.type,
        })),
      };

      const response = await createComplaint(complaintData);

      if (response.status === 'success') {
        message.success('Tạo khiếu nại thành công! Mã ticket: ' + response.data.ticketNumber);
        form.resetFields();
        setFileList([]);
        onSuccess && onSuccess(response.data);
      }
    } catch (error) {
      console.error('Error creating complaint:', error);
      message.error(error.response?.data?.message || 'Không thể tạo khiếu nại');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  const uploadProps = {
    multiple: true,
    fileList: fileList,
    beforeUpload: (file) => {
      // Check file size (max 5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('File phải nhỏ hơn 5MB!');
        return false;
      }

      // For now, just store the file in state
      // In production, you'd upload to a file storage service
      setFileList((prev) => [...prev, file]);
      return false; // Prevent auto upload
    },
    onRemove: (file) => {
      setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
    },
  };

  return (
    <Modal
      title={
        <Space>
          <MdReportProblem className="text-orange-500 text-2xl" />
          <span className="text-lg font-semibold">Tạo khiếu nại</span>
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      {/* Info Alert */}
      <Alert
        message="Chúng tôi sẽ xử lý khiếu nại của bạn trong vòng 24-48 giờ"
        description="Vui lòng cung cấp đầy đủ thông tin để chúng tôi có thể hỗ trợ bạn tốt nhất."
        type="info"
        showIcon
        className="mb-4"
        icon={<ExclamationCircleOutlined />}
      />

      {/* Booking Info if provided */}
      {booking && (
        <Alert
          message={
            <Space>
              <FaTicketAlt />
              <span>
                Khiếu nại cho vé: <strong>{booking.bookingCode}</strong>
              </span>
            </Space>
          }
          type="success"
          className="mb-4"
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          priority: 'medium',
        }}
      >
        {/* Category */}
        <Form.Item
          label={
            <span className="font-semibold">
              <FileTextOutlined className="mr-1" />
              Danh mục khiếu nại
            </span>
          }
          name="category"
          rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
        >
          <Select
            placeholder="Chọn danh mục khiếu nại"
            size="large"
            showSearch
            optionFilterProp="children"
          >
            {categories.map((cat) => (
              <Option key={cat.value} value={cat.value}>
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Priority */}
        <Form.Item
          label={<span className="font-semibold">Mức độ ưu tiên</span>}
          name="priority"
        >
          <Select size="large">
            {priorities.map((p) => (
              <Option key={p.value} value={p.value}>
                <Space>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.label}
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Subject */}
        <Form.Item
          label={<span className="font-semibold">Tiêu đề</span>}
          name="subject"
          rules={[
            { required: true, message: 'Vui lòng nhập tiêu đề!' },
            { max: 200, message: 'Tiêu đề không quá 200 ký tự!' },
          ]}
        >
          <Input
            placeholder="Nhập tiêu đề ngắn gọn cho khiếu nại"
            size="large"
            showCount
            maxLength={200}
          />
        </Form.Item>

        {/* Description */}
        <Form.Item
          label={<span className="font-semibold">Mô tả chi tiết</span>}
          name="description"
          rules={[
            { required: true, message: 'Vui lòng mô tả chi tiết vấn đề!' },
            { min: 20, message: 'Mô tả phải có ít nhất 20 ký tự!' },
          ]}
        >
          <TextArea
            rows={6}
            placeholder="Vui lòng mô tả chi tiết vấn đề của bạn..."
            showCount
            maxLength={2000}
          />
        </Form.Item>

        {/* File Upload */}
        <Form.Item
          label={<span className="font-semibold">Tệp đính kèm (tùy chọn)</span>}
        >
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Nhấp hoặc kéo thả file vào đây</p>
            <p className="ant-upload-hint">
              Hỗ trợ file ảnh, PDF, Word. Tối đa 5MB mỗi file.
            </p>
          </Dragger>
          {fileList.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Đã chọn {fileList.length} file
            </div>
          )}
        </Form.Item>

        {/* Submit Buttons */}
        <Form.Item className="mb-0">
          <Space className="w-full justify-end">
            <Button onClick={handleCancel} size="large">
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              icon={<MdReportProblem />}
            >
              Gửi khiếu nại
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateComplaintModal;
