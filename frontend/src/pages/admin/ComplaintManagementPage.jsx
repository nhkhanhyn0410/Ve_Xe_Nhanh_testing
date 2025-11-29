import { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  message,
  Tooltip,
  Descriptions,
  Timeline,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  CheckOutlined,
  ReloadOutlined,
  CustomerServiceOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { adminComplaints } from '../../services/adminApi';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const ComplaintManagementPage = () => {
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: undefined,
    category: undefined,
    priority: undefined,
    search: '',
  });

  // Modals
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [resolveForm] = Form.useForm();
  const [resolveLoading, setResolveLoading] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await adminComplaints.getComplaints(params);

      if (response.status === 'success') {
        setComplaints(response.data);
        setPagination({
          ...pagination,
          total: response.pagination?.total || response.data.length,
        });
      }
    } catch (error) {
      message.error(error || 'Không thể tải danh sách khiếu nại');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
    });
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const handleSearch = (value) => {
    handleFilterChange('search', value);
  };

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setDetailModalVisible(true);
  };

  const handleUpdateStatus = async (complaint, newStatus) => {
    try {
      const response = await adminComplaints.updateStatus(complaint._id, newStatus);
      if (response.status === 'success') {
        message.success('Đã cập nhật trạng thái');
        fetchComplaints();
      }
    } catch (error) {
      message.error(error || 'Không thể cập nhật trạng thái');
    }
  };

  const handleUpdatePriority = async (complaint, newPriority) => {
    try {
      const response = await adminComplaints.updatePriority(
        complaint._id,
        newPriority
      );
      if (response.status === 'success') {
        message.success('Đã cập nhật độ ưu tiên');
        fetchComplaints();
      }
    } catch (error) {
      message.error(error || 'Không thể cập nhật độ ưu tiên');
    }
  };

  const handleResolve = (complaint) => {
    setSelectedComplaint(complaint);
    resolveForm.resetFields();
    setResolveModalVisible(true);
  };

  const handleResolveSubmit = async (values) => {
    try {
      setResolveLoading(true);
      const response = await adminComplaints.resolveComplaint(
        selectedComplaint._id,
        values.resolution
      );

      if (response.status === 'success') {
        message.success('Đã giải quyết khiếu nại');
        setResolveModalVisible(false);
        fetchComplaints();
      }
    } catch (error) {
      message.error(error || 'Không thể giải quyết khiếu nại');
    } finally {
      setResolveLoading(false);
    }
  };

  const statusColors = {
    open: 'orange',
    in_progress: 'blue',
    resolved: 'green',
    closed: 'gray',
    rejected: 'red',
  };

  const statusLabels = {
    open: 'Mới',
    in_progress: 'Đang xử lý',
    resolved: 'Đã giải quyết',
    closed: 'Đã đóng',
    rejected: 'Từ chối',
  };

  const priorityColors = {
    low: 'green',
    medium: 'orange',
    high: 'red',
    urgent: 'purple',
  };

  const priorityLabels = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
    urgent: 'Khẩn cấp',
  };

  const categoryLabels = {
    booking_issue: 'Vấn đề đặt vé',
    payment_issue: 'Vấn đề thanh toán',
    service_quality: 'Chất lượng dịch vụ',
    vehicle_issue: 'Vấn đề xe',
    driver_issue: 'Vấn đề tài xế',
    refund_request: 'Yêu cầu hoàn tiền',
    other: 'Khác',
  };

  const columns = [
    {
      title: 'Mã Ticket',
      dataIndex: 'ticketNumber',
      key: 'ticketNumber',
      width: 120,
      render: (ticketNumber) => (
        <span className="font-mono font-semibold text-blue-600">
          {ticketNumber}
        </span>
      ),
    },
    {
      title: 'Tiêu Đề',
      dataIndex: 'subject',
      key: 'subject',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Người Gửi',
      key: 'user',
      width: 180,
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-800">
            {record.userId?.fullName || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">{record.userEmail}</div>
        </div>
      ),
    },
    {
      title: 'Danh Mục',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category) => (
        <Tag>{categoryLabels[category] || category}</Tag>
      ),
    },
    {
      title: 'Độ Ưu Tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      render: (priority, record) => (
        <Select
          value={priority}
          onChange={(value) => handleUpdatePriority(record, value)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="low">
            <Tag color={priorityColors.low}>Thấp</Tag>
          </Option>
          <Option value="medium">
            <Tag color={priorityColors.medium}>Trung bình</Tag>
          </Option>
          <Option value="high">
            <Tag color={priorityColors.high}>Cao</Tag>
          </Option>
          <Option value="urgent">
            <Tag color={priorityColors.urgent}>Khẩn cấp</Tag>
          </Option>
        </Select>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleUpdateStatus(record, value)}
          style={{ width: '100%' }}
          size="small"
        >
          <Option value="open">
            <Tag color={statusColors.open}>Mới</Tag>
          </Option>
          <Option value="in_progress">
            <Tag color={statusColors.in_progress}>Đang xử lý</Tag>
          </Option>
          <Option value="resolved">
            <Tag color={statusColors.resolved}>Đã giải quyết</Tag>
          </Option>
          <Option value="closed">
            <Tag color={statusColors.closed}>Đã đóng</Tag>
          </Option>
          <Option value="rejected">
            <Tag color={statusColors.rejected}>Từ chối</Tag>
          </Option>
        </Select>
      ),
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
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          {record.status !== 'resolved' && record.status !== 'closed' && (
            <Tooltip title="Giải quyết">
              <Button
                type="text"
                icon={<CheckOutlined />}
                onClick={() => handleResolve(record)}
                className="text-green-600 hover:text-green-700"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản Lý Khiếu Nại</h1>
          <p className="text-gray-600 mt-1">
            Xử lý và theo dõi các khiếu nại từ khách hàng
          </p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchComplaints} loading={loading}>
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <Space wrap className="w-full">
          <Search
            placeholder="Tìm theo mã ticket, tiêu đề..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange('status', value)}
            value={filters.status}
          >
            <Option value="open">Mới</Option>
            <Option value="in_progress">Đang xử lý</Option>
            <Option value="resolved">Đã giải quyết</Option>
            <Option value="closed">Đã đóng</Option>
            <Option value="rejected">Từ chối</Option>
          </Select>
          <Select
            placeholder="Độ ưu tiên"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange('priority', value)}
            value={filters.priority}
          >
            <Option value="low">Thấp</Option>
            <Option value="medium">Trung bình</Option>
            <Option value="high">Cao</Option>
            <Option value="urgent">Khẩn cấp</Option>
          </Select>
          <Select
            placeholder="Danh mục"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => handleFilterChange('category', value)}
            value={filters.category}
          >
            <Option value="booking_issue">Vấn đề đặt vé</Option>
            <Option value="payment_issue">Vấn đề thanh toán</Option>
            <Option value="service_quality">Chất lượng dịch vụ</Option>
            <Option value="vehicle_issue">Vấn đề xe</Option>
            <Option value="driver_issue">Vấn đề tài xế</Option>
            <Option value="refund_request">Yêu cầu hoàn tiền</Option>
            <Option value="other">Khác</Option>
          </Select>
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={complaints}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Complaint Detail Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <CustomerServiceOutlined className="text-blue-600" />
            <span>Chi Tiết Khiếu Nại</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedComplaint && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{selectedComplaint.subject}</h3>
                <p className="text-gray-500 font-mono">
                  {selectedComplaint.ticketNumber}
                </p>
              </div>
              <Space>
                <Badge
                  status={
                    statusColors[selectedComplaint.status] === 'green'
                      ? 'success'
                      : statusColors[selectedComplaint.status] === 'red'
                      ? 'error'
                      : 'processing'
                  }
                  text={statusLabels[selectedComplaint.status]}
                />
                <Tag color={priorityColors[selectedComplaint.priority]}>
                  {priorityLabels[selectedComplaint.priority]}
                </Tag>
              </Space>
            </div>

            {/* Details */}
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Người Gửi" span={2}>
                <div>
                  <div className="font-medium">
                    {selectedComplaint.userId?.fullName || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedComplaint.userEmail} • {selectedComplaint.userPhone}
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Danh Mục">
                {categoryLabels[selectedComplaint.category]}
              </Descriptions.Item>
              <Descriptions.Item label="Mã Đặt Vé">
                {selectedComplaint.bookingId?.bookingCode || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày Tạo" span={2}>
                {dayjs(selectedComplaint.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>

            {/* Description */}
            <div>
              <h4 className="font-semibold mb-2">Nội Dung Khiếu Nại</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap text-gray-700">
                  {selectedComplaint.description}
                </p>
              </div>
            </div>

            {/* Resolution */}
            {selectedComplaint.resolution && (
              <div>
                <h4 className="font-semibold mb-2">Phương Án Giải Quyết</h4>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {selectedComplaint.resolution}
                  </p>
                  {selectedComplaint.resolvedAt && (
                    <p className="text-sm text-gray-500 mt-2">
                      Giải quyết lúc:{' '}
                      {dayjs(selectedComplaint.resolvedAt).format('DD/MM/YYYY HH:mm')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            {selectedComplaint.notes && selectedComplaint.notes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Lịch Sử Xử Lý</h4>
                <Timeline>
                  {selectedComplaint.notes.map((note, index) => (
                    <Timeline.Item
                      key={index}
                      dot={<ClockCircleOutlined />}
                      color="blue"
                    >
                      <div>
                        <p className="text-gray-700">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {dayjs(note.createdAt).format('DD/MM/YYYY HH:mm')} •{' '}
                          {note.addedBy?.fullName || 'System'}
                        </p>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Resolve Modal */}
      <Modal
        title="Giải Quyết Khiếu Nại"
        open={resolveModalVisible}
        onCancel={() => setResolveModalVisible(false)}
        onOk={() => resolveForm.submit()}
        confirmLoading={resolveLoading}
        okText="Giải Quyết"
        cancelText="Hủy"
        width={600}
      >
        <Form form={resolveForm} layout="vertical" onFinish={handleResolveSubmit}>
          <Form.Item
            name="resolution"
            label="Phương Án Giải Quyết"
            rules={[
              { required: true, message: 'Vui lòng nhập phương án giải quyết' },
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Mô tả chi tiết cách giải quyết khiếu nại..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ComplaintManagementPage;
