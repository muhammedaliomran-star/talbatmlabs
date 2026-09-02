import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MobileNavigation } from './components/MobileNavigation';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { SuppliersView } from './components/SuppliersView';
import { ReturnsView } from './components/ReturnsView';
import { TripsView } from './components/TripsView';
import { OrderModal } from './components/OrderModal';
import { SupplierModal } from './components/SupplierModal';
import { ReturnModal } from './components/ReturnModal';
import { TripModal } from './components/TripModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { BackupModal } from './components/BackupModal';
import { TripPrintModal } from './components/TripPrintModal';
import { AuthPortal } from './components/AuthPortal';
import { useAuthUser } from './hooks/useAuthUser';
import { UserProfileModal } from './components/UserProfileModal';
import {
  ActiveTab,
  AppData,
  Customer,
  Order,
  ReturnItem,
  ReturnStatus,
  Supplier,
  ShoppingTrip,
  TripItemCheck,
  TripItemStatus,
  TripStatus,
  User,
} from './types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_RETURNS,
  INITIAL_SUPPLIERS,
  INITIAL_TRIPS,
} from './data/initialData';
import { isOrderLate } from './utils/helpers';

export default function App() {
  // Auth (real accounts via Lovable Cloud)
  const { user: currentUser, loading: authLoading, updateProfile, signOut } = useAuthUser();

  // Real shared data (synced across devices)
  const {
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
    loading: dataLoading,
    syncError,
  } = useCloudData(currentUser?.id);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = () => {
    void signOut();
  };

  const handleUpdateUser = (updatedUser: User) => {
    void updateProfile(updatedUser);
  };

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Navigation targets
  const [targetCustomerName, setTargetCustomerName] = useState<string | null>(null);
  const [targetSupplierId, setTargetSupplierId] = useState<string | null>(null);

  // Modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [modalInitialCustomerId, setModalInitialCustomerId] = useState<string | undefined>();
  const [modalInitialSupplierId, setModalInitialSupplierId] = useState<string | undefined>();

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [editingReturn, setEditingReturn] = useState<ReturnItem | null>(null);

  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<ShoppingTrip | null>(null);

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppOrder, setWhatsAppOrder] = useState<Order | null>(null);

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isTripPrintModalOpen, setIsTripPrintModalOpen] = useState(false);
  const [tripPrintSupplier, setTripPrintSupplier] = useState<Supplier | undefined>();

  // Counts for Badges
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const lateCount = orders.filter((o) => isOrderLate(o)).length;
  const returnsCount = returns.filter((r) => r.status === 'pending_supplier').length;
  const activeTripsCount = trips.filter((t) => t.status === 'in_progress' || t.status === 'planned').length;

  // Handlers for Orders
  const handleOpenNewOrder = (prefill?: { customerId?: string; supplierId?: string }) => {
    setEditingOrder(null);
    setModalInitialCustomerId(prefill?.customerId);
    setModalInitialSupplierId(prefill?.supplierId);
    setIsOrderModalOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setModalInitialCustomerId(undefined);
    setModalInitialSupplierId(undefined);
    setIsOrderModalOpen(true);
  };

  const handleSaveOrder = (orderData: Partial<Order>) => {
    if (editingOrder) {
      // Update existing order
      setOrders((prev) =>
        prev.map((o) =>
          o.id === editingOrder.id
            ? ({
                ...o,
                ...orderData,
              } as Order)
            : o
        )
      );

      // Also ensure customer directory has latest name/phone
      if (orderData.customerName) {
        const found = customers.find(
          (c) => c.name.trim().toLowerCase() === orderData.customerName!.trim().toLowerCase()
        );
        if (found && orderData.customerPhone && orderData.customerPhone.trim() !== found.phone) {
          setCustomers((prev) =>
            prev.map((c) =>
              c.id === found.id ? { ...c, phone: orderData.customerPhone?.trim() } : c
            )
          );
        } else if (!found) {
          setCustomers((prev) => [
            ...prev,
            {
              id: `cust-${Date.now()}`,
              name: orderData.customerName!.trim(),
              phone: orderData.customerPhone?.trim(),
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      }
    } else {
      // Create new order
      // Ensure customer is registered in customers list for autocomplete
      const existingCustomer = customers.find(
        (c) => c.name.trim().toLowerCase() === (orderData.customerName || '').trim().toLowerCase()
      );
      let custId = existingCustomer ? existingCustomer.id : `cust-${Date.now()}`;
      if (existingCustomer) {
        if (orderData.customerPhone && orderData.customerPhone.trim() !== existingCustomer.phone) {
          setCustomers((prev) =>
            prev.map((c) =>
              c.id === existingCustomer.id
                ? { ...c, phone: orderData.customerPhone?.trim() }
                : c
            )
          );
        }
      } else if (orderData.customerName) {
        const newCust: Customer = {
          id: custId,
          name: orderData.customerName.trim(),
          phone: orderData.customerPhone?.trim(),
          createdAt: new Date().toISOString(),
        };
        setCustomers((prev) => [...prev, newCust]);
      }

      // Generate highest order number + 1
      const maxNumber = orders.reduce((max, o) => Math.max(max, o.orderNumber || 0), 100);
      const newOrderNumber = maxNumber + 1;

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: newOrderNumber,
        customerId: custId,
        customerName: orderData.customerName || 'عميل',
        customerPhone: orderData.customerPhone,
        supplierId: orderData.supplierId || '',
        supplierName: orderData.supplierName || 'مورد عام',
        description: orderData.description || '',
        price: orderData.price,
        deposit: orderData.deposit,
        orderDate: orderData.orderDate || new Date().toISOString().split('T')[0],
        travelDate: orderData.travelDate || new Date().toISOString().split('T')[0],
        status: orderData.status || 'pending',
        notes: orderData.notes,
        createdAt: new Date().toISOString(),
      };

      setOrders((prev) => [newOrder, ...prev]);
    }
  };

  const handleToggleOrderStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: o.status === 'done' ? 'pending' : 'done',
          };
        }
        return o;
      })
    );
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الطلب من السجل؟')) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  };

  // Handlers for Suppliers
  const handleOpenNewSupplier = () => {
    setEditingSupplier(null);
    setIsSupplierModalOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = (supplierData: Partial<Supplier>) => {
    if (editingSupplier) {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === editingSupplier.id ? ({ ...s, ...supplierData } as Supplier) : s))
      );
      // Also update supplierName in orders if changed
      if (supplierData.name && supplierData.name !== editingSupplier.name) {
        setOrders((prev) =>
          prev.map((o) =>
            o.supplierId === editingSupplier.id ? { ...o, supplierName: supplierData.name! } : o
          )
        );
      }
    } else {
      const newSupplier: Supplier = {
        id: `sup-${Date.now()}`,
        name: supplierData.name || 'مورد جديد',
        address: supplierData.address,
        phone: supplierData.phone,
        notes: supplierData.notes,
        createdAt: new Date().toISOString(),
      };
      setSuppliers((prev) => [...prev, newSupplier]);
    }
  };

  const handleQuickAddSupplier = (supplierName: string): Supplier => {
    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      name: supplierName,
      createdAt: new Date().toISOString(),
    };
    setSuppliers((prev) => [...prev, newSupplier]);
    return newSupplier;
  };

  const handleDeleteSupplier = (supplierId: string) => {
    const attachedOrders = orders.filter((o) => o.supplierId === supplierId);
    if (attachedOrders.length > 0) {
      if (
        !confirm(
          `هذا المورد مرتبط بـ ${attachedOrders.length} طلبات مسجلة. هل أنت متأكد من حذفه؟`
        )
      ) {
        return;
      }
    } else {
      if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) return;
    }
    setSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
  };

  // Handlers for Returns
  const handleOpenNewReturn = () => {
    setEditingReturn(null);
    setIsReturnModalOpen(true);
  };

  const handleEditReturn = (ret: ReturnItem) => {
    setEditingReturn(ret);
    setIsReturnModalOpen(true);
  };

  const handleSaveReturn = (returnData: Partial<ReturnItem>) => {
    if (editingReturn) {
      setReturns((prev) =>
        prev.map((r) => (r.id === editingReturn.id ? ({ ...r, ...returnData } as ReturnItem) : r))
      );
    } else {
      const newReturn: ReturnItem = {
        id: `ret-${Date.now()}`,
        productName: returnData.productName || 'صنف مرتجع',
        price: returnData.price || 0,
        supplierId: returnData.supplierId || '',
        supplierName: returnData.supplierName || 'مورد عام',
        orderId: returnData.orderId,
        customerName: returnData.customerName,
        reason: returnData.reason,
        returnDate: returnData.returnDate || new Date().toISOString().split('T')[0],
        status: returnData.status || 'pending_supplier',
        createdAt: new Date().toISOString(),
      };
      setReturns((prev) => [newReturn, ...prev]);
    }
  };

  const handleDeleteReturn = (retId: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا المرتجع؟')) {
      setReturns((prev) => prev.filter((r) => r.id !== retId));
    }
  };

  const handleUpdateReturnStatus = (retId: string, newStatus: ReturnStatus) => {
    setReturns((prev) =>
      prev.map((r) => (r.id === retId ? { ...r, status: newStatus } : r))
    );
  };

  // Trip sheet modal
  const handleOpenTripPrint = (supplier?: Supplier) => {
    setTripPrintSupplier(supplier);
    setIsTripPrintModalOpen(true);
  };

  // Handlers for Shopping Trips
  const handleOpenNewTrip = () => {
    setEditingTrip(null);
    setIsTripModalOpen(true);
  };

  const handleEditTrip = (trip: ShoppingTrip) => {
    setEditingTrip(trip);
    setIsTripModalOpen(true);
  };

  const handleSaveTrip = (tripData: Partial<ShoppingTrip>) => {
    if (editingTrip) {
      setTrips((prev) =>
        prev.map((t) => (t.id === editingTrip.id ? ({ ...t, ...tripData } as ShoppingTrip) : t))
      );
    } else {
      const newTrip: ShoppingTrip = {
        id: `trip-${Date.now()}`,
        title: tripData.title || 'رحلة تسوق وشراء',
        date: tripData.date || new Date().toISOString().split('T')[0],
        destination: tripData.destination || 'سوق الموسكي',
        status: tripData.status || 'planned',
        items: tripData.items || [],
        notes: tripData.notes,
        createdAt: new Date().toISOString(),
      };
      setTrips((prev) => [newTrip, ...prev]);
    }
  };

  const handleDeleteTrip = (tripId: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف رحلة الشراء هذه؟')) {
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    }
  };

  const handleUpdateTripItemStatus = (
    tripId: string,
    orderId: string,
    itemStatus: TripItemStatus
  ) => {
    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id !== tripId) return trip;
        const existingItems = trip.items || [];
        const index = existingItems.findIndex((c) => c.orderId === orderId);
        let updatedItems: TripItemCheck[];
        if (index >= 0) {
          updatedItems = existingItems.map((c, i) =>
            i === index ? { ...c, status: itemStatus } : c
          );
        } else {
          updatedItems = [
            ...existingItems,
            { orderId, status: itemStatus },
          ];
        }
        return { ...trip, items: updatedItems };
      })
    );

    // If item marked bought, mark order as done
    if (itemStatus === 'bought') {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'done' } : o))
      );
    }
  };

  const handleUpdateTripStatus = (tripId: string, status: TripStatus) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status } : t))
    );
  };

  // WhatsApp template modal trigger
  const handleOpenWhatsAppForOrder = (order: Order) => {
    setWhatsAppOrder(order);
    setIsWhatsAppModalOpen(true);
  };

  // Cross-entity navigation: Clicking a customer anywhere filters Orders by that customer
  const handleSelectCustomer = (customerName: string) => {
    setTargetCustomerName(customerName);
    setActiveTab('orders');
  };

  const handleSelectSupplier = (supplierId: string) => {
    setTargetSupplierId(supplierId);
    setActiveTab('suppliers');
  };

  // Restore and reset data
  const handleRestoreData = (data: AppData) => {
    if (data.orders) setOrders(data.orders);
    if (data.suppliers) setSuppliers(data.suppliers);
    if (data.customers) setCustomers(data.customers);
    if (data.returns) setReturns(data.returns);
    if (data.trips) setTrips(data.trips);
  };

  const handleResetDemoData = () => {
    setOrders(INITIAL_ORDERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setCustomers(INITIAL_CUSTOMERS);
    setReturns(INITIAL_RETURNS);
    setTrips(INITIAL_TRIPS);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Real authentication gate
  if (authLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-line border-t-brass animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPortal />;
  }

  return (
    <div className="grain-overlay min-h-screen bg-paper text-charcoal flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewOrder={() => handleOpenNewOrder()}
        onOpenNewSupplier={handleOpenNewSupplier}
        onOpenNewReturn={handleOpenNewReturn}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        pendingCount={pendingCount}
        lateCount={lateCount}
        tripsCount={activeTripsCount}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLockScreen={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            orders={orders}
            suppliers={suppliers}
            customers={customers}
            returns={returns}
            trips={trips}
            setActiveTab={setActiveTab}
            onOpenNewOrder={() => handleOpenNewOrder()}
            onOpenNewSupplier={handleOpenNewSupplier}
            onOpenNewReturn={handleOpenNewReturn}
            onOpenNewTrip={handleOpenNewTrip}
            onOpenTripPrint={handleOpenTripPrint}
            onToggleOrderStatus={handleToggleOrderStatus}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
            onSelectCustomer={handleSelectCustomer}
            onSelectSupplier={handleSelectSupplier}
            onOpenWhatsApp={handleOpenWhatsAppForOrder}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            orders={orders}
            suppliers={suppliers}
            onOpenNewOrder={() => handleOpenNewOrder()}
            onToggleStatus={handleToggleOrderStatus}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
            onSelectCustomer={handleSelectCustomer}
            onSelectSupplier={handleSelectSupplier}
            onOpenWhatsApp={handleOpenWhatsAppForOrder}
            initialSearchTerm={targetCustomerName || ''}
          />
        )}

        {activeTab === 'trips' && (
          <TripsView
            trips={trips}
            orders={orders}
            onOpenNewTrip={handleOpenNewTrip}
            onEditTrip={handleEditTrip}
            onDeleteTrip={handleDeleteTrip}
            onUpdateTripItemStatus={handleUpdateTripItemStatus}
            onUpdateTripStatus={handleUpdateTripStatus}
            onOpenWhatsApp={handleOpenWhatsAppForOrder}
          />
        )}

        {activeTab === 'suppliers' && (
          <SuppliersView
            suppliers={suppliers}
            orders={orders}
            returns={returns}
            onOpenNewSupplier={handleOpenNewSupplier}
            onEditSupplier={handleEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
            onOpenTripPrint={handleOpenTripPrint}
            onToggleOrderStatus={handleToggleOrderStatus}
            selectedSupplierId={targetSupplierId}
          />
        )}

        {activeTab === 'returns' && (
          <ReturnsView
            returns={returns}
            suppliers={suppliers}
            onOpenNewReturn={handleOpenNewReturn}
            onEditReturn={handleEditReturn}
            onDeleteReturn={handleDeleteReturn}
            onUpdateReturnStatus={handleUpdateReturnStatus}
          />
        )}
      </main>

      {/* Mobile Bottom Fixed Navigation */}
      <MobileNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        lateCount={lateCount}
        returnsCount={returnsCount}
        tripsCount={activeTripsCount}
      />

      {/* Modals */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSave={handleSaveOrder}
        initialOrder={editingOrder}
        customers={customers}
        suppliers={suppliers}
        onQuickAddSupplier={handleQuickAddSupplier}
        initialCustomerId={modalInitialCustomerId}
        initialSupplierId={modalInitialSupplierId}
      />

      <TripModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        onSave={handleSaveTrip}
        initialTrip={editingTrip}
        pendingOrders={orders}
      />

      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        order={whatsAppOrder}
      />

      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSave={handleSaveSupplier}
        initialSupplier={editingSupplier}
      />

      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onSave={handleSaveReturn}
        initialReturn={editingReturn}
        suppliers={suppliers}
        orders={orders}
      />

      <TripPrintModal
        isOpen={isTripPrintModalOpen}
        onClose={() => setIsTripPrintModalOpen(false)}
        supplier={tripPrintSupplier}
        suppliers={suppliers}
        orders={orders}
        returns={returns}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        appData={{ orders, suppliers, customers, returns, trips }}
        onRestoreData={handleRestoreData}
        onResetDemoData={handleResetDemoData}
      />

      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          onLockScreen={handleLogout}
        />
      )}
    </div>
  );
}
