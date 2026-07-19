export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-white dark:bg-gray-100 rounded-xl border border-gray-200 shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, actions, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-100 ${className}`}>
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

const statTints = {
  primary: 'bg-primary-50 text-primary-700',
  gold: 'bg-gold-50 text-gold-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  accent: 'bg-accent-50 text-accent-700',
  gray: 'bg-gray-100 text-gray-600',
};

export function StatCard({ icon: Icon, label, value, hint, tint = 'primary', className = '' }) {
  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${statTints[tint] ?? statTints.primary}`}>
            <Icon size={22} aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
          <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
          {hint && <p className="text-xs text-gray-400 mt-0.5 truncate">{hint}</p>}
        </div>
      </div>
    </Card>
  );
}
