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
  Home
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
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }
    ]
  },
  {
    groupName: "Catalog",
    items: [
      {
        name: "Products",
        href: "/admin/products",
        icon: Package,
        subItems: [
          { name: "List Products", href: "/admin/products" },
          { name: "Add Product", href: "/admin/products/create" }
        ]
      },
      { name: "Categories", href: "/admin/categories", icon: Layers },
      { name: "Brands", href: "/admin/brands", icon: Bookmark },
      { name: "Attributes", href: "/admin/attributes", icon: Sliders },
      { name: "Variants", href: "/admin/variants", icon: GitBranch }
    ]
  },
  {
    groupName: "Sales & Logistics",
    items: [
      { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { name: "Returns", href: "/admin/returns", icon: RotateCcw },
      { name: "Shipments", href: "/admin/shipments", icon: Truck },
      { name: "Tracking", href: "/admin/tracking", icon: MapPin }
    ]
  },
  {
    groupName: "Customers & Feedback",
    items: [
      { name: "Customers", href: "/admin/customers", icon: Users },
      { name: "Reviews", href: "/admin/reviews", icon: Star },
      { name: "Support Tickets", href: "/admin/tickets", icon: LifeBuoy }
    ]
  },
  {
    groupName: "Finance & Inventory",
    items: [
      { name: "Inventory", href: "/admin/inventory", icon: Box },
      { name: "Payments", href: "/admin/payments", icon: CreditCard },
      { name: "Refunds", href: "/admin/refunds", icon: Receipt }
    ]
  },
  {
    groupName: "Marketing",
    items: [
      { name: "Coupons", href: "/admin/coupons", icon: Ticket },
      { name: "Banners", href: "/admin/banners", icon: ImageIcon },
      { name: "Promotions", href: "/admin/promotions", icon: Megaphone }
    ]
  },
  {
    groupName: "Content & Comms",
    items: [
      { name: "Pages", href: "/admin/pages", icon: FileText },
      { name: "Blog", href: "/admin/blog", icon: BookOpen },
      { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
      { name: "Notifications", href: "/admin/notifications", icon: Bell },
      { name: "Email Templates", href: "/admin/email-templates", icon: Mail }
    ]
  },
  {
    groupName: "System",
    items: [
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { name: "Users & Staff", href: "/admin/users", icon: User },
      { name: "Roles & Perms", href: "/admin/roles", icon: Lock },
      { name: "Files Manager", href: "/admin/files", icon: Folder },
      { name: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
      { name: "Settings", href: "/admin/settings", icon: Settings },
      { name: "My Profile", href: "/admin/profile", icon: User }
    ]
  }
];

// -------------------------------------------------------------
// CUSTOMER PANEL SIDEBAR NAVIGATION CONFIG
// -------------------------------------------------------------
export const customerNavigation: NavigationGroup[] = [
  {
    groupName: "Dashboard",
    items: [
      { name: "Overview", href: "/account", icon: LayoutDashboard }
    ]
  },
  {
    groupName: "My Purchases",
    items: [
      { name: "Orders", href: "/account/orders", icon: ShoppingBag },
      { name: "Returns", href: "/account/returns", icon: RotateCcw },
      { name: "Wishlist", href: "/account/wishlist", icon: Heart },
      { name: "Coupons", href: "/account/coupons", icon: Ticket }
    ]
  },
  {
    groupName: "Account Details",
    items: [
      { name: "Profile Info", href: "/account/profile", icon: User },
      { name: "Addresses", href: "/account/addresses", icon: MapPin },
      { name: "Security & Login", href: "/account/security", icon: Lock }
    ]
  },
  {
    groupName: "Activity",
    items: [
      { name: "Reviews", href: "/account/reviews", icon: Star },
      { name: "Notifications", href: "/account/notifications", icon: Bell }
    ]
  }
];
