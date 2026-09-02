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
        <div className="flex items-center gap-1.5 bg-paper-alt p-1 rounded-full text-xs">
          <button
            onClick={() => setActiveCardIndex(0)}
            className={`px-3 py-1 rounded-full font-bold transition-all text-xs flex items-center gap-1.5 ${
              activeCardIndex === 0
                ? 'bg-ink text-on-ink shadow-xs'
                : 'text-copy-muted hover:text-ink'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-brass-light" />
            <span>محفظة السيولة</span>
          </button>

          {upcomingTrip && (
            <button
              onClick={() => setActiveCardIndex(1)}
              className={`px-3 py-1 rounded-full font-bold transition-all text-xs flex items-center gap-1.5 ${
                activeCardIndex === 1
                  ? 'bg-brass text-on-ink shadow-xs'
                  : 'text-copy-muted hover:text-ink'
              }`}
            >
              <Luggage className="w-3.5 h-3.5 text-on-ink" />
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
          className="flex items-center gap-1 text-xs text-copy-muted hover:text-ink bg-canvas/80 hover:bg-canvas px-2.5 py-1 rounded-full border border-line transition-colors"
          title={showBalance ? 'إخفاء الأرقام' : 'إظهار الأرقام'}
        >
          {showBalance ? <EyeOff className="w-3.5 h-3.5 text-brass" /> : <Eye className="w-3.5 h-3.5 text-done" />}
          <span className="text-[11px] font-medium hidden sm:inline">
            {showBalance ? 'إخفاء المبالغ' : 'إظهار المبالغ'}
          </span>
        </button>
      </div>

      {/* Main Luxury Wallet Card */}
      {activeCardIndex === 0 ? (
        <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-br from-ink-deep via-ink to-ink-light text-on-ink p-5 sm:p-6 shadow-xl border border-brass-light/30 transition-all duration-300">
          {/* Subtle Decorative Background Shapes & Gold Shimmer */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-brass/15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-ink-light/40 blur-2xl pointer-events-none" />
          
          {/* Card Geometric Lines Watermark */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#D3AE72_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Top Row: Store Branding & Chip */}
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brass-light to-brass flex items-center justify-center font-extrabold text-on-ink font-cairo shadow-sm text-sm">
                د
              </div>
              <div>
                <span className="text-xs font-bold tracking-wide text-line-soft font-cairo block">
                  دفتر ملابس • الحسابات
                </span>
                <span className="text-[10px] text-ink-muted">
                  المحفظة والسيولة النقدية
                </span>
              </div>
            </div>

            {/* Simulated Gold EMV Chip & Contactless Waves */}
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-brass-light/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8.5 16.5a5 5 0 0 1 0-9" strokeLinecap="round" />
                <path d="M12 19a8.5 8.5 0 0 1 0-14" strokeLinecap="round" />
                <path d="M15.5 21.5a12 12 0 0 1 0-19" strokeLinecap="round" />
              </svg>
              <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-brass-light via-brass-light to-brass shadow-inner border border-brass-light/40 flex items-center justify-center">
                <div className="w-6 h-4 border border-pending/40 rounded-xs grid grid-cols-2 gap-0.5 opacity-60">
                  <div className="border-b border-r border-pending/40"></div>
                  <div className="border-b border-pending/40"></div>
                  <div className="border-r border-pending/40"></div>
                  <div></div>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Section */}
          <div className="relative z-10 my-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-muted">
                إجمالي قيمة الطلبيات النشطة
              </span>
              {lateOrders.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-late/90 text-on-ink animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{lateOrders.length} متأخرة</span>
                </span>
              )}
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold font-cairo tracking-tight text-on-ink mt-1">
              {showBalance ? (
                <span className="flex items-baseline gap-1.5">
                  <span>{formatCurrency(activeOrdersValue).replace(' ج.م', '')}</span>
                  <span className="text-base sm:text-lg font-bold text-brass-light">ج.م</span>
                </span>
              ) : (
                <span className="tracking-widest text-brass-light">••••••••</span>
              )}
            </div>

            <p className="text-[11px] text-ink-muted mt-0.5">
              {activeOrders.length} طلبيات قيد التنفيذ والتوريد من الموردين
            </p>
          </div>

          {/* Bottom Card Micro-Stats (Deposits, Remaining, Returns) */}
          <div className="relative z-10 pt-3 mt-4 border-t border-on-ink/10 grid grid-cols-3 gap-2">
            {/* Deposits */}
            <div className="bg-canvas/5 rounded-xl p-2.5 backdrop-blur-xs border border-on-ink/5">
              <div className="flex items-center gap-1 text-[10px] text-ink-muted mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-done" />
                <span>عربون محصّل</span>
              </div>
              <div className="text-xs sm:text-sm font-bold font-cairo text-done">
                {showBalance ? formatCurrency(totalDeposits) : '••••'}
              </div>
            </div>

            {/* Remaining */}
            <div className="bg-canvas/5 rounded-xl p-2.5 backdrop-blur-xs border border-on-ink/5">
              <div className="flex items-center gap-1 text-[10px] text-ink-muted mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brass-light" />
                <span>متبقي عند الاستلام</span>
              </div>
              <div className="text-xs sm:text-sm font-bold font-cairo text-brass-light">
                {showBalance ? formatCurrency(activeRemaining) : '••••'}
              </div>
            </div>

            {/* Pending Returns */}
            <div className="bg-canvas/5 rounded-xl p-2.5 backdrop-blur-xs border border-on-ink/5">
              <div className="flex items-center gap-1 text-[10px] text-ink-muted mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-late" />
                <span>مرتجع معلق</span>
              </div>
              <div className="text-xs sm:text-sm font-bold font-cairo text-late">
                {showBalance ? formatCurrency(pendingReturnsValue) : '••••'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Upcoming Shopping Trip Card */
        <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-br from-ink-deep via-ink-light to-ink text-on-ink p-5 sm:p-6 shadow-xl border border-brass/40 transition-all duration-300">
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-brass/20 blur-2xl pointer-events-none" />

          {/* Top Row: Trip Badge */}
          <div className="relative z-10 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brass text-on-ink flex items-center justify-center shadow-sm">
                <Luggage className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-line-soft font-cairo block">
                  رحلة التسوق والتوريد القادمة
                </span>
                <span className="text-[10px] text-brass-light font-semibold">
                  {upcomingTrip ? upcomingTrip.destination : 'لا توجد رحلات مجدولة'}
                </span>
              </div>
            </div>

            {tripDiff !== null && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                tripDiff <= 1
                  ? 'bg-amber-500 text-black animate-pulse'
                  : 'bg-brass/40 text-brass-light border border-brass-light/30'
              }`}>
                {tripDiff === 0 ? 'اليوم بالسوق!' : tripDiff === 1 ? 'غداً' : `بعد ${tripDiff} أيام`}
              </span>
            )}
          </div>

          {upcomingTrip ? (
            <div className="relative z-10 my-2">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl sm:text-2xl font-extrabold font-cairo text-on-ink">
                  {upcomingTrip.title}
                </h3>
                <span className="text-xs text-ink-muted">
                  {formatArabicDate(upcomingTrip.date)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>نسبة إنجاز وشراء القطع:</span>
                  <span className="font-bold text-brass-light font-cairo">
                    {tripBoughtItems} من {tripTotalItems} قطعة ({tripProgress}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-canvas/10 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-brass to-brass-light rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, tripProgress)}%` }}
                  />
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-on-ink/10 flex items-center justify-between">
                <span className="text-xs text-ink-muted">
                  {tripTotalItems - tripBoughtItems} قطع متبقية للشراء
                </span>
                <button
                  onClick={onViewTrips}
                  className="inline-flex items-center gap-1 text-xs font-bold bg-brass hover:bg-brass-light text-on-ink px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                >
                  <span>فتح شيك ليست الرحلة</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative z-10 py-6 text-center">
              <p className="text-sm text-ink-muted">لا توجد رحلة شراء مجدولة حالياً</p>
              <button
                onClick={onOpenNewTrip}
                className="mt-3 inline-flex items-center gap-1.5 bg-brass text-on-ink px-3.5 py-1.5 rounded-lg text-xs font-bold"
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
