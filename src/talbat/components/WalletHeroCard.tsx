import React, { useState } from 'react';
import { CreditCard, Eye, EyeOff, Sparkles, Luggage, ArrowUpRight, Clock, CheckCircle2, AlertTriangle, RotateCcw, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Order, ReturnItem, ShoppingTrip } from '../types';
import { formatArabicDate, formatCurrency, isOrderLate, isOrderUpcoming, getDaysDifference } from '../utils/helpers';

interface WalletHeroCardProps {
  orders: Order[];
  returns: ReturnItem[];
  trips?: ShoppingTrip[];
  onOpenNewTrip?: () => void;
  onViewOrders?: () => void;
  onViewTrips?: () => void;
}

export const WalletHeroCard: React.FC<WalletHeroCardProps> = ({
  orders,
  returns,
  trips = [],
  onOpenNewTrip,
  onViewOrders,
  onViewTrips,
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [activeCardIndex, setActiveCardIndex] = useState<0 | 1>(0); // 0: Financial Wallet, 1: Upcoming Trip Card

  // Calculations
  const activeOrders = orders.filter((o) => o.status === 'pending');
  const lateOrders = orders.filter((o) => isOrderLate(o));

  const totalOrdersValue = orders.reduce((sum, o) => sum + (o.price || 0), 0);
  const activeOrdersValue = activeOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const totalDeposits = orders.reduce((sum, o) => sum + (o.deposit || 0), 0);
  const activeRemaining = activeOrders.reduce((sum, o) => sum + Math.max(0, (o.price || 0) - (o.deposit || 0)), 0);

  const pendingReturnsValue = returns
    .filter((r) => r.status === 'pending_supplier')
    .reduce((sum, r) => sum + r.price, 0);

  // Next upcoming trip
  const upcomingTrip = trips
    .filter((t) => t.status === 'planned' || t.status === 'in_progress')
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const tripDiff = upcomingTrip ? getDaysDifference(upcomingTrip.date) : null;
  const tripTotalItems = upcomingTrip?.items?.length || 0;
  const tripBoughtItems = upcomingTrip?.items?.filter((i) => i.status === 'bought').length || 0;
  const tripProgress = tripTotalItems > 0 ? Math.round((tripBoughtItems / tripTotalItems) * 100) : 0;

  return (
    <div className="relative w-full">
      {/* Top Card Switcher Pills (Card 1: الحسابات والسيولة / Card 2: رحلة الشراء القادمة) */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-1.5 bg-[#EAE5DA] p-1 rounded-full text-xs">
          <button
            onClick={() => setActiveCardIndex(0)}
            className={`px-3 py-1 rounded-full font-bold transition-all text-xs flex items-center gap-1.5 ${
              activeCardIndex === 0
                ? 'bg-[#1B2E4A] text-white shadow-xs'
                : 'text-[#6C6A63] hover:text-[#1B2E4A]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-[#D3AE72]" />
            <span>محفظة السيولة</span>
          </button>

          {upcomingTrip && (
            <button
              onClick={() => setActiveCardIndex(1)}
              className={`px-3 py-1 rounded-full font-bold transition-all text-xs flex items-center gap-1.5 ${
                activeCardIndex === 1
                  ? 'bg-[#B08948] text-white shadow-xs'
                  : 'text-[#6C6A63] hover:text-[#1B2E4A]'
              }`}
            >
              <Luggage className="w-3.5 h-3.5 text-white" />
              <span>الرحلة القادمة</span>
              {tripDiff !== null && tripDiff <= 3 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          )}
        </div>

        {/* Privacy eye toggle */}
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="flex items-center gap-1 text-xs text-[#6C6A63] hover:text-[#1B2E4A] bg-white/80 hover:bg-white px-2.5 py-1 rounded-full border border-[#DED8CC] transition-colors"
          title={showBalance ? 'إخفاء الأرقام' : 'إظهار الأرقام'}
        >
          {showBalance ? <EyeOff className="w-3.5 h-3.5 text-[#B08948]" /> : <Eye className="w-3.5 h-3.5 text-[#3F7A5D]" />}
          <span className="text-[11px] font-medium hidden sm:inline">
            {showBalance ? 'إخفاء المبالغ' : 'إظهار المبالغ'}
          </span>
        </button>
      </div>

      {/* Main Luxury Wallet Card */}
      {activeCardIndex === 0 ? (
        <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-br from-[#0F1C2E] via-[#1B2E4A] to-[#243B5C] text-white p-5 sm:p-6 shadow-xl border border-[#D3AE72]/30 transition-all duration-300">
          {/* Subtle Decorative Background Shapes & Gold Shimmer */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#B08948]/15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#2C4568]/40 blur-2xl pointer-events-none" />
          
          {/* Card Geometric Lines Watermark */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#D3AE72_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Top Row: Store Branding & Chip */}
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D3AE72] to-[#B08948] flex items-center justify-center font-extrabold text-white font-cairo shadow-sm text-sm">
                د
              </div>
              <div>
                <span className="text-xs font-bold tracking-wide text-[#EAE1D2] font-cairo block">
                  دفتر ملابس • الحسابات
                </span>
                <span className="text-[10px] text-[#A6B8CE]">
                  المحفظة والسيولة النقدية
                </span>
              </div>
            </div>

            {/* Simulated Gold EMV Chip & Contactless Waves */}
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-[#D3AE72]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8.5 16.5a5 5 0 0 1 0-9" strokeLinecap="round" />
                <path d="M12 19a8.5 8.5 0 0 1 0-14" strokeLinecap="round" />
                <path d="M15.5 21.5a12 12 0 0 1 0-19" strokeLinecap="round" />
              </svg>
              <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-[#C99E54] via-[#F2D79E] to-[#B08948] shadow-inner border border-[#FFE7B8]/40 flex items-center justify-center">
                <div className="w-6 h-4 border border-[#8C6422]/40 rounded-xs grid grid-cols-2 gap-0.5 opacity-60">
                  <div className="border-b border-r border-[#8C6422]/40"></div>
                  <div className="border-b border-[#8C6422]/40"></div>
                  <div className="border-r border-[#8C6422]/40"></div>
                  <div></div>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Section */}
          <div className="relative z-10 my-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#D9DEE7]">
                إجمالي قيمة الطلبيات النشطة
              </span>
              {lateOrders.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#B4463A]/90 text-white animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{lateOrders.length} متأخرة</span>
                </span>
              )}
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold font-cairo tracking-tight text-white mt-1">
              {showBalance ? (
                <span className="flex items-baseline gap-1.5">
                  <span>{formatCurrency(activeOrdersValue).replace(' ج.م', '')}</span>
                  <span className="text-base sm:text-lg font-bold text-[#D3AE72]">ج.م</span>
                </span>
              ) : (
                <span className="tracking-widest text-[#D3AE72]">••••••••</span>
              )}
            </div>

            <p className="text-[11px] text-[#A6B8CE] mt-0.5">
              {activeOrders.length} طلبيات قيد التنفيذ والتوريد من الموردين
            </p>
          </div>

          {/* Bottom Card Micro-Stats (Deposits, Remaining, Returns) */}
          <div className="relative z-10 pt-3 mt-4 border-t border-white/10 grid grid-cols-3 gap-2">
            {/* Deposits */}
            <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs border border-white/5">
              <div className="flex items-center gap-1 text-[10px] text-[#A6B8CE] mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3F7A5D]" />
                <span>عربون محصّل</span>
              </div>
              <div className="text-xs sm:text-sm font-bold font-cairo text-[#62B889]">
                {showBalance ? formatCurrency(totalDeposits) : '••••'}
              </div>
            </div>

            {/* Remaining */}
            <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs border border-white/5">
              <div className="flex items-center gap-1 text-[10px] text-[#A6B8CE] mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D3AE72]" />
                <span>متبقي عند الاستلام</span>
              </div>
              <div className="text-xs sm:text-sm font-bold font-cairo text-[#F2D79E]">
                {showBalance ? formatCurrency(activeRemaining) : '••••'}
              </div>
            </div>

            {/* Pending Returns */}
            <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs border border-white/5">
              <div className="flex items-center gap-1 text-[10px] text-[#A6B8CE] mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E07A6E]" />
                <span>مرتجع معلق</span>
              </div>
              <div className="text-xs sm:text-sm font-bold font-cairo text-[#F4A89F]">
                {showBalance ? formatCurrency(pendingReturnsValue) : '••••'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Upcoming Shopping Trip Card */
        <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-br from-[#1E293B] via-[#2A374E] to-[#1B2E4A] text-white p-5 sm:p-6 shadow-xl border border-[#B08948]/40 transition-all duration-300">
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[#B08948]/20 blur-2xl pointer-events-none" />

          {/* Top Row: Trip Badge */}
          <div className="relative z-10 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#B08948] text-white flex items-center justify-center shadow-sm">
                <Luggage className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#EAE1D2] font-cairo block">
                  رحلة التسوق والتوريد القادمة
                </span>
                <span className="text-[10px] text-[#D3AE72] font-semibold">
                  {upcomingTrip ? upcomingTrip.destination : 'لا توجد رحلات مجدولة'}
                </span>
              </div>
            </div>

            {tripDiff !== null && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                tripDiff <= 1
                  ? 'bg-amber-500 text-black animate-pulse'
                  : 'bg-[#B08948]/40 text-[#F2D79E] border border-[#D3AE72]/30'
              }`}>
                {tripDiff === 0 ? 'اليوم بالسوق!' : tripDiff === 1 ? 'غداً' : `بعد ${tripDiff} أيام`}
              </span>
            )}
          </div>

          {upcomingTrip ? (
            <div className="relative z-10 my-2">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl sm:text-2xl font-extrabold font-cairo text-white">
                  {upcomingTrip.title}
                </h3>
                <span className="text-xs text-[#A6B8CE]">
                  {formatArabicDate(upcomingTrip.date)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#D9DEE7]">
                  <span>نسبة إنجاز وشراء القطع:</span>
                  <span className="font-bold text-[#D3AE72] font-cairo">
                    {tripBoughtItems} من {tripTotalItems} قطعة ({tripProgress}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#B08948] to-[#D3AE72] rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, tripProgress)}%` }}
                  />
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-[#A6B8CE]">
                  {tripTotalItems - tripBoughtItems} قطع متبقية للشراء
                </span>
                <button
                  onClick={onViewTrips}
                  className="inline-flex items-center gap-1 text-xs font-bold bg-[#B08948] hover:bg-[#C99E54] text-white px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                >
                  <span>فتح شيك ليست الرحلة</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative z-10 py-6 text-center">
              <p className="text-sm text-[#D9DEE7]">لا توجد رحلة شراء مجدولة حالياً</p>
              <button
                onClick={onOpenNewTrip}
                className="mt-3 inline-flex items-center gap-1.5 bg-[#B08948] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold"
              >
                <Luggage className="w-3.5 h-3.5" />
                <span>جدولة رحلة شراء جديدة</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
