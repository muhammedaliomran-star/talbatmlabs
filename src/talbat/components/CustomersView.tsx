import React, { useState } from 'react';
import { Users, Search, Phone, Plus, MessageCircle, Calendar, Store, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Customer, Order } from '../types';
import { formatArabicDate, formatCurrency, createWhatsAppUrl } from '../utils/helpers';
import { StatusBadge } from './StatusBadge';

interface CustomersViewProps {
  customers: Customer[];
  orders: Order[];
  onOpenNewOrderForCustomer: (customer: Customer) => void;
  onToggleOrderStatus: (orderId: string) => void;
  onEditOrder: (order: Order) => void;
  selectedCustomerName?: string | null;
  onClearSelectedCustomer?: () => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  orders,
  onOpenNewOrderForCustomer,
  onToggleOrderStatus,
  onEditOrder,
  selectedCustomerName,
  onClearSelectedCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileShowDetail, setMobileShowDetail] = useState(Boolean(selectedCustomerName));
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(() => {
    if (selectedCustomerName) {
      const found = customers.find((c) => c.name === selectedCustomerName);
      return found ? found.id : customers[0]?.id || null;
    }
    return customers[0]?.id || null;
  });

  // Filter customers by search
  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(term) || (c.phone && c.phone.includes(term));
  });

  const activeCustomer = customers.find((c) => c.id === activeCustomerId) || customers[0];

  // All orders for this active customer from ANY supplier
  const customerOrders = activeCustomer
    ? orders
        .filter(
          (o) =>
            o.customerId === activeCustomer.id ||
            o.customerName.trim().toLowerCase() === activeCustomer.name.trim().toLowerCase()
        )
        .sort((a, b) => b.orderDate.localeCompare(a.orderDate))
    : [];

  const totalSpent = customerOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const totalDeposit = customerOrders.reduce((sum, o) => sum + (o.deposit || 0), 0);
  const remainingDebt = Math.max(0, totalSpent - totalDeposit);
  const pendingOrders = customerOrders.filter((o) => o.status === 'pending');
  const doneOrders = customerOrders.filter((o) => o.status === 'done');

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-[14px] p-4 sm:p-5 border border-line shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-cairo text-ink">
            سجل العملاء والطلبات المجمعة
          </h1>
          <p className="text-xs sm:text-sm text-copy-muted mt-0.5">
            عرض ملف كل عميل وكل طلباته المتفرقة من مختلف الموردين في مكان واحد
          </p>
        </div>

        {activeCustomer && (
          <button
            onClick={() => onOpenNewOrderForCustomer(activeCustomer)}
            className="flex items-center gap-1.5 bg-brass hover:bg-brass text-white px-3.5 py-2 rounded-[9px] text-xs sm:text-sm font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>طلب جديد لـ {activeCustomer.name.split(' ')[0]}</span>
          </button>
        )}
      </div>

      {/* Main Grid: Left is Customer list, Right is Customer Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Customer Sidebar List (4 cols) */}
        <div className={`lg:col-span-4 bg-white rounded-[14px] border border-line p-4 shadow-xs space-y-3 ${mobileShowDetail ? 'hidden lg:block' : 'block'}`}>
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-copy-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم العميل أو هاتفه..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-[9px] border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-6 text-xs text-copy-muted">
                لا يوجد عملاء يطابقون البحث
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const cOrders = orders.filter(
                  (o) =>
                    o.customerId === c.id ||
                    o.customerName.trim().toLowerCase() === c.name.trim().toLowerCase()
                );
                const isSelected = c.id === activeCustomerId;
                const cPending = cOrders.filter((o) => o.status === 'pending').length;

                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveCustomerId(c.id);
                      setMobileShowDetail(true);
                    }}
                    className={`w-full text-right p-3 rounded-[10px] border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-paper-warm border-brass ring-1 ring-brass'
                        : 'bg-white border-paper-alt hover:bg-paper'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm font-cairo text-ink">
                        {c.name}
                      </div>
                      {c.phone && (
                        <div className="text-[11px] text-copy-muted font-cairo font-semibold mt-0.5">
                          {c.phone}
                        </div>
                      )}
                    </div>

                    <div className="text-left shrink-0">
                      <span className="text-xs font-bold text-ink font-cairo block">
                        {cOrders.length} طلبات
                      </span>
                      {cPending > 0 && (
                        <span className="text-[10px] font-bold text-pending bg-pending-soft px-1.5 py-0.5 rounded">
                          {cPending} معلّق
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Customer Dossier / Profile (8 cols) */}
        <div className={`lg:col-span-8 bg-white rounded-[14px] border border-line p-4 sm:p-5 shadow-xs space-y-5 ${!mobileShowDetail ? 'hidden lg:block' : 'block'}`}>
          {/* Mobile Back Button */}
          <div className="lg:hidden pb-2 border-b border-paper-alt mb-1">
            <button
              onClick={() => setMobileShowDetail(false)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ink hover:text-brass bg-paper hover:bg-paper-alt px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>← العودة لقائمة العملاء</span>
            </button>
          </div>

          {activeCustomer ? (
            <>
              {/* Header Info */}
              <div className="border-b border-paper-alt pb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold font-cairo text-ink">
                      {activeCustomer.name}
                    </h2>
                    <span className="text-xs bg-paper text-copy-muted px-2 py-0.5 rounded font-cairo">
                      عميل مسجل
                    </span>
                  </div>
                  {activeCustomer.notes && (
                    <p className="text-xs text-copy-muted mt-1 italic">
                      ملاحظات: {activeCustomer.notes}
                    </p>
                  )}
                </div>

                {/* Direct Contact Actions */}
                <div className="flex items-center gap-2">
                  {activeCustomer.phone && (
                    <>
                      <a
                        href={createWhatsAppUrl(activeCustomer.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-done-soft text-done hover:bg-done-soft px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>مراسلة واتساب</span>
                      </a>
                      <a
                        href={`tel:${activeCustomer.phone}`}
                        className="flex items-center gap-1.5 bg-paper text-ink hover:bg-paper-alt px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        <span dir="ltr">{activeCustomer.phone}</span>
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Financial & Status Overview for this customer */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-paper rounded-[10px] border border-paper-alt">
                  <div className="text-xs text-copy-muted">إجمالي المشتريات</div>
                  <div className="text-base sm:text-lg font-bold font-cairo text-ink mt-1">
                    {formatCurrency(totalSpent)}
                  </div>
                </div>

                <div className="p-3 bg-paper rounded-[10px] border border-paper-alt">
                  <div className="text-xs text-copy-muted">العربين المدفوعة</div>
                  <div className="text-base sm:text-lg font-bold font-cairo text-done mt-1">
                    {formatCurrency(totalDeposit)}
                  </div>
                </div>

                <div className="p-3 bg-paper-warm rounded-[10px] border border-pending-soft">
                  <div className="text-xs text-pending">المتبقي للدفع</div>
                  <div className="text-base sm:text-lg font-bold font-cairo text-pending mt-1">
                    {formatCurrency(remainingDebt)}
                  </div>
                </div>

                <div className="p-3 bg-paper rounded-[10px] border border-paper-alt">
                  <div className="text-xs text-copy-muted">الطلبات المعلّقة</div>
                  <div className="text-base sm:text-lg font-bold font-cairo text-ink mt-1">
                    {pendingOrders.length} من {customerOrders.length}
                  </div>
                </div>
              </div>

              {/* Orders from all suppliers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold font-cairo text-sm text-ink">
                    سجل طلبات العميل من كل الموردين ({customerOrders.length})
                  </h3>
                  <button
                    onClick={() => onOpenNewOrderForCustomer(activeCustomer)}
                    className="text-xs font-bold text-brass hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة طلب جديد</span>
                  </button>
                </div>

                {customerOrders.length === 0 ? (
                  <div className="text-center py-8 bg-paper rounded-[10px] text-xs text-copy-muted">
                    لا توجد طلبات مسجلة لهذا العميل حتى الآن.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customerOrders.map((order) => {
                      const remaining = (order.price || 0) - (order.deposit || 0);

                      return (
                        <div
                          key={order.id}
                          className="p-4 rounded-[12px] border transition-all bg-white border-paper-alt hover:border-line"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-cairo text-xs font-bold text-ink">
                                  #{order.orderNumber}
                                </span>
                                <span className="text-xs text-copy-muted">من المورد:</span>
                                <span className="font-bold text-xs text-brass">
                                  {order.supplierName}
                                </span>
                              </div>
                            </div>
                            <StatusBadge status={order.status} order={order} />
                          </div>

                          <div className="text-xs sm:text-sm text-charcoal bg-paper p-2.5 rounded-[8px] mb-2 leading-relaxed">
                            {order.description}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-paper-alt">
                            <div className="flex items-center gap-1.5 text-copy-muted">
                              <Calendar className="w-3.5 h-3.5 text-brass" />
                              <span>تاريخ الطلب: {formatArabicDate(order.orderDate)}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              {order.price !== undefined && (
                                <span className="font-bold text-ink font-cairo">
                                  {formatCurrency(order.price)}
                                </span>
                              )}
                              {remaining > 0 && (
                                <span className="text-pending text-[11px] font-semibold">
                                  باقي: {formatCurrency(remaining)}
                                </span>
                              )}
                              <button
                                onClick={() => onToggleOrderStatus(order.id)}
                                className="text-xs font-bold text-done hover:underline"
                              >
                                {order.status === 'done' ? 'إعادة كمعلق' : '✓ تم التسليم'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-copy-muted">
              اختر عميلاً من القائمة لعرض تفاصيل طلباته
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
