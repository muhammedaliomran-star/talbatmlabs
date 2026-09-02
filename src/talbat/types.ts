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
  travelDate: string; // YYYY-MM-DD (ميعاد التوريد / يوم السفر)
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

export type TripStatus = 'planned' | 'in_progress' | 'completed';
export type TripItemStatus = 'pending' | 'bought' | 'unavailable' | 'exchanged';

export interface TripItemCheck {
  orderId: string;
  status: TripItemStatus;
  notes?: string;
}

export interface ShoppingTrip {
  id: string;
  title: string; // e.g. "رحلة الإثنين 8 سبتمبر - سوق الموسكي"
  date: string; // YYYY-MM-DD
  destination?: string; // السوق / الوجهة
  status: TripStatus;
  items: TripItemCheck[];
  notes?: string;
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
  phone?: string;
  password?: string;
  createdAt?: string;
}

export type ActiveTab = 'dashboard' | 'orders' | 'trips' | 'suppliers' | 'returns';

export interface AppData {
  orders: Order[];
  suppliers: Supplier[];
  customers: Customer[];
  returns: ReturnItem[];
  trips?: ShoppingTrip[];
}
