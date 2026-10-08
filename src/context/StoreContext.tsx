import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, CartItem, CMSConfig, OrderStatus, PushNotification, CustomerUser } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CMS, INITIAL_USERS } from '../data/initialData';

interface StoreContextType {
  products: Product[];
  isProductsLoading: boolean;
  orders: Order[];
  cart: CartItem[];
  cms: CMSConfig;
  currentUser: CustomerUser | null;
  notifications: PushNotification[];
  customerLogin: (user: CustomerUser) => void;
  customerLogout: () => void;
  updateUserProfile: (user: CustomerUser) => void;
  saveCustomerAddress: (address: CustomerAddress) => void;
  deleteCustomerAddress: (index: number) => void;
  addToCart: (
    product: Product,
    quantity?: number,
    selectedColor?: string,
    selectedStorage?: string,
    selectedRam?: string,
    finalPrice?: number
  ) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  createOrder: (order: Order) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  approvePayment: (orderId: string) => Promise<void>;
  updateTracking: (orderId: string, courierName: string, trackingNumber: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  uploadOrderReceipt: (orderId: string, receiptImage: string, transactionReference: string) => Promise<void>;
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  clearAllProducts: () => Promise<void>;
  refetchProducts: () => Promise<void>;
  updateCMS: (newCMS: CMSConfig) => Promise<void>;
  dismissNotification: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Live Database Products (Starts empty - zero demo data)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('revox_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Purge legacy hardcoded demo products (rvx-prod-1 to rvx-prod-8)
          const hasLegacyDemo = parsed.some(
            (p: any) => p.id && typeof p.id === 'string' && /^rvx-prod-[1-8]$/.test(p.id)
          );
          if (!hasLegacyDemo) {
            return parsed;
          }
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(true);

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('revox_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('revox_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // CMS
  const [cms, setCms] = useState<CMSConfig>(() => {
    try {
      const saved = localStorage.getItem('revox_cms');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_CMS,
          ...parsed,
          tiktokUrl: parsed.tiktokUrl || INITIAL_CMS.tiktokUrl,
        };
      }
      return INITIAL_CMS;
    } catch {
      return INITIAL_CMS;
    }
  });

  // Customer Account Session (null by default - clean authentication state)
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('revox_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If it was the old hardcoded demo user, clear it so user starts cleanly
        if (parsed && parsed.id === 'usr-demo-1') {
          localStorage.removeItem('revox_current_user');
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [notifications, setNotifications] = useState<PushNotification[]>([]);

  // ==========================================
  // REAL-TIME DATABASE SYNCHRONIZATION ENGINE
  // ==========================================
  const fetchProducts = async (showLoading = false): Promise<void> => {
    if (showLoading) setIsProductsLoading(true);
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setProducts(json.data);
          try {
            localStorage.setItem('revox_products', JSON.stringify(json.data));
          } catch {}
        }
      }
    } catch (e) {
      console.warn('Real-time database fetch error:', e);
    } finally {
      setIsProductsLoading(false);
    }
  };

  const refetchProducts = async (): Promise<void> => {
    await fetchProducts(true);
  };

  useEffect(() => {
    // 1. Immediate Initial Fetch on page mount (Single Source of Truth: Live Database)
    fetchProducts(true);

    // 2. Real-Time Server-Sent Events (SSE) Stream
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const setupSSE = () => {
      try {
        eventSource = new EventSource('/api/sync-events');

        eventSource.onopen = () => {
          // Connected to live real-time sync stream
        };

        eventSource.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload && Array.isArray(payload.products)) {
              setProducts(payload.products);
              try {
                localStorage.setItem('revox_products', JSON.stringify(payload.products));
              } catch {}
              setIsProductsLoading(false);
            }
          } catch (err) {
            console.error('SSE payload parse error:', err);
          }
        };

        eventSource.addEventListener('products_updated', (event: any) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload && Array.isArray(payload.products)) {
              setProducts(payload.products);
              try {
                localStorage.setItem('revox_products', JSON.stringify(payload.products));
              } catch {}
              setIsProductsLoading(false);
            }
          } catch (err) {
            console.error('products_updated event parse error:', err);
          }
        });

        eventSource.addEventListener('init', (event: any) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload && Array.isArray(payload.products)) {
              setProducts(payload.products);
              try {
                localStorage.setItem('revox_products', JSON.stringify(payload.products));
              } catch {}
              setIsProductsLoading(false);
            }
          } catch (err) {
            console.error('init event parse error:', err);
          }
        });

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Exponential backoff reconnect
          reconnectTimeout = setTimeout(setupSSE, 3000);
        };
      } catch (err) {
        console.warn('SSE initialization failed:', err);
      }
    };

    setupSSE();

    // 3. Fallback Periodic Revalidation (Every 3.5s) to guarantee zero-cache sync across all devices & PWAs
    const pollInterval = setInterval(() => {
      fetchProducts(false);
    }, 3500);

    // 4. Auto-Revalidation on Tab Focus & Mobile Wake-up
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchProducts(false);
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      clearInterval(pollInterval);
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, []);

  // Persistent storage hooks
  useEffect(() => {
    try {
      localStorage.setItem('revox_products', JSON.stringify(products));
    } catch (e) {
      console.warn('Storage quota limit reached for products', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('revox_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('Storage quota limit reached for orders', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('revox_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Storage quota limit reached for cart', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('revox_cms', JSON.stringify(cms));
    } catch (e) {
      console.warn('Storage quota limit reached for cms', e);
    }
  }, [cms]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('revox_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('revox_current_user');
      }
    } catch {}
  }, [currentUser]);

  const customerLogin = (user: CustomerUser) => {
    setCurrentUser(user);
    addNotification(
      'ACCOUNT',
      'Welcome Back!',
      `Logged in as ${user.fullName} (${user.phone}). Your orders and addresses are synced.`,
      'processing'
    );
  };

  const customerLogout = () => {
    setCurrentUser(null);
  };

  const updateUserProfile = (updatedUser: CustomerUser) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('revox_current_user', JSON.stringify(updatedUser));
      const savedUsersStr = localStorage.getItem('revox_customer_users');
      if (savedUsersStr) {
        const users: CustomerUser[] = JSON.parse(savedUsersStr);
        const idx = users.findIndex((u) => u.id === updatedUser.id);
        if (idx > -1) {
          users[idx] = updatedUser;
        } else {
          users.push(updatedUser);
        }
        localStorage.setItem('revox_customer_users', JSON.stringify(users));
      }
    } catch {}
  };

  const saveCustomerAddress = (address: CustomerAddress) => {
    if (!currentUser) return;
    const existing = currentUser.savedAddresses || (currentUser.savedAddress ? [currentUser.savedAddress] : []);
    const updatedAddresses = [address, ...existing.filter((a) => !(a.street === address.street && a.district === address.district))];
    const updatedUser: CustomerUser = {
      ...currentUser,
      savedAddress: address,
      savedAddresses: updatedAddresses,
    };
    updateUserProfile(updatedUser);
  };

  const deleteCustomerAddress = (index: number) => {
    if (!currentUser) return;
    const existing = currentUser.savedAddresses || (currentUser.savedAddress ? [currentUser.savedAddress] : []);
    const filtered = existing.filter((_, i) => i !== index);
    const updatedUser: CustomerUser = {
      ...currentUser,
      savedAddress: filtered[0] || undefined,
      savedAddresses: filtered,
    };
    updateUserProfile(updatedUser);
  };

  const addNotification = (orderId: string, title: string, message: string, status: OrderStatus) => {
    const notif: PushNotification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      orderId,
      title,
      message,
      status,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev.slice(0, 4)]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Cart
  const addToCart = (
    product: Product,
    quantity = 1,
    selectedColor?: string,
    selectedStorage?: string,
    selectedRam?: string,
    finalPrice?: number
  ) => {
    const priceToUse = finalPrice || product.price;
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedStorage === selectedStorage &&
          item.selectedRam === selectedRam
      );

      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += quantity;
        return copy;
      } else {
        return [
          ...prev,
          {
            product,
            quantity,
            selectedColor,
            selectedStorage,
            selectedRam,
            unitPrice: priceToUse,
          },
        ];
      }
    });
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], quantity };
      return copy;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Orders
  const createOrder = async (order: Order): Promise<Order> => {
    setOrders((prev) => [order, ...prev]);
    clearCart();

    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      }).catch(() => {});
    } catch {}

    addNotification(
      order.id,
      'Order Placed (Awaiting Verification)',
      'Your payment transfer receipt has been submitted for admin verification. Free delivery applied.',
      order.status
    );

    return order;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, status };
          if (status === 'shipped') {
            updated.shippedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
          }
          return updated;
        }
        return o;
      })
    );

    try {
      fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).catch(() => {});
    } catch {}

    addNotification(orderId, 'Order Update', `Your order ${orderId} is now ${status.replace(/_/g, ' ')}.`, status);
  };

  const approvePayment = async (orderId: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const checkpoints = o.checkpoints ? [...o.checkpoints] : [];
          if (checkpoints.length > 1) {
            checkpoints[1].completed = true;
            checkpoints[1].timestamp = timestamp;
            checkpoints[1].description = 'Payment confirmed and approved by store admin.';
          }
          return {
            ...o,
            status: 'processing',
            paymentApprovedAt: timestamp,
            checkpoints,
          };
        }
        return o;
      })
    );

    try {
      fetch(`/api/orders/${orderId}/approve-payment`, {
        method: 'PATCH',
      }).catch(() => {});
    } catch {}

    addNotification(
      orderId,
      'Payment Approved!',
      `Your advance payment for Order ${orderId} has been verified. Order is now Processing / Packed!`,
      'processing'
    );
  };

  const updateTracking = async (orderId: string, courierName: string, trackingNumber: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const checkpoints = o.checkpoints ? [...o.checkpoints] : [];
          if (checkpoints.length > 2) {
            checkpoints[2].completed = true;
            checkpoints[2].timestamp = timestamp;
            checkpoints[2].description = `Assigned to ${courierName} with tracking code ${trackingNumber}.`;
          }
          return {
            ...o,
            courierName,
            trackingNumber,
            status: 'shipped',
            shippedAt: timestamp,
            checkpoints,
          };
        }
        return o;
      })
    );

    try {
      fetch(`/api/orders/${orderId}/tracking`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courierName, trackingNumber }),
      }).catch(() => {});
    } catch {}

    addNotification(
      orderId,
      'Tracking Number Assigned',
      `Order ${orderId} dispatched with ${courierName}. Tracking: ${trackingNumber}`,
      'shipped'
    );
  };

  // NEW: Delete specific order handler
  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch {}
  };

  const uploadOrderReceipt = async (
    orderId: string,
    receiptImage: string,
    transactionReference: string
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            paymentReceiptImage: receiptImage,
            transactionReference: transactionReference || o.transactionReference,
          };
        }
        return o;
      })
    );

    try {
      fetch(`/api/orders/${orderId}/upload-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptImage, transactionReference }),
      }).catch(() => {});
    } catch {}

    addNotification(
      orderId,
      'Receipt Slip Updated',
      `Payment proof for Order ${orderId} updated. Store admin notified for verification.`,
      'pending_payment_approval'
    );
  };

  // Product CRUD (Persistent Live Database & Real-Time Sync)
  const saveProduct = async (product: Product): Promise<void> => {
    // 1. Optimistic Local Update
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = product;
        return copy;
      }
      return [product, ...prev];
    });

    // 2. Persist to live backend database (PUT handles both create and update via upsert)
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProducts((prev) => {
          const idx = prev.findIndex((p) => p.id === data.data.id);
          if (idx > -1) {
            const copy = [...prev];
            copy[idx] = data.data;
            return copy;
          }
          return [data.data, ...prev];
        });
      }
    } catch (err) {
      console.error('Failed to save product to persistent database:', err);
    }
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    // 1. Optimistic Local Update
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    // 2. Persist Deletion to live backend database
    try {
      await fetch(`/api/products/${encodeURIComponent(productId)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete product from database:', err);
    }
  };

  const clearAllProducts = async (): Promise<void> => {
    setProducts([]);
    try {
      await fetch('/api/products', {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to clear products from database:', err);
    }
  };

  const updateCMS = async (newCMS: CMSConfig) => {
    setCms(newCMS);
    try {
      fetch('/api/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCMS),
      }).catch(() => {});
    } catch {}
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        isProductsLoading,
        orders,
        cart,
        cms,
        currentUser,
        notifications,
        customerLogin,
        customerLogout,
        updateUserProfile,
        saveCustomerAddress,
        deleteCustomerAddress,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        createOrder,
        updateOrderStatus,
        approvePayment,
        updateTracking,
        deleteOrder,
        uploadOrderReceipt,
        saveProduct,
        deleteProduct,
        clearAllProducts,
        refetchProducts,
        updateCMS,
        dismissNotification,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
