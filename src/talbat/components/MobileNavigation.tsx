import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  RotateCcw,
  Settings,
  Moon,
  Sun,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileNavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pendingCount: number;
  returnsCount: number;
  onOpenSettings: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  returnsCount,
  onOpenSettings,
  isDarkMode,
  onToggleTheme,
}) => {
  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'الرئيسية',
      icon: LayoutDashboard,
    },
    {
      id: 'orders' as ActiveTab,
      label: 'الطلبات',
      icon: ShoppingBag,
      badge: pendingCount,
    },
    {
      id: 'suppliers' as ActiveTab,
      label: 'الموردين',
      icon: Truck,
    },
    {
      id: 'returns' as ActiveTab,
      label: 'المرتجعات',
      icon: RotateCcw,
      badge: returnsCount,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-2.5 left-2.5 right-2.5 z-40 pb-safe pointer-events-none">
      <nav className="pointer-events-auto bg-canvas/95 backdrop-blur-xl rounded-[22px] border border-line shadow-[0_24px_80px_-30px_rgba(26,18,7,0.18)] px-1.5 py-1 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 will-change-transform ${
                isActive
                  ? 'text-ink font-bold'
                  : 'text-copy-muted hover:text-ink'
              }`}
            >
              {/* Active Tab Background Pill */}
              {isActive && (
                <span className="absolute inset-0 bg-paper-warm rounded-xl border border-line-soft -z-10 animate-in fade-in zoom-in-95 duration-150" />
              )}

              <div className="relative">
                <Icon
                  strokeWidth={1.5}
                  className={`w-5 h-5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    isActive ? 'text-brass scale-105' : 'text-copy-muted'
                  }`}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className="absolute -top-1.5 -left-2 text-[9px] font-cairo font-bold px-1 min-w-[15px] h-[15px] flex items-center justify-center rounded-full text-on-ink shadow-xs bg-pending"
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-0.5 leading-tight ${
                  isActive ? 'font-bold text-ink' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <span className="w-1.5 h-1.5 bg-brass rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-copy-muted transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 hover:text-ink will-change-transform"
            aria-label={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
            title={isDarkMode ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-brass" strokeWidth={1.5} /> : <Moon className="w-5 h-5" strokeWidth={1.5} />}
            <span className="text-[10px] mt-0.5 leading-tight font-medium">
              {isDarkMode ? 'نهاري' : 'ليلي'}
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={onOpenSettings}
          className="relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-copy-muted transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 hover:text-ink will-change-transform"
          aria-label="الإعدادات"
        >
          <Settings className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[10px] mt-0.5 leading-tight font-medium">الإعدادات</span>
        </button>
      </nav>
    </div>
  );
};
