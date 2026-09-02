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
          <span className="hang-tag bg-[#F6E3E0] text-[#B4463A] border border-[#F4D1CD]">
            معلق مع المورد
          </span>
        );
      case 'refunded':
        return (
          <span className="hang-tag bg-[#E7F0EA] text-[#3F7A5D] border border-[#CDE3D5]">
            تم استرداد القيمة
          </span>
        );
      case 'exchanged':
        return (
          <span className="hang-tag bg-[#FAF6EF] text-[#B08948] border border-[#EAE1D2]">
            تم الاستبدال
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-[14px] p-4 sm:p-5 border border-[#DED8CC] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-cairo text-[#1B2E4A]">
            سجل المرتجعات وحسابات الموردين ({returns.length})
          </h1>
          <p className="text-xs sm:text-sm text-[#6C6A63] mt-0.5">
            توثيق البضائع المعيبة والمرتجعة لتسويتها وخصمها من حسابات الموردين
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportReturnsToCSV(filteredReturns)}
            className="flex items-center gap-1.5 bg-[#F6F4EF] hover:bg-[#EFEBE2] text-[#1B2E4A] border border-[#DED8CC] px-3.5 py-2.5 rounded-[9px] text-xs sm:text-sm font-bold shadow-2xs transition-all"
            title="تصدير المرتجعات لمطابقتها مع الموردين"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#3F7A5D]" />
            <span>تصدير Excel للموردين</span>
          </button>

          <button
            onClick={onOpenNewReturn}
            className="flex items-center gap-1.5 bg-[#B4463A] hover:bg-[#9E382E] text-white px-4 py-2.5 rounded-[9px] text-xs sm:text-sm font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مرتجع جديد</span>
          </button>
        </div>
      </div>

      {/* Supplier Breakdown Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-[14px] p-4 border border-[#F4D1CD] shadow-xs">
          <div className="text-xs font-semibold text-[#6C6A63] mb-1 flex items-center justify-between">
            <span>مرتجعات قيد التسوية (معلّقة)</span>
            <Clock className="w-4 h-4 text-[#B4463A]" />
          </div>
          <div className="text-2xl font-extrabold font-cairo text-[#B4463A]">
            {formatCurrency(pendingValue)}
          </div>
          <div className="text-[11px] text-[#6C6A63] mt-1">
            مطلوب خصمها في رحلات الشراء القادمة
          </div>
        </div>

        <div className="bg-white rounded-[14px] p-4 border border-[#CDE3D5] shadow-xs">
          <div className="text-xs font-semibold text-[#6C6A63] mb-1 flex items-center justify-between">
            <span>مرتجعات تم استردادها كاش</span>
            <CheckCircle2 className="w-4 h-4 text-[#3F7A5D]" />
          </div>
          <div className="text-2xl font-extrabold font-cairo text-[#3F7A5D]">
            {formatCurrency(refundedValue)}
          </div>
          <div className="text-[11px] text-[#6C6A63] mt-1">تمت تسويتها بنجاح</div>
        </div>

        <div className="bg-white rounded-[14px] p-4 border border-[#DED8CC] shadow-xs">
          <div className="text-xs font-semibold text-[#6C6A63] mb-1 flex items-center justify-between">
            <span>إجمالي قيمة كافة المرتجعات</span>
            <DollarSign className="w-4 h-4 text-[#1B2E4A]" />
          </div>
          <div className="text-2xl font-extrabold font-cairo text-[#1B2E4A]">
            {formatCurrency(totalValue)}
          </div>
          <div className="text-[11px] text-[#6C6A63] mt-1">
            منذ بداية التسجيل في الدفتر
          </div>
        </div>
      </div>

      {/* Breakdown per Supplier (As emphasized in PRD) */}
      {supplierBreakdown.length > 0 && (
        <div className="bg-white rounded-[14px] border border-[#DED8CC] p-4 shadow-xs">
          <h2 className="text-sm font-bold font-cairo text-[#1B2E4A] mb-3 flex items-center gap-1.5">
            <Store className="w-4 h-4 text-[#B08948]" />
            <span>كشف إجمالي المرتجعات لكل مورد للمحاسبة معه</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {supplierBreakdown.map((item) => (
              <div
                key={item.supplierId}
                onClick={() => setSupplierFilter(item.supplierId)}
                className={`p-3 rounded-[10px] border cursor-pointer transition-all ${
                  supplierFilter === item.supplierId
                    ? 'bg-[#FAF6EF] border-[#B08948] ring-1 ring-[#B08948]'
                    : 'bg-[#F6F4EF]/60 border-[#EFEBE2] hover:bg-[#FAF6EF]'
                }`}
              >
                <div className="font-bold text-xs text-[#1B2E4A] line-clamp-1">{item.name}</div>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#EFEBE2]">
                  <span className="text-[11px] text-[#6C6A63]">{item.count} أصناف</span>
                  <span className="font-bold text-xs text-[#B4463A] font-cairo">
                    {formatCurrency(item.totalAmount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white rounded-[14px] p-4 border border-[#DED8CC] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#6C6A63]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بالصنف، المورد، أو سبب الإرجاع..."
            className="w-full pr-9 pl-4 py-2 text-xs sm:text-sm rounded-[9px] border border-[#DED8CC] bg-[#F6F4EF] focus:bg-white focus:outline-none focus:border-[#B08948]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="bg-[#F6F4EF] border border-[#DED8CC] rounded-lg px-2.5 py-2 font-medium text-[#1B2E4A]"
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
            className="bg-[#F6F4EF] border border-[#DED8CC] rounded-lg px-2.5 py-2 font-medium text-[#1B2E4A]"
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
        <div className="bg-white rounded-[14px] p-10 text-center border border-[#DED8CC]">
          <div className="w-12 h-12 rounded-full bg-[#F6F4EF] text-[#6C6A63] mx-auto flex items-center justify-center mb-2">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold font-cairo text-[#1B2E4A]">لا توجد مرتجعات مسجلة</h3>
          <p className="text-xs text-[#6C6A63] mt-1">
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
                className="bg-white rounded-[14px] border border-[#DED8CC] p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-sm font-cairo text-[#1B2E4A]">
                      {ret.productName}
                    </div>
                    <div className="text-xs text-[#6C6A63] mt-0.5">
                      المورد: <span className="font-bold text-[#1B2E4A]">{ret.supplierName}</span>
                    </div>
                    {ret.customerName && (
                      <div className="text-[11px] text-[#6C6A63]">
                        طلب العميل: {ret.customerName}
                      </div>
                    )}
                  </div>
                  <div className="font-cairo font-bold text-base text-[#B4463A] shrink-0">
                    {formatCurrency(ret.price)}
                  </div>
                </div>

                {ret.reason && (
                  <div className="text-xs text-[#6C6A63] bg-[#FAF6EF] p-2 rounded-lg border border-[#EAE1D2]">
                    السبب: {ret.reason}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#EFEBE2] gap-2">
                  <select
                    value={ret.status}
                    onChange={(e) =>
                      onUpdateReturnStatus(ret.id, e.target.value as ReturnStatus)
                    }
                    className="bg-[#F6F4EF] border border-[#DED8CC] rounded-lg px-2 py-1 text-xs font-semibold text-[#1B2E4A] flex-1 max-w-[170px]"
                  >
                    <option value="pending_supplier">معلق مع المورد</option>
                    <option value="refunded">تم استرداد القيمة</option>
                    <option value="exchanged">تم الاستبدال</option>
                  </select>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditReturn(ret)}
                      className="p-1.5 text-[#6C6A63] hover:text-[#1B2E4A] hover:bg-[#F6F4EF] rounded-[7px] transition-colors"
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteReturn(ret.id)}
                      className="p-1.5 text-[#6C6A63] hover:text-[#B4463A] hover:bg-[#F6E3E0] rounded-[7px] transition-colors"
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
          <div className="hidden md:block bg-white rounded-[14px] border border-[#DED8CC] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#1B2E4A] text-white">
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
                <tbody className="divide-y divide-[#EFEBE2]">
                  {filteredReturns.map((ret, idx) => (
                    <tr
                      key={ret.id}
                      className={`hover:bg-[#FAF6EF] transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#FDFCF9]'
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-bold text-sm text-[#1B2E4A] font-cairo">
                          {ret.productName}
                        </div>
                        {ret.customerName && (
                          <div className="text-[11px] text-[#6C6A63]">
                            طلب العميل: {ret.customerName}
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <span className="font-semibold text-xs text-[#1B2E4A]">
                          {ret.supplierName}
                        </span>
                      </td>

                      <td className="p-3 max-w-xs text-[#6C6A63]">
                        {ret.reason || '—'}
                      </td>

                      <td className="p-3 whitespace-nowrap text-[#6C6A63]">
                        {formatArabicDate(ret.returnDate)}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <span className="font-cairo font-bold text-sm text-[#B4463A]">
                          {formatCurrency(ret.price)}
                        </span>
                      </td>

                      <td className="p-3 text-center whitespace-nowrap">
                        <select
                          value={ret.status}
                          onChange={(e) =>
                            onUpdateReturnStatus(ret.id, e.target.value as ReturnStatus)
                          }
                          className="bg-white border border-[#DED8CC] rounded-lg px-2 py-1 text-xs font-semibold text-[#1B2E4A]"
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
                            className="p-1.5 text-[#6C6A63] hover:text-[#1B2E4A] hover:bg-[#F6F4EF] rounded-[7px] transition-colors"
                            title="تعديل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteReturn(ret.id)}
                            className="p-1.5 text-[#6C6A63] hover:text-[#B4463A] hover:bg-[#F6E3E0] rounded-[7px] transition-colors"
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
