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
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Dribbble Wallet App Signature Hero Card */}
      <WalletHeroCard
        orders={orders}
        returns={returns}
        trips={trips}
        onOpenNewTrip={onOpenNewTrip}
        onViewOrders={() => setActiveTab('orders')}
        onViewTrips={() => setActiveTab('trips')}
      />

      {/* 2. Dribbble 4 Circular Quick Action Buttons */}
      <WalletQuickActions
        onOpenNewOrder={onOpenNewOrder}
        onOpenNewTrip={onOpenNewTrip || (() => setActiveTab('trips'))}
        onOpenNewReturn={onOpenNewReturn}
        onOpenTripPrint={() => onOpenTripPrint()}
        pendingCount={pendingOrders.length}
        lateCount={lateOrders.length}
      />

      {/* 3. Core Statistics Cards (Responsive Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        <StatCard
          title="إجمالي الطلبات"
          value={totalOrders}
          subtitle={`${customers.length} عملاء مسجلين`}
          variant="default"
          icon={<ShoppingBag className="w-4 h-4 text-ink" />}
          onClick={() => setActiveTab('orders')}
        />
        <StatCard
          title="قيد الانتظار (معلّق)"
          value={pendingOrders.length}
          subtitle="تحتاج للشراء والتوريد"
          variant="pending"
          icon={<Clock className="w-4 h-4 text-pending" />}
          onClick={() => setActiveTab('orders')}
        />
        <StatCard
          title="طلبات متأخرة!"
          value={lateOrders.length}
          subtitle={lateOrders.length > 0 ? 'تجاوزت يوم السفر المحدد' : 'لا توجد طلبات متأخرة'}
          variant="late"
          icon={<AlertTriangle className="w-4 h-4 text-late" />}
          onClick={() => setActiveTab('orders')}
        />
        <StatCard
          title="تم تنفيذها"
          value={doneOrders.length}
          subtitle="استلمها العميل بنجاح"
          variant="done"
          icon={<CheckCircle2 className="w-4 h-4 text-done" />}
          onClick={() => setActiveTab('orders')}
        />
        <div className="col-span-2 sm:col-span-1 lg:col-span-1">
          <StatCard
            title="مرتجعات مع الموردين"
            value={formatCurrency(totalReturnsValue)}
            subtitle={`${returns.filter((r) => r.status === 'pending_supplier').length} أصناف معلقة`}
            variant="brass"
            icon={<RotateCcw className="w-4 h-4 text-brass" />}
            onClick={() => setActiveTab('returns')}
          />
        </div>
      </div>

      {/* 4. Alert Section: Upcoming Travel Dates (next 3 - 7 days) */}
      <div className="bg-canvas rounded-[18px] sm:rounded-[22px] border border-line overflow-hidden shadow-xs">
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

          <button
            onClick={() => onOpenTripPrint()}
            className="text-xs font-bold text-ink hover:text-brass bg-canvas border border-line px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-brass" />
            <span>طباعة كشف السفر</span>
          </button>
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
                    className="p-3 sm:p-3.5 rounded-[14px] border border-[#EED7BA] bg-[#FFFBF7] flex flex-col justify-between gap-2 transition-all hover:shadow-xs"
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
                      <button
                        onClick={() => onToggleOrderStatus(order.id)}
                        className="text-[11px] font-bold text-done hover:underline"
                      >
                        ✓ تم الاستلام
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Wallet Activity Feed / Transactions List */}
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
    </div>
  );
};
