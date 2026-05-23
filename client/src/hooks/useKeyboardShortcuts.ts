import { useEffect } from 'react';
import { useCommandPaletteStore } from '@/stores/commandPalette';
import { useThemeStore } from '@/stores/theme';

export function useKeyboardShortcuts() {
  const togglePalette = useCommandPaletteStore((s) => s.toggle);
  const closePalette = useCommandPaletteStore((s) => s.close);
  const isPaletteOpen = useCommandPaletteStore((s) => s.isOpen);
  const themeToggle = useThemeStore((s) => s.toggle);
  const cycleVariant = useThemeStore((s) => s.cycleVariant);

  useEffect(() => {
    function isEditable(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
      if (target.isContentEditable) return true;
      if (target.getAttribute('role') === 'textbox') return true;
      return false;
    }

    function handleKeyDown(e: KeyboardEvent) {

      if (isEditable(e.target)) return;

      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === 'k') {
        e.preventDefault();
        togglePalette();
        return;
      }

      if (mod && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        themeToggle();
        return;
      }

      if (mod && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        cycleVariant();
        return;
      }

      if (e.key === 'Escape' && isPaletteOpen) {
        e.preventDefault();
        closePalette();
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [togglePalette, closePalette, isPaletteOpen, themeToggle, cycleVariant]);
}

export default useKeyboardShortcuts;
