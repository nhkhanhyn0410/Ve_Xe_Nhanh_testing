import { useState, useEffect, useMemo, useCallback } from 'react';
import { Typography } from 'antd';
import { CheckCircleFilled, CloseCircleOutlined } from '@ant-design/icons';
import useBookingStore from '../store/bookingStore';

const { Text } = Typography;

// Configuration constants
const MAX_SEATS_SELECTION = 10;

// Special seat type identifiers
const SEAT_TYPES = {
  AISLE: 'aisle',
  DRIVER: 'driver',
  FLOOR_SEPARATOR: 'floor_separator',
  SEAT: 'seat',
};

const SeatMapComponent = ({
  seatLayout,
  bookedSeats = [],
  heldSeats = [],
  availableSeats = [],
  maxSeatsAllowed = MAX_SEATS_SELECTION,
  seatPrice = 0,
  showPrice = false
}) => {
  const { selectedSeats, addSeat, removeSeat, clearSeats } = useBookingStore();
  const [seats, setSeats] = useState([]);

  // Clean up invalid old data on mount (one-time operation)
  useEffect(() => {
    // Clear invalid old data from localStorage
    // Old data has arrays instead of seat objects
    if (selectedSeats.length > 0) {
      const firstSeat = selectedSeats[0];
      // Check if it's an old format (array or missing seatNumber)
      if (Array.isArray(firstSeat) || (typeof firstSeat === 'object' && !firstSeat?.seatNumber)) {
        console.log('Clearing invalid old seat data from localStorage');
        clearSeats();
      }
    }
  }, []); // Run only once on mount

  // Memoize bookedSeats as a Set for O(1) lookup
  const bookedSeatsSet = useMemo(() => {
    return new Set(bookedSeats);
  }, [bookedSeats]);

  // Memoize heldSeats as a Set for O(1) lookup
  const heldSeatsSet = useMemo(() => {
    return new Set(heldSeats);
  }, [heldSeats]);

  // Memoize selectedSeats as a Set for O(1) lookup
  const selectedSeatsSet = useMemo(() => {
    return new Set(selectedSeats.map(s => s.seatNumber));
  }, [selectedSeats]);

  // Generate seats structure from layout - only when seatLayout changes
  useEffect(() => {
    if (seatLayout && seatLayout.layout) {
      generateSeats();
    }
  }, [seatLayout]); // Only depend on seatLayout, not bookedSeats

  const determineSeatType = useCallback((seatNumber) => {
    if (!seatNumber || seatNumber === '') {
      return SEAT_TYPES.AISLE;
    }

    // Check for AISLE (case-insensitive)
    if (seatNumber.toUpperCase() === 'AISLE' || seatNumber.toLowerCase().includes('aisle')) {
      return SEAT_TYPES.AISLE;
    }

    if (seatNumber === 'DRIVER' || seatNumber === '🚗' || seatNumber.includes('Driver')) {
      return SEAT_TYPES.DRIVER;
    }

    if (seatNumber === 'FLOOR_2') {
      return SEAT_TYPES.FLOOR_SEPARATOR;
    }

    return SEAT_TYPES.SEAT;
  }, []);

  const generateSeats = useCallback(() => {
    const { layout, rows, columns } = seatLayout;

    // Backend returns 2D array: [['A1', 'A2'], ['B1', 'B2'], ...]
    // Each layout[row][col] is a string like 'A1' or '' (empty)
    // We need to convert to seat objects

    const seatArray = [];

    for (let row = 0; row < rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < columns; col++) {
        const seatNumber = layout[row]?.[col];
        const seatType = determineSeatType(seatNumber);

        let seat;
        if (seatType === SEAT_TYPES.AISLE) {
          seat = { type: SEAT_TYPES.AISLE, seatNumber: null };
        } else if (seatType === SEAT_TYPES.DRIVER) {
          seat = { type: SEAT_TYPES.DRIVER, seatNumber: null };
        } else if (seatType === SEAT_TYPES.FLOOR_SEPARATOR) {
          seat = { type: SEAT_TYPES.FLOOR_SEPARATOR, seatNumber: null };
        } else {
          // Regular seat - determine floor based on seat naming convention
          // L prefix = Lower (floor 1), U prefix = Upper (floor 2)
          const floor = seatNumber.startsWith('U') ? 2 : 1;

          seat = {
            type: SEAT_TYPES.SEAT,
            seatNumber: seatNumber,
            row: row,
            col: col,
            floor: floor,
          };
        }

        rowSeats.push(seat);
      }
      seatArray.push(rowSeats);
    }

    setSeats(seatArray);
  }, [seatLayout, determineSeatType]);

  const handleSeatClick = useCallback((seat) => {
    // Ignore non-clickable seats
    if (!seat ||
        seat.type === SEAT_TYPES.AISLE ||
        seat.type === SEAT_TYPES.DRIVER ||
        seat.type === SEAT_TYPES.FLOOR_SEPARATOR) {
      return;
    }

    // Can't select already booked or held seats
    if (bookedSeatsSet.has(seat.seatNumber) || heldSeatsSet.has(seat.seatNumber)) {
      return;
    }

    const isSelected = selectedSeatsSet.has(seat.seatNumber);

    if (isSelected) {
      removeSeat(seat.seatNumber);
    } else {
      // Check max seats limit
      if (selectedSeats.length >= maxSeatsAllowed) {
        return;
      }
      addSeat(seat);
    }
  }, [bookedSeatsSet, heldSeatsSet, selectedSeatsSet, selectedSeats.length, maxSeatsAllowed, addSeat, removeSeat]);

  const isSeatBooked = useCallback((seatNumber) => {
    return bookedSeatsSet.has(seatNumber);
  }, [bookedSeatsSet]);

  const isSeatHeld = useCallback((seatNumber) => {
    return heldSeatsSet.has(seatNumber);
  }, [heldSeatsSet]);

  const isSeatSelected = useCallback((seatNumber) => {
    return selectedSeatsSet.has(seatNumber);
  }, [selectedSeatsSet]);

  const getSeatClass = useCallback((seat) => {
    if (!seat || seat.type === SEAT_TYPES.AISLE) return 'seat-invisible';
    if (seat.type === SEAT_TYPES.DRIVER) return 'seat-driver';
    if (seat.type === SEAT_TYPES.FLOOR_SEPARATOR) return 'seat-floor-separator';

    const isSelected = isSeatSelected(seat.seatNumber);
    const isBooked = isSeatBooked(seat.seatNumber);
    const isHeld = isSeatHeld(seat.seatNumber);

    if (isBooked) return 'seat-booked';
    if (isHeld) return 'seat-held';
    if (isSelected) return 'seat-selected';
    return 'seat-available';
  }, [isSeatBooked, isSeatHeld, isSeatSelected]);

  const getSeatIcon = useCallback((seat) => {
    if (!seat || seat.type === SEAT_TYPES.AISLE) return null;
    if (seat.type === SEAT_TYPES.DRIVER) return '🚗';
    if (seat.type === SEAT_TYPES.FLOOR_SEPARATOR) return '--- Tầng 2 ---';

    const isSelected = isSeatSelected(seat.seatNumber);
    const isBooked = isSeatBooked(seat.seatNumber);
    const isHeld = isSeatHeld(seat.seatNumber);

    if (isBooked) return <CloseCircleOutlined />;
    if (isHeld) return '⏱';
    if (isSelected) return <CheckCircleFilled />;
    return seat.seatNumber;
  }, [isSeatBooked, isSeatHeld, isSeatSelected]);

  const getSeatTitle = useCallback((seat) => {
    if (!seat || seat.type === SEAT_TYPES.AISLE) return '';
    if (seat.type === SEAT_TYPES.DRIVER) return 'Ghế lái';
    if (seat.type === SEAT_TYPES.FLOOR_SEPARATOR) return 'Dấu phân tách tầng 2';

    const floorText = seat.floor === 2 ? ' (Tầng 2)' : '';
    const priceText = showPrice && seatPrice > 0 ? ` - ${seatPrice.toLocaleString('vi-VN')}đ` : '';
    return `Ghế ${seat.seatNumber}${floorText}${priceText}`;
  }, [showPrice, seatPrice]);

  return (
    <div className="seat-map-wrapper">
      {/* Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="seat-legend seat-legend-selected">
            ✓
          </div>
          <Text className="text-xs">Đang chọn</Text>
        </div>
        <div className="flex items-center gap-2">
          <div className="seat-legend seat-legend-available">
            A1
          </div>
          <Text className="text-xs">Còn trống</Text>
        </div>
        <div className="flex items-center gap-2">
          <div className="seat-legend seat-legend-held">
            ⏱
          </div>
          <Text className="text-xs">Đang giữ</Text>
        </div>
        <div className="flex items-center gap-2">
          <div className="seat-legend seat-legend-booked">
            ✕
          </div>
          <Text className="text-xs">Đã đặt</Text>
        </div>
      </div>

      {/* Selection Info */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <Text className="text-sm text-blue-700">
          Đã chọn: <strong>{selectedSeats.length}</strong> / {maxSeatsAllowed} ghế
        </Text>
      </div>

      {/* Seat Map */}
      <div className="bg-gray-100 p-4 rounded-lg">
        {/* Driver indicator */}
        <div className="text-center mb-2 text-xs text-gray-600">
          ↑ Đầu xe
        </div>

        <div className="seat-map-container">
          {seats.map((row, rowIndex) => (
            <div key={rowIndex} className="seat-row">
              {row.map((seat, colIndex) => {
                const seatClass = getSeatClass(seat);
                const seatIcon = getSeatIcon(seat);
                const seatTitle = getSeatTitle(seat);
                const isDisabled = !seat ||
                                  seat.type === SEAT_TYPES.AISLE ||
                                  seat.type === SEAT_TYPES.DRIVER ||
                                  seat.type === SEAT_TYPES.FLOOR_SEPARATOR ||
                                  isSeatBooked(seat?.seatNumber) ||
                                  isSeatHeld(seat?.seatNumber);

                // Show price below seat number for regular seats
                const showSeatPrice = showPrice && seatPrice > 0 && seat.type === SEAT_TYPES.SEAT;

                // For AISLE (empty) seats, render an empty placeholder div instead of button
                if (!seat || seat.type === SEAT_TYPES.AISLE) {
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="seat seat-invisible"
                      aria-hidden="true"
                    />
                  );
                }

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    className={`seat ${seatClass}`}
                    onClick={() => handleSeatClick(seat)}
                    disabled={isDisabled}
                    title={seatTitle}
                    aria-label={seatTitle}
                  >
                    <div className="seat-content">
                      <div className="seat-number">{seatIcon}</div>
                      {showSeatPrice && (
                        <div className="seat-price">{(seatPrice / 1000).toFixed(0)}K</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Seat Map Styles */}
      <style>{`
        .seat-map-wrapper {
          width: 100%;
        }

        .seat-row {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .seat {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          border: 2px solid transparent;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          position: relative;
        }

        .seat-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1px;
          width: 100%;
        }

        .seat-number {
          font-size: 12px;
          font-weight: 600;
        }

        .seat-price {
          font-size: 9px;
          font-weight: 500;
          opacity: 0.9;
          line-height: 1;
        }

        .seat:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .seat:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        .seat-available {
          background-color: #e5e7eb;
          border-color: #9ca3af;
          color: #374151;
        }

        .seat-available:hover {
          background-color: #d1d5db;
          border-color: #6b7280;
        }

        .seat-selected {
          background-color: #10b981;
          border-color: #059669;
          color: white;
        }

        .seat-selected:hover {
          background-color: #059669;
        }

        .seat-held {
          background-color: #fbbf24;
          border-color: #f59e0b;
          color: #78350f;
          cursor: not-allowed;
          opacity: 0.85;
          font-weight: 700;
        }

        .seat-booked {
          background-color: #f87171;
          border-color: #ef4444;
          color: white;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .seat-driver {
          background-color: #3b82f6;
          border-color: #2563eb;
          color: white;
          cursor: not-allowed;
          font-size: 18px;
        }

        .seat-floor-separator {
          width: 100%;
          background-color: #fbbf24;
          border-color: #f59e0b;
          color: #78350f;
          font-size: 11px;
          font-weight: 700;
          text-align: center;
          cursor: not-allowed;
          padding: 4px 8px;
        }

        .seat-invisible {
          visibility: hidden;
          pointer-events: none;
        }

        .seat:disabled {
          cursor: not-allowed;
        }

        .seat-legend {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }

        .seat-legend-selected {
          background-color: #10b981;
          color: white;
        }

        .seat-legend-available {
          background-color: #e5e7eb;
          color: #374151;
        }

        .seat-legend-held {
          background-color: #fbbf24;
          color: #78350f;
          font-weight: 700;
        }

        .seat-legend-booked {
          background-color: #f87171;
          color: white;
        }

        @media (max-width: 640px) {
          .seat {
            width: 44px;
            height: 44px;
          }

          .seat-number {
            font-size: 11px;
          }

          .seat-price {
            font-size: 8px;
          }

          .seat-row {
            gap: 6px;
            margin-bottom: 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default SeatMapComponent;
