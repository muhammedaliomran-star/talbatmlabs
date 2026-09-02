import React from 'react';
import { Plus, Luggage, RotateCcw, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      color: 'bg-ink hover:bg-ink-light text-on-ink',
      iconColor: 'text-brass-light',
      border: 'border-ink-light/40',
      badge: null,
      onClick: onOpenNewOrder,
      highlight: true,
    },
    {
      id: 'new-trip',
      title: 'رحلة شراء',
      subtitle: 'سفرية السوق',
      icon: Luggage,
      color: 'bg-brass hover:bg-brass/85 text-on-ink',
      iconColor: 'text-on-ink',
      border: 'ring-brass/25',
      badge: null,
      onClick: onOpenNewTrip,
      highlight: false,
    },
    {
      id: 'new-return',
      title: 'تسجيل مرتجع',
      subtitle: 'استبدال/استرداد',
      icon: RotateCcw,
      color: 'bg-late-soft hover:bg-late-soft/70 text-late',
      iconColor: 'text-late',
      border: 'ring-late/20',
      badge: null,
      onClick: onOpenNewReturn,
      highlight: false,
    },
    {
      id: 'trip-print',
      title: 'كشف السفر',
      subtitle: 'طباعة/PDF',
      icon: FileSpreadsheet,
      color: 'bg-done-soft hover:bg-done-soft/70 text-done',
      iconColor: 'text-done',
      border: 'ring-done/20',
      badge: null,
      onClick: onOpenTripPrint,
      highlight: false,
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Button
              variant="ghost"
              key={act.id}
              onClick={act.onClick}
              className={`group h-32 flex-col rounded-[1.4rem] p-3 ring-1 duration-700 motion-spring hover:-translate-y-1 sm:h-36 ${act.color} ${act.border}`}
            >
              <div className="relative mb-1 sm:mb-1.5">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform duration-500 motion-spring group-hover:-translate-y-px group-hover:translate-x-1 group-hover:scale-105 ${
                  act.highlight ? 'bg-canvas/10' : 'bg-current/10'
                }`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${act.iconColor}`} />
                </div>
              </div>
              <span className="text-xs sm:text-sm font-bold font-cairo text-center leading-tight">
                {act.title}
              </span>
              <span className={`text-[10px] hidden sm:block mt-0.5 leading-none ${
                act.highlight ? 'text-on-ink/70' : 'opacity-80'
              }`}>
                {act.subtitle}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
