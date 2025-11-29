// src/pages/components/PopularRoutes.jsx
import { Card } from "antd";

const popularRoutes = [
  { from: "Hà Nội", to: "Đà Nẵng" },
  { from: "TP HCM", to: "Nha Trang" },
  { from: "Hà Nội", to: "Huế" },
];

const PopularRoutes = () => (
  <div className="mt-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
    {popularRoutes.map((route, i) => (
      <Card key={i} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
        <div className="text-lg font-semibold mb-2">
          {route.from} → {route.to}
        </div>
      </Card>
    ))}
  </div>
);

export default PopularRoutes;
