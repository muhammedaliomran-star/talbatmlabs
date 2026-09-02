import React from 'react';
import { Plus, ShoppingBag, Clock, AlertTriangle, CheckCircle2, RotateCcw, Calendar, Truck, ArrowRight, UserPlus, FileSpreadsheet, Sparkles, Luggage } from 'lucide-react';
import { Customer, Order, ReturnItem, Supplier, ShoppingTrip, ActiveTab } from '../types';
import { formatArabicDate, formatCurrency, isOrderLate, isOrderUpcoming, getDaysDifference } from '../utils/helpers';
import { StatCard } from './StatCard';
import { OrderCard } from './OrderCard';
import { StatusBadge } from './StatusBadge';
import { WalletHeroCard } from './WalletHeroCard';
import { WalletQuickActions } from './WalletQuickActions';
import { WalletActivityFeed } from './WalletActivityFeed';
import { Button } from '@/components/ui/button';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface DashboardViewProps {
  orders: Order[];
  suppliers: Supplier[];
  customers: Customer[];
  returns: ReturnItem[];
  trips?: ShoppingTrip[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewOrder: () => void;
  onOpenNewSupplier: () => void;
  onOpenNewReturn: () => void;
  onOpenNewTrip?: () => void;
  onOpenTripPrint: (supplier?: Supplier) => void;
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
  trips = [],
  setActiveTab,
  onOpenNewOrder,
  onOpenNewSupplier,
  onOpenNewReturn,
  onOpenNewTrip,
  onOpenTripPrint,
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
  const lateOrders = orders.filter((o) => isOrderLate(o));
  const doneOrders = orders.filter((o) => o.status === 'done');
  
  // Upcoming travel dates (orders due in 0 to 7 days and still pending)
  const upcomingOrders = orders
    .filter((o) => isOrderUpcoming(o, 7))
    .sort((a, b) => a.travelDate.localeCompare(b.travelDate));

  // Total pending returns value
  const totalReturnsValue = returns
    .filter((r) => r.status === 'pending_supplier')
    .reduce((sum, r) => sum + r.price, 0);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
      {/* 1. Dribbble Wallet App Signature Hero Card */}
      <section data-reveal className="reveal-section md:col-span-8">
      <div className="mb-3"><span className="rounded-full bg-ink px-3 py-1 text-[10px] font-bold uppercase text-on-ink">نظرة اليوم</span></div>
      <WalletHeroCard
        orders={orders}
        returns={returns}
        trips={trips}
        onOpenNewTrip={onOpenNewTrip}
        onViewOrders={() => setActiveTab('orders')}
        onViewTrips={() => setActiveTab('trips')}
      />
      </section>

      {/* 2. Dribbble 4 Circular Quick Action Buttons */}
      <section data-reveal className="reveal-section md:col-span-4 md:pt-8">
      <WalletQuickActions
        onOpenNewOrder={onOpenNewOrder}
        onOpenNewTrip={onOpenNewTrip || (() => setActiveTab('trips'))}
        onOpenNewReturn={onOpenNewReturn}
        onOpenTripPrint={() => onOpenTripPrint()}
        pendingCount={pendingOrders.length}
        lateCount={lateOrders.length}
      />
      </section>

      {/* 3. Core Statistics Cards (Responsive Grid) */}
      <section data-reveal className="reveal-section grid grid-cols-1 gap-3 sm:grid-cols-2 md:col-span-12 lg:grid-cols-6">
        <div className="lg:col-span-2"><StatCard
          title="إجمالي الطلبات"
          value={totalOrders}
          subtitle={`${customers.length} عملاء مسجلين`}
          variant="default"
          icon={<ShoppingBag className="w-4 h-4 text-ink" />}
          onClick={() => setActiveTab('orders')}
        /></div>
        <div className="lg:col-span-1"><StatCard
          title="قيد الانتظار (معلّق)"
          value={pendingOrders.length}
          subtitle="تحتاج للشراء والتوريد"
          variant="pending"
          icon={<Clock className="w-4 h-4 text-pending" />}
          onClick={() => setActiveTab('orders')}
        /></div>
        <div className="lg:col-span-1"><StatCard
          title="طلبات متأخرة!"
          value={lateOrders.length}
          subtitle={lateOrders.length > 0 ? 'تجاوزت يوم السفر المحدد' : 'لا توجد طلبات متأخرة'}
          variant="late"
          icon={<AlertTriangle className="w-4 h-4 text-late" />}
          onClick={() => setActiveTab('orders')}
        /></div>
        <div className="lg:col-span-1"><StatCard
          title="تم تنفيذها"
          value={doneOrders.length}
          subtitle="استلمها العميل بنجاح"
          variant="done"
          icon={<CheckCircle2 className="w-4 h-4 text-done" />}
          onClick={() => setActiveTab('orders')}
        /></div>
        <div className="lg:col-span-1">
          <StatCard
            title="مرتجعات مع الموردين"
            value={formatCurrency(totalReturnsValue)}
            subtitle={`${returns.filter((r) => r.status === 'pending_supplier').length} أصناف معلقة`}
            variant="brass"
            icon={<RotateCcw className="w-4 h-4 text-brass" />}
            onClick={() => setActiveTab('returns')}
          />
        </div>
      </section>

      {/* 4. Alert Section: Upcoming Travel Dates (next 3 - 7 days) */}
      <section data-reveal className="reveal-section rounded-[1.75rem] bg-paper-alt/70 p-1.5 ring-1 ring-line md:col-span-5">
      <div className="h-full overflow-hidden rounded-[calc(1.75rem-0.375rem)] bg-canvas shadow-[inset_0_1px_0_var(--canvas)]">
        <div className="bg-paper-warm px-4 sm:px-5 py-3 border-b border-line-soft flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brass/15 flex items-center justify-center text-brass">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold font-cairo text-ink">
                مواعيد السفر والتوريد القريبة (خلال 7 أيام)
              </h2>
              <p className="text-[11px] text-copy-muted">
                طلبات الزبائن التي اقترب ميعاد الذهاب لإحضارها من الموردين
              </p>
            </div>
          </div>

          <Button
            onClick={() => onOpenTripPrint()}
            variant="outline" size="sm" className="group px-3 text-xs font-bold text-ink hover:text-brass"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-brass" />
            <span>طباعة كشف السفر</span>
          </Button>
        </div>

        <div className="p-3.5 sm:p-5">
          {upcomingOrders.length === 0 ? (
            <div className="text-center py-5 text-copy-muted text-xs sm:text-sm">
              لا توجد طلبات معلقة قريبة في الأيام القادمة. جميع الطلبات منفذة أو بتواريخ لاحقة.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              {upcomingOrders.map((order) => {
                const days = getDaysDifference(order.travelDate);
                return (
                  <div
                    key={order.id}
                    className="flex flex-col justify-between gap-2 rounded-xl bg-paper-warm p-3 ring-1 ring-pending/20 transition-transform duration-500 motion-spring hover:-translate-y-1 sm:p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-ink font-cairo">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-copy-muted mt-0.5">
                          من: <span className="font-semibold text-ink">{order.supplierName}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        days <= 1 ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold' : 'bg-pending-soft text-pending'
                      }`}>
                        {days === 0 ? 'اليوم!' : days === 1 ? 'غداً' : `بعد ${days} أيام`}
                      </span>
                    </div>

                    <div className="text-xs text-charcoal bg-canvas p-2 rounded-[8px] border border-line-soft">
                      {order.description}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-line-soft">
                      <span className="text-copy-muted">
                        {formatArabicDate(order.travelDate)}
                      </span>
                       <Button
                        onClick={() => onToggleOrderStatus(order.id)}
                         variant="ghost" size="sm" className="h-7 px-2 text-[11px] font-bold text-done"
                      >
                        ✓ تم الاستلام
                       </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div></section>

      {/* 5. Wallet Activity Feed / Transactions List */}
      <section data-reveal className="reveal-section md:col-span-7">
      <WalletActivityFeed
        orders={orders}
        onToggleStatus={onToggleOrderStatus}
        onEditOrder={onEditOrder}
        onDeleteOrder={onDeleteOrder}
        onSelectCustomer={onSelectCustomer}
        onSelectSupplier={onSelectSupplier}
        onOpenWhatsApp={onOpenWhatsApp}
        onViewAllOrders={() => setActiveTab('orders')}
      />
      </section>
    </div>
  );
};
