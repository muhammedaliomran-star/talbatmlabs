import React, { useState, useEffect } from 'react';
import { X, User, Phone, Store, Calendar, FileText, CheckCircle2, Layers, Palette, Hash } from 'lucide-react';
import { Customer, Order, OrderStatus, Supplier } from '../types';
import { getTodayDateString, normalizeToEnglishDigits } from '../utils/helpers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from './DatePicker';

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
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [notes, setNotes] = useState('');

  // Quick add supplier state
  const [showQuickSupplier, setShowQuickSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');

  // Suggestions for customers
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPhoneField, setShowPhoneField] = useState(false);
  const [showNotesField, setShowNotesField] = useState(false);
  const [showAllSizes, setShowAllSizes] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);

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
      setStatus(initialOrder.status || 'pending');
      setNotes(initialOrder.notes || '');
      setShowPhoneField(!!initialOrder.customerPhone);
      setShowNotesField(!!initialOrder.notes);
      setShowSpecs(!!(initialOrder.size || initialOrder.color || initialOrder.alternativeColor || (initialOrder.quantity && initialOrder.quantity !== 1)));
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
      
      setStatus('pending');
      setNotes('');
      setShowSpecs(typeof window !== 'undefined' ? window.innerWidth >= 640 : false);

      if (initialCustomerId) {
        const found = customers.find((c) => c.id === initialCustomerId);
        if (found) {
          setCustomerName(found.name);
          setCustomerPhone(found.phone || '');
          if (found.phone) setShowPhoneField(true);
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
      status,
      notes: notes.trim() || undefined,
    };

    onSave(orderPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs sm:items-center sm:p-4">
      <div className="flex max-h-[94dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[22px] border border-line bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 sm:max-h-[calc(100dvh-2rem)] sm:rounded-[16px] sm:zoom-in-95">
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between bg-ink px-4 py-3 text-white sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brass text-white flex items-center justify-center font-bold">
              {initialOrder ? '✎' : '+'}
            </div>
            <div>
              <h2 className="truncate text-base font-bold font-cairo sm:text-lg">
                {initialOrder ? `تعديل الطلب #${initialOrder.orderNumber}` : 'إضافة طلب جديد للعميل'}
              </h2>
              <p className="truncate text-[11px] text-ink-muted sm:text-xs">
                 تسجيل طلبية ملابس وتحديد العميل والمورد
              </p>
            </div>
          </div>
          <button type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-ink-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5">
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

            {showPhoneField ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-ink flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-brass" />
                    <span>رقم هاتف العميل</span>
                  </label>
                  <button type="button" onClick={() => { setShowPhoneField(false); setCustomerPhone(''); }} className="text-[11px] text-copy-muted hover:text-ink">إخفاء</button>
                </div>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(normalizeToEnglishDigits(e.target.value))}
                  placeholder="010XXXXXXXX"
                  dir="ltr"
                  className="w-full px-3 py-3 text-sm rounded-full border-0 ring-1 ring-line bg-paper focus:bg-white focus:outline-none focus:ring-2 focus:ring-brass/20 text-right font-cairo font-semibold min-h-[44px]"
                />
              </div>
            ) : (
              <div className="flex items-end">
                <button type="button" onClick={() => setShowPhoneField(true)} className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-paper px-4 py-2.5 text-xs font-bold text-ink ring-1 ring-line hover:bg-canvas transition-colors min-h-[44px]">
                  <Phone className="w-3.5 h-3.5 text-brass" /> + إضافة هاتف
                </button>
              </div>
            )}
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
              <div className="flex flex-col gap-2 rounded-[9px] border border-pending-soft bg-pending-soft/50 p-2 sm:flex-row">
                <input
                  type="text"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  placeholder="اسم المورد الجديد (مثال: توكيل الهدى)"
                  className="w-full flex-1 px-3 py-2 text-xs rounded-md bg-white border border-line focus:outline-none focus:border-brass"
                />
                <button
                  type="button"
                  onClick={handleCreateSupplier}
                  className="min-h-10 px-3 py-2 bg-brass text-white text-xs font-bold rounded-md hover:bg-brass"
                >
                  إضافة
                </button>
              </div>
            ) : null}

            <Select value={supplierId} onValueChange={setSupplierId} required>
              <SelectTrigger><SelectValue placeholder="-- اختر المورد المطلوب الشراء منه --" /></SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name} {s.address ? `(${s.address})` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* Quick Specifications Toggle - Phone */}
          <button type="button" onClick={() => setShowSpecs(!showSpecs)} className="sm:hidden w-full flex items-center justify-between rounded-full bg-paper px-4 py-2.5 text-xs font-bold text-ink ring-1 ring-line min-h-[44px]">
            <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-brass" /> تفاصيل المقاس واللون والكمية (اختياري)</span>
            <span className="text-brass">{showSpecs ? 'إخفاء' : 'إظهار'}</span>
          </button>
          <div className={`${showSpecs ? 'block' : 'hidden'} sm:block`}>
            <div className="p-3 bg-canvas-subtle rounded-[11px] border border-line-soft space-y-3">
            {/* Size & Quantity Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Size */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-brass" />
                  <span>المقاس (Size)</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {(showAllSizes ? COMMON_SIZES : COMMON_SIZES.slice(0, 6)).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full border-0 ring-1 transition-colors min-h-[32px] ${
                        size === s
                          ? 'bg-ink text-white ring-ink'
                          : 'bg-white text-ink ring-line hover:bg-pending-soft'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                  {COMMON_SIZES.length > 6 && (
                    <button type="button" onClick={() => setShowAllSizes(!showAllSizes)} className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-paper ring-1 ring-line hover:bg-canvas">
                      {showAllSizes ? 'أقل' : `+${COMMON_SIZES.length - 6} المزيد`}
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="أو اكتب المقاس هنا (مثال: 42 أو 8 سنوات)"
                  className="w-full px-3 py-2.5 text-xs rounded-full border-0 ring-1 ring-line bg-white focus:outline-none focus:ring-2 focus:ring-brass/20 min-h-[44px]"
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
                    className="w-11 h-11 rounded-full border-0 ring-1 ring-line bg-white hover:bg-paper font-bold text-ink flex items-center justify-center text-lg min-h-[44px] min-w-[44px]"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(normalizeToEnglishDigits(e.target.value)) || 1))}
                    className="w-16 h-11 text-center text-sm font-cairo font-bold rounded-full border-0 ring-1 ring-line bg-white focus:outline-none focus:ring-2 focus:ring-brass/20 min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-11 h-11 rounded-full border-0 ring-1 ring-line bg-white hover:bg-paper font-bold text-ink flex items-center justify-center text-lg min-h-[44px] min-w-[44px]"
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
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full border-0 ring-1 transition-colors min-h-[32px] ${
                        color === c
                          ? 'bg-ink text-white ring-ink'
                          : 'bg-white text-ink ring-line hover:bg-pending-soft'
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

              {/* Alternative Color - conditional */}
              {color.trim() && (
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
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full border-0 ring-1 transition-colors min-h-[32px] ${
                        alternativeColor === c
                          ? 'bg-brass text-white ring-brass'
                          : 'bg-white text-ink ring-line hover:bg-pending-soft'
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
                  className="w-full px-3 py-2.5 text-xs rounded-full border-0 ring-1 ring-line bg-white focus:outline-none focus:ring-2 focus:ring-brass/20 min-h-[44px]"
                />
              </div>
              )}
            </div>
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
                className={`py-2 px-3 text-xs font-bold rounded-full border-0 ring-1 transition-all min-h-[44px] ${
                  status === 'pending'
                    ? 'bg-pending-soft ring-pending text-pending'
                    : 'bg-white ring-line text-copy-muted hover:bg-paper'
                }`}
              >
                قيد الانتظار (معلّق)
              </button>
              <button
                type="button"
                onClick={() => setStatus('done')}
                className={`py-2 px-3 text-xs font-bold rounded-full border-0 ring-1 transition-all min-h-[44px] ${
                  status === 'done'
                    ? 'bg-done-soft ring-done text-done'
                    : 'bg-white ring-line text-copy-muted hover:bg-paper'
                }`}
              >
                تم التنفيذ والاستلام
              </button>
            </div>
          </div>

          {/* Order Date - Premium Picker */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-brass" />
              <span>تاريخ الطلب</span>
            </label>
            <DatePicker value={orderDate} onChange={setOrderDate} />
          </div>

          {/* Notes - collapsible */}
          {showNotesField ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-ink flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-brass" />
                  <span>ملاحظات إضافية</span>
                </label>
                <button type="button" onClick={() => { setShowNotesField(false); setNotes(''); }} className="text-[11px] text-copy-muted hover:text-ink">إخفاء</button>
              </div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: يرجى التأكد من الخامة، العميل مستعجل"
                className="w-full px-3 py-3 text-xs rounded-full border-0 ring-1 ring-line bg-paper focus:bg-white focus:outline-none focus:ring-2 focus:ring-brass/20 min-h-[44px]"
              />
            </div>
          ) : (
            <button type="button" onClick={() => setShowNotesField(true)} className="inline-flex items-center gap-1.5 rounded-full bg-paper px-4 py-2.5 text-xs font-bold text-ink ring-1 ring-line hover:bg-canvas transition-colors min-h-[44px]">
              <FileText className="w-3.5 h-3.5 text-brass" /> + إضافة ملاحظة
            </button>
          )}

          {/* Submit Actions */}
          <div className="sticky bottom-0 -mx-4 mt-2 flex items-center justify-end gap-2 border-t border-line bg-white px-4 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:-mx-5 sm:px-5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-10 px-4 py-2 text-xs font-bold text-copy-muted hover:bg-paper rounded-[8px]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="min-h-11 px-5 py-2.5 bg-ink hover:bg-ink-light text-white text-xs sm:px-6 sm:text-sm font-bold rounded-[9px] shadow-sm transition-all flex items-center gap-1.5"
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
