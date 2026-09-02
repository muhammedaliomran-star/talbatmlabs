export type OrderStatus = 'pending' | 'done';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  supplierId: string;
  supplierName: string;
  description: string;
  size?: string; // S, M, L, XL, 2XL, أطفال, حر...
  color?: string; // اللون الأساسي
  alternativeColor?: string; // اللون البديل في حال عدم التوفر
  quantity?: number; // الكمية المطلوبة
  price?: number;
  deposit?: number;
  orderDate: string; // YYYY-MM-DD
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}

export type ReturnStatus = 'pending_supplier' | 'refunded' | 'exchanged';

export interface ReturnItem {
  id: string;
  productName: string;
  price: number;
  supplierId: string;
  supplierName: string;
  orderId?: string;
  customerName?: string;
  reason?: string;
  returnDate: string; // YYYY-MM-DD
  status: ReturnStatus;
  createdAt: string;
}

export type UserRole = 'owner' | 'buyer' | 'assistant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeName: string;
  pinCode?: string; // 4 or 6 digit quick PIN
  avatarColor?: string;
  brandImagePath?: string;
  brandImageUrl?: string;
  logoPath?: string;
  logoUrl?: string;
  phone?: string;
  password?: string;
  createdAt?: string;
}

export type ActiveTab = 'dashboard' | 'orders' | 'suppliers' | 'returns';

export interface AppData {
  orders: Order[];
  suppliers: Supplier[];
  customers: Customer[];
  returns: ReturnItem[];
}
