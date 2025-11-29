import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Tag,
  Button,
  Typography,
  message,
  Descriptions,
  Timeline,
  Input,
  Form,
  Space,
  Spin,
  Empty,
  Avatar,
  Rate,
  Modal,
  Divider,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  ClockCircleOutlined,
  SendOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  StarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { MdReportProblem, MdAdminPanelSettings } from 'react-icons/md';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import {
  getComplaintById,
  addNote,
  addSatisfactionRating,
  getCategoryLabel,
  getStatusLabel,
  getPriorityLabel,
  getStatusColor,
  getPriorityColor,
} from '../services/complaintApi';
import useAuthStore from '../store/authStore';
import CustomerLayout from '../components/layouts/CustomerLayout';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const chatEndRef = useRef(null);

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sendingNote, setSendingNote] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [noteForm] = Form.useForm();
  const [ratingForm] = Form.useForm();

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  useEffect(() => {
    // Scroll to bottom of chat when notes change
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [complaint?.notes]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const response = await getComplaintById(id);

      if (response.status === 'success') {
        setComplaint(response.data);
      }
    } catch (error) {
      console.error('Error fetching complaint details:', error);
      message.error('Không thể tải thông tin khiếu nại');
      navigate('/complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNote = async (values) => {
    try {
      setSendingNote(true);
      const response = await addNote(id, { content: values.note });

      if (response.status === 'success') {
        message.success('Đã gửi ghi chú');
        noteForm.resetFields();
        setComplaint(response.data);
      }
    } catch (error) {
      console.error('Error sending note:', error);
      message.error('Không thể gửi ghi chú');
    } finally {
      setSendingNote(false);
    }
  };

  const handleSubmitRating = async (values) => {
    try {
      const response = await addSatisfactionRating(id, {
        rating: values.rating,
        feedback: values.feedback || '',
      });

      if (response.status === 'success') {
        message.success('Cảm ơn bạn đã đánh giá!');
        setRatingModalOpen(false);
        ratingForm.resetFields();
        setComplaint(response.data);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      message.error(error.response?.data?.message || 'Không thể gửi đánh giá');
    }
  };

  const renderTimeline = () => {
    const items = [];

    // Created
    items.push({
      color: 'blue',
      dot: <ExclamationCircleOutlined />,
      children: (
        <div>
          <Text strong>Khiếu nại được tạo</Text>
          <div className="text-sm text-gray-500">
            {dayjs(complaint.createdAt).format('DD/MM/YYYY HH:mm')}
          </div>
        </div>
      ),
    });

    // Assigned
    if (complaint.assignedTo) {
      items.push({
        color: 'orange',
        dot: <TeamOutlined />,
        children: (
          <div>
            <Text strong>Đã phân công</Text>
            <div className="text-sm text-gray-500">
              Được phân công cho: {complaint.assignedTo.fullName}
              {complaint.assignedAt && (
                <>
                  <br />
                  {dayjs(complaint.assignedAt).format('DD/MM/YYYY HH:mm')}
                </>
              )}
            </div>
          </div>
        ),
      });
    }

    // Resolved
    if (complaint.status === 'resolved' && complaint.resolvedAt) {
      items.push({
        color: 'green',
        dot: <CheckCircleOutlined />,
        children: (
          <div>
            <Text strong>Đã giải quyết</Text>
            {complaint.resolvedBy && (
              <div className="text-sm text-gray-500">
                Bởi: {complaint.resolvedBy.fullName}
              </div>
            )}
            <div className="text-sm text-gray-500">
              {dayjs(complaint.resolvedAt).format('DD/MM/YYYY HH:mm')}
            </div>
            {complaint.resolution && (
              <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                <Text strong className="text-green-700">Giải pháp: </Text>
                <Text>{complaint.resolution}</Text>
              </div>
            )}
          </div>
        ),
      });
    }

    // Closed
    if (complaint.status === 'closed' && complaint.closedAt) {
      items.push({
        color: 'default',
        children: (
          <div>
            <Text strong>Đã đóng</Text>
            <div className="text-sm text-gray-500">
              {dayjs(complaint.closedAt).format('DD/MM/YYYY HH:mm')}
            </div>
          </div>
        ),
      });
    }

    // Satisfaction Rating
    if (complaint.satisfactionRating) {
      items.push({
        color: 'gold',
        dot: <StarOutlined />,
        children: (
          <div>
            <Text strong>Đánh giá</Text>
            <div className="mt-1">
              <Rate disabled value={complaint.satisfactionRating} />
              {complaint.satisfactionFeedback && (
                <div className="mt-1 text-sm text-gray-600">
                  "{complaint.satisfactionFeedback}"
                </div>
              )}
            </div>
          </div>
        ),
      });
    }

    return <Timeline items={items} />;
  };

  const renderNoteItem = (note) => {
    const isCustomer = note.addedByRole === 'customer';
    const isMe = note.addedBy?._id === user?._id;

    return (
      <div
        key={note._id}
        className={`flex gap-3 mb-4 ${isMe ? 'flex-row-reverse' : ''}`}
      >
        <Avatar
          icon={isCustomer ? <UserOutlined /> : <MdAdminPanelSettings />}
          className={isCustomer ? 'bg-blue-500' : 'bg-green-500'}
        />
        <div className={`flex-1 ${isMe ? 'text-right' : ''}`}>
          <div className={`inline-block max-w-[70%] ${isMe ? 'text-right' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              <Text strong className={isCustomer ? 'text-blue-600' : 'text-green-600'}>
                {note.addedBy?.fullName || (isCustomer ? 'Khách hàng' : 'Quản trị viên')}
              </Text>
              <Text className="text-xs text-gray-400">
                {dayjs(note.createdAt).fromNow()}
              </Text>
            </div>
            <div
              className={`p-3 rounded-lg ${
                isMe
                  ? 'bg-blue-500 text-white'
                  : isCustomer
                  ? 'bg-gray-100'
                  : 'bg-green-50 border border-green-200'
              }`}
            >
              <Text className={isMe ? 'text-white' : ''}>{note.content}</Text>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading || !complaint) {
    return (
      <CustomerLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" tip="Đang tải thông tin khiếu nại..." />
        </div>
      </CustomerLayout>
    );
  }

  const canRate =
    (complaint.status === 'resolved' || complaint.status === 'closed') &&
    !complaint.satisfactionRating;

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/complaints')}
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-1">
            {/* Basic Info */}
            <Card
              title={
                <Space>
                  <MdReportProblem className="text-orange-500" />
                  <span>Thông tin khiếu nại</span>
                </Space>
              }
              className="mb-4"
            >
              <div className="mb-4">
                <Text strong className="block mb-1">Mã ticket:</Text>
                <Tag color="blue" className="font-mono text-base px-3 py-1">
                  {complaint.ticketNumber}
                </Tag>
              </div>

              <div className="mb-4">
                <Text strong className="block mb-1">Trạng thái:</Text>
                <Tag color={getStatusColor(complaint.status)} className="text-base px-3 py-1">
                  {getStatusLabel(complaint.status)}
                </Tag>
              </div>

              <div className="mb-4">
                <Text strong className="block mb-1">Độ ưu tiên:</Text>
                <Tag color={getPriorityColor(complaint.priority)} className="text-base px-3 py-1">
                  {getPriorityLabel(complaint.priority)}
                </Tag>
              </div>

              <div className="mb-4">
                <Text strong className="block mb-1">Danh mục:</Text>
                <Text>{getCategoryLabel(complaint.category)}</Text>
              </div>

              <div className="mb-4">
                <Text strong className="block mb-1">Ngày tạo:</Text>
                <Text>{dayjs(complaint.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
              </div>

              {complaint.bookingId && (
                <div className="mb-4">
                  <Text strong className="block mb-1">Vé liên quan:</Text>
                  <Tag color="purple">{complaint.bookingId.bookingCode}</Tag>
                </div>
              )}

              {canRate && (
                <Button
                  type="primary"
                  icon={<StarOutlined />}
                  onClick={() => setRatingModalOpen(true)}
                  block
                  size="large"
                  className="mt-4"
                >
                  Đánh giá
                </Button>
              )}
            </Card>

            {/* Timeline */}
            <Card title="Lịch sử xử lý">
              {renderTimeline()}
            </Card>
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-2">
            {/* Subject and Description */}
            <Card className="mb-4">
              <Title level={4} className="mb-3">
                {complaint.subject}
              </Title>
              <Paragraph className="text-gray-700 whitespace-pre-line">
                {complaint.description}
              </Paragraph>

              {complaint.attachments && complaint.attachments.length > 0 && (
                <div className="mt-4">
                  <Text strong>Tệp đính kèm:</Text>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {complaint.attachments.map((file, index) => (
                      <Tag key={index} icon={<FileTextOutlined />}>
                        {file.fileName}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Resolution (if resolved) */}
            {complaint.status === 'resolved' && complaint.resolution && (
              <Alert
                message="Giải pháp"
                description={complaint.resolution}
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
                className="mb-4"
              />
            )}

            {/* Chat/Notes Section */}
            <Card
              title={
                <Space>
                  <TeamOutlined />
                  <span>Trao đổi</span>
                </Space>
              }
            >
              {/* Messages */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
                {complaint.notes && complaint.notes.length > 0 ? (
                  <>
                    {complaint.notes.map(renderNoteItem)}
                    <div ref={chatEndRef} />
                  </>
                ) : (
                  <Empty
                    description="Chưa có ghi chú nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </div>

              {/* Input Form */}
              {complaint.status !== 'closed' && complaint.status !== 'rejected' && (
                <Form form={noteForm} onFinish={handleSendNote}>
                  <Form.Item
                    name="note"
                    rules={[
                      { required: true, message: 'Vui lòng nhập nội dung!' },
                      { min: 5, message: 'Ghi chú phải có ít nhất 5 ký tự!' },
                    ]}
                    className="mb-0"
                  >
                    <div className="flex gap-2">
                      <TextArea
                        placeholder="Nhập ghi chú của bạn..."
                        rows={3}
                        maxLength={1000}
                        showCount
                      />
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SendOutlined />}
                        loading={sendingNote}
                        className="h-full"
                      >
                        Gửi
                      </Button>
                    </div>
                  </Form.Item>
                </Form>
              )}

              {(complaint.status === 'closed' || complaint.status === 'rejected') && (
                <Alert
                  message={`Khiếu nại đã ${complaint.status === 'closed' ? 'đóng' : 'bị từ chối'}. Không thể thêm ghi chú mới.`}
                  type="warning"
                  showIcon
                />
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <Modal
        title={
          <Space>
            <StarOutlined className="text-yellow-500" />
            <span>Đánh giá mức độ hài lòng</span>
          </Space>
        }
        open={ratingModalOpen}
        onCancel={() => {
          setRatingModalOpen(false);
          ratingForm.resetFields();
        }}
        footer={null}
      >
        <Form form={ratingForm} onFinish={handleSubmitRating} layout="vertical">
          <Form.Item
            label="Mức độ hài lòng"
            name="rating"
            rules={[{ required: true, message: 'Vui lòng chọn đánh giá!' }]}
          >
            <Rate className="text-3xl" />
          </Form.Item>

          <Form.Item
            label="Nhận xét (tùy chọn)"
            name="feedback"
          >
            <TextArea
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn về việc giải quyết khiếu nại..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setRatingModalOpen(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" icon={<StarOutlined />}>
                Gửi đánh giá
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      </div>
    </CustomerLayout>
  );
};

export default ComplaintDetailPage;
