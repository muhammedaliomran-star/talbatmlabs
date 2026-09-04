import React, { useState } from 'react';
import { Search, Phone, Plus, MessageCircle, Calendar, ArrowUpLeft, ShieldCheck, Sparkles, User, Clock, ShoppingBag, Edit2 } from 'lucide-react';
import { Customer, Order } from '../types';
import { formatArabicDate, formatCurrency, createWhatsAppUrl } from '../utils/helpers';
import { StatusBadge } from './StatusBadge';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface CustomersViewProps {
  customers: Customer[];
  orders: Order[];
  onOpenNewOrderForCustomer: (customer: Customer) => void;
  onToggleOrderStatus: (orderId: string) => void;
  onEditOrder: (order: Order) => void;
  selectedCustomerName?: string | null;
  onClearSelectedCustomer?: () => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  orders,
  onOpenNewOrderForCustomer,
  onToggleOrderStatus,
  onEditOrder,
  selectedCustomerName,
  onClearSelectedCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  useScrollReveal();
  const [mobileShowDetail, setMobileShowDetail] = useState(Boolean(selectedCustomerName));
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(() => {
    if (selectedCustomerName) {
      const found = customers.find((c) => c.name === selectedCustomerName);
      return found ? found.id : customers[0]?.id || null;
    }
    return customers[0]?.id || null;
  });

  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(term) || (c.phone && c.phone.includes(term));
  });

  const activeCustomer = customers.find((c) => c.id === activeCustomerId) || customers[0];

  const customerOrders = activeCustomer
    ? orders
        .filter(
          (o) =>
            o.customerId === activeCustomer.id ||
            o.customerName.trim().toLowerCase() === activeCustomer.name.trim().toLowerCase()
        )
        .sort((a, b) => b.orderDate.localeCompare(a.orderDate))
    : [];

  const totalSpent = customerOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const totalDeposit = customerOrders.reduce((sum, o) => sum + (o.deposit || 0), 0);
  const remainingDebt = Math.max(0, totalSpent - totalDeposit);
  const pendingOrders = customerOrders.filter((o) => o.status === 'pending');
  const doneOrders = customerOrders.filter((o) => o.status === 'done');

  return (
    <div className="grain-overlay relative min-h-[100dvh] bg-paper text-charcoal antialiased">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-10 pb-8 space-y-8">
        {/* Header - Editorial Split */}
        <div data-reveal className="reveal-section flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-ink-deep px-3.5 py-1.5 ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-brass-light animate-pulse" />
              <span className="text-[11px] font-semibold tracking-[0.14em] text-on-ink">Client Vault — Ledger</span>
            </div>
            <div>
              <h1 className="font-palestine text-[32px] font-[400] leading-none tracking-[-0.03em] text-charcoal sm:text-[42px] lg:text-[48px]">
                سجل <span className="font-palestine font-[400] not-italic text-brass">العملاء</span> الخزني
                <span className="ml-3 align-super text-[18px] font-medium tracking-[0.14em] text-brass/70 sm:text-[22px]">({customers.length.toLocaleString('en-US')})</span>
              </h1>
              <p className="mt-3 max-w-[560px] text-[13px] leading-6 text-copy-muted sm:text-[14px]">
                عرض ملف كل عميل وكل طلباته المتفرقة من مختلف الموردين في مكان واحد — دفتر خزنة زمني متسلسل.
              </p>
          </div>
          {activeCustomer && (
            <button type="button"
              onClick={() => onOpenNewOrderForCustomer(activeCustomer)}
              className="group inline-flex items-center gap-3 self-start rounded-full bg-ink-deep py-2 pl-6 pr-2 text-[13px] font-bold text-white shadow-[0_18px_60px_-28px_rgba(26,18,7,0.55)] ring-1 ring-line/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink active:scale-[0.98] lg:self-auto"
            >
              <span className="tracking-wide">طلب جديد لـ {activeCustomer.name.split(' ')[0]}</span>
              <span className="grid size-8 place-items-center rounded-full bg-canvas text-charcoal transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-[1.04] group-active:scale-[0.96]">
                <Plus className="size-4" strokeWidth={1.75} />
              </span>
            </button>
          )}
        </div>

        {/* Main Grid: Left is Customer list, Right is Customer Dossier */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          {/* Customer Sidebar List (4 cols) - Vault Pills */}
          <div className={`lg:col-span-4 ${mobileShowDetail ? 'hidden lg:block' : 'block'}`}>
            <div data-reveal className="reveal-section rounded-[2rem] bg-transparent p-0" style={{ transitionDelay: '90ms' } as any}>
              <div className="rounded-[calc(2rem-0.5rem)] bg-canvas p-4 sm:p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_24px_80px_-40px_rgba(26,18,7,0.28)]">
                <div className="rounded-full bg-paper p-1.5 ring-1 ring-line">
                  <div className="relative flex items-center">
                    <Search className="pointer-events-none absolute right-3 size-4 text-brass" strokeWidth={1.5} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ابحث باسم العميل أو هاتفه..."
                      className="w-full rounded-full bg-canvas py-2.5 pr-10 pl-4 text-[13px] font-medium text-charcoal placeholder:text-copy-muted ring-1 ring-line focus:outline-none focus:ring-[#B08948]/30 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    />
                  </div>
                </div>

                <div className="mt-5 space-y-2.5 max-h-[640px] overflow-y-auto pr-1 [scrollbar-width:thin]">
                  {filteredCustomers.length === 0 ? (
                    <div className="rounded-[1rem] bg-paper py-10 text-center text-xs text-copy-muted ring-1 ring-line">لا يوجد عملاء يطابقون البحث</div>
                  ) : (
                    filteredCustomers.map((c, idx) => {
                      const cOrders = orders.filter(
                        (o) =>
                          o.customerId === c.id ||
                          o.customerName.trim().toLowerCase() === c.name.trim().toLowerCase()
                      );
                      const isSelected = c.id === activeCustomerId;
                      const cPending = cOrders.filter((o) => o.status === 'pending').length;

                      return (
                        <button type="button"
                          key={c.id}
                          onClick={() => {
                            setActiveCustomerId(c.id);
                            setMobileShowDetail(true);
                          }}
                          style={{ transitionDelay: `${idx * 22}ms` } as any}
                          className={`group relative flex w-full items-center justify-between gap-3 rounded-[1.4rem] p-[1px] text-right transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform ${isSelected ? 'bg-ink-deep shadow-[0_12px_40px_-18px_rgba(26,18,7,0.45)]' : 'bg-paper-warm hover:bg-paper-warm'}`}
                        >
                          <div className={`flex w-full items-center justify-between rounded-[calc(1.4rem-1px)] px-4 py-3.5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSelected ? 'bg-ink-deep text-[#FDFBF7]' : 'bg-canvas group-hover:bg-canvas'}`}>
                            <div className="min-w-0 text-right">
                              <div className={`truncate font-[700] text-[14px] leading-none ${isSelected ? 'text-white' : 'text-charcoal'}`}>{c.name}</div>
                              {c.phone && (
                                <div className={`mt-1.5 flex items-center gap-1 text-[11px] ${isSelected ? 'text-white/60' : 'text-copy-muted'}`}>
                                  <Phone className={`size-3 shrink-0 ${isSelected ? 'text-brass-light' : 'text-brass'}`} strokeWidth={1.4} />
                                  <span dir="ltr" className="truncate">{c.phone}</span>
                                </div>
                              )}
                            </div>
                            <div className="shrink-0 text-left">
                              <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${isSelected ? 'bg-canvas text-charcoal' : 'bg-ink-deep text-white'}`}>
                                <span>{cOrders.length.toLocaleString('en-US')}</span>
                                <span className="opacity-70">طلب</span>
                              </div>
                              {cPending > 0 && <div className="mt-1.5 text-center text-[10px] font-bold tracking-wide text-pending">{cPending.toLocaleString('en-US')} معلّق</div>}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[11px] text-copy-muted">
                  <span className="inline-flex items-center gap-1.5"><Sparkles className="size-3 text-brass" strokeWidth={1.5} /> خزنة محمية لحظياً</span>
                  <span>{customers.length} عميل</span>
                </div>
          </div>

          {/* Customer Dossier / Profile (8 cols) - Vault */}
          <div className={`lg:col-span-8 ${!mobileShowDetail ? 'hidden lg:block' : 'block'}`}>
            <div data-reveal className="reveal-section rounded-[2rem] bg-transparent p-0" style={{ transitionDelay: '150ms' } as any}>
              <div className="rounded-[calc(2rem-0.5rem)] bg-canvas p-4 sm:p-6 lg:p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_24px_80px_-40px_rgba(26,18,7,0.28)]">
                <div className="mb-4 lg:hidden">
                  <button type="button"
                    onClick={() => setMobileShowDetail(false)}
                    className="inline-flex items-center gap-2 rounded-full bg-ink-deep px-4 py-2 text-xs font-bold text-white ring-1 ring-line/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                  >
                    <ArrowUpLeft className="size-3.5 rotate-[-45deg]" strokeWidth={1.8} /> العودة لقائمة العملاء
                  </button>
                </div>

                {activeCustomer ? (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
                      <div className="min-w-0">
                        <div className="inline-flex items-center gap-2 rounded-full bg-canvas px-3 py-1 ring-1 ring-line">
                          <span className="size-2 rounded-full bg-done" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-copy-muted">Vault Ledger</span>
                        </div>
                        <h2 className="mt-3 flex items-center gap-3 text-[24px] font-[800] leading-none tracking-[-0.02em] text-charcoal sm:text-[28px]">
                          <span className="grid size-9 place-items-center rounded-[0.9rem] bg-ink-deep text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                            <User className="size-4" strokeWidth={1.5} />
                          </span>
                          <span className="font-[Fraunces]">{activeCustomer.name}</span>
                        </h2>
                        <div className="mt-3 space-y-1.5">
                          {activeCustomer.phone && (
                            <p className="flex items-center gap-2 text-[13px] text-copy-muted">
                              <span className="grid size-6 place-items-center rounded-full bg-ink-deep text-white"><Phone className="size-3" strokeWidth={1.5} /></span>
                              <a href={`tel:${activeCustomer.phone}`} className="font-medium tracking-wide text-charcoal hover:text-brass transition-colors">{activeCustomer.phone}</a>
                            </p>
                          )}
                          {activeCustomer.notes && (
                            <p className="flex items-start gap-2 text-[12px] leading-5 text-copy-muted">
                              <span className="grid size-6 place-items-center rounded-full bg-brass/12 text-brass ring-1 ring-[#B08948]/15 shrink-0"><span className="text-[10px]">✦</span></span>
                              <span className="italic">ملاحظات: {activeCustomer.notes}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeCustomer.phone && (
                          <>
                            <a href={createWhatsAppUrl(activeCustomer.phone)} target="_blank" rel="noopener noreferrer" className="group grid size-10 place-items-center rounded-full bg-done text-white ring-1 ring-[#3F7A5D]/20 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#35684F] active:scale-[0.96]">
                              <MessageCircle className="size-4" strokeWidth={1.5} />
                            </a>
                            <a href={`tel:${activeCustomer.phone}`} className="group grid size-10 place-items-center rounded-full bg-canvas text-copy-muted ring-1 ring-line transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-charcoal hover:ring-[#1A1207]/15 active:scale-[0.96]">
                              <Phone className="size-4" strokeWidth={1.5} />
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="rounded-[1.6rem] bg-canvas px-4 py-4 ring-1 ring-line shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-copy-muted">إجمالي المشتريات</div>
                        <div className="mt-1 font-[Fraunces] text-[22px] sm:text-[24px] font-[800] leading-none tracking-[-0.03em] text-charcoal">{formatCurrency(totalSpent)}</div>
                        <div className="mt-1 text-[11px] font-medium text-copy-muted">{customerOrders.length} طلب</div>
                      </div>

                      <div className="rounded-[1.6rem] bg-done/10 p-1.5 ring-1 ring-done/15">
                        <div className="rounded-[calc(1.6rem-0.375rem)] bg-paper px-4 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-done">العربين المدفوعة</div>
                          <div className="mt-1 font-[Fraunces] text-[22px] sm:text-[24px] font-[800] leading-none tracking-[-0.03em] text-done">{formatCurrency(totalDeposit)}</div>
                          <div className="mt-1 text-[11px] font-medium text-done/70">محصّل</div>
                        </div>
                      </div>
                      <div className="rounded-[1.6rem] bg-brass/15 p-1.5 ring-1 ring-[#B08948]/20">
                        <div className="rounded-[calc(1.6rem-0.375rem)] bg-paper-warm px-4 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-pending">المتبقي للدفع</div>
                          <div className="mt-1 font-[Fraunces] text-[22px] sm:text-[24px] font-[800] leading-none tracking-[-0.03em] text-pending">{formatCurrency(remainingDebt)}</div>
                          <div className="mt-1 text-[11px] font-medium text-brass">ذمة</div>
                        </div>
                      </div>
                      <div className="rounded-[1.6rem] bg-canvas ring-1 ring-line shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]" px-4 py-4">
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-copy-muted">الطلبات المعلّقة</div>
                          <div className="mt-1 font-[Fraunces] text-[28px] font-[800] leading-none tracking-[-0.03em] text-charcoal">{pendingOrders.length.toLocaleString('en-US')}<span className="text-[14px] font-bold text-copy-muted">/{customerOrders.length.toLocaleString('en-US')}</span></div>
                          <div className="mt-1 text-[11px] font-medium text-copy-muted">قيد التوريد</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="inline-flex items-center gap-2 text-[13px] font-[800] tracking-tight text-charcoal">
                          <span className="grid size-7 place-items-center rounded-full bg-ink-deep text-white"><Clock className="size-3.5" strokeWidth={1.5} /></span>
                          السجل الزمني — طلبات العميل من كل الموردين
                          <span className="rounded-full bg-ink-deep px-2 py-0.5 text-[11px] font-bold text-white">{customerOrders.length.toLocaleString('en-US')}</span>
                        </h3>
                        <button type="button" onClick={() => onOpenNewOrderForCustomer(activeCustomer)} className="text-[11px] font-bold tracking-wide text-brass hover:text-ink inline-flex items-center gap-1 transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} /> إضافة طلب جديد
                        </button>
                      </div>

                      {customerOrders.length === 0 ? (
                        <div className="rounded-[1.6rem] bg-canvas py-12 text-center ring-1 ring-line">
                          <div className="mx-auto grid size-12 place-items-center rounded-full bg-paper ring-1 ring-line"><ShoppingBag className="size-5 text-brass" strokeWidth={1.4} /></div>
                          <p className="mt-3 text-[13px] font-medium text-copy-muted">لا توجد طلبات مسجلة لهذا العميل حتى الآن.</p>
                          <p className="mt-1 text-[11px] text-copy-muted">السلسلة الزمنية ستبدأ بأول طلب محفوظ</p>
                        </div>
                      ) : (
                        <div className="relative pr-6 sm:pr-8">
                          <div className="absolute right-[9px] sm:right-[11px] top-2 bottom-2 w-px bg-line" aria-hidden />
                          <div className="absolute right-[9px] sm:right-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-brass/40 via-line to-transparent" aria-hidden />
                          <div className="space-y-4">
                            {customerOrders.map((order, idx) => {
                              const remaining = (order.price || 0) - (order.deposit || 0);
                              const isDone = order.status === 'done';
                              return (
                                <div key={order.id} data-reveal className="reveal-section relative pr-8 sm:pr-10" style={{ transitionDelay: `${idx * 28}ms` } as any}>
                                  <span className={`absolute right-0 top-5 grid size-3 place-items-center rounded-full ring-4 ring-canvas ${isDone ? 'bg-done' : 'bg-brass'} shadow-[0_0_0_1px_rgba(26,18,7,0.08)]`} aria-hidden>
                                    <span className="size-1 rounded-full bg-white" />
                                  </span>
                                  <div className="group rounded-[1.5rem] bg-canvas p-1 ring-1 ring-line transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-[#1A1207]/10 hover:shadow-[0_20px_60px_-36px_rgba(26,18,7,0.35)] will-change-transform hover:translate-y-[-1px]">
                                    <div className="rounded-[calc(1.5rem-0.25rem)] bg-canvas p-4">
                                      <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                          <span className="rounded-full bg-ink-deep px-2.5 py-1 font-[Fraunces] text-[11px] font-bold tracking-wide text-white">#{order.orderNumber.toLocaleString('en-US')}</span>
                                          <span className="text-[11px] text-copy-muted hidden sm:inline">من المورد:</span>
                                          <span className="font-bold text-xs text-brass">{order.supplierName}</span>
                                          <span className="hidden sm:inline text-[11px] text-copy-muted">• {formatArabicDate(order.orderDate)}</span>
                                        </div>
                                        <div className="scale-[0.92] origin-top-left"><StatusBadge status={order.status} order={order} /></div>
                                      </div>
                                      <div className="mt-3 rounded-[0.9rem] bg-canvas px-3.5 py-3 text-[13px] leading-6 text-charcoal ring-1 ring-line">{order.description}</div>
                                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-copy-muted"><Calendar className="w-3.5 h-3.5 text-brass" strokeWidth={1.5} />{formatArabicDate(order.orderDate)}</span>
                                        <div className="flex items-center gap-2">
                                          {order.price !== undefined && <span className="rounded-full bg-ink-deep px-3 py-1 font-[Fraunces] text-[12px] font-bold text-white">{formatCurrency(order.price)}</span>}
                                          {remaining > 0 && <span className="text-[11px] font-bold text-pending">باقي: {formatCurrency(remaining)}</span>}
                                          {remaining === 0 && <span className="text-[11px] font-medium text-done">مسدّد</span>}
                                          <button type="button" onClick={() => onToggleOrderStatus(order.id)} className={`rounded-full px-3.5 py-1.5 text-[12px] font-bold ring-1 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${isDone ? 'bg-canvas text-copy-muted ring-line hover:bg-paper' : 'bg-done text-white ring-[#3F7A5D] hover:bg-[#35684F]'}`}>
                                            {isDone ? 'إعادة كمعلق' : '✓ تم التسليم'}
                                          </button>
                                          <button type="button" onClick={() => onEditOrder(order)} className="grid size-7 place-items-center rounded-full bg-paper text-copy-muted ring-1 ring-line hover:text-ink transition-colors"><Edit2 className="size-3.5" strokeWidth={1.5} /></button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-copy-muted">اختر عميلاً من القائمة لعرض تفاصيل طلباته</div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
