import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Tag,
  Space,
  Divider,
  Form,
  Input,
  DatePicker,
  Select,
  Slider,
  Checkbox,
  Empty,
  Spin,
  Badge,
  Tooltip,
  Rate,
  Avatar,
  Pagination,
  AutoComplete,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  SwapOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  UserOutlined,
  StarOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  WifiOutlined,
  CarOutlined,
  ReloadOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  DollarOutlined,
  SendOutlined,
  CompassOutlined,
  GiftOutlined,
  TrophyOutlined,
  FireOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';
import useBookingStore from '../store/bookingStore';
import CustomerLayout from '../components/customer/CustomerLayout';
import { searchTrips, getTripDetails, getTripDynamicPrice } from '../services/bookingApi';

const { Title, Text } = Typography;
const { Option } = Select;

const TripsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchCriteria, setSelectedTrip, setSearchCriteria } = useBookingStore();

  // State
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(true);

  // Filters
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [sortBy, setSortBy] = useState('time');
  const [sortOrder, setSortOrder] = useState('asc');
  const [busType, setBusType] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('');

  // Search form
  const [searchForm] = Form.useForm();

  // City suggestions
  const cityOptions = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'Nha Trang', 'Huế', 'Vũng Tàu', 'Đà Lạt', 'Quy Nhon',
    'Phan Thiết', 'Hạ Long', 'Sapa', 'Phú Quốc', 'Buôn Ma Thuột'
  ];

  // Check if this is search results page
  const isSearchResults = location.pathname === '/search-results';

  useEffect(() => {
    console.log('TripsPage mounted/updated', {
      pathname: location.pathname,
      isSearchResults,
      searchCriteria
    });

    if (isSearchResults) {
      // Search results page: always show results if criteria exist
      if (searchCriteria.fromCity && searchCriteria.toCity && searchCriteria.date) {
        console.log('Loading search results with criteria:', searchCriteria);
        searchForm.setFieldsValue({
          fromCity: searchCriteria.fromCity,
          toCity: searchCriteria.toCity,
          date: dayjs(searchCriteria.date),
          passengers: searchCriteria.passengers || 1
        });
        fetchTrips();
      } else {
        console.warn('No search criteria found on search-results page, redirecting to /trips');
        // If no search criteria on search-results page, redirect to trips page
        navigate('/trips', { replace: true });
      }
      setShowSearchForm(false); // Never show main search form on results page
    } else {
      // Trips page: ALWAYS fetch all trips and show empty search form
      // This allows users to browse all trips and then filter if needed
      console.log('On trips page - fetching all trips and showing empty search form');

      // Always show empty form to encourage fresh search
      searchForm.setFieldsValue({
        fromCity: '',
        toCity: '',
        date: dayjs(),
        passengers: 1
      });

      // Always fetch ALL available trips (no filters)
      fetchAllTrips();

      setShowSearchForm(true); // Always show search form on trips page
    }
  }, [location.pathname]); // Only depend on pathname, not searchCriteria

  useEffect(() => {
    applyFilters();
  }, [trips, priceRange, sortBy, sortOrder, busType, operatorFilter]);

  const fetchTrips = async (criteria = searchCriteria) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching trips with criteria:', criteria);
      
      const response = await searchTrips(criteria);
      console.log('📡 API Response:', response);

      if (response.status === 'success' && response.data?.trips) {
        // Process trips data to ensure all required fields
        const processedTrips = response.data.trips.map(trip => ({
          ...trip,
          // Extract city names from route data
          fromCity: trip.routeId?.origin?.city || trip.routeId?.origin?.province || 'Điểm đi',
          toCity: trip.routeId?.destination?.city || trip.routeId?.destination?.province || 'Điểm đến',
          fromLocation: trip.routeId?.origin?.address || trip.routeId?.origin?.city,
          toLocation: trip.routeId?.destination?.address || trip.routeId?.destination?.city,
          // Calculate duration if not available
          duration: trip.duration ? `${Math.floor(trip.duration / 60)}h ${trip.duration % 60}m` : 
                   calculateDuration(trip.departureTime, trip.arrivalTime),
          // Ensure operator info
          operatorName: trip.operatorId?.companyName || 'Nhà xe',
          operatorRating: trip.operatorId?.averageRating || 0,
          // Ensure bus info
          busType: trip.busId?.busType || 'Xe khách',
          busNumber: trip.busId?.busNumber || 'N/A',
          amenities: trip.busId?.amenities || [],
          // Ensure pricing
          finalPrice: trip.finalPrice || trip.basePrice || 0,
          basePrice: trip.basePrice || 0,
          discount: trip.discount || 0,
          // Seat info
          totalSeats: trip.totalSeats || 0,
          availableSeats: trip.availableSeats || 0,
        }));

        setTrips(processedTrips);

        // Calculate max price for slider
        if (processedTrips.length > 0) {
          const prices = processedTrips.map(t => t.finalPrice);
          const max = Math.max(...prices);
          setMaxPrice(Math.ceil(max / 10000) * 10000);
          setPriceRange([0, Math.ceil(max / 10000) * 10000]);
        }

        console.log(`Processed ${processedTrips.length} trips successfully`);
        toast.success(`Tìm thấy ${processedTrips.length} chuyến xe`);
      } else {
        setTrips([]);
        toast.error('Không tìm thấy chuyến xe phù hợp');
      }
    } catch (error) {
      console.error(' Fetch trips error:', error);
      setTrips([]);
      toast.error(typeof error === 'string' ? error : 'Có lỗi xảy ra khi tìm kiếm chuyến xe');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate duration
  const calculateDuration = (departureTime, arrivalTime) => {
    if (!departureTime || !arrivalTime) return 'Đang cập nhật';
    
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);
    const diffMs = arrival - departure;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m`;
  };

  // Function to load dynamic pricing for trips (optional enhancement)
  const loadDynamicPricing = async (tripId) => {
    try {
      const response = await getTripDynamicPrice(tripId);
      if (response.status === 'success') {
        return response.data;
      }
    } catch (error) {
      console.warn('Could not load dynamic pricing for trip:', tripId, error);
    }
    return null;
  };

  const fetchAllTrips = async () => {
    try {
      setLoading(true);
      console.log('🚌 Fetching all available trips without filters...');

      // Call search API without fromCity, toCity, date filters
      // Backend will return all available trips
      const response = await searchTrips({ passengers: 1 });
      console.log('📡 All trips API Response:', response);

      if (response.status === 'success' && response.data?.trips) {
        // Process trips data similar to fetchTrips
        const processedTrips = response.data.trips.map(trip => ({
          ...trip,
          // Extract city names from route data
          fromCity: trip.routeId?.origin?.city || trip.routeId?.origin?.province || 'Điểm đi',
          toCity: trip.routeId?.destination?.city || trip.routeId?.destination?.province || 'Điểm đến',
          fromLocation: trip.routeId?.origin?.address || trip.routeId?.origin?.city,
          toLocation: trip.routeId?.destination?.address || trip.routeId?.destination?.city,
          // Calculate duration if not available
          duration: trip.duration ? `${Math.floor(trip.duration / 60)}h ${trip.duration % 60}m` : 
                   calculateDuration(trip.departureTime, trip.arrivalTime),
          // Ensure operator info
          operatorName: trip.operatorId?.companyName || 'Nhà xe',
          operatorRating: trip.operatorId?.averageRating || 0,
          // Ensure bus info
          busType: trip.busId?.busType || 'Xe khách',
          busNumber: trip.busId?.busNumber || 'N/A',
          amenities: trip.busId?.amenities || [],
          // Ensure pricing
          finalPrice: trip.finalPrice || trip.basePrice || 0,
          basePrice: trip.basePrice || 0,
          discount: trip.discount || 0,
          // Seat info
          totalSeats: trip.totalSeats || 0,
          availableSeats: trip.availableSeats || 0,
        }));

        setTrips(processedTrips);

        // Calculate max price for slider
        if (processedTrips.length > 0) {
          const prices = processedTrips.map(t => t.finalPrice);
          const max = Math.max(...prices);
          setMaxPrice(Math.ceil(max / 10000) * 10000);
          setPriceRange([0, Math.ceil(max / 10000) * 10000]);
        }

        console.log(`Loaded ${processedTrips.length} available trips`);
        toast.success(`Hiển thị ${processedTrips.length} chuyến xe có sẵn`);
      } else {
        setTrips([]);
        toast.info('Hiện không có chuyến xe nào');
      }
    } catch (error) {
      console.error(' Fetch all trips error:', error);
      setTrips([]);
      toast.error(typeof error === 'string' ? error : 'Có lỗi xảy ra khi tải danh sách chuyến xe');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...trips];

    // Filter by price range
    filtered = filtered.filter(
      trip => trip.finalPrice >= priceRange[0] && trip.finalPrice <= priceRange[1]
    );

    // Filter by bus type
    if (busType) {
      filtered = filtered.filter(trip => trip.busId?.busType === busType);
    }

    // Filter by operator
    if (operatorFilter) {
      filtered = filtered.filter(trip =>
        trip.operatorId?.companyName.toLowerCase().includes(operatorFilter.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'price':
          comparison = a.finalPrice - b.finalPrice;
          break;
        case 'rating':
          comparison = (b.operatorId?.averageRating || 0) - (a.operatorId?.averageRating || 0);
          break;
        case 'time':
        default:
          comparison = new Date(a.departureTime) - new Date(b.departureTime);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredTrips(filtered);
  };

  const handleSearch = async (values) => {
    try {
      setSearchLoading(true);

      const newSearchCriteria = {
        fromCity: values.fromCity,
        toCity: values.toCity,
        date: values.date.format('YYYY-MM-DD'),
        passengers: values.passengers || 1
      };

      // Update search criteria in store
      setSearchCriteria(newSearchCriteria);

      if (isSearchResults) {
        // If on search-results page, just update results without navigation
        await fetchTrips(newSearchCriteria);

        // Reset filters
        setPriceRange([0, maxPrice]);
        setBusType('');
        setOperatorFilter('');
        setSortBy('time');
        setSortOrder('asc');
      } else {
        // If on trips page, navigate to search-results
        navigate('/search-results');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Có lỗi xảy ra khi tìm kiếm');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleTripSelect = async (trip) => {
    try {
      // Set loading state for this specific trip
      setSelectedTrip(trip);
      
      // Optionally load more detailed trip information
      console.log('🚌 Loading detailed trip information for:', trip._id);
      
      // Navigate to trip detail page
      navigate(`/trips/${trip._id}`);
    } catch (error) {
      console.error(' Error selecting trip:', error);
      toast.error('Có lỗi xảy ra khi chọn chuyến xe');
    }
  };

  const handleSwapCities = () => {
    const currentValues = searchForm.getFieldsValue();
    searchForm.setFieldsValue({
      fromCity: currentValues.toCity,
      toCity: currentValues.fromCity
    });
  };

  const formatTime = (dateString) => {
    return dayjs(dateString).format('HH:mm');
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const getBusTypes = () => {
    const types = new Set();
    trips.forEach(trip => {
      if (trip.busType) {
        types.add(trip.busType);
      }
    });
    return Array.from(types);
  };

  // Helper function to get amenity configuration
  const getAmenityConfig = (amenity) => {
    const amenityMap = {
      'WiFi': { icon: '🌐', label: 'WiFi', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-700' },
      'wifi': { icon: '🌐', label: 'WiFi', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-700' },
      'AC': { icon: '❄️', label: 'Điều hòa', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-700' },
      'Air Conditioning': { icon: '❄️', label: 'Điều hòa', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-700' },
      'Charger': { icon: '🔌', label: 'Sạc điện thoại', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-700' },
      'USB Charger': { icon: '🔌', label: 'Sạc điện thoại', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-700' },
      'Entertainment': { icon: '📺', label: 'Giải trí', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', textColor: 'text-pink-700' },
      'TV': { icon: '📺', label: 'TV', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', textColor: 'text-pink-700' },
      'Toilet': { icon: '🚻', label: 'Toilet', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', textColor: 'text-cyan-700' },
      'Water': { icon: '💧', label: 'Nước uống', bgColor: 'bg-teal-50', borderColor: 'border-teal-200', textColor: 'text-teal-700' },
      'Blanket': { icon: '🛏️', label: 'Chăn gối', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-700' },
      'Pillow': { icon: '🛏️', label: 'Chăn gối', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-700' },
      'Snack': { icon: '🍿', label: 'Đồ ăn nhẹ', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', textColor: 'text-orange-700' },
      'Reading Light': { icon: '💡', label: 'Đèn đọc sách', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', textColor: 'text-amber-700' },
    };

    return amenityMap[amenity] || { 
      icon: '✨', 
      label: amenity, 
      bgColor: 'bg-gray-50', 
      borderColor: 'border-gray-200', 
      textColor: 'text-gray-700' 
    };
  };

  return (
    <CustomerLayout>
      {/* Search Form Section */}
      <div className="bg-gray-50 py-6">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">

          {/* Modern Search Form */}
          {showSearchForm && (
            <div className="max-w-5xl mx-auto">
              <Card className="backdrop-blur-xl bg-white/98 shadow-2xl border-0 rounded-3xl overflow-hidden">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-red-500 via-red-600 to-orange-600 -mx-6 -mt-6 mb-6 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <SearchOutlined className="text-2xl text-white" />
                      </div>
                      <div>
                        <Title level={3} className="!mb-1 !text-white font-bold">
                          Tìm chuyến xe của bạn
                        </Title>
                        <Text className="text-white/90 text-sm">
                          Khám phá hàng nghìn chuyến xe trên toàn quốc
                        </Text>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                      <ThunderboltOutlined className="text-yellow-300 animate-pulse" />
                      <Text className="text-white/90 text-sm font-medium">NHANH CHÓNG</Text>
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8">
                  <Form
                    form={searchForm}
                    layout="vertical"
                    onFinish={handleSearch}
                    className="relative"
                  >
                    <Row gutter={[16, 16]} align="bottom">
                      <Col xs={24} sm={10}>
                        <Form.Item
                          label={
                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <EnvironmentOutlined className="text-red-500" />
                              Điểm đi
                            </span>
                          }
                          name="fromCity"
                          rules={[{ required: true, message: 'Vui lòng nhập điểm đi!' }]}
                        >
                          <AutoComplete
                            size="large"
                            placeholder="Chọn điểm đi..."
                            options={cityOptions.map(city => ({ value: city }))}
                            filterOption={(inputValue, option) =>
                              option.value.toLowerCase().includes(inputValue.toLowerCase())
                            }
                            className="rounded-xl border-2 border-gray-200 hover:border-red-400 focus:border-red-500 transition-all duration-300"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={2} className="flex justify-center">
                        <Form.Item label={<span className="opacity-0">Swap</span>}>
                          <Button
                            type="text"
                            icon={<SwapOutlined className="text-lg" />}
                            onClick={handleSwapCities}
                            size="large"
                            className="h-12 w-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={10}>
                        <Form.Item
                          label={
                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <SendOutlined className="text-orange-500" />
                              Điểm đến
                            </span>
                          }
                          name="toCity"
                          rules={[{ required: true, message: 'Vui lòng nhập điểm đến!' }]}
                        >
                          <AutoComplete
                            size="large"
                            placeholder="Chọn điểm đến..."
                            options={cityOptions.map(city => ({ value: city }))}
                            filterOption={(inputValue, option) =>
                              option.value.toLowerCase().includes(inputValue.toLowerCase())
                            }
                            className="rounded-xl border-2 border-gray-200 hover:border-orange-400 focus:border-orange-500 transition-all duration-300"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <CalendarOutlined className="text-blue-500" />
                              Ngày khởi hành
                            </span>
                          }
                          name="date"
                          rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
                        >
                          <DatePicker
                            size="large"
                            placeholder="Chọn ngày khởi hành"
                            format="DD/MM/YYYY"
                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                            className="w-full rounded-xl border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-all duration-300"
                            suffixIcon={<CalendarOutlined className="text-blue-500" />}
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item label={<span className="opacity-0">Search</span>}>
                          <Button
                            type="primary"
                            size="large"
                            block
                            htmlType="submit"
                            loading={searchLoading}
                            icon={<SearchOutlined className="text-lg" />}
                            className="h-12 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 border-0 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                          >
                            {searchLoading ? 'Đang tìm kiếm...' : 'Tìm chuyến xe ngay'}
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Search Results Header with New Search Form */}
      {isSearchResults && !showSearchForm && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <SearchOutlined className="text-white" />
                </div>
                <div>
                  <Title level={3} className="mb-0 text-gray-800">
                    Kết quả tìm kiếm
                  </Title>
                  <Text className="text-gray-500">
                    {searchCriteria.fromCity} → {searchCriteria.toCity} • {dayjs(searchCriteria.date).format('DD/MM/YYYY')}
                  </Text>
                </div>
              </div>
              <Button
                onClick={() => navigate('/trips')}
                icon={<SearchOutlined />}
                size="large"
                className="bg-red-600 hover:bg-red-700 text-white border-0 rounded-xl px-6"
              >
                Tìm chuyến mới
              </Button>
            </div>

            {/* Compact Search Form for Results Page */}
            <Card className="shadow-md border-0 rounded-2xl bg-gray-50">
              <Form
                form={searchForm}
                layout="vertical"
                onFinish={handleSearch}
                className="mb-0"
              >
                <Row gutter={[12, 12]} align="bottom">
                  <Col xs={24} sm={8}>
                    <Form.Item
                      label={<span className="text-xs font-medium text-gray-600">Điểm đi</span>}
                      name="fromCity"
                      rules={[{ required: true, message: 'Vui lòng nhập điểm đi!' }]}
                      className="mb-2"
                    >
                      <AutoComplete
                        placeholder="Điểm đi"
                        options={cityOptions.map(city => ({ value: city }))}
                        filterOption={(inputValue, option) =>
                          option.value.toLowerCase().includes(inputValue.toLowerCase())
                        }
                        className="h-9 rounded-lg"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={1} className="flex justify-center">
                    <Button
                      type="text"
                      icon={<SwapOutlined />}
                      onClick={handleSwapCities}
                      className="h-9 w-9 rounded-lg bg-white hover:bg-red-50 text-red-600 border hover:border-red-300 transition-all duration-300 mt-5"
                    />
                  </Col>

                  <Col xs={24} sm={8}>
                    <Form.Item
                      label={<span className="text-xs font-medium text-gray-600">Điểm đến</span>}
                      name="toCity"
                      rules={[{ required: true, message: 'Vui lòng nhập điểm đến!' }]}
                      className="mb-2"
                    >
                      <AutoComplete
                        placeholder="Điểm đến"
                        options={cityOptions.map(city => ({ value: city }))}
                        filterOption={(inputValue, option) =>
                          option.value.toLowerCase().includes(inputValue.toLowerCase())
                        }
                        className="h-9 rounded-lg"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={5}>
                    <Form.Item
                      label={<span className="text-xs font-medium text-gray-600">Ngày đi</span>}
                      name="date"
                      rules={[{ required: true, message: 'Chọn ngày!' }]}
                      className="mb-2"
                    >
                      <DatePicker
                        placeholder="Chọn ngày"
                        format="DD/MM"
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                        className="w-full h-9 rounded-lg"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={2}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={searchLoading}
                      icon={<SearchOutlined />}
                      className="h-9 w-full mt-5 bg-red-600 hover:bg-red-700 border-0 rounded-lg font-medium"
                    >
                      Tìm
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 py-4">
        {trips.length === 0 && !loading && !showSearchForm ? (
          // Enhanced Empty state
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
                <SearchOutlined className="text-4xl text-red-500" />
              </div>
              <Title level={2} className="text-gray-700 mb-4 font-bold">
                Bắt đầu hành trình của bạn
              </Title>
              <Text className="text-gray-500 text-lg mb-8 block leading-relaxed">
                Tìm kiếm và đặt vé xe khách dễ dàng với hàng nghìn chuyến xe trên toàn quốc
              </Text>
              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                onClick={() => setShowSearchForm(true)}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 border-0 rounded-xl px-8 py-3 h-auto font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Bắt đầu tìm kiếm
              </Button>

              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <ThunderboltOutlined className="text-2xl text-red-500 mb-2" />
                  <Text className="text-xs text-gray-600 block">Tìm kiếm nhanh</Text>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <SafetyOutlined className="text-2xl text-green-500 mb-2" />
                  <Text className="text-xs text-gray-600 block">An toàn tin cậy</Text>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <GiftOutlined className="text-2xl text-orange-500 mb-2" />
                  <Text className="text-xs text-gray-600 block">Ưu đãi hấp dẫn</Text>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {/* Enhanced Filters Sidebar */}
            <Col xs={24} lg={6}>
              <div className="space-y-4">
                {/* Quick Filters - Only for Search Results */}
                {isSearchResults && (
                  <Card className="shadow-lg rounded-2xl border-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 -mx-6 -mt-6 mb-4 px-6 py-4">
                      <Title level={5} className="mb-0 text-gray-800 flex items-center gap-2">
                        <ThunderboltOutlined className="text-red-500" />
                        Lọc nhanh
                      </Title>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        size="small"
                        className={`h-12 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${sortBy === 'price' && sortOrder === 'asc'
                            ? 'border-red-500 bg-red-50 text-red-600'
                            : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                          }`}
                        onClick={() => {
                          setSortBy('price');
                          setSortOrder('asc');
                        }}
                      >
                        <span className="text-lg">💰</span>
                        <span className="text-xs font-medium">Giá thấp</span>
                      </Button>
                      <Button
                        size="small"
                        className={`h-12 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${sortBy === 'time' && sortOrder === 'asc'
                            ? 'border-red-500 bg-red-50 text-red-600'
                            : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                          }`}
                        onClick={() => {
                          setSortBy('time');
                          setSortOrder('asc');
                        }}
                      >
                        <span className="text-lg"></span>
                        <span className="text-xs font-medium">Sớm nhất</span>
                      </Button>
                      <Button
                        size="small"
                        className={`h-12 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${sortBy === 'rating' && sortOrder === 'desc'
                            ? 'border-red-500 bg-red-50 text-red-600'
                            : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                          }`}
                        onClick={() => {
                          setSortBy('rating');
                          setSortOrder('desc');
                        }}
                      >
                        <span className="text-lg">⭐</span>
                        <span className="text-xs font-medium">Đánh giá</span>
                      </Button>
                      <Button
                        size="small"
                        className={`h-12 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${busType === 'Giường nằm'
                            ? 'border-red-500 bg-red-50 text-red-600'
                            : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                          }`}
                        onClick={() => setBusType(busType === 'Giường nằm' ? '' : 'Giường nằm')}
                      >
                        <span className="text-lg">🛏️</span>
                        <span className="text-xs font-medium">Giường nằm</span>
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Time Filter - Only for Search Results */}
                {isSearchResults && (
                  <Card className="shadow-lg rounded-2xl border-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 -mx-6 -mt-6 mb-4 px-6 py-4">
                      <Title level={5} className="mb-0 text-gray-800 flex items-center gap-2">
                        <ClockCircleOutlined className="text-blue-500" />
                        Giờ khởi hành
                      </Title>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Sáng sớm (00:00 - 06:00)', value: 'early', icon: '🌅' },
                        { label: 'Buổi sáng (06:00 - 12:00)', value: 'morning', icon: '☀️' },
                        { label: 'Buổi chiều (12:00 - 18:00)', value: 'afternoon', icon: '🌤️' },
                        { label: 'Buổi tối (18:00 - 24:00)', value: 'evening', icon: '🌙' }
                      ].map((time) => (
                        <div
                          key={time.value}
                          className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{time.icon}</span>
                            <div>
                              <div className="text-sm font-medium text-gray-700">{time.label.split(' (')[0]}</div>
                              <div className="text-xs text-gray-500">{time.label.split(' (')[1]?.replace(')', '')}</div>
                            </div>
                          </div>
                          <Checkbox />
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Amenities Filter - Only for Search Results */}
                {isSearchResults && (
                  <Card className="shadow-lg rounded-2xl border-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 -mx-6 -mt-6 mb-4 px-6 py-4">
                      <Title level={5} className="mb-0 text-gray-800 flex items-center gap-2">
                        <SafetyOutlined className="text-green-500" />
                        Tiện ích
                      </Title>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'WiFi miễn phí', icon: <WifiOutlined className="text-blue-500" />, value: 'wifi' },
                        { label: 'Điều hòa', icon: '❄️', value: 'ac' },
                        { label: 'Toilet', icon: '🚻', value: 'toilet' },
                        { label: 'Nước uống', icon: '💧', value: 'water' },
                        { label: 'Chăn gối', icon: '🛏️', value: 'blanket' },
                        { label: 'Sạc điện thoại', icon: '🔌', value: 'charger' }
                      ].map((amenity) => (
                        <div
                          key={amenity.value}
                          className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{amenity.icon}</span>
                            <span className="text-sm font-medium text-gray-700">{amenity.label}</span>
                          </div>
                          <Checkbox />
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Main Filters */}
                <Card className="shadow-lg rounded-2xl border-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 -mx-6 -mt-6 mb-4 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                          <FilterOutlined className="text-white text-sm" />
                        </div>
                        <span className="font-bold text-gray-800">Bộ lọc chi tiết</span>
                      </div>
                      <Button
                        type="text"
                        size="small"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg px-3 py-1 font-medium"
                        onClick={() => {
                          setPriceRange([0, maxPrice]);
                          setBusType('');
                          setOperatorFilter('');
                          setSortBy('time');
                          setSortOrder('asc');
                        }}
                      >
                        Đặt lại
                      </Button>
                    </div>
                  </div>
                  {/* Sort */}
                  <div className="mb-4">
                    <Text strong className="text-gray-700 flex items-center gap-2 mb-2">
                      <SortAscendingOutlined className="text-blue-500" />
                      Sắp xếp theo
                    </Text>
                    <Select
                      value={sortBy}
                      onChange={setSortBy}
                      className="w-full"
                      size="large"
                    >
                      <Option value="time">Thời gian khởi hành</Option>
                      <Option value="price">💰 Giá vé</Option>
                      <Option value="rating">⭐ Đánh giá nhà xe</Option>
                    </Select>
                  </div>

                  <div className="mb-4">
                    <Select
                      value={sortOrder}
                      onChange={setSortOrder}
                      className="w-full"
                      size="large"
                    >
                      <Option value="asc">📈 Tăng dần</Option>
                      <Option value="desc">📉 Giảm dần</Option>
                    </Select>
                  </div>

                  <Divider />

                  {/* Price Range */}
                  <div className="mb-4">
                    <Text strong className="text-gray-700 flex items-center gap-2 mb-3">
                      <DollarOutlined className="text-green-500" />
                      Khoảng giá ({formatPrice(priceRange[0])} - {formatPrice(priceRange[1])})
                    </Text>
                    <Slider
                      range
                      min={0}
                      max={maxPrice}
                      step={10000}
                      value={priceRange}
                      onChange={setPriceRange}
                      className="mt-3"
                      tooltip={{
                        formatter: (value) => formatPrice(value),
                      }}
                      trackStyle={[{ backgroundColor: '#ef4444' }]}
                      handleStyle={[
                        { borderColor: '#ef4444', backgroundColor: '#ef4444' },
                        { borderColor: '#ef4444', backgroundColor: '#ef4444' }
                      ]}
                    />
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <Button
                        size="small"
                        onClick={() => setPriceRange([0, 200000])}
                        className="text-xs rounded-lg border-gray-200 hover:border-red-300"
                      >
                        Dưới 200k
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setPriceRange([200000, 500000])}
                        className="text-xs rounded-lg border-gray-200 hover:border-red-300"
                      >
                        200k - 500k
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setPriceRange([500000, maxPrice])}
                        className="text-xs rounded-lg border-gray-200 hover:border-red-300"
                      >
                        Trên 500k
                      </Button>
                    </div>
                  </div>

                  <Divider />

                  {/* Bus Type */}
                  <div className="mb-4">
                    <Text strong className="text-gray-700 flex items-center gap-2 mb-3">
                      <CarOutlined className="text-orange-500" />
                      Loại xe
                    </Text>
                    <Select
                      value={busType}
                      onChange={setBusType}
                      className="w-full"
                      placeholder="Tất cả loại xe"
                      allowClear
                      size="large"
                    >
                      {getBusTypes().map(type => (
                        <Option key={type} value={type}>
                          {type === 'Giường nằm' ? '🛏️' : '💺'} {type}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <Divider />

                  {/* Operator Filter */}
                  <div>
                    <Text strong className="text-gray-700 flex items-center gap-2 mb-3">
                      <TrophyOutlined className="text-yellow-500" />
                      Nhà xe
                    </Text>
                    <Input
                      placeholder="Tìm theo tên nhà xe"
                      value={operatorFilter}
                      onChange={(e) => setOperatorFilter(e.target.value)}
                      allowClear
                      size="large"
                      prefix={<SearchOutlined className="text-gray-400" />}
                      className="rounded-lg"
                    />

                    {/* Popular Operators - Only for Search Results */}
                    {isSearchResults && (
                      <div className="mt-3">
                        <Text className="text-xs text-gray-500 mb-2 block">Nhà xe phổ biến:</Text>
                        <div className="flex flex-wrap gap-2">
                          {['Phương Trang', 'Thành Bưởi', 'Hoàng Long', 'Mai Linh'].map((operator) => (
                            <Button
                              key={operator}
                              size="small"
                              type="text"
                              className="h-8 px-3 text-xs bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-300 rounded-full transition-all"
                              onClick={() => setOperatorFilter(operator)}
                            >
                              {operator}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </Col>

            {/* Trip List */}
            <Col xs={24} lg={18}>
              {!showSearchForm && (
                <div className="mb-6 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <FireOutlined className="text-white" />
                    </div>
                    <div>
                      <Text strong className="text-xl text-gray-800">
                        {loading ? 'Đang tìm kiếm...' : `Tìm thấy ${filteredTrips.length} chuyến xe`}
                      </Text>
                      <div className="text-sm text-gray-500">
                        Cập nhật lúc {dayjs().format('HH:mm DD/MM/YYYY')}
                      </div>
                    </div>
                  </div>
                  <Space>
                    {isSearchResults ? (
                      <Button
                        onClick={() => navigate('/trips')}
                        icon={<SearchOutlined />}
                        size="large"
                        className="rounded-xl border-2 hover:border-red-400 transition-colors"
                      >
                        Tìm chuyến mới
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setShowSearchForm(true)}
                        icon={<SearchOutlined />}
                        size="large"
                        className="rounded-xl border-2 hover:border-red-400 transition-colors"
                      >
                        Tìm kiếm
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        // If on search-results or has criteria, refetch with criteria
                        // Otherwise fetch all trips
                        if (isSearchResults || (searchCriteria.fromCity && searchCriteria.toCity && searchCriteria.date)) {
                          fetchTrips();
                        } else {
                          fetchAllTrips();
                        }
                      }}
                      icon={<ReloadOutlined />}
                      loading={loading}
                      size="large"
                      className="rounded-xl border-2 hover:border-red-400 transition-colors"
                    >
                      Làm mới
                    </Button>
                  </Space>
                </div>
              )}

              {loading ? (
                <div className="text-center py-20">
                  <Spin size="large" />
                  <div className="mt-4">
                    <Text className="text-gray-500">Đang tìm kiếm chuyến xe...</Text>
                  </div>
                </div>
              ) : filteredTrips.length === 0 && trips.length > 0 ? (
                <Empty
                  description="Không tìm thấy chuyến xe phù hợp với bộ lọc"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <div className="space-y-6">
                  {filteredTrips.map((trip) => (
                    <Card
                      key={trip._id}
                      className="hover:shadow-xl hover:scale-[1.01] transition-all duration-300 rounded-2xl border border-neutral-200 shadow-md overflow-hidden group bg-white"
                      styles={{ body: { padding: 0 } }}
                    >
                      {/* Trip Header */}
                      <div className="bg-neutral-50 px-6 py-5 border-b border-neutral-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar 
                              size={48} 
                              className="bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold shadow-md"
                            >
                              {trip.operatorName?.charAt(0) || 'N'}
                            </Avatar>
                            <div>
                              <Text strong className="text-neutral-800 text-lg font-semibold">
                                {trip.operatorName}
                              </Text>
                              <div className="flex items-center gap-3 mt-1">
                                <Rate
                                  disabled
                                  defaultValue={trip.operatorRating}
                                  size="small"
                                  className="text-warning-500"
                                />
                                <Text className="text-xs text-neutral-500 font-medium">
                                  ({trip.operatorRating.toFixed(1)}/5)
                                </Text>
                                <div className="w-1 h-1 bg-neutral-300 rounded-full"></div>
                                <Tag color="blue" className="text-xs font-medium border-0 bg-blue-50 text-blue-700">
                                  {trip.busType}
                                </Tag>
                                {trip.busNumber && (
                                  <Tag color="green" className="text-xs font-medium border-0 bg-green-50 text-green-700">
                                    {trip.busNumber}
                                  </Tag>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary-600 mb-1">
                              {formatPrice(trip.finalPrice)}
                            </div>
                            <div className="flex items-center justify-end gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                              <UserOutlined className="text-blue-600 text-sm" />
                              <Text className="text-sm text-blue-700 font-medium">
                                {trip.availableSeats} chỗ trống
                              </Text>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Route Information - Enhanced */}
                      <div className="px-6 py-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b">
                        <div className="flex items-center justify-center">
                          <div className="flex items-center gap-6 w-full max-w-4xl">
                            {/* Điểm đi */}
                            <div className="flex-1 text-center">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse"></div>
                                <Text className="text-xs font-bold text-red-600 uppercase tracking-wider">
                                  Điểm đi
                                </Text>
                              </div>
                              <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-red-100">
                                <Text strong className="text-gray-900 text-xl block mb-1">
                                  {trip.fromCity}
                                </Text>
                                {trip.fromLocation && trip.fromLocation !== trip.fromCity && (
                                  <Text className="text-sm text-gray-600 font-medium">
                                    {trip.fromLocation}
                                  </Text>
                                )}
                              </div>
                            </div>
                            
                            {/* Thời gian di chuyển */}
                            <div className="flex-shrink-0">
                              <div className="text-center mb-2">
                                <Text className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                                  Thời gian
                                </Text>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg"></div>
                                <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg">
                                  <CarOutlined className="text-white text-lg" />
                                  <Text className="text-white font-bold text-lg">
                                    {trip.duration}
                                  </Text>
                                </div>
                                <div className="w-4 h-4 bg-orange-500 rounded-full shadow-lg"></div>
                              </div>
                              <div className="mt-2 text-center">
                                <Text className="text-xs text-gray-500 font-medium">
                                  {formatTime(trip.departureTime)} → {formatTime(trip.arrivalTime)}
                                </Text>
                              </div>
                            </div>
                            
                            {/* Điểm đến */}
                            <div className="flex-1 text-center">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <div className="w-3 h-3 bg-orange-500 rounded-full shadow-lg animate-pulse"></div>
                                <Text className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                                  Điểm đến
                                </Text>
                              </div>
                              <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-orange-100">
                                <Text strong className="text-gray-900 text-xl block mb-1">
                                  {trip.toCity}
                                </Text>
                                {trip.toLocation && trip.toLocation !== trip.toCity && (
                                  <Text className="text-sm text-gray-600 font-medium">
                                    {trip.toLocation}
                                  </Text>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Trip Details */}
                      <div className="p-6">

                        {/* Bus Amenities */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <div className="mb-4">
                            <Text strong className="text-gray-700 flex items-center gap-2 mb-3">
                              <GiftOutlined className="text-purple-500" />
                              Tiện ích xe
                            </Text>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {/* Render amenities from backend data */}
                              {trip.amenities && trip.amenities.length > 0 ? (
                                trip.amenities.map((amenity, index) => {
                                  const amenityConfig = getAmenityConfig(amenity);
                                  return (
                                    <div key={index} className={`flex items-center gap-2 p-3 rounded-xl border ${amenityConfig.bgColor} ${amenityConfig.borderColor}`}>
                                      <span className={amenityConfig.textColor}>{amenityConfig.icon}</span>
                                      <Text className={`text-sm font-medium ${amenityConfig.textColor}`}>
                                        {amenityConfig.label}
                                      </Text>
                                    </div>
                                  );
                                })
                              ) : (
                                // Default amenities if no specific amenities data
                                <>
                                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                                    <SafetyOutlined className="text-green-600" />
                                    <Text className="text-sm font-medium text-green-700">Bảo hiểm</Text>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
                                    <span className="text-blue-600">❄️</span>
                                    <Text className="text-sm font-medium text-blue-700">Điều hòa</Text>
                                  </div>

                                  <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                                    <WifiOutlined className="text-indigo-600" />
                                    <Text className="text-sm font-medium text-indigo-700">WiFi</Text>
                                  </div>

                                  {trip.busType === 'Giường nằm' && (
                                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl border border-purple-200">
                                      <span className="text-purple-600">🛏️</span>
                                      <Text className="text-sm font-medium text-purple-700">Chăn gối</Text>
                                    </div>
                                  )}
                                </>
                              )}


                            </div>
                          </div>

                          <Row gutter={[16, 16]} align="middle">
                            <Col xs={24} sm={16}>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
                                  <UserOutlined className="text-blue-600" />
                                  <Text className="text-sm font-bold text-blue-700">
                                    {trip.availableSeats} chỗ trống
                                  </Text>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl border border-orange-200">
                                  <ClockCircleOutlined className="text-orange-600" />
                                  <Text className="text-sm font-medium text-orange-700">
                                    Khởi hành {formatTime(trip.departureTime)}
                                  </Text>
                                </div>
                              </div>
                            </Col>

                            <Col xs={24} sm={8}>
                              <Button
                                type="primary"
                                size="large"
                                block
                                onClick={() => handleTripSelect(trip)}
                                className="h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 border-0 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl group-hover:scale-105 transition-all duration-300"
                                icon={<ThunderboltOutlined />}
                              >
                                Chọn chuyến này
                              </Button>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Col>
          </Row>
        )}
      </div>
    </CustomerLayout>
  );
};

export default TripsPage;