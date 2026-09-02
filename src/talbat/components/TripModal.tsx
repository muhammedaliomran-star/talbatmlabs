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
      <div className="bg-white rounded-[16px] w-full max-w-xl border border-[#DED8CC] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#1B2E4A] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B08948] text-white flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-cairo">
                {initialTrip ? 'تعديل رحلة الشراء' : 'تخطيط رحلة شراء جديدة (سفرية السوق)'}
              </h2>
              <p className="text-xs text-[#D9DEE7]">
                تجميع طلبيات العملاء في قائمة مراجعة واحدة للسوق
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#D9DEE7] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1B2E4A] mb-1.5">
                عنوان الرحلة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: رحلة الموسكي - الأحد"
                className="w-full px-3 py-2 text-sm rounded-[9px] border border-[#DED8CC] bg-[#F6F4EF] focus:bg-white focus:outline-none focus:border-[#B08948]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B2E4A] mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#B08948]" />
                <span>تاريخ النزول للسوق</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-[9px] border border-[#DED8CC] bg-white font-semibold text-[#1B2E4A]"
              />
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-bold text-[#1B2E4A] mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#B08948]" />
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
                      ? 'bg-[#1B2E4A] text-white border-[#1B2E4A]'
                      : 'bg-[#F6F4EF] text-[#1B2E4A] border-[#DED8CC] hover:bg-[#F6ECDC]'
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
              className="w-full px-3 py-1.5 text-xs rounded-[8px] border border-[#DED8CC] bg-white focus:outline-none focus:border-[#B08948]"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-[#1B2E4A] mb-1.5">حالة الرحلة</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('planned')}
                className={`py-2 px-2 text-xs font-bold rounded-[8px] border transition-all ${
                  status === 'planned'
                    ? 'bg-[#F6ECDC] border-[#B8792A] text-[#B8792A] ring-1 ring-[#B8792A]'
                    : 'bg-white border-[#DED8CC] text-[#6C6A63] hover:bg-[#F6F4EF]'
                }`}
              >
                مجدولة (مخطط لها)
              </button>
              <button
                type="button"
                onClick={() => setStatus('in_progress')}
                className={`py-2 px-2 text-xs font-bold rounded-[8px] border transition-all ${
                  status === 'in_progress'
                    ? 'bg-[#EBF0F7] border-[#1B2E4A] text-[#1B2E4A] ring-1 ring-[#1B2E4A]'
                    : 'bg-white border-[#DED8CC] text-[#6C6A63] hover:bg-[#F6F4EF]'
                }`}
              >
                جارية الآن في السوق
              </button>
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`py-2 px-2 text-xs font-bold rounded-[8px] border transition-all ${
                  status === 'completed'
                    ? 'bg-[#E7F0EA] border-[#3F7A5D] text-[#3F7A5D] ring-1 ring-[#3F7A5D]'
                    : 'bg-white border-[#DED8CC] text-[#6C6A63] hover:bg-[#F6F4EF]'
                }`}
              >
                تمت واكتملت
              </button>
            </div>
          </div>

          {/* Orders Checklist Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#1B2E4A]">
                اختر طلبيات العملاء المدرجة في هذه الرحلة ({selectedOrderIds.length} محددة):
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-[#B08948] font-bold hover:underline"
              >
                {selectedOrderIds.length === pendingOrders.length ? 'إلغاء تحديد الكل' : 'تحديد جميع الطلبات'}
              </button>
            </div>

            <div className="border border-[#DED8CC] rounded-[11px] max-h-48 overflow-y-auto divide-y divide-[#EFEBE2] bg-[#FDFCF9]">
              {pendingOrders.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#6C6A63]">
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
                        isChecked ? 'bg-[#FBF2E3]' : 'hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by parent div
                          className="w-4 h-4 rounded text-[#B08948] focus:ring-[#B08948]"
                        />
                        <div>
                          <div className="font-bold font-cairo text-[#1B2E4A]">
                            {order.customerName}
                            <span className="text-[10px] text-[#6C6A63] mr-1.5 font-normal">
                              ({order.supplierName})
                            </span>
                          </div>
                          <div className="text-[11px] text-[#6C6A63] line-clamp-1">
                            {order.description} {order.size ? `[مقاس: ${order.size}]` : ''} {order.color ? `[لون: ${order.color}]` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-bold font-cairo text-[#1B2E4A] bg-[#F6F4EF] px-1.5 py-0.5 rounded">
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
            <label className="block text-xs font-bold text-[#1B2E4A] mb-1">
              ملاحظات الرحلة (تذكيرات شخصية، مصاريف، إلخ)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: المرور على مصنع الوفاء أولاً لتسليم مرتجع الجاكيت"
              className="w-full px-3 py-1.5 text-xs rounded-[9px] border border-[#DED8CC] bg-[#F6F4EF]"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-[#DED8CC] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#6C6A63] hover:bg-[#F6F4EF] rounded-[8px]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1B2E4A] hover:bg-[#2C4568] text-white text-xs sm:text-sm font-bold rounded-[9px] shadow-sm transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#D3AE72]" />
              <span>{initialTrip ? 'حفظ التعديلات' : 'إنشاء الرحلة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
