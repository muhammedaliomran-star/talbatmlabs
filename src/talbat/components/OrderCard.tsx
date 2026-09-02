import React from 'react';
import { Check, Clock, Edit2, MessageCircle, Trash2, Calendar, Phone, Store } from 'lucide-react';
import { Order } from '../types';
import { formatArabicDate, formatCurrency, isOrderLate, getDaysDifference } from '../utils/helpers';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';

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
    <div className={`rounded-[1.6rem] p-1.5 ring-1 ${late ? 'bg-late-soft/70 ring-late/20' : 'bg-paper-alt/70 ring-line'}`}>
    <article className="relative rounded-[calc(1.6rem-0.375rem)] bg-canvas p-4 shadow-[inset_0_1px_0_var(--canvas)] transition-transform duration-500 motion-spring hover:-translate-y-1 sm:p-5">
      {/* Top row: Customer & Supplier & Status */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onSelectCustomer?.(order.customerName)}
              variant="ghost" className="h-auto justify-start p-0 text-right font-cairo text-base font-bold text-ink hover:bg-transparent hover:text-brass sm:text-lg"
            >
              {order.customerName}
            </Button>
            <span className="text-[11px] font-cairo font-bold text-copy-muted bg-paper px-1.5 py-0.5 rounded">
              #{order.orderNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-copy-muted mt-1">
            <Store className="w-3.5 h-3.5 text-brass shrink-0" />
            <span>من:</span>
            <Button
              onClick={() => onSelectSupplier?.(order.supplierId)}
              variant="ghost" className="h-auto p-0 text-right text-xs font-medium text-copy-muted hover:bg-transparent hover:text-ink hover:underline"
            >
              {order.supplierName}
            </Button>
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-color-soft text-brass font-semibold ring-1 ring-pending/20">
              <span className="text-pending">اللون:</span>
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
        <Button
          onClick={() => onToggleStatus(order.id)}
          variant="ghost" size="sm" className={`group h-9 gap-2 px-2 pr-3 text-xs font-semibold ${
            order.status === 'done'
              ? 'bg-pending-soft text-pending hover:bg-pending-soft/70'
              : 'bg-done-soft text-done hover:bg-done-soft/70'
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
        </Button>

        <div className="flex items-center gap-1">
          {order.customerPhone && (
            <Button
              onClick={handleWhatsAppClick}
              variant="ghost" size="icon" className="size-8 text-done hover:bg-done-soft"
              title="رسائل وقوالب واتساب"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
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
          <Button
            onClick={() => onEdit(order)}
            variant="ghost" size="icon" className="size-8 text-copy-muted hover:bg-paper hover:text-ink"
            title="تعديل الطلب"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onDelete(order.id)}
            variant="ghost" size="icon" className="size-8 text-copy-muted hover:bg-late-soft hover:text-late"
            title="حذف الطلب"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </article></div>
  );
};
