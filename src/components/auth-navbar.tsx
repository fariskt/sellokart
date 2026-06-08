"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  Compass, 
  Command,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  Settings,
  ShoppingBag
} from "lucide-react";
import { adminNavigation, customerNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { signout } from "@/features/auth/actions";
import { useSidebarStore } from "@/store/sidebar-store";

export function AuthNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const isAdmin = pathname.startsWith("/admin");
  const isCustomer = pathname.startsWith("/account") || pathname === "/cart" || pathname === "/wishlist" || pathname === "/checkout";
  const hasSidebar = pathname.startsWith("/admin") || pathname.startsWith("/account");

  // State management
  const { isCollapsed, isHovered } = useSidebarStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch user session client-side and subscribe to updates
  useEffect(() => {
    const supabase = createClient();
    
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    setMounted(true);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await signout();
  };

  // Active navigation config based on role
  const activeNavigation = isAdmin 
    ? adminNavigation 
    : isCustomer 
    ? customerNavigation 
    : [];

  // Flattened pages for searching
  const searchablePages: { name: string; href: string; category: string }[] = [];
  activeNavigation.forEach(group => {
    group.items.forEach(item => {
      searchablePages.push({ name: item.name, href: item.href, category: group.groupName });
      if (item.subItems) {
        item.subItems.forEach(sub => {
          searchablePages.push({ 
            name: `${item.name} > ${sub.name}`, 
            href: sub.href, 
            category: group.groupName 
          });
        });
      }
    });
  });

  // Filter search results
  const filteredResults = searchQuery.trim() === "" 
    ? [] 
    : searchablePages.filter(page => 
        page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);

  // Close search results dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut listener (Cmd+K or Ctrl+K to focus search)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setShowResults(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleResultClick = (href: string) => {
    setSearchQuery("");
    setShowResults(false);
    setIsDrawerOpen(false);
    router.push(href);
  };

  const collapsed = mounted ? isCollapsed : false;
  const hovered = mounted ? isHovered : false;
  const isExpanded = !collapsed || hovered;

  return (
    <>
      <header className={cn(
        "fixed top-0 right-0 z-40 border-b border-border/20 bg-background/50 backdrop-blur-md select-none transition-all duration-300",
        hasSidebar 
          ? (isExpanded ? "left-0 md:left-64" : "left-0 md:left-16") 
          : "left-0"
      )}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 gap-4">
          
          {/* Left Side: Mobile Hamburger & Logo */}
          <div className="flex items-center space-x-3 shrink-0">
            {activeNavigation.length > 0 && (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex md:hidden items-center justify-center p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                aria-label="Open sidebar menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            <Link 
              href="/" 
              className={cn(
                "items-center space-x-2",
                hasSidebar ? "flex md:hidden" : "flex"
              )}
            >
              <span className="text-lg sm:text-xl font-black tracking-tighter bg-linear-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                SELLOKART
              </span>
            </Link>
          </div>

          {/* Center Side: Role-aware Search Bar */}
          {activeNavigation.length > 0 && (
            <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={isAdmin ? "Search admin panel..." : "Search account settings..."}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  className="w-full h-9 pl-10 pr-10 rounded-xl border border-border/80 bg-background/30 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[10px] text-muted-foreground/60 font-semibold gap-0.5">
                  <Command className="w-3 h-3" />
                  <span>K</span>
                </div>
              </div>

              {/* Floating Search Results */}
              <AnimatePresence>
                {showResults && filteredResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-border/80 rounded-2xl shadow-xl z-50 overflow-hidden p-2"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                      Search Results
                    </div>
                    <div className="space-y-0.5">
                      {filteredResults.map((result) => (
                        <button
                          key={result.href}
                          onClick={() => handleResultClick(result.href)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-secondary/20 hover:text-primary transition-all text-left text-foreground cursor-pointer"
                        >
                          <div className="flex items-center space-x-2">
                            <Compass className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span>{result.name}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground/60 font-medium bg-muted px-2 py-0.5 rounded-md">
                            {result.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Right Side: Back to Store Link & Profile Dropdown */}
          <div className="shrink-0 flex items-center space-x-4">
            <Link 
              href="/" 
              className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-all hover:translate-x-[-2px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden xs:inline">Back to Store</span>
            </Link>

            {user && (
              <>
                <div className="h-4 w-[1px] bg-border/60" />
                <div className="relative">
                  {/* User Profile Trigger */}
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    type="button"
                    className="flex items-center space-x-2 p-1 rounded-full border border-transparent hover:bg-muted/50 hover:border-border transition-all cursor-pointer"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt={user.user_metadata?.full_name || "Profile"} 
                        className="w-8 h-8 rounded-full object-cover border border-accent/20"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground border border-accent/20">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                    <span className="text-xs font-semibold max-w-[100px] truncate hidden sm:inline text-foreground">
                      {user.user_metadata?.full_name || user.email?.split("@")[0]}
                    </span>
                  </button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {showDropdown && (
                      <>
                        {/* Backdrop to close */}
                        <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-popover text-popover-foreground p-2 shadow-lg z-40 select-none"
                        >
                          <div className="px-3 py-2 border-b border-border/60 mb-1.5">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Signed in as</p>
                            <p className="text-xs font-bold truncate mt-0.5">{user.email}</p>
                          </div>

                          <Link
                            href={isAdmin ? "/admin/dashboard" : "/account"}
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-muted/50 transition-colors"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{isAdmin ? "Admin Dashboard" : "Customer Portal"}</span>
                          </Link>

                          {!isAdmin && (
                            <Link
                              href="/account/orders"
                              onClick={() => setShowDropdown(false)}
                              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-muted/50 transition-colors"
                            >
                              <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>My Orders</span>
                            </Link>
                          )}

                          <Link
                            href={isAdmin ? "/admin/settings" : "/account/profile"}
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-muted/50 transition-colors"
                          >
                            <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Settings</span>
                          </Link>

                          <div className="w-full h-[1px] bg-border/60 my-1.5" />

                          <button
                            onClick={() => {
                              setShowDropdown(false);
                              handleSignOut();
                            }}
                            type="button"
                            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Sidebar Drawer */}
      <AnimatePresence>
        {isDrawerOpen && activeNavigation.length > 0 && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-xs md:hidden"
            />

            {/* Sliding Panel Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 border-r border-border shadow-2xl flex flex-col justify-between p-5 md:hidden select-none"
            >
              <div className="space-y-6 overflow-y-auto flex-1 pr-1">
                {/* Header context */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center space-x-2">
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">
                      {isAdmin ? "Admin Console" : "Customer Portal"}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Search Bar inside Drawer */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search sections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-9 pr-4 rounded-xl border border-border bg-muted/20 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground/60 hover:text-foreground cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Search query results inside Drawer */}
                {searchQuery.trim() !== "" ? (
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider pl-1">
                      Search Results
                    </h3>
                    {searchablePages.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                      <div className="text-center py-6 text-xs text-muted-foreground italic">
                        No pages matched query.
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {searchablePages
                          .filter(page => page.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .slice(0, 6)
                          .map((page) => (
                            <li key={page.href}>
                              <button
                                onClick={() => handleResultClick(page.href)}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-primary hover:text-white transition-colors cursor-pointer block"
                              >
                                {page.name}
                              </button>
                            </li>
                          ))
                        }
                      </ul>
                    )}
                  </div>
                ) : (
                  /* Standard navigation list */
                  <div className="space-y-6">
                    {activeNavigation.map((group) => (
                      <div key={group.groupName} className="space-y-2">
                        <h3 className="px-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                          {group.groupName}
                        </h3>
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
                                  onClick={() => setIsDrawerOpen(false)}
                                  className={cn(
                                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer group",
                                    isActive
                                      ? "bg-primary text-primary-foreground button-shadow"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                  )}
                                >
                                  <div className="flex items-center space-x-3">
                                    <Icon className={cn(
                                      "w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                                    )} />
                                    <span>{item.name}</span>
                                  </div>
                                  {item.subItems && (
                                    <ChevronRight
                                      className={cn(
                                        "w-3.5 h-3.5 transition-transform duration-200",
                                        isActive ? "rotate-90 text-primary-foreground" : "text-muted-foreground/40"
                                      )}
                                    />
                                  )}
                                </Link>

                                {/* Sub Items inside Drawer */}
                                {item.subItems && isActive && (
                                  <ul className="pl-6 pr-1 py-1 space-y-1 mt-0.5 border-l border-sidebar-border ml-5">
                                    {item.subItems.map((sub) => {
                                      const isSubActive = pathname === sub.href;
                                      return (
                                        <li key={sub.name}>
                                          <Link
                                            href={sub.href}
                                            onClick={() => setIsDrawerOpen(false)}
                                            className={cn(
                                              "block py-1.5 px-3 text-[10px] font-bold rounded-lg transition-all cursor-pointer",
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
                )}
              </div>

              {/* Mobile Profile & Logout */}
              {user && (
                <div className="pt-4 border-t border-border/60 px-3 space-y-3 shrink-0">
                  <div className="flex items-center space-x-3">
                    {user.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt={user.user_metadata?.full_name || "Profile"} 
                        className="w-9 h-9 rounded-full object-cover border border-accent/20"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground border border-accent/20">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {user.user_metadata?.full_name || user.email?.split("@")[0]}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold bg-destructive/10 text-destructive hover:bg-destructive/15 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-border/60 text-[10px] text-muted-foreground px-3 flex items-center justify-between mt-4 shrink-0">
                <span>© Sellokart 2026</span>
                <span className="font-bold text-primary/80">v0.1.0</span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
