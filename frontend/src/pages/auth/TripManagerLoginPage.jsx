import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  CarOutlined,
} from '@ant-design/icons';
import useTripManagerAuthStore from '../../store/tripManagerAuthStore';
import api from '../../services/api';

const TripManagerLoginPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { login } = useTripManagerAuthStore();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      // Employee login endpoint
      const response = await api.post('/employees/login', {
        employeeCode: values.employeeCode,
        password: values.password,
      });

      if (response.status === 'success') {
        const { token, employee } = response.data;

        // Check if user is trip_manager or driver
        if (employee.role !== 'trip_manager' && employee.role !== 'driver') {
          message.error('Bạn không có quyền truy cập trang này');
          return;
        }

        // Store auth data - login(user, token) not login(token, user)
        login({
          ...employee,
          role: employee.role, // Keep original role (trip_manager or driver)
        }, token);

        message.success('Đăng nhập thành công');
        navigate('/trip-manager/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error(error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <CarOutlined className="text-3xl text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Vé xe nhanh Trip Manager
          </h2>
          <p className="text-blue-100">
            Đăng nhập để quản lý chuyến xe
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl">
          <Form
            form={form}
            name="trip-manager-login"
            onFinish={handleLogin}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              name="employeeCode"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mã nhân viên',
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Mã nhân viên"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mật khẩu',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm">
              Bạn chưa có tài khoản?{' '}
              <span className="text-blue-500">
                Liên hệ nhà xe để được cấp tài khoản
              </span>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-blue-500"
            >
              ← Quay lại trang chủ
            </a>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-100 text-sm">
            . All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TripManagerLoginPage;
