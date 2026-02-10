interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-base font-semibold text-[#6B6B6B]">{title}</div>
      {subtitle && <div className="text-xs text-[#9CA3AF] mt-1">{subtitle}</div>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 text-xs font-bold rounded bg-[#E8952E] text-white hover:bg-[#D4841F] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
