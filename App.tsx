
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FIXED_USERS, GOAL_LIMIT } from './constants';
import { Product, Sale, Purchase, User, Expense } from './types';

declare var html2canvas: any;

const Card: React.FC<{ title: string; value: string | number; color?: string; icon?: string; children?: React.ReactNode }> = ({ title, value, color = "bg-white", icon, children }) => (
  <div className={`${color} p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center min-h-[140px] transition-transform hover:scale-[1.02]`}>
    <div className="flex items-center justify-between mb-1">
      <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{title}</h3>
      {icon && <i className={`${icon} text-gray-300 text-sm`}></i>}
    </div>
    <div className="flex flex-col justify-center">
      <p className="text-2xl font-black text-gray-800 leading-none">{value}</p>
      {children && <div className="mt-2">{children}</div>}
    </div>
  </div>
);

const Calculator: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleInput = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
      setEquation('');
      return;
    }
    if (val === 'DEL') {
      setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
      return;
    }
    if (val === '=') {
      try {
        const result = eval(display.replace('×', '*').replace('÷', '/'));
        setEquation(display + ' =');
        setDisplay(String(result));
      } catch {
        setDisplay('Error');
      }
      return;
    }
    if (display === '0' || display === 'Error') {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  };

  const buttons = ['C', '÷', '×', 'DEL', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '%', '0', '.', '=', ''];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-[320px] overflow-hidden border border-gray-200">
        <div className="p-6 bg-gray-900 text-right">
          <div className="flex justify-between items-center mb-2">
            <span className="text-red-500 font-black text-[10px] uppercase tracking-widest">Business Calc</span>
            <button onClick={onClose} className="text-gray-500 hover:text-white"><i className="fas fa-times"></i></button>
          </div>
          <div className="h-4 text-gray-500 text-xs font-bold mb-1">{equation}</div>
          <div className="text-4xl font-black text-white truncate">{display}</div>
        </div>
        <div className="grid grid-cols-4 gap-1 p-2 bg-gray-100">
          {buttons.map((btn, i) => btn ? (
            <button key={i} onClick={() => handleInput(btn)} className={`h-16 rounded-2xl font-black text-lg transition-all active:scale-90 ${['÷', '×', '-', '+', '=', 'DEL', 'C'].includes(btn) ? (btn === '=' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-gray-200 text-red-600') : 'bg-white text-gray-800'}`}>
              {btn}
            </button>
          ) : <div key={i} />)}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  const [businessBalance, setBusinessBalance] = useState(5000);
  const [earnings, setEarnings] = useState(0);
  const [savingGoalProgress, setSavingGoalProgress] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [showProductModal, setShowProductModal] = useState<Product | 'new' | null>(null);
  const [showSaleModal, setShowSaleModal] = useState<Sale | 'new' | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState<Purchase | 'new' | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState<Expense | 'new' | null>(null);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showAddToGoalModal, setShowAddToGoalModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [openInventoryMenuId, setOpenInventoryMenuId] = useState<string | null>(null);
  const [openSalesMenuId, setOpenSalesMenuId] = useState<string | null>(null);
  const [openPurchaseMenuId, setOpenPurchaseMenuId] = useState<string | null>(null);
  const [openExpenseMenuId, setOpenExpenseMenuId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{ type: 'sale' | 'purchase', item: Sale | Purchase } | null>(null);

  const invoiceRef = useRef<HTMLDivElement>(null);

  const [tempQty, setTempQty] = useState<number>(0);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const [saleSearch, setSaleSearch] = useState('');
  const [purchaseSearch, setPurchaseSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('biz_state_final_v1');
    const savedUser = localStorage.getItem('biz_user');
    
    if (saved) {
      const parsed = JSON.parse(saved);
      setBusinessBalance(parsed.businessBalance ?? 5000);
      setEarnings(parsed.earnings ?? 0);
      setSavingGoalProgress(parsed.savingGoalProgress ?? 0);
      setProducts(parsed.products ?? []);
      setSales(parsed.sales ?? []);
      setPurchases(parsed.purchases ?? []);
      setExpenses(parsed.expenses ?? []);
    }

    if (savedUser && savedUser !== 'null') {
      try {
        const u = JSON.parse(savedUser);
        if (u && u.pin) setCurrentUser(u);
      } catch (e) {
        localStorage.removeItem('biz_user');
      }
    }
  }, []);

  useEffect(() => {
    const state = { businessBalance, earnings, savingGoalProgress, products, sales, purchases, expenses };
    localStorage.setItem('biz_state_final_v1', JSON.stringify(state));
  }, [businessBalance, earnings, savingGoalProgress, products, sales, purchases, expenses]);

  const totalReceivable = useMemo(() => sales.filter(s => !s.isPaid).reduce((acc, curr) => acc + curr.amount, 0), [sales]);
  const totalPayable = useMemo(() => purchases.filter(p => !p.isPaid).reduce((acc, curr) => acc + curr.amount, 0), [purchases]);
  const totalOrdersCount = useMemo(() => sales.length, [sales]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = FIXED_USERS.find(u => u.pin === pinInput);
    if (user) {
      localStorage.setItem('biz_user', JSON.stringify(user));
      setCurrentUser(user);
      setLoginError('');
      setPinInput('');
    } else {
      setLoginError('Invalid PIN code.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('biz_user');
    setCurrentUser(null);
    setPinInput('');
    setIsSideMenuOpen(false);
    setShowCalculator(false);
  };

  const updateStock = (productId: string, delta: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p));
  };

  const handleSaleAction = (s: Partial<Sale>) => {
    if (showSaleModal === 'new') {
      const product = products.find(p => p.id === s.productId);
      const newSale: Sale = {
        id: Date.now().toString(),
        date: s.date || new Date().toISOString().split('T')[0],
        customerName: s.customerName || '',
        address: s.address || '',
        phone: s.phone || '',
        productId: s.productId || '',
        productName: product?.name || 'Deleted Product',
        quantity: Number(s.quantity) || 0,
        amount: Number(s.amount) || 0,
        isPaid: !!s.isPaid
      };
      setSales([newSale, ...sales]);
      if (newSale.isPaid) setBusinessBalance(prev => prev + newSale.amount);
      if (newSale.productId) updateStock(newSale.productId, -newSale.quantity);
    } else if (typeof showSaleModal === 'object' && showSaleModal !== null) {
      const old = showSaleModal;
      if (old.isPaid) setBusinessBalance(prev => prev - old.amount);
      if (old.productId) updateStock(old.productId, old.quantity);
      
      const product = products.find(p => p.id === s.productId);
      const updated: Sale = { ...old, ...s, amount: Number(s.amount), quantity: Number(s.quantity), productName: product?.name || old.productName };
      setSales(prev => prev.map(item => item.id === old.id ? updated : item));
      if (updated.isPaid) setBusinessBalance(prev => prev + updated.amount);
      if (updated.productId) updateStock(updated.productId, -updated.quantity);
    }
    setShowSaleModal(null);
  };

  const handlePurchaseAction = (p: Partial<Purchase>) => {
    if (showPurchaseModal === 'new') {
      const product = products.find(prod => prod.id === p.productId);
      const newPurchase: Purchase = {
        id: Date.now().toString(),
        date: p.date || new Date().toISOString().split('T')[0],
        supplierName: p.supplierName || '',
        address: p.address || '',
        phone: p.phone || '',
        productId: p.productId || '',
        productName: product?.name || 'Deleted Product',
        quantity: Number(p.quantity) || 0,
        amount: Number(p.amount) || 0,
        isPaid: !!p.isPaid
      };
      setPurchases([newPurchase, ...purchases]);
      if (newPurchase.isPaid) setBusinessBalance(prev => prev - newPurchase.amount);
      if (newPurchase.productId) updateStock(newPurchase.productId, newPurchase.quantity);
    } else if (typeof showPurchaseModal === 'object' && showPurchaseModal !== null) {
      const old = showPurchaseModal;
      if (old.isPaid) setBusinessBalance(prev => prev + old.amount);
      if (old.productId) updateStock(old.productId, -old.quantity);

      const product = products.find(prod => prod.id === p.productId);
      const updated: Purchase = { ...old, ...p, amount: Number(p.amount), quantity: Number(p.quantity), productName: product?.name || old.productName };
      setPurchases(prev => prev.map(item => item.id === old.id ? updated : item));
      if (updated.isPaid) setBusinessBalance(prev => prev - updated.amount);
      if (updated.productId) updateStock(updated.productId, updated.quantity);
    }
    setShowPurchaseModal(null);
  };

  const handleExpenseAction = (e: Partial<Expense>) => {
    if (showExpenseModal === 'new') {
      const newExp: Expense = {
        id: Date.now().toString(),
        date: e.date || new Date().toISOString().split('T')[0],
        description: e.description || '',
        amount: Number(e.amount) || 0,
      };
      setExpenses([newExp, ...expenses]);
      setBusinessBalance(prev => prev - newExp.amount);
    } else if (typeof showExpenseModal === 'object' && showExpenseModal !== null) {
      const old = showExpenseModal;
      setBusinessBalance(prev => prev + old.amount); // Refund old amount
      const updated: Expense = { ...old, ...e, amount: Number(e.amount) };
      setExpenses(prev => prev.map(item => item.id === old.id ? updated : item));
      setBusinessBalance(prev => prev - updated.amount); // Deduct new amount
    }
    setShowExpenseModal(null);
  };

  const handleDownloadImage = () => {
    if (invoiceRef.current) {
      html2canvas(invoiceRef.current, { scale: 3 }).then((canvas: any) => {
        const link = document.createElement('a');
        link.download = `Invoice_${previewData?.item.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const getTeamRole = (id: string) => {
    switch (id) {
      case '1': return { role: 'Operations Head', task: 'Daily Orders & Approval' };
      case '2': return { role: 'Marketing Head', task: 'Ads & Stock Approval' };
      case '3': return { role: 'Logistics Head', task: 'Shipping & Stock Mgmt' };
      case '4': return { role: 'Chief Accountant', task: 'Billings & Tax' };
      case '5': return { role: 'Lead Investor', task: 'Finance Oversight' };
      default: return { role: 'Member', task: 'General Task' };
    }
  };

  const progressPercent = Math.round((savingGoalProgress / GOAL_LIMIT) * 100);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24 text-left font-sans">
      <header className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-40 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3"><i className="fas fa-rocket text-white text-xl"></i></div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">BizLedger <span className="text-red-600">Pro</span></h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{currentUser?.name || 'Secure System'}</p>
          </div>
        </div>
        
        {currentUser && (
          <button 
            onClick={() => setIsSideMenuOpen(true)} 
            className="w-12 h-12 flex flex-col items-center justify-center gap-1.5 hover:bg-gray-100 rounded-xl transition-all active:scale-90"
          >
            <span className="w-8 h-1 bg-gray-900 rounded-full"></span>
            <span className="w-8 h-1 bg-gray-900 rounded-full"></span>
            <span className="w-8 h-1 bg-gray-900 rounded-full"></span>
          </button>
        )}
      </header>

      {/* Profile Sidebar */}
      {isSideMenuOpen && currentUser && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-in fade-in" onClick={() => setIsSideMenuOpen(false)}></div>
          <div className="fixed top-0 right-0 h-full w-[80%] max-w-[320px] bg-white z-[110] shadow-2xl p-8 flex flex-col animate-in slide-in-from-right duration-300">
            <button onClick={() => setIsSideMenuOpen(false)} className="self-end text-gray-400 hover:text-gray-900 p-2"><i className="fas fa-times text-2xl"></i></button>
            
            <div className="flex flex-col items-center mt-8 mb-8">
              <div className="w-28 h-28 bg-red-600 rounded-full flex items-center justify-center border-4 border-red-50 shadow-xl overflow-hidden mb-4">
                <i className="fas fa-user text-white text-6xl"></i>
              </div>
              <h2 className="text-2xl font-black text-gray-900 text-center">{currentUser.name}</h2>
              <p className="text-xs font-black text-red-600 uppercase tracking-widest mt-2 bg-red-50 px-4 py-1.5 rounded-full text-center">
                {getTeamRole(currentUser.id).role}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-600 text-white font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-red-100 active:scale-95"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </div>

            <div className="mt-auto pt-8 border-t border-gray-100 w-full text-center">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Business Management System</p>
            </div>
          </div>
        </>
      )}

      {!currentUser ? (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-md border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <div className="w-24 h-24 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transform -rotate-6"><i className="fas fa-shield-alt text-white text-4xl"></i></div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Welcome Back</h1>
              <p className="text-gray-400 mt-2 font-medium tracking-wide">Enter 6-digit Business PIN to unlock</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <input type="password" className="w-full px-6 py-5 rounded-2xl border-2 border-gray-100 focus:border-red-500 focus:outline-none text-center text-3xl tracking-[0.5em] transition-all bg-gray-50 font-bold" placeholder="••••••" value={pinInput} onChange={(e) => setPinInput(e.target.value)} maxLength={6} autoFocus required />
              {loginError && <p className="text-red-500 text-sm mt-3 font-bold text-center">{loginError}</p>}
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-200 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest">Login to Ledger</button>
            </form>
          </div>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl transform rotate-3">
                <i className="fas fa-shopping-bag text-white text-2xl"></i>
              </div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">BIGBASKET</h2>
            </div>
            <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.5em]">Inventory & Ledger Pro</p>
          </div>

          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 scale-100 transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                   <i className="fas fa-bullseye text-red-600 text-2xl"></i>
                </div>
                <div>
                   <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Savings Goal</h3>
                   <p className="text-[10px] font-bold text-gray-400">₹{savingGoalProgress.toLocaleString()} / ₹{GOAL_LIMIT.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-red-600">{progressPercent}%</span>
              </div>
            </div>
            <div className="relative w-full bg-gray-100 h-10 rounded-3xl overflow-hidden shadow-inner border border-gray-200 p-1 flex items-center justify-center">
              <div 
                className="absolute top-1 left-1 bottom-1 bg-gradient-to-r from-red-500 to-red-700 transition-all duration-1000 ease-out rounded-3xl" 
                style={{ width: `calc(${Math.min(100, progressPercent)}% - 8px)` }}
              ></div>
              <span className="relative z-10 text-[11px] font-black text-gray-800 uppercase tracking-widest mix-blend-difference">
                {progressPercent}% / 100%
              </span>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="Business Balance" value={`₹${businessBalance.toLocaleString()}`} icon="fas fa-university" color="bg-white border-b-4 border-red-600" />
            <Card title="Total Earnings" value={`₹${earnings.toLocaleString()}`} icon="fas fa-coins" color="bg-white border-b-4 border-green-500">
               <button onClick={() => setShowAddMoneyModal(true)} className="text-[9px] font-black text-green-600 hover:text-green-700 uppercase flex items-center gap-1"><i className="fas fa-plus-circle"></i> Withdraw Profit</button>
            </Card>
            <Card title="Saving Goal Progress" value={`₹${savingGoalProgress.toLocaleString()}`} icon="fas fa-bullseye" color="bg-white border-b-4 border-blue-500">
              <button onClick={() => setShowAddToGoalModal(true)} className="text-[9px] font-black text-blue-600 hover:text-blue-700 uppercase flex items-center gap-1 mt-1"><i className="fas fa-plus-circle"></i> Save Money</button>
            </Card>
            <Card title="Receivable" value={`₹${totalReceivable.toLocaleString()}`} icon="fas fa-hand-holding-usd" color="bg-white border-b-4 border-orange-400" />
            <Card title="Payable" value={`₹${totalPayable.toLocaleString()}`} icon="fas fa-arrow-up" color="bg-white border-b-4 border-red-400" />
            <Card title="Sales Count" value={`${totalOrdersCount}`} icon="fas fa-box-open" color="bg-white border-b-4 border-purple-500" />
          </section>

          {/* Inventory Table */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">Inventory</h3>
                <div className="relative w-64">
                  <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                  <input type="text" placeholder="Search products..." className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none font-bold" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
                </div>
              </div>
              <button onClick={() => setShowProductModal('new')} className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow-lg hover:bg-red-700 flex items-center gap-2 transition-all active:scale-95"><i className="fas fa-plus"></i> New Product</button>
            </div>
            <div className="overflow-x-visible">
              <table className="w-full text-left">
                <thead className="text-[10px] uppercase text-gray-400 font-black border-b border-gray-50">
                  <tr><th className="px-8 py-5">Item Name</th><th className="px-8 py-5">Sale Price</th><th className="px-8 py-5">Cost Price</th><th className="px-8 py-5">Stock</th><th className="px-8 py-5 text-center">Menu</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-5 font-bold text-gray-800 text-xl">{p.name}</td>
                      <td className="px-8 py-5 text-gray-500 font-black">₹{p.salePrice.toLocaleString()}</td>
                      <td className="px-8 py-5 text-gray-500 font-black">₹{p.purchasePrice.toLocaleString()}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${p.quantity < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{p.quantity} Units</span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="relative inline-block text-left">
                          <button onClick={(e) => { e.stopPropagation(); setOpenInventoryMenuId(openInventoryMenuId === p.id ? null : p.id); }} className="text-gray-300 hover:text-gray-900 p-2 focus:outline-none"><i className="fas fa-ellipsis-v text-xl"></i></button>
                          {openInventoryMenuId === p.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenInventoryMenuId(null)}></div>
                              <div className="absolute right-0 mt-2 w-40 bg-white shadow-2xl rounded-2xl border border-gray-100 z-[100] overflow-hidden text-left animate-in fade-in zoom-in duration-150 ring-4 ring-black/5">
                                <button onClick={() => { setShowProductModal(p); setOpenInventoryMenuId(null); }} className="w-full px-5 py-4 text-xs font-black uppercase hover:bg-gray-50 flex items-center gap-3 transition-colors text-gray-700"><i className="fas fa-edit text-blue-500"></i> Edit Item</button>
                                <button onClick={() => { if(confirm("Permanently delete this item? (Sales history will remain safe)")) { setProducts(products.filter(item => item.id !== p.id)); setSales(prev => prev.map(s => s.productId === p.id ? { ...s, productId: "" } : s)); } setOpenInventoryMenuId(null); }} className="w-full px-5 py-4 text-xs font-black uppercase hover:bg-red-50 text-red-600 border-t border-gray-50 flex items-center gap-3 transition-colors"><i className="fas fa-trash"></i> Delete Item</button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Sales History */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
              <h3 className="font-black text-gray-900 text-sm uppercase">Customer Sales (Bills)</h3>
              <div className="flex gap-4">
                <div className="relative">
                  <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                  <input type="text" placeholder="Search bills..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none font-bold" value={saleSearch} onChange={(e) => setSaleSearch(e.target.value)} />
                </div>
                <button onClick={() => { setTempQty(0); setTempPrice(0); setShowSaleModal('new'); }} className="bg-red-600 text-white px-5 py-2 rounded-lg font-black text-[10px] uppercase shadow-md flex items-center gap-2 transition-all active:scale-95">
                  <i className="fas fa-plus"></i> Add Sale
                </button>
              </div>
            </div>
            <div className="max-h-[500px] overflow-y-auto overflow-x-visible">
              <table className="w-full text-left">
                <thead className="bg-gray-50 font-black text-gray-400 uppercase text-[10px] sticky top-0 z-10 shadow-sm">
                  <tr><th className="p-4">Customer Info</th><th className="p-4">Product Details</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4 text-center">Menu</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sales.filter(s => s.customerName.toLowerCase().includes(saleSearch.toLowerCase()) || s.productName.toLowerCase().includes(saleSearch.toLowerCase())).map((s, idx) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-black text-base text-gray-900">{s.customerName}</div>
                        <div className="text-[11px] font-bold text-gray-500">{s.phone}</div>
                        <div className="text-[10px] font-medium text-gray-400">{s.address}</div>
                        <div className="text-[9px] font-black text-red-400 uppercase tracking-widest mt-1">Bill #{idx + 1} | {s.date}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-black text-sm text-gray-700">{s.productName}</div>
                        <div className="text-[9px] font-black text-red-500 uppercase tracking-widest">Qty: {s.quantity} PCS</div>
                        <div className="text-[9px] text-gray-400 font-bold">₹{(s.amount/s.quantity).toLocaleString()} / Unit</div>
                      </td>
                      <td className="p-4 font-black text-xl tracking-tighter text-gray-900">₹{s.amount.toLocaleString()}</td>
                      <td className="p-4"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${s.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.isPaid ? 'Paid' : 'Pending'}</span></td>
                      <td className="p-4 text-center">
                        <div className="relative inline-block text-left">
                          <button onClick={(e) => { e.stopPropagation(); setOpenSalesMenuId(openSalesMenuId === s.id ? null : s.id); }} className="text-gray-300 hover:text-gray-900 p-2"><i className="fas fa-ellipsis-v text-lg"></i></button>
                          {openSalesMenuId === s.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenSalesMenuId(null)}></div>
                              <div className="absolute right-0 mt-2 w-40 bg-white shadow-2xl rounded-2xl border border-gray-100 z-[100] overflow-hidden text-left animate-in fade-in zoom-in duration-150 ring-4 ring-black/5">
                                <button onClick={() => { setPreviewData({ type: 'sale', item: s }); setOpenSalesMenuId(null); }} className="w-full px-5 py-3 text-[10px] font-black uppercase hover:bg-gray-50 flex items-center gap-3 transition-colors text-gray-700"><i className="fas fa-eye text-green-500"></i> Preview Bill</button>
                                <button onClick={() => { setTempQty(s.quantity); setTempPrice(s.amount/s.quantity); setShowSaleModal(s); setOpenSalesMenuId(null); }} className="w-full px-5 py-3 text-[10px] font-black uppercase hover:bg-gray-50 flex items-center gap-3 transition-colors text-gray-700 border-t border-gray-50"><i className="fas fa-edit text-blue-500"></i> Edit Bill</button>
                                <button onClick={() => { if(confirm("Delete this bill record?")) { setSales(sales.filter(i => i.id !== s.id)); if(s.isPaid) setBusinessBalance(prev => prev - s.amount); if(s.productId) updateStock(s.productId, s.quantity); } setOpenSalesMenuId(null); }} className="w-full px-5 py-3 text-[10px] font-black uppercase hover:bg-red-50 text-red-600 border-t border-gray-50 flex items-center gap-3 transition-colors"><i className="fas fa-trash"></i> Delete Bill</button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Purchase History */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
              <h3 className="font-black text-gray-900 text-sm uppercase">Supplier Purchases</h3>
              <div className="flex gap-4">
                <div className="relative">
                  <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                  <input type="text" placeholder="Search purchases..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none font-bold" value={purchaseSearch} onChange={(e) => setPurchaseSearch(e.target.value)} />
                </div>
                <button onClick={() => { setTempQty(0); setTempPrice(0); setShowPurchaseModal('new'); }} className="bg-red-600 text-white px-5 py-2 rounded-lg font-black text-[10px] uppercase shadow-md flex items-center gap-2 transition-all active:scale-95">
                  <i className="fas fa-plus"></i> Add Purchase
                </button>
              </div>
            </div>
            <div className="max-h-[500px] overflow-y-auto overflow-x-visible">
              <table className="w-full text-left">
                <thead className="bg-gray-50 font-black text-gray-400 uppercase text-[10px] sticky top-0 z-10 shadow-sm">
                  <tr><th className="p-4">Supplier Info</th><th className="p-4">Entry Details</th><th className="p-4">Total Bill</th><th className="p-4">Status</th><th className="p-4 text-center">Menu</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {purchases.filter(p => p.supplierName.toLowerCase().includes(purchaseSearch.toLowerCase()) || p.productName.toLowerCase().includes(purchaseSearch.toLowerCase())).map((p, idx) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-black text-base text-gray-900">{p.supplierName}</div>
                        <div className="text-[11px] font-bold text-gray-500">{p.phone}</div>
                        <div className="text-[10px] font-medium text-gray-400">{p.address}</div>
                        <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1">Purchase #{idx + 1} | {p.date}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-black text-sm text-gray-700">{p.productName}</div>
                        <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Qty: {p.quantity} PCS</div>
                        <div className="text-[9px] text-gray-400 font-bold">₹{(p.amount/p.quantity).toLocaleString()} / Unit</div>
                      </td>
                      <td className="p-4 font-black text-xl tracking-tighter text-gray-900">₹{p.amount.toLocaleString()}</td>
                      <td className="p-4"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${p.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.isPaid ? 'Paid' : 'Unpaid'}</span></td>
                      <td className="p-4 text-center">
                        <div className="relative inline-block text-left">
                          <button onClick={(e) => { e.stopPropagation(); setOpenPurchaseMenuId(openPurchaseMenuId === p.id ? null : p.id); }} className="text-gray-300 hover:text-gray-900 p-2"><i className="fas fa-ellipsis-v text-lg"></i></button>
                          {openPurchaseMenuId === p.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenPurchaseMenuId(null)}></div>
                              <div className="absolute right-0 mt-2 w-40 bg-white shadow-2xl rounded-2xl border border-gray-100 z-[100] overflow-hidden text-left animate-in fade-in zoom-in duration-150 ring-4 ring-black/5">
                                <button onClick={() => { setPreviewData({ type: 'purchase', item: p }); setOpenPurchaseMenuId(null); }} className="w-full px-5 py-3 text-[10px] font-black uppercase hover:bg-gray-50 flex items-center gap-3 transition-colors text-gray-700"><i className="fas fa-eye text-green-500"></i> Preview Bill</button>
                                <button onClick={() => { setTempQty(p.quantity); setTempPrice(p.amount/p.quantity); setShowPurchaseModal(p); setOpenPurchaseMenuId(null); }} className="w-full px-5 py-3 text-[10px] font-black uppercase hover:bg-gray-50 flex items-center gap-3 transition-colors text-gray-700 border-t border-gray-50"><i className="fas fa-edit text-blue-500"></i> Edit Entry</button>
                                <button onClick={() => { if(confirm("Delete purchase entry?")) { setPurchases(purchases.filter(i => i.id !== p.id)); if(p.isPaid) setBusinessBalance(prev => prev + p.amount); if(p.productId) updateStock(p.productId, -p.quantity); } setOpenPurchaseMenuId(null); }} className="w-full px-5 py-3 text-[10px] font-black uppercase hover:bg-red-50 text-red-600 border-t border-gray-50 flex items-center gap-3 transition-colors"><i className="fas fa-trash"></i> Delete Entry</button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Expenses History */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
              <h3 className="font-black text-gray-900 text-sm uppercase">Business Expenses</h3>
              <div className="flex gap-4">
                <div className="relative">
                  <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                  <input type="text" placeholder="Search expenses..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none font-bold" value={expenseSearch} onChange={(e) => setExpenseSearch(e.target.value)} />
                </div>
                <button onClick={() => setShowExpenseModal('new')} className="bg-red-600 text-white px-5 py-2 rounded-lg font-black text-[10px] uppercase shadow-md flex items-center gap-2 transition-all active:scale-95">
                  <i className="fas fa-plus"></i> Add Expense
                </button>
              </div>
            </div>
            <div className="max-h-[500px] overflow-y-auto overflow-x-visible">
              <table className="w-full text-left">
                <thead className="bg-gray-50 font-black text-gray-400 uppercase text-[10px] sticky top-0 z-10 shadow-sm">
                  <tr><th className="p-4">Expense Details</th><th className="p-4">Date</th><th className="p-4">Amount</th><th className="p-4 text-center">Menu</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {expenses.filter(e => e.description.toLowerCase().includes(expenseSearch.toLowerCase())).map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-black text-base text-gray-900">{e.description}</div>
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-500">{e.date}</td>
                      <td className="p-4 font-black text-xl tracking-tighter text-red-600">₹{e.amount.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <div className="relative inline-block text-left">
                          <button onClick={(event) => { event.stopPropagation(); setOpenExpenseMenuId(openExpenseMenuId === e.id ? null : e.id); }} className="text-gray-300 hover:text-gray-900 p-2"><i className="fas fa-ellipsis-v text-lg"></i></button>
                          {openExpenseMenuId === e.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenExpenseMenuId(null)}></div>
                              <div className="absolute right-0 mt-2 w-40 bg-white shadow-2xl rounded-2xl border border-gray-100 z-[100] overflow-hidden text-left animate-in fade-in zoom-in duration-150 ring-4 ring-black/5">
                                <button onClick={() => { setShowExpenseModal(e); setOpenExpenseMenuId(null); }} className="w-full px-5 py-3 text-[10px] font-black uppercase hover:bg-gray-50 flex items-center gap-3 transition-colors text-gray-700"><i className="fas fa-edit text-blue-500"></i> Edit Expense</button>
                                <button onClick={() => { if(confirm("Delete this expense entry?")) { setExpenses(expenses.filter(item => item.id !== e.id)); setBusinessBalance(prev => prev + e.amount); } setOpenExpenseMenuId(null); }} className="w-full px-5 py-3 text-[10px] font-black uppercase hover:bg-red-50 text-red-600 border-t border-gray-50 flex items-center gap-3 transition-colors"><i className="fas fa-trash"></i> Delete Expense</button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Detailed Team Roles Section */}
          <section className="space-y-6">
            <h3 className="font-black text-gray-900 text-xl uppercase tracking-widest border-b-2 border-red-100 pb-2">Business Team Organization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FIXED_USERS.map(user => {
                const info = getTeamRole(user.id);
                return (
                  <div key={user.id} className="bg-gray-200 p-6 rounded-3xl border border-gray-300 group hover:border-red-500 transition-all shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-red-600 text-3xl shadow-md group-hover:rotate-6 transition-all">
                        <i className={`fas ${user.id === '1' ? 'fa-user-tie' : user.id === '2' ? 'fa-ad' : user.id === '3' ? 'fa-truck-fast' : user.id === '4' ? 'fa-calculator' : 'fa-hand-holding-dollar'}`}></i>
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-lg leading-tight">{user.name}</h4>
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mt-1">{info.role}</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl space-y-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase">Primary Responsibility</label>
                        <p className="text-xs font-bold text-gray-800">{info.task}</p>
                      </div>
                      <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                        <span className="text-[8px] font-black text-gray-400 uppercase">Authorization Status</span>
                        <span className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* New Footer Section */}
          <footer className="pt-12 pb-6 text-center border-t border-gray-100">
            <p className="text-xs font-black text-gray-300 uppercase tracking-[0.3em]">MADE BY NYRON UNITED</p>
          </footer>
        </main>
      )}

      {/* Modals and Overlays */}
      {showSaleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest text-red-600">Sale Billing</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bill No: #{sales.length + 1}</p>
              </div>
              <button onClick={() => setShowSaleModal(null)} className="text-gray-400 hover:text-gray-900"><i className="fas fa-times text-xl"></i></button>
            </div>
            
            <form onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handleSaleAction({
                customerName: fd.get('name') as string,
                address: fd.get('address') as string,
                phone: fd.get('phone') as string,
                productId: fd.get('prod') as string,
                quantity: tempQty,
                amount: tempQty * tempPrice,
                date: fd.get('date') as string,
                isPaid: fd.get('paid') === 'on'
              });
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Date</label>
                <input type="date" name="date" required defaultValue={typeof showSaleModal === 'object' ? showSaleModal.date : new Date().toISOString().split('T')[0]} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Customer Name</label>
                <input name="name" required placeholder="Full Name" defaultValue={typeof showSaleModal === 'object' ? showSaleModal.customerName : ''} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Address</label>
                <input name="address" placeholder="Customer Address" defaultValue={typeof showSaleModal === 'object' ? showSaleModal.address : ''} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Phone Number</label>
                <input name="phone" placeholder="Contact No." defaultValue={typeof showSaleModal === 'object' ? showSaleModal.phone : ''} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Select Product</label>
                <select name="prod" required defaultValue={typeof showSaleModal === 'object' ? showSaleModal.productId : ''} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold">
                  <option value="">Select Stock Item</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Quantity (Piece)</label>
                    <input type="number" required value={tempQty || ''} onChange={e => setTempQty(Number(e.target.value))} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold" placeholder="0" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Price Per Piece</label>
                    <input type="number" required value={tempPrice || ''} onChange={e => setTempPrice(Number(e.target.value))} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold" placeholder="₹ 0" />
                 </div>
              </div>
              <div className="bg-red-50 p-6 rounded-3xl text-center border border-red-100">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Total Bill Amount</p>
                <p className="font-black text-4xl tracking-tighter text-red-600">₹{(tempQty * tempPrice).toLocaleString()}</p>
              </div>
              <label className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl cursor-pointer">
                <input type="checkbox" name="paid" defaultChecked={typeof showSaleModal === 'object' ? showSaleModal.isPaid : false} className="w-5 h-5 accent-green-600" />
                <span className="text-xs font-black uppercase text-green-700">Payment Received</span>
              </label>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowSaleModal(null)} className="flex-1 font-black text-gray-400 uppercase py-4">Cancel</button>
                <button type="submit" className="flex-[2] bg-red-600 py-4 rounded-2xl text-white font-black uppercase shadow-lg shadow-red-200">Confirm Bill</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest text-red-600">Purchase Entry</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bill No: #{purchases.length + 1}</p>
              </div>
              <button onClick={() => setShowPurchaseModal(null)} className="text-gray-400 hover:text-gray-900"><i className="fas fa-times text-xl"></i></button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handlePurchaseAction({
                supplierName: fd.get('name') as string,
                address: fd.get('address') as string,
                phone: fd.get('phone') as string,
                productId: fd.get('prod') as string,
                quantity: tempQty,
                amount: tempQty * tempPrice,
                date: fd.get('date') as string,
                isPaid: fd.get('paid') === 'on'
              });
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Date</label>
                <input type="date" name="date" required defaultValue={typeof showPurchaseModal === 'object' ? showPurchaseModal.date : new Date().toISOString().split('T')[0]} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Supplier Name</label>
                <input name="name" required placeholder="Supplier Full Name" defaultValue={typeof showPurchaseModal === 'object' ? showPurchaseModal.supplierName : ''} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Supplier Address</label>
                <input name="address" placeholder="Address Details" defaultValue={typeof showPurchaseModal === 'object' ? showPurchaseModal.address : ''} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Supplier Contact</label>
                <input name="phone" placeholder="Contact Number" defaultValue={typeof showPurchaseModal === 'object' ? showPurchaseModal.phone : ''} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Link to Stock Item</label>
                <select name="prod" required defaultValue={typeof showPurchaseModal === 'object' ? showPurchaseModal.productId : ''} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold">
                  <option value="">Select Item to Restock</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Quantity (Piece)</label>
                    <input type="number" required value={tempQty || ''} onChange={e => setTempQty(Number(e.target.value))} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold" placeholder="0" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Price Per Piece (Cost)</label>
                    <input type="number" required value={tempPrice || ''} onChange={e => setTempPrice(Number(e.target.value))} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold" placeholder="₹ 0" />
                 </div>
              </div>
              <div className="bg-blue-50 p-6 rounded-3xl text-center border border-blue-100">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Bill Cost</p>
                <p className="font-black text-4xl tracking-tighter text-blue-600">₹{(tempQty * tempPrice).toLocaleString()}</p>
              </div>
              <label className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl cursor-pointer">
                <input type="checkbox" name="paid" defaultChecked={typeof showPurchaseModal === 'object' ? showPurchaseModal.isPaid : false} className="w-5 h-5 accent-green-600" />
                <span className="text-xs font-black uppercase text-green-700">Payment Completed</span>
              </label>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowPurchaseModal(null)} className="flex-1 font-black text-gray-400 uppercase py-4">Cancel</button>
                <button type="submit" className="flex-[2] bg-red-600 py-4 rounded-2xl text-white font-black uppercase shadow-lg shadow-red-200">Confirm Purchase</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-xl font-black mb-6 uppercase tracking-widest text-center text-red-600">
              {showExpenseModal === 'new' ? 'Add New Expense' : 'Edit Expense'}
            </h2>
            <form onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              handleExpenseAction({
                description: fd.get('desc') as string,
                amount: Number(fd.get('amt')),
                date: fd.get('date') as string,
              });
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Date</label>
                <input type="date" name="date" required defaultValue={typeof showExpenseModal === 'object' ? showExpenseModal.date : new Date().toISOString().split('T')[0]} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Description</label>
                <input name="desc" required placeholder="E.g., Electricity, Rent, Ads" defaultValue={typeof showExpenseModal === 'object' ? showExpenseModal.description : ''} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Amount (₹)</label>
                <input name="amt" type="number" required placeholder="0" defaultValue={typeof showExpenseModal === 'object' ? showExpenseModal.amount : ''} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowExpenseModal(null)} className="flex-1 font-black text-gray-400 uppercase">Cancel</button>
                <button type="submit" className="flex-[2] bg-red-600 py-4 rounded-2xl text-white font-black uppercase shadow-lg shadow-red-100 transition-all hover:bg-red-700">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-4 bg-gray-900 flex justify-between items-center">
              <span className="text-xs font-black text-white uppercase tracking-widest">Document Preview</span>
              <button onClick={() => setPreviewData(null)} className="text-gray-400 hover:text-white"><i className="fas fa-times text-xl"></i></button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <div ref={invoiceRef} className="bg-white p-12 border-4 border-gray-900 font-serif text-gray-900">
                <div className="flex justify-between items-start border-b-4 border-gray-900 pb-8 mb-8">
                  <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 italic">BizLedger Pro</h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Professional Business Solution</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-5xl font-black uppercase tracking-tighter opacity-10 leading-none">INVOICE</h2>
                    <p className="text-sm font-black mt-2">Date: {previewData.item.date}</p>
                    <p className="text-sm font-black">ID: #{previewData.item.id.slice(-6)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-12 mb-12">
                  <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Billed To:</h3>
                    <p className="text-2xl font-black uppercase tracking-tight mb-1">
                      {previewData.type === 'sale' ? (previewData.item as Sale).customerName : (previewData.item as Purchase).supplierName}
                    </p>
                    <p className="text-sm font-bold text-gray-600">{previewData.item.address}</p>
                    <p className="text-sm font-bold text-gray-600">{previewData.item.phone}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Order Status:</h3>
                    <span className={`inline-block px-4 py-1 text-xs font-black uppercase border-2 ${previewData.item.isPaid ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'}`}>
                      {previewData.item.isPaid ? 'Payment Confirmed' : 'Payment Outstanding'}
                    </span>
                  </div>
                </div>
                <table className="w-full border-collapse mb-12">
                  <thead className="border-b-2 border-gray-900">
                    <tr>
                      <th className="py-4 text-left font-black uppercase text-xs">Description</th>
                      <th className="py-4 text-center font-black uppercase text-xs">Qty</th>
                      <th className="py-4 text-right font-black uppercase text-xs">Unit Rate</th>
                      <th className="py-4 text-right font-black uppercase text-xs">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-6 font-black text-lg">{previewData.item.productName}</td>
                      <td className="py-6 text-center font-bold">{previewData.item.quantity} PCS</td>
                      <td className="py-6 text-right font-bold">₹{(previewData.item.amount / previewData.item.quantity).toLocaleString()}</td>
                      <td className="py-6 text-right font-black text-xl">₹{previewData.item.amount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-4 border-gray-900">
                      <td colSpan={3} className="py-8 text-right font-black uppercase text-sm">Grand Total (INR)</td>
                      <td className="py-8 text-right font-black text-4xl tracking-tighter italic">₹{previewData.item.amount.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
                <div className="pt-12 border-t border-gray-100 flex justify-between items-end">
                  <div className="space-y-4">
                    <div className="w-48 h-12 bg-gray-50 flex items-center justify-center border-b border-gray-300">
                       <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Digital Signature</span>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorized Representative</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-300 uppercase leading-relaxed">This is a computer-generated document.<br/>No manual signature is required.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex gap-4">
              <button onClick={() => setPreviewData(null)} className="flex-1 py-4 font-black uppercase text-xs text-gray-400 hover:text-gray-900">Close</button>
              <button onClick={handleDownloadImage} className="flex-[2] bg-red-600 py-4 rounded-2xl text-white font-black uppercase shadow-xl shadow-red-100 flex items-center justify-center gap-3 transition-all active:scale-95">
                <i className="fas fa-download"></i>
                <span>Download Bill Image</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-black mb-2 uppercase text-center text-green-600">Withdraw Funds</h2>
            <p className="text-xs text-center text-gray-400 font-bold uppercase mb-4 tracking-tighter">Transfer Balance to Earnings</p>
            <input type="number" id="e_amt" className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 text-3xl font-black mb-6 text-center" placeholder="0" />
            <button onClick={() => { const amt = Number((document.getElementById('e_amt') as HTMLInputElement).value); if(amt > businessBalance) return alert("System: Insufficient Balance!"); setBusinessBalance(prev => prev - amt); setEarnings(prev => prev + amt); setShowAddMoneyModal(false); }} className="w-full bg-green-500 py-4 rounded-2xl text-white font-black uppercase shadow-lg shadow-green-100 hover:bg-green-600 transition-all">Transfer Done</button>
            <button onClick={() => setShowAddMoneyModal(false)} className="w-full mt-4 font-black text-gray-300 uppercase text-xs text-center">Cancel</button>
          </div>
        </div>
      )}

      {showAddToGoalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-sm shadow-2xl">
            <h2 className="text-xl font-black mb-2 uppercase text-center text-red-600">Save to Goal</h2>
            <p className="text-xs text-center text-gray-400 font-bold uppercase mb-4 tracking-tighter">Adding Contribution to Saving Goal</p>
            <input type="number" id="g_amt" className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 text-3xl font-black mb-6 text-center" placeholder="0" />
            <button onClick={() => { const amt = Number((document.getElementById('g_amt') as HTMLInputElement).value); if(amt > earnings) return alert("System: Earnings low hai!"); setEarnings(prev => prev - amt); setSavingGoalProgress(prev => prev + amt); setShowAddToGoalModal(false); }} className="w-full bg-red-600 py-4 rounded-2xl text-white font-black uppercase shadow-lg shadow-red-100 hover:bg-red-700 transition-all">Move to Savings</button>
            <button onClick={() => setShowAddToGoalModal(false)} className="w-full mt-4 font-black text-gray-300 uppercase text-xs text-center">Cancel</button>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-md shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-xl font-black mb-6 uppercase tracking-widest text-center text-gray-800">{showProductModal === 'new' ? 'New Inventory Item' : 'Update Item Details'}</h2>
            <form onSubmit={e => { 
              e.preventDefault(); 
              const fd = new FormData(e.currentTarget); 
              const data = { 
                name: fd.get('name') as string, 
                salePrice: Number(fd.get('sp')), 
                purchasePrice: Number(fd.get('pp')), 
                quantity: Number(fd.get('qty')) 
              }; 
              if(showProductModal === 'new') { 
                setProducts([...products, {id: Date.now().toString(), ...data}]); 
              } else { 
                setProducts(products.map(p => p.id === (showProductModal as Product).id ? {...p, ...data} : p)); 
              } 
              setShowProductModal(null); 
            }} className="space-y-4">
              <input name="name" required placeholder="Item Label" defaultValue={typeof showProductModal === 'object' ? showProductModal.name : ''} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold" />
              <div className="grid grid-cols-2 gap-4">
                <input name="sp" type="number" required placeholder="Sale Price (₹)" defaultValue={typeof showProductModal === 'object' ? showProductModal.salePrice : ''} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold" />
                <input name="pp" type="number" required placeholder="Buy Price (₹)" defaultValue={typeof showProductModal === 'object' ? showProductModal.purchasePrice : ''} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold" />
              </div>
              <input name="qty" type="number" required placeholder="Opening Stock Units" defaultValue={typeof showProductModal === 'object' ? showProductModal.quantity : ''} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold" />
              <div className="flex gap-4 pt-4"><button type="button" onClick={() => setShowProductModal(null)} className="flex-1 font-black text-gray-400 uppercase">Cancel</button><button type="submit" className="flex-[2] bg-red-600 py-4 rounded-2xl text-white font-black uppercase shadow-lg shadow-red-100 transition-all hover:bg-red-700">Save Changes</button></div>
            </form>
          </div>
        </div>
      )}

      {currentUser && (
        <button onClick={() => setShowCalculator(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all z-50 border-4 border-white">
          <i className="fas fa-calculator"></i>
        </button>
      )}
      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
    </div>
  );
};

export default App;
