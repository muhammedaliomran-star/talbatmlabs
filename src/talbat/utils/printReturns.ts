import { ReturnItem } from '../types';
import { formatArabicDate, formatCurrency } from './helpers';

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const statusLabel = (status: ReturnItem['status']) => {
  switch (status) {
    case 'pending_supplier':
      return 'معلق مع المورد';
    case 'refunded':
      return 'تم استرداد القيمة';
    case 'exchanged':
      return 'تم الاستبدال';
    default:
      return '—';
  }
};

/**
 * Opens a printable sheet with the currently filtered returns,
 * keeping the paper-ledger identity of the app.
 */
export function printReturns(returns: ReturnItem[], meta?: { storeName?: string; filterLabel?: string }) {
  const win = window.open('', '_blank', 'width=1024,height=768');
  if (!win) return;

  const total = returns.reduce((sum, r) => sum + (r.price || 0), 0);
  const pending = returns
    .filter((r) => r.status === 'pending_supplier')
    .reduce((sum, r) => sum + (r.price || 0), 0);

  const rows = returns
    .map(
      (r) => `
        <tr>
          <td>
            <strong>${escapeHtml(r.productName)}</strong>
            ${r.customerName ? `<div class="muted">العميل: ${escapeHtml(r.customerName)}</div>` : ''}
          </td>
          <td>${escapeHtml(r.supplierName)}</td>
          <td>${r.reason ? escapeHtml(r.reason) : '—'}</td>
          <td class="num">${escapeHtml(formatArabicDate(r.returnDate))}</td>
          <td class="num">${escapeHtml(formatCurrency(r.price))}</td>
          <td class="num">${escapeHtml(statusLabel(r.status))}</td>
        </tr>`
    )
    .join('');

  win.document.write(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>سجل المرتجعات</title>
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
  <h1>${escapeHtml(meta?.storeName || 'سجل المرتجعات')}</h1>
  <div class="sub">
    ${escapeHtml(meta?.filterLabel || 'كل المرتجعات')} — ${returns.length} مرتجع —
    طُبع في ${escapeHtml(formatArabicDate(new Date().toISOString().split('T')[0]))}
  </div>
  <table>
    <thead>
      <tr>
        <th>الصنف</th><th>المورد</th><th>السبب</th>
        <th>تاريخ الإرجاع</th><th>القيمة</th><th>الحالة</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="4">الإجمالي (منها ${escapeHtml(formatCurrency(pending))} معلّقة)</td>
        <td class="num">${escapeHtml(formatCurrency(total))}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>
  <script>window.onload = function () { window.print(); };<\/script>
</body>
</html>`);
  win.document.close();
}
