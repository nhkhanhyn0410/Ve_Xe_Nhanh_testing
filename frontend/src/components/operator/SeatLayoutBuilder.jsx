import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button, InputNumber, message, Radio, Space, Tag } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import { seatLayoutApi } from '../../services/operatorApi';

const SeatLayoutBuilder = ({ busType, initialLayout, onSave }) => {
  const [customLayout, setCustomLayout] = useState(null);
  const [rows, setRows] = useState(10);
  const [columns, setColumns] = useState(4);
  const [floors, setFloors] = useState(1);
  const [buildingLayout, setBuildingLayout] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTool, setSelectedTool] = useState('aisle'); // 'seat', 'aisle', 'empty'

  // Calculate total seats from layout - MUST be defined before useEffect
  const calculateTotalSeats = useCallback((layout) => {
    if (!layout || !Array.isArray(layout)) return 0;

    let count = 0;
    layout.forEach(row => {
      if (Array.isArray(row)) {
        row.forEach(seat => {
          // Count only actual seats (not empty, not aisle, not driver, not floor marker)
          if (seat &&
              seat !== '' &&
              seat !== 'DRIVER' &&
              seat !== 'FLOOR_2' &&
              seat !== '🚗' &&
              seat.toUpperCase() !== 'AISLE' &&
              !seat.toLowerCase().includes('aisle')) {
            count++;
          }
        });
      }
    });
    return count;
  }, []);

  // Reset states when busType changes
  useEffect(() => {
    if (busType) {
      // Reset custom layout states when busType changes
      setCustomLayout(null);
      setRows(10);
      setColumns(4);
      setFloors(1);
    }
  }, [busType]);

  useEffect(() => {
    // Set initial layout if provided
    if (initialLayout) {
      // Recalculate totalSeats from layout to ensure accuracy
      const correctTotalSeats = calculateTotalSeats(initialLayout.layout);

      setCustomLayout({
        ...initialLayout,
        totalSeats: correctTotalSeats, // Use recalculated value
      });

      // Calculate actual rows per floor based on total rows and floors
      // For 1 floor: total rows = actual rows + 1 (driver row)
      // For 2 floors: total rows = rowsPerFloor * 2 + 2 (driver + floor separator)
      let actualRows = 10;
      if (initialLayout.floors === 1) {
        // Single floor: subtract driver row
        actualRows = (initialLayout.rows || 11) - 1;
      } else if (initialLayout.floors === 2) {
        // Double floor: (total - 2) / 2
        actualRows = Math.floor(((initialLayout.rows || 14) - 2) / 2);
      }

      setRows(actualRows);
      setColumns(initialLayout.columns || 4);
      setFloors(initialLayout.floors || 1);
    }
  }, [initialLayout, calculateTotalSeats]);

  const handleBuildCustom = async () => {
    if (!busType) {
      message.warning('Vui lòng chọn loại xe trước');
      return;
    }

    if (!rows || rows < 1 || rows > 20) {
      message.warning('Số hàng phải từ 1 đến 20');
      return;
    }

    if (!columns || columns < 2 || columns > 6) {
      message.warning('Số cột phải từ 2 đến 6');
      return;
    }

    if (!floors || floors < 1 || floors > 2) {
      message.warning('Số tầng phải là 1 hoặc 2');
      return;
    }

    setBuildingLayout(true);
    try {
      const response = await seatLayoutApi.buildLayout({
        busType,
        rows,
        columns,
        floors,
      });
      console.log('Build custom layout response:', response);

      if (response.status === 'success' && response.data?.seatLayout) {
        const receivedLayout = response.data.seatLayout;
        // Recalculate totalSeats from layout to ensure accuracy
        const correctTotalSeats = calculateTotalSeats(receivedLayout.layout);

        setCustomLayout({
          ...receivedLayout,
          totalSeats: correctTotalSeats, // Use recalculated value
        });
        message.success('Đã tạo sơ đồ tùy chỉnh');
      } else {
        message.error('Không thể tạo sơ đồ');
      }
    } catch (error) {
      console.error('Build custom layout error:', error);
      message.error(error?.response?.data?.message || error?.message || 'Không thể tạo sơ đồ');
    } finally {
      setBuildingLayout(false);
    }
  };

  const handleSave = useCallback(() => {
    if (customLayout) {
      onSave(customLayout);
    } else {
      message.warning('Vui lòng tạo sơ đồ ghế trước');
    }
  }, [customLayout, onSave]);

  const handleCancel = useCallback(() => {
    // Reset all states when cancelling
    setCustomLayout(null);
    setRows(10);
    setColumns(4);
    setFloors(1);
    setEditMode(false);
    onSave(null);
  }, [onSave]);

  // Handle seat click in edit mode
  const handleSeatClick = useCallback((rowIndex, seatIndex) => {
    if (!editMode || !customLayout) return;

    const newLayout = JSON.parse(JSON.stringify(customLayout.layout)); // Deep copy
    const currentSeat = newLayout[rowIndex][seatIndex];

    // Don't allow editing driver seat or floor markers
    if (currentSeat === 'DRIVER' || currentSeat === '🚗' || currentSeat === 'FLOOR_2') {
      message.warning('Không thể chỉnh sửa vị trí ghế lái hoặc dấu phân tầng');
      return;
    }

    // Apply the selected tool
    let newValue;
    switch (selectedTool) {
      case 'aisle':
        newValue = 'AISLE';
        break;
      case 'empty':
        newValue = '';
        break;
      case 'seat':
        // Generate seat number
        newValue = `${String.fromCharCode(65 + rowIndex)}${seatIndex + 1}`;
        break;
      default:
        newValue = currentSeat;
    }

    newLayout[rowIndex][seatIndex] = newValue;

    // Recalculate total seats
    const totalSeats = calculateTotalSeats(newLayout);

    setCustomLayout({
      ...customLayout,
      layout: newLayout,
      totalSeats: totalSeats,
    });

    message.success(`Đã thay đổi thành ${selectedTool === 'aisle' ? 'lối đi' : selectedTool === 'empty' ? 'ô trống' : 'ghế'}`);
  }, [editMode, customLayout, selectedTool, calculateTotalSeats]);

  const getSeatClass = (seat, isClickable = false) => {
    const baseClass = isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';
    if (!seat || seat === '') return `bg-transparent ${baseClass}`;
    if (seat === 'DRIVER' || seat === '🚗') return `bg-blue-500 text-white border-blue-600 ${isClickable ? 'cursor-not-allowed' : ''}`;
    if (seat === 'FLOOR_2') return `bg-amber-500 text-white border-amber-600 ${isClickable ? 'cursor-not-allowed' : ''}`;
    if (seat.toLowerCase().includes('aisle')) return `bg-gray-300 ${baseClass}`;
    return `bg-green-500 text-white border-green-600 ${baseClass}`;
  };

  const renderSeatGrid = (layout) => {
    if (!layout || !layout.layout || !Array.isArray(layout.layout)) return null;

    const seatLayout = layout.layout;
    if (seatLayout.length === 0) return null;

    return (
      <div className="p-4 bg-gray-100 rounded overflow-auto max-h-96">
        {editMode && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm font-semibold text-blue-800 mb-2">🖱️ Chế độ chỉnh sửa</p>
            <p className="text-xs text-blue-600 mb-3">Click vào ô để thay đổi. Chọn công cụ bên dưới:</p>
            <Space>
              <Button
                type={selectedTool === 'seat' ? 'primary' : 'default'}
                size="small"
                onClick={() => setSelectedTool('seat')}
              >
                🪑 Ghế
              </Button>
              <Button
                type={selectedTool === 'aisle' ? 'primary' : 'default'}
                size="small"
                onClick={() => setSelectedTool('aisle')}
              >
                🚶 Lối đi
              </Button>
              <Button
                type={selectedTool === 'empty' ? 'primary' : 'default'}
                size="small"
                onClick={() => setSelectedTool('empty')}
              >
                ⬜ Trống
              </Button>
            </Space>
          </div>
        )}

        <div className="inline-block">
          {seatLayout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 mb-1">
              {Array.isArray(row) &&
                row.map((seat, seatIndex) => {
                  const seatClass = getSeatClass(seat, editMode);
                  const displayText = seat === 'DRIVER' ? '🚗' :
                                     seat === 'FLOOR_2' ? 'T2' :
                                     (seat && !seat.toLowerCase().includes('aisle') ? seat : '');

                  return (
                    <div
                      key={seatIndex}
                      className={`w-10 h-10 flex items-center justify-center text-xs font-medium rounded border-2 ${seatClass}`}
                      title={seat === 'DRIVER' ? 'Ghế lái' : seat === 'FLOOR_2' ? 'Tầng 2' : seat}
                      onClick={() => editMode && handleSeatClick(rowIndex, seatIndex)}
                    >
                      {displayText}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-600 space-y-1">
          <p className="font-semibold">Tổng số ghế: {layout.totalSeats}</p>
          <p>
            Kích thước: {layout.rows} hàng tổng × {layout.columns} cột
            {layout.floors > 1 && ` (${Math.floor((layout.rows - 2) / 2)} hàng/tầng)`}
          </p>
          {layout.floors > 1 && <p>Số tầng: {layout.floors}</p>}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-300 space-y-2">
          <p className="text-xs font-semibold text-gray-700">Chú thích:</p>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-green-500 border-2 border-green-600 rounded"></div>
              <span>Ghế thường</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-blue-500 border-2 border-blue-600 rounded flex items-center justify-center text-white">🚗</div>
              <span>Ghế lái</span>
            </div>
            {layout.floors > 1 && (
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-amber-500 border-2 border-amber-600 rounded flex items-center justify-center text-white text-[9px]">T2</div>
                <span>Tầng 2</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
              <span>Lối đi</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const hasValidLayout = useMemo(() => {
    return customLayout !== null && customLayout !== undefined;
  }, [customLayout]);

  // Determine if floors input should be shown based on bus type
  const canHaveMultipleFloors = useMemo(() => {
    return busType === 'sleeper' || busType === 'double_decker';
  }, [busType]);

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Tạo Sơ Đồ Ghế Tùy Chỉnh</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">
                {floors === 2 ? 'Số Hàng (mỗi tầng)' : 'Số Hàng'}:{' '}
                <span className="text-gray-500">(1-20)</span>
              </label>
              <InputNumber
                min={1}
                max={20}
                value={rows}
                onChange={setRows}
                className="w-full"
                disabled={!busType || buildingLayout}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">
                Số Cột: <span className="text-gray-500">(2-6)</span>
              </label>
              <InputNumber
                min={2}
                max={6}
                value={columns}
                onChange={setColumns}
                className="w-full"
                disabled={!busType || buildingLayout}
              />
            </div>
          </div>

          {/* Floors input - only show for sleeper and double_decker */}
          {canHaveMultipleFloors && (
            <div>
              <label className="block mb-2 text-sm font-medium">Số Tầng:</label>
              <Radio.Group
                value={floors}
                onChange={(e) => setFloors(e.target.value)}
                disabled={!busType || buildingLayout}
              >
                <Radio value={1}>1 Tầng</Radio>
                <Radio value={2}>2 Tầng</Radio>
              </Radio.Group>
              <div className="text-xs text-gray-500 mt-1">
                {floors === 2 && 'Xe 2 tầng sẽ có thêm dấu phân cách giữa các tầng'}
              </div>
            </div>
          )}

          <Button
            type="primary"
            onClick={handleBuildCustom}
            disabled={!busType || buildingLayout}
            loading={buildingLayout}
            block
            size="large"
          >
            {buildingLayout ? 'Đang tạo sơ đồ...' : 'Tạo Sơ Đồ'}
          </Button>

          {!busType && (
            <div className="text-amber-600 text-sm p-3 bg-amber-50 rounded">
              Vui lòng chọn loại xe trước khi tạo sơ đồ
            </div>
          )}

          {customLayout && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-base font-semibold">Xem trước sơ đồ ghế</h4>
                <Button
                  type={editMode ? 'primary' : 'default'}
                  icon={editMode ? <SaveOutlined /> : <EditOutlined />}
                  onClick={() => {
                    if (editMode) {
                      message.success('Đã lưu chỉnh sửa');
                    }
                    setEditMode(!editMode);
                  }}
                  size="small"
                >
                  {editMode ? 'Xong' : 'Chỉnh sửa sơ đồ'}
                </Button>
              </div>
              {renderSeatGrid(customLayout)}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-600">
          {hasValidLayout ? (
            <span className="text-green-600 font-medium">
              ✓ Sơ đồ đã sẵn sàng ({customLayout.totalSeats} ghế
              {customLayout.floors > 1 ? `, ${customLayout.floors} tầng` : ''})
            </span>
          ) : (
            <span className="text-gray-500">Chưa có sơ đồ nào được tạo</span>
          )}
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleCancel}>Hủy</Button>
          <Button type="primary" onClick={handleSave} disabled={!hasValidLayout}>
            Lưu Sơ Đồ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SeatLayoutBuilder;
