
export interface User {
  id: string;
  name: string;
  pin: string;
}

export interface Product {
  id: string;
  name: string;
  salePrice: number;
  purchasePrice: number;
  quantity: number;
}

export interface Sale {
  id: string;
  date: string;
  customerName: string;
  address: string;
  phone: string;
  productId: string;
  productName: string;
  quantity: number;
  amount: number;
  isPaid: boolean;
}

export interface Purchase {
  id: string;
  date: string;
  supplierName: string;
  address: string;
  phone: string;
  productId: string;
  productName: string;
  quantity: number;
  amount: number;
  isPaid: boolean;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
}

export interface TeamTask {
  id: string;
  task: string;
  isCompleted: boolean;
}

export interface AppState {
  businessBalance: number;
  earnings: number;
  savingGoal: number;
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  tasks: TeamTask[];
}
