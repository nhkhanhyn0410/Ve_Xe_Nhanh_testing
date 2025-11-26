/**
 * Seat Layout Utilities
 * Helper functions for creating, manipulating, and validating seat layouts
 */

/**
 * Generate a basic seat layout matrix
 * @param {Number} rows - Number of rows
 * @param {Number} columns - Number of columns
 * @param {String} prefix - Seat prefix (default: 'A', 'B', 'C', etc.)
 * @param {Array} emptyPositions - Array of [row, col] positions to leave empty
 * @returns {Array} 2D array of seat labels
 */
const generateSeatLayout = (rows, columns, prefix = null, emptyPositions = []) => {
  const layout = [];
  const emptySet = new Set(emptyPositions.map(pos => `${pos[0]},${pos[1]}`));

  for (let row = 0; row < rows; row++) {
    const rowArray = [];
    const rowPrefix = prefix || String.fromCharCode(65 + row); // A, B, C, etc.

    for (let col = 0; col < columns; col++) {
      const posKey = `${row},${col}`;
      if (emptySet.has(posKey)) {
        rowArray.push(''); // Empty space
      } else {
        rowArray.push(`${rowPrefix}${col + 1}`);
      }
    }
    layout.push(rowArray);
  }

  return layout;
};

/**
 * Generate a bus aisle layout (2-aisle-2 pattern common in buses)
 * @param {Number} totalSeats - Total number of seats (excluding driver)
 * @param {Boolean} hasBackRow - Whether to include a back row (5 seats)
 * @returns {Object} Layout configuration with floors, rows, columns, layout, totalSeats
 */
const generateAisleLayout = (totalSeats = 40, hasBackRow = false) => {
  const layout = [];
  const columns = 5;

  // Calculate rows needed
  const seatsPerRow = hasBackRow ? 4 : 4;
  const regularRows = hasBackRow ? Math.floor((totalSeats - 5) / 4) : Math.floor(totalSeats / 4);

  // Add driver seat at front
  layout.push(['DRIVER', '', '', '', '']);

  for (let row = 0; row < regularRows; row++) {
    const rowArray = [];
    const rowPrefix = String.fromCharCode(65 + row);

    // 2-aisle-2 pattern
    rowArray.push(`${rowPrefix}1`); // Left window
    rowArray.push(`${rowPrefix}2`); // Left aisle
    rowArray.push(''); // Aisle
    rowArray.push(`${rowPrefix}3`); // Right aisle
    rowArray.push(`${rowPrefix}4`); // Right window

    layout.push(rowArray);
  }

  // Add back row if requested (common in buses)
  if (hasBackRow) {
    const backRowPrefix = String.fromCharCode(65 + regularRows);
    layout.push([
      `${backRowPrefix}1`,
      `${backRowPrefix}2`,
      `${backRowPrefix}3`,
      `${backRowPrefix}4`,
      `${backRowPrefix}5`,
    ]);
  }

  const actualTotalSeats = hasBackRow ? regularRows * 4 + 5 : regularRows * 4;
  const totalRows = regularRows + 1 + (hasBackRow ? 1 : 0); // Including driver row

  return {
    floors: 1,
    rows: totalRows,
    columns,
    layout,
    totalSeats: actualTotalSeats,
  };
};

/**
 * Generate a sleeper bus layout
 * @param {Number} rows - Number of rows (per floor if 2 floors)
 * @param {Number} floors - Number of floors (1 or 2)
 * @param {Number} columns - Number of columns (default 2)
 * @returns {Object} Layout configuration for sleeper
 */
const generateSleeperLayout = (rows, floors = 1, columns = 2) => {
  const layout = [];

  if (floors === 1) {
    // Single floor sleeper
    for (let row = 0; row < rows; row++) {
      const rowPrefix = String.fromCharCode(65 + row);
      const rowArray = [];
      for (let col = 0; col < columns; col++) {
        rowArray.push(`${rowPrefix}${col + 1}`);
      }
      layout.push(rowArray);
    }

    return {
      floors: 1,
      rows,
      columns,
      layout,
      totalSeats: rows * columns,
    };
  } else {
    // Two floor sleeper (similar to double-decker)
    // Lower floor
    layout.push(['DRIVER', ...Array(columns - 1).fill('')]);

    for (let row = 0; row < rows; row++) {
      const rowPrefix = `L${String.fromCharCode(65 + row)}`;
      const rowArray = [];
      for (let col = 0; col < columns; col++) {
        rowArray.push(`${rowPrefix}${col + 1}`);
      }
      layout.push(rowArray);
    }

    // Floor separator
    layout.push(['FLOOR_2', ...Array(columns - 1).fill('')]);

    // Upper floor
    for (let row = 0; row < rows; row++) {
      const rowPrefix = `U${String.fromCharCode(65 + row)}`;
      const rowArray = [];
      for (let col = 0; col < columns; col++) {
        rowArray.push(`${rowPrefix}${col + 1}`);
      }
      layout.push(rowArray);
    }

    return {
      floors: 2,
      rows: rows * 2 + 2, // Total rows including driver and floor separator
      columns,
      layout,
      totalSeats: rows * columns * 2,
      floorInfo: {
        lowerFloorRows: rows + 1, // Including driver row
        upperFloorStart: rows + 2, // After driver and floor separator
      },
    };
  }
};

/**
 * Generate a limousine layout (2-1 or 1-1 pattern)
 * @param {Number} rows - Number of seat rows (default: 8 for standard 24-seat, 12 for vip 24-seat)
 * @param {String} pattern - 'vip' (1-1) or 'standard' (2-1)
 * @returns {Object} Layout configuration with floors, rows, columns, layout, totalSeats
 */
const generateLimousineLayout = (rows = 8, pattern = 'standard') => {
  const layout = [];
  const columns = pattern === 'vip' ? 3 : 4;

  // Add driver seat at front
  if (pattern === 'vip') {
    layout.push(['DRIVER', '', '']);
  } else {
    layout.push(['DRIVER', '', '', '']);
  }

  for (let row = 0; row < rows; row++) {
    const rowPrefix = String.fromCharCode(65 + row);

    if (pattern === 'vip') {
      // 1-1 pattern (more space)
      layout.push([`${rowPrefix}1`, '', `${rowPrefix}2`]);
    } else {
      // 2-1 pattern (standard limousine)
      layout.push([`${rowPrefix}1`, `${rowPrefix}2`, '', `${rowPrefix}3`]);
    }
  }

  const totalSeats = pattern === 'vip' ? rows * 2 : rows * 3;
  const totalRows = rows + 1; // Including driver row

  return {
    floors: 1,
    rows: totalRows,
    columns,
    layout,
    totalSeats,
  };
};

/**
 * Generate double-decker layout
 * @param {Number} rowsPerFloor - Rows per floor (default: 6)
 * @param {Number} columns - Columns per row (default: 4)
 * @returns {Object} Layout configuration for double decker
 */
const generateDoubleDecker = (rowsPerFloor = 6, columns = 4) => {
  const layout = [];

  // Lower floor - add driver seat at front
  layout.push(['DRIVER', ...Array(columns - 1).fill('')]);

  // Lower floor seats
  for (let row = 0; row < rowsPerFloor; row++) {
    const rowArray = [];
    const rowPrefix = `L${String.fromCharCode(65 + row)}`;
    for (let col = 0; col < columns; col++) {
      rowArray.push(`${rowPrefix}${col + 1}`);
    }
    layout.push(rowArray);
  }

  // Floor separator marker
  layout.push(['FLOOR_2', ...Array(columns - 1).fill('')]);

  // Upper floor seats
  for (let row = 0; row < rowsPerFloor; row++) {
    const rowArray = [];
    const rowPrefix = `U${String.fromCharCode(65 + row)}`;
    for (let col = 0; col < columns; col++) {
      rowArray.push(`${rowPrefix}${col + 1}`);
    }
    layout.push(rowArray);
  }

  return {
    floors: 2,
    rows: rowsPerFloor * 2 + 2, // Total rows including driver and floor separator
    columns,
    layout,
    totalSeats: rowsPerFloor * columns * 2,
    floorInfo: {
      lowerFloorRows: rowsPerFloor + 1, // Including driver row
      upperFloorStart: rowsPerFloor + 2, // After driver and floor separator
    },
  };
};

/**
 * Count total seats in a layout (excluding empty spaces)
 * @param {Array} layout - 2D array of seats
 * @returns {Number} Total number of seats
 */
const countSeats = (layout) => {
  let count = 0;
  for (const row of layout) {
    for (const seat of row) {
      if (seat && seat.trim() !== '') {
        count++;
      }
    }
  }
  return count;
};

/**
 * Validate layout dimensions
 * @param {Array} layout - 2D array
 * @param {Number} expectedRows - Expected number of rows
 * @param {Number} expectedColumns - Expected number of columns
 * @returns {Object} { valid: boolean, errors: [] }
 */
const validateLayoutDimensions = (layout, expectedRows, expectedColumns) => {
  const errors = [];

  if (!Array.isArray(layout)) {
    errors.push('Layout must be an array');
    return { valid: false, errors };
  }

  if (layout.length !== expectedRows) {
    errors.push(`Expected ${expectedRows} rows, got ${layout.length}`);
  }

  for (let i = 0; i < layout.length; i++) {
    if (!Array.isArray(layout[i])) {
      errors.push(`Row ${i} must be an array`);
      continue;
    }

    if (layout[i].length !== expectedColumns) {
      errors.push(`Row ${i}: expected ${expectedColumns} columns, got ${layout[i].length}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Check for duplicate seat numbers
 * @param {Array} layout - 2D array
 * @returns {Object} { valid: boolean, duplicates: [] }
 */
const checkDuplicateSeats = (layout) => {
  const seatMap = new Map();
  const duplicates = [];

  for (let row = 0; row < layout.length; row++) {
    for (let col = 0; col < layout[row].length; col++) {
      const seat = layout[row][col];
      if (seat && seat.trim() !== '') {
        if (seatMap.has(seat)) {
          duplicates.push({
            seat,
            positions: [seatMap.get(seat), [row, col]],
          });
        } else {
          seatMap.set(seat, [row, col]);
        }
      }
    }
  }

  return {
    valid: duplicates.length === 0,
    duplicates,
  };
};

/**
 * Get seat position by seat number
 * @param {Array} layout - 2D array
 * @param {String} seatNumber - Seat number to find
 * @returns {Object} { row, col } or null
 */
const getSeatPosition = (layout, seatNumber) => {
  for (let row = 0; row < layout.length; row++) {
    for (let col = 0; col < layout[row].length; col++) {
      if (layout[row][col] === seatNumber) {
        return { row, col };
      }
    }
  }
  return null;
};

/**
 * Get all seat numbers from layout
 * @param {Array} layout - 2D array
 * @returns {Array} Array of seat numbers
 */
const getAllSeats = (layout) => {
  const seats = [];
  for (const row of layout) {
    for (const seat of row) {
      if (seat && seat.trim() !== '') {
        seats.push(seat);
      }
    }
  }
  return seats;
};

/**
 * Convert layout to visual representation (string)
 * @param {Array} layout - 2D array
 * @returns {String} Visual representation
 */
const layoutToString = (layout) => {
  return layout
    .map((row) =>
      row.map((seat) => (seat && seat.trim() !== '' ? seat.padEnd(4, ' ') : '    ')).join(' ')
    )
    .join('\n');
};

/**
 * Transpose layout (rotate 90 degrees)
 * @param {Array} layout - 2D array
 * @returns {Array} Transposed layout
 */
const transposeLayout = (layout) => {
  const rows = layout.length;
  const cols = layout[0].length;
  const transposed = [];

  for (let col = 0; col < cols; col++) {
    const newRow = [];
    for (let row = 0; row < rows; row++) {
      newRow.push(layout[row][col]);
    }
    transposed.push(newRow);
  }

  return transposed;
};

/**
 * Mirror layout horizontally
 * @param {Array} layout - 2D array
 * @returns {Array} Mirrored layout
 */
const mirrorLayout = (layout) => {
  return layout.map((row) => [...row].reverse());
};

/**
 * Merge two layouts (for double-decker buses)
 * @param {Array} lowerLayout - Lower floor layout
 * @param {Array} upperLayout - Upper floor layout
 * @returns {Array} Combined layout
 */
const mergeLayouts = (lowerLayout, upperLayout) => {
  return [...lowerLayout, ...upperLayout];
};

/**
 * Validate seat layout for business rules
 * @param {Object} seatLayout - Complete seat layout object
 * @param {String} busType - Type of bus
 * @returns {Object} { valid: boolean, errors: [] }
 */
const validateSeatLayoutForBusType = (seatLayout, busType) => {
  const errors = [];
  const { floors, rows, columns, layout } = seatLayout;

  // Check floor requirements
  if (busType === 'double_decker' && floors !== 2) {
    errors.push('Double decker bus must have 2 floors');
  }

  if (busType !== 'double_decker' && floors !== 1) {
    errors.push('Non-double-decker bus must have 1 floor');
  }

  // Check dimensions match layout
  const dimValidation = validateLayoutDimensions(layout, rows, columns);
  if (!dimValidation.valid) {
    errors.push(...dimValidation.errors);
  }

  // Check for duplicates
  const dupValidation = checkDuplicateSeats(layout);
  if (!dupValidation.valid) {
    errors.push(
      `Duplicate seats found: ${dupValidation.duplicates.map((d) => d.seat).join(', ')}`
    );
  }

  // Check reasonable seat count
  const totalSeats = countSeats(layout);
  if (totalSeats < 1) {
    errors.push('Layout must have at least 1 seat');
  }

  if (totalSeats > 200) {
    errors.push('Layout cannot have more than 200 seats');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

module.exports = {
  generateSeatLayout,
  generateAisleLayout,
  generateSleeperLayout,
  generateLimousineLayout,
  generateDoubleDecker,
  countSeats,
  validateLayoutDimensions,
  checkDuplicateSeats,
  getSeatPosition,
  getAllSeats,
  layoutToString,
  transposeLayout,
  mirrorLayout,
  mergeLayouts,
  validateSeatLayoutForBusType,
};
