import { create } from 'zustand';

export type CommandCategory =
  | 'navigation'
  | 'experiments'
  | 'models'
  | 'settings'
  | 'view'
  | 'tools'
  | 'help';

export interface Command {

  id: string;

  label: string;

  description?: string;

  category: CommandCategory;

  shortcut?: string;

  icon?: string;

  action: () => void;

  keywords?: string[];
}

interface CommandState {

  isOpen: boolean;

  commands: Command[];

  toggle: () => void;

  open: () => void;

  close: () => void;

  registerCommand: (command: Command) => void;

  unregisterCommand: (id: string) => void;

  registerCommands: (commands: Command[]) => void;
}

export const useCommandPaletteStore = create<CommandState>()((set, get) => ({
  isOpen: false,
  commands: [],

  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  registerCommand: (command: Command) => {
    set((s) => {

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
