import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, HandCoins, Receipt, BookOpen, Wallet, BarChart3, Database, UserRoundCog } from 'lucide-react';
import { useStore } from './lib/store';

const menu = [
  ['/', 'Dashboard', LayoutDashboard],
  ['/clients', 'Clients', Users],
  ['/add-client', 'Add Client', Users],
  ['/loans', 'Loans', HandCoins],
  ['/transactions', 'Transactions', Receipt],
  ['/cashbook', 'Cashbook', BookOpen],
  ['/owner-capital', 'Owner Capital', Wallet],
  ['/evaluation', 'Evaluation', BarChart3],
  ['/data-view', 'Data View', Database],
  ['/client-allocation', 'Client Allocation', UserRoundCog],
] as const;

export default function App() {
  const location = useLocation();
  const { user, setUser } = useStore();

  return <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
    <aside className="bg-slate-800 p-4 text-white">
      <h1 className="mb-6 text-2xl font-bold text-violet-300">Texas Finance</h1>
      <nav className="space-y-2">
        {menu.map(([to, label, Icon]) => <Link key={to} to={to} className={`flex items-center gap-2 rounded-lg p-2 ${location.pathname === to ? 'bg-violet-600' : 'hover:bg-slate-700'}`}><Icon size={18} /> {label}</Link>)}
      </nav>
      <div className="mt-8 rounded-lg bg-slate-700 p-3 text-sm">{user?.email ?? 'Guest'} <button className="ml-2 underline" onClick={() => setUser(null)}>Logout</button></div>
    </aside>
    <main className="p-4 lg:p-6"><Outlet /></main>
  </div>;
}
