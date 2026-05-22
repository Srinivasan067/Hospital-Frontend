export type MedicineStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Medicine {
  id: string;
  name: string;
  code: string;
  stock: number;
  price: number;
  category: string;
  status: MedicineStatus;
}

export interface CartItem extends Medicine {
  quantity: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  paymentStatus: 'Success' | 'Failed';
  approvalStatus: 'Approved';
}

export interface UserPrescription {
  id: string;
  name: string;
  status: 'Under Review' | 'Approved' | 'Rejected';
  date: string;
}

export interface User {
  name: string;
  mobile: string;
  mrn: string;
  doctor: string;
  location?: string;
}
