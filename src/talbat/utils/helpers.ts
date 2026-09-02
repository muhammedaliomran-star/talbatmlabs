import { Order } from '../types';

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const isOrderLate = (order: Order): boolean => {
  if (order.status === 'done') return false;
  const today = getTodayDateString();
  return order.travelDate < today;
};

export const isOrderUpcoming = (order: Order, daysRange = 7): boolean => {
  if (order.status === 'done') return false;
  const today = new Date(getTodayDateString());
  const travel = new Date(order.travelDate);
  const diffTime = travel.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= daysRange;
};

export const getDaysDifference = (dateStr: string): number => {
  const today = new Date(getTodayDateString());
  const target = new Date(dateStr);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatArabicDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      
      const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      return `${day} ${monthNames[month - 1]} ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

export const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export const formatCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null) return '—';
  return `${amount.toLocaleString('en-US')} ج.م`;
};

export const normalizeToEnglishDigits = (str: string): string => {
  if (!str) return '';
  return str.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
};

export const createWhatsAppUrl = (phone?: string, text?: string): string => {
  if (!phone) return '';
  // Convert any Arabic-indic digits first, then clean
  const englishPhone = normalizeToEnglishDigits(phone);
  let cleanPhone = englishPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('01')) {
    cleanPhone = '2' + cleanPhone; // Add Egypt code
  }
  const encodedText = encodeURIComponent(text || 'مرحباً، نود إبلاغك بشأن طلبك في المحل.');
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
};

export const exportDataAsJson = (data: unknown, filename = 'daftar_backup.json') => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
