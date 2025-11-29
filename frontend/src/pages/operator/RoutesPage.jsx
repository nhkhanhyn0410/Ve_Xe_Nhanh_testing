import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm, Tag, Space, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { routesApi } from '../../services/operatorApi';

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const response = await routesApi.getMyRoutes();
      setRoutes(response.data.routes || []);
    } catch (error) {
      message.error('Không thể tải danh sách tuyến đường');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRoute(null);
    form.resetFields();
    // Set default empty pickup, dropoff points and stops
    form.setFieldsValue({
      pickupPoints: [{ name: '', address: '' }],
      dropoffPoints: [{ name: '', address: '' }],
      stops: [],
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRoute(record);
    form.setFieldsValue({
      routeName: record.routeName,
      routeCode: record.routeCode,
      originProvince: record.origin?.province,
      originCity: record.origin?.city,
      destinationProvince: record.destination?.province,
      destinationCity: record.destination?.city,
      pickupPoints: record.pickupPoints && record.pickupPoints.length > 0
        ? record.pickupPoints
        : [{ name: '', address: '' }],
      dropoffPoints: record.dropoffPoints && record.dropoffPoints.length > 0
        ? record.dropoffPoints
        : [{ name: '', address: '' }],
      stops: record.stops || [],
      distance: record.distance,
      estimatedDuration: record.estimatedDuration,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Validate pickup and dropoff points
      if (!values.pickupPoints || values.pickupPoints.length === 0) {
        message.error('Vui lòng thêm ít nhất 1 điểm đón');
        return;
      }
      if (!values.dropoffPoints || values.dropoffPoints.length === 0) {
        message.error('Vui lòng thêm ít nhất 1 điểm trả');
        return;
      }

      // Auto-assign order to stops based on index
      const stops = (values.stops || []).map((stop, index) => ({
        ...stop,
        order: index + 1,
      }));

      const routeData = {
        routeName: values.routeName,
        routeCode: values.routeCode,
        origin: {
          province: values.originProvince,
          city: values.originCity,
        },
        destination: {
          province: values.destinationProvince,
          city: values.destinationCity,
        },
        pickupPoints: values.pickupPoints || [],
        dropoffPoints: values.dropoffPoints || [],
        stops: stops,
        distance: values.distance,
        estimatedDuration: values.estimatedDuration,
      };

      if (editingRoute) {
        await routesApi.update(editingRoute._id, routeData);
        message.success('Cập nhật tuyến đường thành công');
      } else {
        await routesApi.create(routeData);
        message.success('Tạo tuyến đường thành công');
      }

      setModalVisible(false);
      loadRoutes();
    } catch (error) {
      message.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      await routesApi.delete(id);
      message.success('Xóa tuyến đường thành công');
      loadRoutes();
    } catch (error) {
      message.error('Không thể xóa tuyến đường');
    }
  };

  const handleToggleActive = async (record) => {
    try {
      await routesApi.toggleActive(record._id);
      message.success('Cập nhật trạng thái thành công');
      loadRoutes();
    } catch (error) {
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const columns = [
    {
      title: 'Mã Tuyến',
      dataIndex: 'routeCode',
      key: 'routeCode',
      width: 120,
    },
    {
      title: 'Tên Tuyến',
      dataIndex: 'routeName',
      key: 'routeName',
      width: 200,
    },
    {
      title: 'Điểm Đi',
      key: 'origin',
      render: (_, record) => `${record.origin?.city}, ${record.origin?.province}`,
    },
    {
      title: 'Điểm Đến',
      key: 'destination',
      render: (_, record) => `${record.destination?.city}, ${record.destination?.province}`,
    },
    {
      title: 'Khoảng Cách',
      dataIndex: 'distance',
      key: 'distance',
      width: 120,
      render: (distance) => `${distance} km`,
    },
    {
      title: 'Thời Gian',
      dataIndex: 'estimatedDuration',
      key: 'estimatedDuration',
      width: 120,
      render: (duration) => `${duration} phút`,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive) =>
        isActive ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Hoạt động
          </Tag>
        ) : (
          <Tag icon={<StopOutlined />} color="error">
            Ngừng
          </Tag>
        ),
    },
    {
      title: 'Hành Động',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button
            size="small"
            type={record.isActive ? 'default' : 'primary'}
            onClick={() => handleToggleActive(record)}
          >
            {record.isActive ? 'Tắt' : 'Bật'}
          </Button>
          <Popconfirm
            title="Xác nhận xóa tuyến đường này?"
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
        <h1 className="text-2xl font-bold">Quản Lý Tuyến Đường</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Tạo Tuyến Mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={routes}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingRoute ? 'Chỉnh Sửa Tuyến Đường' : 'Tạo Tuyến Đường Mới'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={900}
        okText={editingRoute ? 'Cập Nhật' : 'Tạo'}
        cancelText="Hủy"
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="routeName" label="Tên Tuyến" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Hà Nội - Đà Nẵng" />
          </Form.Item>
          <Form.Item name="routeCode" label="Mã Tuyến" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: HN-DN-001" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Điểm Đi</h3>
              <Form.Item
                name="originProvince"
                label="Tỉnh/Thành Phố"
                rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố' }]}
              >
                <Input placeholder="Ví dụ: TP. Hồ Chí Minh" />
              </Form.Item>
              <Form.Item
                name="originCity"
                label="Quận/Xã"
                rules={[{ required: true, message: 'Vui lòng nhập quận/xã' }]}
              >
                <Input placeholder="Ví dụ: Quận 1" />
              </Form.Item>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Điểm Đến</h3>
              <Form.Item
                name="destinationProvince"
                label="Tỉnh/Thành Phố"
                rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố' }]}
              >
                <Input placeholder="Ví dụ: Đà Lạt" />
              </Form.Item>
              <Form.Item
                name="destinationCity"
                label="Quận/Xã"
                rules={[{ required: true, message: 'Vui lòng nhập quận/xã' }]}
              >
                <Input placeholder="Ví dụ: Phường 3" />
              </Form.Item>
            </div>
          </div>

          <Divider orientation="left">Điểm Đón</Divider>
          <Form.List name="pickupPoints">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <div key={key} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-700">Điểm đón #{index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                        >
                          Xóa
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        label="Tên điểm đón"
                        rules={[{ required: true, message: 'Vui lòng nhập tên điểm đón' }]}
                      >
                        <Input placeholder="Ví dụ: Bến xe Miền Đông" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'address']}
                        label="Địa chỉ chi tiết"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                      >
                        <Input placeholder="Ví dụ: 292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh" />
                      </Form.Item>
                    </div>
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Thêm điểm đón
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider orientation="left">Điểm Trả</Divider>
          <Form.List name="dropoffPoints">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <div key={key} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-700">Điểm trả #{index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                        >
                          Xóa
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        label="Tên điểm trả"
                        rules={[{ required: true, message: 'Vui lòng nhập tên điểm trả' }]}
                      >
                        <Input placeholder="Ví dụ: Bến xe Đà Lạt" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'address']}
                        label="Địa chỉ chi tiết"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                      >
                        <Input placeholder="Ví dụ: 1 Tô Hiến Thành, P.3, Tp. Đà Lạt" />
                      </Form.Item>
                    </div>
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Thêm điểm trả
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider orientation="left">Điểm Dừng Chân</Divider>
          <Form.List name="stops">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <div key={key} className="mb-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-blue-700">Điểm dừng chân #{index + 1}</h4>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                      >
                        Xóa
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        label="Tên điểm dừng"
                        rules={[{ required: true, message: 'Vui lòng nhập tên điểm dừng' }]}
                      >
                        <Input placeholder="Ví dụ: Trạm dừng chân Dầu Giây" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'address']}
                        label="Địa chỉ chi tiết"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                      >
                        <Input placeholder="Ví dụ: KM 50 QL1A, Dầu Giây, Đồng Nai" />
                      </Form.Item>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Form.Item
                        {...restField}
                        name={[name, 'order']}
                        label="Thứ tự"
                        initialValue={index + 1}
                        hidden
                      >
                        <InputNumber min={1} className="w-full" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'estimatedArrivalMinutes']}
                        label="Thời gian đến (phút từ điểm xuất phát)"
                        rules={[{ required: true, message: 'Vui lòng nhập thời gian đến' }]}
                      >
                        <InputNumber
                          min={1}
                          className="w-full"
                          placeholder="Ví dụ: 90"
                          addonAfter="phút"
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'stopDuration']}
                        label="Thời gian dừng"
                        initialValue={15}
                        rules={[{ required: true, message: 'Vui lòng nhập thời gian dừng' }]}
                      >
                        <InputNumber
                          min={5}
                          max={120}
                          className="w-full"
                          placeholder="15"
                          addonAfter="phút"
                        />
                      </Form.Item>
                    </div>
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Thêm điểm dừng chân
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="distance" label="Khoảng Cách (km)" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item
              name="estimatedDuration"
              label="Thời Gian Ước Tính (phút)"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RoutesPage;
