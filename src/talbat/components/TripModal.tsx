import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, CheckCircle2, ShoppingBag, Plus } from 'lucide-react';
import { Order, ShoppingTrip, TripStatus } from '../types';
import { getTodayDateString } from '../utils/helpers';

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tripData: Partial<ShoppingTrip>) => void;
  initialTrip?: ShoppingTrip | null;
  pendingOrders: Order[];
}

const COMMON_DESTINATIONS = [
  'سوق الموسكي والعتبة',
  'سوق الوكالة (بولاق)',
  'المحلة الكبرى',
  'العاشر من رمضان',
  'سوق المنشية (الإسكندرية)',
  'شبرا الخيمة',
];

export const TripModal: React.FC<TripModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTrip,
  pendingOrders,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [destination, setDestination] = useState('');
  const [status, setStatus] = useState<TripStatus>('planned');
  const [notes, setNotes] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  useEffect(() => {
    if (initialTrip) {
      setTitle(initialTrip.title || '');
      setDate(initialTrip.date || getTodayDateString());
      setDestination(initialTrip.destination || '');
      setStatus(initialTrip.status || 'planned');
      setNotes(initialTrip.notes || '');
      setSelectedOrderIds(initialTrip.items.map((it) => it.orderId));
    } else {
      // Default: 2 days ahead
      const d = new Date();
      d.setDate(d.getDate() + 2);
      const defaultDate = d.toISOString().split('T')[0];
      
      setTitle('رحلة تسوق وشراء');
      setDate(defaultDate);
      setDestination(COMMON_DESTINATIONS[0]);
      setStatus('planned');
      setNotes('');

      // Auto-suggest orders whose travelDate matches or is close
      const matchingIds = pendingOrders
        .filter((o) => o.status === 'pending')
        .slice(0, 5)
        .map((o) => o.id);
      setSelectedOrderIds(matchingIds);
    }
  }, [initialTrip, isOpen, pendingOrders]);

  if (!isOpen) return null;

  const toggleOrderSelection = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.length === pendingOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(pendingOrders.map((o) => o.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('يرجى كتابة عنوان للرحلة');
      return;
    }
    if (!date) {
      alert('يرجى تحديد تاريخ الرحلة');
      return;
    }

    const items = selectedOrderIds.map((orderId) => {
      const existing = initialTrip?.items.find((it) => it.orderId === orderId);
      return existing || { orderId, status: 'pending' as const };
    });

    onSave({
      title: title.trim(),
      date,
      destination: destination.trim(),
      status,
      notes: notes.trim() || undefined,
      items,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-[16px] w-full max-w-xl border border-line shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-ink text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brass text-white flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-cairo">
                {initialTrip ? 'تعديل رحلة الشراء' : 'تخطيط رحلة شراء جديدة (سفرية السوق)'}
              </h2>
              <p className="text-xs text-ink-muted">
                تجميع طلبيات العملاء في قائمة مراجعة واحدة للسوق
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                عنوان الرحلة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: رحلة الموسكي - الأحد"
                className="w-full px-3 py-2 text-sm rounded-[9px] border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brass" />
                <span>تاريخ النزول للسوق</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-[9px] border border-line bg-white font-semibold text-ink"
              />
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brass" />
              <span>السوق أو الوجهة المستهدفة</span>
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {COMMON_DESTINATIONS.map((dest) => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => setDestination(dest)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                    destination === dest
                      ? 'bg-ink text-white border-ink'
                      : 'bg-paper text-ink border-line hover:bg-pending-soft'
                  }`}
                >
                  {dest}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="اكتب الوجهة (مثال: محلات العتبة وزنقة الستات)"
              className="w-full px-3 py-1.5 text-xs rounded-[8px] border border-line bg-white focus:outline-none focus:border-brass"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">حالة الرحلة</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('planned')}
                className={`py-2 px-2 text-xs font-bold rounded-[8px] border transition-all ${
                  status === 'planned'
                    ? 'bg-pending-soft border-pending text-pending ring-1 ring-pending'
                    : 'bg-white border-line text-copy-muted hover:bg-paper'
                }`}
              >
                مجدولة (مخطط لها)
              </button>
              <button
                type="button"
                onClick={() => setStatus('in_progress')}
                className={`py-2 px-2 text-xs font-bold rounded-[8px] border transition-all ${
                  status === 'in_progress'
                    ? 'bg-size-soft border-ink text-ink ring-1 ring-ink'
                    : 'bg-white border-line text-copy-muted hover:bg-paper'
                }`}
              >
                جارية الآن في السوق
              </button>
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`py-2 px-2 text-xs font-bold rounded-[8px] border transition-all ${
                  status === 'completed'
                    ? 'bg-done-soft border-done text-done ring-1 ring-done'
                    : 'bg-white border-line text-copy-muted hover:bg-paper'
                }`}
              >
                تمت واكتملت
              </button>
            </div>
          </div>

          {/* Orders Checklist Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-ink">
                اختر طلبيات العملاء المدرجة في هذه الرحلة ({selectedOrderIds.length} محددة):
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-brass font-bold hover:underline"
              >
                {selectedOrderIds.length === pendingOrders.length ? 'إلغاء تحديد الكل' : 'تحديد جميع الطلبات'}
              </button>
            </div>

            <div className="border border-line rounded-[11px] max-h-48 overflow-y-auto divide-y divide-paper-alt bg-canvas-subtle">
              {pendingOrders.length === 0 ? (
                <div className="p-4 text-center text-xs text-copy-muted">
                  لا توجد طلبيات مسجلة حالياً
                </div>
              ) : (
                pendingOrders.map((order) => {
                  const isChecked = selectedOrderIds.includes(order.id);
                  return (
                    <div
                      key={order.id}
                      onClick={() => toggleOrderSelection(order.id)}
                      className={`p-2.5 flex items-center justify-between gap-2 cursor-pointer transition-colors text-xs ${
                        isChecked ? 'bg-color-soft' : 'hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by parent div
                          className="w-4 h-4 rounded text-brass focus:ring-brass"
                        />
                        <div>
                          <div className="font-bold font-cairo text-ink">
                            {order.customerName}
                            <span className="text-[10px] text-copy-muted mr-1.5 font-normal">
                              ({order.supplierName})
                            </span>
                          </div>
                          <div className="text-[11px] text-copy-muted line-clamp-1">
                            {order.description} {order.size ? `[مقاس: ${order.size}]` : ''} {order.color ? `[لون: ${order.color}]` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-bold font-cairo text-ink bg-paper px-1.5 py-0.5 rounded">
                          #{order.orderNumber}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1">
              ملاحظات الرحلة (تذكيرات شخصية، مصاريف، إلخ)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: المرور على مصنع الوفاء أولاً لتسليم مرتجع الجاكيت"
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
              <span>{initialTrip ? 'حفظ التعديلات' : 'إنشاء الرحلة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
