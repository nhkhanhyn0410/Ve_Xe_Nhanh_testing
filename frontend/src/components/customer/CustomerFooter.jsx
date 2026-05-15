import {
  CustomerServiceOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  FileTextOutlined,
  HomeOutlined,
  LoginOutlined,
  MailOutlined,
  PhoneOutlined,
  QuestionCircleOutlined,
  SafetyOutlined,
  SearchOutlined,
  TrophyOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import logoText from '../../assets/brand/Logo_text.svg';

const serviceLinks = [
  { href: '/', text: 'Trang chủ', icon: HomeOutlined },
  { href: '/trips', text: 'Tìm chuyến xe', icon: SearchOutlined },
  { href: '/tickets/lookup', text: 'Tra cứu vé', icon: FileTextOutlined },
  { href: '/loyalty', text: 'VXN Plus', icon: TrophyOutlined },
];

const businessLinks = [
  { href: '/operator/login', text: 'Đăng nhập nhà xe', icon: LoginOutlined },
  { href: '/operator/register', text: 'Đăng ký nhà xe', icon: UserAddOutlined },
  { href: '/trip-manager/login', text: 'Nhân viên chuyến', icon: FileTextOutlined },
  { href: '/admin/login', text: 'Quản trị hệ thống', icon: DashboardOutlined },
];

const supportLinks = [
  { href: '/complaints', text: 'Gửi khiếu nại', icon: CustomerServiceOutlined },
  { href: '/news', text: 'Câu hỏi thường gặp', icon: QuestionCircleOutlined },
  { href: '/tickets/cancel', text: 'Đổi và hủy vé', icon: SafetyOutlined },
];

const FooterLink = ({ href, icon: Icon, text }) => (
  <a
    href={href}
    className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/72 transition hover:bg-white/10 hover:text-white"
  >
    <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-vxn-saffron-500 transition group-hover:bg-white/15">
      <Icon />
    </span>
    <span>{text}</span>
  </a>
);

const CustomerFooter = () => {
  return (
    <footer className="mt-auto bg-[#181C22] text-white">
      <div className="mx-auto max-w-8xl px-4 py-12 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          <section>
            <img src={logoText} alt="Vé Xe Nhanh" className="mb-5 h-10 w-auto brightness-0 invert" />
            <p className="max-w-sm text-sm leading-6 text-white/68">
              Nền tảng đặt vé xe khách trực tuyến cho khách hàng, nhà xe và nhân viên vận hành chuyến.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/85">
              <span className="h-2 w-2 rounded-full bg-vxn-saffron-500" />
              Vé điện tử QR · Thanh toán an toàn
            </div>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white">
              <span className="h-5 w-1 rounded-full bg-vxn-saffron-500" />
              Dịch vụ
            </h2>
            <div className="space-y-1">
              {serviceLinks.map((item) => (
                <FooterLink key={item.href} {...item} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white">
              <span className="h-5 w-1 rounded-full bg-vxn-saffron-500" />
              Đối tác
            </h2>
            <div className="space-y-1">
              {businessLinks.map((item) => (
                <FooterLink key={item.href} {...item} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white">
              <span className="h-5 w-1 rounded-full bg-vxn-saffron-500" />
              Hỗ trợ
            </h2>
            <div className="space-y-1">
              {supportLinks.map((item) => (
                <FooterLink key={item.href} {...item} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white">
              <span className="h-5 w-1 rounded-full bg-vxn-saffron-500" />
              Liên hệ
            </h2>
            <div className="space-y-3 text-sm text-white/75">
              <div className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-3">
                <PhoneOutlined className="mt-1 text-vxn-saffron-500" />
                <div>
                  <div className="text-white/55">Hotline</div>
                  <div className="font-semibold text-white">1900 6067</div>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-3">
                <MailOutlined className="mt-1 text-vxn-saffron-500" />
                <div>
                  <div className="text-white/55">Email hỗ trợ</div>
                  <div className="font-semibold text-white">support@vexenhanh.vn</div>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-3">
                <EnvironmentOutlined className="mt-1 text-vxn-saffron-500" />
                <div>
                  <div className="text-white/55">Văn phòng</div>
                  <div className="font-semibold text-white">TP. Hồ Chí Minh, Việt Nam</div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              {[FacebookOutlined, MailOutlined, PhoneOutlined].map((Icon, index) => (
                <span
                  key={index}
                  className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg border border-white/10 bg-white/10 text-white transition hover:bg-vxn-teal-700"
                >
                  <Icon />
                </span>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/48 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Vé Xe Nhanh. All rights reserved.</span>
          <span>Điều khoản sử dụng · Chính sách bảo mật · Chính sách hoàn tiền</span>
        </div>
      </div>
    </footer>
  );
};

export default CustomerFooter;
