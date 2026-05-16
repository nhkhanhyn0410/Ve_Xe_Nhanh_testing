import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { stopsApi } from '../../services/operatorApi';
import {
  PageHeader,
  Btn,
  Select,
  SearchInput,
  StatPill,
  Chip,
  RowIconBtn,
  PageBtn,
  VxnIcon,
} from '../../components/operator/vxn';

const PAGE_SIZE = 10;

const TYPE_LABEL = {
  bus_station: { label: 'Bến xe', icon: 'building-2', color: '#1D4ED8' },
  office: { label: 'Văn phòng', icon: 'briefcase', color: '#15803D' },
  rest_stop: { label: 'Trạm dừng', icon: 'coffee', color: '#B45309' },
  pickup: { label: 'Điểm đón', icon: 'map-pin', color: '#7C3AED' },
};

const StopsPage = () => {
  const navigate = useNavigate();

  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState('');
  const [typeF, setTypeF] = useState('all');
  const [statusF, setStatusF] = useState('all');
  const [sort, setSort] = useState('code');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadStops();
  }, []);

  const loadStops = async () => {
    setLoading(true);
    try {
      const response = await stopsApi.getStops();
      setStops(response?.data?.stops || []);
    } catch (error) {
      message.error(typeof error === 'string' ? error : 'Không thể tải danh sách điểm dừng');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(
    () =>
      stops
        .filter(
          (s) =>
            !q ||
            [s.code, s.name, s.address, s.city]
              .join(' ')
              .toLowerCase()
              .includes(q.toLowerCase())
        )
        .filter((s) => typeF === 'all' || s.type === typeF)
        .filter((s) => statusF === 'all' || s.status === statusF)
        .sort((a, b) => {
          if (sort === 'code') return a.code.localeCompare(b.code);
          if (sort === 'name') return a.name.localeCompare(b.name, 'vi');
          if (sort === 'trips') return b.dailyTrips - a.dailyTrips;
          if (sort === 'routes') return b.routes - a.routes;
          return 0;
        }),
    [stops, q, typeF, statusF, sort]
  );

  useEffect(() => {
    setPage(1);
  }, [q, typeF, statusF, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = useMemo(() => {
    const total = stops.length;
    const busStations = stops.filter((s) => s.type === 'bus_station').length;
    const pickups = stops.filter((s) => s.type === 'pickup').length;
    const inactive = stops.filter((s) => s.status === 'inactive').length;
    return { total, busStations, pickups, inactive };
  }, [stops]);

  const pageNumbers = useMemo(() => {
    const out = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i += 1) out.push(i);
    return out;
  }, [currentPage, totalPages]);

  return (
    <>
      <PageHeader
        title="Quản lý điểm dừng"
        description="Bến xe, trạm dừng nghỉ và điểm đón trả khách tổng hợp từ toàn bộ tuyến của nhà xe."
        cta={
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn kind="ghost" icon="route" onClick={() => navigate('/operator/routes')}>
              Quản lý trong tuyến
            </Btn>
          </div>
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatPill
          label="Tổng điểm dừng"
          value={loading ? '—' : String(stats.total)}
          hint={`${stats.busStations} bến xe chính`}
        />
        <StatPill
          label="Bến xe chính"
          value={loading ? '—' : String(stats.busStations)}
          hint="Đầu / cuối các tuyến"
          tone="teal"
        />
        <StatPill
          label="Điểm đón / trả"
          value={loading ? '—' : String(stats.pickups)}
          hint="Đón trả khách dọc đường"
        />
        <StatPill
          label="Ngừng hoạt động"
          value={loading ? '—' : String(stats.inactive)}
          hint="Không thuộc tuyến đang chạy"
          tone="warn"
        />
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid var(--vxn-border)',
          borderRadius: 12,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderBottom: 0,
        }}
      >
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Tìm mã, tên, địa chỉ điểm dừng…"
        />
        <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
          <Select
            value={typeF}
            onChange={setTypeF}
            options={[
              { value: 'all', label: 'Tất cả loại điểm' },
              { value: 'bus_station', label: 'Bến xe' },
              { value: 'office', label: 'Văn phòng' },
              { value: 'rest_stop', label: 'Trạm dừng' },
              { value: 'pickup', label: 'Điểm đón' },
            ]}
          />
          <Select
            value={statusF}
            onChange={setStatusF}
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'active', label: 'Hoạt động' },
              { value: 'maintenance', label: 'Bảo trì' },
              { value: 'inactive', label: 'Ngừng hoạt động' },
            ]}
          />
          <Select
            value={sort}
            onChange={setSort}
            options={[
              { value: 'code', label: 'Sắp xếp: Mã' },
              { value: 'name', label: 'Sắp xếp: Tên A–Z' },
              { value: 'trips', label: 'Sắp xếp: Lượt/ngày ↓' },
              { value: 'routes', label: 'Sắp xếp: Số tuyến ↓' },
            ]}
          />
        </div>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid var(--vxn-border)',
          borderRadius: 12,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {[
                'Mã',
                'Tên & địa chỉ',
                'Loại điểm',
                'Thành phố',
                'Tuyến',
                'Lượt/ngày',
                'Trạng thái',
                '',
              ].map((c, i) => (
                <th
                  key={i}
                  style={{
                    background: '#F4F6FB',
                    textAlign: 'left',
                    padding: '12px 16px',
                    font: '500 11px var(--font-display)',
                    letterSpacing: '.05em',
                    textTransform: 'uppercase',
                    color: 'var(--vxn-fg-5)',
                    borderBottom: '1px solid var(--vxn-border)',
                  }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: '40px 16px',
                    textAlign: 'center',
                    font: '400 14px var(--font-display)',
                    color: 'var(--vxn-fg-5)',
                  }}
                >
                  Đang tải danh sách điểm dừng…
                </td>
              </tr>
            )}

            {!loading && pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: '40px 16px',
                    textAlign: 'center',
                    font: '400 14px var(--font-display)',
                    color: 'var(--vxn-fg-5)',
                  }}
                >
                  Chưa có điểm dừng nào. Hãy thêm điểm đón/trả khi tạo tuyến đường.
                </td>
              </tr>
            )}

            {!loading &&
              pageRows.map((s, i) => {
                const t = TYPE_LABEL[s.type] || TYPE_LABEL.pickup;
                return (
                  <tr
                    key={s.code}
                    style={{
                      borderBottom:
                        i < pageRows.length - 1 ? '1px solid var(--vxn-border)' : 0,
                    }}
                  >
                    <td
                      style={{
                        padding: '14px 16px',
                        font: '500 13px var(--font-mono)',
                        color: 'var(--vxn-teal-800)',
                      }}
                    >
                      {s.code}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            flexShrink: 0,
                            background: `${t.color}1A`,
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          <VxnIcon name={t.icon} size={18} color={t.color} />
                        </div>
                        <div>
                          <div
                            style={{
                              font: '600 14px var(--font-display)',
                              color: 'var(--vxn-ink)',
                            }}
                          >
                            {s.name}
                          </div>
                          <div
                            style={{
                              font: '400 12px var(--font-display)',
                              color: 'var(--vxn-fg-5)',
                              marginTop: 2,
                            }}
                          >
                            {s.address || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 10px',
                          borderRadius: 999,
                          background: `${t.color}14`,
                          color: t.color,
                          font: '500 12px var(--font-display)',
                        }}
                      >
                        {t.label}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '14px 16px',
                        font: '400 13.5px var(--font-display)',
                        color: 'var(--vxn-fg-2)',
                      }}
                    >
                      {s.city || '—'}
                    </td>
                    <td
                      style={{
                        padding: '14px 16px',
                        font: '500 13.5px var(--font-display)',
                        color: 'var(--vxn-ink)',
                      }}
                    >
                      {s.routes}
                    </td>
                    <td
                      style={{
                        padding: '14px 16px',
                        font: '500 13.5px var(--font-display)',
                        color: 'var(--vxn-ink)',
                      }}
                    >
                      {s.dailyTrips}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {s.status === 'active' && (
                        <Chip tone="success" dot>
                          Hoạt động
                        </Chip>
                      )}
                      {s.status === 'maintenance' && (
                        <Chip tone="warn" dot>
                          Bảo trì
                        </Chip>
                      )}
                      {s.status === 'inactive' && (
                        <Chip tone="neutral" dot>
                          Ngừng
                        </Chip>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: 4,
                          justifyContent: 'flex-end',
                        }}
                      >
                        <RowIconBtn
                          icon="pencil"
                          title="Sửa trong tuyến đường"
                          onClick={() => navigate('/operator/routes')}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            borderTop: '1px solid var(--vxn-border)',
            background: '#FBFCFE',
          }}
        >
          <span
            style={{
              font: '400 13px var(--font-display)',
              color: 'var(--vxn-fg-5)',
            }}
          >
            Hiển thị {filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} / {filtered.length} điểm
            dừng
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <PageBtn
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </PageBtn>
            {pageNumbers.map((n) => (
              <PageBtn key={n} active={n === currentPage} onClick={() => setPage(n)}>
                {n}
              </PageBtn>
            ))}
            <PageBtn
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </PageBtn>
          </div>
        </div>
      </div>
    </>
  );
};

export default StopsPage;
