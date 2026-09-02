import React from 'react';
import { ShoppingBag, Clock, CheckCircle2, RotateCcw } from 'lucide-react';
import { Customer, Order, ReturnItem, Supplier, ActiveTab } from '../types';
import { formatCurrency } from '../utils/helpers';
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
        onViewOrders={() => setActiveTab('orders')}
      />
      </section>

      {/* 2. Dribbble 4 Circular Quick Action Buttons */}
      <section data-reveal className="reveal-section md:col-span-4 md:pt-8">
      <WalletQuickActions
        onOpenNewOrder={onOpenNewOrder}
        onOpenNewReturn={onOpenNewReturn}
        pendingCount={pendingOrders.length}
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

      {/* 5. Wallet Activity Feed / Transactions List */}
      <section data-reveal className="reveal-section md:col-span-12">
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
