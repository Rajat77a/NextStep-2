import type { FlagStatus } from '@/types';

interface FlagBadgeProps {
  flag: FlagStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const config = {
  green: { label: 'On Track', bg: 'bg-sage/10', text: 'text-sage', dot: 'bg-sage' },
  yellow: { label: 'Watch', bg: 'bg-amber/10', text: 'text-amber', dot: 'bg-amber' },
  red: { label: 'Address', bg: 'bg-coral/10', text: 'text-coral', dot: 'bg-coral' },
};

export default function FlagBadge({ flag, showLabel = true, size = 'md' }: FlagBadgeProps) {
  const c = config[flag];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-body font-semibold ${c.bg} ${c.text} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {showLabel && c.label}
    </span>
  );
}
