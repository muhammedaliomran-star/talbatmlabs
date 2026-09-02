import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MobileNavigation } from './components/MobileNavigation';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { SuppliersView } from './components/SuppliersView';
import { ReturnsView } from './components/ReturnsView';
import { OrderModal } from './components/OrderModal';
import { SupplierModal } from './components/SupplierModal';
import { ReturnModal } from './components/ReturnModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { BackupModal } from './components/BackupModal';
import { AuthPortal } from './components/AuthPortal';
import { useAuthUser } from './hooks/useAuthUser';
import { useCloudData } from './hooks/useCloudData';
import { UserProfileModal } from './components/UserProfileModal';
import {
  ActiveTab,
  AppData,
  Customer,
  Order,
  ReturnItem,
  ReturnStatus,
  Supplier,
  User,
} from './types';

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

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppOrder, setWhatsAppOrder] = useState<Order | null>(null);

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Counts for Badges
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const returnsCount = returns.filter((r) => r.status === 'pending_supplier').length;

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

  const restoreOrders = (removed: Order[]) => {
    setOrders((prev) => {
      const ids = new Set(prev.map((o) => o.id));
      const merged = [...prev, ...removed.filter((o) => !ids.has(o.id))];
      return merged.sort((a, b) => (b.orderDate || '').localeCompare(a.orderDate || ''));
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    const removed = orders.filter((o) => o.id === orderId);
    if (!removed.length) return;
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    toast('تم حذف الطلب', {
      description: `طلب #${removed[0].orderNumber} — ${removed[0].customerName}`,
      action: { label: 'تراجع', onClick: () => restoreOrders(removed) },
    });
  };

  const handleBulkDeleteOrders = (orderIds: string[]) => {
    const ids = new Set(orderIds);
    const removed = orders.filter((o) => ids.has(o.id));
    if (!removed.length) return;
    setOrders((prev) => prev.filter((o) => !ids.has(o.id)));
    toast(`تم حذف ${removed.length} طلب`, {
      description: 'يمكنك التراجع خلال ثوانٍ',
      action: { label: 'تراجع', onClick: () => restoreOrders(removed) },
    });
  };

  const handleBulkSetStatus = (orderIds: string[], status: 'pending' | 'done') => {
    const ids = new Set(orderIds);
    const before = orders.filter((o) => ids.has(o.id));
    if (!before.length) return;
    setOrders((prev) => prev.map((o) => (ids.has(o.id) ? { ...o, status } : o)));
    toast(
      status === 'done'
        ? `تم تعليم ${before.length} طلب كمنفّذ`
        : `تمت إعادة ${before.length} طلب كمعلّق`,
      {
        action: {
          label: 'تراجع',
          onClick: () =>
            setOrders((prev) =>
              prev.map((o) => {
                const original = before.find((b) => b.id === o.id);
                return original ? { ...o, status: original.status } : o;
              })
            ),
        },
      }
    );
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

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-line border-t-brass animate-spin" />
        <p className="text-sm text-copy-muted">جارٍ تحميل دفترك من قاعدة البيانات…</p>
      </div>
    );
  }

  return (
    <div className="grain-overlay min-h-screen bg-paper text-charcoal flex flex-col antialiased">
      {syncError && (
        <div className="bg-late-soft text-late text-center text-xs font-semibold py-2 px-4">
          {syncError}
        </div>
      )}
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewOrder={() => handleOpenNewOrder()}
        onOpenNewSupplier={handleOpenNewSupplier}
        onOpenNewReturn={handleOpenNewReturn}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        pendingCount={pendingCount}
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
            setActiveTab={setActiveTab}
            onOpenNewOrder={() => handleOpenNewOrder()}
            onOpenNewSupplier={handleOpenNewSupplier}
            onOpenNewReturn={handleOpenNewReturn}
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

        {activeTab === 'suppliers' && (
          <SuppliersView
            suppliers={suppliers}
            orders={orders}
            returns={returns}
            onOpenNewSupplier={handleOpenNewSupplier}
            onEditSupplier={handleEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
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
        returnsCount={returnsCount}
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

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        appData={{ orders, suppliers, customers, returns }}
        onRestoreData={handleRestoreData}
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
