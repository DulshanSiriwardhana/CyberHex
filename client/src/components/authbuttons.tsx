import { useContext, useState } from "react";
import { PopupContext } from "../contexts/popups";
import AuthPopup from "./authpopup";

const AuthButtons = () => {
    const { openPopup, closePopup } = useContext(PopupContext);
    const [ isOpen, setIsOpen ] = useState(false);

    const handleAuthClick = () => {
        if(!isOpen) {
            setIsOpen(true);
            openPopup(<AuthPopup/>);
        } else {
            setIsOpen(false);
            closePopup();
        }
    };

    return(
        <button onClick={handleAuthClick} className="text-sm border-2 border-white cursor-pointer flex items-center justify-center px-2 rounded-lg font-extrabold text-white hover:bg-white hover:text-black">Signin</button>
    )
}

export default AuthButtons;