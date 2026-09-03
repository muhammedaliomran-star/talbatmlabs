import React, { useState, useEffect } from 'react';
import { X, RotateCcw, DollarSign, Store, Tag, FileText, Calendar } from 'lucide-react';
import { Order, ReturnItem, ReturnStatus, Supplier } from '../types';
import { getTodayDateString, normalizeToEnglishDigits } from '../utils/helpers';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (returnData: Partial<ReturnItem>) => void;
  initialReturn?: ReturnItem | null;
  suppliers: Supplier[];
  orders: Order[];
  initialSupplierId?: string;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialReturn,
  suppliers,
  orders,
  initialSupplierId,
}) => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [reason, setReason] = useState('');
  const [returnDate, setReturnDate] = useState(getTodayDateString());
  const [status, setStatus] = useState<ReturnStatus>('pending_supplier');

  useEffect(() => {
    if (initialReturn) {
      setProductName(initialReturn.productName || '');
      setPrice(String(initialReturn.price || ''));
      setSupplierId(initialReturn.supplierId || '');
      setOrderId(initialReturn.orderId || '');
      setReason(initialReturn.reason || '');
      setReturnDate(initialReturn.returnDate || getTodayDateString());
      setStatus(initialReturn.status || 'pending_supplier');
    } else {
      setProductName('');
      setPrice('');
      setSupplierId(initialSupplierId || (suppliers[0]?.id || ''));
      setOrderId('');
      setReason('');
      setReturnDate(getTodayDateString());
      setStatus('pending_supplier');
    }
  }, [initialReturn, isOpen, initialSupplierId, suppliers]);

  if (!isOpen) return null;

  const handleOrderSelect = (selectedOrdId: string) => {
    setOrderId(selectedOrdId);
    if (selectedOrdId) {
      const foundOrder = orders.find((o) => o.id === selectedOrdId);
      if (foundOrder) {
        if (!productName) {
          setProductName(foundOrder.description);
        }
        if (!price && foundOrder.price) {
          setPrice(String(foundOrder.price));
        }
        if (foundOrder.supplierId) {
          setSupplierId(foundOrder.supplierId);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      alert('يرجى كتابة اسم المنتج المرتجع');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      alert('يرجى إدخال سعر المنتج المرتجع');
      return;
    }
    if (!supplierId) {
      alert('يرجى اختيار المورد');
      return;
    }

    const supplier = suppliers.find((s) => s.id === supplierId);
    const linkedOrder = orders.find((o) => o.id === orderId);

    onSave({
      productName: productName.trim(),
      price: numPrice,
      supplierId,
      supplierName: supplier?.name || 'مورد عام',
      orderId: orderId || undefined,
      customerName: linkedOrder?.customerName || undefined,
      reason: reason.trim() || undefined,
      returnDate,
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-[16px] w-full max-w-md border border-line shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-ink text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-late text-white flex items-center justify-center font-bold">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-cairo">
                {initialReturn ? 'تعديل بيانات المرتجع' : 'تسجيل مرتجع جديد لمورد'}
              </h2>
              <p className="text-xs text-ink-muted">تسجيل بضاعة معيبة أو مرتجعة للمحاسبة</p>
            </div>
          </div>
          <button type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-ink-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Linked order (optional) */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-brass" />
              <span>مرتبط بطلب عميل سابق؟</span>
              <span className="text-[10px] text-copy-muted font-normal">(اختياري)</span>
            </label>
            <select
              value={orderId}
              onChange={(e) => handleOrderSelect(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-[9px] border border-line bg-paper"
            >
              <option value="">-- مرتجع عام (غير مرتبط بطلب معين) --</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  #{o.orderNumber} - {o.customerName} ({o.description.substring(0, 30)}...)
                </option>
              ))}
            </select>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              اسم وتفاصيل الصنف المرتجع <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="مثال: جاكيت جينز مقاس 4 - عيب في السوستة"
              className="w-full px-3 py-2 text-sm rounded-[9px] border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass"
            />
          </div>

          {/* Price & Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                سعر / قيمة المرتجع (ج.م) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={price}
                onChange={(e) => setPrice(normalizeToEnglishDigits(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 text-sm rounded-[9px] border border-line bg-paper font-cairo font-semibold text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                المورد (هيترجع لمين) <span className="text-red-500">*</span>
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-[9px] border border-line bg-paper"
              >
                <option value="">-- اختر المورد --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-copy-muted" />
              <span>سبب الإرجاع</span>
              <span className="text-[10px] text-copy-muted font-normal">(عيب مصنعي / مقاس غير مطابق)</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: مقاس غير مطابق للعينة أو عيب في الخياطة"
              className="w-full px-3 py-2 text-sm rounded-[9px] border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass"
            />
          </div>

          {/* Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-copy-muted" />
                <span>تاريخ الإرجاع</span>
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-[9px] border border-line bg-paper"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                حالة المرتجع مع المورد
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReturnStatus)}
                className="w-full px-3 py-2 text-xs rounded-[9px] border border-line bg-paper"
              >
                <option value="pending_supplier">معلق (لم يُسلَم للمورد بعد)</option>
                <option value="refunded">تم استرداد المبلغ كاش / خصم من الحساب</option>
                <option value="exchanged">تم الاستبدال بقطعة سليمة</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-copy-muted hover:bg-paper rounded-[8px]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-late hover:bg-late text-white text-xs sm:text-sm font-bold rounded-[9px] shadow-sm transition-all"
            >
              {initialReturn ? 'حفظ التعديلات' : 'تسجيل المرتجع'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
