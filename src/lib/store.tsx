import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CashbookEntry, Client, OwnerCapitalTransaction, Transaction, UserSession } from './types';
import { PROCESSING_FEE, formatDate, formatTime, normalizePhoneNumber, plus30Days } from './utils';

interface StoreContextValue {
  clients: Client[];
  transactions: Transaction[];
  cashbook: CashbookEntry[];
  ownerCapital: OwnerCapitalTransaction[];
  user: UserSession | null;
  setUser: (u: UserSession | null) => void;
  addClient: (payload: Omit<Client, 'id' | 'processingFee' | 'totalPayable' | 'totalPaid' | 'outstandingBalance' | 'status' | 'startDate' | 'endDate' | 'currentLoanNumber' | 'totalLoansCompleted'>) => void;
  recordPayment: (clientId: string, amount: number, notes: string) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);
const KEY = 'texas-finance-db';

const uid = () => crypto.randomUUID();

const sendSms = async (path: string, payload: Record<string, unknown>) => {
  try {
    await fetch(`/make-server-68baa523/sms/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    toast.success('SMS sent to client');
  } catch {
    toast.warning('SMS failed but transaction completed');
  }
};

export function StoreProvider({ children }: PropsWithChildren) {
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cashbook, setCashbook] = useState<CashbookEntry[]>([]);
  const [ownerCapital, setOwnerCapital] = useState<OwnerCapitalTransaction[]>([]);
  const [user, setUser] = useState<UserSession | null>(() => {
    const raw = localStorage.getItem('texas-finance-user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Pick<StoreContextValue, 'clients' | 'transactions' | 'cashbook' | 'ownerCapital'>;
    setClients(parsed.clients || []);
    setTransactions(parsed.transactions || []);
    setCashbook(parsed.cashbook || []);
    setOwnerCapital(parsed.ownerCapital || []);
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ clients, transactions, cashbook, ownerCapital }));
  }, [clients, transactions, cashbook, ownerCapital]);

  useEffect(() => {
    if (user) localStorage.setItem('texas-finance-user', JSON.stringify(user));
    else localStorage.removeItem('texas-finance-user');
  }, [user]);

  const addClient: StoreContextValue['addClient'] = (payload) => {
    const now = new Date();
    const loanAmount = Number(payload.loanAmount);
    const client: Client = {
      ...payload,
      id: uid(),
      phoneNumber: normalizePhoneNumber(payload.phoneNumber),
      guarantorPhone: normalizePhoneNumber(payload.guarantorPhone),
      processingFee: PROCESSING_FEE,
      totalPayable: loanAmount * 1.2,
      totalPaid: 0,
      outstandingBalance: loanAmount * 1.2,
      status: 'Active',
      currentLoanNumber: 1,
      totalLoansCompleted: 0,
      endDate: plus30Days(now),
      startDate: formatDate(now),
    };
    setClients((prev) => [client, ...prev]);
    setCashbook((prev) => [{
      id: uid(), date: formatDate(now), time: formatTime(now), description: `Loan disbursement - ${client.fullName}`,
      type: 'Expense', amount: client.loanAmount, status: 'Disbursement', enteredBy: payload.addedBy,
    }, {
      id: uid(), date: formatDate(now), time: formatTime(now), description: `Processing fee - ${client.fullName}`,
      type: 'Income', amount: PROCESSING_FEE, status: 'Income', enteredBy: payload.addedBy,
    }, ...prev]);
    toast.success('Client added successfully!');
    sendSms('loan-disbursement', { clientName: client.fullName, amount: client.loanAmount, totalPayable: client.totalPayable, dueDate: client.endDate, phone: client.phoneNumber });
  };

  const recordPayment: StoreContextValue['recordPayment'] = (clientId, amount, notes) => {
    const now = new Date();
    const client = clients.find((c) => c.id === clientId);
    if (!client || !user) return;
    if (amount <= 0 || amount > client.outstandingBalance) {
      toast.error('Invalid payment amount');
      return;
    }
    const newPaid = client.totalPaid + amount;
    const outstanding = Math.max(client.totalPayable - newPaid, 0);
    const status = outstanding === 0 ? 'Completed' : 'Active';

    setClients((prev) => prev.map((c) => c.id === clientId ? { ...c, totalPaid: newPaid, outstandingBalance: outstanding, status, totalLoansCompleted: status === 'Completed' ? c.totalLoansCompleted + 1 : c.totalLoansCompleted } : c));

    const tx: Transaction = {
      id: uid(), clientId, clientName: client.fullName, date: formatDate(now), time: formatTime(now), amount, notes,
      status: 'Paid', recordedBy: user.email, loanNumber: client.currentLoanNumber,
    };
    setTransactions((prev) => [tx, ...prev]);
    setCashbook((prev) => [{ id: uid(), date: tx.date, time: tx.time, description: `Loan repayment - ${client.fullName}`, type: 'Income', amount, status: 'Paid', enteredBy: user.email }, ...prev]);
    toast.success('Payment recorded successfully!');
    sendSms('payment-received', { clientName: client.fullName, paymentAmount: amount, remainingBalance: outstanding, phone: client.phoneNumber });
    if (outstanding === 0) sendSms('loan-paid-off', { clientName: client.fullName, totalPaid: newPaid, phone: client.phoneNumber });
  };

  const value = useMemo(() => ({ clients, transactions, cashbook, ownerCapital, user, setUser, addClient, recordPayment }), [clients, transactions, cashbook, ownerCapital, user]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('Store missing');
  return ctx;
};
