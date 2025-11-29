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
  Image,
  Alert,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  StopOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { adminOperators } from '../../services/adminApi';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const OperatorManagementPage = () => {
  const [loading, setLoading] = useState(false);
  const [operators, setOperators] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    verificationStatus: undefined,
    isSuspended: undefined,
    isActive: undefined,
    search: '',
  });

  // Modals
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectForm] = Form.useForm();
  const [rejectLoading, setRejectLoading] = useState(false);

  const [suspendModalVisible, setSuspendModalVisible] = useState(false);
  const [suspendForm] = Form.useForm();
  const [suspendLoading, setSuspendLoading] = useState(false);

  useEffect(() => {
    fetchOperators();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await adminOperators.getOperators(params);

      if (response.status === 'success') {
        setOperators(response.data.operators);
        setPagination({
          ...pagination,
          total: response.data.pagination.total,
        });
      }
    } catch (error) {
      message.error(error || 'Không thể tải danh sách nhà xe');
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

  const handleViewDetails = async (operator) => {
    try {
      const response = await adminOperators.getOperatorById(operator._id);
      if (response.status === 'success') {
        setSelectedOperator(response.data.operator);
        setDetailModalVisible(true);
      }
    } catch (error) {
      message.error('Không thể tải thông tin chi tiết');
    }
  };

  const handleApprove = (operator) => {
    Modal.confirm({
      title: 'Xác Nhận Duyệt Nhà Xe',
      content: `Bạn có chắc muốn duyệt nhà xe "${operator.companyName}"?`,
      okText: 'Duyệt',
      cancelText: 'Hủy',
      okButtonProps: { type: 'primary' },
      onOk: async () => {
        try {
          const response = await adminOperators.approveOperator(operator._id);
          if (response.status === 'success') {
            message.success('Đã duyệt nhà xe thành công');
            fetchOperators();
          }
        } catch (error) {
          message.error(error || 'Không thể duyệt nhà xe');
        }
      },
    });
  };

  const handleReject = (operator) => {
    setSelectedOperator(operator);
    rejectForm.resetFields();
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = async (values) => {
    try {
      setRejectLoading(true);
      const response = await adminOperators.rejectOperator(
        selectedOperator._id,
        values.reason
      );

      if (response.status === 'success') {
        message.success('Đã từ chối nhà xe');
        setRejectModalVisible(false);
        fetchOperators();
      }
    } catch (error) {
      message.error(error || 'Không thể từ chối nhà xe');
    } finally {
      setRejectLoading(false);
    }
  };

  const handleSuspend = (operator) => {
    setSelectedOperator(operator);
    suspendForm.resetFields();
    setSuspendModalVisible(true);
  };

  const handleSuspendSubmit = async (values) => {
    try {
      setSuspendLoading(true);
      const response = await adminOperators.suspendOperator(
        selectedOperator._id,
        values.reason
      );

      if (response.status === 'success') {
        message.success('Đã tạm ngưng nhà xe');
        setSuspendModalVisible(false);
        fetchOperators();
      }
    } catch (error) {
      message.error(error || 'Không thể tạm ngưng nhà xe');
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleResume = (operator) => {
    Modal.confirm({
      title: 'Xác Nhận Khôi Phục',
      content: `Bạn có chắc muốn khôi phục hoạt động của nhà xe "${operator.companyName}"?`,
      okText: 'Khôi Phục',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await adminOperators.resumeOperator(operator._id);
          if (response.status === 'success') {
            message.success('Đã khôi phục nhà xe');
            fetchOperators();
          }
        } catch (error) {
          message.error(error || 'Không thể khôi phục nhà xe');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Nhà Xe',
      key: 'operator',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <Image
            src={record.logo || 'https://via.placeholder.com/50'}
            alt={record.companyName}
            width={50}
            height={50}
            className="rounded-lg object-cover"
            fallback="https://via.placeholder.com/50"
          />
          <div>
            <div className="font-semibold text-gray-800">
              {record.companyName}
            </div>
            <div className="text-sm text-gray-500">{record.email}</div>
            {record.phone && (
              <div className="text-xs text-gray-400">{record.phone}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng Thái Xác Minh',
      dataIndex: 'verificationStatus',
      key: 'verificationStatus',
      width: 150,
      render: (status) => {
        const statusConfig = {
          pending: { color: 'orange', label: 'Chờ duyệt' },
          approved: { color: 'green', label: 'Đã duyệt' },
          rejected: { color: 'red', label: 'Từ chối' },
        };
        const config = statusConfig[status] || { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Hoạt Động',
      key: 'activity',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          {record.isSuspended ? (
            <Tag color="red" icon={<StopOutlined />}>
              Tạm ngưng
            </Tag>
          ) : (
            <Tag color="green" icon={<CheckOutlined />}>
              Hoạt động
            </Tag>
          )}
          {!record.isActive && <Tag color="orange">Chưa kích hoạt</Tag>}
        </Space>
      ),
    },
    {
      title: 'Xếp Hạng',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      align: 'center',
      render: (rating) => (
        <div className="font-semibold text-yellow-600">
          ⭐ {rating?.toFixed(1) || 'N/A'}
        </div>
      ),
    },
    {
      title: 'Số Đánh Giá',
      dataIndex: 'reviewCount',
      key: 'reviewCount',
      width: 120,
      align: 'center',
      render: (count) => (
        <span className="text-gray-600">{count || 0} đánh giá</span>
      ),
    },
    {
      title: 'Ngày Đăng Ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Hành Động',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          {record.verificationStatus === 'pending' && (
            <>
              <Tooltip title="Duyệt">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(record)}
                  className="text-green-600 hover:text-green-700"
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => handleReject(record)}
                  danger
                />
              </Tooltip>
            </>
          )}
          {record.verificationStatus === 'approved' && (
            <>
              {record.isSuspended ? (
                <Tooltip title="Khôi phục">
                  <Button
                    type="text"
                    icon={<PlayCircleOutlined />}
                    onClick={() => handleResume(record)}
                    className="text-green-600 hover:text-green-700"
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Tạm ngưng">
                  <Button
                    type="text"
                    icon={<StopOutlined />}
                    onClick={() => handleSuspend(record)}
                    danger
                  />
                </Tooltip>
              )}
            </>
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
          <h1 className="text-3xl font-bold text-gray-800">Quản Lý Nhà Xe</h1>
          <p className="text-gray-600 mt-1">
            Duyệt và quản lý các nhà xe trên hệ thống
          </p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchOperators} loading={loading}>
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <Space wrap className="w-full">
          <Search
            placeholder="Tìm theo tên nhà xe, email..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
          <Select
            placeholder="Trạng thái xác minh"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => handleFilterChange('verificationStatus', value)}
            value={filters.verificationStatus}
          >
            <Option value="pending">Chờ duyệt</Option>
            <Option value="approved">Đã duyệt</Option>
            <Option value="rejected">Từ chối</Option>
          </Select>
          <Select
            placeholder="Trạng thái hoạt động"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => handleFilterChange('isSuspended', value)}
            value={filters.isSuspended}
          >
            <Option value="false">Đang hoạt động</Option>
            <Option value="true">Đã tạm ngưng</Option>
          </Select>
          <Select
            placeholder="Trạng thái kích hoạt"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => handleFilterChange('isActive', value)}
            value={filters.isActive}
          >
            <Option value="true">Đã kích hoạt</Option>
            <Option value="false">Chưa kích hoạt</Option>
          </Select>
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={operators}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Operator Detail Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <ShopOutlined className="text-purple-600" />
            <span>Chi Tiết Nhà Xe</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedOperator && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="flex items-start space-x-4">
              <Image
                src={selectedOperator.logo || 'https://via.placeholder.com/100'}
                alt={selectedOperator.companyName}
                width={100}
                height={100}
                className="rounded-lg"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{selectedOperator.companyName}</h2>
                <p className="text-gray-600">{selectedOperator.email}</p>
                <Space className="mt-2">
                  <Tag
                    color={
                      selectedOperator.verificationStatus === 'approved'
                        ? 'green'
                        : selectedOperator.verificationStatus === 'pending'
                        ? 'orange'
                        : 'red'
                    }
                  >
                    {selectedOperator.verificationStatus}
                  </Tag>
                  {selectedOperator.isSuspended && (
                    <Tag color="red">Tạm ngưng</Tag>
                  )}
                </Space>
              </div>
            </div>

            {/* Detailed Info */}
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Tên Công Ty" span={2}>
                {selectedOperator.companyName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOperator.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số Điện Thoại">
                {selectedOperator.phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa Chỉ" span={2}>
                {selectedOperator.address || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Số Đăng Ký Kinh Doanh">
                {selectedOperator.businessRegistrationNumber || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Mã Số Thuế">
                {selectedOperator.taxCode || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Xếp Hạng">
                ⭐ {selectedOperator.rating?.toFixed(1) || 'N/A'} (
                {selectedOperator.reviewCount || 0} đánh giá)
              </Descriptions.Item>
              <Descriptions.Item label="Ngày Đăng Ký">
                {dayjs(selectedOperator.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>

            {/* Description */}
            {selectedOperator.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Mô Tả</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedOperator.description}
                </p>
              </div>
            )}

            {/* Verification Documents */}
            {selectedOperator.verificationDocuments &&
              selectedOperator.verificationDocuments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Tài Liệu Xác Minh</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedOperator.verificationDocuments.map((doc, index) => (
                      <Image
                        key={index}
                        src={doc}
                        alt={`Document ${index + 1}`}
                        className="rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

            {/* Rejection/Suspension Info */}
            {selectedOperator.verificationStatus === 'rejected' &&
              selectedOperator.rejectionReason && (
                <Alert
                  message="Lý Do Từ Chối"
                  description={selectedOperator.rejectionReason}
                  type="error"
                  showIcon
                />
              )}
            {selectedOperator.isSuspended && selectedOperator.suspensionReason && (
              <Alert
                message="Lý Do Tạm Ngưng"
                description={selectedOperator.suspensionReason}
                type="warning"
                showIcon
              />
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ Chối Nhà Xe"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onOk={() => rejectForm.submit()}
        confirmLoading={rejectLoading}
        okText="Từ Chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <Form form={rejectForm} layout="vertical" onFinish={handleRejectSubmit}>
          <Alert
            message="Cảnh báo"
            description={`Bạn đang từ chối đăng ký nhà xe "${selectedOperator?.companyName}".`}
            type="warning"
            showIcon
            className="mb-4"
          />
          <Form.Item
            name="reason"
            label="Lý Do Từ Chối"
            rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}
          >
            <TextArea rows={4} placeholder="Nhập lý do từ chối..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Suspend Modal */}
      <Modal
        title="Tạm Ngưng Nhà Xe"
        open={suspendModalVisible}
        onCancel={() => setSuspendModalVisible(false)}
        onOk={() => suspendForm.submit()}
        confirmLoading={suspendLoading}
        okText="Tạm Ngưng"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <Form form={suspendForm} layout="vertical" onFinish={handleSuspendSubmit}>
          <Alert
            message="Cảnh báo"
            description={`Bạn đang tạm ngưng hoạt động của nhà xe "${selectedOperator?.companyName}".`}
            type="warning"
            showIcon
            className="mb-4"
          />
          <Form.Item
            name="reason"
            label="Lý Do Tạm Ngưng"
            rules={[{ required: true, message: 'Vui lòng nhập lý do tạm ngưng' }]}
          >
            <TextArea rows={4} placeholder="Nhập lý do tạm ngưng..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OperatorManagementPage;
