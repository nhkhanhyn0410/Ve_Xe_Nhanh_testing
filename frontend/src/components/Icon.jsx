// src/components/Icon.jsx
import * as Icons from "lucide-react";

export default function Icon({ name, size = 24, color = "currentColor", ...props }) {
  const LucideIcon = Icons[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" không tồn tại trong lucide-react`);
    return null;
  }

  return <LucideIcon size={size} color={color} {...props} />;
}
