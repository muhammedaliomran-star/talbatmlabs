import React from 'react';
import { Plus, Download, RefreshCw, Layers, Truck, RotateCcw, LayoutDashboard, ShoppingBag, Luggage, Lock, User as UserIcon } from 'lucide-react';
import { ActiveTab, User } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewOrder: () => void;
  onOpenNewSupplier: () => void;
  onOpenNewReturn: () => void;
  onOpenBackup: () => void;
  pendingCount: number;
  lateCount: number;
  tripsCount?: number;
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
  tripsCount,
  currentUser,
  onOpenProfile,
  onLockScreen,
}) => {
  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'orders' as ActiveTab, label: 'الطلبات', icon: ShoppingBag, badge: pendingCount },
    { id: 'trips' as ActiveTab, label: 'رحلات الشراء', icon: Luggage, badge: tripsCount },
    { id: 'suppliers' as ActiveTab, label: 'الموردين', icon: Truck },
    { id: 'returns' as ActiveTab, label: 'المرتجعات', icon: RotateCcw },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#1B2E4A] text-white shadow-md border-b border-[#2C4568]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Store Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B08948] text-white flex items-center justify-center font-cairo font-extrabold text-xl shadow-inner tracking-wider">
              د
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cairo font-extrabold text-xl tracking-tight text-white">
                  دَفْتَر
                </span>
                <span className="text-[11px] bg-[#2C4568] text-[#D3AE72] font-semibold px-2 py-0.5 rounded-full border border-[#B08948]/30 max-w-[150px] truncate">
                  {currentUser?.storeName || 'محل ملابس'}
                </span>
              </div>
              <p className="text-[11px] text-[#D9DEE7] hidden sm:block">
                إدارة طلبات العملاء، الموردين ومواعيد السفر
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#142338] p-1 rounded-xl border border-[#2C4568]/60">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#B08948] text-white shadow-xs'
                      : 'text-[#D9DEE7] hover:text-white hover:bg-[#2C4568]/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`text-[11px] font-cairo font-bold px-1.5 py-0.2 rounded-full ${
                        lateCount > 0 && tab.id === 'orders'
                          ? 'bg-[#B4463A] text-white font-bold'
                          : 'bg-[#2C4568] text-white'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action buttons & User Profile */}
          <div className="flex items-center gap-2">
            <PWAInstallButton />

            <button
              onClick={onOpenBackup}
              className="p-2 rounded-lg bg-[#2C4568] hover:bg-[#395782] text-[#D9DEE7] hover:text-white transition-colors"
              title="نسخ احتياطي وتصدير"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Lock screen quick button */}
            {onLockScreen && (
              <button
                onClick={onLockScreen}
                className="p-2 rounded-lg bg-[#2C4568] hover:bg-[#395782] text-[#D9DEE7] hover:text-white transition-colors"
                title="قفل التطبيق مؤقتاً"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}

            {/* User Profile Avatar Pill */}
            {currentUser && onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 bg-[#142338] hover:bg-[#2C4568] border border-[#2C4568] px-2.5 py-1.5 rounded-xl transition-all text-right"
                title="الملف التعريفي للمتجر والحساب"
              >
                <div
                  className={`w-7 h-7 rounded-lg text-white font-bold font-cairo text-xs flex items-center justify-center ${
                    currentUser.role === 'owner'
                      ? 'bg-[#B08948]'
                      : currentUser.role === 'buyer'
                      ? 'bg-[#3F7A5D]'
                      : 'bg-[#2C4568]'
                  }`}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-bold text-white leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-[#D3AE72] leading-tight">
                    {currentUser.role === 'owner'
                      ? 'صاحب المتجر'
                      : currentUser.role === 'buyer'
                      ? 'مشتريات'
                      : 'مساعد'}
                  </div>
                </div>
              </button>
            )}

            <button
              onClick={onOpenNewOrder}
              className="flex items-center gap-1.5 bg-[#B08948] hover:bg-[#9E783B] active:scale-98 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">طلب جديد</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
