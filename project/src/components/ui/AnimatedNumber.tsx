import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  format: (value: number) => string;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({ value, format, duration = 1, className }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    const controls = animate(previous.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(latest),
      onComplete: () => {
        previous.current = value;
      },
    });
    return () => controls.stop();
  }, [value, duration]);

  return <span className={`tabular-nums ${className ?? ''}`}>{format(display)}</span>;
}
