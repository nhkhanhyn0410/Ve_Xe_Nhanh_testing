import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Popconfirm, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { employeesApi } from '../../services/operatorApi';
import dayjs from 'dayjs';

const { Option } = Select;

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeesApi.getMyEmployees();
      setEmployees(response.data.employees || []);
    } catch (error) {
      message.error('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEmployee(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingEmployee(record);
    form.setFieldsValue({
      employeeCode: record.employeeCode,
      fullName: record.fullName,
      phone: record.phone,
      email: record.email,
      idCard: record.idCard,
      role: record.role,
      status: record.status,
      licenseNumber: record.licenseNumber,
      licenseClass: record.licenseClass,
      licenseExpiry: record.licenseExpiry ? dayjs(record.licenseExpiry) : null,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const employeeData = {
        ...values,
        licenseExpiry: values.licenseExpiry ? values.licenseExpiry.toISOString() : undefined,
        password: values.password || undefined,
      };

      if (editingEmployee) {
        delete employeeData.password; // Don't update password on edit
        delete employeeData.employeeCode; // Can't change code
        await employeesApi.update(editingEmployee._id, employeeData);
        message.success('Cập nhật nhân viên thành công');
      } else {
        await employeesApi.create(employeeData);
        message.success('Tạo nhân viên thành công');
      }

      setModalVisible(false);
      loadEmployees();
    } catch (error) {
      message.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      await employeesApi.delete(id);
      message.success('Xóa nhân viên thành công');
      loadEmployees();
    } catch (error) {
      message.error('Không thể xóa nhân viên');
    }
  };

  const roleText = {
    driver: 'Tài Xế',
    trip_manager: 'Quản Lý Chuyến',
  };

  const statusColors = {
    active: 'success',
    on_leave: 'warning',
    suspended: 'error',
    terminated: 'default',
  };

  const statusText = {
    active: 'Hoạt Động',
    on_leave: 'Nghỉ Phép',
    suspended: 'Tạm Ngưng',
    terminated: 'Đã Nghỉ',
  };

  const columns = [
    {
      title: 'Mã NV',
      dataIndex: 'employeeCode',
      key: 'employeeCode',
      width: 100,
    },
    {
      title: 'Họ Tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Điện Thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Vai Trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => roleText[role] || role,
    },
    {
      title: 'Giấy Phép',
      key: 'license',
      render: (_, record) =>
        record.role === 'driver' ? `${record.licenseClass || '-'}` : '-',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColors[status]}>{statusText[status]}</Tag>,
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
            title="Xác nhận xóa nhân viên này?"
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

  const selectedRole = Form.useWatch('role', form);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản Lý Nhân Viên</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm Nhân Viên
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={employees}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingEmployee ? 'Chỉnh Sửa Nhân Viên' : 'Thêm Nhân Viên Mới'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
        okText={editingEmployee ? 'Cập Nhật' : 'Tạo'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            {!editingEmployee && (
              <Form.Item name="employeeCode" label="Mã Nhân Viên" rules={[{ required: true }]}>
                <Input placeholder="DRV001, TM001" />
              </Form.Item>
            )}

            <Form.Item name="fullName" label="Họ Tên" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số Điện Thoại"
              rules={[{ required: true }, { pattern: /^[0-9]{10}$/, message: '10 chữ số' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
              <Input />
            </Form.Item>

            <Form.Item name="idCard" label="CMND/CCCD">
              <Input />
            </Form.Item>

            <Form.Item name="role" label="Vai Trò" rules={[{ required: true }]}>
              <Select>
                <Option value="driver">Tài Xế</Option>
                <Option value="trip_manager">Quản Lý Chuyến</Option>
              </Select>
            </Form.Item>

            {!editingEmployee && (
              <Form.Item name="password" label="Mật Khẩu" rules={[{ required: true, min: 6 }]}>
                <Input.Password />
              </Form.Item>
            )}

            <Form.Item name="status" label="Trạng Thái" initialValue="active">
              <Select>
                <Option value="active">Hoạt Động</Option>
                <Option value="on_leave">Nghỉ Phép</Option>
                <Option value="suspended">Tạm Ngưng</Option>
                <Option value="terminated">Đã Nghỉ</Option>
              </Select>
            </Form.Item>
          </div>

          {selectedRole === 'driver' && (
            <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-blue-50 rounded">
              <Form.Item
                name="licenseNumber"
                label="Số Giấy Phép"
                rules={[{ required: true, message: 'Bắt buộc cho tài xế' }]}
              >
                <Input placeholder="ABC123456" />
              </Form.Item>

              <Form.Item
                name="licenseClass"
                label="Hạng Giấy Phép"
                rules={[{ required: true, message: 'Bắt buộc cho tài xế' }]}
              >
                <Select>
                  <Option value="B">B</Option>
                  <Option value="C">C</Option>
                  <Option value="D">D</Option>
                  <Option value="E">E</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="licenseExpiry"
                label="Ngày Hết Hạn"
                rules={[{ required: true, message: 'Bắt buộc cho tài xế' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
