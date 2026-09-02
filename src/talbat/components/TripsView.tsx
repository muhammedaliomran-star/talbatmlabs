import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Edit2,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Order, ShoppingTrip, TripItemStatus, TripStatus } from '../types';
import { formatArabicDate, getDaysDifference } from '../utils/helpers';

interface TripsViewProps {
  trips: ShoppingTrip[];
  orders: Order[];
  onOpenNewTrip: () => void;
  onEditTrip: (trip: ShoppingTrip) => void;
  onDeleteTrip: (tripId: string) => void;
  onUpdateTripItemStatus: (tripId: string, orderId: string, status: TripItemStatus) => void;
  onUpdateTripStatus: (tripId: string, status: TripStatus) => void;
  onOpenWhatsApp: (order: Order) => void;
}

export const TripsView: React.FC<TripsViewProps> = ({
  trips,
  orders,
  onOpenNewTrip,
  onEditTrip,
  onDeleteTrip,
  onUpdateTripItemStatus,
  onUpdateTripStatus,
  onOpenWhatsApp,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | TripStatus>('all');
  const [expandedTripIds, setExpandedTripIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedTripIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const filteredTrips = trips.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const getTripTimingBadge = (dateStr: string) => {
    const diff = getDaysDifference(dateStr);
    if (diff < 0) {
      return (
        <span className="text-[11px] font-bold text-copy-muted bg-paper px-2 py-0.5 rounded-full">
          مضت منذ {Math.abs(diff)} يوم
        </span>
      );
    }
    if (diff === 0) {
      return (
        <span className="text-[11px] font-bold text-pending bg-[#FDF4E7] px-2 py-0.5 rounded-full animate-pulse">
          اليوم في السوق!
        </span>
      );
    }
    if (diff === 1) {
      return (
        <span className="text-[11px] font-bold text-pending bg-[#FDF4E7] px-2 py-0.5 rounded-full">
          غداً
        </span>
      );
    }
    return (
      <span className="text-[11px] text-ink bg-paper px-2 py-0.5 rounded-full">
        بعد {diff} أيام
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header & New Trip action */}
      <div className="bg-white p-4 sm:p-5 rounded-[14px] border border-line shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold font-cairo text-ink flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brass" />
            <span>رحلات الشراء وتجميع الطلبيات (سفرية السوق)</span>
          </h1>
          <p className="text-xs text-copy-muted mt-1">
            جمع طلبيات الزبائن لأسواق الموسكي والعتبة والوكالة في شيك ليست واحدة لسهولة الشراء والفحص
          </p>
        </div>

        <button
          onClick={onOpenNewTrip}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-ink hover:bg-ink-light text-white text-xs sm:text-sm font-bold rounded-[9px] shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4 text-brass-light" />
          <span>تخطيط رحلة شراء جديدة</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-[8px] font-bold transition-colors whitespace-nowrap ${
            filterStatus === 'all'
              ? 'bg-ink text-white'
              : 'bg-white text-copy-muted border border-line hover:bg-paper'
          }`}
        >
          جميع الرحلات ({trips.length})
        </button>
        <button
          onClick={() => setFilterStatus('planned')}
          className={`px-3 py-1.5 rounded-[8px] font-bold transition-colors whitespace-nowrap ${
            filterStatus === 'planned'
              ? 'bg-pending text-white'
              : 'bg-white text-copy-muted border border-line hover:bg-paper'
          }`}
        >
          مجدولة قادمة ({trips.filter((t) => t.status === 'planned').length})
        </button>
        <button
          onClick={() => setFilterStatus('in_progress')}
          className={`px-3 py-1.5 rounded-[8px] font-bold transition-colors whitespace-nowrap ${
            filterStatus === 'in_progress'
              ? 'bg-ink text-white'
              : 'bg-white text-copy-muted border border-line hover:bg-paper'
          }`}
        >
          جارية بالسوق ({trips.filter((t) => t.status === 'in_progress').length})
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-3 py-1.5 rounded-[8px] font-bold transition-colors whitespace-nowrap ${
            filterStatus === 'completed'
              ? 'bg-done text-white'
              : 'bg-white text-copy-muted border border-line hover:bg-paper'
          }`}
        >
          مكتملة ({trips.filter((t) => t.status === 'completed').length})
        </button>
      </div>

      {/* Trips List */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white rounded-[14px] border border-line p-10 text-center text-copy-muted">
          <ShoppingBag className="w-10 h-10 mx-auto text-brass mb-2 opacity-50" />
          <p className="text-sm font-bold text-ink">لا توجد رحلات شراء مسجلة في هذا القسم</p>
          <p className="text-xs text-copy-muted mt-1">اضغط على زر (تخطيط رحلة شراء جديدة) لبدء التجميع</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredTrips.map((trip) => {
            const isExpanded = expandedTripIds.includes(trip.id) || trip.status === 'in_progress';
            const tripItems = trip.items.map((it) => ({
              ...it,
              order: orders.find((o) => o.id === it.orderId),
            }));

            const totalCount = trip.items.length;
            const boughtCount = trip.items.filter((it) => it.status === 'bought').length;
            const unavailableCount = trip.items.filter((it) => it.status === 'unavailable').length;
            const progressPercent = totalCount > 0 ? Math.round((boughtCount / totalCount) * 100) : 0;

            return (
              <div
                key={trip.id}
                className="bg-white rounded-[14px] border border-line shadow-xs overflow-hidden transition-all"
              >
                {/* Trip Card Top Bar */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-paper-alt bg-canvas-subtle">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-ink text-white flex items-center justify-center shrink-0 font-bold">
                      <ShoppingBag className="w-5 h-5 text-brass-light" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base sm:text-lg font-bold font-cairo text-ink">
                          {trip.title}
                        </h2>
                        {getTripTimingBadge(trip.date)}
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            trip.status === 'completed'
                              ? 'bg-done-soft text-done'
                              : trip.status === 'in_progress'
                              ? 'bg-size-soft text-ink'
                              : 'bg-[#FDF4E7] text-pending'
                          }`}
                        >
                          {trip.status === 'completed'
                            ? 'مكتملة'
                            : trip.status === 'in_progress'
                            ? 'جارية الآن'
                            : 'مجدولة'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-copy-muted mt-1.5">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-brass" />
                          <span>{formatArabicDate(trip.date)}</span>
                        </div>
                        {trip.destination && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-brass" />
                            <span>{trip.destination}</span>
                          </div>
                        )}
                        <span className="font-cairo font-semibold text-ink">
                          {totalCount} طلبية مدرجة
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Progress Summary */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-paper-alt">
                    {/* Mini progress bar */}
                    <div className="w-36 hidden sm:block">
                      <div className="flex justify-between text-[11px] text-copy-muted mb-1 font-cairo font-semibold">
                        <span>إنجاز الشراء:</span>
                        <span>{boughtCount}/{totalCount} ({progressPercent}%)</span>
                      </div>
                      <div className="w-full bg-paper-alt rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-done h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {trip.status !== 'completed' && (
                        <button
                          onClick={() => onUpdateTripStatus(trip.id, 'completed')}
                          className="px-2.5 py-1.5 bg-done-soft hover:bg-done-soft text-done text-xs font-bold rounded-[8px] transition-colors flex items-center gap-1"
                          title="إنهاء الرحلة"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">إنهاء الرحلة</span>
                        </button>
                      )}

                      <button
                        onClick={() => onEditTrip(trip)}
                        className="p-1.5 text-copy-muted hover:text-ink hover:bg-paper rounded-[8px]"
                        title="تعديل الرحلة"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteTrip(trip.id)}
                        className="p-1.5 text-copy-muted hover:text-late hover:bg-late-soft rounded-[8px]"
                        title="حذف الرحلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleExpand(trip.id)}
                        className="p-1.5 text-ink hover:bg-paper rounded-[8px] flex items-center gap-1 font-bold text-xs"
                      >
                        <span>{isExpanded ? 'طي الطلبيات' : 'عرض الطلبيات'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Items Checklist */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-white divide-y divide-paper-alt">
                    {trip.notes && (
                      <div className="text-xs text-copy-muted bg-[#FDF4E7] p-2.5 rounded-[8px] mb-3 border border-pending-soft">
                        <span className="font-bold text-pending">ملاحظات: </span>
                        {trip.notes}
                      </div>
                    )}

                    <div className="space-y-3">
                      {tripItems.map((item, idx) => {
                        const order = item.order;
                        if (!order) return null;

                        return (
                          <div
                            key={item.orderId}
                            className={`p-3 sm:p-3.5 rounded-[10px] border transition-all ${
                              item.status === 'bought'
                                ? 'bg-done-soft border-done-soft'
                                : item.status === 'unavailable'
                                ? 'bg-late-soft border-late-soft'
                                : 'bg-white border-[#EBE6DC]'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                              {/* Left / Main info */}
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="font-cairo font-bold text-xs text-ink bg-paper px-1.5 py-0.5 rounded">
                                    #{order.orderNumber}
                                  </span>
                                  <span className="font-bold text-sm text-ink">
                                    {order.customerName}
                                  </span>
                                  <span className="text-xs text-copy-muted">
                                    مورد: <strong className="text-ink">{order.supplierName}</strong>
                                  </span>
                                </div>

                                <div className="text-xs text-charcoal font-medium mb-2">
                                  {order.description}
                                </div>

                                {/* Chips: Size, Color, Alternative Color */}
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                  {order.size && (
                                    <span className="px-2 py-0.5 rounded-md bg-size-soft text-ink font-semibold">
                                      المقاس: {order.size}
                                    </span>
                                  )}
                                  {order.color && (
                                    <span className="px-2 py-0.5 rounded-md bg-color-soft text-brass font-semibold border border-pending-soft/60">
                                      اللون: {order.color}
                                    </span>
                                  )}
                                  {order.alternativeColor && (
                                    <span className="px-2 py-0.5 rounded-md bg-canvas text-copy-muted border border-line font-medium">
                                      البديل: <strong className="text-ink">{order.alternativeColor}</strong>
                                    </span>
                                  )}
                                  {order.quantity && order.quantity > 1 && (
                                    <span className="px-2 py-0.5 rounded-md bg-done-soft text-done font-bold font-cairo">
                                      الكمية: {order.quantity} قطع
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Right: Quick Checklist Buttons & WhatsApp */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-2 sm:pt-0">
                                <button
                                  type="button"
                                  onClick={() => onUpdateTripItemStatus(trip.id, item.orderId, 'bought')}
                                  className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${
                                    item.status === 'bought'
                                      ? 'bg-done text-white border-done'
                                      : 'bg-white text-done border-done/30 hover:bg-done-soft'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>تم الشراء</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onUpdateTripItemStatus(trip.id, item.orderId, 'unavailable')}
                                  className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${
                                    item.status === 'unavailable'
                                      ? 'bg-late text-white border-late'
                                      : 'bg-white text-late border-late/30 hover:bg-late-soft'
                                  }`}
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>غير متوفر</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onUpdateTripItemStatus(trip.id, item.orderId, 'pending')}
                                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                    item.status === 'pending'
                                      ? 'bg-ink text-white border-ink'
                                      : 'bg-white text-copy-muted border-line hover:bg-paper'
                                  }`}
                                >
                                  معلّق
                                </button>

                                {/* Direct WhatsApp Template Trigger */}
                                <button
                                  type="button"
                                  onClick={() => onOpenWhatsApp(order)}
                                  className="p-1.5 text-done hover:bg-done-soft border border-done/30 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                                  title="إرسال واتساب للعميل (تأكيد أو اقتراح بديل)"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  <span className="hidden md:inline">واتساب</span>
                                </button>
                              </div>
                            </div>

                            {/* Prompt when marked unavailable */}
                            {item.status === 'unavailable' && (
                              <div className="mt-2 pt-2 border-t border-late-soft flex flex-wrap items-center justify-between gap-2 text-xs text-late">
                                <span>
                                  ⚠️ القطعة غير متوفرة بالسوق. {order.alternativeColor ? `اللون البديل المسجل هو (${order.alternativeColor}).` : ''}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onOpenWhatsApp(order)}
                                  className="px-2.5 py-1 bg-done hover:bg-done text-white text-xs font-bold rounded-md transition-colors flex items-center gap-1"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>مراسلة العميل بالبديل الآن</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
