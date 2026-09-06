import { Order, ReturnItem, Supplier } from '../types';
import { formatArabicDate, formatCurrency } from './helpers';

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Opens a printable supplier directory with per-supplier order/return totals.
 */
export function printSuppliers(
  suppliers: Supplier[],
  orders: Order[],
  returns: ReturnItem[],
  meta?: { storeName?: string; filterLabel?: string }
) {
  const win = window.open('', '_blank', 'width=1024,height=768');
  if (!win) return;

  const stats = suppliers.map((s) => {
    const sOrders = orders.filter((o) => o.supplierId === s.id);
    const sReturns = returns.filter((r) => r.supplierId === s.id);
    return {
      supplier: s,
      ordersCount: sOrders.length,
      pendingCount: sOrders.filter((o) => o.status === 'pending').length,
      ordersValue: sOrders.reduce((sum, o) => sum + (o.price || 0), 0),
      returnsCount: sReturns.length,
      returnsValue: sReturns.reduce((sum, r) => sum + (r.price || 0), 0),
    };
  });

  const totalOrders = stats.reduce((sum, s) => sum + s.ordersCount, 0);
  const totalOrdersValue = stats.reduce((sum, s) => sum + s.ordersValue, 0);
  const totalReturnsValue = stats.reduce((sum, s) => sum + s.returnsValue, 0);

  const rows = stats
    .map(
      (s) => `
        <tr>
          <td>
            <strong>${escapeHtml(s.supplier.name)}</strong>
            ${s.supplier.notes ? `<div class="muted">${escapeHtml(s.supplier.notes)}</div>` : ''}
          </td>
          <td>${escapeHtml(s.supplier.address || '—')}</td>
          <td class="num">${escapeHtml(s.supplier.phone || '—')}</td>
          <td class="num">${s.ordersCount}${s.pendingCount ? ` <span class="muted">(${s.pendingCount} معلّق)</span>` : ''}</td>
          <td class="num">${escapeHtml(formatCurrency(s.ordersValue))}</td>
          <td class="num">${s.returnsCount}</td>
          <td class="num">${escapeHtml(formatCurrency(s.returnsValue))}</td>
        </tr>`
    )
    .join('');

  win.document.write(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>دليل الموردين</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: "Cairo", "Tajawal", system-ui, sans-serif; background: #fdfaf3; color: #2b2620; padding: 24px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .sub { font-size: 12px; color: #8a7f70; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #f3ece0; border-bottom: 2px solid #b08948; padding: 8px; text-align: right; }
  td { padding: 8px; border-bottom: 1px solid #e6ddcd; vertical-align: top; }
  tbody tr:nth-child(even) { background: #fffdf8; }
  .muted { color: #8a7f70; font-size: 10px; margin-top: 2px; }
  .num { white-space: nowrap; }
  tfoot td { font-weight: 700; border-top: 2px solid #b08948; }
  @media print { body { background: #fff; padding: 0; } }
</style>
</head>
<body>
  <h1>${escapeHtml(meta?.storeName || 'دليل الموردين والمصانع')}</h1>
  <div class="sub">
    ${escapeHtml(meta?.filterLabel || 'كل الموردين')} — ${suppliers.length} مورد —
    طُبع في ${escapeHtml(formatArabicDate(new Date().toISOString().split('T')[0]))}
  </div>
  <table>
    <thead>
      <tr>
        <th>المورد</th><th>العنوان</th><th>الهاتف</th>
        <th>الطلبات</th><th>قيمة الطلبات</th><th>المرتجعات</th><th>قيمة المرتجعات</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="3">الإجمالي</td>
        <td class="num">${totalOrders}</td>
        <td class="num">${escapeHtml(formatCurrency(totalOrdersValue))}</td>
        <td></td>
        <td class="num">${escapeHtml(formatCurrency(totalReturnsValue))}</td>
      </tr>
    </tfoot>
  </table>
  <script>window.onload = function () { window.print(); };<\/script>
</body>
</html>`);
  win.document.close();
}
