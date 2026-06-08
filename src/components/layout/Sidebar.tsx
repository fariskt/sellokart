"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminNavigation, customerNavigation } from "@/lib/navigation";
import { ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebarStore } from "@/store/sidebar-store";

export function Sidebar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isCustomer = pathname.startsWith("/account");

  const { isCollapsed, isHovered, toggleCollapsed, setHovered } = useSidebarStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which navigation to use based on url path
  const navigationGroups = isAdmin 
    ? adminNavigation 
    : isCustomer 
    ? customerNavigation 
    : [];

  // If we're not on admin or customer pages, don't show the sidebar
  if (navigationGroups.length === 0) {
    return null;
  }

  const collapsed = mounted ? isCollapsed : false;
  const hovered = mounted ? isHovered : false;
  const isExpanded = !collapsed || hovered;

  return (
    <aside 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "h-screen fixed top-0 left-0 z-30 border-r border-sidebar-border bg-sidebar overflow-y-auto overflow-x-hidden select-none hidden md:flex flex-col justify-between p-4 transition-all duration-300",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      <div className="space-y-6">
        {/* Context Header */}
        <div className={cn(
          "border-b border-sidebar-border/60 flex items-center py-1.5 transition-all duration-300",
          isExpanded ? "px-3 justify-between" : "px-0 justify-center"
        )}>
          {isExpanded && (
            <Link href="/" className="flex items-center space-x-2 animate-in fade-in duration-200">
              <span className="text-base font-black tracking-tighter bg-linear-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                SELLOKART
              </span>
            </Link>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapsed();
            }}
            className="p-1 rounded-lg hover:bg-muted text-primary hover:text-primary-hover cursor-pointer transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-primary" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-primary" />
            )}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.groupName} className="space-y-2">
              {isExpanded ? (
                <h3 className="px-3 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider transition-opacity duration-300">
                  {group.groupName}
                </h3>
              ) : (
                <div className="h-[1px] bg-sidebar-border/40 mx-2 my-3" />
              )}
              
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isParentActive = pathname === item.href;
                  const hasActiveChild = item.subItems?.some(
                    (sub) => pathname === sub.href
                  );
                  const isActive = isParentActive || hasActiveChild;

                  return (
                    <li key={item.name} className="space-y-1">
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer group",
                          isExpanded ? "justify-between px-3 py-2" : "justify-center p-2.5",
                          isActive
                            ? "bg-primary text-primary-foreground button-shadow"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                        title={!isExpanded ? item.name : undefined}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={cn(
                            "w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                            isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                          )} />
                          {isExpanded && <span>{item.name}</span>}
                        </div>
                        {isExpanded && item.subItems && (
                          <ChevronRight
                            className={cn(
                              "w-3.5 h-3.5 transition-transform duration-200",
                              isActive ? "rotate-90 text-primary-foreground" : "text-muted-foreground/40"
                            )}
                          />
                        )}
                      </Link>

                      {/* Sub Items */}
                      {item.subItems && isActive && isExpanded && (
                        <ul className="pl-6 pr-1 py-1 space-y-1 mt-0.5 border-l border-sidebar-border ml-5 animate-in fade-in slide-in-from-top-1 duration-250">
                          {item.subItems.map((sub) => {
                            const isSubActive = pathname === sub.href;
                            return (
                              <li key={sub.name}>
                                <Link
                                  href={sub.href}
                                  className={cn(
                                    "block py-1.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                                    isSubActive
                                      ? "text-primary bg-secondary/40 font-bold"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                                  )}
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Footer Details */}
      <div className={cn(
        "pt-4 border-t border-sidebar-border/60 text-[10px] text-muted-foreground transition-all duration-300",
        isExpanded ? "px-3 flex items-center justify-between" : "flex justify-center"
      )}>
        {isExpanded ? (
          <>
            <span>© Sellokart 2026</span>
            <span className="font-bold text-primary/80">v0.1.0</span>
          </>
        ) : (
          <span className="font-bold text-primary/80">v0.1</span>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;