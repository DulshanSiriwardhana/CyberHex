import { useContext, useState } from "react";
import NavItem from "./navitem";
import { useNavigate } from "react-router-dom";
import AuthButtons from "./authbuttons";
import { PopupContext } from "../contexts/popups";
import MainPopup from "./mainpopup";

const items = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Contact", path: "/contact" },
];
const NavBar = () => {
    const navigate = useNavigate();
    const [selectedItem, setSelectedItem] = useState(items[0].name);
    const { openPopup, closePopup } = useContext(PopupContext);
    const [ isOpen, setIsOpen ] = useState(false);

    const handleItemClick = (itemName: string) => {
        setSelectedItem(itemName);
        navigate(items.find(item => item.name === itemName)?.path || "/"); 
    };

    const handleLogoClick = () => {
        setIsOpen(!isOpen);
        if(!isOpen) {
            openPopup(<MainPopup/>);
        } else {
            closePopup();
        }
    };

    return (
    <nav className="bg-red-700 text-white p-4 rounded-xl border-2 border-black max-w-boundary mx-auto">
        <div className="mx-auto flex justify-between items-between">
        <div onClick={handleLogoClick} className="cursor-pointer text-2xl font-extrabold text-white text-center flex items-center justify-center">CyberHex</div>
        <div className="flex space-x-2">
            {items.map((item) => (
                <NavItem
                    key={item.name}
                    itemName={item.name}
                    isSelected={selectedItem === item.name}
                    onClick={() => handleItemClick(item.name)}
                />
            ))}
            <AuthButtons/>
        </div>
        </div>
    </nav>
    );
};

export default NavBar;