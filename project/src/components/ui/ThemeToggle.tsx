import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-line/15 bg-surface/70 text-muted transition hover:border-teal-400/40 hover:text-teal-300"
    >
      <Sun className={`absolute h-[18px] w-[18px] transition duration-500 ${isDark ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'}`} />
      <Moon className={`absolute h-[18px] w-[18px] transition duration-500 ${isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'}`} />
    </button>
  );
}
