"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  HelpCircle,
  BarChart3,
  Settings,
  FolderTree,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Bell,
  Search,
  ChevronRight,
  FileText,
} from "lucide-react";
import { logout, getUser, PublicUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: "Soon";
}

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Stickers", href: "/admin/stickers", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Blogs", href: "/admin/blogs", icon: FileText },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
  { label: "Keywords", href: "/admin/keywords", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<PublicUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Skip the layout on /admin/login itself
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoadingUser(false);
      return;
    }
    let mounted = true;
    getUser(true).then((u) => {
      if (mounted) {
        setAdmin(u);
        setLoadingUser(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [isLoginPage, pathname]);

  if (isLoginPage) return <>{children}</>;

  const handleLogout = async () => {
    await logout(true);
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-gray-200 flex">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#161A21] border-r border-white/5 z-50 flex flex-col transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-shop-yellow rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tighter uppercase text-white leading-none">
                Sticker<span className="text-shop-yellow">Flix</span>
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">
                Admin Panel
              </p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            const disabled = item.badge === "Soon";
            const content = (
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group",
                  active
                    ? "bg-shop-yellow/10 text-shop-yellow"
                    : disabled
                    ? "text-gray-600 cursor-not-allowed"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
                {active && !disabled && (
                  <ChevronRight className="w-3.5 h-3.5 text-shop-yellow" />
                )}
              </div>
            );
            return disabled ? (
              <div key={item.href}>{content}</div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
              >
                {content}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: admin info + logout */}
        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-shop-yellow/20 flex items-center justify-center text-shop-yellow font-black uppercase text-xs">
              {admin?.name?.charAt(0) ?? "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-white truncate">
                {admin?.name ?? "Admin"}
              </p>
              <p className="text-[10px] text-gray-500 truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all mt-1"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Main area ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0F1115]/80 backdrop-blur border-b border-white/5 px-4 md:px-8 py-4 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white p-1"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search…"
              className="w-full pl-11 pr-4 py-2 bg-[#161A21] rounded-xl text-sm text-white placeholder-gray-500 outline-none border-2 border-white/5 focus:border-shop-yellow/50 transition-colors"
            />
          </div>

          <div className="flex-1 sm:hidden" />

          <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-shop-yellow rounded-full" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8">
          {loadingUser ? (
            <div className="flex items-center justify-center py-20 text-gray-500 text-xs font-black uppercase tracking-widest">
              Loading…
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
