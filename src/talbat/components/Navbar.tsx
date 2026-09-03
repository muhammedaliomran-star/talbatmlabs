import React, { useState } from 'react';
import { Plus, Download, Truck, RotateCcw, LayoutDashboard, ShoppingBag, Moon, Sun, Menu, X } from 'lucide-react';
import { ActiveTab, User } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewOrder: () => void;
  onOpenNewSupplier: () => void;
  onOpenNewReturn: () => void;
  onOpenBackup: () => void;
  pendingCount: number;
  currentUser?: User | null;
  onOpenProfile?: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewOrder,
  onOpenNewSupplier,
  onOpenNewReturn,
  onOpenBackup,
  pendingCount,
  currentUser,
  onOpenProfile,
  isDarkMode,
  onToggleTheme,
}) => {
  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'orders' as ActiveTab, label: 'الطلبات', icon: ShoppingBag, badge: pendingCount },
    { id: 'suppliers' as ActiveTab, label: 'الموردين', icon: Truck },
    { id: 'returns' as ActiveTab, label: 'المرتجعات', icon: RotateCcw },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-3 z-40 px-3 text-on-ink md:top-5">
      <div className="mx-auto max-w-7xl rounded-full bg-ink-deep/96 px-3 shadow-[0_18px_50px_-28px_var(--ink)] ring-1 ring-on-ink/10 backdrop-blur-2xl sm:px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Store Title */}
          <div className="flex items-center gap-3">
            {currentUser?.logoUrl ? (
              <img
                src={currentUser.logoUrl}
                alt={currentUser.storeName || 'شعار المتجر'}
                className="size-10 rounded-full object-cover ring-1 ring-brass/50 shadow-inner"
              />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-full bg-brass font-cairo text-xl font-extrabold text-on-ink shadow-inner">
                {(currentUser?.storeName || 'دَفْتَر').trim().charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-palestine font-extrabold text-xl tracking-tight text-on-ink max-w-[180px] truncate">
                  {currentUser?.storeName || 'دَفْتَر'}
                </span>
                <span className="text-[11px] bg-brass text-on-ink font-semibold px-2 py-0.5 rounded-full border border-brass/30">
                  دَفْتَر
                </span>
              </div>
              <p className="text-[11px] text-ink-muted hidden sm:block">
                إدارة طلبات العملاء والموردين والمرتجعات
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-1 rounded-full bg-ink-deep p-1 ring-1 ring-ink-light/60 md:flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant="ghost"
                  className={`h-9 gap-2 px-3.5 text-sm font-semibold duration-500 motion-spring ${
                    isActive
                      ? 'bg-brass text-on-ink shadow-xs'
                      : 'text-ink-muted hover:text-on-ink hover:bg-ink-light/50'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`text-[11px] font-cairo font-bold px-1.5 py-0.2 rounded-full ${
                        'bg-brass text-on-ink'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </Button>
              );
            })}
          </nav>

          {/* Action buttons & User Profile */}
          <div className="flex items-center gap-2">
            <PWAInstallButton />

            <Button
              onClick={onOpenBackup}
              variant="ghost" size="icon" className="hidden size-9 bg-white/10 text-on-ink hover:bg-white/15 hover:text-white sm:inline-flex"
              title="نسخ احتياطي وتصدير"
            >
              <Download className="w-4 h-4" strokeWidth={1.5} />
            </Button>

            <Button
              onClick={onToggleTheme}
              variant="ghost"
              size="icon"
              className="relative hidden md:inline-flex size-9 rounded-full bg-white/10 text-on-ink hover:bg-white/15 hover:text-white transition-colors overflow-hidden"
              title={isDarkMode ? 'تفعيل الوضع النهاري ☀️' : 'تفعيل الوضع الليلي 🌙'}
              aria-label={isDarkMode ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
            >
              <span className="relative flex items-center justify-center transition-transform duration-300">
                {isDarkMode ? (
                  <Sun className="w-4 h-4 animate-in spin-in-180 duration-300" />
                ) : (
                  <Moon className="w-4 h-4 animate-in zoom-in-50 duration-300" />
                )}
              </span>
            </Button>

            {/* User Profile Avatar Pill */}
            {currentUser && onOpenProfile && (
              <Button
                onClick={onOpenProfile}
                variant="ghost" className="hidden h-10 gap-2 bg-ink-deep px-2.5 text-right ring-1 ring-ink-light hover:bg-ink-light lg:flex"
                title="الملف التعريفي للمتجر والحساب"
              >
                <div
                  className={`w-7 h-7 rounded-lg text-on-ink font-bold font-cairo text-xs flex items-center justify-center ${
                    currentUser.role === 'owner'
                      ? 'bg-brass'
                      : currentUser.role === 'buyer'
                      ? 'bg-done'
                      : 'bg-white/15'
                  }`}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-bold text-on-ink leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-brass-light leading-tight">
                    {currentUser.role === 'owner'
                      ? 'صاحب المتجر'
                      : currentUser.role === 'buyer'
                      ? 'مشتريات'
                      : 'مساعد'}
                  </div>
                </div>
              </Button>
            )}

            <Button
              onClick={onOpenNewOrder}
              className="group hidden h-10 bg-brass px-2 pr-3 text-xs font-bold text-on-ink hover:bg-brass/85 md:inline-flex md:px-2 md:pr-4 md:text-sm"
            >
              <span className="hidden xs:inline">طلب جديد</span>
              <span className="grid size-7 place-items-center rounded-full bg-on-ink/15 transition-transform duration-500 motion-spring group-hover:-translate-y-px group-hover:translate-x-1 group-hover:scale-105"><Plus className="size-4" strokeWidth={1.7} /></span>
            </Button>

            <Button
              onClick={onToggleTheme}
              variant="ghost"
              size="icon"
              className="size-10 rounded-full bg-white/10 text-on-ink hover:bg-white/15 md:hidden"
              title={isDarkMode ? 'تفعيل الوضع النهاري ☀️' : 'تفعيل الوضع الليلي 🌙'}
              aria-label={isDarkMode ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
            >
              {isDarkMode ? <Sun className="size-4" strokeWidth={1.5} /> : <Moon className="size-4" strokeWidth={1.5} />}
            </Button>

            {/* Hamburger Morph - Mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="grid md:hidden size-10 place-items-center rounded-full bg-white/10 text-on-ink hover:bg-white/15 transition-colors"
              aria-label="القائمة"
            >
              <span className="relative flex flex-col items-center justify-center gap-1.5">
                <span className={`block h-0.5 w-4 bg-current rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block h-0.5 w-4 bg-current rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100'}`} />
                <span className={`block h-0.5 w-4 bg-current rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Fluid Island Modal - Mobile */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-ink-deep/80 backdrop-blur-3xl md:hidden">
          <div className="flex h-16 items-center justify-between px-6 py-4">
            <span className="font-cairo font-extrabold text-lg text-on-ink">القائمة</span>
            <button onClick={() => setIsMenuOpen(false)} className="grid size-10 place-items-center rounded-full bg-white/10 text-on-ink">
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
          <nav className="flex flex-1 flex-col justify-center gap-3 px-6 pb-12">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setIsMenuOpen(false); }}
                  style={{ transitionDelay: `${100 + idx * 60}ms` }}
                  className={`flex items-center gap-4 rounded-[1.5rem] px-6 py-5 text-lg font-bold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform ${isActive ? 'bg-brass text-on-ink shadow-lg' : 'bg-white/5 text-on-ink/80 hover:bg-white/10 hover:text-on-ink'}`}
                >
                  <Icon className="w-6 h-6" strokeWidth={1.5} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && <span className="ml-auto rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold">{tab.badge}</span>}
                </button>
              );
            })}
            <div className="mt-6 flex gap-3">
              <button onClick={onOpenNewOrder} className="flex-1 rounded-full bg-brass py-4 text-sm font-bold text-on-ink">طلب جديد</button>
              <button onClick={onOpenBackup} className="rounded-full bg-white/10 px-6 py-4 text-sm font-bold text-on-ink ring-1 ring-white/10">نسخ احتياطي</button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
