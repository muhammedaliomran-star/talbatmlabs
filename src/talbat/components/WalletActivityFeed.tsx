import React, { useState } from 'react';
import {
  ShoppingBag,
  Check,
  Clock,
  AlertTriangle,
  MessageCircle,
  Phone,
  Calendar,
  Store,
  ChevronRight,
  Filter,
  Layers,
  ArrowUpRight,
  Shirt,
} from 'lucide-react';
import { Order } from '../types';
import { formatArabicDate, formatCurrency, isOrderLate, getDaysDifference } from '../utils/helpers';
import { StatusBadge } from './StatusBadge';

interface WalletActivityFeedProps {
  orders: Order[];
  onToggleStatus: (orderId: string) => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onSelectCustomer: (customerName: string) => void;
  onSelectSupplier: (supplierId: string) => void;
  onOpenWhatsApp?: (order: Order) => void;
  onViewAllOrders: () => void;
}

export const WalletActivityFeed: React.FC<WalletActivityFeedProps> = ({
  orders,
  onToggleStatus,
  onEditOrder,
  onDeleteOrder,
  onSelectCustomer,
  onSelectSupplier,
  onOpenWhatsApp,
  onViewAllOrders,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'late' | 'done'>('all');

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const lateOrders = orders.filter((o) => isOrderLate(o));
  const doneOrders = orders.filter((o) => o.status === 'done');

  const filteredOrders = orders.filter((o) => {
    if (filter === 'pending') return o.status === 'pending';
    if (filter === 'late') return isOrderLate(o);
    if (filter === 'done') return o.status === 'done';
    return true;
  });

  // Recent 8 items for the feed
  const feedOrders = [...filteredOrders]
    .sort((a, b) => b.orderDate.localeCompare(a.orderDate))
    .slice(0, 8);

  const getTravelBadge = (order: Order) => {
    if (order.status === 'done') {
      return (
        <span className="text-[10px] font-bold text-done bg-done-soft px-2 py-0.5 rounded-full">
          تم الاستلام ✓
        </span>
      );
    }
    const daysDiff = getDaysDifference(order.travelDate);
    if (isOrderLate(order)) {
      return (
        <span className="text-[10px] font-bold text-on-ink bg-late px-2 py-0.5 rounded-full animate-pulse">
          متأخر {Math.abs(daysDiff)} يوم!
        </span>
      );
    }
    if (daysDiff === 0) {
      return (
        <span className="text-[10px] font-bold text-pending bg-pending-soft px-2 py-0.5 rounded-full">
          السفر اليوم!
        </span>
      );
    }
    if (daysDiff === 1) {
      return (
        <span className="text-[10px] font-bold text-pending bg-pending-soft px-2 py-0.5 rounded-full">
          السفر غداً
        </span>
      );
    }
    return (
      <span className="text-[10px] text-copy-muted bg-paper px-2 py-0.5 rounded-full">
        بعد {daysDiff} أيام
      </span>
    );
  };

  return (
    <div className="bg-canvas rounded-[22px] sm:rounded-[26px] border border-line p-4 sm:p-5 shadow-xs">
      {/* Header with Title & Filter Pills */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-paper-warm border border-line-soft flex items-center justify-center text-brass">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold font-cairo text-ink">
              النشاط المالي وسجل العمليات
            </h2>
            <p className="text-[11px] text-copy-muted">
              طلبيات الزبائن وتفاصيل الدفع والتوريد
            </p>
          </div>
        </div>

        <button
          onClick={onViewAllOrders}
          className="text-xs font-bold text-brass hover:text-ink flex items-center gap-0.5 transition-colors"
        >
          <span>الكل ({orders.length})</span>
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        </button>
      </div>

      {/* Segmented Filter Pills (Dribbble Wallet Style) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 pt-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
            filter === 'all'
              ? 'bg-ink text-on-ink shadow-xs'
              : 'bg-paper text-copy-muted hover:bg-paper-alt'
          }`}
        >
          الكل ({orders.length})
        </button>

        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
            filter === 'pending'
              ? 'bg-pending text-on-ink shadow-xs'
              : 'bg-pending-soft text-pending hover:bg-[#EED7BA]'
          }`}
        >
          معلّق ({pendingOrders.length})
        </button>

        {lateOrders.length > 0 && (
          <button
            onClick={() => setFilter('late')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              filter === 'late'
                ? 'bg-late text-on-ink shadow-xs animate-pulse'
                : 'bg-late-soft text-late hover:bg-[#F0CDC8]'
            }`}
          >
            متأخر ({lateOrders.length})
          </button>
        )}

        <button
          onClick={() => setFilter('done')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
            filter === 'done'
              ? 'bg-done text-on-ink shadow-xs'
              : 'bg-done-soft text-done hover:bg-[#CDE3D5]'
          }`}
        >
          مكتمل ({doneOrders.length})
        </button>
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-paper-alt mt-2">
        {feedOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-copy-muted">
            لا توجد عمليات تطابق الفلتر الحالي
          </div>
        ) : (
          feedOrders.map((order) => {
            const remaining = (order.price || 0) - (order.deposit || 0);
            const isLate = isOrderLate(order);

            return (
              <div
                key={order.id}
                className="py-3 sm:py-3.5 flex items-center justify-between gap-3 group hover:bg-paper-warm/50 -mx-2 px-2 rounded-xl transition-colors"
              >
                {/* Left: Category Icon Squircle + Customer & Item Details */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Styled Avatar */}
                  <div
                    className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center font-cairo font-bold transition-transform group-hover:scale-105 ${
                      order.status === 'done'
                        ? 'bg-done-soft text-done border border-[#CDE3D5]'
                        : isLate
                        ? 'bg-late-soft text-late border border-[#F4D1CD]'
                        : 'bg-paper-warm text-brass border border-line-soft'
                    }`}
                  >
                    <Shirt className="w-5 h-5" />
                  </div>

                  {/* Customer and Item Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectCustomer(order.customerName)}
                        className="font-bold text-xs sm:text-sm font-cairo text-ink hover:text-brass truncate text-right"
                      >
                        {order.customerName}
                      </button>
                      <span className="text-[10px] text-copy-muted font-cairo font-medium">
                        #{order.orderNumber}
                      </span>
                    </div>

                    <p className="text-xs text-charcoal truncate mt-0.5">
                      {order.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                      {order.size && (
                        <span className="px-1.5 py-0.2 rounded-md bg-size-soft text-ink font-semibold">
                          {order.size}
                        </span>
                      )}
                      {order.color && (
                        <span className="px-1.5 py-0.2 rounded-md bg-color-soft text-brass font-semibold">
                          {order.color}
                        </span>
                      )}
                      {getTravelBadge(order)}
                    </div>
                  </div>
                </div>

                {/* Right: Price & Quick Action Buttons */}
                <div className="text-left shrink-0 flex flex-col items-end gap-1">
                  <div className="font-bold font-cairo text-xs sm:text-sm text-ink">
                    {order.price !== undefined ? formatCurrency(order.price) : '-'}
                  </div>

                  {order.deposit !== undefined && order.deposit > 0 && remaining > 0 ? (
                    <span className="text-[10px] text-pending font-semibold bg-pending-soft px-1.5 py-0.5 rounded">
                      باقي: {formatCurrency(remaining)}
                    </span>
                  ) : order.status === 'done' ? (
                    <span className="text-[10px] text-done font-semibold">
                      تم السداد ✓
                    </span>
                  ) : (
                    <span className="text-[10px] text-copy-muted">
                      مطلوب توريده
                    </span>
                  )}

                  {/* Micro action row */}
                  <div className="flex items-center gap-1 mt-0.5">
                    {order.customerPhone && onOpenWhatsApp && (
                      <button
                        onClick={() => onOpenWhatsApp(order)}
                        className="p-1 text-done hover:bg-done-soft rounded-md transition-colors"
                        title="مراسلة واتساب"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onToggleStatus(order.id)}
                      className={`p-1 rounded-md text-[10px] font-bold transition-colors ${
                        order.status === 'done'
                          ? 'text-pending hover:bg-pending-soft'
                          : 'text-done hover:bg-done-soft'
                      }`}
                      title={order.status === 'done' ? 'إرجاع كمعلق' : 'تحديد كتم التنفيذ'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
