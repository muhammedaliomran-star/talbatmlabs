import React, { useState } from 'react';
import { Plus, Store, MapPin, Phone, Edit2, Trash2, Printer, ShoppingBag, RotateCcw, Check, Clock, Search } from 'lucide-react';
import { Order, ReturnItem, Supplier } from '../types';
import { formatArabicDate, formatCurrency, isOrderLate } from '../utils/helpers';
import { StatusBadge } from './StatusBadge';

interface SuppliersViewProps {
  suppliers: Supplier[];
  orders: Order[];
  returns: ReturnItem[];
  onOpenNewSupplier: () => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: string) => void;
  onOpenTripPrint: (supplier: Supplier) => void;
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
  onOpenTripPrint,
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
        .sort((a, b) => a.travelDate.localeCompare(b.travelDate))
    : [];

  const activeSupplierReturns = activeSupplier
    ? returns.filter((r) => r.supplierId === activeSupplier.id)
    : [];

  const pendingOrders = activeSupplierOrders.filter((o) => o.status === 'pending');
  const lateOrders = activeSupplierOrders.filter((o) => isOrderLate(o));
  const totalOrdersValue = activeSupplierOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const totalReturnsValue = activeSupplierReturns.reduce((sum, r) => sum + (r.price || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-[14px] p-4 sm:p-5 border border-[#DED8CC] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-cairo text-[#1B2E4A]">
            دليل الموردين والمصانع ({suppliers.length})
          </h1>
          <p className="text-xs sm:text-sm text-[#6C6A63] mt-0.5">
            إدارة بيانات الموردين، تجهيز كشوف رحلات الشراء، ومتابعة المرتجعات
          </p>
        </div>

        <button
          onClick={onOpenNewSupplier}
          className="flex items-center gap-1.5 bg-[#B08948] hover:bg-[#9E783B] text-white px-4 py-2.5 rounded-[9px] text-xs sm:text-sm font-bold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مورد جديد</span>
        </button>
      </div>

      {/* Grid: Suppliers list (4 cols) & Supplier detailed orders dossier (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Suppliers List */}
        <div className={`lg:col-span-4 bg-white rounded-[14px] border border-[#DED8CC] p-4 shadow-xs space-y-3 ${mobileShowDetail ? 'hidden lg:block' : 'block'}`}>
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#6C6A63]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم المورد أو المنطقة..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-[9px] border border-[#DED8CC] bg-[#F6F4EF] focus:bg-white focus:outline-none focus:border-[#B08948]"
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
                      ? 'bg-[#FAF6EF] border-[#B08948] ring-1 ring-[#B08948]'
                      : 'bg-white border-[#EFEBE2] hover:bg-[#F6F4EF]'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm font-cairo text-[#1B2E4A]">
                      {s.name}
                    </div>
                    {s.address && (
                      <div className="text-[11px] text-[#6C6A63] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#B08948]" />
                        <span>{s.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-xs font-bold text-[#1B2E4A] font-cairo block">
                      {sOrders.length} طلب
                    </span>
                    {sPending > 0 && (
                      <span className="text-[10px] font-bold text-[#B8792A] bg-[#F6ECDC] px-1.5 py-0.5 rounded">
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
        <div className={`lg:col-span-8 bg-white rounded-[14px] border border-[#DED8CC] p-4 sm:p-5 shadow-xs space-y-5 ${!mobileShowDetail ? 'hidden lg:block' : 'block'}`}>
          {/* Mobile Back Button */}
          <div className="lg:hidden pb-2 border-b border-[#EFEBE2] mb-1">
            <button
              onClick={() => setMobileShowDetail(false)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B2E4A] hover:text-[#B08948] bg-[#F6F4EF] hover:bg-[#EAE5DA] px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>← العودة لقائمة الموردين</span>
            </button>
          </div>

          {activeSupplier ? (
            <>
              {/* Header with Supplier Details & Trip Sheet Button */}
              <div className="border-b border-[#EFEBE2] pb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#B08948]" />
                    <h2 className="text-xl font-extrabold font-cairo text-[#1B2E4A]">
                      {activeSupplier.name}
                    </h2>
                  </div>
                  {activeSupplier.address && (
                    <p className="text-xs text-[#6C6A63] mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#B08948]" />
                      <span>{activeSupplier.address}</span>
                    </p>
                  )}
                  {activeSupplier.phone && (
                    <p className="text-xs text-[#6C6A63] mt-0.5 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#6C6A63]" />
                      <a href={`tel:${activeSupplier.phone}`} className="font-cairo font-bold hover:underline">
                        {activeSupplier.phone}
                      </a>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenTripPrint(activeSupplier)}
                    className="flex items-center gap-1.5 bg-[#1B2E4A] hover:bg-[#2C4568] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs"
                    title="تجهيز كشف مطبوع للسفر"
                  >
                    <Printer className="w-4 h-4 text-[#D3AE72]" />
                    <span>كشف رحلة السفر للمورد</span>
                  </button>

                  <button
                    onClick={() => onEditSupplier(activeSupplier)}
                    className="p-2 text-[#6C6A63] hover:text-[#1B2E4A] hover:bg-[#F6F4EF] rounded-lg border border-[#DED8CC]"
                    title="تعديل المورد"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteSupplier(activeSupplier.id)}
                    className="p-2 text-[#6C6A63] hover:text-[#B4463A] hover:bg-[#F6E3E0] rounded-lg border border-[#DED8CC]"
                    title="حذف المورد"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats for this supplier */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#F6F4EF] rounded-[10px] border border-[#EFEBE2]">
                  <div className="text-xs text-[#6C6A63]">إجمالي الطلبات</div>
                  <div className="text-lg font-bold font-cairo text-[#1B2E4A] mt-1">
                    {activeSupplierOrders.length}
                  </div>
                </div>

                <div className="p-3 bg-[#FFFBF7] rounded-[10px] border border-[#EED7BA]">
                  <div className="text-xs text-[#B8792A]">مطلوب شراؤها (معلّق)</div>
                  <div className="text-lg font-bold font-cairo text-[#B8792A] mt-1">
                    {pendingOrders.length}
                  </div>
                </div>

                <div className="p-3 bg-[#FFF7F6] rounded-[10px] border border-[#F4D1CD]">
                  <div className="text-xs text-[#B4463A]">طلبات متأخرة</div>
                  <div className="text-lg font-bold font-cairo text-[#B4463A] mt-1">
                    {lateOrders.length}
                  </div>
                </div>

                <div className="p-3 bg-[#FAF6EF] rounded-[10px] border border-[#EAE1D2]">
                  <div className="text-xs text-[#B08948]">مرتجعات للتسوية</div>
                  <div className="text-lg font-bold font-cairo text-[#B08948] mt-1">
                    {formatCurrency(totalReturnsValue)}
                  </div>
                </div>
              </div>

              {/* Orders connected to this supplier */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold font-cairo text-sm text-[#1B2E4A] flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-[#B08948]" />
                    <span>الطلبات المطلوب إحضارها من هذا المورد ({activeSupplierOrders.length})</span>
                  </h3>
                </div>

                {activeSupplierOrders.length === 0 ? (
                  <div className="text-center py-8 bg-[#F6F4EF] rounded-[10px] text-xs text-[#6C6A63]">
                    لا توجد طلبات مسجلة لهذا المورد حالياً.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeSupplierOrders.map((order) => {
                      const late = isOrderLate(order);
                      return (
                        <div
                          key={order.id}
                          className={`p-3.5 rounded-[12px] border transition-all ${
                            late
                              ? 'bg-[#FFF9F8] border-[#F4D1CD]'
                              : 'bg-white border-[#EFEBE2]'
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-cairo text-xs font-bold text-[#1B2E4A]">
                                  #{order.orderNumber}
                                </span>
                                <span className="text-xs font-semibold text-[#1B2E4A]">
                                  العميل: {order.customerName}
                                </span>
                              </div>
                            </div>
                            <StatusBadge status={order.status} order={order} />
                          </div>

                          <div className="text-xs sm:text-sm text-[#24262B] bg-[#F6F4EF] p-2.5 rounded-[8px] mb-2 leading-relaxed">
                            {order.description}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-[#EFEBE2]">
                            <span className="text-[#6C6A63]">
                              ميعاد السفر: {formatArabicDate(order.travelDate)}
                            </span>
                            <div className="flex items-center gap-3">
                              {order.price !== undefined && (
                                <span className="font-bold text-[#1B2E4A] font-cairo">
                                  {formatCurrency(order.price)}
                                </span>
                              )}
                              <button
                                onClick={() => onToggleOrderStatus(order.id)}
                                className="text-xs font-bold text-[#3F7A5D] hover:underline"
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
                <div className="pt-4 border-t border-dashed border-[#DED8CC]">
                  <h3 className="font-bold font-cairo text-sm text-[#B4463A] mb-2 flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4" />
                    <span>مرتجعات مع هذا المورد ({activeSupplierReturns.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {activeSupplierReturns.map((ret) => (
                      <div
                        key={ret.id}
                        className="p-2.5 rounded-[9px] bg-[#FFF7F6] border border-[#F4D1CD] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-[#1B2E4A]">{ret.productName}</div>
                          {ret.reason && (
                            <div className="text-[11px] text-[#6C6A63]">السبب: {ret.reason}</div>
                          )}
                        </div>
                        <div className="text-left font-cairo font-bold text-[#B4463A]">
                          {formatCurrency(ret.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-[#6C6A63]">
              اختر مورداً من القائمة لعرض تفاصيله
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
