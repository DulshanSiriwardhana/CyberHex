import React, { createContext, useState } from "react";

interface PopupContextType {
    isOpen: boolean;
    openPopup: (content: React.ReactNode) => void;
    closePopup: () => void;
    popupContent?: React.ReactNode;
}

export const PopupContext = createContext<PopupContextType>({
    isOpen: false,
    openPopup: () => {},
    closePopup: () => {},
    popupContent: null
});

export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [popupContent, setPopupContent] = useState<React.ReactNode>(null);

    const openPopup = (content: React.ReactNode) => {
        setPopupContent(content);
        setIsOpen(true);
    };

    const closePopup = () => {
        setIsOpen(false);
        setPopupContent(null);
    };

    return (
        <PopupContext.Provider value={{ isOpen, openPopup, closePopup, popupContent }}>
            {children}
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded shadow">
                        {popupContent}
                        <button onClick={closePopup} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Close</button>
                    </div>
                </div>
            )}
        </PopupContext.Provider>
    );
};