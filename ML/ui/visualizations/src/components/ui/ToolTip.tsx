const ToolTip=({x, y, label}: {x: number, y: number, label: string})=>{
    console.log(label);
    
    return(
        <div className="absolute font-bold text-sm px-4 min-h-10 bg-black text-white z-50 flex items-center justify-center rounded-sm shadow-md overflow-hidden border-2 border-red-600">
            ({x},<span></span> {y})
        </div>
    )
}

export default ToolTip;