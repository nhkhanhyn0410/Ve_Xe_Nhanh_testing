/**
 * Seat Layout Templates
 * Predefined seat layouts for common bus types and configurations
 */

const {
  generateSeatLayout,
  generateAisleLayout,
  generateSleeperLayout,
  generateLimousineLayout,
  generateDoubleDecker,
} = require('./seatLayout');

/**
 * Standard Seater Bus Templates
 */
const seaterTemplates = {
  // Small bus: 16 seats (4 rows x 4 columns)
  small: {
    name: 'Xe ghế ngồi 16 chỗ',
    busType: 'seater',
    floors: 1,
    rows: 4,
    columns: 4,
    layout: generateSeatLayout(4, 4),
    totalSeats: 16,
    description: 'Xe khách nhỏ 16 chỗ ngồi, phù hợp cho các tuyến ngắn',
  },

  // Medium bus: 24 seats (6 rows x 4 columns)
  medium: {
    name: 'Xe ghế ngồi 24 chỗ',
    busType: 'seater',
    floors: 1,
    rows: 6,
    columns: 4,
    layout: generateSeatLayout(6, 4),
    totalSeats: 24,
    description: 'Xe khách 24 chỗ ngồi tiêu chuẩn',
  },

  // Standard bus with aisle: 40 seats (10 rows x 4 seats + aisle)
  standard: {
    name: 'Xe ghế ngồi 40 chỗ có lối đi',
    busType: 'seater',
    floors: 1,
    rows: 10,
    columns: 5, // Including aisle
    layout: generateAisleLayout(10, false),
    totalSeats: 40,
    description: 'Xe khách 40 chỗ ngồi với lối đi giữa, tiện nghi tiêu chuẩn',
  },

  // Large bus with aisle and back row: 45 seats
  large: {
    name: 'Xe ghế ngồi 45 chỗ',
    busType: 'seater',
    floors: 1,
    rows: 10,
    columns: 5,
    layout: generateAisleLayout(10, true),
    totalSeats: 45,
    description: 'Xe khách lớn 45 chỗ ngồi với hàng ghế cuối rộng rãi',
  },
};

/**
 * Sleeper Bus Templates
 */
const sleeperTemplates = {
  // Standard sleeper: 20 berths (10 rows x 2 columns, 1 floor)
  standard: {
    name: 'Xe giường nằm 20 giường',
    busType: 'sleeper',
    ...generateSleeperLayout(10, 1, 2),
    description: 'Xe giường nằm tiêu chuẩn 20 giường, 1 tầng',
  },

  // Large sleeper: 30 berths (15 rows x 2 columns, 1 floor)
  large: {
    name: 'Xe giường nằm 30 giường',
    busType: 'sleeper',
    ...generateSleeperLayout(15, 1, 2),
    description: 'Xe giường nằm lớn 30 giường, thoải mái cho hành trình dài',
  },

  // Double-decker sleeper: 40 berths (10 rows x 2 columns, 2 floors)
  doubleDecker: {
    name: 'Xe giường nằm 2 tầng 40 giường',
    busType: 'sleeper',
    ...generateSleeperLayout(10, 2, 2),
    description: 'Xe giường nằm 2 tầng 40 giường, hiện đại và sang trọng',
  },
};

/**
 * Limousine Bus Templates
 */
const limousineTemplates = {
  // VIP Limousine: 9 seats (9 rows x 2 columns with extra space)
  vip9: {
    name: 'Limousine VIP 9 chỗ',
    busType: 'limousine',
    floors: 1,
    rows: 9,
    columns: 3, // 1-space-1 pattern
    layout: generateLimousineLayout(9, 'vip'),
    totalSeats: 18,
    description: 'Limousine VIP 9 chỗ, ghế massage, không gian rộng rãi',
  },

  // Standard Limousine: 22 seats (11 rows x 3 columns)
  standard22: {
    name: 'Limousine 22 chỗ',
    busType: 'limousine',
    floors: 1,
    rows: 11,
    columns: 4, // 2-space-1 pattern
    layout: generateLimousineLayout(11, 'standard'),
    totalSeats: 33,
    description: 'Limousine 22 chỗ tiêu chuẩn với ghế ngồi cao cấp',
  },

  // Premium Limousine: 16 seats (custom layout with extra space)
  premium16: {
    name: 'Limousine Premium 16 chỗ',
    busType: 'limousine',
    floors: 1,
    rows: 8,
    columns: 3,
    layout: [
      ['A1', '', 'A2'],
      ['B1', '', 'B2'],
      ['C1', '', 'C2'],
      ['D1', '', 'D2'],
      ['E1', '', 'E2'],
      ['F1', '', 'F2'],
      ['G1', '', 'G2'],
      ['H1', '', 'H2'],
    ],
    totalSeats: 16,
    description: 'Limousine Premium 16 chỗ với ghế da thật, màn hình cá nhân',
  },
};

/**
 * Double Decker Bus Templates
 */
const doubleDeckerTemplates = {
  // Standard double-decker: 80 seats (10 rows x 4 columns x 2 floors)
  standard: {
    name: 'Xe 2 tầng 80 chỗ',
    busType: 'double_decker',
    ...generateDoubleDecker(10, 4),
    description: 'Xe 2 tầng tiêu chuẩn 80 chỗ ngồi',
  },

  // Large double-decker: 100 seats (12 rows x 4 columns x 2 floors + back rows)
  large: {
    name: 'Xe 2 tầng 100 chỗ',
    busType: 'double_decker',
    floors: 2,
    rows: 12,
    columns: 4,
    layout: [
      // Lower floor
      ...generateSeatLayout(12, 4, 'L'),
      // Upper floor
      ...generateSeatLayout(12, 4, 'U'),
      // Back row on lower floor
      ['LB1', 'LB2', 'LB3', 'LB4'],
      // Back row on upper floor
      ['UB1', 'UB2', 'UB3', 'UB4'],
    ],
    totalSeats: 104,
    description: 'Xe 2 tầng lớn 100+ chỗ ngồi, phù hợp cho tuyến dài',
  },
};

/**
 * Get all templates
 * @returns {Object} All templates by bus type
 */
const getAllTemplates = () => {
  return {
    seater: seaterTemplates,
    sleeper: sleeperTemplates,
    limousine: limousineTemplates,
    double_decker: doubleDeckerTemplates,
  };
};

/**
 * Get templates for a specific bus type
 * @param {String} busType - Bus type
 * @returns {Object} Templates for the bus type
 */
const getTemplatesByBusType = (busType) => {
  const templates = {
    seater: seaterTemplates,
    sleeper: sleeperTemplates,
    limousine: limousineTemplates,
    double_decker: doubleDeckerTemplates,
  };

  return templates[busType] || {};
};

/**
 * Get a specific template
 * @param {String} busType - Bus type
 * @param {String} templateName - Template name
 * @returns {Object} Template or null
 */
const getTemplate = (busType, templateName) => {
  const templates = getTemplatesByBusType(busType);
  return templates[templateName] || null;
};

/**
 * List all available templates with metadata
 * @returns {Array} Array of template metadata
 */
const listAllTemplates = () => {
  const allTemplates = getAllTemplates();
  const list = [];

  for (const [busType, templates] of Object.entries(allTemplates)) {
    for (const [key, template] of Object.entries(templates)) {
      list.push({
        id: `${busType}_${key}`,
        busType,
        templateKey: key,
        name: template.name,
        totalSeats: template.totalSeats,
        floors: template.floors,
        rows: template.rows,
        columns: template.columns,
        description: template.description,
      });
    }
  }

  return list;
};

/**
 * Custom template builder
 * @param {Object} options - Template options
 * @returns {Object} Custom template
 */
const buildCustomTemplate = (options) => {
  const {
    busType,
    rows,
    columns,
    floors = 1,
    pattern = 'standard',
    emptyPositions = [],
  } = options;

  let layout;
  let totalSeats;
  let actualRows = rows;
  let actualColumns = columns;

  switch (busType) {
    case 'seater':
      if (pattern === 'aisle') {
        const aisleConfig = generateAisleLayout(rows * 4, false);
        layout = aisleConfig.layout;
        totalSeats = aisleConfig.totalSeats;
        actualRows = aisleConfig.rows;
        actualColumns = aisleConfig.columns;
      } else {
        layout = generateSeatLayout(rows, columns, null, emptyPositions);
        totalSeats = rows * columns - emptyPositions.length;
      }
      break;

    case 'sleeper':
      const sleeperConfig = generateSleeperLayout(rows, floors, columns);
      layout = sleeperConfig.layout;
      totalSeats = sleeperConfig.totalSeats;
      // Update from generated config (important for 2-floor layouts)
      actualColumns = sleeperConfig.columns;
      actualRows = sleeperConfig.rows;
      break;

    case 'limousine':
      const limousineConfig = generateLimousineLayout(rows, pattern);
      layout = limousineConfig.layout;
      totalSeats = limousineConfig.totalSeats;
      actualRows = limousineConfig.rows;
      actualColumns = limousineConfig.columns;
      break;

    case 'double_decker':
      const doubleDeckerConfig = generateDoubleDecker(rows, columns);
      layout = doubleDeckerConfig.layout;
      totalSeats = doubleDeckerConfig.totalSeats;
      actualRows = doubleDeckerConfig.rows;
      actualColumns = doubleDeckerConfig.columns;
      break;

    default:
      throw new Error(`Unsupported bus type: ${busType}`);
  }

  return {
    busType,
    floors,
    rows: actualRows,
    columns: actualColumns,
    layout,
    totalSeats,
    custom: true,
  };
};

module.exports = {
  seaterTemplates,
  sleeperTemplates,
  limousineTemplates,
  doubleDeckerTemplates,
  getAllTemplates,
  getTemplatesByBusType,
  getTemplate,
  listAllTemplates,
  buildCustomTemplate,
};
