import { createContext, useState } from "react";

interface PopupContextType {
    isOpen: boolean;
    openPopup: () => void;
    closePopup: () => void;
}

export const PopupContext = createContext<PopupContextType>({
    isOpen: false,
    openPopup: () => {},
    closePopup: () => {},
});

export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openPopup = () => setIsOpen(true);
    const closePopup = () => setIsOpen(false);

    return (
        <PopupContext.Provider value={{ isOpen, openPopup, closePopup }}>
            {children}
        </PopupContext.Provider>
    );
};