const NavItem=({isSelected, onClick, itemName}:{isSelected:boolean, onClick:()=>void, itemName:string})=>{
    return (
        <div onClick={onClick} className={`px-4 py-2 cursor-pointer ${isSelected ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}>
            {itemName}
        </div>
    )
}

export default NavItem;