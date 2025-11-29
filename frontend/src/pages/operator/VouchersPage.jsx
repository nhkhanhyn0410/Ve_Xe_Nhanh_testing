import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Tag,
  Space,
  Select,
  DatePicker,
  Row,
  Col,
  Card,
  Statistic,
  Switch,
  Divider,
  Tooltip,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  StopOutlined,
  PercentageOutlined,
  DollarOutlined,
  GiftOutlined,
  EyeOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import voucherApi from '../../services/voucherApi';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const VouchersPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [usageModalVisible, setUsageModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [usageReport, setUsageReport] = useState(null);
  const [filters, setFilters] = useState({ isActive: null, search: '' });
  const [form] = Form.useForm();

  useEffect(() => {
    loadVouchers();
    loadStatistics();
  }, [filters]);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const params = {
        isActive: filters.isActive,
        search: filters.search || undefined,
      };
      const response = await voucherApi.getOperatorVouchers(params);
      setVouchers(response.data.vouchers || []);
    } catch (error) {
      message.error('Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await voucherApi.getStatistics();
      setStatistics(response.data.statistics || null);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleCreate = () => {
    setEditingVoucher(null);
    form.resetFields();
    form.setFieldsValue({
      discountType: 'percentage',
      maxUsagePerUser: 1,
      isActive: true,
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingVoucher(record);
    form.setFieldsValue({
      code: record.code,
      description: record.description,
      discountType: record.discountType,
      discountValue: record.discountValue,
      maxDiscount: record.maxDiscount,
      minOrderValue: record.minOrderValue,
      maxUsagePerUser: record.maxUsagePerUser,
      maxTotalUsage: record.maxTotalUsage,
      validFrom: record.validFrom ? dayjs(record.validFrom) : null,
      validUntil: record.validUntil ? dayjs(record.validUntil) : null,
      isActive: record.isActive,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const voucherData = {
        code: values.code,
        description: values.description,
        discountType: values.discountType,
        discountValue: values.discountValue,
        maxDiscount: values.maxDiscount || undefined,
        minOrderValue: values.minOrderValue || undefined,
        maxUsagePerUser: values.maxUsagePerUser,
        maxTotalUsage: values.maxTotalUsage || undefined,
        validFrom: values.validFrom ? values.validFrom.toISOString() : undefined,
        validUntil: values.validUntil ? values.validUntil.toISOString() : undefined,
        isActive: values.isActive,
      };

      if (editingVoucher) {
        await voucherApi.update(editingVoucher._id, voucherData);
        message.success('Cập nhật voucher thành công');
      } else {
        await voucherApi.create(voucherData);
        message.success('Tạo voucher thành công');
      }

      setModalVisible(false);
      loadVouchers();
      loadStatistics();
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      await voucherApi.delete(id);
      message.success('Xóa voucher thành công');
      loadVouchers();
      loadStatistics();
    } catch (error) {
      message.error('Không thể xóa voucher');
    }
  };

  const handleToggleActive = async (record) => {
    try {
      if (record.isActive) {
        await voucherApi.deactivate(record._id);
        message.success('Đã tắt voucher');
      } else {
        await voucherApi.activate(record._id);
        message.success('Đã bật voucher');
      }
      loadVouchers();
      loadStatistics();
    } catch (error) {
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const handleViewUsage = async (record) => {
    try {
      const response = await voucherApi.getUsageReport(record._id);
      setUsageReport(response.data);
      setUsageModalVisible(true);
    } catch (error) {
      message.error('Không thể tải báo cáo sử dụng');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDiscount = (voucher) => {
    if (voucher.discountType === 'percentage') {
      return `${voucher.discountValue}%`;
    } else {
      return formatCurrency(voucher.discountValue);
    }
  };

  const getStatusColor = (voucher) => {
    if (!voucher.isActive) return 'default';
    const now = new Date();
    const validFrom = new Date(voucher.validFrom);
    const validUntil = new Date(voucher.validUntil);

    if (now < validFrom) return 'warning';
    if (now > validUntil) return 'error';
    if (voucher.maxTotalUsage && voucher.usedCount >= voucher.maxTotalUsage) return 'error';

    return 'success';
  };

  const getStatusText = (voucher) => {
    if (!voucher.isActive) return 'Đã tắt';
    const now = new Date();
    const validFrom = new Date(voucher.validFrom);
    const validUntil = new Date(voucher.validUntil);

    if (now < validFrom) return 'Chưa bắt đầu';
    if (now > validUntil) return 'Hết hạn';
    if (voucher.maxTotalUsage && voucher.usedCount >= voucher.maxTotalUsage) return 'Hết lượt';

    return 'Hoạt động';
  };

  const columns = [
    {
      title: 'Mã Voucher',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (code) => <strong style={{ color: '#1890ff' }}>{code}</strong>,
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Loại',
      dataIndex: 'discountType',
      key: 'discountType',
      width: 100,
      render: (type) => (
        <Tag color={type === 'percentage' ? 'blue' : 'green'}>
          {type === 'percentage' ? 'Phần trăm' : 'Cố định'}
        </Tag>
      ),
    },
    {
      title: 'Giảm Giá',
      key: 'discount',
      width: 120,
      render: (_, record) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          {formatDiscount(record)}
        </span>
      ),
    },
    {
      title: 'Đã Dùng',
      key: 'usage',
      width: 130,
      render: (_, record) => (
        <div>
          <div>
            {record.usedCount} / {record.maxTotalUsage || '∞'}
          </div>
          {record.maxTotalUsage && (
            <Progress
              percent={Math.round((record.usedCount / record.maxTotalUsage) * 100)}
              size="small"
              showInfo={false}
            />
          )}
        </div>
      ),
    },
    {
      title: 'Hiệu Lực',
      key: 'validity',
      width: 180,
      render: (_, record) => (
        <div className="text-xs">
          <div>{dayjs(record.validFrom).format('DD/MM/YYYY')}</div>
          <div>{dayjs(record.validUntil).format('DD/MM/YYYY')}</div>
        </div>
      ),
    },
    {
      title: 'Trạng Thái',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Tag color={getStatusColor(record)}>{getStatusText(record)}</Tag>
      ),
    },
    {
      title: 'Hành Động',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem báo cáo">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewUsage(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title={record.isActive ? 'Tắt' : 'Bật'}>
            <Button
              size="small"
              type={record.isActive ? 'default' : 'primary'}
              onClick={() => handleToggleActive(record)}
            >
              {record.isActive ? 'Tắt' : 'Bật'}
            </Button>
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa voucher này?"
            description="Voucher đã xóa không thể khôi phục"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng Voucher"
                value={statistics.totalVouchers}
                prefix={<TagsOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đang Hoạt Động"
                value={statistics.activeVouchers}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng Lượt Dùng"
                value={statistics.totalUsage}
                prefix={<GiftOutlined />}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng Giảm Giá"
                value={statistics.totalDiscount}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#52c41a' }}
                formatter={(value) => formatCurrency(value)}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Header and Filters */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản Lý Voucher</h1>
          <p className="text-gray-600 mt-1">Tạo và quản lý mã giảm giá cho khách hàng</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="large">
          Tạo Voucher Mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <Row gutter={16}>
          <Col xs={24} md={12} lg={8}>
            <Input.Search
              placeholder="Tìm theo mã voucher..."
              allowClear
              onSearch={(value) => setFilters({ ...filters, search: value })}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Select
              placeholder="Lọc theo trạng thái"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => setFilters({ ...filters, isActive: value })}
            >
              <Option value={true}>Đang hoạt động</Option>
              <Option value={false}>Đã tắt</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Vouchers Table */}
      <Table
        dataSource={vouchers}
        columns={columns}
        rowKey="_id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} voucher`,
        }}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editingVoucher ? 'Chỉnh Sửa Voucher' : 'Tạo Voucher Mới'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
        okText={editingVoucher ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Mã Voucher"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã voucher' },
                  { pattern: /^[A-Z0-9_-]+$/, message: 'Chỉ chữ in hoa, số, dấu gạch' },
                ]}
              >
                <Input placeholder="VD: SUMMER2024" disabled={!!editingVoucher} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Trạng thái"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô Tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={2} placeholder="Mô tả chi tiết về voucher" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="discountType"
                label="Loại Giảm Giá"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="percentage">Phần trăm (%)</Option>
                  <Option value="fixed">Cố định (VNĐ)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="discountValue"
                label="Giá Trị Giảm"
                rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Nhập giá trị"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxDiscount"
                label="Giảm Tối Đa (VNĐ)"
                tooltip="Chỉ áp dụng cho loại phần trăm"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Không giới hạn"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="minOrderValue"
                label="Đơn Tối Thiểu (VNĐ)"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Không giới hạn"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxUsagePerUser"
                label="Lượt Dùng/Người"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxTotalUsage"
                label="Tổng Lượt Dùng"
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="Không giới hạn"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="validFrom"
            label="Thời Gian Bắt Đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Chọn ngày giờ"
            />
          </Form.Item>

          <Form.Item
            name="validUntil"
            label="Thời Gian Kết Thúc"
            rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Chọn ngày giờ"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Usage Report Modal */}
      <Modal
        title="Báo Cáo Sử Dụng Voucher"
        open={usageModalVisible}
        onCancel={() => setUsageModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setUsageModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {usageReport && (
          <div className="space-y-4">
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Tổng Lượt Dùng"
                    value={usageReport.totalUsage}
                    prefix={<GiftOutlined />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Tổng Giảm Giá"
                    value={usageReport.totalDiscount}
                    prefix={<DollarOutlined />}
                    formatter={(value) => formatCurrency(value)}
                  />
                </Card>
              </Col>
            </Row>

            <Divider />

            <div>
              <h4 className="font-semibold mb-2">Lịch Sử Sử Dụng Gần Đây</h4>
              {usageReport.recentUsage && usageReport.recentUsage.length > 0 ? (
                <div className="space-y-2">
                  {usageReport.recentUsage.map((usage, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      <div className="flex justify-between text-sm">
                        <span>{usage.userName || 'Khách hàng'}</span>
                        <span className="text-gray-600">
                          {dayjs(usage.usedAt).format('DD/MM/YYYY HH:mm')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Giảm: {formatCurrency(usage.discountAmount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  Chưa có lượt sử dụng nào
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VouchersPage;
