import React, { useState } from 'react';
import { Plus, Download, Truck, RotateCcw, LayoutDashboard, ShoppingBag, Lock } from 'lucide-react';
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
  lateCount: number;
  currentUser?: User | null;
  onOpenProfile?: () => void;
  onLockScreen?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewOrder,
  onOpenNewSupplier,
  onOpenNewReturn,
  onOpenBackup,
  pendingCount,
  lateCount,
  currentUser,
  onOpenProfile,
  onLockScreen,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'orders' as ActiveTab, label: 'الطلبات', icon: ShoppingBag, badge: pendingCount },
    { id: 'suppliers' as ActiveTab, label: 'الموردين', icon: Truck },
    { id: 'returns' as ActiveTab, label: 'المرتجعات', icon: RotateCcw },
  ];

  return (
    <header className="sticky top-3 z-40 px-3 text-on-ink md:top-5">
      <div className="mx-auto max-w-7xl rounded-full bg-ink/96 px-3 shadow-[0_18px_50px_-28px_var(--ink)] ring-1 ring-on-ink/10 backdrop-blur-2xl sm:px-4">
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
                <span className="font-cairo font-extrabold text-xl tracking-tight text-on-ink max-w-[180px] truncate">
                  {currentUser?.storeName || 'دَفْتَر'}
                </span>
                <span className="text-[11px] bg-ink-light text-brass-light font-semibold px-2 py-0.5 rounded-full border border-brass/30">
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
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`text-[11px] font-cairo font-bold px-1.5 py-0.2 rounded-full ${
                        lateCount > 0 && tab.id === 'orders'
                          ? 'bg-late text-on-ink font-bold'
                          : 'bg-ink-light text-on-ink'
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
              variant="ghost" size="icon" className="hidden size-9 bg-ink-light text-ink-muted hover:bg-ink-light hover:text-on-ink sm:inline-flex"
              title="نسخ احتياطي وتصدير"
            >
              <Download className="w-4 h-4" />
            </Button>

            {/* Lock screen quick button */}
            {onLockScreen && (
              <Button
                onClick={onLockScreen}
                variant="ghost" size="icon" className="hidden size-9 bg-ink-light text-ink-muted hover:bg-ink-light hover:text-on-ink lg:inline-flex"
                title="قفل التطبيق مؤقتاً"
              >
                <Lock className="w-4 h-4" />
              </Button>
            )}

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
                      : 'bg-ink-light'
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
              className="group h-10 bg-brass px-2 pr-3 text-xs font-bold text-on-ink hover:bg-brass/85 sm:px-2 sm:pr-4 sm:text-sm"
            >
              <span className="hidden xs:inline">طلب جديد</span>
              <span className="grid size-7 place-items-center rounded-full bg-on-ink/15 transition-transform duration-500 motion-spring group-hover:-translate-y-px group-hover:translate-x-1 group-hover:scale-105"><Plus className="size-4" /></span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="relative size-10 bg-ink-light text-on-ink hover:bg-ink-light md:hidden"
            >
              <span className={`absolute h-px w-4 bg-current transition-transform duration-500 motion-spring ${menuOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
              <span className={`absolute h-px w-4 bg-current transition-opacity duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute h-px w-4 bg-current transition-transform duration-500 motion-spring ${menuOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
            </Button>
          </div>
        </div>
      </div>
      <div className={`fixed inset-0 top-0 -z-10 bg-ink/92 px-4 pt-28 backdrop-blur-3xl transition-all duration-700 motion-spring md:hidden ${menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
        <nav className="mx-auto flex max-w-sm flex-col gap-2">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <Button key={tab.id} variant="ghost" onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }} className={`h-16 justify-between bg-on-ink/5 px-5 text-lg text-on-ink ring-1 ring-on-ink/10 hover:bg-on-ink/10 transition-all duration-700 motion-spring ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`} style={{ transitionDelay: `${100 + index * 55}ms` }}>
                <span className="flex items-center gap-3"><Icon className="size-5 text-brass-light" />{tab.label}</span>
                {tab.badge ? <span className="rounded-full bg-brass px-2 text-xs">{tab.badge}</span> : null}
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
