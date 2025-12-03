import { Layout, Row, Col, Space, Typography } from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  LoginOutlined,
  UserAddOutlined,
  CarOutlined,
  DashboardOutlined,
  SettingOutlined,
  HomeOutlined,
  SearchOutlined,
  FileTextOutlined,
  TrophyOutlined,
  CustomerServiceOutlined,
  QuestionCircleOutlined,
  DollarOutlined,
  SafetyOutlined,
  SecurityScanOutlined,
} from '@ant-design/icons';

// X (Twitter) icon component
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const { Footer } = Layout;
const { Title, Text, Link } = Typography;

const CustomerFooter = () => {
  return (
    <Footer className="bg-gray-200 text-white mt-auto">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
        <Row gutter={[32, 48]}>
          {/* Company Info */}
          <Col xs={24} sm={12} lg={5}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">🚀</span>
                </div>
                <div>
                  <Title level={4} className="text-white mb-0">
                    Vé xe nhanh
                  </Title>
                  <Text className="text-slate-700 text-sm">
                    Đặt vé thông minh
                  </Text>
                </div>
              </div>
              <Text className="text-slate-800 leading-relaxed">
                Nền tảng đặt vé xe khách trực tuyến.<br />
                Mang đến trải nghiệm đặt vé nhanh chóng, tiện lợi và an toàn nhất.
              </Text>



            </div>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} lg={4}>
            <Title level={5} className="text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-red-500 rounded-full"></span>
              Dịch vụ
            </Title>
            <div className="space-y-4">
              {[
                { href: '/', text: 'Trang chủ', icon: HomeOutlined, color: 'text-blue-400' },
                { href: '/trips', text: 'Tìm chuyến xe', icon: SearchOutlined, color: 'text-green-400' },
                { href: '/tickets/lookup', text: 'Tra cứu vé', icon: FileTextOutlined, color: 'text-yellow-400' },
                { href: '/loyalty', text: 'Loyalty Program', icon: TrophyOutlined, color: 'text-purple-400' }
              ].map((item, index) => (
                <div key={index} className="group">
                  <Link
                    href={item.href}
                    className="text-slate-300 hover:text-white transition-all duration-300 flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-700/50 border border-transparent hover:border-gray-600"
                  >
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className={`${item.color} text-sm`} />
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform text-sm font-medium">
                      {item.text}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </Col>

          {/* Business Links */}
          <Col xs={24} sm={12} lg={4}>
            <Title level={5} className="text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
              Liên kết nhanh
            </Title>
            <div className="space-y-4">
              {[
                { href: '/operator/login', text: 'Đăng nhập nhà xe', icon: LoginOutlined, color: 'text-orange-400' },
                { href: '/operator/register', text: 'Đăng ký nhà xe', icon: UserAddOutlined, color: 'text-blue-400' },
                { href: '/admin/login', text: 'Quản trị viên', icon: DashboardOutlined, color: 'text-purple-400' },
                { href: '/trip-manager/login', text: 'Đăng nhập nhân viên', icon: CarOutlined, color: 'text-green-400' },
                // { href: '/operator/settings', text: 'Cài đặt tài khoản', icon: SettingOutlined, color: 'text-cyan-400' }
              ].map((item, index) => (
                <div key={index} className="group">
                  <Link
                    href={item.href}
                    className="text-slate-300 hover:text-white transition-all duration-300 flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-700/50 border border-transparent hover:border-gray-600"
                  >
                    <div className={`w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <item.icon className={`${item.color} text-sm`} />
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform text-sm font-medium">
                      {item.text}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </Col>

          {/* Support */}
          <Col xs={24} sm={12} lg={5}>
            <Title level={5} className="text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-red-500 rounded-full"></span>
              Hỗ trợ khách hàng
            </Title>
            <div className="space-y-4">
              {[
                { href: '/complaints', text: 'Gửi khiếu nại', icon: CustomerServiceOutlined, color: 'text-red-400' },
                { text: 'Câu hỏi thường gặp', icon: QuestionCircleOutlined, color: 'text-blue-400' },
                { text: 'Chính sách hoàn tiền', icon: DollarOutlined, color: 'text-green-400' },
                { text: 'Điều khoản sử dụng', icon: SafetyOutlined, color: 'text-orange-400' },
                { text: 'Chính sách bảo mật', icon: SecurityScanOutlined, color: 'text-purple-400' }
              ].map((item, index) => (
                <div key={index} className="group">
                  <Link
                    href={item.href}
                    className="text-slate-300 hover:text-white transition-all duration-300 flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-700/50 border border-transparent hover:border-gray-600"
                  >
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className={`${item.color} text-sm`} />
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform text-sm font-medium">
                      {item.text}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </Col>

          {/* Contact Info */}
          <Col xs={24} sm={12} lg={6}>
            <Title level={5} className="text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-red-500 rounded-full"></span>
              Liên hệ với chúng tôi
            </Title>
            <div className="space-y-4 w-84">
              <div className="flex items-center gap-4 p-3 bg-gray-400/50 rounded-lg border border-gray-600">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <PhoneOutlined className="text-white" />
                </div>
                <div>
                  <Text className="text-slate-800 text-xs block">Hotline 24/7</Text>
                  <Text className="text-black font-medium">1900 0000</Text>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-gray-400/50 rounded-lg border border-gray-600">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MailOutlined className="text-white" />
                </div>
                <div>
                  <Text className="text-slate-800 text-xs block">Email hỗ trợ</Text>
                  <Text className="text-black font-medium">vexenhanh@gmail.com</Text>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-gray-400/50 rounded-lg border border-gray-600">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <EnvironmentOutlined className="text-white" />
                </div>
                <div>
                  <Text className="text-slate-800 text-xs block">Địa chỉ</Text>
                  <Text className="text-black font-medium">TP. HCM, Việt Nam</Text>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-6">
                <Text className="text-slate-400 text-sm font-medium block mb-3">
                  Theo dõi chúng tôi
                </Text>
                <div className="flex gap-3">
                  {[
                    { icon: FacebookOutlined, color: 'hover:bg-blue-600', bg: 'bg-gray-700' },
                    { icon: XIcon, color: 'hover:bg-gray-500', bg: 'bg-gray-700', isCustom: true },
                    { icon: InstagramOutlined, color: 'hover:bg-pink-600', bg: 'bg-gray-700' },
                    { icon: YoutubeOutlined, color: 'hover:bg-red-600', bg: 'bg-gray-700' }
                  ].map((social, index) => (
                    <div
                      key={index}
                      className={`w-10 h-10 ${social.bg} ${social.color} rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 border border-gray-600`}
                    >
                      {social.isCustom ? (
                        <social.icon />
                      ) : (
                        <social.icon className="text-white" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Bottom Bar */}

      </div>
    </Footer>
  );
};

export default CustomerFooter;
