import { useCallback, useEffect, useRef, useState } from 'react';
import type { Customer, Order, ReturnItem, ShoppingTrip, Supplier } from '../types';
import {
  Collection,
  customersCollection,
  fetchCollection,
  ordersCollection,
  returnsCollection,
  suppliersCollection,
  syncCollection,
  tripsCollection,
} from '../lib/cloudSync';
import {
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_RETURNS,
  INITIAL_SUPPLIERS,
  INITIAL_TRIPS,
} from '../data/initialData';

const LEGACY_KEY = 'daftar_app_state_v1';

interface LegacyState {
  orders?: Order[];
  suppliers?: Supplier[];
  customers?: Customer[];
  returns?: ReturnItem[];
  trips?: ShoppingTrip[];
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
  const [trips, setTrips] = useState<ShoppingTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const ready = useRef(false);
  const snap = useRef({
    orders: [] as Order[],
    suppliers: [] as Supplier[],
    customers: [] as Customer[],
    returns: [] as ReturnItem[],
    trips: [] as ShoppingTrip[],
  });

  const load = useCallback(async (uid: string) => {
    ready.current = false;
    setLoading(true);
    try {
      let [o, s, c, r, t] = await Promise.all([
        fetchCollection(ordersCollection, uid),
        fetchCollection(suppliersCollection, uid),
        fetchCollection(customersCollection, uid),
        fetchCollection(returnsCollection, uid),
        fetchCollection(tripsCollection, uid),
      ]);

      const empty = !o.length && !s.length && !c.length && !r.length && !t.length;
      if (empty) {
        const legacy = readLegacy();
        o = legacy?.orders?.length ? legacy.orders : INITIAL_ORDERS;
        s = legacy?.suppliers?.length ? legacy.suppliers : INITIAL_SUPPLIERS;
        c = legacy?.customers?.length ? legacy.customers : INITIAL_CUSTOMERS;
        r = legacy?.returns?.length ? legacy.returns : INITIAL_RETURNS;
        t = legacy?.trips?.length ? legacy.trips : INITIAL_TRIPS;

        await syncCollection(customersCollection, uid, [], c);
        await syncCollection(suppliersCollection, uid, [], s);
        await syncCollection(ordersCollection, uid, [], o);
        await syncCollection(returnsCollection, uid, [], r);
        await syncCollection(tripsCollection, uid, [], t);
        try {
          localStorage.removeItem(LEGACY_KEY);
        } catch {
          /* ignore */
        }
      }

      snap.current = { orders: o, suppliers: s, customers: c, returns: r, trips: t };
      setOrders(o);
      setSuppliers(s);
      setCustomers(c);
      setReturns(r);
      setTrips(t);
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
  useEffect(() => push(tripsCollection, 'trips', trips), [trips, push]);

  return {
    orders,
    setOrders,
    suppliers,
    setSuppliers,
    customers,
    setCustomers,
    returns,
    setReturns,
    trips,
    setTrips,
    loading,
    syncError,
    reload: () => (userId ? load(userId) : Promise.resolve()),
  };
}
