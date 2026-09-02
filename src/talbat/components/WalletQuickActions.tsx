import React from 'react';
import { Plus, Luggage, RotateCcw, FileSpreadsheet, Sparkles, MessageSquare, Download } from 'lucide-react';

interface WalletQuickActionsProps {
  onOpenNewOrder: () => void;
  onOpenNewTrip: () => void;
  onOpenNewReturn: () => void;
  onOpenTripPrint: () => void;
  pendingCount?: number;
  lateCount?: number;
}

export const WalletQuickActions: React.FC<WalletQuickActionsProps> = ({
  onOpenNewOrder,
  onOpenNewTrip,
  onOpenNewReturn,
  onOpenTripPrint,
  pendingCount = 0,
  lateCount = 0,
}) => {
  const actions = [
    {
      id: 'new-order',
      title: 'طلب جديد',
      subtitle: 'حجز للعميل',
      icon: Plus,
      color: 'bg-[#1B2E4A] hover:bg-[#2A4266] text-white',
      iconColor: 'text-[#D3AE72]',
      border: 'border-[#2C4568]/40',
      badge: null,
      onClick: onOpenNewOrder,
      highlight: true,
    },
    {
      id: 'new-trip',
      title: 'رحلة شراء',
      subtitle: 'سفرية السوق',
      icon: Luggage,
      color: 'bg-[#B08948] hover:bg-[#9E783B] text-white',
      iconColor: 'text-white',
      border: 'border-[#9E783B]/50',
      badge: null,
      onClick: onOpenNewTrip,
      highlight: false,
    },
    {
      id: 'new-return',
      title: 'تسجيل مرتجع',
      subtitle: 'استبدال/استرداد',
      icon: RotateCcw,
      color: 'bg-[#FFF5F4] hover:bg-[#FEECEB] text-[#B4463A]',
      iconColor: 'text-[#B4463A]',
      border: 'border-[#F4D1CD]',
      badge: null,
      onClick: onOpenNewReturn,
      highlight: false,
    },
    {
      id: 'trip-print',
      title: 'كشف السفر',
      subtitle: 'طباعة/PDF',
      icon: FileSpreadsheet,
      color: 'bg-[#F2F8F4] hover:bg-[#E3F2E7] text-[#3F7A5D]',
      iconColor: 'text-[#3F7A5D]',
      border: 'border-[#CDE3D5]',
      badge: null,
      onClick: onOpenTripPrint,
      highlight: false,
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={act.onClick}
              className={`group flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-[18px] sm:rounded-[22px] transition-all duration-200 border active:scale-95 shadow-xs hover:shadow-md ${act.color} ${act.border}`}
            >
              <div className="relative mb-1 sm:mb-1.5">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${
                  act.highlight ? 'bg-white/10' : 'bg-current/10'
                }`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${act.iconColor}`} />
                </div>
              </div>
              <span className="text-xs sm:text-sm font-bold font-cairo text-center leading-tight">
                {act.title}
              </span>
              <span className={`text-[10px] hidden sm:block mt-0.5 leading-none ${
                act.highlight ? 'text-white/70' : 'opacity-80'
              }`}>
                {act.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
