import React from 'react';
import { Check, Clock, Edit2, MessageCircle, MoreVertical, Trash2, Calendar, Phone, Store } from 'lucide-react';
import { Order } from '../types';
import { formatArabicDate, formatCurrency, createWhatsAppUrl, isOrderLate, getDaysDifference } from '../utils/helpers';
import { StatusBadge } from './StatusBadge';

interface OrderCardProps {
  order: Order;
  onToggleStatus: (orderId: string) => void;
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
  onSelectCustomer?: (customerName: string) => void;
  onSelectSupplier?: (supplierId: string) => void;
  onOpenWhatsApp?: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onToggleStatus,
  onEdit,
  onDelete,
  onSelectCustomer,
  onSelectSupplier,
  onOpenWhatsApp,
}) => {
  const late = isOrderLate(order);
  const daysDiff = getDaysDifference(order.travelDate);

  const remaining = (order.price || 0) - (order.deposit || 0);

  const getTravelDayBadge = () => {
    if (order.status === 'done') {
      return <span className="text-xs text-done">تم التسليم</span>;
    }
    if (late) {
      return (
        <span className="text-xs font-semibold text-late">
          متأخر {Math.abs(daysDiff)} يوم
        </span>
      );
    }
    if (daysDiff === 0) {
      return <span className="text-xs font-bold text-pending animate-pulse">السفر اليوم!</span>;
    }
    if (daysDiff === 1) {
      return <span className="text-xs font-semibold text-pending">السفر غداً</span>;
    }
    if (daysDiff <= 7) {
      return <span className="text-xs text-pending">السفر بعد {daysDiff} أيام</span>;
    }
    return <span className="text-xs text-copy-muted">{formatArabicDate(order.travelDate)}</span>;
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    if (onOpenWhatsApp) {
      e.preventDefault();
      onOpenWhatsApp(order);
    }
  };

  return (
    <div
      className={`relative bg-canvas rounded-[14px] border p-4 sm:p-5 transition-all duration-200 shadow-xs hover:shadow-md ${
        late ? 'border-[#F4D1CD] bg-[#FFFBFA]' : 'border-line'
      }`}
    >
      {/* Top row: Customer & Supplier & Status */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectCustomer?.(order.customerName)}
              className="text-base sm:text-lg font-bold font-cairo text-ink hover:text-brass transition-colors text-right"
            >
              {order.customerName}
            </button>
            <span className="text-[11px] font-cairo font-bold text-copy-muted bg-paper px-1.5 py-0.5 rounded">
              #{order.orderNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-copy-muted mt-1">
            <Store className="w-3.5 h-3.5 text-brass shrink-0" />
            <span>من:</span>
            <button
              onClick={() => onSelectSupplier?.(order.supplierId)}
              className="hover:text-ink hover:underline text-right font-medium"
            >
              {order.supplierName}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={order.status} order={order} />
        </div>
      </div>

      {/* Description */}
      <div className="text-sm text-charcoal bg-paper/60 p-2.5 rounded-[9px] mb-2.5 leading-relaxed border border-paper-alt">
        {order.description}
      </div>

      {/* Specifications Chips: Size, Color, Alternative Color, Quantity */}
      {(order.size || order.color || order.alternativeColor || (order.quantity && order.quantity > 1)) && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
          {order.size && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-size-soft text-ink font-semibold">
              <span className="text-copy-muted">المقاس:</span>
              <span>{order.size}</span>
            </span>
          )}
          {order.color && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-color-soft text-brass font-semibold border border-[#EED7BA]/60">
              <span className="text-[#87652E]">اللون:</span>
              <span>{order.color}</span>
            </span>
          )}
          {order.alternativeColor && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-paper text-copy-muted font-medium border border-line">
              <span>البديل:</span>
              <span className="text-ink font-semibold">{order.alternativeColor}</span>
            </span>
          )}
          {order.quantity && order.quantity > 1 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-done-soft text-done font-bold">
              <span>الكمية:</span>
              <span className="font-cairo">{order.quantity} قطع</span>
            </span>
          )}
        </div>
      )}

      {/* Notes if any */}
      {order.notes && (
        <div className="text-xs text-copy-muted italic mb-3">
          ملاحظة: {order.notes}
        </div>
      )}

      {/* Foot info: Travel date & pricing */}
      <div className="pt-3 border-t border-dashed border-line flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-copy-muted">
          <Calendar className="w-3.5 h-3.5 text-brass" />
          <span>يوم السفر:</span>
          {getTravelDayBadge()}
        </div>

        <div className="flex items-center gap-2 text-right">
          {order.price !== undefined && (
            <span className="font-bold text-ink font-cairo text-sm">
              {formatCurrency(order.price)}
            </span>
          )}
          {order.deposit !== undefined && order.deposit > 0 && remaining > 0 && (
            <span className="text-[11px] text-copy-muted bg-pending-soft px-1.5 py-0.5 rounded">
              باقي: {formatCurrency(remaining)}
            </span>
          )}
        </div>
      </div>

      {/* Actions footer */}
      <div className="mt-3 pt-2.5 border-t border-paper-alt flex items-center justify-between">
        <button
          onClick={() => onToggleStatus(order.id)}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-[8px] transition-colors ${
            order.status === 'done'
              ? 'bg-pending-soft text-pending hover:bg-[#EED7BA]'
              : 'bg-done-soft text-done hover:bg-[#CDE3D5]'
          }`}
        >
          {order.status === 'done' ? (
            <>
              <Clock className="w-3.5 h-3.5" />
              <span>إعادة كمعلّق</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>تم التنفيذ</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1">
          {order.customerPhone && (
            <button
              onClick={handleWhatsAppClick}
              className="p-1.5 text-done hover:bg-done-soft rounded-[8px] transition-colors flex items-center gap-1"
              title="رسائل وقوالب واتساب"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          )}
          {order.customerPhone && (
            <a
              href={`tel:${order.customerPhone}`}
              className="p-1.5 text-ink hover:bg-paper rounded-[8px] transition-colors"
              title="اتصال هاتفي"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => onEdit(order)}
            className="p-1.5 text-copy-muted hover:text-ink hover:bg-paper rounded-[8px] transition-colors"
            title="تعديل الطلب"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(order.id)}
            className="p-1.5 text-copy-muted hover:text-late hover:bg-late-soft rounded-[8px] transition-colors"
            title="حذف الطلب"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
