import { Order, ReturnItem, Supplier } from '../types';
import { formatArabicDate } from './helpers';

/**
 * Downloads a CSV file with UTF-8 BOM so Excel on Windows/Mac opens Arabic correctly.
 */
export function downloadCSV(content: string, filename: string) {
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports orders to Excel/CSV with complete piece details.
 */
export function exportOrdersToCSV(orders: Order[], filename = 'دفتر_طلبيات_المحل.csv') {
  const headers = [
    'رقم الطلب',
    'اسم العميل',
    'هاتف العميل',
    'المورد',
    'الصنف والموديل',
    'المقاس',
    'اللون الأساسي',
    'اللون البديل',
    'الكمية',
    'تاريخ الطلب',
    'السعر',
    'العربون',
    'المتبقي',
    'الحالة',
    'ملاحظات',
  ];

  const escapeCSV = (val: any) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = orders.map((order) => {
    const remaining = (order.price || 0) - (order.deposit || 0);
    const statusText = order.status === 'done' ? 'تم التنفيذ والاستلام' : 'قيد الانتظار (معلّق)';
    return [
      escapeCSV(order.orderNumber),
      escapeCSV(order.customerName),
      escapeCSV(order.customerPhone || ''),
      escapeCSV(order.supplierName),
      escapeCSV(order.description),
      escapeCSV(order.size || 'حر'),
      escapeCSV(order.color || '-'),
      escapeCSV(order.alternativeColor || '-'),
      escapeCSV(order.quantity || 1),
      escapeCSV(order.orderDate),
      escapeCSV(order.price || 0),
      escapeCSV(order.deposit || 0),
      escapeCSV(remaining),
      escapeCSV(statusText),
      escapeCSV(order.notes || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadCSV(csvContent, filename);
}

/**
 * Exports returns to Excel/CSV for supplier reconciliation.
 */
export function exportReturnsToCSV(returns: ReturnItem[], filename = 'دفتر_المرتجعات.csv') {
  const headers = [
    'اسم الصنف والموديل',
    'المورد',
    'السعر / القيمة',
    'اسم العميل',
    'سبب الإرجاع / المشكلة',
    'تاريخ تسجيل الإرجاع',
    'الحالة مع المورد',
  ];

  const escapeCSV = (val: any) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = returns.map((item) => {
    let statusText = 'قيد التسليم للمورد';
    if (item.status === 'refunded') statusText = 'تم استرداد المبلغ';
    if (item.status === 'exchanged') statusText = 'تم الاستبدال بقطعة جديدة';

    return [
      escapeCSV(item.productName),
      escapeCSV(item.supplierName),
      escapeCSV(item.price),
      escapeCSV(item.customerName || '-'),
      escapeCSV(item.reason || '-'),
      escapeCSV(item.returnDate),
      escapeCSV(statusText),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadCSV(csvContent, filename);
}

/**
 * Exports supplier account ledger to Excel/CSV with balance and transaction summary.
 */
export function exportSupplierAccountsToCSV(suppliers: Supplier[], orders: Order[], returns: ReturnItem[], filename = 'حسابات_الموردين_المحلة.csv') {
  const headers = [
    'اسم المورد',
    'العنوان',
    'الهاتف',
    'الرصيد المستحق',
    'إجمالي المشتريات',
    'إجمالي المرتجعات',
    'صافي الرصيد',
    'ملاحظات',
  ];

  const escapeCSV = (val: unknown) => {
    if (val === undefined || val === null) return '""';
    return `"${String(val).replace(/"/g, '""')}"';
  };

  const rows = suppliers.map((s) => {
    const sOrders = orders.filter((o) => o.supplierId === s.id);
    const sReturns = returns.filter((r) => r.supplierId === s.id);
    const totalPurchases = sOrders.reduce((sum, o) => sum + (o.price || 0), 0);
    const totalReturns = sReturns.reduce((sum, r) => sum + (r.price || 0), 0);
    const balance = totalPurchases - totalReturns;
    return [
      escapeCSV(s.name),
      escapeCSV(s.address || '-'),
      escapeCSV(s.phone || '-'),
      escapeCSV(totalPurchases),
      escapeCSV(totalReturns),
      escapeCSV(balance),
      escapeCSV(s.notes || ''),
    ].join(',');
  });

  downloadCSV([headers.join(','), ...rows].join('\r\n'), filename);
}

/**
 * Exports the supplier directory with order/return totals.
 */
export function exportSuppliersToCSV(
  suppliers: Supplier[],
  orders: Order[],
  returns: ReturnItem[],
  filename = 'دليل_الموردين.csv'
) {
  const headers = [
    'اسم المورد',
    'العنوان',
    'الهاتف',
    'عدد الطلبات',
    'طلبات معلّقة',
    'قيمة الطلبات',
    'عدد المرتجعات',
    'قيمة المرتجعات',
    'ملاحظات',
  ];

  const escapeCSV = (val: unknown) => {
    if (val === undefined || val === null) return '""';
    return `"${String(val).replace(/"/g, '""')}"`;
  };

  const rows = suppliers.map((s) => {
    const sOrders = orders.filter((o) => o.supplierId === s.id);
    const sReturns = returns.filter((r) => r.supplierId === s.id);
    return [
      escapeCSV(s.name),
      escapeCSV(s.address || '-'),
      escapeCSV(s.phone || '-'),
      escapeCSV(sOrders.length),
      escapeCSV(sOrders.filter((o) => o.status === 'pending').length),
      escapeCSV(sOrders.reduce((sum, o) => sum + (o.price || 0), 0)),
      escapeCSV(sReturns.length),
      escapeCSV(sReturns.reduce((sum, r) => sum + (r.price || 0), 0)),
      escapeCSV(s.notes || ''),
    ].join(',');
  });

  downloadCSV([headers.join(','), ...rows].join('\r\n'), filename);
}
