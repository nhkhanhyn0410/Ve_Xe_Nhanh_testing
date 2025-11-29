import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { busesApi, seatLayoutApi } from '../../services/operatorApi';
import SeatLayoutBuilder from '../../components/operator/SeatLayoutBuilder';

const { Option } = Select;

const BusesPage = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [layoutModalVisible, setLayoutModalVisible] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [seatLayout, setSeatLayout] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    setLoading(true);
    try {
      const response = await busesApi.getMyBuses();
      setBuses(response.data.buses || []);
    } catch (error) {
      message.error('Không thể tải danh sách xe');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBus(null);
    setSeatLayout(null);
    form.resetFields();
    // Set default status to 'active'
    form.setFieldsValue({ status: 'active' });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingBus(record);
    setSeatLayout(record.seatLayout);
    form.setFieldsValue({
      busNumber: record.busNumber,
      busType: record.busType,
      amenities: record.amenities,
      status: record.status,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!seatLayout) {
        message.error('Vui lòng tạo sơ đồ ghế trước khi lưu');
        return;
      }

      // Validate seat layout structure
      if (!seatLayout.layout || !Array.isArray(seatLayout.layout) || seatLayout.layout.length === 0) {
        message.error('Sơ đồ ghế không hợp lệ');
        return;
      }

      if (!seatLayout.totalSeats || seatLayout.totalSeats < 1) {
        message.error('Sơ đồ ghế phải có ít nhất 1 ghế');
        return;
      }

      // Ensure amenities are lowercase to match backend validation
      const amenities = values.amenities ? values.amenities.map(a => a.toLowerCase()) : [];

      const busData = {
        ...values,
        amenities,
        seatLayout,
      };

      if (editingBus) {
        await busesApi.update(editingBus._id, busData);
        message.success('Cập nhật xe thành công');
      } else {
        await busesApi.create(busData);
        message.success('Tạo xe thành công');
      }

      setModalVisible(false);
      form.resetFields();
      setSeatLayout(null);
      loadBuses();
    } catch (error) {
      console.error('Submit bus error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra';
      message.error(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    try {
      await busesApi.delete(id);
      message.success('Xóa xe thành công');
      loadBuses();
    } catch (error) {
      message.error('Không thể xóa xe');
    }
  };

  const statusColors = {
    active: 'success',
    maintenance: 'warning',
    retired: 'error',
  };

  const statusText = {
    active: 'Hoạt Động',
    maintenance: 'Bảo Trì',
    retired: 'Ngừng',
  };

  const busTypeText = {
    limousine: 'Limousine',
    sleeper: 'Giường Nằm',
    seater: 'Ghế Ngồi',
    double_decker: 'Hai Tầng',
  };

  const columns = [
    {
      title: 'Biển Số',
      dataIndex: 'busNumber',
      key: 'busNumber',
    },
    {
      title: 'Loại Xe',
      dataIndex: 'busType',
      key: 'busType',
      render: (type) => busTypeText[type] || type,
    },
    {
      title: 'Số Ghế',
      key: 'seats',
      render: (_, record) => record.seatLayout?.totalSeats || 0,
    },
    {
      title: 'Tiện Nghi',
      dataIndex: 'amenities',
      key: 'amenities',
      render: (amenities) => amenities?.slice(0, 3).join(', ') || '-',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>
          {statusText[status]}
        </Tag>
      ),
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa xe này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản Lý Xe</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm Xe Mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={buses}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingBus ? 'Chỉnh Sửa Xe' : 'Thêm Xe Mới'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        okText={editingBus ? 'Cập Nhật' : 'Tạo'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="busNumber" label="Biển Số Xe" rules={[{ required: true }]}>
            <Input placeholder="29A-12345" />
          </Form.Item>

          <Form.Item name="busType" label="Loại Xe" rules={[{ required: true }]}>
            <Select placeholder="Chọn loại xe">
              <Option value="limousine">Limousine</Option>
              <Option value="sleeper">Giường Nằm</Option>
              <Option value="seater">Ghế Ngồi</Option>
              <Option value="double_decker">Hai Tầng</Option>
            </Select>
          </Form.Item>

          <Form.Item name="amenities" label="Tiện Nghi">
            <Select mode="tags" placeholder="wifi, ac, toilet, tv, water">
              <Option value="wifi">WiFi</Option>
              <Option value="ac">Điều Hòa</Option>
              <Option value="toilet">Toilet</Option>
              <Option value="tv">TV</Option>
              <Option value="water">Nước Uống</Option>
              <Option value="blanket">Chăn</Option>
              <Option value="pillow">Gối</Option>
              <Option value="snack">Đồ Ăn Nhẹ</Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Trạng Thái" initialValue="active">
            <Select>
              <Option value="active">Hoạt Động</Option>
              <Option value="maintenance">Bảo Trì</Option>
              <Option value="retired">Ngừng Hoạt Động</Option>
            </Select>
          </Form.Item>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Sơ Đồ Ghế:</label>
            {seatLayout ? (
              <div className="p-4 bg-gray-50 rounded">
                <p>Đã tạo sơ đồ: {seatLayout.totalSeats} ghế</p>
                <Button size="small" onClick={() => setLayoutModalVisible(true)}>
                  Chỉnh Sửa
                </Button>
              </div>
            ) : (
              <Button onClick={() => setLayoutModalVisible(true)}>
                Tạo Sơ Đồ Ghế
              </Button>
            )}
          </div>
        </Form>
      </Modal>

      <Modal
        title="Tạo Sơ Đồ Ghế"
        open={layoutModalVisible}
        onCancel={() => setLayoutModalVisible(false)}
        width={900}
        footer={null}
      >
        <SeatLayoutBuilder
          busType={form.getFieldValue('busType')}
          initialLayout={seatLayout}
          onSave={(layout) => {
            if (layout === null) {
              // User cancelled
              setLayoutModalVisible(false);
              return;
            }
            setSeatLayout(layout);
            setLayoutModalVisible(false);
            message.success('Đã lưu sơ đồ ghế');
          }}
        />
      </Modal>
    </div>
  );
};

export default BusesPage;
