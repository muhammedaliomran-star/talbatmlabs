import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Filter, LayoutGrid, Table as TableIcon, Phone, MessageCircle, Edit2, Trash2, Check, Clock, Calendar, Store, ArrowUpDown, Download, FileSpreadsheet } from 'lucide-react';
import { Order, OrderStatus, Supplier } from '../types';
import { formatArabicDate, formatCurrency } from '../utils/helpers';
import { exportOrdersToCSV } from '../utils/exportToCsv';
import { StatusBadge } from './StatusBadge';
import { OrderCard } from './OrderCard';

interface OrdersViewProps {
  orders: Order[];
  suppliers: Supplier[];
  onOpenNewOrder: () => void;
  onToggleStatus: (orderId: string) => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onSelectCustomer: (customerName: string) => void;
  onSelectSupplier: (supplierId: string) => void;
  onOpenWhatsApp?: (order: Order) => void;
  initialFilterStatus?: 'all' | 'pending' | 'done';
  initialSearchTerm?: string;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  suppliers,
  onOpenNewOrder,
  onToggleStatus,
  onEditOrder,
  onDeleteOrder,
  onSelectCustomer,
  onSelectSupplier,
  onOpenWhatsApp,
  initialFilterStatus = 'all',
  initialSearchTerm = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'done'>(
    initialFilterStatus
  );
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'orderDate' | 'price' | 'customer'>('orderDate');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  // Filter and sort logic
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Status filter
        if (statusFilter === 'pending') {
          if (order.status !== 'pending') return false;
        } else if (statusFilter === 'done') {
          if (order.status !== 'done') return false;
        }

        // Supplier filter
        if (supplierFilter !== 'all' && order.supplierId !== supplierFilter) {
          return false;
        }

        // Search text
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchCustomer = order.customerName.toLowerCase().includes(term);
          const matchSupplier = order.supplierName.toLowerCase().includes(term);
          const matchDesc = order.description.toLowerCase().includes(term);
          const matchPhone = order.customerPhone?.includes(term);
          const matchNumber = String(order.orderNumber).includes(term);
          if (!matchCustomer && !matchSupplier && !matchDesc && !matchPhone && !matchNumber) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'orderDate') {
          return b.orderDate.localeCompare(a.orderDate);
        }
        if (sortBy === 'price') {
          return (b.price || 0) - (a.price || 0);
        }
        if (sortBy === 'customer') {
          return a.customerName.localeCompare(b.customerName, 'ar');
        }
        return 0;
      });
  }, [orders, statusFilter, supplierFilter, searchTerm, sortBy]);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const doneCount = orders.filter((o) => o.status === 'done').length;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-[14px] p-4 sm:p-5 border border-line shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-cairo text-ink">
            سجل طلبات العملاء ({filteredOrders.length})
          </h1>
          <p className="text-xs sm:text-sm text-copy-muted mt-0.5">
             متابعة الأصناف والأسعار وحالة كل طلب
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportOrdersToCSV(filteredOrders)}
            className="flex items-center gap-1.5 bg-paper hover:bg-paper-alt text-ink border border-line px-3.5 py-2.5 rounded-[9px] text-xs sm:text-sm font-bold shadow-2xs transition-all"
            title="تصدير هذه الطلبيات إلى ملف Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-done" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 bg-ink hover:bg-ink-light text-white px-4 py-2.5 rounded-[9px] text-xs sm:text-sm font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 text-brass-light" />
            <span>إضافة طلب جديد</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-[14px] p-4 border border-line shadow-xs space-y-3">
        {/* Search input & View toggles */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-copy-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم، هاتف العميل، المورد، أو تفاصيل الصنف..."
              className="w-full pr-9 pl-4 py-2 text-xs sm:text-sm rounded-[9px] border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-paper p-1 rounded-lg border border-line">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-ink shadow-xs'
                    : 'text-copy-muted hover:text-ink'
                }`}
                title="عرض جدول"
              >
                <TableIcon className="w-4 h-4" />
                <span className="hidden sm:inline">جدول</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white text-ink shadow-xs'
                    : 'text-copy-muted hover:text-ink'
                }`}
                title="عرض بطاقات"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">بطاقات</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Filters & Dropdowns */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-paper-alt">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors ${
                statusFilter === 'all'
                  ? 'bg-ink text-white shadow-xs'
                  : 'bg-paper text-copy-muted hover:bg-paper-alt'
              }`}
            >
              الكل ({orders.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-pending text-white shadow-xs'
                  : 'bg-pending-soft text-pending hover:bg-pending-soft'
              }`}
            >
              معلّق ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('done')}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors ${
                statusFilter === 'done'
                  ? 'bg-done text-white shadow-xs'
                  : 'bg-done-soft text-done hover:bg-done-soft'
              }`}
            >
              تم التنفيذ ({doneCount})
            </button>
          </div>

          {/* Supplier and Sort selects */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 text-xs w-full sm:w-auto">
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="bg-paper border border-line rounded-lg px-2.5 py-2 font-medium text-ink w-full"
            >
              <option value="all">كل الموردين</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-paper border border-line rounded-lg px-2.5 py-2 font-medium text-ink w-full"
            >
              <option value="orderDate">ترتيب: تاريخ الإضافة</option>
              <option value="price">ترتيب: السعر الأكبر</option>
              <option value="customer">ترتيب: اسم العميل</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Rendering: Table or Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-[14px] p-12 text-center border border-line">
          <div className="w-12 h-12 rounded-full bg-paper text-copy-muted mx-auto flex items-center justify-center mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold font-cairo text-ink">
            لا توجد طلبات تطابق الفلترة المحددة
          </h3>
          <p className="text-xs text-copy-muted mt-1">
            جرب تغيير كلمات البحث أو مسح خيارات الفلترة لعرض الطلبات
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onToggleStatus={onToggleStatus}
              onEdit={onEditOrder}
              onDelete={onDeleteOrder}
              onSelectCustomer={onSelectCustomer}
              onSelectSupplier={onSelectSupplier}
              onOpenWhatsApp={onOpenWhatsApp}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-[14px] border border-line overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-ink text-white">
                <tr>
                  <th className="p-3 font-cairo">#</th>
                  <th className="p-3 font-cairo">العميل</th>
                  <th className="p-3 font-cairo">المورد</th>
                  <th className="p-3 font-cairo">تفاصيل الصنف والمقاس</th>
                  <th className="p-3 font-cairo">تاريخ الطلب</th>
                  <th className="p-3 font-cairo">السعر / العربون</th>
                  <th className="p-3 font-cairo text-center">الحالة</th>
                  <th className="p-3 font-cairo text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-alt">
                {filteredOrders.map((order, idx) => {
                  const remaining = (order.price || 0) - (order.deposit || 0);

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-paper-warm transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-canvas-subtle'}`}
                    >
                      {/* Order Number */}
                      <td className="p-3 font-cairo font-bold text-ink">
                        #{order.orderNumber}
                      </td>

                      {/* Customer */}
                      <td className="p-3">
                        <button
                          onClick={() => onSelectCustomer(order.customerName)}
                          className="font-bold font-cairo text-sm text-ink hover:text-brass text-right block"
                        >
                          {order.customerName}
                        </button>
                        {order.customerPhone && (
                          <span className="text-[11px] text-copy-muted font-cairo font-bold block">
                            {order.customerPhone}
                          </span>
                        )}
                      </td>

                      {/* Supplier */}
                      <td className="p-3">
                        <button
                          onClick={() => onSelectSupplier(order.supplierId)}
                          className="font-semibold text-xs text-ink hover:text-brass text-right"
                        >
                          {order.supplierName}
                        </button>
                      </td>

                      {/* Description & Specifications Chips */}
                      <td className="p-3 max-w-xs">
                        <div className="font-semibold text-charcoal line-clamp-2 mb-1">
                          {order.description}
                        </div>
                        
                        {(order.size || order.color || order.alternativeColor || (order.quantity && order.quantity > 1)) && (
                          <div className="flex flex-wrap items-center gap-1 text-[10px] mb-1">
                            {order.size && (
                              <span className="px-1.5 py-0.5 rounded bg-size-soft text-ink font-semibold">
                                مقاس: {order.size}
                              </span>
                            )}
                            {order.color && (
                              <span className="px-1.5 py-0.5 rounded bg-color-soft text-brass font-semibold border border-pending-soft/60">
                                لون: {order.color}
                              </span>
                            )}
                            {order.alternativeColor && (
                              <span className="px-1.5 py-0.5 rounded bg-paper text-copy-muted border border-line">
                                بديل: {order.alternativeColor}
                              </span>
                            )}
                            {order.quantity && order.quantity > 1 && (
                              <span className="px-1.5 py-0.5 rounded bg-done-soft text-done font-bold font-cairo">
                                {order.quantity} قطع
                              </span>
                            )}
                          </div>
                        )}

                        {order.notes && (
                          <div className="text-[10px] text-pending italic mt-0.5">
                            ملاحظة: {order.notes}
                          </div>
                        )}
                      </td>

                      {/* Order Date */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-semibold text-ink">
                          {formatArabicDate(order.orderDate)}
                        </div>
                      </td>

                      {/* Price / Deposit */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-bold text-ink font-cairo text-xs">
                          {formatCurrency(order.price)}
                        </div>
                        {order.deposit !== undefined && order.deposit > 0 && remaining > 0 && (
                          <div className="text-[10px] text-pending">
                            باقي: {formatCurrency(remaining)}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <StatusBadge status={order.status} order={order} />
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-left whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onToggleStatus(order.id)}
                            className={`p-1.5 rounded-[7px] text-xs font-semibold flex items-center gap-1 transition-colors ${
                              order.status === 'done'
                                ? 'bg-pending-soft text-pending hover:bg-pending-soft'
                                : 'bg-done-soft text-done hover:bg-done-soft'
                            }`}
                            title={order.status === 'done' ? 'إعادة كمعلق' : 'تحديد كـ تم التنفيذ'}
                          >
                            {order.status === 'done' ? (
                              <Clock className="w-3.5 h-3.5" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {order.customerPhone && (
                            <button
                              type="button"
                              onClick={() => (onOpenWhatsApp ? onOpenWhatsApp(order) : undefined)}
                              className="p-1.5 text-done hover:bg-done-soft rounded-[7px] transition-colors"
                              title="رسائل وقوالب واتساب"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onEditOrder(order)}
                            className="p-1.5 text-copy-muted hover:text-ink hover:bg-paper rounded-[7px] transition-colors"
                            title="تعديل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteOrder(order.id)}
                            className="p-1.5 text-copy-muted hover:text-late hover:bg-late-soft rounded-[7px] transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
