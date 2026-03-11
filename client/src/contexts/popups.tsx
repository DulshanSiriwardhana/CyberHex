import React, { createContext, useState } from "react";
import { IoIosClose } from "react-icons/io";

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
                <div className="fixed inset-0 flex items-center justify-center bg-black/10 backdrop-blur-xs z-20">
                    <div className="bg-red-700 p-px rounded-l-md rounded-br-md rounded-tr-2xl shadow relative overflow-hidden">
                        <div className="absolute text-white top-1 right-1 bg-red-600 rounded-full">
                            <IoIosClose onClick={closePopup} className="cursor-pointer" size={20} />
                        </div>
                        {popupContent}
                    </div>
                </div>
            )}
        </PopupContext.Provider>
    );
};