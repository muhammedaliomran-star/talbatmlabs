import React, { useState, useMemo } from 'react';
import { Plus, RotateCcw, Search, Store, Trash2, Edit2, CheckCircle2, Clock, DollarSign, FileSpreadsheet, ArrowUpLeft, Calendar, Printer } from 'lucide-react';
import { ReturnItem, ReturnStatus, Supplier } from '../types';
import { formatArabicDate, formatCurrency } from '../utils/helpers';
import { exportReturnsToCSV } from '../utils/exportToCsv';
import { printReturns } from '../utils/printReturns';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReturnsViewProps {
  returns: ReturnItem[];
  suppliers: Supplier[];
  onOpenNewReturn: () => void;
  onEditReturn: (ret: ReturnItem) => void;
  onDeleteReturn: (retId: string) => void;
  onUpdateReturnStatus: (retId: string, newStatus: ReturnStatus) => void;
}

export const ReturnsView: React.FC<ReturnsViewProps> = ({
  returns,
  suppliers,
  onOpenNewReturn,
  onEditReturn,
  onDeleteReturn,
  onUpdateReturnStatus,
}) => {
  useScrollReveal();
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const supplierBreakdown = useMemo(() => {
    const map: Record<string, { name: string; totalAmount: number; count: number }> = {};
    returns.forEach((r) => {
      if (!map[r.supplierId]) map[r.supplierId] = { name: r.supplierName, totalAmount: 0, count: 0 };
      map[r.supplierId].totalAmount += r.price;
      map[r.supplierId].count += 1;
    });
    return Object.entries(map).map(([id, data]) => ({ supplierId: id, ...data }));
  }, [returns]);

  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      if (supplierFilter !== 'all' && r.supplierId !== supplierFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        if (!r.productName.toLowerCase().includes(term) && !r.supplierName.toLowerCase().includes(term) && !r.reason?.toLowerCase().includes(term)) return false;
      }
      return true;
    });
  }, [returns, supplierFilter, statusFilter, searchTerm]);

  const totalValue = returns.reduce((sum, r) => sum + r.price, 0);
  const pendingValue = returns.filter((r) => r.status === 'pending_supplier').reduce((sum, r) => sum + r.price, 0);
  const refundedValue = returns.filter((r) => r.status === 'refunded').reduce((sum, r) => sum + r.price, 0);

  const getStatusBadge = (status: ReturnStatus) => {
    switch (status) {
      case 'pending_supplier': return <span className="hang-tag bg-late-soft text-late border border-late-soft">معلق مع المورد</span>;
      case 'refunded': return <span className="hang-tag bg-done-soft text-done border border-done-soft">تم استرداد القيمة</span>;
      case 'exchanged': return <span className="hang-tag bg-paper-warm text-brass border border-line-soft">تم الاستبدال</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header - Editorial Split + Double-Bezel */}
      <div data-reveal className="reveal-section">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-6">
          <div className="min-w-0">
            <h1 className="font-palestine text-[26px] sm:text-[36px] lg:text-[48px] font-[400] leading-[1.05] lg:leading-[0.9] tracking-[-0.03em] text-charcoal">
              سجل <span className="font-palestine font-[400] not-italic text-late">المرتجعات</span> وحسابات الموردين <span className="text-base align-middle font-cairo font-bold text-copy-muted">({returns.length})</span>
            </h1>
            <p className="mt-2.5 max-w-[560px] text-[13.5px] sm:text-[15px] leading-6 sm:leading-7 text-copy-muted">توثيق البضائع المعيبة والمرتجعة لتسويتها وخصمها من حسابات الموردين — طبقة ورقية فوق دفترك.</p>
          </div>
          <div className="rounded-[1.6rem] sm:rounded-[2rem] bg-ink/[0.06] p-1.5 sm:p-2 ring-1 ring-line/50 shrink-0">
            <div className="rounded-[calc(1.6rem-0.375rem)] sm:rounded-[calc(2rem-0.5rem)] bg-canvas p-1.5 flex items-center gap-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
              <button type="button" onClick={() => exportReturnsToCSV(filteredReturns)} className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-paper hover:bg-paper-alt text-ink ring-1 ring-line size-11 sm:size-auto sm:px-5 sm:py-2.5 text-sm font-bold shadow-2xs transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]" title="تصدير Excel" aria-label="تصدير Excel">
                <FileSpreadsheet className="w-4 h-4 text-done" strokeWidth={1.5} />
                <span className="hidden sm:inline">تصدير Excel</span>
                <span className="hidden sm:grid size-7 place-items-center rounded-full bg-ink-deep text-white transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105"><ArrowUpLeft className="size-3.5" strokeWidth={1.8} /></span>
              </button>
              <button type="button" onClick={() => printReturns(filteredReturns)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-paper hover:bg-paper-alt text-charcoal ring-1 ring-line size-11 text-sm font-bold shadow-2xs transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]" title="طباعة" aria-label="طباعة">
                <Printer className="w-4 h-4 text-brass" strokeWidth={1.4} />
              </button>
              <button type="button" onClick={onOpenNewReturn} className="group inline-flex min-w-0 flex-1 sm:flex-none items-center justify-center gap-2 rounded-full bg-late hover:bg-late/90 text-white h-11 pl-2 pr-4 text-[13.5px] sm:text-sm font-bold shadow-xs transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]">
                <span className="truncate">تسجيل مرتجع جديد</span>
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/15 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105"><Plus className="size-3.5" strokeWidth={1.8} /></span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Summary Cards - Asymmetrical Bento with Double-Bezel */}
      <div data-reveal className="reveal-section grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-5" style={{ transitionDelay: '80ms' } as React.CSSProperties}>
        <div className="rounded-[1.6rem] sm:rounded-[2rem] bg-late/10 p-1.5 ring-1 ring-late/15 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] will-change-transform">
          <div className="rounded-[calc(1.6rem-0.375rem)] sm:rounded-[calc(2rem-0.375rem)] bg-canvas p-4 sm:p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_24px_80px_-40px_rgba(26,18,7,0.12)] h-full">
            <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
              <span className="min-w-0 truncate text-[11.5px] sm:text-xs font-semibold text-copy-muted">مرتجعات قيد التسوية (معلّقة)</span>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-late-soft text-late"><Clock className="w-4 h-4" strokeWidth={1.5} /></span>
            </div>
            <div className="text-[26px] sm:text-[36px] font-extrabold font-cairo tabular-nums tracking-tight text-late leading-none">{formatCurrency(pendingValue)}</div>
            <div className="text-[11.5px] sm:text-xs text-copy-muted mt-1.5 sm:mt-2">مطلوب تسويتها مع الموردين</div>
          </div>
        </div>
        <div className="rounded-[1.6rem] sm:rounded-[2rem] bg-done/10 p-1.5 ring-1 ring-done/15 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] will-change-transform">
          <div className="rounded-[calc(1.6rem-0.375rem)] sm:rounded-[calc(2rem-0.375rem)] bg-canvas p-4 sm:p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_24px_80px_-40px_rgba(26,18,7,0.12)] h-full">
            <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
              <span className="min-w-0 truncate text-[11.5px] sm:text-xs font-semibold text-copy-muted">مرتجعات تم استردادها كاش</span>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-done-soft text-done"><CheckCircle2 className="w-4 h-4" strokeWidth={1.5} /></span>
            </div>
            <div className="text-[26px] sm:text-[36px] font-extrabold font-cairo tabular-nums tracking-tight text-done leading-none">{formatCurrency(refundedValue)}</div>
            <div className="text-[11.5px] sm:text-xs text-copy-muted mt-1.5 sm:mt-2">تمت تسويتها بنجاح</div>
          </div>
        </div>
        <div className="rounded-[1.6rem] sm:rounded-[2rem] bg-ink/[0.06] p-1.5 ring-1 ring-line/50 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] will-change-transform">
          <div className="rounded-[calc(1.6rem-0.375rem)] sm:rounded-[calc(2rem-0.375rem)] bg-canvas p-4 sm:p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_24px_80px_-40px_rgba(26,18,7,0.12)] h-full">
            <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
              <span className="min-w-0 truncate text-[11.5px] sm:text-xs font-semibold text-copy-muted">إجمالي قيمة كافة المرتجعات</span>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-paper-warm text-ink"><DollarSign className="w-4 h-4" strokeWidth={1.5} /></span>
            </div>
            <div className="text-[26px] sm:text-[36px] font-extrabold font-cairo tabular-nums tracking-tight text-ink leading-none">{formatCurrency(totalValue)}</div>
            <div className="text-[11.5px] sm:text-xs text-copy-muted mt-1.5 sm:mt-2">منذ بداية التسجيل في الدفتر</div>
          </div>
        </div>
      </div>





      {/* Breakdown per Supplier */}
      {supplierBreakdown.length > 0 && (
        <div data-reveal className="reveal-section rounded-[1.6rem] sm:rounded-[2rem] bg-ink/[0.06] p-1.5 sm:p-2 ring-1 ring-line/50" style={{ transitionDelay: '120ms' } as React.CSSProperties}>
          <div className="rounded-[calc(1.6rem-0.375rem)] sm:rounded-[calc(2rem-0.5rem)] bg-canvas p-3.5 sm:p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
            <h2 className="text-[13px] sm:text-sm font-bold font-cairo text-ink mb-3.5 sm:mb-4 flex items-center gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brass/10 text-brass"><Store className="w-4 h-4" strokeWidth={1.5} /></span>
              <span className="min-w-0">كشف إجمالي المرتجعات لكل مورد للمحاسبة معه</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
              {supplierBreakdown.map((item) => (
                <div key={item.supplierId} onClick={() => setSupplierFilter(item.supplierId)} className={`p-3 sm:p-4 rounded-[1.2rem] ring-1 cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${supplierFilter === item.supplierId ? 'bg-paper-warm ring-brass shadow-xs' : 'bg-paper/60 ring-line/50 hover:bg-paper-warm hover:ring-line'}`}>
                  <div className="font-bold text-[13px] sm:text-sm text-ink truncate">{item.name}</div>
                  <div className="flex items-center justify-between gap-2 mt-2.5 pt-2.5 sm:mt-3 sm:pt-3 border-t border-paper-alt">
                    <span className="text-[11px] sm:text-xs text-copy-muted shrink-0">{item.count} أصناف</span>
                    <span className="font-bold text-[13px] sm:text-sm text-late font-cairo tabular-nums truncate">{formatCurrency(item.totalAmount)}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}


      {/* Filter and Search - Double-Bezel Island */}
      <div data-reveal className="reveal-section rounded-[1.6rem] sm:rounded-[2rem] bg-ink/[0.06] p-1.5 sm:p-2 ring-1 ring-line/50" style={{ transitionDelay: '160ms' } as React.CSSProperties}>
        <div className="rounded-[calc(1.6rem-0.375rem)] sm:rounded-[calc(2rem-0.5rem)] bg-canvas p-2.5 sm:p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_16px_50px_-30px_rgba(26,18,7,0.08)] flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-2.5 sm:gap-3">
          <div className="relative w-full sm:flex-1 sm:min-w-[240px]">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-copy-muted" strokeWidth={1.5} />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="ابحث بالصنف، المورد، أو السبب..." className="w-full pr-9 pl-9 h-11 sm:h-auto sm:py-2.5 text-sm rounded-full border border-line bg-paper focus:bg-canvas focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]" />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')} aria-label="مسح البحث" className="absolute left-2 top-1/2 -translate-y-1/2 grid size-7 place-items-center rounded-full text-copy-muted hover:text-ink hover:bg-paper-alt transition-colors">✕</button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Select value={supplierFilter} onValueChange={(v) => setSupplierFilter(v)}>
              <SelectTrigger className="w-full h-11 sm:h-auto sm:w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الموردين</SelectItem>
                {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
              <SelectTrigger className="w-full h-11 sm:h-auto sm:w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="pending_supplier">معلق مع المورد</SelectItem>
                <SelectItem value="refunded">تم استرداد القيمة</SelectItem>
                <SelectItem value="exchanged">تم الاستبدال</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      </div>

      {/* Returns Table */}
      {filteredReturns.length === 0 ? (
        <div data-reveal className="reveal-section rounded-[1.6rem] sm:rounded-[2rem] bg-ink/[0.06] p-1.5 sm:p-2 ring-1 ring-line/50" style={{ transitionDelay: '200ms' } as React.CSSProperties}>
          <div className="rounded-[calc(1.6rem-0.375rem)] sm:rounded-[calc(2rem-0.5rem)] bg-canvas px-5 py-8 sm:p-10 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
            <div className="w-14 h-14 rounded-full bg-paper text-copy-muted mx-auto flex items-center justify-center mb-3 ring-1 ring-line/50"><RotateCcw className="w-6 h-6" strokeWidth={1.5} /></div>
            <h3 className="text-base sm:text-lg font-bold font-cairo text-ink">لا توجد مرتجعات مسجلة</h3>
            <p className="text-[13px] sm:text-sm text-copy-muted mt-1 max-w-md mx-auto leading-6">سجل أي قطعة ملابس معيبة أو تحتاج استرجاعاً لموردها لمتابعة الحساب</p>
          </div>
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {filteredReturns.map((ret) => (
              <div key={ret.id} className="rounded-[1.5rem] bg-canvas p-1 ring-1 ring-line/50 shadow-[0_16px_50px_-30px_rgba(26,18,7,0.08)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <div className="rounded-[calc(1.5rem-0.25rem)] bg-canvas p-3.5 space-y-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-[13.5px] font-cairo text-ink truncate">{ret.productName}</div>
                      <div className="text-[11.5px] text-copy-muted mt-0.5 truncate">المورد: <span className="font-bold text-ink">{ret.supplierName}</span></div>
                      {ret.customerName && <div className="text-[11.5px] text-copy-muted truncate">طلب العميل: {ret.customerName}</div>}
                    </div>
                    <div className="font-cairo font-bold text-[15px] tabular-nums text-late shrink-0">{formatCurrency(ret.price)}</div>
                  </div>
                  {ret.reason && <div className="text-[11.5px] text-copy-muted bg-paper-warm px-3 py-2.5 rounded-xl border border-line-soft leading-5 line-clamp-2">السبب: {ret.reason}</div>}
                  <div className="flex items-center justify-between pt-3 border-t border-paper-alt gap-2">
                    <Select value={ret.status} onValueChange={(v) => onUpdateReturnStatus(ret.id, v as ReturnStatus)}>
                      <SelectTrigger className="flex-1 min-w-0 h-10 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending_supplier">معلق مع المورد</SelectItem>
                        <SelectItem value="refunded">تم استرداد القيمة</SelectItem>
                        <SelectItem value="exchanged">تم الاستبدال</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" onClick={() => onEditReturn(ret)} className="grid size-10 place-items-center rounded-full text-copy-muted hover:text-ink hover:bg-paper active:scale-95 transition-all" title="تعديل" aria-label="تعديل"><Edit2 className="w-4 h-4" strokeWidth={1.5} /></button>
                      <button type="button" onClick={() => onDeleteReturn(ret.id)} className="grid size-10 place-items-center rounded-full text-copy-muted hover:text-late hover:bg-late-soft active:scale-95 transition-all" title="حذف" aria-label="حذف"><Trash2 className="w-4 h-4" strokeWidth={1.5} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div data-reveal className="reveal-section hidden md:block rounded-[2rem] bg-ink/[0.06] p-2 ring-1 ring-line/50" style={{ transitionDelay: '200ms' } as React.CSSProperties}>

            <div className="rounded-[calc(2rem-0.5rem)] bg-canvas overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-paper-alt/90">
                    <tr className="border-b border-line/50">
                      <th className="p-4 font-cairo font-bold text-charcoal">الصنف المرتجع</th>
                      <th className="p-4 font-cairo font-bold text-charcoal">المورد</th>
                      <th className="p-4 font-cairo font-bold text-charcoal">سبب الإرجاع</th>
                      <th className="p-4 font-cairo font-bold text-charcoal">تاريخ الإرجاع</th>
                      <th className="p-4 font-cairo font-bold text-charcoal">قيمة المرتجع</th>
                      <th className="p-4 font-cairo font-bold text-charcoal text-center">الحالة</th>
                      <th className="p-4 font-cairo font-bold text-charcoal text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-paper-alt">
                    {filteredReturns.map((ret, idx) => (
                      <tr key={ret.id} className={`hover:bg-paper-warm transition-colors duration-500 ${idx % 2 === 0 ? 'bg-canvas' : 'bg-canvas-subtle'}`}>
                        <td className="p-4"><div className="font-bold text-sm text-ink font-cairo">{ret.productName}</div>{ret.customerName && <div className="text-xs text-copy-muted">طلب العميل: {ret.customerName}</div>}</td>
                        <td className="p-4"><span className="font-semibold text-sm text-ink">{ret.supplierName}</span></td>
                        <td className="p-4 max-w-xs text-copy-muted text-sm">{ret.reason || '—'}</td>
                        <td className="p-4 whitespace-nowrap"><span className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-xs font-medium text-ink ring-1 ring-line/50"><Calendar className="w-3 h-3 text-brass" strokeWidth={1.5} />{formatArabicDate(ret.returnDate)}</span></td>
                        <td className="p-4 whitespace-nowrap"><span className="font-cairo font-bold text-sm text-late">{formatCurrency(ret.price)}</span></td>
                        <td className="p-4 text-center whitespace-nowrap"><Select value={ret.status} onValueChange={(v) => onUpdateReturnStatus(ret.id, v as ReturnStatus)}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending_supplier">معلق مع المورد</SelectItem><SelectItem value="refunded">تم استرداد القيمة</SelectItem><SelectItem value="exchanged">تم الاستبدال</SelectItem></SelectContent></Select></td>
                        <td className="p-4 text-left whitespace-nowrap"><div className="flex items-center justify-end gap-1"><button type="button" onClick={() => onEditReturn(ret)} className="grid size-8 place-items-center rounded-full text-copy-muted hover:text-ink hover:bg-paper transition-colors" title="تعديل"><Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} /></button><button type="button" onClick={() => onDeleteReturn(ret.id)} className="grid size-8 place-items-center rounded-full text-copy-muted hover:text-late hover:bg-late-soft transition-colors" title="حذف"><Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </>
      )}
    </div>
  );
};
