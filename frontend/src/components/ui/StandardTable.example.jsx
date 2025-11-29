import React, { useState } from 'react';
import { Button, Tag, Space, Tooltip, Popconfirm } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined
} from '@ant-design/icons';
import StandardTable from './StandardTable';

// Example usage of StandardTable component
const StandardTableExample = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([
    {
      key: '1',
      id: 'TK001',
      customerName: 'Nguyễn Văn An',
      route: 'Hà Nội - TP.HCM',
      departureTime: '2024-01-15 08:00',
      price: 450000,
      status: 'confirmed',
      paymentStatus: true,
      seats: 2,
      createdAt: '2024-01-10 14:30',
    },
    {
      key: '2',
      id: 'TK002',
      customerName: 'Trần Thị Bình',
      route: 'TP.HCM - Đà Nẵng',
      departureTime: '2024-01-16 09:30',
      price: 320000,
      status: 'pending',
      paymentStatus: false,
      seats: 1,
      createdAt: '2024-01-11 10:15',
    },
    {
      key: '3',
      id: 'TK003',
      customerName: 'Lê Văn Cường',
      route: 'Đà Nẵng - Hà Nội',
      departureTime: '2024-01-17 15:45',
      price: 380000,
      status: 'cancelled',
      paymentStatus: false,
      seats: 3,
      createdAt: '2024-01-12 16:20',
    },
  ]);

  // Define columns with enhanced styling
  const columns = [
    {
      title: 'Mã vé',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (text) => (
        <span className="font-mono text-blue-600 font-semibold">
          {text}
        </span>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text) => (
        <div className="flex items-center">
          <UserOutlined className="text-neutral-400 mr-2" />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: 'Tuyến đường',
      dataIndex: 'route',
      key: 'route',
      render: (text) => (
        <span className="text-neutral-700">{text}</span>
      ),
    },
    {
      title: 'Thời gian khởi hành',
      dataIndex: 'departureTime',
      key: 'departureTime',
      render: (text) => (
        <div className="flex items-center">
          <CalendarOutlined className="text-neutral-400 mr-2" />
          <span className="text-sm">{text}</span>
        </div>
      ),
    },
    {
      title: 'Giá vé',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price) => (
        <div className="flex items-center justify-end">
          <DollarOutlined className="text-green-500 mr-1" />
          <span className="font-semibold text-green-600">
            {price.toLocaleString('vi-VN')}đ
          </span>
        </div>
      ),
    },
    {
      title: 'Số ghế',
      dataIndex: 'seats',
      key: 'seats',
      width: 80,
      align: 'center',
      render: (seats) => (
        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          {seats}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          confirmed: { color: 'green', text: 'Đã xác nhận' },
          pending: { color: 'orange', text: 'Chờ xử lý' },
          cancelled: { color: 'red', text: 'Đã hủy' },
        };
        
        const config = statusConfig[status] || { color: 'default', text: status };
        
        return (
          <Tag color={config.color} className="font-medium">
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 120,
      align: 'center',
      // This will use the enhanced boolean rendering from StandardTable
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              className="table-action-btn text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => handleView(record)}
            />
          </Tooltip>
          
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              className="table-action-btn text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa vé này?"
              onConfirm={() => handleDelete(record)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                className="table-action-btn text-red-600 hover:text-red-700 hover:bg-red-50"
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Filter options for the table
  const filterOptions = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Đã xác nhận', value: 'confirmed' },
    { label: 'Chờ xử lý', value: 'pending' },
    { label: 'Đã hủy', value: 'cancelled' },
  ];

  // Event handlers
  const handleSearch = (value) => {
    console.log('Search:', value);
    // Implement search logic here
  };

  const handleFilter = (filter) => {
    console.log('Filter:', filter);
    // Implement filter logic here
  };

  const handleExport = () => {
    console.log('Export data');
    // Implement export logic here
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      console.log('Data refreshed');
    }, 1000);
  };

  const handleView = (record) => {
    console.log('View:', record);
    // Implement view logic here
  };

  const handleEdit = (record) => {
    console.log('Edit:', record);
    // Implement edit logic here
  };

  const handleDelete = (record) => {
    console.log('Delete:', record);
    // Implement delete logic here
    setData(data.filter(item => item.key !== record.key));
  };

  // Row selection configuration
  const rowSelection = {
    type: 'checkbox',
    onChange: (selectedRowKeys, selectedRows) => {
      console.log('Selected:', selectedRowKeys, selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: record.status === 'cancelled',
      name: record.customerName,
    }),
  };

  // Custom actions for toolbar
  const customActions = (
    <Space>
      <Button 
        type="primary" 
        className="bg-red-600 hover:bg-red-700 border-red-600"
      >
        Thêm vé mới
      </Button>
      <Button>
        Xuất báo cáo
      </Button>
    </Space>
  );

  return (
    <div className="p-6">
      <StandardTable
        title="Quản lý vé xe"
        subtitle="Danh sách tất cả các vé đã đặt trong hệ thống"
        data={data}
        columns={columns}
        loading={loading}
        searchable
        searchPlaceholder="Tìm kiếm theo mã vé, tên khách hàng..."
        onSearch={handleSearch}
        filterable
        filterOptions={filterOptions}
        onFilter={handleFilter}
        exportable
        onExport={handleExport}
        refreshable
        onRefresh={handleRefresh}
        actions={customActions}
        rowSelection={rowSelection}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => (
            <span className="text-sm text-neutral-600">
              Hiển thị {range[0]}-{range[1]} trong tổng số {total} vé
            </span>
          ),
        }}
        className="shadow-lg"
      />
    </div>
  );
};

export default StandardTableExample;