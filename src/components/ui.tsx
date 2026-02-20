import { PropsWithChildren } from 'react';

export const Card = ({ children, className = '' }: PropsWithChildren<{ className?: string }>) => <div className={`rounded-xl border border-white/20 bg-white/80 p-4 shadow-md backdrop-blur ${className}`}>{children}</div>;
export const Button = ({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button className={`rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-50 ${className}`} {...props}>{children}</button>;
export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-violet-400" {...props} />;
export const Badge = ({ children, tone }: PropsWithChildren<{ tone: 'success' | 'danger' | 'info' | 'warn' }>) => {
  const map = { success: 'bg-emerald-100 text-emerald-700', danger: 'bg-red-100 text-red-700', info: 'bg-blue-100 text-blue-700', warn: 'bg-amber-100 text-amber-700' };
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${map[tone]}`}>{children}</span>;
};
