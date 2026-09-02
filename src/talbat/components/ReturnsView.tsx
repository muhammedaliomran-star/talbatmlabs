import React, { useState, useMemo } from 'react';
import { Plus, RotateCcw, Search, Store, Trash2, Edit2, CheckCircle2, Clock, DollarSign, Filter, FileSpreadsheet } from 'lucide-react';
import { ReturnItem, ReturnStatus, Supplier } from '../types';
import { formatArabicDate, formatCurrency } from '../utils/helpers';
import { exportReturnsToCSV } from '../utils/exportToCsv';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Breakdown of returns value per supplier
  const supplierBreakdown = useMemo(() => {
    const map: Record<string, { name: string; totalAmount: number; count: number }> = {};

    returns.forEach((r) => {
      if (!map[r.supplierId]) {
        map[r.supplierId] = {
          name: r.supplierName,
          totalAmount: 0,
          count: 0,
        };
      }
      map[r.supplierId].totalAmount += r.price;
      map[r.supplierId].count += 1;
    });

    return Object.entries(map).map(([id, data]) => ({
      supplierId: id,
      ...data,
    }));
  }, [returns]);

  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      if (supplierFilter !== 'all' && r.supplierId !== supplierFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchProduct = r.productName.toLowerCase().includes(term);
        const matchSupplier = r.supplierName.toLowerCase().includes(term);
        const matchReason = r.reason?.toLowerCase().includes(term);
        if (!matchProduct && !matchSupplier && !matchReason) return false;
      }
      return true;
    });
  }, [returns, supplierFilter, statusFilter, searchTerm]);

  const totalValue = returns.reduce((sum, r) => sum + r.price, 0);
  const pendingValue = returns
    .filter((r) => r.status === 'pending_supplier')
    .reduce((sum, r) => sum + r.price, 0);
  const refundedValue = returns
    .filter((r) => r.status === 'refunded')
    .reduce((sum, r) => sum + r.price, 0);

  const getStatusBadge = (status: ReturnStatus) => {
    switch (status) {
      case 'pending_supplier':
        return (
          <span className="hang-tag bg-late-soft text-late border border-late-soft">
            معلق مع المورد
          </span>
        );
      case 'refunded':
        return (
          <span className="hang-tag bg-done-soft text-done border border-done-soft">
            تم استرداد القيمة
          </span>
        );
      case 'exchanged':
        return (
          <span className="hang-tag bg-paper-warm text-brass border border-line-soft">
            تم الاستبدال
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-[14px] p-4 sm:p-5 border border-line shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-cairo text-ink">
            سجل المرتجعات وحسابات الموردين ({returns.length})
          </h1>
          <p className="text-xs sm:text-sm text-copy-muted mt-0.5">
            توثيق البضائع المعيبة والمرتجعة لتسويتها وخصمها من حسابات الموردين
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportReturnsToCSV(filteredReturns)}
            className="flex items-center gap-1.5 bg-paper hover:bg-paper-alt text-ink border border-line px-3.5 py-2.5 rounded-[9px] text-xs sm:text-sm font-bold shadow-2xs transition-all"
            title="تصدير المرتجعات لمطابقتها مع الموردين"
          >
            <FileSpreadsheet className="w-4 h-4 text-done" />
            <span>تصدير Excel للموردين</span>
          </button>

          <button
            onClick={onOpenNewReturn}
            className="flex items-center gap-1.5 bg-late hover:bg-late text-white px-4 py-2.5 rounded-[9px] text-xs sm:text-sm font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مرتجع جديد</span>
          </button>
        </div>
      </div>

      {/* Supplier Breakdown Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-[14px] p-4 border border-late-soft shadow-xs">
          <div className="text-xs font-semibold text-copy-muted mb-1 flex items-center justify-between">
            <span>مرتجعات قيد التسوية (معلّقة)</span>
            <Clock className="w-4 h-4 text-late" />
          </div>
          <div className="text-2xl font-extrabold font-cairo text-late">
            {formatCurrency(pendingValue)}
          </div>
          <div className="text-[11px] text-copy-muted mt-1">
            مطلوب خصمها في رحلات الشراء القادمة
          </div>
        </div>

        <div className="bg-white rounded-[14px] p-4 border border-done-soft shadow-xs">
          <div className="text-xs font-semibold text-copy-muted mb-1 flex items-center justify-between">
            <span>مرتجعات تم استردادها كاش</span>
            <CheckCircle2 className="w-4 h-4 text-done" />
          </div>
          <div className="text-2xl font-extrabold font-cairo text-done">
            {formatCurrency(refundedValue)}
          </div>
          <div className="text-[11px] text-copy-muted mt-1">تمت تسويتها بنجاح</div>
        </div>

        <div className="bg-white rounded-[14px] p-4 border border-line shadow-xs">
          <div className="text-xs font-semibold text-copy-muted mb-1 flex items-center justify-between">
            <span>إجمالي قيمة كافة المرتجعات</span>
            <DollarSign className="w-4 h-4 text-ink" />
          </div>
          <div className="text-2xl font-extrabold font-cairo text-ink">
            {formatCurrency(totalValue)}
          </div>
          <div className="text-[11px] text-copy-muted mt-1">
            منذ بداية التسجيل في الدفتر
          </div>
        </div>
      </div>

      {/* Breakdown per Supplier (As emphasized in PRD) */}
      {supplierBreakdown.length > 0 && (
        <div className="bg-white rounded-[14px] border border-line p-4 shadow-xs">
          <h2 className="text-sm font-bold font-cairo text-ink mb-3 flex items-center gap-1.5">
            <Store className="w-4 h-4 text-brass" />
            <span>كشف إجمالي المرتجعات لكل مورد للمحاسبة معه</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {supplierBreakdown.map((item) => (
              <div
                key={item.supplierId}
                onClick={() => setSupplierFilter(item.supplierId)}
                className={`p-3 rounded-[10px] border cursor-pointer transition-all ${
                  supplierFilter === item.supplierId
                    ? 'bg-paper-warm border-brass ring-1 ring-brass'
                    : 'bg-paper/60 border-paper-alt hover:bg-paper-warm'
                }`}
              >
                <div className="font-bold text-xs text-ink line-clamp-1">{item.name}</div>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-paper-alt">
                  <span className="text-[11px] text-copy-muted">{item.count} أصناف</span>
                  <span className="font-bold text-xs text-late font-cairo">
                    {formatCurrency(item.totalAmount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white rounded-[14px] p-4 border border-line shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-copy-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بالصنف، المورد، أو سبب الإرجاع..."
            className="w-full pr-9 pl-4 py-2 text-xs sm:text-sm rounded-[9px] border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="bg-paper border border-line rounded-lg px-2.5 py-2 font-medium text-ink"
          >
            <option value="all">كل الموردين</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-paper border border-line rounded-lg px-2.5 py-2 font-medium text-ink"
          >
            <option value="all">كل الحالات</option>
            <option value="pending_supplier">معلق مع المورد</option>
            <option value="refunded">تم استرداد القيمة</option>
            <option value="exchanged">تم الاستبدال</option>
          </select>
        </div>
      </div>

      {/* Returns Table */}
      {filteredReturns.length === 0 ? (
        <div className="bg-white rounded-[14px] p-10 text-center border border-line">
          <div className="w-12 h-12 rounded-full bg-paper text-copy-muted mx-auto flex items-center justify-center mb-2">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold font-cairo text-ink">لا توجد مرتجعات مسجلة</h3>
          <p className="text-xs text-copy-muted mt-1">
            سجل أي قطعة ملابس معيبة أو تحتاج استرجاعاً لموردها لمتابعة الحساب
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card List (< md) */}
          <div className="md:hidden space-y-3">
            {filteredReturns.map((ret) => (
              <div
                key={ret.id}
                className="bg-white rounded-[14px] border border-line p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-sm font-cairo text-ink">
                      {ret.productName}
                    </div>
                    <div className="text-xs text-copy-muted mt-0.5">
                      المورد: <span className="font-bold text-ink">{ret.supplierName}</span>
                    </div>
                    {ret.customerName && (
                      <div className="text-[11px] text-copy-muted">
                        طلب العميل: {ret.customerName}
                      </div>
                    )}
                  </div>
                  <div className="font-cairo font-bold text-base text-late shrink-0">
                    {formatCurrency(ret.price)}
                  </div>
                </div>

                {ret.reason && (
                  <div className="text-xs text-copy-muted bg-paper-warm p-2 rounded-lg border border-line-soft">
                    السبب: {ret.reason}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-paper-alt gap-2">
                  <select
                    value={ret.status}
                    onChange={(e) =>
                      onUpdateReturnStatus(ret.id, e.target.value as ReturnStatus)
                    }
                    className="bg-paper border border-line rounded-lg px-2 py-1 text-xs font-semibold text-ink flex-1 max-w-[170px]"
                  >
                    <option value="pending_supplier">معلق مع المورد</option>
                    <option value="refunded">تم استرداد القيمة</option>
                    <option value="exchanged">تم الاستبدال</option>
                  </select>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditReturn(ret)}
                      className="p-1.5 text-copy-muted hover:text-ink hover:bg-paper rounded-[7px] transition-colors"
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteReturn(ret.id)}
                      className="p-1.5 text-copy-muted hover:text-late hover:bg-late-soft rounded-[7px] transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block bg-white rounded-[14px] border border-line overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-ink text-white">
                  <tr>
                    <th className="p-3 font-cairo">الصنف المرتجع</th>
                    <th className="p-3 font-cairo">المورد</th>
                    <th className="p-3 font-cairo">سبب الإرجاع</th>
                    <th className="p-3 font-cairo">تاريخ الإرجاع</th>
                    <th className="p-3 font-cairo">قيمة المرتجع</th>
                    <th className="p-3 font-cairo text-center">الحالة</th>
                    <th className="p-3 font-cairo text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-alt">
                  {filteredReturns.map((ret, idx) => (
                    <tr
                      key={ret.id}
                      className={`hover:bg-paper-warm transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-canvas-subtle'
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-bold text-sm text-ink font-cairo">
                          {ret.productName}
                        </div>
                        {ret.customerName && (
                          <div className="text-[11px] text-copy-muted">
                            طلب العميل: {ret.customerName}
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <span className="font-semibold text-xs text-ink">
                          {ret.supplierName}
                        </span>
                      </td>

                      <td className="p-3 max-w-xs text-copy-muted">
                        {ret.reason || '—'}
                      </td>

                      <td className="p-3 whitespace-nowrap text-copy-muted">
                        {formatArabicDate(ret.returnDate)}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <span className="font-cairo font-bold text-sm text-late">
                          {formatCurrency(ret.price)}
                        </span>
                      </td>

                      <td className="p-3 text-center whitespace-nowrap">
                        <select
                          value={ret.status}
                          onChange={(e) =>
                            onUpdateReturnStatus(ret.id, e.target.value as ReturnStatus)
                          }
                          className="bg-white border border-line rounded-lg px-2 py-1 text-xs font-semibold text-ink"
                        >
                          <option value="pending_supplier">معلق مع المورد</option>
                          <option value="refunded">تم استرداد القيمة</option>
                          <option value="exchanged">تم الاستبدال</option>
                        </select>
                      </td>

                      <td className="p-3 text-left whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditReturn(ret)}
                            className="p-1.5 text-copy-muted hover:text-ink hover:bg-paper rounded-[7px] transition-colors"
                            title="تعديل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteReturn(ret.id)}
                            className="p-1.5 text-copy-muted hover:text-late hover:bg-late-soft rounded-[7px] transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
