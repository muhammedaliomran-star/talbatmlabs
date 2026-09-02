import { useCallback, useEffect, useRef, useState } from 'react';
import type { Customer, Order, ReturnItem, Supplier } from '../types';
import {
  Collection,
  customersCollection,
  fetchCollection,
  ordersCollection,
  returnsCollection,
  suppliersCollection,
  syncCollection,
} from '../lib/cloudSync';

const LEGACY_KEY = 'daftar_app_state_v1';
const DEMO_IDS = {
  orders: new Set(['ord-101', 'ord-102', 'ord-103', 'ord-104', 'ord-105', 'ord-106', 'ord-107']),
  suppliers: new Set(['sup-1', 'sup-2', 'sup-3', 'sup-4']),
  customers: new Set(['cust-1', 'cust-2', 'cust-3', 'cust-4', 'cust-5']),
  returns: new Set(['ret-1', 'ret-2', 'ret-3']),
};

interface LegacyState {
  orders?: Order[];
  suppliers?: Supplier[];
  customers?: Customer[];
  returns?: ReturnItem[];
}

function readLegacy(): LegacyState | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    return raw ? (JSON.parse(raw) as LegacyState) : null;
  } catch {
    return null;
  }
}

/**
 * Keeps the app data in the real database so it is shared across devices.
 * Setters keep the same signature as React state setters; every change is
 * diffed against the last synced snapshot and pushed to the backend.
 */
export function useCloudData(userId?: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const ready = useRef(false);
  const snap = useRef({
    orders: [] as Order[],
    suppliers: [] as Supplier[],
    customers: [] as Customer[],
    returns: [] as ReturnItem[],
  });

  const load = useCallback(async (uid: string) => {
    ready.current = false;
    setLoading(true);
    try {
      const [cloudOrders, cloudSuppliers, cloudCustomers, cloudReturns] = await Promise.all([
        fetchCollection(ordersCollection, uid),
        fetchCollection(suppliersCollection, uid),
        fetchCollection(customersCollection, uid),
        fetchCollection(returnsCollection, uid),
      ]);

      const legacy = readLegacy();
      const shouldImportLegacy = !cloudOrders.length && !cloudSuppliers.length && !cloudCustomers.length && !cloudReturns.length && legacy;
      const o = shouldImportLegacy && legacy.orders?.length
        ? legacy.orders.filter((item) => !DEMO_IDS.orders.has(item.id))
        : cloudOrders;
      const s = shouldImportLegacy && legacy.suppliers?.length
        ? legacy.suppliers.filter((item) => !DEMO_IDS.suppliers.has(item.id))
        : cloudSuppliers;
      const c = shouldImportLegacy && legacy.customers?.length
        ? legacy.customers.filter((item) => !DEMO_IDS.customers.has(item.id))
        : cloudCustomers;
      const r = shouldImportLegacy && legacy.returns?.length
        ? legacy.returns.filter((item) => !DEMO_IDS.returns.has(item.id))
        : cloudReturns;

      if (shouldImportLegacy) {
        await Promise.all([
          syncCollection(customersCollection, uid, [], c),
          syncCollection(suppliersCollection, uid, [], s),
          syncCollection(ordersCollection, uid, [], o),
          syncCollection(returnsCollection, uid, [], r),
        ]);
        try {
          localStorage.removeItem(LEGACY_KEY);
        } catch {
          /* ignore */
        }
      }

      snap.current = { orders: o, suppliers: s, customers: c, returns: r };
      setOrders(o);
      setSuppliers(s);
      setCustomers(c);
      setReturns(r);
      setSyncError(null);
    } catch (e) {
      console.error('Cloud load failed', e);
      setSyncError('تعذر الاتصال بقاعدة البيانات');
    } finally {
      setLoading(false);
      ready.current = true;
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      ready.current = false;
      setLoading(false);
      return;
    }
    void load(userId);
  }, [userId, load]);

  // Refresh when the tab regains focus so other devices' changes appear.
  useEffect(() => {
    if (!userId) return;
    const onFocus = () => {
      if (ready.current) void load(userId);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [userId, load]);

  const push = useCallback(
    <T extends { id: string }>(col: Collection<T>, key: keyof typeof snap.current, next: T[]) => {
      if (!userId || !ready.current) return;
      const prev = snap.current[key] as unknown as T[];
      if (prev === next) return;
      (snap.current[key] as unknown as T[]) = next;
      syncCollection(col, userId, prev, next).catch((e) => {
        console.error('Cloud sync failed', e);
        setSyncError('تعذر حفظ التغييرات، جارٍ العمل محليًا');
      });
    },
    [userId]
  );

  useEffect(() => push(ordersCollection, 'orders', orders), [orders, push]);
  useEffect(() => push(suppliersCollection, 'suppliers', suppliers), [suppliers, push]);
  useEffect(() => push(customersCollection, 'customers', customers), [customers, push]);
  useEffect(() => push(returnsCollection, 'returns', returns), [returns, push]);

  return {
    orders,
    setOrders,
    suppliers,
    setSuppliers,
    customers,
    setCustomers,
    returns,
    setReturns,
    loading,
    syncError,
    reload: () => (userId ? load(userId) : Promise.resolve()),
  };
}
