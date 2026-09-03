import React from 'react';
import { ShoppingBag, Clock, CheckCircle2, RotateCcw, ArrowUpLeft, Sparkles } from 'lucide-react';
import { Customer, Order, ReturnItem, Supplier, ActiveTab } from '../types';
import { formatCurrency } from '../utils/helpers';
import { StatCard } from './StatCard';
import { WalletHeroCard } from './WalletHeroCard';
import { WalletQuickActions } from './WalletQuickActions';
import { WalletActivityFeed } from './WalletActivityFeed';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface DashboardViewProps {
  orders: Order[];
  suppliers: Supplier[];
  customers: Customer[];
  returns: ReturnItem[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewOrder: () => void;
  onOpenNewSupplier: () => void;
  onOpenNewReturn: () => void;
  onToggleOrderStatus: (orderId: string) => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onSelectCustomer: (customerName: string) => void;
  onSelectSupplier: (supplierId: string) => void;
  onOpenWhatsApp?: (order: Order) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  suppliers,
  customers,
  returns,
  setActiveTab,
  onOpenNewOrder,
  onOpenNewSupplier,
  onOpenNewReturn,
  onToggleOrderStatus,
  onEditOrder,
  onDeleteOrder,
  onSelectCustomer,
  onSelectSupplier,
  onOpenWhatsApp,
}) => {
  useScrollReveal();
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const doneOrders = orders.filter((o) => o.status === 'done');
  const totalReturnsValue = returns.filter((r) => r.status === 'pending_supplier').reduce((sum, r) => sum + r.price, 0);

  return (
    <div className="grain-overlay relative bg-paper text-charcoal">
      {/* Editorial Head - Z-Axis Cascade Intro */}
      <div data-reveal className="reveal-section mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-ink-deep px-3.5 py-1.5 ring-1 ring-white/10">
          <span className="h-1.5 w-1.5 rounded-full bg-brass-light animate-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-on-ink">Atelier Dashboard — Live Ledger</span>
        </div>
        <h1 className="mt-4 font-palestine text-[32px] font-[400] leading-[0.9] tracking-[-0.03em] text-charcoal sm:text-[42px] lg:text-[52px]">
          نظرة <span className="font-palestine font-[400] not-italic text-brass">اليوم</span> على الدفتر
        </h1>
        <p className="mt-3 max-w-[560px] text-[13px] leading-6 text-copy-muted">
          محفظة حيّة، مؤشرات متراكبة، ونشاط لحظي — كل شيء مصمم كطبقات ورقية فوق بعضها.
        </p>
      </div>

      {/* Z-Axis Cascade: Hero + Quick Actions overlapping */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-5 mb-8">
        {/* Hero - dominant, slight rotation on desktop */}
        <div data-reveal className="reveal-section lg:col-span-8 lg:rotate-[-0.6deg] lg:hover:rotate-[0deg] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform" style={{ transitionDelay: '80ms' }}>
          <div className="rounded-[2rem] bg-ink/[0.06] p-2 ring-1 ring-line/50">
            <div className="rounded-[calc(2rem-0.5rem)] bg-canvas p-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_24px_80px_-40px_rgba(26,18,7,0.28)]">
              <WalletHeroCard orders={orders} returns={returns} onViewOrders={() => setActiveTab('orders')} />
            </div>
          </div>
        </div>

        {/* Quick Actions - overlapping cascade, elevated */}
        <div data-reveal className="reveal-section lg:col-span-4 lg:rotate-[0.9deg] lg:-ml-3 lg:mt-6 lg:hover:rotate-[0deg] lg:hover:ml-0 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform" style={{ transitionDelay: '140ms' }}>
          <div className="rounded-[2rem] bg-brass/15 p-2 ring-1 ring-brass/15">
            <div className="rounded-[calc(2rem-0.5rem)] bg-canvas p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brass">
                <Sparkles className="size-3" strokeWidth={1.6} /> إجراءات سريعة
              </div>
              <div className="mt-4">
                <WalletQuickActions onOpenNewOrder={onOpenNewOrder} onOpenNewReturn={onOpenNewReturn} pendingCount={pendingOrders.length} />
              </div>
              <button onClick={onOpenNewSupplier} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink-deep py-2.5 text-xs font-bold text-on-ink ring-1 ring-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink active:scale-[0.98]">
                <span>مورد جديد</span>
                <span className="grid size-6 place-items-center rounded-full bg-white/15"><ArrowUpLeft className="size-3" strokeWidth={1.8} /></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats - Asymmetrical Bento with cascade depths */}
      <div data-reveal className="reveal-section grid grid-cols-2 lg:grid-cols-12 gap-4 mb-8" style={{ transitionDelay: '200ms' }}>
        {/* Large - إجمالي الطلبات */}
        <div className="col-span-2 lg:col-span-5 lg:rotate-[-0.4deg] hover:rotate-[0deg] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform">
          <div className="rounded-[2rem] bg-ink/[0.06] p-1.5 ring-1 ring-line/50 h-full">
            <div className="h-full rounded-[calc(2rem-0.375rem)] bg-canvas p-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
              <StatCard title="إجمالي الطلبات" value={totalOrders} subtitle={`${customers.length} عملاء مسجلين`} variant="default" icon={<ShoppingBag className="w-4 h-4 text-charcoal" strokeWidth={1.4} />} onClick={() => setActiveTab('orders')} />
            </div>
          </div>
        </div>
        {/* Pending */}
        <div className="lg:col-span-2 lg:rotate-[0.5deg] hover:rotate-[0deg] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
          <div className="rounded-[2rem] bg-pending/12 p-1.5 ring-1 ring-pending/15 h-full">
            <div className="h-full rounded-[calc(2rem-0.375rem)] bg-pending-soft/30 p-1">
              <StatCard title="قيد الانتظار" value={pendingOrders.length} subtitle="تحتاج للشراء" variant="pending" icon={<Clock className="w-4 h-4 text-pending" strokeWidth={1.4} />} onClick={() => setActiveTab('orders')} />
            </div>
          </div>
        </div>
        {/* Done */}
        <div className="lg:col-span-2 lg:rotate-[-0.5deg] hover:rotate-[0deg] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
          <div className="rounded-[2rem] bg-done/10 p-1.5 ring-1 ring-done/15 h-full">
            <div className="h-full rounded-[calc(2rem-0.375rem)] bg-done-soft/30 p-1">
              <StatCard title="تم تنفيذها" value={doneOrders.length} subtitle="استلمها العميل" variant="done" icon={<CheckCircle2 className="w-4 h-4 text-done" strokeWidth={1.4} />} onClick={() => setActiveTab('orders')} />
            </div>
          </div>
        </div>
        {/* Returns - brass */}
        <div className="col-span-2 lg:col-span-3 lg:rotate-[0.4deg] hover:rotate-[0deg] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
          <div className="rounded-[2rem] bg-ink/[0.06] p-1.5 ring-1 ring-line/50 h-full">
            <div className="h-full rounded-[calc(2rem-0.375rem)] bg-canvas p-1">
              <StatCard title="مرتجعات مع الموردين" value={formatCurrency(totalReturnsValue)} subtitle={`${returns.filter((r) => r.status === 'pending_supplier').length} أصناف معلقة`} variant="brass" icon={<RotateCcw className="w-4 h-4 text-brass" strokeWidth={1.4} />} onClick={() => setActiveTab('returns')} />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed - Double-Bezel island, remove rotation on mobile via media */}
      <div data-reveal className="reveal-section rounded-[2rem] bg-ink/[0.06] p-2 ring-1 ring-line/50 lg:rotate-[-0.2deg] hover:rotate-[0deg] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform" style={{ transitionDelay: '260ms' }}>
        <div className="rounded-[calc(2rem-0.5rem)] bg-canvas p-2 sm:p-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_24px_80px_-40px_rgba(26,18,7,0.22)]">
          <WalletActivityFeed orders={orders} onToggleStatus={onToggleOrderStatus} onEditOrder={onEditOrder} onDeleteOrder={onDeleteOrder} onSelectCustomer={onSelectCustomer} onSelectSupplier={onSelectSupplier} onOpenWhatsApp={onOpenWhatsApp} onViewAllOrders={() => setActiveTab('orders')} />
        </div>
      </div>

      <style>{`@media (max-width: 768px){ [class*="rotate["]{ transform: rotate(0deg) !important; margin-left:0 !important; margin-top:0 !important; } }`}</style>
    </div>
  );
};
