import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Plus,
  Search,
  LayoutGrid,
  Table as TableIcon,
  MessageCircle,
  Edit2,
  Trash2,
  Check,
  Clock,
  Printer,
  X,
  StickyNote,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  Notebook,
} from 'lucide-react';
import { Order, Supplier } from '../types';
import { formatArabicDate, formatCurrency } from '../utils/helpers';
import { printOrders } from '../utils/printOrders';
import { StatusBadge } from './StatusBadge';
import { OrderCard } from './OrderCard';

type StatusFilter = 'all' | 'pending' | 'done';
type DateRange = 'all' | 'today' | 'week' | 'month' | 'custom';
type SortKey = 'orderNumber' | 'orderDate' | 'price' | 'customer' | 'supplier' | 'status';
type SortDir = 'asc' | 'desc';

interface OrdersViewProps {
  orders: Order[];
  suppliers: Supplier[];
  storeName?: string;
  onOpenNewOrder: () => void;
  onToggleStatus: (orderId: string) => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onBulkDeleteOrders?: (orderIds: string[]) => void;
  onBulkSetStatus?: (orderIds: string[], status: 'pending' | 'done') => void;
  onSelectCustomer: (customerName: string) => void;
  onSelectSupplier: (supplierId: string) => void;
  onOpenWhatsApp?: (order: Order) => void;
  initialFilterStatus?: StatusFilter;
  initialSearchTerm?: string;
}

const FILTERS_KEY = 'daftar_orders_filters_v1';

interface StoredFilters {
  statusFilter: StatusFilter;
  supplierFilter: string;
  dateRange: DateRange;
  customFrom: string;
  customTo: string;
  sortKey: SortKey;
  sortDir: SortDir;
  viewMode: 'cards' | 'table';
  pageSize: number;
}

const DEFAULT_FILTERS: StoredFilters = {
  statusFilter: 'all',
  supplierFilter: 'all',
  dateRange: 'all',
  customFrom: '',
  customTo: '',
  sortKey: 'orderDate',
  sortDir: 'desc',
  viewMode: 'table',
  pageSize: 25,
};

function readStoredFilters(): StoredFilters {
  if (typeof window === 'undefined') return DEFAULT_FILTERS;
  try {
    const raw = window.localStorage.getItem(FILTERS_KEY);
    if (!raw) return DEFAULT_FILTERS;
    return { ...DEFAULT_FILTERS, ...(JSON.parse(raw) as Partial<StoredFilters>) };
  } catch {
    return DEFAULT_FILTERS;
  }
}

const toDateString = (d: Date) => d.toISOString().split('T')[0];

function rangeStart(range: DateRange): string | null {
  const now = new Date();
  if (range === 'today') return toDateString(now);
  if (range === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    return toDateString(d);
  }
  if (range === 'month') {
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    return toDateString(d);
  }
  return null;
}

const DATE_LABELS: Record<DateRange, string> = {
  all: 'كل التواريخ',
  today: 'اليوم',
  week: 'آخر ٧ أيام',
  month: 'هذا الشهر',
  custom: 'مدى مخصص',
};

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  suppliers,
  storeName,
  onOpenNewOrder,
  onToggleStatus,
  onEditOrder,
  onDeleteOrder,
  onBulkDeleteOrders,
  onBulkSetStatus,
  onSelectCustomer,
  onSelectSupplier,
  onOpenWhatsApp,
  initialFilterStatus,
  initialSearchTerm = '',
}) => {
  const stored = useRef<StoredFilters>(readStoredFilters());

  const [searchInput, setSearchInput] = useState(initialSearchTerm);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    initialFilterStatus ?? stored.current.statusFilter
  );
  const [supplierFilter, setSupplierFilter] = useState<string>(stored.current.supplierFilter);
  const [dateRange, setDateRange] = useState<DateRange>(stored.current.dateRange);
  const [customFrom, setCustomFrom] = useState(stored.current.customFrom);
  const [customTo, setCustomTo] = useState(stored.current.customTo);
  const [sortKey, setSortKey] = useState<SortKey>(stored.current.sortKey);
  const [sortDir, setSortDir] = useState<SortDir>(stored.current.sortDir);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(stored.current.viewMode);
  const [pageSize, setPageSize] = useState<number>(stored.current.pageSize);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ ids: string[]; label: string } | null>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput), 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (initialSearchTerm) {
      setSearchInput(initialSearchTerm);
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  useEffect(() => {
    if (initialFilterStatus) setStatusFilter(initialFilterStatus);
  }, [initialFilterStatus]);

  // Persist filters between tab switches / sessions
  useEffect(() => {
    try {
      const payload: StoredFilters = {
        statusFilter,
        supplierFilter,
        dateRange,
        customFrom,
        customTo,
        sortKey,
        sortDir,
        viewMode,
        pageSize,
      };
      window.localStorage.setItem(FILTERS_KEY, JSON.stringify(payload));
    } catch {
      /* ignore storage errors */
    }
  }, [
    statusFilter,
    supplierFilter,
    dateRange,
    customFrom,
    customTo,
    sortKey,
    sortDir,
    viewMode,
    pageSize,
  ]);

  // Mobile: force card view (the table needs long horizontal scrolling)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const apply = () => setIsSmallScreen(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const effectiveViewMode: 'cards' | 'table' = isSmallScreen ? 'cards' : viewMode;

  const filteredOrders = useMemo(() => {
    const start = dateRange === 'custom' ? customFrom || null : rangeStart(dateRange);
    const end = dateRange === 'custom' ? customTo || null : null;
    const term = searchTerm.trim().toLowerCase();

    const list = orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (supplierFilter !== 'all' && order.supplierId !== supplierFilter) return false;

      if (start && (order.orderDate || '') < start) return false;
      if (end && (order.orderDate || '') > end) return false;

      if (term) {
        const matches =
          order.customerName.toLowerCase().includes(term) ||
          order.supplierName.toLowerCase().includes(term) ||
          order.description.toLowerCase().includes(term) ||
          Boolean(order.customerPhone?.includes(term)) ||
          String(order.orderNumber).includes(term);
        if (!matches) return false;
      }

      return true;
    });

    const dir = sortDir === 'asc' ? 1 : -1;
    return list.sort((a, b) => {
      switch (sortKey) {
        case 'orderNumber':
          return ((a.orderNumber || 0) - (b.orderNumber || 0)) * dir;
        case 'price':
          return ((a.price || 0) - (b.price || 0)) * dir;
        case 'customer':
          return a.customerName.localeCompare(b.customerName, 'ar') * dir;
        case 'supplier':
          return a.supplierName.localeCompare(b.supplierName, 'ar') * dir;
        case 'status':
          return a.status.localeCompare(b.status) * dir;
        case 'orderDate':
        default:
          return (a.orderDate || '').localeCompare(b.orderDate || '') * dir;
      }
    });
  }, [
    orders,
    statusFilter,
    supplierFilter,
    searchTerm,
    dateRange,
    customFrom,
    customTo,
    sortKey,
    sortDir,
  ]);

  // Reset pagination when the result set changes
  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    statusFilter,
    supplierFilter,
    dateRange,
    customFrom,
    customTo,
    pageSize,
    sortKey,
    sortDir,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageOrders = useMemo(
    () => filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredOrders, currentPage, pageSize]
  );

  // Drop selections that are no longer visible in the filtered result
  useEffect(() => {
    setSelectedIds((prev) => {
      const visible = new Set(filteredOrders.map((o) => o.id));
      const next = prev.filter((id) => visible.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [filteredOrders]);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const doneCount = orders.filter((o) => o.status === 'done').length;

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const pageAllSelected = pageOrders.length > 0 && pageOrders.every((o) => selectedSet.has(o.id));

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const togglePageSelection = () => {
    setSelectedIds((prev) => {
      if (pageAllSelected) {
        const ids = new Set(pageOrders.map((o) => o.id));
        return prev.filter((id) => !ids.has(id));
      }
      return Array.from(new Set([...prev, ...pageOrders.map((o) => o.id)]));
    });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'customer' || key === 'supplier' ? 'asc' : 'desc');
    }
  };

  const filterLabel = [
    statusFilter === 'all' ? 'كل الحالات' : statusFilter === 'pending' ? 'معلّق' : 'تم التنفيذ',
    DATE_LABELS[dateRange],
  ]
    .filter(Boolean)
    .join(' — ');

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const { ids } = pendingDelete;
    if (ids.length === 1) {
      onDeleteOrder(ids[0]);
    } else if (onBulkDeleteOrders) {
      onBulkDeleteOrders(ids);
    } else {
      ids.forEach((id) => onDeleteOrder(id));
    }
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    setPendingDelete(null);
  };

  const applyBulkStatus = (status: 'pending' | 'done') => {
    if (!selectedIds.length) return;
    if (onBulkSetStatus) {
      onBulkSetStatus(selectedIds, status);
    } else {
      selectedIds.forEach((id) => {
        const order = orders.find((o) => o.id === id);
        if (order && order.status !== status) onToggleStatus(id);
      });
    }
    setSelectedIds([]);
  };

  const SortHeader: React.FC<{ label: string; sortKeyName: SortKey; className?: string }> = ({
    label,
    sortKeyName,
    className = '',
  }) => (
    <th className={`p-3 font-cairo ${className}`}>
      <button
        type="button"
        onClick={() => handleSort(sortKeyName)}
        className={`inline-flex items-center gap-1 font-cairo transition-colors ${
          sortKey === sortKeyName ? 'text-brass' : 'text-ink hover:text-brass'
        }`}
        title="اضغط للترتيب"
      >
        <span>{label}</span>
        {sortKey === sortKeyName &&
          (sortDir === 'asc' ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          ))}
      </button>
    </th>
  );

  const hasNoOrdersAtAll = orders.length === 0;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-[14px] p-4 sm:p-5 border border-line shadow-xs grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-lg sm:text-2xl font-extrabold font-cairo text-ink">
            سجل طلبات العملاء ({filteredOrders.length})
          </h1>
          <p className="text-xs sm:text-sm text-copy-muted mt-0.5">
            متابعة الأصناف والأسعار وحالة كل طلب
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => printOrders(filteredOrders, { storeName, filterLabel })}
            className="flex items-center gap-1.5 bg-paper hover:bg-paper-alt text-ink border border-line px-3 py-2.5 rounded-[9px] text-xs sm:text-sm font-bold shadow-2xs transition-all"
            title="طباعة قائمة الطلبات المعروضة"
          >
            <Printer className="w-4 h-4 text-brass" />
            <span className="hidden sm:inline">طباعة</span>
          </button>

          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 bg-ink hover:bg-ink-light text-white px-4 py-2.5 rounded-[9px] text-xs sm:text-sm font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 text-brass-light" />
            <span>طلب جديد</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-[14px] p-4 border border-line shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-copy-muted" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ابحث بالاسم، هاتف العميل، المورد، أو تفاصيل الصنف..."
              className="w-full pr-9 pl-9 py-2.5 text-xs sm:text-sm rounded-[9px] border border-line bg-paper focus:bg-white focus:outline-none focus:border-brass"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-copy-muted hover:text-ink hover:bg-paper-alt"
                title="مسح البحث"
                aria-label="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center bg-paper p-1 rounded-lg border border-line">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-2 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === 'table' ? 'bg-white text-ink shadow-xs' : 'text-copy-muted hover:text-ink'
                }`}
                title="عرض جدول"
              >
                <TableIcon className="w-4 h-4" />
                <span className="hidden sm:inline">جدول</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2 py-2 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-ink shadow-xs' : 'text-copy-muted hover:text-ink'
                }`}
                title="عرض بطاقات"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">بطاقات</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Filters & Dropdowns */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-paper-alt">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 rounded-lg font-bold shrink-0 transition-colors ${
                statusFilter === 'all'
                  ? 'bg-ink text-white shadow-xs'
                  : 'bg-paper text-copy-muted hover:bg-paper-alt'
              }`}
            >
              الكل ({orders.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-2 rounded-lg font-bold shrink-0 transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-pending text-white shadow-xs'
                  : 'bg-pending-soft text-pending hover:bg-pending-soft'
              }`}
            >
              معلّق ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('done')}
              className={`px-3 py-2 rounded-lg font-bold shrink-0 transition-colors ${
                statusFilter === 'done'
                  ? 'bg-done text-white shadow-xs'
                  : 'bg-done-soft text-done hover:bg-done-soft'
              }`}
            >
              تم التنفيذ ({doneCount})
            </button>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 text-xs w-full sm:w-auto">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="bg-paper border border-line rounded-lg px-2.5 py-2.5 font-medium text-ink w-full"
            >
              {(Object.keys(DATE_LABELS) as DateRange[]).map((key) => (
                <option key={key} value={key}>
                  {DATE_LABELS[key]}
                </option>
              ))}
            </select>

            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="bg-paper border border-line rounded-lg px-2.5 py-2.5 font-medium text-ink w-full"
            >
              <option value="all">كل الموردين</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={`${sortKey}:${sortDir}`}
              onChange={(e) => {
                const [key, dir] = e.target.value.split(':');
                setSortKey(key as SortKey);
                setSortDir(dir as SortDir);
              }}
              className="bg-paper border border-line rounded-lg px-2.5 py-2.5 font-medium text-ink w-full"
            >
              <option value="orderDate:desc">الأحدث أولًا</option>
              <option value="orderDate:asc">الأقدم أولًا</option>
              <option value="customer:asc">اسم العميل</option>
            </select>
          </div>
        </div>

        {dateRange === 'custom' && (
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <label className="flex flex-col gap-1 font-semibold text-copy-muted">
              من تاريخ
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="bg-paper border border-line rounded-lg px-2.5 py-2 text-ink"
              />
            </label>
            <label className="flex flex-col gap-1 font-semibold text-copy-muted">
              إلى تاريخ
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="bg-paper border border-line rounded-lg px-2.5 py-2 text-ink"
              />
            </label>
          </div>
        )}

      </div>

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-2 z-20 bg-ink text-white rounded-[12px] px-4 py-3 shadow-md flex flex-wrap items-center gap-2 justify-between">
          <span className="text-xs sm:text-sm font-bold font-cairo">
            محدد: {selectedIds.length} طلب
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => applyBulkStatus('done')}
              className="flex items-center gap-1 bg-done text-white px-3 py-2 rounded-lg text-xs font-bold"
            >
              <Check className="w-3.5 h-3.5" /> تعليم كـ تم
            </button>
            <button
              onClick={() => applyBulkStatus('pending')}
              className="flex items-center gap-1 bg-pending text-white px-3 py-2 rounded-lg text-xs font-bold"
            >
              <Clock className="w-3.5 h-3.5" /> إعادة كمعلّق
            </button>
            <button
              onClick={() =>
                setPendingDelete({
                  ids: selectedIds,
                  label: `${selectedIds.length} طلب`,
                })
              }
              className="flex items-center gap-1 bg-late text-white px-3 py-2 rounded-lg text-xs font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" /> حذف
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-2 rounded-lg hover:bg-white/10"
              title="إلغاء التحديد"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {filteredOrders.length === 0 ? (
        hasNoOrdersAtAll ? (
          <div className="bg-white rounded-[14px] p-12 text-center border border-line">
            <div className="w-14 h-14 rounded-full bg-brass/10 text-brass mx-auto flex items-center justify-center mb-3">
              <Notebook className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold font-cairo text-ink">دفترك جاهز — لم تسجّل أي طلب بعد</h3>
            <p className="text-xs text-copy-muted mt-1 mb-4">
              ابدأ بتسجيل أول طلب لعميلك وسيظهر هنا مباشرة على كل أجهزتك
            </p>
            <button
              onClick={onOpenNewOrder}
              className="inline-flex items-center gap-1.5 bg-ink hover:bg-ink-light text-white px-4 py-2.5 rounded-[9px] text-sm font-bold"
            >
              <Plus className="w-4 h-4 text-brass-light" />
              إضافة أول طلب
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[14px] p-12 text-center border border-line">
            <div className="w-12 h-12 rounded-full bg-paper text-copy-muted mx-auto flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-cairo text-ink">
              لا توجد طلبات تطابق الفلترة المحددة
            </h3>
            <p className="text-xs text-copy-muted mt-1">
              جرب تغيير كلمات البحث أو مسح خيارات الفلترة لعرض الطلبات
            </p>
          </div>
        )
      ) : effectiveViewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {pageOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onToggleStatus={onToggleStatus}
              onEdit={onEditOrder}
              onDelete={(id) => {
                const target = orders.find((o) => o.id === id);
                setPendingDelete({
                  ids: [id],
                  label: target ? `طلب #${target.orderNumber} — ${target.customerName}` : 'هذا الطلب',
                });
              }}
              onSelectCustomer={onSelectCustomer}
              onSelectSupplier={onSelectSupplier}
              onOpenWhatsApp={onOpenWhatsApp}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[14px] border border-line overflow-hidden shadow-xs">
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-right text-xs">
              <thead className="sticky top-0 z-10 bg-paper-alt/95 backdrop-blur border-b-2 border-brass text-ink">
                <tr>
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      checked={pageAllSelected}
                      onChange={togglePageSelection}
                      className="w-4 h-4 accent-[var(--brass,#B08948)] cursor-pointer"
                      aria-label="تحديد كل طلبات الصفحة"
                    />
                  </th>
                  <SortHeader label="#" sortKeyName="orderNumber" />
                  <SortHeader label="العميل" sortKeyName="customer" />
                  <SortHeader label="المورد" sortKeyName="supplier" />
                  <th className="p-3 font-cairo">تفاصيل الصنف والمقاس</th>
                  <SortHeader label="تاريخ الطلب" sortKeyName="orderDate" />
                  <SortHeader label="السعر" sortKeyName="price" />
                  <SortHeader label="الحالة" sortKeyName="status" className="text-center" />
                  <th className="p-3 font-cairo text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-alt">
                {pageOrders.map((order, idx) => {
                  const isSelected = selectedSet.has(order.id);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => onEditOrder(order)}
                      className={`cursor-pointer transition-colors hover:bg-paper-warm ${
                        isSelected
                          ? 'bg-brass/10'
                          : idx % 2 === 0
                            ? 'bg-white'
                            : 'bg-canvas-subtle'
                      }`}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(order.id)}
                          className="w-4 h-4 accent-[var(--brass,#B08948)] cursor-pointer"
                          aria-label={`تحديد طلب ${order.orderNumber}`}
                        />
                      </td>

                      <td className="p-3 font-cairo font-bold text-ink">#{order.orderNumber}</td>

                      <td className="p-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCustomer(order.customerName);
                          }}
                          className="font-bold font-cairo text-sm text-ink hover:text-brass text-right block"
                        >
                          {order.customerName}
                        </button>
                        {order.customerPhone && (
                          <span className="text-[11px] text-copy-muted font-cairo font-bold block">
                            {order.customerPhone}
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSupplier(order.supplierId);
                          }}
                          className="font-semibold text-xs text-ink hover:text-brass text-right"
                        >
                          {order.supplierName}
                        </button>
                      </td>

                      <td className="p-3 max-w-xs">
                        <div className="flex items-start gap-1.5">
                          <div className="min-w-0">
                            <div className="font-semibold text-charcoal line-clamp-2">
                              {order.description}
                            </div>
                            {(order.size ||
                              order.color ||
                              order.alternativeColor ||
                              (order.quantity && order.quantity > 1)) && (
                              <div className="flex flex-wrap items-center gap-1 text-[10px] mt-1">
                                {order.size && (
                                  <span className="px-1.5 py-0.5 rounded bg-size-soft text-ink font-semibold">
                                    مقاس: {order.size}
                                  </span>
                                )}
                                {order.color && (
                                  <span className="px-1.5 py-0.5 rounded bg-color-soft text-brass font-semibold border border-pending-soft/60">
                                    لون: {order.color}
                                  </span>
                                )}
                                {order.alternativeColor && (
                                  <span className="px-1.5 py-0.5 rounded bg-paper text-copy-muted border border-line">
                                    بديل: {order.alternativeColor}
                                  </span>
                                )}
                                {order.quantity && order.quantity > 1 && (
                                  <span className="px-1.5 py-0.5 rounded bg-done-soft text-done font-bold font-cairo">
                                    {order.quantity} قطع
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          {order.notes && (
                            <span
                              className="shrink-0 text-pending"
                              title={`ملاحظة: ${order.notes}`}
                              aria-label={`ملاحظة: ${order.notes}`}
                            >
                              <StickyNote className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <div className="font-semibold text-ink">
                          {formatArabicDate(order.orderDate)}
                        </div>
                      </td>

                      <td className="p-3 whitespace-nowrap font-bold text-ink font-cairo">
                        {formatCurrency(order.price)}
                      </td>


                      <td className="p-3 text-center whitespace-nowrap">
                        <StatusBadge status={order.status} order={order} />
                      </td>

                      <td className="p-3 text-left whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onToggleStatus(order.id)}
                            className={`p-2.5 rounded-[7px] text-xs font-semibold flex items-center gap-1 transition-colors ${
                              order.status === 'done'
                                ? 'bg-pending-soft text-pending hover:bg-pending-soft'
                                : 'bg-done-soft text-done hover:bg-done-soft'
                            }`}
                            title={order.status === 'done' ? 'إعادة كمعلق' : 'تحديد كـ تم التنفيذ'}
                          >
                            {order.status === 'done' ? (
                              <Clock className="w-4 h-4" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>

                          {order.customerPhone && (
                            <button
                              type="button"
                              onClick={() => (onOpenWhatsApp ? onOpenWhatsApp(order) : undefined)}
                              className="p-2.5 text-done hover:bg-done-soft rounded-[7px] transition-colors"
                              title="رسائل وقوالب واتساب"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => onEditOrder(order)}
                            className="p-2.5 text-copy-muted hover:text-ink hover:bg-paper rounded-[7px] transition-colors"
                            title="تعديل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              setPendingDelete({
                                ids: [order.id],
                                label: `طلب #${order.orderNumber} — ${order.customerName}`,
                              })
                            }
                            className="p-2.5 text-copy-muted hover:text-late hover:bg-late-soft rounded-[7px] transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="bg-white rounded-[14px] border border-line shadow-xs px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-copy-muted">
            <span>
              عرض {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredOrders.length)} من {filteredOrders.length}
            </span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-paper border border-line rounded-lg px-2 py-1.5 font-medium text-ink"
              title="عدد الصفوف في الصفحة"
            >
              {[25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} / صفحة
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-line bg-paper text-ink disabled:opacity-40"
              title="الصفحة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="font-bold font-cairo text-ink px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-line bg-paper text-ink disabled:opacity-40"
              title="الصفحة التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPendingDelete(null)}
        >
          <div
            className="bg-white rounded-[14px] border border-line shadow-lg w-full max-w-sm p-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-late-soft text-late mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold font-cairo text-ink text-base">تأكيد الحذف</h3>
            <p className="text-xs text-copy-muted mt-1">
              سيتم حذف {pendingDelete.label} من الدفتر. يمكنك التراجع مباشرة بعد الحذف.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 py-2.5 rounded-[9px] border border-line bg-paper text-ink font-bold text-sm"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-[9px] bg-late text-white font-bold text-sm"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
