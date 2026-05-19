import { create } from 'zustand';

interface AuthModalState {
    signInOpen: boolean;
    signUpOpen: boolean;
    openSignIn: () => void;
    openSignUp: () => void;
    closeAll: () => void;
}

export const useAuthModal = create<AuthModalState>((set) => ({
    signInOpen: false,
    signUpOpen: false,
    openSignIn: () => set({ signInOpen: true, signUpOpen: false }),
    openSignUp: () => set({ signInOpen: false, signUpOpen: true }),
    closeAll: () => set({ signInOpen: false, signUpOpen: false }),
}));
