import { useState } from 'react';
import { Modal, Form, Input, Rate, Upload, Button, message } from 'antd';
import {
  FaStar,
  FaBus,
  FaUserTie,
  FaClock,
  FaSmile
} from 'react-icons/fa';
import { MdRateReview } from 'react-icons/md';
import { IoMdImages } from 'react-icons/io';
import { createReview } from '../services/reviewApi';

const { TextArea } = Input;

const CreateReviewModal = ({ visible, onClose, booking, onReviewCreated }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const reviewData = {
        overallRating: values.overallRating,
        vehicleRating: values.vehicleRating || null,
        driverRating: values.driverRating || null,
        punctualityRating: values.punctualityRating || null,
        serviceRating: values.serviceRating || null,
        comment: values.comment || '',
        images: fileList.map(file => file.url || file.response?.url).filter(Boolean),
      };

      const response = await createReview(booking._id, reviewData);

      if (response.success || response.status === 'success') {
        message.success('Cảm ơn bạn đã đánh giá!');
        form.resetFields();
        setFileList([]);
        onReviewCreated && onReviewCreated(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Create review error:', error);
      message.error(error.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Chỉ được tải lên hình ảnh!');
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Hình ảnh phải nhỏ hơn 5MB!');
      }
      return isImage && isLt5M;
    },
    fileList,
    onChange: handleUploadChange,
    listType: 'picture-card',
    maxCount: 5,
    accept: 'image/*',
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-xl">
          <MdRateReview className="text-blue-500" />
          <span>Đánh Giá Chuyến Đi</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Tuyến:</strong> {booking?.tripInfo?.route || booking?.tripId?.routeId?.routeName}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Ngày:</strong> {new Date(booking?.tripInfo?.departureTime || booking?.tripId?.departureTime).toLocaleDateString('vi-VN')}
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          overallRating: 5,
        }}
      >
        {/* Overall Rating */}
        <Form.Item
          label={
            <span className="flex items-center gap-2 font-semibold">
              <FaStar className="text-yellow-500" />
              Đánh giá tổng thể
            </span>
          }
          name="overallRating"
          rules={[{ required: true, message: 'Vui lòng chọn đánh giá!' }]}
        >
          <Rate allowHalf className="text-3xl" />
        </Form.Item>

        {/* Detailed Ratings */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="text-sm font-semibold mb-3 text-gray-700">
            Đánh giá chi tiết (Tùy chọn)
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={
                <span className="flex items-center gap-2 text-sm">
                  <FaBus className="text-blue-500" />
                  Xe
                </span>
              }
              name="vehicleRating"
            >
              <Rate allowHalf />
            </Form.Item>

            <Form.Item
              label={
                <span className="flex items-center gap-2 text-sm">
                  <FaUserTie className="text-green-500" />
                  Tài xế
                </span>
              }
              name="driverRating"
            >
              <Rate allowHalf />
            </Form.Item>

            <Form.Item
              label={
                <span className="flex items-center gap-2 text-sm">
                  <FaClock className="text-orange-500" />
                  Đúng giờ
                </span>
              }
              name="punctualityRating"
            >
              <Rate allowHalf />
            </Form.Item>

            <Form.Item
              label={
                <span className="flex items-center gap-2 text-sm">
                  <FaSmile className="text-purple-500" />
                  Phục vụ
                </span>
              }
              name="serviceRating"
            >
              <Rate allowHalf />
            </Form.Item>
          </div>
        </div>

        {/* Comment */}
        <Form.Item
          label="Nhận xét của bạn"
          name="comment"
          rules={[
            { max: 500, message: 'Nhận xét không được vượt quá 500 ký tự' },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Chia sẻ trải nghiệm của bạn về chuyến đi này..."
            showCount
            maxLength={500}
          />
        </Form.Item>

        {/* Images Upload */}
        <Form.Item
          label={
            <span className="flex items-center gap-2">
              <IoMdImages className="text-blue-500" />
              Hình ảnh (Tối đa 5 ảnh)
            </span>
          }
        >
          <Upload {...uploadProps}>
            {fileList.length < 5 && (
              <div>
                <IoMdImages className="text-2xl text-gray-400 mx-auto" />
                <div className="mt-2 text-xs text-gray-600">Tải ảnh lên</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        {/* Actions */}
        <Form.Item className="mb-0 mt-6">
          <div className="flex gap-3 justify-end">
            <Button size="large" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              icon={<MdRateReview />}
            >
              Gửi đánh giá
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateReviewModal;
