import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { Badge, Button, Card, Input } from '@/components/ui';
import { useStore } from '@/lib/store';
import { formatUGX, maskPhoneNumber } from '@/lib/utils';

export function LoginPage() {
  const { setUser } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const role = email === 'william@boss.com' ? 'owner' : 'staff';
    setUser({ email, role });
    navigate('/');
  };
  return <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-violet-900 p-4"><Card className="w-full max-w-md"><h2 className="mb-4 text-xl font-bold">Login</h2><form onSubmit={submit} className="space-y-3"><Input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><Input required type="password" placeholder="Password" /><Button className="w-full">Sign In</Button></form></Card></div>;
}

export function DashboardPage() {
  const { clients, transactions } = useStore();
  const metrics = useMemo(() => ({
    activeClients: clients.filter((c) => c.status === 'Active').length,
    totalLent: clients.reduce((a, c) => a + c.loanAmount, 0),
    outstanding: clients.reduce((a, c) => a + c.outstandingBalance, 0),
    collected: transactions.reduce((a, c) => a + c.amount, 0),
  }), [clients, transactions]);
  const cards: Array<{ label: string; value: ReactNode; gradient: string; Icon: typeof Users }> = [
    { label: 'Active Clients', value: metrics.activeClients, gradient: 'from-emerald-500 to-emerald-700', Icon: Users },
    { label: 'Total Active Loans', value: metrics.activeClients, gradient: 'from-blue-500 to-blue-700', Icon: TrendingUp },
    { label: 'Total Money Lent', value: formatUGX(metrics.totalLent), gradient: 'from-violet-500 to-violet-700', Icon: TrendingUp },
    { label: 'Outstanding Balance', value: formatUGX(metrics.outstanding), gradient: 'from-amber-500 to-orange-700', Icon: AlertCircle },
    { label: 'Money Collected', value: formatUGX(metrics.collected), gradient: 'from-green-500 to-emerald-700', Icon: CheckCircle2 },
  ];
  return <div className="space-y-4"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">{cards.map(({ label, value, gradient, Icon }) => <Card key={label} className={`fade-in border-2 text-white bg-gradient-to-r ${gradient}`}><div className="flex items-center justify-between"><p className="text-sm">{label}</p><Icon /></div><p className="mt-4 text-2xl font-bold">{value}</p></Card>)}</div><Card><h3 className="mb-3 font-semibold">Recent Payments</h3><table className="w-full text-sm"><thead><tr className="text-left"><th>Date</th><th>Client</th><th>Amount</th><th>Status</th></tr></thead><tbody>{transactions.slice(0, 6).map((t) => <tr key={t.id}><td>{t.date}</td><td>{t.clientName}</td><td>{formatUGX(t.amount)}</td><td><Badge tone="success">Paid</Badge></td></tr>)}</tbody></table></Card></div>;
}

export function ClientsPage() {
  const { clients } = useStore();
  const [search, setSearch] = useState('');
  const filtered = clients.filter((c) => `${c.fullName} ${c.phoneNumber} ${c.nationalId}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="space-y-4"><div className="flex gap-2"><Input placeholder="Search by name/phone/ID" value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map((c) => <Card key={c.id}><div className="flex items-center justify-between"><h3 className="font-semibold">{c.fullName}</h3><Badge tone={c.status === 'Active' ? 'success' : 'info'}>{c.status}</Badge></div><p className="text-sm">{maskPhoneNumber(c.phoneNumber)}</p><p className="mt-2 text-sm">Outstanding: {formatUGX(c.outstandingBalance)}</p><a href={`/clients/${c.id}`} className="mt-3 inline-block text-sm text-violet-600 underline">View details</a></Card>)}</div></div>;
}

export function ClientDetailPage() {
  const { id } = useParams();
  const { clients, recordPayment, user } = useStore();
  const client = clients.find((c) => c.id === id);
  const [amount, setAmount] = useState(0);
  if (!client) return <Card>Client not found</Card>;
  return <div className="space-y-4"><Card><h2 className="text-2xl font-bold">{client.fullName}</h2><p>{client.phoneNumber}</p><p>Loan: {formatUGX(client.loanAmount)} | Outstanding: {formatUGX(client.outstandingBalance)}</p></Card><Card><h3 className="mb-2 font-semibold">Record Payment</h3><div className="flex gap-2"><Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /><Button onClick={() => recordPayment(client.id, amount, 'Manual payment')}>Submit</Button>{user?.role === 'owner' && <Button className="bg-blue-600" onClick={() => alert('Balance inquiry SMS sent')}>Send Balance Inquiry SMS</Button>}</div></Card></div>;
}

export function LoansPage() { const { clients } = useStore(); return <Card><h2 className="mb-2 text-lg font-bold">Loans</h2><table className="w-full text-sm"><thead><tr><th>Client</th><th>Loan</th><th>Payable</th><th>Outstanding</th><th>Status</th></tr></thead><tbody>{clients.map((c) => <tr key={c.id}><td>{c.fullName}</td><td>{formatUGX(c.loanAmount)}</td><td>{formatUGX(c.totalPayable)}</td><td>{formatUGX(c.outstandingBalance)}</td><td>{c.status}</td></tr>)}</tbody></table></Card>; }

export function TransactionsPage() { const { transactions } = useStore(); return <Card><h2 className="mb-2 text-lg font-bold">Transactions</h2>{transactions.map((t) => <div key={t.id} className="flex justify-between border-b py-2"><span>{t.date} {t.clientName}</span><strong>{formatUGX(t.amount)}</strong></div>)}</Card>; }

export function CashbookPage() { const { cashbook } = useStore(); return <Card><h2 className="mb-2 text-lg font-bold">Cashbook</h2>{cashbook.map((c) => <div key={c.id} className="flex justify-between border-b py-2"><span>{c.description}</span><span className={c.type === 'Income' ? 'text-emerald-600' : 'text-red-600'}>{formatUGX(c.amount)}</span></div>)}</Card>; }

export function OwnerCapitalPage() { return <Card><h2 className="text-lg font-bold">Owner Capital</h2><p>Track injections and withdrawals with cashbook sync.</p></Card>; }
export function EvaluationPage() { return <Card><h2 className="text-lg font-bold">Weekly Evaluation</h2><p>Collections, amount loaned, expenses, outstanding and business capital breakdown.</p></Card>; }
export function DataViewPage() { return <Card><h2 className="text-lg font-bold">Data View (Owner only)</h2></Card>; }
export function AllocationPage() { return <Card><h2 className="text-lg font-bold">Client Allocation (Owner only)</h2></Card>; }

export function AddClientPage() {
  const { addClient, user } = useStore();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [location, setLocation] = useState('');
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorId, setGuarantorId] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [guarantorLocation, setGuarantorLocation] = useState('');
  const [loanAmount, setLoanAmount] = useState(100000);
  const submit = (e: FormEvent) => { e.preventDefault(); if (!user) return; addClient({ fullName, phoneNumber, nationalId, location, guarantorName, guarantorId, guarantorPhone, guarantorLocation, loanAmount, addedBy: user.email }); };
  return <Card><h2 className="mb-3 text-lg font-bold">Add Client</h2><form className="grid gap-2 md:grid-cols-2" onSubmit={submit}><Input required placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} /><Input required placeholder="Phone 0XXX" value={phoneNumber} onChange={(e) => setPhone(e.target.value)} /><Input required placeholder="National ID" value={nationalId} onChange={(e) => setNationalId(e.target.value)} /><Input required placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} /><Input required placeholder="Guarantor name" value={guarantorName} onChange={(e) => setGuarantorName(e.target.value)} /><Input required placeholder="Guarantor ID" value={guarantorId} onChange={(e) => setGuarantorId(e.target.value)} /><Input required placeholder="Guarantor phone" value={guarantorPhone} onChange={(e) => setGuarantorPhone(e.target.value)} /><Input required placeholder="Guarantor location" value={guarantorLocation} onChange={(e) => setGuarantorLocation(e.target.value)} /><Input required type="number" placeholder="Loan amount" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} /><Button className="md:col-span-2">Create client & disburse</Button></form></Card>;
}
