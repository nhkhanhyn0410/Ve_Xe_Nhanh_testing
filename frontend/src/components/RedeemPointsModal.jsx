import { useState } from 'react';
import {
  Modal,
  Form,
  InputNumber,
  Button,
  message,
  Space,
  Alert,
  Typography,
  Divider,
  Slider,
} from 'antd';
import {
  GiftOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import {
  redeemPoints,
  formatCurrency,
  calculateDiscount,
} from '../services/loyaltyApi';

const { Text, Title } = Typography;

const RedeemPointsModal = ({ open, onCancel, onSuccess, currentPoints }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(100);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const response = await redeemPoints({
        points: values.points,
      });

      if (response.success) {
        message.success(response.message || 'Đổi điểm thành công!');
        form.resetFields();
        setPointsToRedeem(100);
        onSuccess && onSuccess(response.data);
      }
    } catch (error) {
      console.error('Error redeeming points:', error);
      message.error(error.response?.data?.message || 'Không thể đổi điểm');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setPointsToRedeem(100);
    onCancel();
  };

  const handlePointsChange = (value) => {
    setPointsToRedeem(value || 100);
  };

  const discountAmount = calculateDiscount(pointsToRedeem);
  const remainingPoints = currentPoints - pointsToRedeem;

  // Quick select presets
  const presets = [
    { label: '100', value: 100 },
    { label: '500', value: 500 },
    { label: '1000', value: 1000 },
    { label: 'Tất cả', value: currentPoints },
  ].filter((preset) => preset.value <= currentPoints);

  return (
    <Modal
      title={
        <Space>
          <GiftOutlined className="text-blue-500 text-2xl" />
          <span className="text-lg font-semibold">Đổi điểm lấy giảm giá</span>
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      {/* Info Alert */}
      <Alert
        message="Quy đổi: 1 điểm = 1,000 VND giảm giá"
        description="Số điểm đổi tối thiểu là 100 điểm. Mã giảm giá sẽ được áp dụng cho lần đặt vé tiếp theo."
        type="info"
        showIcon
        className="mb-4"
      />

      {/* Current Points */}
      <div className="text-center mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <Text className="text-gray-600 block">Điểm hiện tại</Text>
        <Title level={2} className="mb-0 text-blue-600">
          {currentPoints.toLocaleString()} điểm
        </Title>
        <Text className="text-gray-500 text-sm">
          ≈ {formatCurrency(calculateDiscount(currentPoints))}
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          points: 100,
        }}
      >
        {/* Points Input */}
        <Form.Item
          label={<span className="font-semibold">Số điểm muốn đổi</span>}
          name="points"
          rules={[
            { required: true, message: 'Vui lòng nhập số điểm!' },
            {
              type: 'number',
              min: 100,
              message: 'Tối thiểu 100 điểm!',
            },
            {
              type: 'number',
              max: currentPoints,
              message: `Tối đa ${currentPoints} điểm!`,
            },
          ]}
        >
          <InputNumber
            size="large"
            placeholder="Nhập số điểm"
            style={{ width: '100%' }}
            min={100}
            max={currentPoints}
            step={10}
            onChange={handlePointsChange}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        {/* Slider */}
        <Form.Item>
          <Slider
            min={100}
            max={currentPoints}
            step={10}
            value={pointsToRedeem}
            onChange={(value) => {
              form.setFieldsValue({ points: value });
              handlePointsChange(value);
            }}
            marks={{
              100: '100',
              [Math.floor(currentPoints / 2)]: `${Math.floor(currentPoints / 2)}`,
              [currentPoints]: currentPoints.toLocaleString(),
            }}
          />
        </Form.Item>

        {/* Quick Select */}
        <Form.Item label={<span className="font-semibold">Chọn nhanh</span>}>
          <Space wrap>
            {presets.map((preset) => (
              <Button
                key={preset.value}
                onClick={() => {
                  form.setFieldsValue({ points: preset.value });
                  handlePointsChange(preset.value);
                }}
                type={pointsToRedeem === preset.value ? 'primary' : 'default'}
              >
                {preset.label}
              </Button>
            ))}
          </Space>
        </Form.Item>

        <Divider />

        {/* Summary */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
            <Space>
              <DollarOutlined className="text-green-600 text-xl" />
              <Text strong>Giảm giá nhận được:</Text>
            </Space>
            <Text strong className="text-xl text-green-600">
              {formatCurrency(discountAmount)}
            </Text>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <Text>Điểm còn lại:</Text>
            <Text strong className="text-lg">
              {remainingPoints.toLocaleString()} điểm
            </Text>
          </div>

          {remainingPoints < 100 && remainingPoints > 0 && (
            <Alert
              message="Điểm còn lại sẽ ít hơn 100"
              description="Bạn sẽ không thể đổi điểm lần sau cho đến khi tích đủ 100 điểm."
              type="warning"
              showIcon
              className="text-sm"
            />
          )}
        </div>

        {/* Submit Buttons */}
        <Form.Item className="mb-0">
          <Space className="w-full justify-end">
            <Button onClick={handleCancel} size="large">
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              icon={<GiftOutlined />}
              disabled={pointsToRedeem < 100 || pointsToRedeem > currentPoints}
            >
              Xác nhận đổi điểm
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-gray-600">
        <Text strong className="block mb-1">💡 Lưu ý:</Text>
        <ul className="m-0 pl-4 space-y-1">
          <li>Mã giảm giá có hiệu lực 30 ngày</li>
          <li>Áp dụng cho tất cả các tuyến xe</li>
          <li>Không thể hoàn lại điểm sau khi đổi</li>
        </ul>
      </div>
    </Modal>
  );
};

export default RedeemPointsModal;
