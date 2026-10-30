import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const RING_COLORS = {
  lime: '#bef264',
  emerald: '#34d399',
  teal: '#2dd4bf',
  cyan: '#22d3ee',
  amber: '#fbbf24',
  rose: '#fb7185',
  sky: '#38bdf8',
} as const;

interface RingProgressProps {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  className?: string;
  children?: React.ReactNode;
}

export function RingProgress({
  value,
  size = 96,
  stroke = 8,
  color = RING_COLORS.teal,
  className,
  children,
}: RingProgressProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 overflow-visible" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-line/12"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
