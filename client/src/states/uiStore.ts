import { create } from 'zustand';

interface UIStore {
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set: any) => ({
    isSidebarCollapsed: false,
    toggleSidebar: () => set((state: UIStore) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));
