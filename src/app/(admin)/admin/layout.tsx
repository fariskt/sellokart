"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthNavbar } from "@/components/auth-navbar";
import { useSidebarStore } from "@/store/sidebar-store";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed, isHovered } = useSidebarStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const collapsed = mounted ? isCollapsed : false;
  const hovered = mounted ? isHovered : false;
  const isExpanded = !collapsed || hovered;

  return (
    <div className="w-full min-h-screen bg-background">
      <AuthNavbar />
      <Sidebar />
      <div className={cn(
        "w-full flex flex-col min-h-screen transition-all duration-300",
        isExpanded ? "md:pl-64" : "md:pl-16"
      )}>
        <main className="flex-1 w-full overflow-x-hidden bg-muted/10 pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
