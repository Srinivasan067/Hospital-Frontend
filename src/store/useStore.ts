import { create } from 'zustand';
import { User, Medicine, CartItem, Notification, Order, UserPrescription } from '../types';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;

  medicines: Medicine[];
  setMedicines: (medicines: Medicine[]) => void;

  cart: CartItem[];
  addToCart: (medicine: Medicine) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;

  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  markNotificationsRead: () => void;

  orders: Order[];
  addOrder: (order: Order) => void;

  isDoctorApprovalPending: boolean;
  setDoctorApprovalPending: (status: boolean) => void;

  userPrescriptions: UserPrescription[];
  uploadPrescription: (name: string) => void;

  simulateDoctorApproval: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),

  medicines: [
    // Approved medicines
    { id: '1', name: 'Dolo 650', code: 'M-101', stock: 150, price: 30, category: 'Tablet', status: 'Approved' },
    { id: '2', name: 'Paracetamol 500mg', code: 'M-102', stock: 200, price: 20, category: 'Tablet', status: 'Approved' },
    { id: '4', name: 'Cetirizine 10mg', code: 'M-104', stock: 300, price: 40, category: 'Tablet', status: 'Approved' },
    { id: '5', name: 'Pantoprazole 40mg', code: 'M-105', stock: 80, price: 85, category: 'Tablet', status: 'Approved' },
    { id: '6', name: 'Metformin 500mg', code: 'M-106', stock: 120, price: 55, category: 'Tablet', status: 'Approved' },
    { id: '7', name: 'Aspirin 75mg', code: 'M-107', stock: 500, price: 15, category: 'Tablet', status: 'Approved' },
    { id: '8', name: 'Vitamin C 500mg', code: 'M-108', stock: 400, price: 60, category: 'Tablet', status: 'Approved' },
    { id: '9', name: 'Omeprazole 20mg', code: 'M-109', stock: 90, price: 70, category: 'Capsule', status: 'Approved' },
    { id: '10', name: 'Azithromycin 500mg', code: 'M-110', stock: 60, price: 180, category: 'Tablet', status: 'Approved' },
    { id: '11', name: 'Cough Syrup 100ml', code: 'M-111', stock: 70, price: 95, category: 'Syrup', status: 'Approved' },
    { id: '12', name: 'B-Complex Tablet', code: 'M-112', stock: 250, price: 45, category: 'Tablet', status: 'Approved' },
    { id: '13', name: 'Rantac 150mg', code: 'M-113', stock: 110, price: 35, category: 'Tablet', status: 'Approved' },
    { id: '14', name: 'Eye Drops 10ml', code: 'M-114', stock: 55, price: 130, category: 'Drops', status: 'Approved' },
    // Pending Approval
    { id: '3', name: 'Amoxicillin 500mg', code: 'M-103', stock: 50, price: 120, category: 'Capsule', status: 'Pending' },
    { id: '15', name: 'Ciprofloxacin 500mg', code: 'M-115', stock: 40, price: 220, category: 'Tablet', status: 'Pending' },
    { id: '16', name: 'Ibuprofen 400mg', code: 'M-116', stock: 130, price: 50, category: 'Tablet', status: 'Pending' },
    { id: '17', name: 'Prednisolone 5mg', code: 'M-117', stock: 30, price: 160, category: 'Tablet', status: 'Pending' },
    // Rejected (doctor declined — cannot be ordered)
    { id: '18', name: 'Codeine Phosphate', code: 'M-118', stock: 10, price: 380, category: 'Tablet', status: 'Pending' },
    { id: '19', name: 'Tramadol 50mg', code: 'M-119', stock: 5, price: 310, category: 'Capsule', status: 'Pending' },
    { id: '20', name: 'Diazepam 5mg', code: 'M-120', stock: 8, price: 270, category: 'Tablet', status: 'Pending' },
  ],
  setMedicines: (medicines) => set({ medicines }),

  cart: [],
  addToCart: (medicine) => set((state) => {
    const existing = state.cart.find(item => item.id === medicine.id);
    if (existing) {
      return { cart: state.cart.map(item => item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item) };
    }
    return { cart: [...state.cart, { ...medicine, quantity: 1 }] };
  }),
  removeFromCart: (id) => set((state) => ({ cart: state.cart.filter(item => item.id !== id) })),
  updateQuantity: (id, quantity) => set((state) => ({ cart: state.cart.map(item => item.id === id ? { ...item, quantity } : item) })),
  clearCart: () => set({ cart: [] }),

  notifications: [
    { id: 'n1', title: 'Welcome', message: 'Welcome to Bharathi Infinity Hospital Digital Pharmacy', date: new Date().toISOString(), read: false }
  ],
  addNotification: (notification) => set((state) => ({
    notifications: [{ ...notification, id: Math.random().toString(), date: new Date().toISOString(), read: false }, ...state.notifications]
  })),
  markNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),

  orders: [],
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),

  isDoctorApprovalPending: false,
  setDoctorApprovalPending: (status) => set({ isDoctorApprovalPending: status }),

  userPrescriptions: [
    { id: 'rx-1', name: 'Past_Prescription.jpg', status: 'Approved', date: new Date(Date.now() - 86400000).toISOString() },
    { id: 'rx-2', name: 'Rejected_Prescription.png', status: 'Rejected', date: new Date(Date.now() - 172800000).toISOString() },
  ],
  uploadPrescription: (name) => set((state) => {
    const newRx: UserPrescription = { id: 'rx-' + Date.now(), name, status: 'Under Review', date: new Date().toISOString() };
    return {
      userPrescriptions: [newRx, ...state.userPrescriptions],
      isDoctorApprovalPending: true
    };
  }),

  simulateDoctorApproval: () => {
    setTimeout(() => {
      set((state) => {
        // Capture pending medicines before status change
        const pendingMeds = state.medicines.filter(m => m.status === 'Pending');

        const newMeds = state.medicines.map(m =>
          m.status === 'Pending' ? { ...m, status: 'Approved' as const } : m
        );
        const newRx = state.userPrescriptions.map(rx =>
          rx.status === 'Under Review' ? { ...rx, status: 'Approved' as const } : rx
        );

        // Auto-add approved medicines to cart (avoid duplicates)
        const updatedCart = [...state.cart];
        pendingMeds.forEach(med => {
          const alreadyIn = updatedCart.some(c => c.id === med.id);
          if (!alreadyIn) {
            updatedCart.push({ ...med, status: 'Approved', quantity: 1 });
          } else {
            // Update status for items already in cart
            const idx = updatedCart.findIndex(c => c.id === med.id);
            updatedCart[idx] = { ...updatedCart[idx], status: 'Approved' };
          }
        });

        state.addNotification({
          title: '✅ Prescription Approved!',
          message: `Dr. Sarah Smith approved your prescription. ${pendingMeds.length} medicine(s) have been approved and added to your cart. You can now proceed to payment.`,
        });

        return {
          isDoctorApprovalPending: false,
          medicines: newMeds,
          userPrescriptions: newRx,
          cart: updatedCart,
        };
      });
    }, 5000);
  }
}));
