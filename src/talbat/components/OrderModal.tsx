import React, { useState, useEffect } from 'react';
import { X, User, Phone, Store, Calendar, FileText, CheckCircle2, Layers, Palette, Hash } from 'lucide-react';
import { Customer, Order, OrderStatus, Supplier } from '../types';
import { getTodayDateString, normalizeToEnglishDigits } from '../utils/helpers';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Partial<Order>) => void;
  initialOrder?: Order | null;
  customers: Customer[];
  suppliers: Supplier[];
  onQuickAddSupplier: (supplierName: string) => Supplier;
  initialCustomerId?: string;
  initialSupplierId?: string;
}

const COMMON_SIZES = ['حر', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'أطفال'];
const COMMON_COLORS = ['أسود', 'أبيض', 'كحلي', 'بيج', 'رمادي', 'نبيتي', 'زيتي', 'وردي', 'بني', 'جينز'];

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialOrder,
  customers,
  suppliers,
  onQuickAddSupplier,
  initialCustomerId,
  initialSupplierId,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [alternativeColor, setAlternativeColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [orderDate, setOrderDate] = useState(getTodayDateString());
  const [travelDate, setTravelDate] = useState('');
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [notes, setNotes] = useState('');

  // Quick add supplier state
  const [showQuickSupplier, setShowQuickSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');

  // Suggestions for customers
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (initialOrder) {
      setCustomerName(initialOrder.customerName || '');
      setCustomerPhone(initialOrder.customerPhone || '');
      setSupplierId(initialOrder.supplierId || '');
      setDescription(initialOrder.description || '');
      setSize(initialOrder.size || '');
      setColor(initialOrder.color || '');
      setAlternativeColor(initialOrder.alternativeColor || '');
      setQuantity(initialOrder.quantity || 1);
      setOrderDate(initialOrder.orderDate || getTodayDateString());
      setTravelDate(initialOrder.travelDate || '');
      setStatus(initialOrder.status || 'pending');
      setNotes(initialOrder.notes || '');
    } else {
      // New order defaults
      setCustomerName('');
      setCustomerPhone('');
      setSupplierId(initialSupplierId || (suppliers[0]?.id || ''));
      setDescription('');
      setSize('');
      setColor('');
      setAlternativeColor('');
      setQuantity(1);
      setOrderDate(getTodayDateString());
      
      // Default travel date: 3 days from now
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setTravelDate(d.toISOString().split('T')[0]);
      
      setStatus('pending');
      setNotes('');

      if (initialCustomerId) {
        const found = customers.find((c) => c.id === initialCustomerId);
        if (found) {
          setCustomerName(found.name);
          setCustomerPhone(found.phone || '');
        }
      }
    }
  }, [initialOrder, isOpen, initialCustomerId, initialSupplierId, customers, suppliers]);

  if (!isOpen) return null;

  const handleCustomerNameChange = (val: string) => {
    setCustomerName(val);
    if (val.trim().length > 0) {
      const filtered = customers.filter((c) =>
        c.name.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions(customers.slice(0, 8));
      setShowSuggestions(customers.length > 0);
    }
  };

  const handleSelectCustomer = (cust: Customer) => {
    setCustomerName(cust.name);
    if (cust.phone) {
      setCustomerPhone(cust.phone);
    }
    setShowSuggestions(false);
  };

  const handleCreateSupplier = () => {
    if (!newSupplierName.trim()) return;
    const added = onQuickAddSupplier(newSupplierName.trim());
    setSupplierId(added.id);
    setNewSupplierName('');
    setShowQuickSupplier(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('يرجى إدخال اسم العميل');
      return;
    }
    if (!supplierId) {
      alert('يرجى اختيار المورد');
      return;
    }
    if (!description.trim()) {
      alert('يرجى كتابة تفاصيل الطلب');
      return;
    }
    if (!travelDate) {
      alert('يرجى تحديد يوم السفر (ميعاد التوريد)');
      return;
    }

    const selectedSupplier = suppliers.find((s) => s.id === supplierId);

    const orderPayload: Partial<Order> = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      supplierId,
      supplierName: selectedSupplier?.name || 'مورد عام',
      description: description.trim(),
      size: size.trim() || undefined,
      color: color.trim() || undefined,
      alternativeColor: alternativeColor.trim() || undefined,
      quantity: Math.max(1, Number(quantity) || 1),
      orderDate,
      travelDate,
      status,
      notes: notes.trim() || undefined,
    };

    onSave(orderPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-[16px] w-full max-w-lg border border-line shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-ink text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brass text-white flex items-center justify-center font-bold">
              {initialOrder ? '✎' : '+'}
            </div>
            <div>
              <h2 className="text-lg font-bold font-cairo">
                {initialOrder ? `تعديل الطلب #${initialOrder.orderNumber}` : 'إضافة طلب جديد للعميل'}
              </h2>
              <p className="text-xs text-ink-muted">
                تسجيل طلبية ملابس وتحديد المورد وميعاد السفر
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-ink-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-brass" />
                <span>اسم العميل</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => handleCustomerNameChange(e.target.value)}
                onFocus={() => {
                  if (customerName.trim().length > 0) {
                    const filtered = customers.filter((c) =>
                      c.name.toLowerCase().includes(customerName.toLowerCase())
                    );
                    setSuggestions(filtered);
                    setShowSuggestions(filtered.length > 0);
                  } else if (customers.length > 0) {
                    setSuggestions(customers.slice(0, 8));
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding suggestions so clicks register
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="مثال: أحمد عبد الله"
                className="w-full px-3 py-2 text-sm rounded-[9px] border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-30 top-full right-0 left-0 mt-1 bg-white border border-line rounded-[10px] shadow-xl max-h-40 overflow-y-auto">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-copy-muted bg-paper-warm border-b border-line-soft flex items-center justify-between">
                    <span>اختر عميلاً سابقاً للتعبئة التلقائية:</span>
                    <span>{suggestions.length}</span>
                  </div>
                  {suggestions.map((cust) => (
                    <button
                      key={cust.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectCustomer(cust);
                      }}
                      onClick={() => handleSelectCustomer(cust)}
                      className="w-full text-right px-3 py-2 text-xs hover:bg-paper-warm border-b border-paper last:border-0 flex justify-between items-center transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brass" />
                        <span className="font-semibold text-ink group-hover:text-brass">{cust.name}</span>
                      </div>
                      <span className="text-copy-muted text-[11px] font-cairo dir-ltr">{cust.phone || 'بدون هاتف'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-brass" />
                <span>رقم هاتف العميل</span>
                <span className="text-[10px] text-copy-muted font-normal">(اختياري)</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(normalizeToEnglishDigits(e.target.value))}
                placeholder="010XXXXXXXX"
                dir="ltr"
                className="w-full px-3 py-2 text-sm rounded-[9px] border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass text-right font-cairo font-semibold"
              />
            </div>
          </div>

          {/* Supplier Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-ink flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-brass" />
                <span>اسم المورد</span>
                <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowQuickSupplier(!showQuickSupplier)}
                className="text-[11px] font-bold text-brass hover:underline"
              >
                {showQuickSupplier ? 'إلغاء' : '+ مورد جديد سريعاً'}
              </button>
            </div>

            {showQuickSupplier ? (
              <div className="flex gap-2 p-2 bg-pending-soft/50 rounded-[9px] border border-pending-soft mb-2">
                <input
                  type="text"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  placeholder="اسم المورد الجديد (مثال: توكيل الهدى)"
                  className="flex-1 px-3 py-1.5 text-xs rounded-md bg-white border border-line focus:outline-none focus:border-brass"
                />
                <button
                  type="button"
                  onClick={handleCreateSupplier}
                  className="px-3 py-1.5 bg-brass text-white text-xs font-bold rounded-md hover:bg-brass"
                >
                  إضافة
                </button>
              </div>
            ) : null}

            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-[9px] border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass"
            >
              <option value="">-- اختر المورد المطلوب الشراء منه --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.address ? `(${s.address})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Description (Items, details) */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-brass" />
              <span>اسم وتفاصيل الموديل / الصنف</span>
              <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: فستان سهرة كحلي بكاب لؤلؤ، أو بنطلون جينز شارلستون"
              className="w-full px-3 py-2 text-sm rounded-[9px] border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass"
            />
          </div>

          {/* Quick Specifications: Size, Quantity, Colors */}
          <div className="p-3 bg-canvas-subtle rounded-[11px] border border-line-soft space-y-3">
            {/* Size & Quantity Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Size */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-brass" />
                  <span>المقاس (Size)</span>
                </label>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {COMMON_SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-colors ${
                        size === s
                          ? 'bg-ink text-white border-ink'
                          : 'bg-white text-ink border-line hover:bg-pending-soft'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="أو اكتب المقاس هنا (مثال: 42 أو 8 سنوات)"
                  className="w-full px-3 py-1.5 text-xs rounded-[8px] border border-line bg-white focus:outline-none focus:border-brass"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-brass" />
                  <span>الكمية / العدد المطلوب</span>
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg border border-line bg-white hover:bg-paper font-bold text-ink flex items-center justify-center text-base"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(normalizeToEnglishDigits(e.target.value)) || 1))}
                    className="w-16 h-8 text-center text-sm font-cairo font-bold rounded-lg border border-line bg-white focus:outline-none focus:border-brass"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-lg border border-line bg-white hover:bg-paper font-bold text-ink flex items-center justify-center text-base"
                  >
                    +
                  </button>
                  <span className="text-xs text-copy-muted font-cairo mr-1">قطعة</span>
                </div>
              </div>
            </div>

            {/* Colors: Primary & Alternative */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-line-soft">
              {/* Primary Color */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-brass" />
                  <span>اللون الأساسي المطلوب</span>
                </label>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {COMMON_COLORS.slice(0, 6).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-colors ${
                        color === c
                          ? 'bg-ink text-white border-ink'
                          : 'bg-white text-ink border-line hover:bg-pending-soft'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="مثال: أسود ملكي أو كحلي"
                  className="w-full px-3 py-1.5 text-xs rounded-[8px] border border-line bg-white focus:outline-none focus:border-brass"
                />
              </div>

              {/* Alternative Color */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-ink flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-copy-muted" />
                    <span>اللون البديل</span>
                  </label>
                  <span className="text-[10px] text-pending font-semibold">إذا لم يتوفر الأساسي</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {COMMON_COLORS.slice(0, 6).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAlternativeColor(c)}
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-colors ${
                        alternativeColor === c
                          ? 'bg-brass text-white border-brass'
                          : 'bg-white text-ink border-line hover:bg-pending-soft'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={alternativeColor}
                  onChange={(e) => setAlternativeColor(e.target.value)}
                  placeholder="مثال: رمادي أو بني (اختياري)"
                  className="w-full px-3 py-1.5 text-xs rounded-[8px] border border-line bg-white focus:outline-none focus:border-brass"
                />
              </div>
            </div>
          </div>

          {/* Dates: Order Date & Travel Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-copy-muted" />
                <span>تاريخ الطلب</span>
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-[9px] border border-line bg-paper"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-late" />
                <span>يوم السفر (ميعاد التوريد)</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-[9px] border border-brass bg-white font-semibold text-ink"
              />
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              حالة الطلب
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`py-2 px-3 text-xs font-bold rounded-[8px] border transition-all ${
                  status === 'pending'
                    ? 'bg-pending-soft border-pending text-pending ring-1 ring-pending'
                    : 'bg-white border-line text-copy-muted hover:bg-paper'
                }`}
              >
                قيد الانتظار (معلّق)
              </button>
              <button
                type="button"
                onClick={() => setStatus('done')}
                className={`py-2 px-3 text-xs font-bold rounded-[8px] border transition-all ${
                  status === 'done'
                    ? 'bg-done-soft border-done text-done ring-1 ring-done'
                    : 'bg-white border-line text-copy-muted hover:bg-paper'
                }`}
              >
                تم التنفيذ والاستلام
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1">
              ملاحظات إضافية
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: يرجى التأكد من الخامة، العميل مستعجل"
              className="w-full px-3 py-1.5 text-xs rounded-[9px] border border-line bg-paper"
            />
          </div>

          {/* Submit Actions */}
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
              className="px-6 py-2.5 bg-ink hover:bg-ink-light text-white text-xs sm:text-sm font-bold rounded-[9px] shadow-sm transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-brass-light" />
              <span>{initialOrder ? 'حفظ التعديلات' : 'تسجيل الطلب'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
