const NavItem=({isSelected, onClick, itemName}:{isSelected:boolean, onClick:()=>void, itemName:string})=>{
    return (
        <div onClick={onClick} className={`px-4 py-2 cursor-pointer rounded-md font-extrabold text-sm ${isSelected ? 'bg-white text-black' : 'hover:text-white hover:bg-black'}`}>
            {itemName}
        </div>
    )
}

export default NavItem;