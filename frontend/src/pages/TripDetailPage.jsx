import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Tag,
  Divider,
  Spin,
  Descriptions,
  message,
} from 'antd';
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  ArrowLeftOutlined,
  CarOutlined,
  PhoneOutlined,
  MailOutlined,
  StarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { getTripDetails, getAvailableSeats } from '../services/bookingApi';
import useBookingStore from '../store/bookingStore';
import SeatMapComponent from '../components/SeatMapComponent';
import ReviewsSection from '../components/ReviewsSection';
import { getAmenityIcon } from '../utils/constants';
import CustomerLayout from '../components/layouts/CustomerLayout';

const { Title, Text } = Typography;

const TripDetailPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const {
    selectedTrip,
    setSelectedTrip,
    selectedSeats,
    setPickupPoint,
    setDropoffPoint,
    clearSeats,
  } = useBookingStore();

  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState(null);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedDropoff, setSelectedDropoff] = useState(null);

  // Clear selected seats when entering a new trip page
  useEffect(() => {
    clearSeats();
    fetchTripDetails();
    fetchAvailableSeats();
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await getTripDetails(tripId);

      console.log('Trip detail response:', response);

      if (response.status === 'success' && response.data?.trip) {
        const tripData = response.data.trip;
        setTrip(tripData);
        setSelectedTrip(tripData);

        console.log('TripDetailPage - Set selected trip:', {
          tripId: tripData._id,
          hasId: !!tripData._id,
          trip: tripData,
        });
      } else {
        toast.error('Không tìm thấy thông tin chuyến xe');
        navigate('/');
      }
    } catch (error) {
      console.error('Fetch trip details error:', error);
      toast.error(error || 'Có lỗi xảy ra');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSeats = async () => {
    try {
      const response = await getAvailableSeats(tripId);
      console.log('Available seats response:', response);

      if (response.status === 'success' && response.data) {
        setAvailableSeats(response.data.availableSeats || response.data.available || []);
      }
    } catch (error) {
      console.error('Fetch available seats error:', error);
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      message.warning('Vui lòng chọn ghế');
      return;
    }

    if (!selectedPickup) {
      message.warning('Vui lòng chọn điểm đón');
      return;
    }

    if (!selectedDropoff) {
      message.warning('Vui lòng chọn điểm trả');
      return;
    }

    // Store pickup/dropoff points
    setPickupPoint(selectedPickup);
    setDropoffPoint(selectedDropoff);

    // Debug logging
    console.log('TripDetailPage - Before navigate to passenger info:', {
      selectedTrip,
      selectedSeats,
      selectedPickup,
      selectedDropoff,
      hasTripId: !!selectedTrip?._id,
      seatsCount: selectedSeats?.length || 0,
    });

    // Navigate to passenger info
    navigate('/booking/passenger-info');
  };

  const formatTime = (dateString) => {
    return dayjs(dateString).format('HH:mm, DD/MM/YYYY');
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '0đ';
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const getSeatPrice = () => {
    // Try multiple price fields in order of preference
    return trip?.pricing?.finalPrice || trip?.finalPrice || trip?.pricing?.basePrice || 0;
  };

  const calculateTotalPrice = () => {
    if (!trip || selectedSeats.length === 0) return 0;
    const price = getSeatPrice();
    return price * selectedSeats.length;
  };

  if (loading || !trip) {
    return (
      <CustomerLayout>
        <div className="flex flex-col justify-center items-center min-h-screen bg-neutral-50">
          <Spin size="large" />
          <div className="mt-4 text-center">
            <Text className="text-neutral-600 text-lg">Đang tải thông tin chuyến xe...</Text>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/trips')}
            className="h-10 px-4 rounded-lg border border-neutral-300 hover:border-primary-400 hover:text-primary-600 transition-colors"
          >
            Quay lại
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Row gutter={[24, 24]}>
          {/* Trip Information */}
          <Col xs={24} lg={16}>
            {/* Operator Info */}
            <Card className="mb-6 rounded-xl border border-neutral-200 shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <Title level={3} className="text-neutral-800 mb-3">{trip.operator?.companyName}</Title>
                  {trip.operator?.rating && (
                    <div className="flex items-center gap-3">
                      <Tag className="px-3 py-1 rounded-lg border-0 bg-warning-50 text-warning-700 font-medium">
                        <StarOutlined className="mr-1" /> {trip.operator.rating.average?.toFixed(1)}
                      </Tag>
                      <Text className="text-neutral-500 font-medium">
                        ({trip.operator.rating.total} đánh giá)
                      </Text>
                    </div>
                  )}
                </div>
                <Space direction="vertical" className="text-right" size="small">
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                    <PhoneOutlined className="text-blue-600" />
                    <Text className="text-blue-700 font-medium">{trip.operator?.phone}</Text>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                    <MailOutlined className="text-green-600" />
                    <Text className="text-green-700 font-medium">{trip.operator?.email}</Text>
                  </div>
                </Space>
              </div>
            </Card>

            {/* Route & Schedule Info */}
            <Card 
              title={<span className="text-neutral-800 font-semibold">Thông tin lộ trình</span>} 
              className="mb-6 rounded-xl border border-neutral-200 shadow-md"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg">
                  <Text className="text-neutral-600 font-medium">Tuyến đường</Text>
                  <Text strong className="text-neutral-800">{trip.route?.name} ({trip.route?.code})</Text>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                    <div className="flex items-center gap-2 mb-2">
                      <EnvironmentOutlined className="text-primary-600" />
                      <Text className="text-primary-700 font-semibold">Điểm đi</Text>
                    </div>
                    <Text strong className="text-neutral-800 block">{trip.route?.origin?.city}</Text>
                    <Text className="text-neutral-600 text-sm">{trip.route?.origin?.address}</Text>
                  </div>
                  
                  <div className="p-4 bg-accent-orange-50 rounded-lg border border-accent-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <EnvironmentOutlined className="text-accent-orange-600" />
                      <Text className="text-accent-orange-700 font-semibold">Điểm đến</Text>
                    </div>
                    <Text strong className="text-neutral-800 block">{trip.route?.destination?.city}</Text>
                    <Text className="text-neutral-600 text-sm">{trip.route?.destination?.address}</Text>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ClockCircleOutlined className="text-blue-600" />
                      <Text className="text-blue-700 font-medium">Khởi hành</Text>
                    </div>
                    <Text strong className="text-neutral-800">{formatTime(trip.departureTime)}</Text>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ClockCircleOutlined className="text-green-600" />
                      <Text className="text-green-700 font-medium">Đến nơi</Text>
                    </div>
                    <Text strong className="text-neutral-800">{formatTime(trip.arrivalTime)}</Text>
                  </div>
                  
                  <div className="p-4 bg-accent-purple-50 rounded-lg">
                    <Text className="text-accent-purple-700 font-medium block mb-2">Thời gian & Khoảng cách</Text>
                    <Text strong className="text-neutral-800 block">{trip.duration?.formatted || 'N/A'}</Text>
                    <Text className="text-neutral-600 text-sm">{trip.route?.distance} km</Text>
                  </div>
                </div>
              </div>
            </Card>

            {/* Bus Info */}
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <CarOutlined className="text-primary-600" />
                  <span className="text-neutral-800 font-semibold">Thông tin xe</span>
                </div>
              } 
              className="mb-6 rounded-xl border border-neutral-200 shadow-md"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <Text className="text-blue-700 font-medium block mb-2">Biển số xe</Text>
                    <Text strong className="text-neutral-800 text-lg">{trip.bus?.busNumber}</Text>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <Text className="text-green-700 font-medium block mb-2">Loại xe</Text>
                    <Text strong className="text-neutral-800 text-lg">{trip.bus?.busType}</Text>
                  </div>
                </div>
                
                <div className="p-4 bg-accent-orange-50 rounded-lg">
                  <Text className="text-accent-orange-700 font-medium block mb-2">Thông tin ghế</Text>
                  <Text strong className="text-neutral-800">
                    {trip.seats?.total} ghế ({trip.seats?.available} ghế trống)
                  </Text>
                </div>
                
                <div className="p-4 bg-accent-purple-50 rounded-lg">
                  <Text className="text-accent-purple-700 font-medium block mb-3">Tiện nghi</Text>
                  <div className="flex flex-wrap gap-2">
                    {trip.bus?.amenities?.map(amenity => (
                      <Tag 
                        key={amenity} 
                        className="px-3 py-1 rounded-lg border-0 bg-white text-neutral-700 font-medium shadow-sm"
                      >
                        {getAmenityIcon(amenity)} {amenity}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Pickup Points */}
            <Card 
              title={<span className="text-neutral-800 font-semibold">Điểm đón</span>} 
              className="mb-6 rounded-xl border border-neutral-200 shadow-md"
            >
              <div className="space-y-3">
                {trip.route?.pickupPoints?.map((point, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedPickup?.name === point.name 
                        ? 'border-primary-500 bg-primary-50 shadow-md' 
                        : 'border-neutral-200 bg-white hover:border-primary-300 hover:bg-primary-25'
                    }`}
                    onClick={() => setSelectedPickup(point)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <Text strong className="text-neutral-800 block mb-1">{point.name}</Text>
                        <Text className="text-sm text-neutral-600">{point.address}</Text>
                      </div>
                      <div className="text-right">
                        <div className="px-3 py-1 bg-blue-100 rounded-lg">
                          <Text className="text-blue-700 font-semibold">
                            {dayjs(trip.departureTime).format('HH:mm')}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Dropoff Points */}
            <Card 
              title={<span className="text-neutral-800 font-semibold">Điểm trả</span>} 
              className="mb-6 rounded-xl border border-neutral-200 shadow-md"
            >
              <div className="space-y-3">
                {trip.route?.dropoffPoints?.map((point, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedDropoff?.name === point.name 
                        ? 'border-accent-orange-500 bg-accent-orange-50 shadow-md' 
                        : 'border-neutral-200 bg-white hover:border-accent-orange-300 hover:bg-accent-orange-25'
                    }`}
                    onClick={() => setSelectedDropoff(point)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <Text strong className="text-neutral-800 block mb-1">{point.name}</Text>
                        <Text className="text-sm text-neutral-600">{point.address}</Text>
                      </div>
                      <div className="text-right">
                        <div className="px-3 py-1 bg-accent-orange-100 rounded-lg">
                          <Text className="text-accent-orange-700 font-semibold">
                            {dayjs(trip.arrivalTime).format('HH:mm')}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Reviews Section */}
            <ReviewsSection tripId={tripId} />

            {/* Policies */}
            {trip.policies && (
              <Card 
                title={<span className="text-neutral-800 font-semibold">Chính sách</span>} 
                className="mb-6 rounded-xl border border-neutral-200 shadow-md"
              >
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <div className="whitespace-pre-line text-neutral-700 leading-relaxed">{trip.policies}</div>
                </div>
              </Card>
            )}
          </Col>

          {/* Seat Selection & Booking Summary */}
          <Col xs={24} lg={8}>
            {/* Seat Map */}
            <Card 
              title={<span className="text-neutral-800 font-semibold">Chọn ghế</span>} 
              className="mb-6 sticky top-4 rounded-xl border border-neutral-200 shadow-lg"
            >
              <SeatMapComponent
                seatLayout={trip.bus?.seatLayout}
                bookedSeats={trip.seats?.bookedSeatNumbers || []}
                heldSeats={trip.seats?.heldSeatNumbers || []}
                availableSeats={availableSeats}
              />

              <Divider className="border-neutral-200" />

              {/* Selected Seats */}
              <div className="mb-5">
                <Text strong className="text-neutral-800 block mb-3">Ghế đã chọn:</Text>
                <div className="p-3 bg-neutral-50 rounded-lg min-h-[60px] flex items-center">
                  {selectedSeats.length === 0 ? (
                    <Text className="text-neutral-400 italic">Chưa chọn ghế</Text>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map(seat => (
                        <Tag 
                          key={seat.seatNumber} 
                          className="px-3 py-2 rounded-lg border-0 bg-primary-100 text-primary-700 font-semibold text-base"
                        >
                          {seat.seatNumber}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Divider className="border-neutral-200" />

              {/* Price Summary */}
              <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <Text className="text-neutral-600">Giá vé ({selectedSeats.length} ghế)</Text>
                  <Text strong className="text-primary-600">
                    {selectedSeats.length > 0 ? formatPrice(getSeatPrice()) : '0đ'} x {selectedSeats.length}
                  </Text>
                </div>
                <Divider className="my-3 border-neutral-300" />
                <div className="flex justify-between items-center">
                  <Text strong className="text-lg text-neutral-800">Tổng cộng</Text>
                  <Text strong className="text-xl text-primary-600">
                    {formatPrice(calculateTotalPrice())}
                  </Text>
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                block
                onClick={handleContinue}
                disabled={selectedSeats.length === 0 || !selectedPickup || !selectedDropoff}
                className="h-12 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200"
              >
                Tiếp tục
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
      </div>
    </CustomerLayout>
  );
};

export default TripDetailPage;
