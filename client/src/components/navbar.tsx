import { useState } from "react";
import NavItem from "./navitem";
import { useNavigate } from "react-router-dom";

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
    <nav className="bg-green-700 text-white p-8 rounded-xl">
        <div className="mx-auto flex justify-between items-between">
        <div className="text-2xl font-extrabold text-black">CyberHex</div>
        <div className="flex space-x-4">
            {items.map((item) => (
                <NavItem
                    key={item.name}
                    itemName={item.name}
                    isSelected={selectedItem === item.name}
                    onClick={() => handleItemClick(item.name)}
                />
            ))}
        </div>
        </div>
    </nav>
    );
};

export default NavBar;