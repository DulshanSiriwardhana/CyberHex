/**
 * CyberHex v3.0 — Command Palette
 *
 * Premium Ctrl+K command palette with fuzzy search, category
 * grouping, keyboard navigation, and lucide icon rendering.
 * Commands are pulled from the global command store, allowing
 * any feature to register actions dynamically.
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Command,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Layers,
  FlaskConical,
  BrainCircuit,
  Settings,
  Palette,
  Sun,
  Moon,
  Monitor,
  Gamepad2,
  Home,
  BookOpen,
  User,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { useCommandPaletteStore, type Command as Cmd, type CommandCategory } from '@/stores/commandPalette';
import { useThemeStore, type ThemeMode } from '@/stores/theme';
import type { ThemeVariant } from '@/lib/design-tokens';
import { THEME_REGISTRY } from '@/lib/design-tokens';

// ──── Icon Map ───────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  Layers,
  FlaskConical,
  BrainCircuit,
  Settings,
  Palette,
  Sun,
  Moon,
  Monitor,
  Gamepad2,
  Home,
  BookOpen,
  User,
  LogOut,
  ChevronRight,
};

function getIcon(iconName?: string): LucideIcon {
  return (iconName && ICON_MAP[iconName]) || Command;
}

// ──── Category Display Names ─────────────────────────────────────
const CATEGORY_LABELS: Record<CommandCategory, string> = {
  navigation: 'Navigate',
  experiments: 'Experiments',
  models: 'Models',
  settings: 'Settings',
  view: 'View',
  tools: 'Tools',
  help: 'Help',
};

const CATEGORY_ORDER: CommandCategory[] = [
  'navigation',
  'experiments',
  'models',
  'view',
  'tools',
  'settings',
  'help',
];

// ──── Fuzzy Search ───────────────────────────────────────────────
function fuzzyScore(query: string, target: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Exact match bonus
  if (t === q) return 100;
  // Starts with bonus
  if (t.startsWith(q)) return 80;
  // Contains bonus
  if (t.includes(q)) return 60;

  // Character-by-character fuzzy match
  let score = 0;
  let qIdx = 0;
  let consecutive = 0;

  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (t[i] === q[qIdx]) {
      qIdx++;
      consecutive++;
      score += consecutive * 2 + 10;
    } else {
      consecutive = 0;
    }
  }

  return qIdx === q.length ? score : 0;
}

// ──── Component ──────────────────────────────────────────────────
export default function CommandPalette() {
  const {
    isOpen,
    close,
    commands,
    registerCommands,
  } = useCommandPaletteStore();

  const theme = useThemeStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // ── Built-in theme commands ────────────────────────────────────
  useEffect(() => {
    const themeCommands: Cmd[] = [
      ...(['dark', 'light', 'system'] as ThemeMode[]).map((mode) => ({
        id: `theme-mode-${mode}`,
        label: `Theme: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`,
        description: `Switch to ${mode} mode`,
        category: 'settings' as CommandCategory,
        icon: mode === 'dark' ? 'Moon' : mode === 'light' ? 'Sun' : 'Monitor',
        action: () => theme.setMode(mode),
        keywords: ['theme', 'appearance', 'color', mode],
      })),
      {
        id: 'theme-toggle',
        label: 'Toggle Theme',
        description: 'Switch between dark and light mode',
        category: 'settings' as CommandCategory,
        icon: 'Palette',
        action: () => theme.toggle(),
        keywords: ['theme', 'toggle', 'dark', 'light'],
      },
      ...Object.values(THEME_REGISTRY).map((variant) => ({
        id: `theme-variant-${variant.id}`,
        label: `Color Theme: ${variant.name}`,
        description: variant.description,
        category: 'settings' as CommandCategory,
        icon: 'Palette',
        action: () => theme.setVariant(variant.id as ThemeVariant),
        keywords: ['theme', 'variant', 'color', variant.name, variant.id],
      })),
    ];

    registerCommands(themeCommands);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fuzzy-filtered & sorted commands ───────────────────────────
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;

    const scored = commands
      .map((cmd) => {
        const labelScore = fuzzyScore(query, cmd.label);
        const descScore = cmd.description ? fuzzyScore(query, cmd.description) : 0;
        const kwScore = cmd.keywords
          ? Math.max(...cmd.keywords.map((k) => fuzzyScore(query, k)))
          : 0;
        const score = Math.max(labelScore * 2, descScore * 1.2, kwScore * 1.5);
        return { cmd, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.map((item) => item.cmd);
  }, [commands, query]);

  // ── Group by category with ordering ────────────────────────────
  const grouped = useMemo(() => {
    const map = new Map<CommandCategory, Cmd[]>();
    for (const cmd of filtered) {
      const list = map.get(cmd.category) || [];
      list.push(cmd);
      map.set(cmd.category, list);
    }
    // Sort categories
    const sorted = new Map<CommandCategory, Cmd[]>();
    for (const cat of CATEGORY_ORDER) {
      const cmds = map.get(cat);
      if (cmds && cmds.length > 0) sorted.set(cat, cmds);
    }
    // Include any categories not in the order list
    for (const [cat, cmds] of map) {
      if (!CATEGORY_ORDER.includes(cat)) sorted.set(cat, cmds);
    }
    return sorted;
  }, [filtered]);

  // ── Flatten for index-based navigation ─────────────────────────
  const flatCommands = useMemo(() => {
    const flat: { cmd: Cmd; category: CommandCategory }[] = [];
    for (const [cat, cmds] of grouped) {
      for (const cmd of cmds) {
        flat.push({ cmd, category: cat });
      }
    }
    return flat;
  }, [grouped]);

  // ── Reset selection on query change ────────────────────────────
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // ── Auto-focus input on open ───────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Small delay to let the animation start
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // ── Scroll selected into view ──────────────────────────────────
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector(
        `[data-command-index="${selectedIndex}"]`
      );
      selected?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  // ── Execute command ────────────────────────────────────────────
  const execute = useCallback(
    (cmd: Cmd) => {
      close();
      setQuery('');
      cmd.action();
    },
    [close]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 flex items-start justify-center pt-[12vh] px-4"
        style={{ zIndex: 1800 }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={close}
        />

        {/* Palette */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -16 }}
          transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative w-full max-w-xl bg-[#111118]/95 border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl"
          style={{
            boxShadow:
              '0 0 40px rgba(0, 240, 255, 0.06), 0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
            <Search className="w-4 h-4 text-white/40 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search commands..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30 font-sans"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] font-medium text-white/30 font-mono">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-72 overflow-y-auto p-2">
            {flatCommands.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Command className="w-6 h-6 text-white/15" />
                <span className="text-sm text-white/30">No commands found</span>
                <span className="text-xs text-white/15">Try a different search term</span>
              </div>
            ) : (
              Array.from(grouped.entries()).map(([category, cmds]) => (
                <div key={category}>
                  <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-white/25 uppercase tracking-widest">
                    {CATEGORY_LABELS[category] || category}
                  </div>
                  {cmds.map((cmd) => {
                    const flatIdx = flatCommands.findIndex((f) => f.cmd.id === cmd.id);
                    const isSelected = flatIdx === selectedIndex;
                    const Icon = getIcon(cmd.icon);

                    return (
                      <button
                        key={cmd.id}
                        data-command-index={flatIdx}
                        onClick={() => execute(cmd)}
                        onMouseEnter={() => setSelectedIndex(flatIdx)}
                        className={`
                          group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-75
                          ${
                            isSelected
                              ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-300'
                              : 'text-white/70 hover:bg-white/[0.03] border border-transparent'
                          }
                        `}
                      >
                        <div
                          className={`
                            flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-colors
                            ${isSelected ? 'bg-cyan-500/15 text-cyan-400' : 'bg-white/[0.04] text-white/40'}
                          `}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[13px] truncate">
                            {cmd.label}
                          </div>
                          {cmd.description && (
                            <div className="text-[11px] text-white/30 truncate mt-0.5">
                              {cmd.description}
                            </div>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono text-white/20 bg-white/[0.03] border border-white/[0.06]">
                            {cmd.shortcut}
                          </kbd>
                        )}
                        {isSelected && (
                          <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400/60 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-5 px-4 py-2.5 border-t border-white/[0.06]">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-white/25">
              <ArrowUp className="w-2.5 h-2.5" />
              <ArrowDown className="w-2.5 h-2.5" />
              Navigate
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] text-white/25">
              <CornerDownLeft className="w-2.5 h-2.5" />
              Execute
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] text-white/25">
              <span className="font-mono text-[9px]">Esc</span>
              Close
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}