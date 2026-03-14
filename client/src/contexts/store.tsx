import React, { createContext, useState } from "react";

interface StoreContextType {
    getAll: () => Record<string, any>;
    createState: (key: string, initialValue: any) => void;
    updateState: (key: string, newValue: any) => void;
    deleteState: (key: string) => void;
    state: Record<string, any>;
}

export const StoreContext = createContext<StoreContextType>({
    getAll: () => ({}),
    createState: () => {},
    updateState: () => {},
    deleteState: () => {},
    state: {}
});

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<Record<string, any>>({});

    const getAll = () => {
        return state;
    };

    const createState = (key: string, initialValue: any) => {
        setState(prevState => ({ ...prevState, [key]: initialValue }));
    };

    const updateState = (key: string, newValue: any) => {
        setState(prevState => ({ ...prevState, [key]: newValue }));
    };

    const deleteState = (key: string) => {
        setState(prevState => {
            const newState = { ...prevState };
            delete newState[key];
            return newState;
        });
    };

    return (
        <StoreContext.Provider value={{ getAll, createState, updateState, deleteState, state }}>
            {children}
        </StoreContext.Provider>
    );
};