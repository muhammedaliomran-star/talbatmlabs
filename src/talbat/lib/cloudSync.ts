import { supabase } from '@/integrations/supabase/client';
import type { Customer, Order, ReturnItem, Supplier } from '../types';

type Row = Record<string, unknown>;

export interface Collection<T extends { id: string }> {
  table: 'orders' | 'customers' | 'suppliers' | 'returns';
  toRow: (item: T, userId: string) => Row;
  fromRow: (row: Row) => T;
}

const s = (v: unknown) => (v == null ? undefined : String(v));
const n = (v: unknown) => (v == null ? undefined : Number(v));

export const customersCollection: Collection<Customer> = {
  table: 'customers',
  toRow: (c, userId) => ({
    id: c.id,
    user_id: userId,
    name: c.name,
    phone: c.phone ?? null,
    notes: c.notes ?? null,
    created_at: c.createdAt,
  }),
  fromRow: (r) => ({
    id: String(r['id']),
    name: String(r['name'] ?? ''),
    phone: s(r['phone']),
    notes: s(r['notes']),
    createdAt: String(r['created_at'] ?? new Date().toISOString()),
  }),
};

export const suppliersCollection: Collection<Supplier> = {
  table: 'suppliers',
  toRow: (v, userId) => ({
    id: v.id,
    user_id: userId,
    name: v.name,
    address: v.address ?? null,
    phone: v.phone ?? null,
    notes: v.notes ?? null,
    created_at: v.createdAt,
  }),
  fromRow: (r) => ({
    id: String(r['id']),
    name: String(r['name'] ?? ''),
    address: s(r['address']),
    phone: s(r['phone']),
    notes: s(r['notes']),
    createdAt: String(r['created_at'] ?? new Date().toISOString()),
  }),
};

export const ordersCollection: Collection<Order> = {
  table: 'orders',
  toRow: (o, userId) => ({
    id: o.id,
    user_id: userId,
    order_number: o.orderNumber ?? 1,
    customer_id: o.customerId || null,
    customer_name: o.customerName ?? '',
    customer_phone: o.customerPhone ?? null,
    supplier_id: o.supplierId || null,
    supplier_name: o.supplierName ?? '',
    description: o.description ?? '',
    size: o.size ?? null,
    color: o.color ?? null,
    alternative_color: o.alternativeColor ?? null,
    quantity: o.quantity ?? null,
    price: o.price ?? null,
    deposit: o.deposit ?? null,
    order_date: o.orderDate || new Date().toISOString().split('T')[0],
    status: o.status,
    notes: o.notes ?? null,
    created_at: o.createdAt,
  }),
  fromRow: (r) => ({
    id: String(r['id']),
    orderNumber: Number(r['order_number'] ?? 0),
    customerId: String(r['customer_id'] ?? ''),
    customerName: String(r['customer_name'] ?? ''),
    customerPhone: s(r['customer_phone']),
    supplierId: String(r['supplier_id'] ?? ''),
    supplierName: String(r['supplier_name'] ?? ''),
    description: String(r['description'] ?? ''),
    size: s(r['size']),
    color: s(r['color']),
    alternativeColor: s(r['alternative_color']),
    quantity: n(r['quantity']),
    price: n(r['price']),
    deposit: n(r['deposit']),
    orderDate: String(r['order_date'] ?? ''),
    status: (r['status'] === 'done' ? 'done' : 'pending') as Order['status'],
    notes: s(r['notes']),
    createdAt: String(r['created_at'] ?? new Date().toISOString()),
  }),
};

export const returnsCollection: Collection<ReturnItem> = {
  table: 'returns',
  toRow: (v, userId) => ({
    id: v.id,
    user_id: userId,
    product_name: v.productName ?? '',
    price: v.price ?? 0,
    supplier_id: v.supplierId || null,
    supplier_name: v.supplierName ?? '',
    order_id: v.orderId || null,
    customer_name: v.customerName ?? null,
    reason: v.reason ?? null,
    return_date: v.returnDate || new Date().toISOString().split('T')[0],
    status: v.status,
    created_at: v.createdAt,
  }),
  fromRow: (r) => ({
    id: String(r['id']),
    productName: String(r['product_name'] ?? ''),
    price: Number(r['price'] ?? 0),
    supplierId: String(r['supplier_id'] ?? ''),
    supplierName: String(r['supplier_name'] ?? ''),
    orderId: s(r['order_id']),
    customerName: s(r['customer_name']),
    reason: s(r['reason']),
    returnDate: String(r['return_date'] ?? ''),
    status: String(r['status'] ?? 'pending_supplier') as ReturnItem['status'],
    createdAt: String(r['created_at'] ?? new Date().toISOString()),
  }),
};

export async function fetchCollection<T extends { id: string }>(
  col: Collection<T>,
  userId: string
): Promise<T[]> {
  const { data, error } = await supabase
    .from(col.table)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => col.fromRow(r as Row));
}

/** Upserts changed/new rows and deletes removed ones. */
export async function syncCollection<T extends { id: string }>(
  col: Collection<T>,
  userId: string,
  prev: T[],
  next: T[]
): Promise<void> {
  const prevById = new Map(prev.map((i) => [i.id, i]));
  const nextById = new Map(next.map((i) => [i.id, i]));

  const changed = next.filter((i) => {
    const before = prevById.get(i.id);
    return !before || JSON.stringify(before) !== JSON.stringify(i);
  });
  const removed = prev.filter((i) => !nextById.has(i.id)).map((i) => i.id);

  if (changed.length) {
    const { error } = await supabase
      .from(col.table)
      .upsert(changed.map((i) => col.toRow(i, userId)) as never);
    if (error) throw error;
  }
  if (removed.length) {
    const { error } = await supabase
      .from(col.table)
      .delete()
      .eq('user_id', userId)
      .in('id', removed);
    if (error) throw error;
  }
}
