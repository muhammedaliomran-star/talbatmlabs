import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Luggage,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileNavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pendingCount: number;
  lateCount: number;
  returnsCount: number;
  tripsCount?: number;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  lateCount,
  returnsCount,
  tripsCount,
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
      badgeDanger: lateCount > 0,
    },
    {
      id: 'trips' as ActiveTab,
      label: 'الرحلات',
      icon: Luggage,
      badge: tripsCount,
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
      <nav className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-[22px] border border-[#DED8CC] shadow-2xl px-1.5 py-1 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-[#1B2E4A] font-bold'
                  : 'text-[#6C6A63] hover:text-[#1B2E4A]'
              }`}
            >
              {/* Active Tab Background Pill */}
              {isActive && (
                <span className="absolute inset-0 bg-[#FAF6EF] rounded-xl border border-[#EAE1D2] -z-10 animate-in fade-in zoom-in-95 duration-150" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'text-[#B08948] scale-105' : 'text-[#6C6A63]'
                  }`}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`absolute -top-1.5 -left-2 text-[9px] font-cairo font-bold px-1 min-w-[15px] h-[15px] flex items-center justify-center rounded-full text-white shadow-xs ${
                      tab.badgeDanger ? 'bg-[#B4463A]' : 'bg-[#B8792A]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-0.5 leading-tight ${
                  isActive ? 'font-bold text-[#1B2E4A]' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <span className="w-1.5 h-1.5 bg-[#B08948] rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
