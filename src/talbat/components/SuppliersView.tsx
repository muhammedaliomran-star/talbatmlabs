import React, { useState } from 'react';
import { Plus, Store, MapPin, Phone, Edit2, Trash2, ShoppingBag, RotateCcw, Search } from 'lucide-react';
import { Order, ReturnItem, Supplier } from '../types';
import { formatArabicDate, formatCurrency } from '../utils/helpers';
import { StatusBadge } from './StatusBadge';

interface SuppliersViewProps {
  suppliers: Supplier[];
  orders: Order[];
  returns: ReturnItem[];
  onOpenNewSupplier: () => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: string) => void;
  onToggleOrderStatus: (orderId: string) => void;
  selectedSupplierId?: string | null;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  orders,
  returns,
  onOpenNewSupplier,
  onEditSupplier,
  onDeleteSupplier,
  onToggleOrderStatus,
  selectedSupplierId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileShowDetail, setMobileShowDetail] = useState(Boolean(selectedSupplierId));
  const [activeSupplierId, setActiveSupplierId] = useState<string | null>(
    selectedSupplierId || suppliers[0]?.id || null
  );

  const filteredSuppliers = suppliers.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(term) || (s.address && s.address.toLowerCase().includes(term));
  });

  const activeSupplier = suppliers.find((s) => s.id === activeSupplierId) || suppliers[0];

  const activeSupplierOrders = activeSupplier
    ? orders
        .filter((o) => o.supplierId === activeSupplier.id)
        .sort((a, b) => b.orderDate.localeCompare(a.orderDate))
    : [];

  const activeSupplierReturns = activeSupplier
    ? returns.filter((r) => r.supplierId === activeSupplier.id)
    : [];

  const pendingOrders = activeSupplierOrders.filter((o) => o.status === 'pending');
  const totalOrdersValue = activeSupplierOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const totalReturnsValue = activeSupplierReturns.reduce((sum, r) => sum + (r.price || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-[14px] p-4 sm:p-5 border border-line shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-cairo text-ink">
            دليل الموردين والمصانع ({suppliers.length})
          </h1>
          <p className="text-xs sm:text-sm text-copy-muted mt-0.5">
             إدارة بيانات الموردين وطلباتهم ومتابعة المرتجعات
          </p>
        </div>

        <button
          onClick={onOpenNewSupplier}
          className="flex items-center gap-1.5 bg-brass hover:bg-brass text-white px-4 py-2.5 rounded-[9px] text-xs sm:text-sm font-bold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مورد جديد</span>
        </button>
      </div>

      {/* Grid: Suppliers list (4 cols) & Supplier detailed orders dossier (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Suppliers List */}
        <div className={`lg:col-span-4 bg-white rounded-[14px] border border-line p-4 shadow-xs space-y-3 ${mobileShowDetail ? 'hidden lg:block' : 'block'}`}>
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-copy-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم المورد أو المنطقة..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-[9px] border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredSuppliers.map((s) => {
              const sOrders = orders.filter((o) => o.supplierId === s.id);
              const sPending = sOrders.filter((o) => o.status === 'pending').length;
              const isSelected = s.id === activeSupplierId;

              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSupplierId(s.id);
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
                      {s.name}
                    </div>
                    {s.address && (
                      <div className="text-[11px] text-copy-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-brass" />
                        <span>{s.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-xs font-bold text-ink font-cairo block">
                      {sOrders.length} طلب
                    </span>
                    {sPending > 0 && (
                      <span className="text-[10px] font-bold text-pending bg-pending-soft px-1.5 py-0.5 rounded">
                        {sPending} معلّق
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Supplier Dossier & Orders to bring on next trip */}
        <div className={`lg:col-span-8 bg-white rounded-[14px] border border-line p-4 sm:p-5 shadow-xs space-y-5 ${!mobileShowDetail ? 'hidden lg:block' : 'block'}`}>
          {/* Mobile Back Button */}
          <div className="lg:hidden pb-2 border-b border-paper-alt mb-1">
            <button
              onClick={() => setMobileShowDetail(false)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ink hover:text-brass bg-paper hover:bg-paper-alt px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>← العودة لقائمة الموردين</span>
            </button>
          </div>

          {activeSupplier ? (
            <>
              {/* Header with Supplier Details & Trip Sheet Button */}
              <div className="border-b border-paper-alt pb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-brass" />
                    <h2 className="text-xl font-extrabold font-cairo text-ink">
                      {activeSupplier.name}
                    </h2>
                  </div>
                  {activeSupplier.address && (
                    <p className="text-xs text-copy-muted mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brass" />
                      <span>{activeSupplier.address}</span>
                    </p>
                  )}
                  {activeSupplier.phone && (
                    <p className="text-xs text-copy-muted mt-0.5 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-copy-muted" />
                      <a href={`tel:${activeSupplier.phone}`} className="font-cairo font-bold hover:underline">
                        {activeSupplier.phone}
                      </a>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditSupplier(activeSupplier)}
                    className="p-2 text-copy-muted hover:text-ink hover:bg-paper rounded-lg border border-line"
                    title="تعديل المورد"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteSupplier(activeSupplier.id)}
                    className="p-2 text-copy-muted hover:text-late hover:bg-late-soft rounded-lg border border-line"
                    title="حذف المورد"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats for this supplier */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-paper rounded-[10px] border border-paper-alt">
                  <div className="text-xs text-copy-muted">إجمالي الطلبات</div>
                  <div className="text-lg font-bold font-cairo text-ink mt-1">
                    {activeSupplierOrders.length}
                  </div>
                </div>

                <div className="p-3 bg-paper-warm rounded-[10px] border border-pending-soft">
                  <div className="text-xs text-pending">مطلوب شراؤها (معلّق)</div>
                  <div className="text-lg font-bold font-cairo text-pending mt-1">
                    {pendingOrders.length}
                  </div>
                </div>

                <div className="p-3 bg-paper-warm rounded-[10px] border border-line-soft">
                  <div className="text-xs text-brass">مرتجعات للتسوية</div>
                  <div className="text-lg font-bold font-cairo text-brass mt-1">
                    {formatCurrency(totalReturnsValue)}
                  </div>
                </div>
              </div>

              {/* Orders connected to this supplier */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold font-cairo text-sm text-ink flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-brass" />
                    <span>الطلبات المطلوب إحضارها من هذا المورد ({activeSupplierOrders.length})</span>
                  </h3>
                </div>

                {activeSupplierOrders.length === 0 ? (
                  <div className="text-center py-8 bg-paper rounded-[10px] text-xs text-copy-muted">
                    لا توجد طلبات مسجلة لهذا المورد حالياً.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeSupplierOrders.map((order) => {
                      return (
                        <div
                          key={order.id}
                          className="p-3.5 rounded-[12px] border transition-all bg-white border-paper-alt"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-cairo text-xs font-bold text-ink">
                                  #{order.orderNumber}
                                </span>
                                <span className="text-xs font-semibold text-ink">
                                  العميل: {order.customerName}
                                </span>
                              </div>
                            </div>
                            <StatusBadge status={order.status} order={order} />
                          </div>

                          <div className="text-xs sm:text-sm text-charcoal bg-paper p-2.5 rounded-[8px] mb-2 leading-relaxed">
                            {order.description}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-paper-alt">
                            <span className="text-copy-muted">
                              تاريخ الطلب: {formatArabicDate(order.orderDate)}
                            </span>
                            <div className="flex items-center gap-3">
                              {order.price !== undefined && (
                                <span className="font-bold text-ink font-cairo">
                                  {formatCurrency(order.price)}
                                </span>
                              )}
                              <button
                                onClick={() => onToggleOrderStatus(order.id)}
                                className="text-xs font-bold text-done hover:underline"
                              >
                                {order.status === 'done' ? 'إعادة كمعلق' : '✓ تم الاستلام'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Returns connected to this supplier */}
              {activeSupplierReturns.length > 0 && (
                <div className="pt-4 border-t border-dashed border-line">
                  <h3 className="font-bold font-cairo text-sm text-late mb-2 flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4" />
                    <span>مرتجعات مع هذا المورد ({activeSupplierReturns.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {activeSupplierReturns.map((ret) => (
                      <div
                        key={ret.id}
                        className="p-2.5 rounded-[9px] bg-late-soft border border-late-soft flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-ink">{ret.productName}</div>
                          {ret.reason && (
                            <div className="text-[11px] text-copy-muted">السبب: {ret.reason}</div>
                          )}
                        </div>
                        <div className="text-left font-cairo font-bold text-late">
                          {formatCurrency(ret.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-copy-muted">
              اختر مورداً من القائمة لعرض تفاصيله
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
