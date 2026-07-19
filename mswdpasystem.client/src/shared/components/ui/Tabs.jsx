export default function Tabs({ tabs, active, onChange, className = '' }) {
  const handleKeyDown = (e) => {
    const idx = tabs.findIndex((t) => t.id === active);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onChange(tabs[(idx + 1) % tabs.length].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onChange(tabs[(idx - 1 + tabs.length) % tabs.length].id);
    }
  };

  return (
    <div
      role="tablist"
      onKeyDown={handleKeyDown}
      className={`flex gap-1 border-b border-gray-200 overflow-x-auto ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 -mb-px text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              isActive
                ? 'border-primary-700 text-primary-800 dark:text-primary-300'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
            }`}
          >
            {Icon && <Icon size={16} aria-hidden="true" />}
            {tab.label}
            {tab.count != null && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                  isActive ? 'bg-primary-100 text-primary-800 dark:text-primary-300' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
