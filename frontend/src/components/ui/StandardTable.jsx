import { Table, Card, Space, Typography, Input, Button, Dropdown } from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useState } from 'react';
import PropTypes from 'prop-types';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

const { Title } = Typography;

const StandardTable = ({
  title,
  subtitle,
  data = [],
  columns = [],
  loading = false,
  pagination = true,
  searchable = false,
  searchPlaceholder = 'Tìm kiếm...',
  onSearch,
  filterable = false,
  filterOptions = [],
  onFilter,
  exportable = false,
  onExport,
  refreshable = false,
  onRefresh,
  actions,
  rowSelection,
  className = '',
  size = 'middle',
  bordered = false,
  ...tableProps
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(null);

  // Handle search
  const handleSearch = (value) => {
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle filter
  const handleFilter = (filter) => {
    setSelectedFilter(filter);
    if (onFilter) {
      onFilter(filter);
    }
  };

  // Render toolbar
  const renderToolbar = () => {
    const hasToolbar = title || searchable || filterable || exportable || refreshable || actions;

    if (!hasToolbar) return null;

    return (
      <div className="border-b border-neutral-200 bg-white">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title Section */}
            <div className="flex-1">
              {title && (
                <Title level={4} className="!mb-1 text-neutral-800">
                  {title}
                </Title>
              )}
              {subtitle && (
                <Typography.Text type="secondary" className="text-sm text-neutral-600">
                  {subtitle}
                </Typography.Text>
              )}
            </div>

            {/* Actions Section */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              {searchable && (
                <Input
                  placeholder={searchPlaceholder}
                  prefix={<SearchOutlined className="text-neutral-400" />}
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  allowClear
                  className="w-full sm:w-64 h-10 rounded-lg border-neutral-300 hover:border-red-400 focus:border-red-500"
                />
              )}

              <Space wrap>
                {/* Filter */}
                {filterable && filterOptions.length > 0 && (
                  <Dropdown
                    menu={{
                      items: filterOptions.map((option, index) => ({
                        key: index,
                        label: option.label,
                        onClick: () => handleFilter(option.value),
                      })),
                    }}
                    trigger={['click']}
                  >
                    <Button
                      icon={<FilterOutlined />}
                      className="h-10 px-4 border-neutral-300 hover:border-red-400 hover:text-red-600"
                    >
                      Lọc {selectedFilter && `(${selectedFilter})`}
                    </Button>
                  </Dropdown>
                )}

                {/* Export */}
                {exportable && (
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={onExport}
                    className="h-10 px-4 border-neutral-300 hover:border-green-400 hover:text-green-600"
                  >
                    Xuất file
                  </Button>
                )}

                {/* Refresh */}
                {refreshable && (
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={onRefresh}
                    loading={loading}
                    className="h-10 px-4 border-neutral-300 hover:border-blue-400 hover:text-blue-600"
                  >
                    Làm mới
                  </Button>
                )}

                {/* Custom Actions */}
                {actions}
              </Space>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced columns with consistent styling
  const enhancedColumns = columns.map(column => ({
    ...column,
    className: `${column.className || ''} text-neutral-700`,
    title: (
      <span className="font-semibold text-neutral-800 text-sm">
        {column.title}
      </span>
    ),
    render: column.render || ((text, record, index) => {
      if (text === null || text === undefined) {
        return <span className="text-neutral-400 italic">—</span>;
      }

      if (typeof text === 'boolean') {
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${text
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
            }`}>
            {text ? 'Có' : 'Không'}
          </span>
        );
      }

      return (
        <span className="text-neutral-700 text-sm">
          {text}
        </span>
      );
    }),
  }));

  // Pagination configuration
  const paginationConfig = pagination === true ? {
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => (
      <span className="text-sm text-neutral-600">
        Hiển thị {range[0]}-{range[1]} trong tổng số {total} mục
      </span>
    ),
    pageSizeOptions: ['10', '20', '50', '100'],
    defaultPageSize: 20,
    className: 'custom-pagination',
    itemRender: (current, type, originalElement) => {
      if (type === 'prev') {
        return <Button size="small" className="border-neutral-300">Trước</Button>;
      }
      if (type === 'next') {
        return <Button size="small" className="border-neutral-300">Sau</Button>;
      }
      return originalElement;
    },
  } : pagination;

  return (
    <Card
      className={`shadow-sm border-neutral-200 ${className}`}
      styles={{ body: { padding: 0 } }}
    >
      {renderToolbar()}

      <div className="p-6">
        <Table
          columns={enhancedColumns}
          dataSource={data}
          loading={{
            spinning: loading,
            indicator: <LoadingSpinner size="large" text="Đang tải dữ liệu..." />,
          }}
          pagination={paginationConfig}
          rowSelection={rowSelection}
          size={size}
          bordered={bordered}
          locale={{
            emptyText: (
              <EmptyState
                type="noData"
                size="small"
                title="Không có dữ liệu"
                description="Chưa có dữ liệu để hiển thị trong bảng"
              />
            ),
          }}
          scroll={{ x: 'max-content' }}
          className="custom-table"
          {...tableProps}
        />
      </div>
    </Card>
  );
};

StandardTable.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  data: PropTypes.array,
  columns: PropTypes.array,
  loading: PropTypes.bool,
  pagination: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  searchable: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  onSearch: PropTypes.func,
  filterable: PropTypes.bool,
  filterOptions: PropTypes.array,
  onFilter: PropTypes.func,
  exportable: PropTypes.bool,
  onExport: PropTypes.func,
  refreshable: PropTypes.bool,
  onRefresh: PropTypes.func,
  actions: PropTypes.node,
  rowSelection: PropTypes.object,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'middle', 'large']),
  bordered: PropTypes.bool,
};

export default StandardTable;