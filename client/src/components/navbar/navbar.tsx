import { useContext, useState } from "react";
import NavItem from "./navitem";
import { useNavigate } from "react-router-dom";
import AuthButtons from "../authbuttons";
import { PopupContext } from "../../contexts/popups";
import MainPopup from "../mainpopup";
import { items } from "../../const/data";
import Hamburger from "./hamburger";
import NavPopup from "./navpopup";


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
        if(!isOpen) {
            setIsOpen(true);
            openPopup(<MainPopup/>);
        } else {
            setIsOpen(false);
            closePopup();
        }
    };

    const handleSidebarToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
    <nav className="bg-red-700 text-white rounded-xl border-2 px-4 border-black max-w-boundary mx-auto relative">
        <div className="mx-auto flex justify-between items-between">
        <div onClick={handleLogoClick} className="cursor-pointer text-sm md:text-2xl font-extrabold text-white text-center flex items-center justify-center">CyberHex</div>
        <div className="space-x-2 hidden md:flex py-4">
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
        <Hamburger onClick={handleSidebarToggle} isOpen={isOpen}/>
        {
            isOpen && <NavPopup/>
        }
        </div>
    </nav>
    );
};

export default NavBar;