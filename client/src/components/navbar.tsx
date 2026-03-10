import { useState } from "react";
import NavItem from "./navitem";
import { useNavigate } from "react-router-dom";
import AuthButtons from "./authbuttons";

const items = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Contact", path: "/contact" },
];
const NavBar = () => {
    const navigate = useNavigate();
    const [selectedItem, setSelectedItem] = useState(items[0].name);

    const handleItemClick = (itemName: string) => {
        setSelectedItem(itemName);
        navigate(items.find(item => item.name === itemName)?.path || "/"); 
    };

    return (
    <nav className="bg-red-700 text-white p-4 rounded-xl border-2 border-black max-w-boundary mx-auto">
        <div className="mx-auto flex justify-between items-between">
        <div className="text-2xl font-extrabold text-white text-center flex items-center justify-center">CyberHex</div>
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