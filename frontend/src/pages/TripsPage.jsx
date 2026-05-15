import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AutoComplete, Button, DatePicker, Empty, Form, Select, Slider, Spin } from 'antd';
import {
  ArrowRightOutlined,
  CalendarOutlined,
  CheckOutlined,
  EnvironmentOutlined,
  FilterOutlined,
  SearchOutlined,
  StarFilled,
  SwapOutlined,
  UserOutlined,
  WifiOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';
import CustomerShell from '../components/customer/CustomerShell';
import useBookingStore from '../store/bookingStore';
import { searchTrips } from '../services/bookingApi';

const cityOptions = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Nha Trang',
  'Huế',
  'Vũng Tàu',
  'Đà Lạt',
  'Quy Nhơn',
  'Phan Thiết',
  'Hạ Long',
  'Sapa',
  'Phú Quốc',
  'Buôn Ma Thuột',
];

const passengerOptions = Array.from({ length: 6 }, (_, index) => ({
  value: index + 1,
  label: `${index + 1} người lớn`,
}));

const timeSlots = [
  { key: 'early', label: '00:00 — 06:00', start: 0, end: 6 },
  { key: 'morning', label: '06:00 — 12:00', start: 6, end: 12 },
  { key: 'afternoon', label: '12:00 — 18:00', start: 12, end: 18 },
  { key: 'night', label: '18:00 — 24:00', start: 18, end: 24 },
];

const amenityOptions = [
  { key: 'wifi', label: 'WiFi', icon: WifiOutlined },
  { key: 'ac', label: 'Máy lạnh', icon: SafetyCertificateOutlined },
  { key: 'charger', label: 'Sạc', icon: ThunderboltOutlined },
  { key: 'water', label: 'Nước', icon: SafetyCertificateOutlined },
];

const formatCurrency = (value = 0) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const formatDuration = (departureTime, arrivalTime) => {
  if (!departureTime || !arrivalTime) return 'Đang cập nhật';

  const diff = dayjs(arrivalTime).diff(dayjs(departureTime), 'minute');
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  return `${hours}h ${minutes}m`;
};

const getInitials = (name = 'NX') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const normalizeAmenity = (amenity = '') => {
  const value = amenity.toLowerCase();
  if (value.includes('wifi')) return 'wifi';
  if (value.includes('air') || value.includes('ac') || value.includes('máy lạnh')) return 'ac';
  if (value.includes('charger') || value.includes('usb') || value.includes('sạc')) return 'charger';
  if (value.includes('water') || value.includes('nước')) return 'water';
  return value;
};

const normalizeTrip = (trip) => {
  const route = trip.routeId || trip.route || {};
  const bus = trip.busId || trip.bus || {};
  const operator = trip.operatorId || trip.operator || {};
  const fromCity = route.origin?.city || route.origin?.province || trip.fromCity || 'Điểm đi';
  const toCity = route.destination?.city || route.destination?.province || trip.toCity || 'Điểm đến';
  const finalPrice = trip.finalPrice || trip.pricing?.finalPrice || trip.basePrice || trip.pricing?.basePrice || 0;
  const basePrice = trip.basePrice || trip.pricing?.basePrice || finalPrice;
  const availableSeats = trip.availableSeats ?? trip.seats?.available ?? 0;
  const totalSeats = trip.totalSeats ?? trip.seats?.total ?? 0;

  return {
    raw: trip,
    id: trip._id || trip.id,
    fromCity,
    toCity,
    fromStation: route.origin?.station || route.origin?.address || fromCity,
    toStation: route.destination?.station || route.destination?.address || toCity,
    routeName: route.routeName || route.name || `${fromCity} → ${toCity}`,
    departureTime: trip.departureTime,
    arrivalTime: trip.arrivalTime,
    departLabel: trip.departureTime ? dayjs(trip.departureTime).format('HH:mm') : '--:--',
    arriveLabel: trip.arrivalTime ? dayjs(trip.arrivalTime).format('HH:mm') : '--:--',
    dateLabel: trip.departureTime ? dayjs(trip.departureTime).format('DD/MM/YYYY') : '--/--/----',
    duration: typeof trip.duration === 'string' ? trip.duration : trip.duration?.formatted || formatDuration(trip.departureTime, trip.arrivalTime),
    operatorId: operator._id || operator.id,
    operatorName: operator.companyName || trip.operatorName || 'Nhà xe',
    operatorRating: operator.averageRating || operator.rating?.average || trip.operatorRating || 0,
    operatorReviews: operator.totalReviews || operator.rating?.total || 0,
    busType: bus.busType || trip.busType || 'Xe khách',
    busNumber: bus.busNumber || trip.busNumber || 'Đang cập nhật',
    amenities: (bus.amenities || trip.amenities || []).map(normalizeAmenity),
    basePrice,
    finalPrice,
    discount: trip.discount || trip.pricing?.discount || 0,
    availableSeats,
    totalSeats,
    tag: trip.discount ? `GIẢM ${trip.discount}%` : availableSeats > 0 && availableSeats < 5 ? 'SẮP HẾT CHỖ' : null,
  };
};

const CompactField = ({ icon: Icon, label, children, last = false }) => (
  <div className={`flex min-h-[72px] flex-col justify-center gap-1 bg-white px-4 py-2 ${last ? '' : 'border-b border-vxn-border lg:border-b-0 lg:border-r'}`}>
    <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.04em] text-vxn-fg-5">
      <Icon className="text-[12px] text-vxn-teal-700" />
      {label}
    </div>
    {children}
  </div>
);

const SearchSummaryBar = ({ form, initialValues, loading, onSearch, onSwap }) => (
  <div className="border-b border-vxn-border bg-white px-4 py-5 lg:px-8">
    <Form form={form} initialValues={initialValues} onFinish={onSearch}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-stretch">
        <div className="grid flex-1 overflow-hidden rounded-xl border border-vxn-border bg-white lg:grid-cols-[1fr_44px_1fr_1fr_1fr]">
          <CompactField icon={EnvironmentOutlined} label="Điểm đi">
            <Form.Item name="fromCity" rules={[{ required: true, message: 'Vui lòng nhập điểm đi!' }]} style={{ marginBottom: 0 }}>
              <AutoComplete
                options={cityOptions.map((city) => ({ value: city }))}
                filterOption={(inputValue, option) => option.value.toLowerCase().includes(inputValue.toLowerCase())}
                placeholder="Hà Nội"
                className="vxn-compact-input"
              />
            </Form.Item>
          </CompactField>

          <div className="grid min-h-[44px] place-items-center border-b border-vxn-border bg-white lg:border-b-0 lg:border-r">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full border border-vxn-border bg-white text-vxn-fg-2 transition hover:border-vxn-teal-600 hover:text-vxn-teal-800"
              onClick={onSwap}
              aria-label="Đổi điểm đi và điểm đến"
            >
              <SwapOutlined />
            </button>
          </div>

          <CompactField icon={EnvironmentOutlined} label="Điểm đến">
            <Form.Item name="toCity" rules={[{ required: true, message: 'Vui lòng nhập điểm đến!' }]} style={{ marginBottom: 0 }}>
              <AutoComplete
                options={cityOptions.map((city) => ({ value: city }))}
                filterOption={(inputValue, option) => option.value.toLowerCase().includes(inputValue.toLowerCase())}
                placeholder="Sapa"
                className="vxn-compact-input"
              />
            </Form.Item>
          </CompactField>

          <CompactField icon={CalendarOutlined} label="Ngày đi">
            <Form.Item name="date" rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]} style={{ marginBottom: 0 }}>
              <DatePicker
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                allowClear={false}
                suffixIcon={null}
                className="w-full"
              />
            </Form.Item>
          </CompactField>

          <CompactField icon={UserOutlined} label="Hành khách" last>
            <Form.Item name="passengers" rules={[{ required: true, message: 'Vui lòng chọn số khách!' }]} style={{ marginBottom: 0 }}>
              <Select options={passengerOptions} suffixIcon={null} />
            </Form.Item>
          </CompactField>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          icon={<SearchOutlined />}
          className="h-[74px] rounded-md border-0 bg-vxn-teal-700 px-8 text-base font-semibold hover:!bg-vxn-teal-800 xl:min-w-[132px]"
        >
          Tìm lại
        </Button>
      </div>
    </Form>
  </div>
);

const FilterGroup = ({ title, children }) => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center justify-between text-[13px] font-semibold text-vxn-ink">
      {title}
      <span className="text-xs text-vxn-fg-5">⌃</span>
    </div>
    {children}
  </div>
);

const ToggleRow = ({ label, count, active, onClick }) => (
  <button
    type="button"
    className={`flex w-full items-center gap-2 rounded-md border-0 bg-transparent py-1.5 text-left text-[13px] transition ${active ? 'font-medium text-vxn-ink' : 'text-vxn-fg-2 hover:text-vxn-teal-800'}`}
    onClick={onClick}
  >
    <span className={`grid h-4 w-4 place-items-center rounded border ${active ? 'border-vxn-teal-700 bg-vxn-teal-700 text-white' : 'border-vxn-border-strong bg-white text-transparent'}`}>
      <CheckOutlined className="text-[10px]" />
    </span>
    <span className="min-w-0 flex-1 truncate">{label}</span>
    {typeof count === 'number' && <span className="text-xs text-vxn-fg-5">{count}</span>}
  </button>
);

const FiltersSidebar = ({
  maxPrice,
  priceRange,
  onPriceChange,
  timeSlot,
  onTimeSlotChange,
  busTypes,
  selectedBusTypes,
  onToggleBusType,
  operators,
  selectedOperators,
  onToggleOperator,
  selectedAmenities,
  onToggleAmenity,
  onReset,
}) => (
  <aside className="border-r border-vxn-border bg-white px-5 py-6 lg:sticky lg:top-0 lg:max-h-screen lg:overflow-auto">
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2 text-base font-semibold text-vxn-ink">
        <FilterOutlined className="text-vxn-teal-700" />
        Bộ lọc
      </div>
      <button type="button" className="border-0 bg-transparent text-[13px] font-medium text-vxn-teal-800" onClick={onReset}>
        Xóa hết
      </button>
    </div>

    <div className="flex flex-col gap-6">
      <FilterGroup title="Khoảng giá">
        <Slider
          range
          min={0}
          max={maxPrice}
          step={10000}
          value={priceRange}
          onChange={onPriceChange}
          tooltip={{ formatter: formatCurrency }}
        />
        <div className="flex justify-between text-[13px] font-medium text-vxn-fg-2">
          <span>{formatCurrency(priceRange[0])}</span>
          <span>{formatCurrency(priceRange[1])}</span>
        </div>
      </FilterGroup>

      <FilterGroup title="Giờ khởi hành">
        <div className="grid grid-cols-2 gap-2">
          {timeSlots.map((slot) => (
            <button
              key={slot.key}
              type="button"
              className={`rounded-lg border px-3 py-2 text-left transition ${timeSlot === slot.key ? 'border-vxn-teal-700 bg-[#D4E3FF] text-vxn-teal-900' : 'border-vxn-border bg-white text-vxn-fg-2 hover:border-vxn-teal-300'}`}
              onClick={() => onTimeSlotChange(timeSlot === slot.key ? '' : slot.key)}
            >
              <span className="block text-[12px] font-medium">{slot.label}</span>
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Loại xe">
        <div>
          {busTypes.map((type) => (
            <ToggleRow
              key={type}
              label={type}
              active={selectedBusTypes.includes(type)}
              onClick={() => onToggleBusType(type)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Nhà xe">
        <div>
          {operators.slice(0, 8).map((operator) => (
            <ToggleRow
              key={operator.id}
              label={operator.name}
              count={operator.count}
              active={selectedOperators.includes(operator.id)}
              onClick={() => onToggleOperator(operator.id)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Tiện ích">
        <div className="flex flex-wrap gap-2">
          {amenityOptions.map((item) => {
            const Icon = item.icon;
            const active = selectedAmenities.includes(item.key);

            return (
              <button
                key={item.key}
                type="button"
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${active ? 'border-vxn-teal-700 bg-[#D4E3FF] text-vxn-teal-900' : 'border-vxn-border bg-white text-vxn-fg-2 hover:border-vxn-teal-300'}`}
                onClick={() => onToggleAmenity(item.key)}
              >
                <Icon className="text-[12px]" />
                {item.label}
              </button>
            );
          })}
        </div>
      </FilterGroup>
    </div>
  </aside>
);

const SortRow = ({ total, criteria, sortBy, onSortChange }) => (
  <div className="flex flex-col gap-3 rounded-xl border border-vxn-border bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
    <div className="text-sm font-medium text-vxn-ink">
      <strong className="text-vxn-teal-700">{total} chuyến</strong>{' '}
      {criteria.fromCity && criteria.toCity ? `${criteria.fromCity} → ${criteria.toCity}` : 'đang mở bán'}
      {criteria.date ? ` · ${dayjs(criteria.date).format('DD/MM/YYYY')}` : ''}
    </div>
    <div className="flex flex-wrap gap-1 rounded-lg bg-vxn-bg-soft p-1">
      {[
        ['time', 'Sớm nhất'],
        ['price', 'Giá thấp'],
        ['rating', 'Đánh giá'],
        ['seats', 'Còn nhiều chỗ'],
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          className={`rounded-md border-0 px-3 py-1.5 text-[13px] font-medium transition ${sortBy === value ? 'bg-white text-vxn-ink shadow-sm' : 'bg-transparent text-vxn-fg-3 hover:text-vxn-teal-800'}`}
          onClick={() => onSortChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
);

const AmenityList = ({ amenities }) => {
  const labels = {
    wifi: 'WiFi',
    ac: 'Máy lạnh',
    charger: 'Sạc',
    water: 'Nước',
    toilet: 'Toilet',
    blanket: 'Chăn ấm',
  };

  return (
    <div className="flex flex-wrap gap-3">
      {amenities.slice(0, 5).map((amenity) => (
        <span key={amenity} className="inline-flex items-center gap-1.5 text-xs text-vxn-fg-3">
          <SafetyCertificateOutlined className="text-vxn-teal-700" />
          {labels[amenity] || amenity}
        </span>
      ))}
    </div>
  );
};

const TripCard = ({ trip, expanded, onSelect, onOperatorClick }) => (
  <div className={`overflow-hidden rounded-[14px] border bg-white ${expanded ? 'border-vxn-teal-700 shadow-[0_8px_24px_-8px_rgba(0,100,129,.18)]' : 'border-vxn-border'}`}>
    <div className="grid lg:grid-cols-[180px_1fr_220px]">
      <button
        type="button"
        className="flex flex-col justify-center gap-2 border-0 border-b border-vxn-border bg-vxn-bg-soft p-5 text-left lg:border-b-0 lg:border-r"
        onClick={onOperatorClick}
      >
        <span className="grid h-14 w-14 place-items-center rounded-xl bg-vxn-teal-700 text-xl font-bold text-white">
          {getInitials(trip.operatorName)}
        </span>
        <span className="text-sm font-semibold text-vxn-ink">{trip.operatorName}</span>
        <span className="flex items-center gap-1.5 text-xs text-vxn-fg-3">
          <StarFilled className="text-vxn-saffron-600" />
          <strong className="text-vxn-ink">{Number(trip.operatorRating || 0).toFixed(1)}</strong>
          <span>({Number(trip.operatorReviews || 0).toLocaleString('vi-VN')})</span>
        </span>
        {trip.tag && <span className="mt-1 self-start rounded-full bg-[#FFE9C4] px-2.5 py-1 text-[10px] font-semibold text-vxn-saffron-700">{trip.tag}</span>}
      </button>

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-5">
          <div className="min-w-[76px] text-right">
            <div className="text-2xl font-bold text-vxn-ink">{trip.departLabel}</div>
            <div className="mt-0.5 text-xs text-vxn-fg-5">{trip.fromStation}</div>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs font-medium uppercase tracking-[0.04em] text-vxn-fg-4">{trip.duration}</span>
            <div className="relative h-0.5 w-full bg-vxn-bg-fog">
              <span className="absolute left-[-4px] top-[-3px] h-2 w-2 rounded-full bg-vxn-teal-700" />
              <span className="absolute right-[-4px] top-[-3px] h-2 w-2 rounded-full bg-vxn-teal-700" />
            </div>
            <span className="text-[11px] text-vxn-fg-5">{trip.busType}</span>
          </div>
          <div className="min-w-[76px]">
            <div className="text-2xl font-bold text-vxn-ink">{trip.arriveLabel}</div>
            <div className="mt-0.5 text-xs text-vxn-fg-5">{trip.toStation}</div>
          </div>
        </div>

        <div className="border-t border-dashed border-vxn-border pt-3">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-vxn-ink">
            <EnvironmentOutlined className="text-vxn-teal-700" />
            {trip.fromCity} <ArrowRightOutlined className="text-xs text-vxn-fg-5" /> {trip.toCity}
            <span className="text-xs font-normal text-vxn-fg-5">· {trip.dateLabel}</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <AmenityList amenities={trip.amenities} />
            <span className={`text-xs font-medium ${trip.availableSeats < 5 ? 'text-red-500' : 'text-vxn-fg-3'}`}>
              Còn <strong>{trip.availableSeats}/{trip.totalSeats}</strong> chỗ
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start justify-center gap-2 border-t border-vxn-border bg-vxn-bg-soft p-5 lg:items-end lg:border-l lg:border-t-0">
        {trip.discount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-vxn-fg-5 line-through">{formatCurrency(trip.basePrice)}</span>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">-{trip.discount}%</span>
          </div>
        )}
        <div className="text-[26px] font-bold tracking-[-0.01em] text-vxn-saffron-700">{formatCurrency(trip.finalPrice)}</div>
        <div className="text-[11px] text-vxn-fg-5">/ vé · đã gồm thuế</div>
        <Button
          type="primary"
          className="mt-1 h-10 w-full rounded-md border-0 bg-vxn-teal-700 font-semibold hover:!bg-vxn-teal-800"
          onClick={onSelect}
        >
          Chọn chuyến <ArrowRightOutlined className="text-xs" />
        </Button>
        <button type="button" className="border-0 bg-transparent text-xs font-medium text-vxn-teal-800" onClick={onSelect}>
          Xem chi tiết & sơ đồ ghế ↓
        </button>
      </div>
    </div>

    {expanded && (
      <div className="grid gap-5 border-t border-vxn-border bg-vxn-bg-soft px-5 py-4 lg:grid-cols-3">
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-[0.05em] text-vxn-fg-5">Lịch trình</div>
          <div className="space-y-1.5 text-[13px] text-vxn-fg-2">
            <div><strong className="text-vxn-ink">{trip.departLabel}</strong> · {trip.fromStation}</div>
            <div><strong className="text-vxn-ink">{trip.arriveLabel}</strong> · {trip.toStation}</div>
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-[0.05em] text-vxn-fg-5">Tiện ích đầy đủ</div>
          <div className="flex flex-wrap gap-2">
            {trip.amenities.map((amenity) => (
              <span key={amenity} className="rounded-full bg-white px-2.5 py-1 text-xs text-vxn-fg-2">{amenity}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-[0.05em] text-vxn-fg-5">Chính sách</div>
          <div className="text-[13px] leading-6 text-vxn-fg-2">Hoàn 90% trước 24h · Đổi chuyến miễn phí trước 24h · Trẻ em dưới 1m miễn vé</div>
        </div>
      </div>
    )}
  </div>
);

const TripsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchCriteria, setSelectedTrip, setSearchCriteria } = useBookingStore();
  const [form] = Form.useForm();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [sortBy, setSortBy] = useState('time');
  const [timeSlot, setTimeSlot] = useState('');
  const [selectedBusTypes, setSelectedBusTypes] = useState([]);
  const [selectedOperators, setSelectedOperators] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const operatorIdFromUrl = params.get('operatorId');

  const initialValues = useMemo(() => ({
    fromCity: searchCriteria.fromCity || 'Hà Nội',
    toCity: searchCriteria.toCity || 'Sapa',
    date: searchCriteria.date ? dayjs(searchCriteria.date) : dayjs(),
    passengers: searchCriteria.passengers || 2,
  }), [searchCriteria]);

  const fetchTrips = async (criteria = {}) => {
    try {
      setLoading(true);
      const response = await searchTrips(criteria);
      const nextTrips = response.status === 'success' ? (response.data?.trips || []).map(normalizeTrip) : [];

      setTrips(nextTrips);

      if (nextTrips.length > 0) {
        const nextMaxPrice = Math.ceil(Math.max(...nextTrips.map((trip) => trip.finalPrice), 1000000) / 10000) * 10000;
        setMaxPrice(nextMaxPrice);
        setPriceRange([0, nextMaxPrice]);
      }
    } catch (error) {
      setTrips([]);
      toast.error(typeof error === 'string' ? error : 'Có lỗi xảy ra khi tải chuyến xe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const criteria = operatorIdFromUrl
      ? { passengers: searchCriteria.passengers || 1, operatorId: operatorIdFromUrl }
      : searchCriteria.fromCity && searchCriteria.toCity && searchCriteria.date
        ? searchCriteria
        : { passengers: 1 };

    form.setFieldsValue(initialValues);
    fetchTrips(criteria);
  }, [location.pathname, location.search]);

  const busTypes = useMemo(() => Array.from(new Set(trips.map((trip) => trip.busType).filter(Boolean))), [trips]);

  const operators = useMemo(() => {
    const map = new Map();

    trips.forEach((trip) => {
      if (!trip.operatorId) return;
      const current = map.get(trip.operatorId) || { id: trip.operatorId, name: trip.operatorName, count: 0 };
      current.count += 1;
      map.set(trip.operatorId, current);
    });

    return Array.from(map.values());
  }, [trips]);

  const filteredTrips = useMemo(() => {
    const selectedSlot = timeSlots.find((slot) => slot.key === timeSlot);

    return trips
      .filter((trip) => trip.finalPrice >= priceRange[0] && trip.finalPrice <= priceRange[1])
      .filter((trip) => !selectedSlot || (dayjs(trip.departureTime).hour() >= selectedSlot.start && dayjs(trip.departureTime).hour() < selectedSlot.end))
      .filter((trip) => selectedBusTypes.length === 0 || selectedBusTypes.includes(trip.busType))
      .filter((trip) => selectedOperators.length === 0 || selectedOperators.includes(trip.operatorId))
      .filter((trip) => selectedAmenities.length === 0 || selectedAmenities.every((amenity) => trip.amenities.includes(amenity)))
      .sort((a, b) => {
        if (sortBy === 'price') return a.finalPrice - b.finalPrice;
        if (sortBy === 'rating') return b.operatorRating - a.operatorRating;
        if (sortBy === 'seats') return b.availableSeats - a.availableSeats;
        return new Date(a.departureTime) - new Date(b.departureTime);
      });
  }, [trips, priceRange, timeSlot, selectedBusTypes, selectedOperators, selectedAmenities, sortBy]);

  const handleSearch = async (values) => {
    try {
      setSearchLoading(true);
      const nextCriteria = {
        fromCity: values.fromCity,
        toCity: values.toCity,
        date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : null,
        passengers: values.passengers || 1,
      };

      setSearchCriteria(nextCriteria);
      setTimeSlot('');
      setSelectedBusTypes([]);
      setSelectedOperators([]);
      setSelectedAmenities([]);
      setSortBy('time');
      await fetchTrips(nextCriteria);

      if (location.pathname !== '/search-results') {
        navigate('/search-results');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tìm kiếm');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSwapCities = () => {
    const values = form.getFieldsValue();
    form.setFieldsValue({ fromCity: values.toCity, toCity: values.fromCity });
  };

  const toggleValue = (setter, value) => {
    setter((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  };

  const resetFilters = () => {
    setPriceRange([0, maxPrice]);
    setTimeSlot('');
    setSelectedBusTypes([]);
    setSelectedOperators([]);
    setSelectedAmenities([]);
  };

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip.raw);
    navigate(`/trips/${trip.id}`);
  };

  return (
    <CustomerShell activeKey="buy" mainClassName="bg-vxn-bg-soft">
      <SearchSummaryBar
        form={form}
        initialValues={initialValues}
        loading={searchLoading}
        onSearch={handleSearch}
        onSwap={handleSwapCities}
      />

      <div className="grid lg:grid-cols-[280px_1fr]">
        <FiltersSidebar
          maxPrice={maxPrice}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          timeSlot={timeSlot}
          onTimeSlotChange={setTimeSlot}
          busTypes={busTypes}
          selectedBusTypes={selectedBusTypes}
          onToggleBusType={(value) => toggleValue(setSelectedBusTypes, value)}
          operators={operators}
          selectedOperators={selectedOperators}
          onToggleOperator={(value) => toggleValue(setSelectedOperators, value)}
          selectedAmenities={selectedAmenities}
          onToggleAmenity={(value) => toggleValue(setSelectedAmenities, value)}
          onReset={resetFilters}
        />

        <section className="min-w-0 px-4 py-6 lg:px-8">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-4">
            <SortRow total={filteredTrips.length} criteria={searchCriteria} sortBy={sortBy} onSortChange={setSortBy} />

            {loading ? (
              <div className="grid min-h-[360px] place-items-center rounded-xl border border-vxn-border bg-white">
                <Spin size="large" />
              </div>
            ) : filteredTrips.length === 0 ? (
              <div className="rounded-xl border border-vxn-border bg-white py-16">
                <Empty description="Không tìm thấy chuyến phù hợp" />
              </div>
            ) : (
              filteredTrips.map((trip, index) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  expanded={index === 0}
                  onSelect={() => handleTripSelect(trip)}
                  onOperatorClick={() => trip.operatorId && navigate(`/operators/${trip.operatorId}`)}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </CustomerShell>
  );
};

export default TripsPage;
