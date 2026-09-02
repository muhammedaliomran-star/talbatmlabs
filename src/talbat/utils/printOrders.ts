import { Order } from '../types';
import { formatArabicDate, formatCurrency } from './helpers';

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Opens a printable sheet with the currently filtered orders,
 * keeping the paper-ledger identity of the app.
 */
export function printOrders(orders: Order[], meta?: { storeName?: string; filterLabel?: string }) {
  const win = window.open('', '_blank', 'width=1024,height=768');
  if (!win) return;

  const totalPrice = orders.reduce((sum, o) => sum + (o.price || 0), 0);
  const totalDeposit = orders.reduce((sum, o) => sum + (o.deposit || 0), 0);
  const totalRemaining = totalPrice - totalDeposit;

  const rows = orders
    .map((order) => {
      const remaining = (order.price || 0) - (order.deposit || 0);
      const specs = [
        order.size ? `مقاس: ${order.size}` : '',
        order.color ? `لون: ${order.color}` : '',
        order.alternativeColor ? `بديل: ${order.alternativeColor}` : '',
        order.quantity && order.quantity > 1 ? `${order.quantity} قطع` : '',
      ]
        .filter(Boolean)
        .join(' • ');

      return `
        <tr>
          <td class="num">#${escapeHtml(order.orderNumber)}</td>
          <td>
            <strong>${escapeHtml(order.customerName)}</strong>
            ${order.customerPhone ? `<div class="muted">${escapeHtml(order.customerPhone)}</div>` : ''}
          </td>
          <td>${escapeHtml(order.supplierName)}</td>
          <td>
            ${escapeHtml(order.description)}
            ${specs ? `<div class="muted">${escapeHtml(specs)}</div>` : ''}
            ${order.notes ? `<div class="muted">ملاحظة: ${escapeHtml(order.notes)}</div>` : ''}
          </td>
          <td class="num">${escapeHtml(formatArabicDate(order.orderDate))}</td>
          <td class="num">${escapeHtml(formatCurrency(order.price))}</td>
          <td class="num">${remaining > 0 ? escapeHtml(formatCurrency(remaining)) : '—'}</td>
          <td class="num">${order.status === 'done' ? 'تم التنفيذ' : 'معلّق'}</td>
        </tr>`;
    })
    .join('');

  win.document.write(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>قائمة الطلبات</title>
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
  <h1>${escapeHtml(meta?.storeName || 'دفتر الطلبات')}</h1>
  <div class="sub">
    ${escapeHtml(meta?.filterLabel || 'كل الطلبات')} — ${orders.length} طلب —
    طُبع في ${escapeHtml(formatArabicDate(new Date().toISOString().split('T')[0]))}
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th><th>العميل</th><th>المورد</th><th>تفاصيل الصنف</th>
        <th>تاريخ الطلب</th><th>السعر</th><th>المتبقي</th><th>الحالة</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="5">الإجمالي</td>
        <td class="num">${escapeHtml(formatCurrency(totalPrice))}</td>
        <td class="num">${escapeHtml(formatCurrency(totalRemaining))}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>
  <script>window.onload = function () { window.print(); };<\/script>
</body>
</html>`);
  win.document.close();
}
