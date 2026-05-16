/**
 * CyberHex v3.0 — Command Palette Store
 *
 * Manages registered commands, keyboard shortcuts, and palette
 * open/close state. Commands are registered globally by features
 * and rendered in the Ctrl+K command palette.
 */

import { create } from 'zustand';

// ──── Types ──────────────────────────────────────────────────────
export type CommandCategory =
  | 'navigation'
  | 'experiments'
  | 'models'
  | 'settings'
  | 'view'
  | 'tools'
  | 'help';

export interface Command {
  /** Unique command identifier */
  id: string;
  /** Display label in palette */
  label: string;
  /** Optional description shown below label */
  description?: string;
  /** Category for grouping in palette */
  category: CommandCategory;
  /** Keyboard shortcut hint (e.g., "⌘N") — informational only */
  shortcut?: string;
  /** Icon component name from lucide-react */
  icon?: string;
  /** Action to execute when selected */
  action: () => void;
  /** Optional keywords for fuzzy search beyond label */
  keywords?: string[];
}

interface CommandState {
  /** Whether the palette dialog is open */
  isOpen: boolean;
  /** All globally registered commands */
  commands: Command[];
  /** Toggle palette visibility */
  toggle: () => void;
  /** Open the palette */
  open: () => void;
  /** Close the palette */
  close: () => void;
  /** Register a command (called by features on mount) */
  registerCommand: (command: Command) => void;
  /** Unregister a command (called on unmount) */
  unregisterCommand: (id: string) => void;
  /** Register multiple commands at once */
  registerCommands: (commands: Command[]) => void;
}

// ──── Store ──────────────────────────────────────────────────────
export const useCommandPaletteStore = create<CommandState>()((set, get) => ({
  isOpen: false,
  commands: [],

  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  registerCommand: (command: Command) => {
    set((s) => {
      // Avoid duplicates by id
      const filtered = s.commands.filter((c) => c.id !== command.id);
      return { commands: [...filtered, command] };
    });
  },

  unregisterCommand: (id: string) => {
    set((s) => ({
      commands: s.commands.filter((c) => c.id !== id),
    }));
  },

  registerCommands: (commands: Command[]) => {
    set((s) => {
      const ids = new Set(commands.map((c) => c.id));
      const filtered = s.commands.filter((c) => !ids.has(c.id));
      return { commands: [...filtered, ...commands] };
    });
  },
}));

export default useCommandPaletteStore;