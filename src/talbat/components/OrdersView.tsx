import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Filter, LayoutGrid, Table as TableIcon, Phone, MessageCircle, Edit2, Trash2, Check, Clock, Calendar, Store, ArrowUpDown, Download, FileSpreadsheet } from 'lucide-react';
import { Order, OrderStatus, Supplier } from '../types';
import { formatArabicDate, formatCurrency, isOrderLate, createWhatsAppUrl, getDaysDifference } from '../utils/helpers';
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
  initialFilterStatus?: 'all' | 'pending' | 'late' | 'done';
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'late' | 'done'>(
    initialFilterStatus
  );
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'travelDate' | 'orderDate' | 'price' | 'customer'>('travelDate');
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
        } else if (statusFilter === 'late') {
          if (!isOrderLate(order)) return false;
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
        if (sortBy === 'travelDate') {
          return a.travelDate.localeCompare(b.travelDate);
        }
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

  const lateCount = orders.filter((o) => isOrderLate(o)).length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const doneCount = orders.filter((o) => o.status === 'done').length;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-[14px] p-4 sm:p-5 border border-[#DED8CC] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-cairo text-[#1B2E4A]">
            سجل طلبات العملاء ({filteredOrders.length})
          </h1>
          <p className="text-xs sm:text-sm text-[#6C6A63] mt-0.5">
            متابعة الأصناف، الأسعار، ومواعيد السفر لكل مورد
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportOrdersToCSV(filteredOrders)}
            className="flex items-center gap-1.5 bg-[#F6F4EF] hover:bg-[#EFEBE2] text-[#1B2E4A] border border-[#DED8CC] px-3.5 py-2.5 rounded-[9px] text-xs sm:text-sm font-bold shadow-2xs transition-all"
            title="تصدير هذه الطلبيات إلى ملف Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#3F7A5D]" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 bg-[#1B2E4A] hover:bg-[#2C4568] text-white px-4 py-2.5 rounded-[9px] text-xs sm:text-sm font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 text-[#D3AE72]" />
            <span>إضافة طلب جديد</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-[14px] p-4 border border-[#DED8CC] shadow-xs space-y-3">
        {/* Search input & View toggles */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#6C6A63]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم، هاتف العميل، المورد، أو تفاصيل الصنف..."
              className="w-full pr-9 pl-4 py-2 text-xs sm:text-sm rounded-[9px] border border-[#DED8CC] bg-[#F6F4EF] focus:bg-white focus:outline-none focus:border-[#B08948]"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#F6F4EF] p-1 rounded-lg border border-[#DED8CC]">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-[#1B2E4A] shadow-xs'
                    : 'text-[#6C6A63] hover:text-[#1B2E4A]'
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
                    ? 'bg-white text-[#1B2E4A] shadow-xs'
                    : 'text-[#6C6A63] hover:text-[#1B2E4A]'
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#EFEBE2]">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors ${
                statusFilter === 'all'
                  ? 'bg-[#1B2E4A] text-white shadow-xs'
                  : 'bg-[#F6F4EF] text-[#6C6A63] hover:bg-[#EFEBE2]'
              }`}
            >
              الكل ({orders.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-[#B8792A] text-white shadow-xs'
                  : 'bg-[#F6ECDC] text-[#B8792A] hover:bg-[#EED7BA]'
              }`}
            >
              معلّق ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('late')}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors ${
                statusFilter === 'late'
                  ? 'bg-[#B4463A] text-white shadow-xs'
                  : 'bg-[#F6E3E0] text-[#B4463A] hover:bg-[#F0CDC8]'
              }`}
            >
              متأخر ({lateCount})
            </button>
            <button
              onClick={() => setStatusFilter('done')}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors ${
                statusFilter === 'done'
                  ? 'bg-[#3F7A5D] text-white shadow-xs'
                  : 'bg-[#E7F0EA] text-[#3F7A5D] hover:bg-[#CDE3D5]'
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
              className="bg-[#F6F4EF] border border-[#DED8CC] rounded-lg px-2.5 py-2 font-medium text-[#1B2E4A] w-full"
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
              className="bg-[#F6F4EF] border border-[#DED8CC] rounded-lg px-2.5 py-2 font-medium text-[#1B2E4A] w-full"
            >
              <option value="travelDate">ترتيب: ميعاد السفر</option>
              <option value="orderDate">ترتيب: تاريخ الإضافة</option>
              <option value="price">ترتيب: السعر الأكبر</option>
              <option value="customer">ترتيب: اسم العميل</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Rendering: Table or Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-[14px] p-12 text-center border border-[#DED8CC]">
          <div className="w-12 h-12 rounded-full bg-[#F6F4EF] text-[#6C6A63] mx-auto flex items-center justify-center mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold font-cairo text-[#1B2E4A]">
            لا توجد طلبات تطابق الفلترة المحددة
          </h3>
          <p className="text-xs text-[#6C6A63] mt-1">
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
        <div className="bg-white rounded-[14px] border border-[#DED8CC] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#1B2E4A] text-white">
                <tr>
                  <th className="p-3 font-cairo">#</th>
                  <th className="p-3 font-cairo">العميل</th>
                  <th className="p-3 font-cairo">المورد</th>
                  <th className="p-3 font-cairo">تفاصيل الصنف والمقاس</th>
                  <th className="p-3 font-cairo">ميعاد السفر</th>
                  <th className="p-3 font-cairo">السعر / العربون</th>
                  <th className="p-3 font-cairo text-center">الحالة</th>
                  <th className="p-3 font-cairo text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEBE2]">
                {filteredOrders.map((order, idx) => {
                  const late = isOrderLate(order);
                  const days = getDaysDifference(order.travelDate);
                  const remaining = (order.price || 0) - (order.deposit || 0);

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-[#FAF6EF] transition-colors ${
                        late ? 'bg-[#FFF9F8]' : idx % 2 === 0 ? 'bg-white' : 'bg-[#FDFCF9]'
                      }`}
                    >
                      {/* Order Number */}
                      <td className="p-3 font-cairo font-bold text-[#1B2E4A]">
                        #{order.orderNumber}
                      </td>

                      {/* Customer */}
                      <td className="p-3">
                        <button
                          onClick={() => onSelectCustomer(order.customerName)}
                          className="font-bold font-cairo text-sm text-[#1B2E4A] hover:text-[#B08948] text-right block"
                        >
                          {order.customerName}
                        </button>
                        {order.customerPhone && (
                          <span className="text-[11px] text-[#6C6A63] font-cairo font-bold block">
                            {order.customerPhone}
                          </span>
                        )}
                      </td>

                      {/* Supplier */}
                      <td className="p-3">
                        <button
                          onClick={() => onSelectSupplier(order.supplierId)}
                          className="font-semibold text-xs text-[#1B2E4A] hover:text-[#B08948] text-right"
                        >
                          {order.supplierName}
                        </button>
                      </td>

                      {/* Description & Specifications Chips */}
                      <td className="p-3 max-w-xs">
                        <div className="font-semibold text-[#24262B] line-clamp-2 mb-1">
                          {order.description}
                        </div>
                        
                        {(order.size || order.color || order.alternativeColor || (order.quantity && order.quantity > 1)) && (
                          <div className="flex flex-wrap items-center gap-1 text-[10px] mb-1">
                            {order.size && (
                              <span className="px-1.5 py-0.5 rounded bg-[#EBF0F7] text-[#1B2E4A] font-semibold">
                                مقاس: {order.size}
                              </span>
                            )}
                            {order.color && (
                              <span className="px-1.5 py-0.5 rounded bg-[#FBF2E3] text-[#B08948] font-semibold border border-[#EED7BA]/60">
                                لون: {order.color}
                              </span>
                            )}
                            {order.alternativeColor && (
                              <span className="px-1.5 py-0.5 rounded bg-[#F6F4EF] text-[#6C6A63] border border-[#DED8CC]">
                                بديل: {order.alternativeColor}
                              </span>
                            )}
                            {order.quantity && order.quantity > 1 && (
                              <span className="px-1.5 py-0.5 rounded bg-[#E7F0EA] text-[#3F7A5D] font-bold font-cairo">
                                {order.quantity} قطع
                              </span>
                            )}
                          </div>
                        )}

                        {order.notes && (
                          <div className="text-[10px] text-[#B8792A] italic mt-0.5">
                            ملاحظة: {order.notes}
                          </div>
                        )}
                      </td>

                      {/* Travel Date */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-semibold text-[#1B2E4A]">
                          {formatArabicDate(order.travelDate)}
                        </div>
                        {order.status === 'pending' && (
                          <div
                            className={`text-[10px] font-bold ${
                              late
                                ? 'text-[#B4463A]'
                                : days <= 3
                                ? 'text-[#B8792A]'
                                : 'text-[#6C6A63]'
                            }`}
                          >
                            {late
                              ? `متأخر ${Math.abs(days)} يوم`
                              : days === 0
                              ? 'اليوم!'
                              : days === 1
                              ? 'غداً'
                              : `بعد ${days} أيام`}
                          </div>
                        )}
                      </td>

                      {/* Price / Deposit */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-bold text-[#1B2E4A] font-cairo text-xs">
                          {formatCurrency(order.price)}
                        </div>
                        {order.deposit !== undefined && order.deposit > 0 && remaining > 0 && (
                          <div className="text-[10px] text-[#B8792A]">
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
                                ? 'bg-[#F6ECDC] text-[#B8792A] hover:bg-[#EED7BA]'
                                : 'bg-[#E7F0EA] text-[#3F7A5D] hover:bg-[#CDE3D5]'
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
                              className="p-1.5 text-[#3F7A5D] hover:bg-[#E7F0EA] rounded-[7px] transition-colors"
                              title="رسائل وقوالب واتساب"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onEditOrder(order)}
                            className="p-1.5 text-[#6C6A63] hover:text-[#1B2E4A] hover:bg-[#F6F4EF] rounded-[7px] transition-colors"
                            title="تعديل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteOrder(order.id)}
                            className="p-1.5 text-[#6C6A63] hover:text-[#B4463A] hover:bg-[#F6E3E0] rounded-[7px] transition-colors"
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
