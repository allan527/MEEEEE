import React from 'react';
import ReactDOM from 'react-dom/client';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import './styles.css';
import { StoreProvider, useStore } from './lib/store';
import { AddClientPage, AllocationPage, CashbookPage, ClientDetailPage, ClientsPage, DashboardPage, DataViewPage, EvaluationPage, LoginPage, LoansPage, OwnerCapitalPage, TransactionsPage } from './pages';

function Guard({ children, ownerOnly = false }: React.PropsWithChildren<{ ownerOnly?: boolean }>) {
  const { user } = useStore();
  if (!user) return <Navigate to="/login" replace />;
  if (ownerOnly && user.role !== 'owner') return <Navigate to="/" replace />;
  return <>{children}</>;
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <Guard><App /></Guard>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'clients', element: <ClientsPage /> },
      { path: 'clients/:id', element: <ClientDetailPage /> },
      { path: 'add-client', element: <AddClientPage /> },
      { path: 'loans', element: <LoansPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'cashbook', element: <CashbookPage /> },
      { path: 'owner-capital', element: <OwnerCapitalPage /> },
      { path: 'evaluation', element: <EvaluationPage /> },
      { path: 'data-view', element: <Guard ownerOnly><DataViewPage /></Guard> },
      { path: 'client-allocation', element: <Guard ownerOnly><AllocationPage /></Guard> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <Toaster richColors />
      <RouterProvider router={router} />
    </StoreProvider>
  </React.StrictMode>,
);
