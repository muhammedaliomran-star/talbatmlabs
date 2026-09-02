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
        <span className="text-[11px] font-bold text-[#6C6A63] bg-[#F6F4EF] px-2 py-0.5 rounded-full">
          مضت منذ {Math.abs(diff)} يوم
        </span>
      );
    }
    if (diff === 0) {
      return (
        <span className="text-[11px] font-bold text-[#B8792A] bg-[#FDF4E7] px-2 py-0.5 rounded-full animate-pulse">
          اليوم في السوق!
        </span>
      );
    }
    if (diff === 1) {
      return (
        <span className="text-[11px] font-bold text-[#B8792A] bg-[#FDF4E7] px-2 py-0.5 rounded-full">
          غداً
        </span>
      );
    }
    return (
      <span className="text-[11px] text-[#1B2E4A] bg-[#F6F4EF] px-2 py-0.5 rounded-full">
        بعد {diff} أيام
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header & New Trip action */}
      <div className="bg-white p-4 sm:p-5 rounded-[14px] border border-[#DED8CC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold font-cairo text-[#1B2E4A] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#B08948]" />
            <span>رحلات الشراء وتجميع الطلبيات (سفرية السوق)</span>
          </h1>
          <p className="text-xs text-[#6C6A63] mt-1">
            جمع طلبيات الزبائن لأسواق الموسكي والعتبة والوكالة في شيك ليست واحدة لسهولة الشراء والفحص
          </p>
        </div>

        <button
          onClick={onOpenNewTrip}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#1B2E4A] hover:bg-[#2C4568] text-white text-xs sm:text-sm font-bold rounded-[9px] shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D3AE72]" />
          <span>تخطيط رحلة شراء جديدة</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-[8px] font-bold transition-colors whitespace-nowrap ${
            filterStatus === 'all'
              ? 'bg-[#1B2E4A] text-white'
              : 'bg-white text-[#6C6A63] border border-[#DED8CC] hover:bg-[#F6F4EF]'
          }`}
        >
          جميع الرحلات ({trips.length})
        </button>
        <button
          onClick={() => setFilterStatus('planned')}
          className={`px-3 py-1.5 rounded-[8px] font-bold transition-colors whitespace-nowrap ${
            filterStatus === 'planned'
              ? 'bg-[#B8792A] text-white'
              : 'bg-white text-[#6C6A63] border border-[#DED8CC] hover:bg-[#F6F4EF]'
          }`}
        >
          مجدولة قادمة ({trips.filter((t) => t.status === 'planned').length})
        </button>
        <button
          onClick={() => setFilterStatus('in_progress')}
          className={`px-3 py-1.5 rounded-[8px] font-bold transition-colors whitespace-nowrap ${
            filterStatus === 'in_progress'
              ? 'bg-[#1B2E4A] text-white'
              : 'bg-white text-[#6C6A63] border border-[#DED8CC] hover:bg-[#F6F4EF]'
          }`}
        >
          جارية بالسوق ({trips.filter((t) => t.status === 'in_progress').length})
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-3 py-1.5 rounded-[8px] font-bold transition-colors whitespace-nowrap ${
            filterStatus === 'completed'
              ? 'bg-[#3F7A5D] text-white'
              : 'bg-white text-[#6C6A63] border border-[#DED8CC] hover:bg-[#F6F4EF]'
          }`}
        >
          مكتملة ({trips.filter((t) => t.status === 'completed').length})
        </button>
      </div>

      {/* Trips List */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white rounded-[14px] border border-[#DED8CC] p-10 text-center text-[#6C6A63]">
          <ShoppingBag className="w-10 h-10 mx-auto text-[#B08948] mb-2 opacity-50" />
          <p className="text-sm font-bold text-[#1B2E4A]">لا توجد رحلات شراء مسجلة في هذا القسم</p>
          <p className="text-xs text-[#6C6A63] mt-1">اضغط على زر (تخطيط رحلة شراء جديدة) لبدء التجميع</p>
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
                className="bg-white rounded-[14px] border border-[#DED8CC] shadow-xs overflow-hidden transition-all"
              >
                {/* Trip Card Top Bar */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#EFEBE2] bg-[#FCFBF8]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-[#1B2E4A] text-white flex items-center justify-center shrink-0 font-bold">
                      <ShoppingBag className="w-5 h-5 text-[#D3AE72]" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base sm:text-lg font-bold font-cairo text-[#1B2E4A]">
                          {trip.title}
                        </h2>
                        {getTripTimingBadge(trip.date)}
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            trip.status === 'completed'
                              ? 'bg-[#E7F0EA] text-[#3F7A5D]'
                              : trip.status === 'in_progress'
                              ? 'bg-[#EBF0F7] text-[#1B2E4A]'
                              : 'bg-[#FDF4E7] text-[#B8792A]'
                          }`}
                        >
                          {trip.status === 'completed'
                            ? 'مكتملة'
                            : trip.status === 'in_progress'
                            ? 'جارية الآن'
                            : 'مجدولة'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#6C6A63] mt-1.5">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#B08948]" />
                          <span>{formatArabicDate(trip.date)}</span>
                        </div>
                        {trip.destination && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#B08948]" />
                            <span>{trip.destination}</span>
                          </div>
                        )}
                        <span className="font-cairo font-semibold text-[#1B2E4A]">
                          {totalCount} طلبية مدرجة
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Progress Summary */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#EFEBE2]">
                    {/* Mini progress bar */}
                    <div className="w-36 hidden sm:block">
                      <div className="flex justify-between text-[11px] text-[#6C6A63] mb-1 font-cairo font-semibold">
                        <span>إنجاز الشراء:</span>
                        <span>{boughtCount}/{totalCount} ({progressPercent}%)</span>
                      </div>
                      <div className="w-full bg-[#EFEBE2] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#3F7A5D] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {trip.status !== 'completed' && (
                        <button
                          onClick={() => onUpdateTripStatus(trip.id, 'completed')}
                          className="px-2.5 py-1.5 bg-[#E7F0EA] hover:bg-[#D4E8DC] text-[#3F7A5D] text-xs font-bold rounded-[8px] transition-colors flex items-center gap-1"
                          title="إنهاء الرحلة"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">إنهاء الرحلة</span>
                        </button>
                      )}

                      <button
                        onClick={() => onEditTrip(trip)}
                        className="p-1.5 text-[#6C6A63] hover:text-[#1B2E4A] hover:bg-[#F6F4EF] rounded-[8px]"
                        title="تعديل الرحلة"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteTrip(trip.id)}
                        className="p-1.5 text-[#6C6A63] hover:text-[#B4463A] hover:bg-[#F6E3E0] rounded-[8px]"
                        title="حذف الرحلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleExpand(trip.id)}
                        className="p-1.5 text-[#1B2E4A] hover:bg-[#F6F4EF] rounded-[8px] flex items-center gap-1 font-bold text-xs"
                      >
                        <span>{isExpanded ? 'طي الطلبيات' : 'عرض الطلبيات'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Items Checklist */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-white divide-y divide-[#EFEBE2]">
                    {trip.notes && (
                      <div className="text-xs text-[#6C6A63] bg-[#FDF4E7] p-2.5 rounded-[8px] mb-3 border border-[#EED7BA]">
                        <span className="font-bold text-[#B8792A]">ملاحظات: </span>
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
                                ? 'bg-[#F4F9F6] border-[#D4E8DC]'
                                : item.status === 'unavailable'
                                ? 'bg-[#FFF8F7] border-[#FCDAD6]'
                                : 'bg-white border-[#EBE6DC]'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                              {/* Left / Main info */}
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="font-cairo font-bold text-xs text-[#1B2E4A] bg-[#F6F4EF] px-1.5 py-0.5 rounded">
                                    #{order.orderNumber}
                                  </span>
                                  <span className="font-bold text-sm text-[#1B2E4A]">
                                    {order.customerName}
                                  </span>
                                  <span className="text-xs text-[#6C6A63]">
                                    مورد: <strong className="text-[#1B2E4A]">{order.supplierName}</strong>
                                  </span>
                                </div>

                                <div className="text-xs text-[#24262B] font-medium mb-2">
                                  {order.description}
                                </div>

                                {/* Chips: Size, Color, Alternative Color */}
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                  {order.size && (
                                    <span className="px-2 py-0.5 rounded-md bg-[#EBF0F7] text-[#1B2E4A] font-semibold">
                                      المقاس: {order.size}
                                    </span>
                                  )}
                                  {order.color && (
                                    <span className="px-2 py-0.5 rounded-md bg-[#FBF2E3] text-[#B08948] font-semibold border border-[#EED7BA]/60">
                                      اللون: {order.color}
                                    </span>
                                  )}
                                  {order.alternativeColor && (
                                    <span className="px-2 py-0.5 rounded-md bg-[#FFF] text-[#6C6A63] border border-[#DED8CC] font-medium">
                                      البديل: <strong className="text-[#1B2E4A]">{order.alternativeColor}</strong>
                                    </span>
                                  )}
                                  {order.quantity && order.quantity > 1 && (
                                    <span className="px-2 py-0.5 rounded-md bg-[#E7F0EA] text-[#3F7A5D] font-bold font-cairo">
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
                                      ? 'bg-[#3F7A5D] text-white border-[#3F7A5D]'
                                      : 'bg-white text-[#3F7A5D] border-[#3F7A5D]/30 hover:bg-[#E7F0EA]'
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
                                      ? 'bg-[#B4463A] text-white border-[#B4463A]'
                                      : 'bg-white text-[#B4463A] border-[#B4463A]/30 hover:bg-[#FFF4F2]'
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
                                      ? 'bg-[#1B2E4A] text-white border-[#1B2E4A]'
                                      : 'bg-white text-[#6C6A63] border-[#DED8CC] hover:bg-[#F6F4EF]'
                                  }`}
                                >
                                  معلّق
                                </button>

                                {/* Direct WhatsApp Template Trigger */}
                                <button
                                  type="button"
                                  onClick={() => onOpenWhatsApp(order)}
                                  className="p-1.5 text-[#3F7A5D] hover:bg-[#E7F0EA] border border-[#3F7A5D]/30 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                                  title="إرسال واتساب للعميل (تأكيد أو اقتراح بديل)"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  <span className="hidden md:inline">واتساب</span>
                                </button>
                              </div>
                            </div>

                            {/* Prompt when marked unavailable */}
                            {item.status === 'unavailable' && (
                              <div className="mt-2 pt-2 border-t border-[#FCDAD6] flex flex-wrap items-center justify-between gap-2 text-xs text-[#B4463A]">
                                <span>
                                  ⚠️ القطعة غير متوفرة بالسوق. {order.alternativeColor ? `اللون البديل المسجل هو (${order.alternativeColor}).` : ''}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onOpenWhatsApp(order)}
                                  className="px-2.5 py-1 bg-[#1F6E43] hover:bg-[#185534] text-white text-xs font-bold rounded-md transition-colors flex items-center gap-1"
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
