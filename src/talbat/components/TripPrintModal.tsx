import React, { useState } from 'react';
import { X, Printer, CheckSquare, Square, Store, Calendar, FileText } from 'lucide-react';
import { Order, ReturnItem, Supplier } from '../types';
import { formatArabicDate, formatCurrency } from '../utils/helpers';

interface TripPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier;
  suppliers: Supplier[];
  orders: Order[];
  returns: ReturnItem[];
}

export const TripPrintModal: React.FC<TripPrintModalProps> = ({
  isOpen,
  onClose,
  supplier,
  suppliers,
  orders,
  returns,
}) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    supplier?.id || suppliers[0]?.id || ''
  );
  const [onlyPending, setOnlyPending] = useState(true);
  const [checkedOrders, setCheckedOrders] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const currentSupplier = suppliers.find((s) => s.id === selectedSupplierId) || supplier;

  const supplierOrders = orders.filter((o) => {
    if (o.supplierId !== selectedSupplierId) return false;
    if (onlyPending && o.status === 'done') return false;
    return true;
  });

  const supplierReturns = returns.filter((r) => r.supplierId === selectedSupplierId);

  const toggleCheck = (id: string) => {
    setCheckedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const totalValue = supplierOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const totalReturns = supplierReturns.reduce((sum, r) => sum + (r.price || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-[16px] w-full max-w-2xl border border-line shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header - Screen only */}
        <div className="no-print bg-ink text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-brass-light" />
            <h2 className="text-base sm:text-lg font-bold font-cairo">
              كشف استلام رحلة السفر والمورد
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-brass hover:bg-brass text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الكشف</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Controls - Screen only */}
        <div className="no-print p-4 bg-paper border-b border-line flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <label className="font-bold text-ink">اختر المورد:</label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="bg-white border border-line rounded-md px-2.5 py-1 text-xs"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyPending}
              onChange={(e) => setOnlyPending(e.target.checked)}
              className="rounded text-ink"
            />
            <span className="font-semibold text-ink">الطلبات المعلقة فقط (المطلوب إحضارها)</span>
          </label>
        </div>

        {/* Printable Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-white print:p-0">
          {/* Print Title */}
          <div className="border-b-2 border-ink pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-extrabold font-cairo text-ink">
                  دفتر — كشف تجهيز رحلة الشراء
                </h1>
                <p className="text-xs text-copy-muted mt-1">
                  كشف بضائع مطلوب استلامها وتوريدها من المورد
                </p>
              </div>
              <div className="text-left text-xs text-copy-muted">
                <div>تاريخ الكشف: {formatArabicDate(new Date().toISOString().split('T')[0])}</div>
                <div className="font-bold text-ink mt-1">
                  إجمالي القطع: {supplierOrders.length}
                </div>
              </div>
            </div>

            {currentSupplier && (
              <div className="mt-3 p-2.5 bg-paper rounded-[8px] flex flex-wrap justify-between text-xs">
                <div>
                  <span className="text-copy-muted">المورد: </span>
                  <span className="font-bold text-ink">{currentSupplier.name}</span>
                </div>
                {currentSupplier.phone && (
                  <div>
                    <span className="text-copy-muted">الهاتف: </span>
                    <span className="font-cairo font-bold">{currentSupplier.phone}</span>
                  </div>
                )}
                {currentSupplier.address && (
                  <div>
                    <span className="text-copy-muted">العنوان: </span>
                    <span>{currentSupplier.address}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Orders Checklist */}
          <div>
            <h3 className="font-bold font-cairo text-sm text-ink mb-2 flex items-center gap-1.5">
              <span>قائمة الطلبات المطلوب شراؤها ({supplierOrders.length})</span>
            </h3>

            {supplierOrders.length === 0 ? (
              <div className="text-center py-8 text-copy-muted text-xs bg-paper rounded-[8px]">
                لا توجد طلبات معلقة مسجلة لهذا المورد حالياً
              </div>
            ) : (
              <table className="w-full text-right text-xs border border-line rounded-[8px] overflow-hidden">
                <thead className="bg-ink text-white">
                  <tr>
                    <th className="p-2.5 w-8 text-center">✓</th>
                    <th className="p-2.5">رقم</th>
                    <th className="p-2.5">العميل</th>
                    <th className="p-2.5">تفاصيل الصنف / المقاس / اللون</th>
                    <th className="p-2.5">ميعاد السفر</th>
                    <th className="p-2.5 text-left">السعر المتوقع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {supplierOrders.map((order, idx) => {
                    const isChecked = checkedOrders[order.id];
                    return (
                      <tr
                        key={order.id}
                        onClick={() => toggleCheck(order.id)}
                        className={`cursor-pointer transition-colors ${
                          isChecked ? 'bg-done-soft/50' : idx % 2 === 0 ? 'bg-white' : 'bg-paper'
                        }`}
                      >
                        <td className="p-2.5 text-center">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-done mx-auto" />
                          ) : (
                            <Square className="w-4 h-4 text-copy-muted mx-auto" />
                          )}
                        </td>
                        <td className="p-2.5 font-cairo font-bold text-ink">
                          #{order.orderNumber}
                        </td>
                        <td className="p-2.5 font-semibold text-ink">
                          {order.customerName}
                          {order.customerPhone && (
                            <div className="text-[10px] text-copy-muted font-cairo font-bold">
                              {order.customerPhone}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 font-medium leading-relaxed">
                          {order.description}
                          {order.notes && (
                            <div className="text-[11px] text-pending italic">
                              ملاحظة: {order.notes}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 whitespace-nowrap text-copy-muted">
                          {formatArabicDate(order.travelDate)}
                        </td>
                        <td className="p-2.5 text-left font-cairo font-bold text-ink whitespace-nowrap">
                          {order.price ? formatCurrency(order.price) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {totalValue > 0 && (
                  <tfoot className="bg-paper-warm border-t-2 border-line font-bold text-xs">
                    <tr>
                      <td colSpan={5} className="p-2.5 text-right text-ink">
                        إجمالي القيمة التقديرية للطلبات:
                      </td>
                      <td className="p-2.5 text-left font-cairo text-sm text-ink">
                        {formatCurrency(totalValue)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            )}
          </div>

          {/* Returns to settle with supplier */}
          {supplierReturns.length > 0 && (
            <div className="mt-6 pt-4 border-t border-dashed border-line">
              <h3 className="font-bold font-cairo text-sm text-late mb-2">
                مرتجعات للتسوية مع المورد في هذه الرحلة ({supplierReturns.length})
              </h3>
              <table className="w-full text-right text-xs border border-late-soft rounded-[8px] overflow-hidden">
                <thead className="bg-late text-white">
                  <tr>
                    <th className="p-2">الصنف المرتجع</th>
                    <th className="p-2">السبب</th>
                    <th className="p-2">تاريخ المرتجع</th>
                    <th className="p-2 text-left">قيمة المرتجع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-late-soft">
                  {supplierReturns.map((ret, i) => (
                    <tr key={ret.id} className={i % 2 === 0 ? 'bg-white' : 'bg-late-soft'}>
                      <td className="p-2 font-semibold text-ink">{ret.productName}</td>
                      <td className="p-2 text-copy-muted">{ret.reason || '—'}</td>
                      <td className="p-2 text-copy-muted">{formatArabicDate(ret.returnDate)}</td>
                      <td className="p-2 text-left font-cairo font-bold text-late">
                        {formatCurrency(ret.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-late-soft font-bold">
                  <tr>
                    <td colSpan={3} className="p-2 text-right text-late">
                      إجمالي قيمة المرتجعات للخصم من حساب المورد:
                    </td>
                    <td className="p-2 text-left font-cairo font-bold text-late">
                      {formatCurrency(totalReturns)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
