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
      <div className="bg-white rounded-[16px] w-full max-w-2xl border border-[#DED8CC] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header - Screen only */}
        <div className="no-print bg-[#1B2E4A] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#D3AE72]" />
            <h2 className="text-base sm:text-lg font-bold font-cairo">
              كشف استلام رحلة السفر والمورد
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#B08948] hover:bg-[#9E783B] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
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
        <div className="no-print p-4 bg-[#F6F4EF] border-b border-[#DED8CC] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <label className="font-bold text-[#1B2E4A]">اختر المورد:</label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="bg-white border border-[#DED8CC] rounded-md px-2.5 py-1 text-xs"
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
              className="rounded text-[#1B2E4A]"
            />
            <span className="font-semibold text-[#1B2E4A]">الطلبات المعلقة فقط (المطلوب إحضارها)</span>
          </label>
        </div>

        {/* Printable Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-white print:p-0">
          {/* Print Title */}
          <div className="border-b-2 border-[#1B2E4A] pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-extrabold font-cairo text-[#1B2E4A]">
                  دفتر — كشف تجهيز رحلة الشراء
                </h1>
                <p className="text-xs text-[#6C6A63] mt-1">
                  كشف بضائع مطلوب استلامها وتوريدها من المورد
                </p>
              </div>
              <div className="text-left text-xs text-[#6C6A63]">
                <div>تاريخ الكشف: {formatArabicDate(new Date().toISOString().split('T')[0])}</div>
                <div className="font-bold text-[#1B2E4A] mt-1">
                  إجمالي القطع: {supplierOrders.length}
                </div>
              </div>
            </div>

            {currentSupplier && (
              <div className="mt-3 p-2.5 bg-[#F6F4EF] rounded-[8px] flex flex-wrap justify-between text-xs">
                <div>
                  <span className="text-[#6C6A63]">المورد: </span>
                  <span className="font-bold text-[#1B2E4A]">{currentSupplier.name}</span>
                </div>
                {currentSupplier.phone && (
                  <div>
                    <span className="text-[#6C6A63]">الهاتف: </span>
                    <span className="font-cairo font-bold">{currentSupplier.phone}</span>
                  </div>
                )}
                {currentSupplier.address && (
                  <div>
                    <span className="text-[#6C6A63]">العنوان: </span>
                    <span>{currentSupplier.address}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Orders Checklist */}
          <div>
            <h3 className="font-bold font-cairo text-sm text-[#1B2E4A] mb-2 flex items-center gap-1.5">
              <span>قائمة الطلبات المطلوب شراؤها ({supplierOrders.length})</span>
            </h3>

            {supplierOrders.length === 0 ? (
              <div className="text-center py-8 text-[#6C6A63] text-xs bg-[#F6F4EF] rounded-[8px]">
                لا توجد طلبات معلقة مسجلة لهذا المورد حالياً
              </div>
            ) : (
              <table className="w-full text-right text-xs border border-[#DED8CC] rounded-[8px] overflow-hidden">
                <thead className="bg-[#1B2E4A] text-white">
                  <tr>
                    <th className="p-2.5 w-8 text-center">✓</th>
                    <th className="p-2.5">رقم</th>
                    <th className="p-2.5">العميل</th>
                    <th className="p-2.5">تفاصيل الصنف / المقاس / اللون</th>
                    <th className="p-2.5">ميعاد السفر</th>
                    <th className="p-2.5 text-left">السعر المتوقع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DED8CC]">
                  {supplierOrders.map((order, idx) => {
                    const isChecked = checkedOrders[order.id];
                    return (
                      <tr
                        key={order.id}
                        onClick={() => toggleCheck(order.id)}
                        className={`cursor-pointer transition-colors ${
                          isChecked ? 'bg-[#E7F0EA]/50' : idx % 2 === 0 ? 'bg-white' : 'bg-[#F6F4EF]'
                        }`}
                      >
                        <td className="p-2.5 text-center">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#3F7A5D] mx-auto" />
                          ) : (
                            <Square className="w-4 h-4 text-[#6C6A63] mx-auto" />
                          )}
                        </td>
                        <td className="p-2.5 font-cairo font-bold text-[#1B2E4A]">
                          #{order.orderNumber}
                        </td>
                        <td className="p-2.5 font-semibold text-[#1B2E4A]">
                          {order.customerName}
                          {order.customerPhone && (
                            <div className="text-[10px] text-[#6C6A63] font-cairo font-bold">
                              {order.customerPhone}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 font-medium leading-relaxed">
                          {order.description}
                          {order.notes && (
                            <div className="text-[11px] text-[#B8792A] italic">
                              ملاحظة: {order.notes}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 whitespace-nowrap text-[#6C6A63]">
                          {formatArabicDate(order.travelDate)}
                        </td>
                        <td className="p-2.5 text-left font-cairo font-bold text-[#1B2E4A] whitespace-nowrap">
                          {order.price ? formatCurrency(order.price) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {totalValue > 0 && (
                  <tfoot className="bg-[#FAF6EF] border-t-2 border-[#DED8CC] font-bold text-xs">
                    <tr>
                      <td colSpan={5} className="p-2.5 text-right text-[#1B2E4A]">
                        إجمالي القيمة التقديرية للطلبات:
                      </td>
                      <td className="p-2.5 text-left font-cairo text-sm text-[#1B2E4A]">
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
            <div className="mt-6 pt-4 border-t border-dashed border-[#DED8CC]">
              <h3 className="font-bold font-cairo text-sm text-[#B4463A] mb-2">
                مرتجعات للتسوية مع المورد في هذه الرحلة ({supplierReturns.length})
              </h3>
              <table className="w-full text-right text-xs border border-[#F4D1CD] rounded-[8px] overflow-hidden">
                <thead className="bg-[#B4463A] text-white">
                  <tr>
                    <th className="p-2">الصنف المرتجع</th>
                    <th className="p-2">السبب</th>
                    <th className="p-2">تاريخ المرتجع</th>
                    <th className="p-2 text-left">قيمة المرتجع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4D1CD]">
                  {supplierReturns.map((ret, i) => (
                    <tr key={ret.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FFF7F6]'}>
                      <td className="p-2 font-semibold text-[#1B2E4A]">{ret.productName}</td>
                      <td className="p-2 text-[#6C6A63]">{ret.reason || '—'}</td>
                      <td className="p-2 text-[#6C6A63]">{formatArabicDate(ret.returnDate)}</td>
                      <td className="p-2 text-left font-cairo font-bold text-[#B4463A]">
                        {formatCurrency(ret.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#F6E3E0] font-bold">
                  <tr>
                    <td colSpan={3} className="p-2 text-right text-[#B4463A]">
                      إجمالي قيمة المرتجعات للخصم من حساب المورد:
                    </td>
                    <td className="p-2 text-left font-cairo font-bold text-[#B4463A]">
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
