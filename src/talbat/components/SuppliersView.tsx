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
    <div className="grain-overlay relative min-h-[100dvh] bg-[#FDFBF7] text-[#1A1207] antialiased">
      {/* Fixed grain - pointer-events-none already via grain-overlay utility */}
      {/* Editorial Header */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        {/* Eyebrow + Massive Heading - Editorial Luxury */}
        <div data-reveal className="reveal-section flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#1A1207] px-3.5 py-1.5 ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D3AE72] animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#FDFBF7]">Directory — Suppliers & Mills</span>
            </div>
            <div>
              <h1 className="font-[Fraunces] text-[32px] font-[800] leading-none tracking-[-0.03em] text-[#1A1207] sm:text-[42px] lg:text-[48px]">
                دليل <span className="font-[700] italic text-[#B08948]">الموردين</span> والمصانع
                <span className="ml-3 align-super text-[18px] font-medium tracking-[0.14em] text-[#B08948]/70 sm:text-[22px]">({suppliers.length.toLocaleString('en-US')})</span>
              </h1>
              <p className="mt-3 max-w-[560px] text-[13px] leading-6 text-[#6C6A63] sm:text-[14px]">
                إدارة بيانات الموردين وطلباتهم ومتابعة المرتجعات — أرشيف حيّ مربوط بكل طلب ومرتجع لحظياً.
              </p>
            </div>
          </div>

          {/* Island CTA - Button-in-Button */}
          <button
            onClick={onOpenNewSupplier}
            className="group inline-flex items-center gap-3 self-start rounded-full bg-[#1A1207] py-2 pl-6 pr-2 text-[13px] font-bold text-white shadow-[0_18px_60px_-28px_rgba(26,18,7,0.55)] ring-1 ring-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#241A0F] active:scale-[0.98] lg:self-auto"
          >
            <span className="tracking-wide">إضافة مورد جديد</span>
            <span className="grid size-8 place-items-center rounded-full bg-white text-[#1A1207] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-[1.04] group-active:scale-[0.96]">
              <Plus className="size-4" strokeWidth={1.75} />
            </span>
          </button>
        </div>

        {/* Asymmetrical Bento Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-6">
          {/* LEFT: Directory - col-span-4 */}
          <div data-reveal className="reveal-section lg:col-span-4" style={{ transitionDelay: '90ms' }}>
            <div className="rounded-[2rem] bg-[#1A1207]/[0.06] p-2 ring-1 ring-[#1A1207]/5">
              <div className="rounded-[calc(2rem-0.5rem)] bg-white p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_24px_80px_-40px_rgba(26,18,7,0.28)] sm:p-5">
                {/* Search - Double-Bezel Pill */}
                <div className="rounded-full bg-[#FDFBF7] p-1.5 ring-1 ring-[#DED8CC]">
                  <div className="relative flex items-center">
                    <Search className="pointer-events-none absolute right-3 size-4 text-[#B08948]" strokeWidth={1.5} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ابحث باسم المورد أو المنطقة..."
                      className="w-full rounded-full bg-white py-2.5 pr-10 pl-4 text-[13px] font-medium text-[#1A1207] placeholder:text-[#9A9590] ring-1 ring-[#EAE1D2] focus:outline-none focus:ring-[#B08948]/30 focus:bg-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
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
                        className={`group relative flex w-full items-center justify-between gap-3 rounded-[1.4rem] p-[1px] text-right transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform ${isSelected ? 'bg-[#1A1207] shadow-[0_12px_40px_-18px_rgba(26,18,7,0.45)]' : 'bg-[#EDE8DD] hover:bg-[#DED8CC]'}`}
                      >
                        <div
                          className={`flex w-full items-center justify-between rounded-[calc(1.4rem-1px)] px-4 py-3.5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSelected ? 'bg-[#1A1207] text-[#FDFBF7]' : 'bg-[#FFFCF6] group-hover:bg-white'}`}
                        >
                          <div className="min-w-0 text-right">
                            <div className={`truncate font-[700] text-[14px] leading-none ${isSelected ? 'text-white' : 'text-[#1A1207]'}`}>{s.name}</div>
                            {s.address && (
                              <div className={`mt-1.5 flex items-center gap-1 text-[11px] ${isSelected ? 'text-white/60' : 'text-[#6C6A63]'}`}>
                                <MapPin className={`size-3 shrink-0 ${isSelected ? 'text-[#D3AE72]' : 'text-[#B08948]'}`} strokeWidth={1.4} />
                                <span className="truncate">{s.address}</span>
                              </div>
                            )}
                          </div>
                          <div className="shrink-0 text-left">
                            <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${isSelected ? 'bg-white text-[#1A1207]' : 'bg-[#1A1207] text-white'}`}>
                              <span>{sOrders.length.toLocaleString('en-US')}</span>
                              <span className="opacity-70">طلب</span>
                            </div>
                            {sPending > 0 && (
                              <div className="mt-1.5 text-center text-[10px] font-bold tracking-wide text-[#B8792A]"> {sPending.toLocaleString('en-US')} معلّق</div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {filteredSuppliers.length === 0 && (
                    <div className="rounded-[1rem] bg-[#FDFBF7] py-10 text-center text-xs text-[#6C6A63] ring-1 ring-[#EDE1D2]">لا نتائج للبحث</div>
                  )}
                </div>

                {/* Micro footer */}
                <div className="mt-4 flex items-center justify-between border-t border-[#EAE1D2] pt-3 text-[11px] text-[#9A9590]">
                  <span className="inline-flex items-center gap-1.5"><Sparkles className="size-3 text-[#B08948]" strokeWidth={1.6} /> أرشيف محدث لحظياً</span>
                  <span>{suppliers.length} مورد</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Dossier - col-span-8 (The Hero Bento) */}
          <div data-reveal className={`reveal-section lg:col-span-8 ${!mobileShowDetail ? 'hidden lg:block' : 'block'}`} style={{ transitionDelay: '150ms' }}>
            <div className="rounded-[2rem] bg-[#1A1207]/[0.06] p-2 ring-1 ring-[#1A1207]/5">
              <div className="rounded-[calc(2rem-0.5rem)] bg-[#FFFCF6] p-4 sm:p-6 lg:p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_24px_80px_-40px_rgba(26,18,7,0.28)]">
                {/* Mobile Back */}
                <div className="mb-4 lg:hidden">
                  <button
                    onClick={() => setMobileShowDetail(false)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1A1207] px-4 py-2 text-xs font-bold text-white ring-1 ring-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                  >
                    <ArrowUpLeft className="size-3.5 rotate-[-45deg]" strokeWidth={1.8} />
                    العودة لقائمة الموردين
                  </button>
                </div>

                {activeSupplier ? (
                  <div className="space-y-6">
                    {/* Supplier Header - Editorial */}
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EDE1D2] pb-6">
                      <div className="min-w-0">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-[#EDE1D2]">
                          <span className="size-2 rounded-full bg-[#3F7A5D]" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6C6A63]">Active Supplier</span>
                        </div>
                        <h2 className="mt-3 flex items-center gap-3 text-[24px] font-[800] leading-none tracking-[-0.02em] text-[#1A1207] sm:text-[28px]">
                          <span className="grid size-9 place-items-center rounded-[0.9rem] bg-[#1A1207] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                            <Store className="size-4" strokeWidth={1.5} />
                          </span>
                          <span className="font-[Fraunces]">{activeSupplier.name}</span>
                        </h2>
                        <div className="mt-3 space-y-1.5">
                          {activeSupplier.address && (
                            <p className="flex items-center gap-2 text-[13px] text-[#6C6A63]">
                              <span className="grid size-6 place-items-center rounded-full bg-[#B08948]/12 text-[#B08948] ring-1 ring-[#B08948]/15">
                                <MapPin className="size-3" strokeWidth={1.5} />
                              </span>
                              {activeSupplier.address}
                            </p>
                          )}
                          {activeSupplier.phone && (
                            <p className="flex items-center gap-2 text-[13px] text-[#6C6A63]">
                              <span className="grid size-6 place-items-center rounded-full bg-[#1A1207] text-white">
                                <Phone className="size-3" strokeWidth={1.5} />
                              </span>
                              <a href={`tel:${activeSupplier.phone}`} className="font-medium tracking-wide text-[#1A1207] hover:text-[#B08948] transition-colors">
                                {activeSupplier.phone}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditSupplier(activeSupplier)}
                          className="group grid size-10 place-items-center rounded-full bg-white text-[#6C6A63] ring-1 ring-[#EDE1D2] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-[#1A1207] hover:ring-[#1A1207]/15 active:scale-[0.96]"
                          title="تعديل المورد"
                        >
                          <Edit2 className="size-4 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => onDeleteSupplier(activeSupplier.id)}
                          className="group grid size-10 place-items-center rounded-full bg-[#B4463A]/10 text-[#B4463A] ring-1 ring-[#B4463A]/15 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#B4463A] hover:text-white active:scale-[0.96]"
                          title="حذف المورد"
                        >
                          <Trash2 className="size-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    {/* Stats - Three Mini Bentos */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-[1.6rem] bg-[#1A1207]/[0.06] p-1.5 ring-1 ring-[#1A1207]/5">
                        <div className="rounded-[calc(1.6rem-0.375rem)] bg-white px-4 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A9590]">إجمالي الطلبات</div>
                          <div className="mt-1 font-[Fraunces] text-[28px] font-[800] leading-none tracking-[-0.03em] text-[#1A1207]">{activeSupplierOrders.length.toLocaleString('en-US')}</div>
                          <div className="mt-1 text-[11px] font-medium text-[#6C6A63]">طلب مرتبط</div>
                        </div>
                      </div>
                      <div className="rounded-[1.6rem] bg-[#B08948]/15 p-1.5 ring-1 ring-[#B08948]/20">
                        <div className="rounded-[calc(1.6rem-0.375rem)] bg-[#FFFBF0] px-4 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B8792A]">مطلوب شراؤها</div>
                          <div className="mt-1 font-[Fraunces] text-[28px] font-[800] leading-none tracking-[-0.03em] text-[#B8792A]">{pendingOrders.length.toLocaleString('en-US')}</div>
                          <div className="mt-1 text-[11px] font-medium text-[#8A6A2A]">معلّق للتوريد</div>
                        </div>
                      </div>
                      <div className="rounded-[1.6rem] bg-[#1A1207]/[0.06] p-1.5 ring-1 ring-[#1A1207]/5">
                        <div className="rounded-[calc(1.6rem-0.375rem)] bg-white px-4 py-4">
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A9590]">مرتجعات للتسوية</div>
                          <div className="mt-1 font-[Fraunces] text-[22px] font-[800] leading-none tracking-[-0.03em] text-[#B08948] sm:text-[24px]">{formatCurrency(activeSupplierReturns.reduce((s, r) => s + (r.price || 0), 0))}</div>
                          <div className="mt-1 text-[11px] font-medium text-[#6C6A63]">{activeSupplierReturns.length} صنف</div>
                        </div>
                      </div>
                    </div>

                    {/* Orders Section */}
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="inline-flex items-center gap-2 text-[13px] font-[800] tracking-tight text-[#1A1207]">
                          <span className="grid size-7 place-items-center rounded-full bg-[#1A1207] text-white"><ShoppingBag className="size-3.5" strokeWidth={1.5} /></span>
                          الطلبات المطلوب إحضارها من هذا المورد
                          <span className="rounded-full bg-[#1A1207] px-2 py-0.5 text-[11px] font-bold text-white">{activeSupplierOrders.length.toLocaleString('en-US')}</span>
                        </h3>
                      </div>

                      {activeSupplierOrders.length === 0 ? (
                        <div className="rounded-[1.6rem] bg-white py-12 text-center ring-1 ring-[#EDE1D2]">
                          <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#FDFBF7] ring-1 ring-[#EDE1D2]"><ShoppingBag className="size-5 text-[#B08948]" strokeWidth={1.4} /></div>
                          <p className="mt-3 text-[13px] font-medium text-[#6C6A63]">لا توجد طلبات مسجلة لهذا المورد حالياً.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {activeSupplierOrders.map((order) => (
                            <div key={order.id} className="group rounded-[1.5rem] bg-white p-1 ring-1 ring-[#EDE1D2] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-[#1A1207]/10 hover:shadow-[0_20px_60px_-36px_rgba(26,18,7,0.35)] will-change-transform hover:translate-y-[-1px]">
                              <div className="rounded-[calc(1.5rem-0.25rem)] bg-[#FFFCF6] p-4 sm:p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <span className="rounded-full bg-[#1A1207] px-2.5 py-1 font-[Fraunces] text-[11px] font-bold tracking-wide text-white">#{order.orderNumber.toLocaleString('en-US')}</span>
                                    <span className="text-[13px] font-bold text-[#1A1207]">{order.customerName}</span>
                                    <span className="hidden text-[11px] text-[#9A9590] sm:inline">• {formatArabicDate(order.orderDate)}</span>
                                  </div>
                                  <div className="scale-[0.92] origin-top-right">
                                    <StatusBadge status={order.status} order={order} />
                                  </div>
                                </div>

                                <div className="mt-3 rounded-[0.9rem] bg-white px-3.5 py-3 text-[13px] leading-6 text-[#1A1207] ring-1 ring-[#EDE1D2]">{order.description}</div>

                                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#EDE1D2] pt-3">
                                  <span className="text-[11px] font-medium text-[#9A9590]">{formatArabicDate(order.orderDate)}</span>
                                  <div className="flex items-center gap-3">
                                    {order.price !== undefined && (
                                      <span className="rounded-full bg-[#1A1207] px-3 py-1 font-[Fraunces] text-[12px] font-bold text-white">{formatCurrency(order.price)}</span>
                                    )}
                                    <button
                                      onClick={() => onToggleOrderStatus(order.id)}
                                      className={`rounded-full px-3.5 py-1.5 text-[12px] font-bold ring-1 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${order.status === 'done' ? 'bg-white text-[#6C6A63] ring-[#EDE1D2] hover:bg-[#FDFBF7]' : 'bg-[#3F7A5D] text-white ring-[#3F7A5D] hover:bg-[#35684F]'}`}
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
                      <div className="border-t border-dashed border-[#EDE1D2] pt-6">
                        <h3 className="mb-3 inline-flex items-center gap-2 text-[13px] font-[800] text-[#B4463A]">
                          <span className="grid size-7 place-items-center rounded-full bg-[#B4463A] text-white"><RotateCcw className="size-3.5" strokeWidth={1.6} /></span>
                          مرتجعات مع هذا المورد ({activeSupplierReturns.length.toLocaleString('en-US')})
                        </h3>
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          {activeSupplierReturns.map((ret) => (
                            <div key={ret.id} className="rounded-[1.2rem] bg-[#FFF1EF] p-3 ring-1 ring-[#B4463A]/15">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="truncate text-[13px] font-bold text-[#1A1207]">{ret.productName}</div>
                                  {ret.reason && <div className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#6C6A63]">السبب: {ret.reason}</div>}
                                </div>
                                <div className="shrink-0 rounded-full bg-[#1A1207] px-2.5 py-1 font-[Fraunces] text-[12px] font-bold text-white">{formatCurrency(ret.price)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid place-items-center py-24 text-center">
                    <div className="rounded-full bg-[#1A1207] p-4 text-white"><Store className="size-6" strokeWidth={1.4} /></div>
                    <p className="mt-3 text-sm font-bold text-[#1A1207]">اختر مورداً من القائمة لعرض تفاصيله</p>
                    <p className="mt-1 text-xs text-[#6C6A63]">الأرشيف يظهر تفاصيل الطلبات والمرتجعات لحظياً</p>
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
