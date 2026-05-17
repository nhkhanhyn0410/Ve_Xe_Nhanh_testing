import { EnvironmentOutlined, NodeIndexOutlined } from '@ant-design/icons';
import { useMemo } from 'react';

const googleMapsEmbedKey = import.meta.env.VITE_GOOGLE_MAPS_EMBED_API_KEY;

const pointStyles = {
  start: {
    label: 'Đ',
    className: 'bg-vxn-teal-800 text-white',
    stroke: '#00506A',
  },
  stop: {
    label: null,
    className: 'bg-vxn-saffron-500 text-white',
    stroke: '#E89B26',
  },
  end: {
    label: 'T',
    className: 'bg-vxn-ink text-white',
    stroke: '#1E293B',
  },
};

const asFiniteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const normalizeCoordinates = (coordinates) => {
  const lat = asFiniteNumber(coordinates?.lat);
  const lng = asFiniteNumber(coordinates?.lng);

  if (lat === null || lng === null) return null;
  return { lat, lng };
};

const getPointQuery = (point) => {
  const coordinates = normalizeCoordinates(point?.coordinates);
  if (coordinates) return `${coordinates.lat},${coordinates.lng}`;

  return [point?.address, point?.label, point?.city].filter(Boolean).join(', ');
};

const normalizePoints = (points = []) =>
  points
    .map((point, index) => ({
      ...point,
      key: point?.key || `${point?.type || 'point'}-${point?.label || point?.address || index}`,
      type: point?.type || 'stop',
      label: point?.label || point?.name || point?.address || `Điểm ${index + 1}`,
      query: getPointQuery(point),
      coordinates: normalizeCoordinates(point?.coordinates),
    }))
    .filter((point) => point.query || point.coordinates);

const buildGoogleMapsDirectionsUrl = (points = []) => {
  const normalized = normalizePoints(points);
  if (normalized.length === 0) return null;

  if (normalized.length === 1) {
    const params = new URLSearchParams({
      api: '1',
      query: normalized[0].query,
    });
    return `https://www.google.com/maps/search/?${params.toString()}`;
  }

  const origin = normalized[0];
  const destination = normalized[normalized.length - 1];
  const waypoints = normalized.slice(1, -1).slice(0, 20);
  const params = new URLSearchParams({
    api: '1',
    origin: origin.query,
    destination: destination.query,
    travelmode: 'driving',
  });

  if (waypoints.length > 0) {
    params.set('waypoints', waypoints.map((point) => point.query).join('|'));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

const buildGoogleMapsEmbedUrl = (points = []) => {
  if (!googleMapsEmbedKey) return null;

  const normalized = normalizePoints(points);
  if (normalized.length < 2) return null;

  const origin = normalized[0];
  const destination = normalized[normalized.length - 1];
  const waypoints = normalized.slice(1, -1).slice(0, 20);
  const params = new URLSearchParams({
    key: googleMapsEmbedKey,
    origin: origin.query,
    destination: destination.query,
    mode: 'driving',
  });

  if (waypoints.length > 0) {
    params.set('waypoints', waypoints.map((point) => point.query).join('|'));
  }

  return `https://www.google.com/maps/embed/v1/directions?${params.toString()}`;
};

const projectPoints = (points) => {
  const coordinatePoints = points.filter((point) => point.coordinates);
  const canUseGeo = coordinatePoints.length === points.length && points.length > 1;

  if (!canUseGeo) {
    const step = points.length > 1 ? 240 / (points.length - 1) : 0;
    return points.map((point, index) => ({
      ...point,
      x: 40 + step * index,
      y: index % 2 === 0 ? 108 : 72,
    }));
  }

  const lats = points.map((point) => point.coordinates.lat);
  const lngs = points.map((point) => point.coordinates.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 0.01;
  const lngRange = maxLng - minLng || 0.01;

  return points.map((point) => ({
    ...point,
    x: 36 + ((point.coordinates.lng - minLng) / lngRange) * 248,
    y: 28 + ((maxLat - point.coordinates.lat) / latRange) * 124,
  }));
};

const RouteSketch = ({ points }) => {
  const projectedPoints = projectPoints(points);
  const polylinePoints = projectedPoints.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div className="relative h-full overflow-hidden bg-[#ECF6F7]">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 320 180"
        role="img"
        aria-label="Sơ đồ lộ trình"
        preserveAspectRatio="none"
      >
        <path d="M0 42H320M0 92H320M0 142H320" stroke="#D4E5EA" strokeWidth="1" />
        <path d="M55 0V180M132 0V180M210 0V180M286 0V180" stroke="#DDE9EE" strokeWidth="1" />
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="#00506A"
          strokeDasharray="8 7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5"
        />
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="#E89B26"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        {projectedPoints.map((point, index) => {
          const style = pointStyles[point.type] || pointStyles.stop;
          const markerLabel = style.label || String(index);

          return (
            <g key={point.key}>
              <circle cx={point.x} cy={point.y} r="11" fill="#FFFFFF" stroke={style.stroke} strokeWidth="3" />
              <circle cx={point.x} cy={point.y} r="5" fill={style.stroke} />
              <text
                x={point.x}
                y={point.y - 17}
                fill="#1E293B"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
              >
                {markerLabel}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl bg-white/90 px-3 py-2 text-[11px] font-medium text-vxn-fg-3 shadow-sm backdrop-blur">
        Hiển thị theo dữ liệu tọa độ tuyến. Bấm mở Google Maps để xem chỉ đường chi tiết.
      </div>
    </div>
  );
};

const RouteMiniMap = ({
  points = [],
  title = 'Bản đồ lộ trình',
  subtitle,
  className = '',
  heightClassName = 'h-56',
}) => {
  const normalizedPoints = useMemo(() => normalizePoints(points), [points]);
  const directionsUrl = useMemo(() => buildGoogleMapsDirectionsUrl(points), [points]);
  const embedUrl = useMemo(() => buildGoogleMapsEmbedUrl(points), [points]);

  if (normalizedPoints.length === 0) return null;

  return (
    <div className={`overflow-hidden rounded-2xl border border-vxn-border bg-white ${className}`}>
      <div className="flex items-start justify-between gap-3 border-b border-vxn-border bg-white px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-vxn-ink">
            <NodeIndexOutlined className="text-vxn-teal-700" />
            <span>{title}</span>
          </div>
          {subtitle && <div className="mt-1 text-xs leading-5 text-vxn-fg-4">{subtitle}</div>}
        </div>
        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-vxn-border bg-white px-2.5 text-xs font-semibold text-vxn-teal-800 transition hover:border-vxn-teal-700 hover:text-vxn-teal-900"
          >
            <EnvironmentOutlined /> Mở map
          </a>
        )}
      </div>

      <div className={`relative ${heightClassName}`}>
        {embedUrl ? (
          <iframe
            title={title}
            src={embedUrl}
            width="100%"
            height="100%"
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <RouteSketch points={normalizedPoints} />
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-vxn-border bg-vxn-bg-soft px-4 py-3">
        {normalizedPoints.slice(0, 4).map((point, index) => {
          const style = pointStyles[point.type] || pointStyles.stop;
          const label = style.label || String(index);

          return (
            <span
              key={point.key}
              className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-vxn-fg-3"
            >
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] ${style.className}`}>
                {label}
              </span>
              <span className="max-w-[150px] truncate">{point.label}</span>
            </span>
          );
        })}
        {normalizedPoints.length > 4 && (
          <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-vxn-fg-4">
            +{normalizedPoints.length - 4} điểm
          </span>
        )}
      </div>
    </div>
  );
};

export default RouteMiniMap;
