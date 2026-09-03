import React, { useState } from 'react';
import { Plus, Store, MapPin, Phone, Edit2, Trash2, ShoppingBag, RotateCcw, Search, ArrowUpLeft, Sparkles } from 'lucide-react';
import { Order, ReturnItem, Supplier } from '../types';
import { formatArabicDate, formatCurrency } from '../utils/helpers';
import { StatusBadge } from './StatusBadge';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface SuppliersViewProps {
  suppliers: Supplier[];
  orders: Order[];
  returns: ReturnItem[];
  onOpenNewSupplier: () => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: string) => void;
  onToggleOrderStatus: (orderId: string) => void;
  selectedSupplierId?: string | null;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  orders,
  returns,
  onOpenNewSupplier,
  onEditSupplier,
  onDeleteSupplier,
  onToggleOrderStatus,
  selectedSupplierId,
}) => {
  useScrollReveal();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileShowDetail, setMobileShowDetail] = useState(Boolean(selectedSupplierId));
  const [activeSupplierId, setActiveSupplierId] = useState<string | null>(
    selectedSupplierId || suppliers[0]?.id || null
  );

  const filteredSuppliers = suppliers.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(term) || (s.address && s.address.toLowerCase().includes(term));
  });

  const activeSupplier = suppliers.find((s) => s.id === activeSupplierId) || suppliers[0];

  const activeSupplierOrders = activeSupplier
    ? orders.filter((o) => o.supplierId === activeSupplier.id).sort((a, b) => b.orderDate.localeCompare(a.orderDate))
    : [];

  const activeSupplierReturns = activeSupplier ? returns.filter((r) => r.supplierId === activeSupplier.id) : [];

  const pendingOrders = activeSupplierOrders.filter((o) => o.status === 'pending');

  return (
    <div className="grain-overlay relative min-h-[100dvh] bg-paper text-charcoal antialiased">
      {/* Fixed grain - pointer-events-none already via grain-overlay utility */}
      {/* Editorial Header */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        {/* Eyebrow + Massive Heading - Editorial Luxury */}
        <div data-reveal className="reveal-section flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-ink-deep px-3.5 py-1.5 ring-1 ring-line/10">
              <span className="h-1.5 w-1.5 rounded-full bg-brass-light animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#FDFBF7]">Directory — Suppliers & Mills</span>
            </div>
            <div>
              <h1 className="font-palestine text-[32px] font-[400] leading-none tracking-[-0.03em] text-charcoal sm:text-[42px] lg:text-[48px]">
                دليل <span className="font-palestine font-[400] not-italic text-brass">الموردين</span> والمصانع
                <span className="ml-3 align-super text-[18px] font-medium tracking-[0.14em] text-brass/70 sm:text-[22px]">({suppliers.length.toLocaleString('en-US')})</span>
              </h1>
              <p className="mt-3 max-w-[560px] text-[13px] leading-6 text-copy-muted sm:text-[14px]">
                إدارة بيانات الموردين وطلباتهم ومتابعة المرتجعات — أرشيف حيّ مربوط بكل طلب ومرتجع لحظياً.
              </p>
            </div>
          </div>

          {/* Island CTA - Button-in-Button */}
          <button
            onClick={onOpenNewSupplier}
            className="group inline-flex items-center gap-3 self-start rounded-full bg-ink-deep py-2 pl-6 pr-2 text-[13px] font-bold text-white shadow-[0_18px_60px_-28px_rgba(26,18,7,0.55)] ring-1 ring-line/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink active:scale-[0.98] lg:self-auto"
          >
            <span className="tracking-wide">إضافة مورد جديد</span>
            <span className="grid size-8 place-items-center rounded-full bg-canvas text-charcoal transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-[1.04] group-active:scale-[0.96]">
              <Plus className="size-4" strokeWidth={1.75} />
            </span>
          </button>
        </div>

        {/* Asymmetrical Bento Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-6">
          {/* LEFT: Directory - col-span-4 */}
          <div data-reveal className="reveal-section lg:col-span-4" style={{ transitionDelay: '90ms' }}>
            <div className="rounded-[2rem] bg-ink/[0.06] p-2 ring-1 ring-[#1A1207]/5">
              <div className="rounded-[calc(2rem-0.5rem)] bg-canvas p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_24px_80px_-40px_rgba(26,18,7,0.28)] sm:p-5">
                {/* Search - Double-Bezel Pill */}
                <div className="rounded-full bg-paper p-1.5 ring-1 ring-line">
                  <div className="relative flex items-center">
                    <Search className="pointer-events-none absolute right-3 size-4 text-brass" strokeWidth={1.5} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ابحث باسم المورد أو المنطقة..."
                      className="w-full rounded-full bg-canvas py-2.5 pr-10 pl-4 text-[13px] font-medium text-charcoal placeholder:text-copy-muted ring-1 ring-line focus:outline-none focus:ring-[#B08948]/30 focus:bg-canvas transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    />
                  </div>
                </div>

                {/* Supplier Pills List */}
                <div className={`mt-5 space-y-2.5 ${mobileShowDetail ? 'hidden lg:block' : 'block'} max-h-[640px] overflow-y-auto pr-1 [scrollbar-width:thin]`}>
                  {filteredSuppliers.map((s, idx) => {
                    const sOrders = orders.filter((o) => o.supplierId === s.id);
                    const sPending = sOrders.filter((o) => o.status === 'pending').length;
                    const isSelected = s.id === activeSupplierId;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActiveSupplierId(s.id);
                          setMobileShowDetail(true);
                        }}
                        style={{ transitionDelay: `${idx * 22}ms` }}
                        className={`group relative flex w-full items-center justify-between gap-3 rounded-[1.4rem] p-[1px] text-right transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform ${isSelected ? 'bg-ink-deep shadow-[0_12px_40px_-18px_rgba(26,18,7,0.45)]' : 'bg-paper-warm hover:bg-paper-warm'}`}
                      >
                        <div
                          className={`flex w-full items-center justify-between rounded-[calc(1.4rem-1px)] px-4 py-3.5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSelected ? 'bg-ink-deep text-[#FDFBF7]' : 'bg-canvas group-hover:bg-canvas'}`}
                        >
                          <div className="min-w-0 text-right">
                            <div className={`truncate font-[700] text-[14px] leading-none ${isSelected ? 'text-white' : 'text-charcoal'}`}>{s.name}</div>
                            {s.address && (
                              <div className={`mt-1.5 flex items-center gap-1 text-[11px] ${isSelected ? 'text-white/60' : 'text-copy-muted'}`}>
                                <MapPin className={`size-3 shrink-0 ${isSelected ? 'text-brass-light' : 'text-brass'}`} strokeWidth={1.4} />
                                <span className="truncate">{s.address}</span>
                              </div>
                            )}
                          </div>
                          <div className="shrink-0 text-left">
                            <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${isSelected ? 'bg-canvas text-charcoal' : 'bg-ink-deep text-white'}`}>
                              <span>{sOrders.length.toLocaleString('en-US')}</span>
                              <span className="opacity-70">طلب</span>
                            </div>
                            {sPending > 0 && (
                              <div className="mt-1.5 text-center text-[10px] font-bold tracking-wide text-pending"> {sPending.toLocaleString('en-US')} معلّق</div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {filteredSuppliers.length === 0 && (
                    <div className="rounded-[1rem] bg-paper py-10 text-center text-xs text-copy-muted ring-1 ring-line">لا نتائج للبحث</div>
                  )}
                </div>

                {/* Micro footer */}
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[11px] text-copy-muted">
                  <span className="inline-flex items-center gap-1.5"><Sparkles className="size-3 text-brass" strokeWidth={1.6} /> أرشيف محدث لحظياً</span>
                  <span>{suppliers.length} مورد</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Dossier - col-span-8 (The Hero Bento) */}
          <div data-reveal className={`reveal-section lg:col-span-8 ${!mobileShowDetail ? 'hidden lg:block' : 'block'}`} style={{ transitionDelay: '150ms' }}>
            <div className="rounded-[2rem] bg-ink/[0.06] p-2 ring-1 ring-[#1A1207]/5">
              <div className="rounded-[calc(2rem-0.5rem)] bg-canvas p-4 sm:p-6 lg:p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_24px_80px_-40px_rgba(26,18,7,0.28)]">
                {/* Mobile Back */}
                <div className="mb-4 lg:hidden">
                  <button
                    onClick={() => setMobileShowDetail(false)}
                    className="inline-flex items-center gap-2 rounded-full bg-ink-deep px-4 py-2 text-xs font-bold text-white ring-1 ring-line/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                  >
                    <ArrowUpLeft className="size-3.5 rotate-[-45deg]" strokeWidth={1.8} />
                    العودة لقائمة الموردين
                  </button>
                </div>

                {activeSupplier ? (
                  <div className="space-y-6">
                    {/* Supplier Header - Editorial */}
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
                      <div className="min-w-0">
                        <div className="inline-flex items-center gap-2 rounded-full bg-canvas px-3 py-1 ring-1 ring-line">
                          <span className="size-2 rounded-full bg-done" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-copy-muted">Active Supplier</span>
                        </div>
                        <h2 className="mt-3 flex items-center gap-3 text-[24px] font-[800] leading-none tracking-[-0.02em] text-charcoal sm:text-[28px]">
                          <span className="grid size-9 place-items-center rounded-[0.9rem] bg-ink-deep text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                            <Store className="size-4" strokeWidth={1.5} />
                          </span>
                          <span className="font-[Fraunces]">{activeSupplier.name}</span>
                        </h2>
                        <div className="mt-3 space-y-1.5">
                          {activeSupplier.address && (
                            <p className="flex items-center gap-2 text-[13px] text-copy-muted">
                              <span className="grid size-6 place-items-center rounded-full bg-brass/12 text-brass ring-1 ring-[#B08948]/15">
                                <MapPin className="size-3" strokeWidth={1.5} />
                              </span>
                              {activeSupplier.address}
                            </p>
                          )}
                          {activeSupplier.phone && (
                            <p className="flex items-center gap-2 text-[13px] text-copy-muted">
                              <span className="grid size-6 place-items-center rounded-full bg-ink-deep text-white">
                                <Phone className="size-3" strokeWidth={1.5} />
                              </span>
                              <a href={`tel:${activeSupplier.phone}`} className="font-medium tracking-wide text-charcoal hover:text-brass transition-colors">
                                {activeSupplier.phone}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditSupplier(activeSupplier)}
                          className="group grid size-10 place-items-center rounded-full bg-canvas text-copy-muted ring-1 ring-line transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-charcoal hover:ring-[#1A1207]/15 active:scale-[0.96]"
                          title="تعديل المورد"
                        >
                          <Edit2 className="size-4 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => onDeleteSupplier(activeSupplier.id)}
                          className="group grid size-10 place-items-center rounded-full bg-late/10 text-late ring-1 ring-[#B4463A]/15 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-late hover:text-white active:scale-[0.96]"
                          title="حذف المورد"
                        >
                          <Trash2 className="size-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    {/* Stats - Three Mini Bentos */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-[1.6rem] bg-ink/[0.06] p-1.5 ring-1 ring-[#1A1207]/5">
                        <div className="rounded-[calc(1.6rem-0.375rem)] bg-canvas px-4 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-copy-muted">إجمالي الطلبات</div>
                          <div className="mt-1 font-[Fraunces] text-[28px] font-[800] leading-none tracking-[-0.03em] text-charcoal">{activeSupplierOrders.length.toLocaleString('en-US')}</div>
                          <div className="mt-1 text-[11px] font-medium text-copy-muted">طلب مرتبط</div>
                        </div>
                      </div>
                      <div className="rounded-[1.6rem] bg-brass/15 p-1.5 ring-1 ring-[#B08948]/20">
                        <div className="rounded-[calc(1.6rem-0.375rem)] bg-paper-warm px-4 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-pending">مطلوب شراؤها</div>
                          <div className="mt-1 font-[Fraunces] text-[28px] font-[800] leading-none tracking-[-0.03em] text-pending">{pendingOrders.length.toLocaleString('en-US')}</div>
                          <div className="mt-1 text-[11px] font-medium text-brass">معلّق للتوريد</div>
                        </div>
                      </div>
                      <div className="rounded-[1.6rem] bg-ink/[0.06] p-1.5 ring-1 ring-[#1A1207]/5">
                        <div className="rounded-[calc(1.6rem-0.375rem)] bg-canvas px-4 py-4">
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-copy-muted">مرتجعات للتسوية</div>
                          <div className="mt-1 font-[Fraunces] text-[22px] font-[800] leading-none tracking-[-0.03em] text-brass sm:text-[24px]">{formatCurrency(activeSupplierReturns.reduce((s, r) => s + (r.price || 0), 0))}</div>
                          <div className="mt-1 text-[11px] font-medium text-copy-muted">{activeSupplierReturns.length} صنف</div>
                        </div>
                      </div>
                    </div>

                    {/* Orders Section */}
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="inline-flex items-center gap-2 text-[13px] font-[800] tracking-tight text-charcoal">
                          <span className="grid size-7 place-items-center rounded-full bg-ink-deep text-white"><ShoppingBag className="size-3.5" strokeWidth={1.5} /></span>
                          الطلبات المطلوب إحضارها من هذا المورد
                          <span className="rounded-full bg-ink-deep px-2 py-0.5 text-[11px] font-bold text-white">{activeSupplierOrders.length.toLocaleString('en-US')}</span>
                        </h3>
                      </div>

                      {activeSupplierOrders.length === 0 ? (
                        <div className="rounded-[1.6rem] bg-canvas py-12 text-center ring-1 ring-line">
                          <div className="mx-auto grid size-12 place-items-center rounded-full bg-paper ring-1 ring-line"><ShoppingBag className="size-5 text-brass" strokeWidth={1.4} /></div>
                          <p className="mt-3 text-[13px] font-medium text-copy-muted">لا توجد طلبات مسجلة لهذا المورد حالياً.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {activeSupplierOrders.map((order) => (
                            <div key={order.id} className="group rounded-[1.5rem] bg-canvas p-1 ring-1 ring-line transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-[#1A1207]/10 hover:shadow-[0_20px_60px_-36px_rgba(26,18,7,0.35)] will-change-transform hover:translate-y-[-1px]">
                              <div className="rounded-[calc(1.5rem-0.25rem)] bg-canvas p-4 sm:p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <span className="rounded-full bg-ink-deep px-2.5 py-1 font-[Fraunces] text-[11px] font-bold tracking-wide text-white">#{order.orderNumber.toLocaleString('en-US')}</span>
                                    <span className="text-[13px] font-bold text-charcoal">{order.customerName}</span>
                                    <span className="hidden text-[11px] text-copy-muted sm:inline">• {formatArabicDate(order.orderDate)}</span>
                                  </div>
                                  <div className="scale-[0.92] origin-top-right">
                                    <StatusBadge status={order.status} order={order} />
                                  </div>
                                </div>

                                <div className="mt-3 rounded-[0.9rem] bg-canvas px-3.5 py-3 text-[13px] leading-6 text-charcoal ring-1 ring-line">{order.description}</div>

                                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                                  <span className="text-[11px] font-medium text-copy-muted">{formatArabicDate(order.orderDate)}</span>
                                  <div className="flex items-center gap-3">
                                    {order.price !== undefined && (
                                      <span className="rounded-full bg-ink-deep px-3 py-1 font-[Fraunces] text-[12px] font-bold text-white">{formatCurrency(order.price)}</span>
                                    )}
                                    <button
                                      onClick={() => onToggleOrderStatus(order.id)}
                                      className={`rounded-full px-3.5 py-1.5 text-[12px] font-bold ring-1 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${order.status === 'done' ? 'bg-canvas text-copy-muted ring-line hover:bg-paper' : 'bg-done text-white ring-[#3F7A5D] hover:bg-[#35684F]'}`}
                                    >
                                      {order.status === 'done' ? 'إعادة كمعلق' : '✓ تم الاستلام'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Returns */}
                    {activeSupplierReturns.length > 0 && (
                      <div className="border-t border-dashed border-line pt-6">
                        <h3 className="mb-3 inline-flex items-center gap-2 text-[13px] font-[800] text-late">
                          <span className="grid size-7 place-items-center rounded-full bg-late text-white"><RotateCcw className="size-3.5" strokeWidth={1.6} /></span>
                          مرتجعات مع هذا المورد ({activeSupplierReturns.length.toLocaleString('en-US')})
                        </h3>
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          {activeSupplierReturns.map((ret) => (
                            <div key={ret.id} className="rounded-[1.2rem] bg-late-soft p-3 ring-1 ring-[#B4463A]/15">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="truncate text-[13px] font-bold text-charcoal">{ret.productName}</div>
                                  {ret.reason && <div className="mt-1 line-clamp-2 text-[11px] leading-4 text-copy-muted">السبب: {ret.reason}</div>}
                                </div>
                                <div className="shrink-0 rounded-full bg-ink-deep px-2.5 py-1 font-[Fraunces] text-[12px] font-bold text-white">{formatCurrency(ret.price)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid place-items-center py-24 text-center">
                    <div className="rounded-full bg-ink-deep p-4 text-white"><Store className="size-6" strokeWidth={1.4} /></div>
                    <p className="mt-3 text-sm font-bold text-charcoal">اختر مورداً من القائمة لعرض تفاصيله</p>
                    <p className="mt-1 text-xs text-copy-muted">الأرشيف يظهر تفاصيل الطلبات والمرتجعات لحظياً</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Typography: Fraunces for editorial numbers */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,700;9..144,0,800;9..144,1,700&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap');`}</style>
    </div>
  );
};
