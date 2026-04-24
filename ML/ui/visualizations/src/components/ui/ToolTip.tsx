const ToolTip=({x, y, label}: {x: number, y: number, label: string})=>{
    console.log(label);
    
    return(
        <div className="absolute font-bold text-sm px-4 min-w-28 max-w-32 min-h-14 bg-gray-600 text-white z-50 w-full flex items-center justify-center rounded-sm shadow-md">
            {JSON.stringify({x, y})}
        </div>
    )
}

export default ToolTip;