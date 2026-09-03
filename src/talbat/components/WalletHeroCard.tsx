import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Order, ReturnItem } from '../types';
import { formatCurrency } from '../utils/helpers';

interface WalletHeroCardProps {
  orders: Order[];
  returns: ReturnItem[];
  onViewOrders?: () => void;
}

export const WalletHeroCard: React.FC<WalletHeroCardProps> = ({
  orders,
  returns,
  onViewOrders,
}) => {
  const [showBalance, setShowBalance] = useState(true);

  // Calculations
  const activeOrders = orders.filter((o) => o.status === 'pending');

  const totalOrdersValue = orders.reduce((sum, o) => sum + (o.price || 0), 0);
  const activeOrdersValue = activeOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const totalDeposits = orders.reduce((sum, o) => sum + (o.deposit || 0), 0);
  const activeRemaining = activeOrders.reduce((sum, o) => sum + Math.max(0, (o.price || 0) - (o.deposit || 0)), 0);

  const pendingReturnsValue = returns
    .filter((r) => r.status === 'pending_supplier')
    .reduce((sum, r) => sum + r.price, 0);

  return (
    <div className="relative w-full">
       {/* Wallet controls */}
      <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="rounded-full bg-ink-deep px-3 py-1 text-xs font-bold text-on-ink">محفظة السيولة</div>

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
          <div onClick={onViewOrders} className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-br from-ink-deep via-ink-deep to-ink text-on-ink p-5 sm:p-6 shadow-xl border border-brass-light/30 transition-all duration-700 motion-spring">
          {/* Subtle Decorative Background Shapes & Gold Shimmer */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-brass/15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-ink-light/40 blur-2xl pointer-events-none" />
          
          {/* Card Geometric Lines Watermark */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(var(--brass-light)_1px,transparent_1px)] [background-size:16px_16px]" />

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
              <svg className="w-6 h-6 text-brass-light/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
    </div>
  );
};
