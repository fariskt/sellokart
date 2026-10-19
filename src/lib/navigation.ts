import {
  LayoutDashboard,
  Package,
  Layers,
  Bookmark,
  Sliders,
  GitBranch,
  Star,
  ShoppingBag,
  RotateCcw,
  Users,
  Box,
  CreditCard,
  Receipt,
  Truck,
  MapPin,
  Ticket,
  Image as ImageIcon,
  Megaphone,
  FileText,
  BookOpen,
  HelpCircle,
  Bell,
  Mail,
  BarChart3,
  LifeBuoy,
  ScrollText,
  Lock,
  Folder,
  Settings,
  User,
  Heart,
  Home,
} from "lucide-react";

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: { name: string; href: string }[];
}

export interface NavigationGroup {
  groupName: string;
  items: NavigationItem[];
}

// -------------------------------------------------------------
// ADMIN SIDEBAR NAVIGATION CONFIG
// -------------------------------------------------------------
export const adminNavigation: NavigationGroup[] = [
  {
    groupName: "Overview",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    groupName: "Catalog",
    items: [
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Categories", href: "/admin/categories", icon: Layers },
    ],
  },
  {
    groupName: "Sales & Logistics",
    items: [
      { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { name: "Shipments", href: "/admin/shipments", icon: Truck },
      { name: "Tracking", href: "/admin/tracking", icon: MapPin },
    ],
  },
  {
    groupName: "Customers & Feedback",
    items: [
      { name: "Customers", href: "/admin/customers", icon: Users },
      { name: "Reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    groupName: "Finance",
    items: [
      { name: "Payments", href: "/admin/payments", icon: CreditCard },
    ],
  },
  {
    groupName: "Inventory",
    items: [
      { name: "Inventory", href: "/admin/inventory", icon: Box },
    ],
  },
  {
    groupName: "System",
    items: [
      { name: "Notifications", href: "/admin/notifications", icon: Bell },
      { name: "Users & Staff", href: "/admin/users", icon: User },
    ],
  },
];
// -------------------------------------------------------------
// CUSTOMER PANEL SIDEBAR NAVIGATION CONFIG
// -------------------------------------------------------------
export const customerNavigation: NavigationGroup[] = [
  {
    groupName: "Dashboard",
    items: [{ name: "Overview", href: "/account", icon: LayoutDashboard }],
  },
  {
    groupName: "My Purchases",
    items: [
      { name: "Orders", href: "/account/orders", icon: ShoppingBag },
      { name: "Returns", href: "/account/returns", icon: RotateCcw },
    ],
  },
  {
    groupName: "Account Details",
    items: [
      { name: "Profile", href: "/account/profile", icon: User },
    ],
  },
  {
    groupName: "Activity",
    items: [
      { name: "Notifications", href: "/account/notifications", icon: Bell },
    ],
  },
];
