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
  Statistic,
  Row,
  Col,
  Spin,
  Alert,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  KeyOutlined,
  ReloadOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { adminUsers } from '../../services/adminApi';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;

const UserManagementPage = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    role: undefined,
    isBlocked: undefined,
    isActive: undefined,
    search: '',
  });

  // Modals
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [blockForm] = Form.useForm();
  const [blockLoading, setBlockLoading] = useState(false);

  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [resetPasswordForm] = Form.useForm();
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await adminUsers.getUsers(params);

      if (response.success) {
        setUsers(response.data.users);
        setPagination({
          ...pagination,
          total: response.data.pagination.total,
        });
      }
    } catch (error) {
      message.error(error || 'Không thể tải danh sách người dùng');
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
      current: 1, // Reset to first page
    });
  };

  const handleSearch = (value) => {
    handleFilterChange('search', value);
  };

  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    setDetailModalVisible(true);
    setLoadingDetails(true);

    try {
      const response = await adminUsers.getUserById(user._id);
      if (response.success) {
        setUserDetails(response.data);
      }
    } catch (error) {
      message.error('Không thể tải thông tin chi tiết');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleBlockUser = (user) => {
    setSelectedUser(user);
    blockForm.resetFields();
    setBlockModalVisible(true);
  };

  const handleBlockSubmit = async (values) => {
    try {
      setBlockLoading(true);
      const response = await adminUsers.blockUser(selectedUser._id, values.reason);

      if (response.success) {
        message.success('Đã khóa tài khoản người dùng');
        setBlockModalVisible(false);
        fetchUsers();
      }
    } catch (error) {
      message.error(error || 'Không thể khóa tài khoản');
    } finally {
      setBlockLoading(false);
    }
  };

  const handleUnblockUser = async (user) => {
    Modal.confirm({
      title: 'Xác nhận mở khóa',
      content: `Bạn có chắc muốn mở khóa tài khoản "${user.fullName || user.email}"?`,
      okText: 'Mở khóa',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await adminUsers.unblockUser(user._id);
          if (response.success) {
            message.success('Đã mở khóa tài khoản');
            fetchUsers();
          }
        } catch (error) {
          message.error(error || 'Không thể mở khóa tài khoản');
        }
      },
    });
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    resetPasswordForm.resetFields();
    setResetPasswordModalVisible(true);
  };

  const handleResetPasswordSubmit = async (values) => {
    try {
      setResetPasswordLoading(true);
      const response = await adminUsers.resetPassword(
        selectedUser._id,
        values.newPassword
      );

      if (response.success) {
        message.success('Đã đặt lại mật khẩu cho người dùng');
        setResetPasswordModalVisible(false);
        resetPasswordForm.resetFields();
      }
    } catch (error) {
      message.error(error || 'Không thể đặt lại mật khẩu');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const columns = [
    {
      title: 'Người Dùng',
      key: 'user',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div>
          <div className="font-semibold text-gray-800">
            {record.fullName || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">{record.email}</div>
          {record.phone && (
            <div className="text-xs text-gray-400">{record.phone}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Vai Trò',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role) => {
        const roleColors = {
          customer: 'blue',
          operator: 'purple',
          trip_manager: 'orange',
          admin: 'red',
        };
        const roleLabels = {
          customer: 'Khách',
          operator: 'Nhà xe',
          trip_manager: 'Quản lý',
          admin: 'Admin',
        };
        return (
          <Tag color={roleColors[role] || 'default'}>
            {roleLabels[role] || role}
          </Tag>
        );
      },
    },
    {
      title: 'Trạng Thái',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          {record.isBlocked ? (
            <Tag color="red" icon={<CloseCircleOutlined />}>
              Đã khóa
            </Tag>
          ) : (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              Hoạt động
            </Tag>
          )}
          {!record.isActive && (
            <Tag color="orange">Chưa kích hoạt</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Đặt Vé',
      dataIndex: 'totalBookings',
      key: 'totalBookings',
      width: 100,
      align: 'center',
      render: (total) => (
        <span className="font-semibold text-blue-600">{total || 0}</span>
      ),
    },
    {
      title: 'Tổng Chi Tiêu',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      width: 150,
      align: 'right',
      render: (amount) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(amount || 0)}
        </span>
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
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          {record.isBlocked ? (
            <Tooltip title="Mở khóa">
              <Button
                type="text"
                icon={<UnlockOutlined />}
                onClick={() => handleUnblockUser(record)}
                className="text-green-600 hover:text-green-700"
              />
            </Tooltip>
          ) : (
            <Tooltip title="Khóa tài khoản">
              <Button
                type="text"
                icon={<LockOutlined />}
                onClick={() => handleBlockUser(record)}
                danger
              />
            </Tooltip>
          )}
          <Tooltip title="Reset mật khẩu">
            <Button
              type="text"
              icon={<KeyOutlined />}
              onClick={() => handleResetPassword(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản Lý Người Dùng</h1>
          <p className="text-gray-600 mt-1">
            Quản lý tài khoản và quyền truy cập của người dùng
          </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchUsers}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <Space wrap className="w-full">
          <Search
            placeholder="Tìm theo email, tên, SĐT..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
          <Select
            placeholder="Vai trò"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange('role', value)}
            value={filters.role}
          >
            <Option value="customer">Khách hàng</Option>
            <Option value="operator">Nhà xe</Option>
            <Option value="trip_manager">Quản lý chuyến</Option>
            <Option value="admin">Admin</Option>
          </Select>
          <Select
            placeholder="Trạng thái khóa"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange('isBlocked', value)}
            value={filters.isBlocked}
          >
            <Option value="true">Đã khóa</Option>
            <Option value="false">Hoạt động</Option>
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
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* User Detail Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <UserOutlined className="text-blue-600" />
            <span>Chi Tiết Người Dùng</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {loadingDetails ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : userDetails ? (
          <div className="space-y-6">
            {/* User Info */}
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Họ Tên" span={2}>
                {userDetails.user.fullName || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {userDetails.user.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số Điện Thoại">
                {userDetails.user.phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Vai Trò">
                <Tag color="blue">{userDetails.user.role}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng Thái">
                {userDetails.user.isBlocked ? (
                  <Tag color="red">Đã khóa</Tag>
                ) : (
                  <Tag color="green">Hoạt động</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày Đăng Ký" span={2}>
                {dayjs(userDetails.user.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              {userDetails.user.isBlocked && (
                <>
                  <Descriptions.Item label="Lý Do Khóa" span={2}>
                    <Alert
                      message={userDetails.user.blockedReason}
                      type="error"
                      showIcon
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày Khóa" span={2}>
                    {dayjs(userDetails.user.blockedAt).format('DD/MM/YYYY HH:mm')}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>

            {/* Booking Statistics */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Thống Kê Đặt Vé</h3>
              <Row gutter={16}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Tổng Đặt Vé"
                      value={userDetails.stats.totalBookings}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Đã Thanh Toán"
                      value={userDetails.stats.paidBookings}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Đã Hủy"
                      value={userDetails.stats.cancelledBookings}
                      valueStyle={{ color: '#f5222d' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Tổng Chi Tiêu"
                      value={userDetails.stats.totalSpent}
                      formatter={(value) => formatCurrency(value)}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
              </Row>
            </div>

            {/* Recent Bookings */}
            {userDetails.recentBookings && userDetails.recentBookings.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Đặt Vé Gần Đây</h3>
                <Table
                  dataSource={userDetails.recentBookings}
                  rowKey="_id"
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: 'Mã Đặt Vé',
                      dataIndex: 'bookingCode',
                      key: 'bookingCode',
                    },
                    {
                      title: 'Tuyến',
                      key: 'route',
                      render: (_, record) =>
                        record.tripId?.routeId?.routeName || 'N/A',
                    },
                    {
                      title: 'Số Ghế',
                      dataIndex: 'seats',
                      key: 'seats',
                      render: (seats) => seats?.length || 0,
                    },
                    {
                      title: 'Tổng Tiền',
                      dataIndex: 'finalPrice',
                      key: 'finalPrice',
                      render: (price) => formatCurrency(price),
                    },
                    {
                      title: 'Trạng Thái',
                      dataIndex: 'paymentStatus',
                      key: 'paymentStatus',
                      render: (status) => {
                        const colors = {
                          paid: 'green',
                          pending: 'orange',
                          cancelled: 'red',
                          refunded: 'purple',
                        };
                        return <Tag color={colors[status]}>{status}</Tag>;
                      },
                    },
                  ]}
                />
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Block User Modal */}
      <Modal
        title="Khóa Tài Khoản"
        open={blockModalVisible}
        onCancel={() => setBlockModalVisible(false)}
        onOk={() => blockForm.submit()}
        confirmLoading={blockLoading}
        okText="Khóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <Form form={blockForm} layout="vertical" onFinish={handleBlockSubmit}>
          <Alert
            message="Cảnh báo"
            description={`Bạn đang khóa tài khoản "${selectedUser?.fullName || selectedUser?.email}". Người dùng sẽ không thể đăng nhập sau khi bị khóa.`}
            type="warning"
            showIcon
            className="mb-4"
          />
          <Form.Item
            name="reason"
            label="Lý Do Khóa"
            rules={[{ required: true, message: 'Vui lòng nhập lý do khóa tài khoản' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập lý do khóa tài khoản..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        title="Đặt Lại Mật Khẩu"
        open={resetPasswordModalVisible}
        onCancel={() => setResetPasswordModalVisible(false)}
        onOk={() => resetPasswordForm.submit()}
        confirmLoading={resetPasswordLoading}
        okText="Đặt Lại"
        cancelText="Hủy"
      >
        <Form
          form={resetPasswordForm}
          layout="vertical"
          onFinish={handleResetPasswordSubmit}
        >
          <Alert
            message="Thông báo"
            description={`Bạn đang đặt lại mật khẩu cho "${selectedUser?.fullName || selectedUser?.email}".`}
            type="info"
            showIcon
            className="mb-4"
          />
          <Form.Item
            name="newPassword"
            label="Mật Khẩu Mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
