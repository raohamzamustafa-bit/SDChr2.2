import React from 'react';
import clsx from 'clsx';

// ==========================================
// BUTTON COMPONENT
// ==========================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  isLoading,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 select-none active:scale-[0.98]',
        variant === 'primary' && 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 hover:brightness-110',
        variant === 'secondary' && 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/50',
        variant === 'ghost' && 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50',
        variant === 'danger' && 'bg-rose-600/90 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/10',
        variant === 'outline' && 'bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100',
        isLoading && 'opacity-70 pointer-events-none',
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
};

// ==========================================
// CARD COMPONENT (GLASSMORPHISM)
// ==========================================
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { gradientBorder?: boolean }> = ({
  children,
  className,
  gradientBorder,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'glass-card rounded-xl p-6 relative overflow-hidden transition-all duration-300',
        gradientBorder && 'before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-r before:from-purple-500/20 before:to-indigo-500/20 before:rounded-xl before:-z-10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ==========================================
// INPUT COMPONENT
// ==========================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3.5 text-slate-400">{icon}</span>}
        <input
          className={clsx(
            'w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200 text-sm',
            icon && 'pl-10',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
            className
          )}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-rose-400 font-medium">{error}</span>}
    </div>
  );
};

// ==========================================
// TEXTAREA COMPONENT
// ==========================================
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <textarea
        className={clsx(
          'w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200 text-sm min-h-[80px]',
          error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-rose-400 font-medium">{error}</span>}
    </div>
  );
};

// ==========================================
// SELECT COMPONENT
// ==========================================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <select
        className={clsx(
          'w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200 text-sm cursor-pointer',
          error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-100">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-rose-400 font-medium">{error}</span>}
    </div>
  );
};

// ==========================================
// BADGE COMPONENT
// ==========================================
export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'purple' | 'neutral';
  className?: string;
}> = ({ children, variant = 'info', className }) => {
  return (
    <span
      className={clsx(
        'px-2.5 py-0.5 rounded-full text-xs font-semibold select-none capitalize border',
        variant === 'success' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        variant === 'warning' && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        variant === 'error' && 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        variant === 'info' && 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        variant === 'purple' && 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        variant === 'neutral' && 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        className
      )}
    >
      {children}
    </span>
  );
};

// ==========================================
// MODAL COMPONENT
// ==========================================
export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      {/* Content wrapper */}
      <div
        className={clsx(
          'glass-card rounded-2xl w-full relative z-10 border border-slate-700/50 shadow-2xl p-6 animation:page-fade-in 0.2s ease-out max-h-[90vh] overflow-y-auto',
          size === 'sm' && 'max-w-md',
          size === 'md' && 'max-w-lg',
          size === 'lg' && 'max-w-3xl',
          size === 'xl' && 'max-w-5xl'
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-4">
          <h3 className="text-lg font-bold text-slate-100 font-heading">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ==========================================
// STAT CARD COMPONENT
// ==========================================
export const StatCard: React.FC<{
  title: string;
  value: string | number;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ title, value, trend, trendType = 'neutral', icon, className, onClick }) => {
  return (
    <Card 
      onClick={onClick} 
      className={clsx(
        'glass-card-hover border border-slate-800/40 relative overflow-hidden',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Floating accent background glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl -z-10" />
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
          <h2 className="text-3xl font-extrabold text-slate-100 mt-2 font-heading">{value}</h2>
          {trend && (
            <div className="flex items-center gap-1 mt-2.5">
              <span
                className={clsx(
                  'text-xs font-bold',
                  trendType === 'up' && 'text-emerald-400',
                  trendType === 'down' && 'text-rose-400',
                  trendType === 'neutral' && 'text-slate-400'
                )}
              >
                {trendType === 'up' ? '↑' : trendType === 'down' ? '↓' : '•'} {trend}
              </span>
              <span className="text-[10px] text-slate-500">vs last month</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 shadow-inner">
          {icon}
        </div>
      </div>
    </Card>
  );
};

// ==========================================
// TABLE COMPONENT
// ==========================================
interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ headers, children, className }) => {
  return (
    <div className={clsx('w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/20', className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/50">
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 font-heading">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-sm text-slate-200">
          {children}
        </tbody>
      </table>
    </div>
  );
};

// ==========================================
// TABS COMPONENT
// ==========================================
interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={clsx('flex gap-2 border-b border-slate-800 pb-[1px] overflow-x-auto', className)}>
      {tabs.map((t) => {
        const active = t.id === activeTab;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={clsx(
              'px-5 py-3 text-sm font-medium transition-all duration-200 relative cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 font-heading',
              active 
                ? 'text-purple-400 border-purple-500 font-semibold' 
                : 'text-slate-400 border-transparent hover:text-slate-200'
            )}
          >
            {t.icon}
            {t.label}
          </button>
        );
      })}
    </div>
  );
};

// ==========================================
// PROGRESS BAR COMPONENT
// ==========================================
export const ProgressBar: React.FC<{
  value: number;
  max?: number;
  className?: string;
  color?: 'purple' | 'emerald' | 'amber';
}> = ({ value, max = 100, className, color = 'purple' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={clsx('w-full bg-slate-800 rounded-full h-2 relative overflow-hidden', className)}>
      <div
        className={clsx(
          'h-full rounded-full transition-all duration-500 ease-out',
          color === 'purple' && 'bg-gradient-to-r from-purple-500 to-indigo-500',
          color === 'emerald' && 'bg-gradient-to-r from-emerald-500 to-teal-500',
          color === 'amber' && 'bg-gradient-to-r from-amber-500 to-orange-500'
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
