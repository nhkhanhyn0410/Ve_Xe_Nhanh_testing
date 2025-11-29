import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Card,
  Input,
  Select,
  Spin,
  Modal,
  Form,
  DatePicker,
  TimePicker,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import operatorApi from '../../services/operatorApi';

const { Option } = Select;

const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    loadTrips();
    loadResources();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const response = await operatorApi.trips.getMyTrips();
      console.log('Trips response:', response.data);
      setTrips(response.data?.data?.trips || response.data?.trips || []);
    } catch (error) {
      console.error('Load trips error:', error);
      message.error(error.response?.data?.message || 'Không thể tải danh sách chuyến xe');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async () => {
    try {
      const [routesRes, busesRes, driversRes, managersRes] = await Promise.all([
        operatorApi.routes.getMyRoutes(),
        operatorApi.buses.getMyBuses(),
        operatorApi.employees.getAvailableForTrips('driver'),
        operatorApi.employees.getAvailableForTrips('trip_manager'),
      ]);

      console.log('Routes response:', routesRes.data);
      console.log('Buses response:', busesRes.data);
      console.log('Drivers response:', driversRes.data);
      console.log('Managers response:', managersRes.data);

      setRoutes(routesRes.data?.data?.routes || routesRes.data?.routes || []);
      setBuses(busesRes.data?.data?.buses || busesRes.data?.buses || []);
      setEmployees({
        drivers: driversRes.data?.data?.employees || driversRes.data?.employees || [],
        tripManagers: managersRes.data?.data?.employees || managersRes.data?.employees || [],
      });
    } catch (error) {
      console.error('Load resources error:', error);
      message.error('Không thể tải tài nguyên');
    }
  };

  const handleCreateTrip = async (values) => {
    try {
      const tripData = {
        routeId: values.routeId,
        busId: values.busId,
        driverId: values.driverId,
        tripManagerId: values.tripManagerId,
        departureTime: values.departureDate
          .hour(values.departureTime.hour())
          .minute(values.departureTime.minute())
          .toISOString(),
        arrivalTime: values.arrivalDate
          .hour(values.arrivalTime.hour())
          .minute(values.arrivalTime.minute())
          .toISOString(),
        basePrice: values.basePrice,
      };

      await operatorApi.trips.create(tripData);
      message.success('Tạo chuyến xe thành công');
      setCreateModalVisible(false);
      form.resetFields();
      loadTrips();
    } catch (error) {
      console.error('Create trip error:', error);
      message.error(error.response?.data?.message || 'Tạo chuyến xe thất bại');
    }
  };

  const handleDeleteTrip = async (tripId) => {
    Modal.confirm({
      title: 'Xác nhận xóa chuyến xe',
      content: 'Bạn có chắc chắn muốn xóa chuyến xe này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await operatorApi.trips.delete(tripId);
          message.success('Xóa chuyến xe thành công');
          loadTrips();
        } catch (error) {
          message.error(error.response?.data?.message || 'Xóa chuyến xe thất bại');
        }
      },
    });
  };

  const getStatusTag = (status) => {
    const statusMap = {
      scheduled: { color: 'blue', text: 'Đã lên lịch' },
      ongoing: { color: 'green', text: 'Đang chạy' },
      completed: { color: 'default', text: 'Hoàn thành' },
      cancelled: { color: 'red', text: 'Đã hủy' },
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Mã chuyến',
      dataIndex: '_id',
      key: '_id',
      render: (id) => id.substring(0, 8).toUpperCase(),
      width: 100,
    },
    {
      title: 'Tuyến đường',
      dataIndex: 'routeId',
      key: 'route',
      render: (route) => (
        <div>
          <EnvironmentOutlined className="mr-2" />
          {route?.routeName || 'N/A'}
        </div>
      ),
    },
    {
      title: 'Xe',
      dataIndex: 'busId',
      key: 'bus',
      render: (bus) => bus?.busNumber || 'N/A',
    },
    {
      title: 'Giờ khởi hành',
      dataIndex: 'departureTime',
      key: 'departureTime',
      render: (time) => (
        <div>
          <CalendarOutlined className="mr-2" />
          {dayjs(time).format('DD/MM/YYYY HH:mm')}
        </div>
      ),
    },
    {
      title: 'Giờ đến',
      dataIndex: 'arrivalTime',
      key: 'arrivalTime',
      render: (time) => dayjs(time).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Giá vé',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (price) => `${price?.toLocaleString('vi-VN')}đ`,
    },
    {
      title: 'Ghế trống',
      key: 'seats',
      render: (_, record) => `${record.availableSeats || 0}/${record.busId?.seatLayout?.totalSeats || 0}`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => message.info('Chức năng đang phát triển')}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTrip(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const filteredTrips = trips.filter((trip) => {
    const matchSearch =
      searchText === '' ||
      trip.routeId?.routeName?.toLowerCase().includes(searchText.toLowerCase()) ||
      trip.busId?.busNumber?.toLowerCase().includes(searchText.toLowerCase());

    const matchStatus = statusFilter === 'all' || trip.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Quản Lý Chuyến Xe</h1>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
              size="large"
            >
              Tạo Chuyến Xe
            </Button>
          </div>

          <Space className="mb-4" size="middle">
            <Input
              placeholder="Tìm kiếm tuyến đường, số xe..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 200 }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="scheduled">Đã lên lịch</Option>
              <Option value="ongoing">Đang chạy</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredTrips}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} chuyến xe`,
          }}
        />
      </Card>

      {/* Create Trip Modal */}
      <Modal
        title="Tạo Chuyến Xe Mới"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={700}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTrip}>
          <Form.Item
            name="routeId"
            label="Tuyến đường"
            rules={[{ required: true, message: 'Vui lòng chọn tuyến đường' }]}
          >
            <Select placeholder="Chọn tuyến đường">
              {routes.map((route) => (
                <Option key={route._id} value={route._id}>
                  {route.routeName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="busId"
            label="Xe"
            rules={[{ required: true, message: 'Vui lòng chọn xe' }]}
          >
            <Select placeholder="Chọn xe">
              {buses.map((bus) => (
                <Option key={bus._id} value={bus._id}>
                  {bus.busNumber} - {bus.busType} ({bus.seatLayout?.totalSeats} ghế)
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Space size="large" style={{ width: '100%' }}>
            <Form.Item
              name="driverId"
              label="Tài xế"
              rules={[{ required: true, message: 'Vui lòng chọn tài xế' }]}
            >
              <Select placeholder="Chọn tài xế" style={{ width: 300 }}>
                {employees.drivers?.map((driver) => (
                  <Option key={driver._id} value={driver._id}>
                    {driver.fullName} - {driver.employeeCode}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="tripManagerId"
              label="Quản lý chuyến"
              rules={[{ required: true, message: 'Vui lòng chọn quản lý chuyến' }]}
            >
              <Select placeholder="Chọn quản lý" style={{ width: 300 }}>
                {employees.tripManagers?.map((manager) => (
                  <Option key={manager._id} value={manager._id}>
                    {manager.fullName} - {manager.employeeCode}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Space>

          <Space size="large" style={{ width: '100%' }}>
            <Form.Item
              name="departureDate"
              label="Ngày khởi hành"
              rules={[{ required: true, message: 'Vui lòng chọn ngày khởi hành' }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: 300 }} />
            </Form.Item>

            <Form.Item
              name="departureTime"
              label="Giờ khởi hành"
              rules={[{ required: true, message: 'Vui lòng chọn giờ khởi hành' }]}
            >
              <TimePicker format="HH:mm" style={{ width: 300 }} />
            </Form.Item>
          </Space>

          <Space size="large" style={{ width: '100%' }}>
            <Form.Item
              name="arrivalDate"
              label="Ngày đến"
              rules={[{ required: true, message: 'Vui lòng chọn ngày đến' }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: 300 }} />
            </Form.Item>

            <Form.Item
              name="arrivalTime"
              label="Giờ đến"
              rules={[{ required: true, message: 'Vui lòng chọn giờ đến' }]}
            >
              <TimePicker format="HH:mm" style={{ width: 300 }} />
            </Form.Item>
          </Space>

          <Form.Item
            name="basePrice"
            label="Giá vé cơ bản (VNĐ)"
            rules={[
              { required: true, message: 'Vui lòng nhập giá vé' },
              { type: 'number', min: 0, message: 'Giá vé phải lớn hơn 0' },
            ]}
          >
            <InputNumber
              placeholder="Nhập giá vé"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TripsPage;
